// Bulgot: rozmowa z serwerem. Na pl3y.pl idą zwykłe żądania HTTP do /api/bg/* (z tokenem sesji i tokenem gracza).
// Tryb lokalny (?local=1 albo brak /auth.js, np. testy na localhost) uruchamia TEN SAM kod serwera (BgPlayer, BgRanks)
// bezpośrednio w przeglądarce, z zapisem w localStorage. Dzięki temu da się grać i testować bez internetu.
const P3 = () => (window.PL3Y && window.PL3Y.player ? window.PL3Y : null);
export const LOCAL = new URLSearchParams(location.search).has('local') || !P3();

// ---------- tryb lokalny ----------
const LS = 'bulgot:local:';
function lsStorage(name) {
  const key = k => LS + name + ':' + k;
  const rd = k => { try { const v = localStorage.getItem(key(k)); return v == null ? undefined : JSON.parse(v); } catch (e) { return undefined; } };
  return {
    get: async k => rd(k),
    put: async (k, v) => { try { if (typeof k === 'object') for (const [a, b] of Object.entries(k)) localStorage.setItem(key(a), JSON.stringify(b)); else localStorage.setItem(key(k), JSON.stringify(v)); } catch (e) {} },
    list: async ({ prefix = '' } = {}) => {
      const out = new Map(), pre = LS + name + ':';
      for (let i = 0; i < localStorage.length; i++) { const kk = localStorage.key(i); if (kk && kk.startsWith(pre + prefix)) out.set(kk.slice(pre.length), JSON.parse(localStorage.getItem(kk))); }
      return out;
    },
    delete: async ks => { for (const k of [].concat(ks)) localStorage.removeItem(key(k)); },
  };
}
let localReady = null;
function localInit() {
  if (!localReady) localReady = (async () => {
    const [{ BgPlayer }, { BgRanks }] = await Promise.all([import('../pl3y-server/src/games/bulgot/player.js'), import('../pl3y-server/src/games/bulgot/ranks.js')]);
    const ranks = new BgRanks({ storage: lsStorage('ranks') }, {});
    const env = { BG_RANKS: { idFromName: n => n, get: () => ({ fetch: (u, i) => ranks.fetch(u instanceof Request ? u : new Request(u, i)) }) } };
    return { player: new BgPlayer({ storage: lsStorage('player') }, env), ranks };
  })();
  return localReady;
}
const LOCAL_PLAYER = { n: 'lokalny', nick: 'Lokalny', avatar: 1, pt: 'local' };

// ---------- publiczne API ----------
// Zwraca gracza (z tokenem) albo null, gdy gracz pominął ekran nicka.
export async function getPlayer() {
  if (LOCAL) return LOCAL_PLAYER;
  return P3().player.ask();
}
export const playerNow = () => (LOCAL ? LOCAL_PLAYER : (P3() && P3().player.get()));
export const avatarUrl = i => (P3() ? P3().avatarUrl(i) : '');

// Wszystkie akcje gry: call('start', {...}) → { status, j }.
export async function call(path, body = {}) {
  if (LOCAL) {
    const { player } = await localInit();
    const res = await player.fetch(new Request('https://bg/' + path, { method: 'POST', body: JSON.stringify({ pl: LOCAL_PLAYER, ...body }) }));
    return { status: res.status, j: await res.json() };
  }
  const A = P3(), pl = A.player.get();
  if (!pl) return { status: 401, j: { err: 'Zaloguj się nickiem, żeby grać.', code: 'player' } };
  return http(A, 'POST', '/api/bg/' + path, { pt: pl.pt, ...body });
}

export async function ranks(mode, query = '') {
  if (LOCAL) {
    const { ranks: r } = await localInit();
    const res = await r.fetch(new Request('https://bg/list?mode=' + mode + (query ? '&' + query : '')));
    return { status: res.status, j: await res.json() };
  }
  return http(P3(), 'GET', '/api/bg/ranks?mode=' + encodeURIComponent(mode) + (query ? '&' + query : ''));
}

// Ranking Dyżuru dnia (jedna lista na datę RRRR-MM-DD).
export async function dailyRanks(date) {
  if (LOCAL) {
    const { ranks: r } = await localInit();
    const res = await r.fetch(new Request('https://bg/daily-list?date=' + date));
    return { status: res.status, j: await res.json() };
  }
  return http(P3(), 'GET', '/api/bg/daily?date=' + encodeURIComponent(date));
}

async function http(A, method, path, body) {
  const tok = A.token();
  let r;
  try {
    r = await fetch(A.api + path, { method, body: body ? JSON.stringify(body) : undefined,
      headers: Object.assign(body ? { 'Content-Type': 'application/json' } : {}, tok ? { Authorization: 'Bearer ' + tok } : {}) });
  } catch (e) { return { status: 0, j: { err: 'Brak połączenia z serwerem. Sprawdź internet i spróbuj jeszcze raz.', code: 'net' } }; }
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (r.status === 401 && j.code === 'auth') A.expired();
  if (r.status === 401 && j.code === 'player') A.player.expired();
  return { status: r.status, j };
}
