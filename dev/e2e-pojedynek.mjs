// Bulgot: pojedynek dla 2 osób (lobby, głosowanie, losowanie postaci, odliczanie, termin 60 s, wynik i okno z obietnicą).
// W trybie lokalnym jest jeden gracz, więc rywala gra test: wywołuje BgRanks bezpośrednio (api.js devRanks). Terminy skracamy w DUEL (ten sam moduł co w grze).
// Użycie: cd C:\Users\Kurczak\tools\pt && node C:\Users\Kurczak\pl3y\bulgot\dev\e2e-pojedynek.mjs [katalog na zrzuty]   (serwer plików na :8090)
import puppeteer from 'file:///C:/Users/Kurczak/tools/pt/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = process.argv[2] || '.';
const wait = ms => new Promise(r => setTimeout(r, ms));
const ok = (c, m) => { console.log((c ? 'OK: ' : 'BŁĄD: ') + m); if (!c) process.exitCode = 1; };
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-first-run'] });
const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:8090/bulgot/?local=1', { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'networkidle0' }); await wait(500);
// Skrócone terminy (ten sam moduł duel.js, który ładuje gra) i rywal wołający BgRanks.
await p.evaluate(async () => {
  const { DUEL } = await import('/pl3y-server/src/games/bulgot/duel.js'); Object.assign(DUEL, { decideMs: 5000, startMs: 4000, countdownMs: 7000 });
  const { devRanks } = await import('/bulgot/api.js'); const R = await devRanks();
  window.__rival = (op, extra = {}) => R.fetch(new Request('https://bg/duel-op', { method: 'POST', body: JSON.stringify({ op, pl: { n: 'rywal', nick: 'Rywal', avatar: 1 }, ...extra }) })).then(r => r.json());
});
const waitFor = async (fn, ms = 12000, arg) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn, arg)) return true; await wait(150); } return false; };

// 1. Ekran startowy ma przycisk, okno pojedynku: tworzenie i dołączanie
ok(!!(await p.$('[data-act=duel]')), 'ekran startowy ma przycisk „Pojedynek”');
await p.click('[data-act=duel]'); await wait(400);
ok(!!(await p.$('[data-act=duelcreate]')) && !!(await p.$('#duelcode')) && !!(await p.$('[data-act=dueljoin]')), 'okno: „Stwórz pojedynek” i pole kodu z „Dołącz”');
await p.click('[data-act=dueljoin]'); await wait(250);
ok(!!(await p.$('.toast.err')), 'puste pole kodu: komunikat');
await p.type('#duelcode', 'zzzzz'); await p.click('[data-act=dueljoin]'); await wait(400);
ok((await p.$eval('#toasts', e => e.textContent)).includes('Nie ma takiego pojedynku'), 'nieistniejący kod: komunikat');
await p.click('[data-act=duelcreate]'); await wait(500);
const code = await p.$eval('#duelcodebig', e => e.textContent.trim());
ok(/^[A-HJ-NP-Z2-9]{5}$/.test(code), 'lobby pokazuje 5-znakowy kod (' + code + ')');
await p.screenshot({ path: OUT + '/pojedynek-lobby.png' });
// Odświeżenie strony w lobby: mecz wraca na ekran (DUEL i rywal trzeba podpiąć od nowa po przeładowaniu modułów)
await p.reload({ waitUntil: 'networkidle0' });
ok(await waitFor(() => { const e = document.querySelector('#duelcodebig'); return !!e; }, 5000), 'po odświeżeniu strony lobby wraca na ekran');
ok((await p.$eval('#duelcodebig', e => e.textContent.trim())) === code, 'ten sam kod po odświeżeniu');
await p.evaluate(async () => {
  const { DUEL } = await import('/pl3y-server/src/games/bulgot/duel.js'); Object.assign(DUEL, { decideMs: 5000, startMs: 4000, countdownMs: 7000 });
  const { devRanks } = await import('/bulgot/api.js'); const R = await devRanks();
  window.__rival = (op, extra = {}) => R.fetch(new Request('https://bg/duel-op', { method: 'POST', body: JSON.stringify({ op, pl: { n: 'rywal', nick: 'Rywal', avatar: 1 }, ...extra }) })).then(r => r.json());
});

// 2. Rywal dołącza: głosowanie
const j1 = await p.evaluate(c => window.__rival('join', { code: c }), code); ok(j1.duel && j1.duel.state === 'vote', 'rywal dołączył, stan: głosowanie');
ok(await waitFor(() => !!document.querySelector('.duel-grid')), 'okno przechodzi samo w głosowanie (odpytywanie)');
const nChars = await p.$$eval('[data-act=duelchar]', e => e.length), nBurn = await p.$$eval('[data-act=duelgarnek]', e => e.length);
ok(nChars === 12 && nBurn === 6, `12 postaci i 6 palników do wyboru (${nChars}/${nBurn})`);
ok(/\d:\d\d/.test(await p.$eval('#dutimer', e => e.textContent)), 'widoczny zegar głosowania');
await p.click('[data-act=duelchar][data-v=ges]'); await wait(150); await p.click('[data-act=duelgarnek][data-v="2"]'); await wait(150);
ok((await p.$eval('[data-act=duelchar][data-v=ges]', e => e.classList.contains('sel'))), 'wybrana postać jest zaznaczona');
await p.screenshot({ path: OUT + '/pojedynek-glosowanie.png' });
await p.click('[data-act=duelvote]'); await wait(500);
ok((await p.$eval('.duel-state', e => e.textContent)).includes('jeszcze wybiera'), 'po moim głosie: rywal jeszcze wybiera');
await p.evaluate(() => window.__rival('vote', { vote: { char: 'pyrtek', garnek: 4 } }));   // niezgoda w postaci i palniku

// 3. Losowanie: palnik 5 i jedna z trzech najsłabszych
ok(await waitFor(() => !!document.querySelector('.duel-reveal')), 'pokazuje się ekran losowania i odliczania');
ok(await waitFor(() => { const e = document.querySelector('#duelchar'); return e && e.classList.contains('landed'); }, 9000), 'losowanie postaci kończy się wynikiem');
const rev = await p.evaluate(() => ({ char: document.querySelector('#duelchar').textContent, note: !document.querySelector('#duelnote').hidden, text: document.querySelector('.duel-reveal').textContent }));
ok(rev.note && rev.text.includes('padlina'), 'komunikat „została tylko padlina” po losowaniu');
ok(/5 ·/.test(rev.text) && rev.text.includes('najgorętszy'), 'brak zgody: palnik 5');
await p.screenshot({ path: OUT + '/pojedynek-losowanie.png' });

// 4. Start: ekran runu z paskiem terminu
ok(await waitFor(() => !!document.querySelector('.run') && !!document.querySelector('#dutop'), 14000), 'po odliczaniu startuje run z paskiem terminu');
ok((await p.evaluate(() => window.__rival('start'))).ok, 'rywal też wchodzi do runu');
const st = await p.evaluate(() => ({ char: window.__bulgot.run.char, g: window.__bulgot.run.garnek, mode: window.__bulgot.run.mode, hud: document.querySelector('#dutop').textContent }));
ok(['zjarany', 'sanepid', 'pacyfista'].includes(st.char) && st.g === 5 && st.mode === 'quick', `run: ${st.char}, palnik ${st.g}, tryb ${st.mode}`);
ok(/\d:\d\d/.test(st.hud) && st.hud.includes('Rywal'), 'pasek pokazuje czas i postęp rywala (' + st.hud.trim() + ')');
await p.screenshot({ path: OUT + '/pojedynek-run.png' });

// 5. Termin: po czasie serwer sam wybiera, a walka startuje sama
ok(await waitFor(() => !!document.querySelector('#fightlayer'), 20000), 'po upływie czasu walka rusza sama (bez klikania)');
await p.screenshot({ path: OUT + '/pojedynek-walka.png' });
ok(await p.evaluate(() => window.__bulgot.run.round === 1 && window.__bulgot.run.phase === 'fight'), 'serwer sam wybrał kafelek i przeszedł do walki');

// 6. Koniec: poddaję bieg, rywal też; wynik i okno z obietnicą
await p.evaluate(() => document.querySelector('[data-act=menu]').click()); await wait(300);
await p.evaluate(() => { const a = document.querySelector('[data-act=abandon]'); if (a) a.click(); }); await wait(300);
await p.evaluate(() => { const a = document.querySelector('[data-act=abandon-yes]'); if (a) a.click(); });
ok(await waitFor(() => document.querySelector('.duel-wait') && document.body.textContent.includes('Twój bieg zakończony'), 6000), 'po moim końcu: czekam na rywala');
await p.evaluate(() => window.__rival('report', { prog: { done: 0, dealt: 0, round: 1, hp: 0, over: true, ended: 'lose' } }));
ok(await waitFor(() => !!document.querySelector('.duel-end'), 8000), 'po rywalu pojawia się wynik meczu na pełnym ekranie');
const fin = await p.evaluate(() => ({ t: document.querySelector('.duel-end').textContent, full: document.querySelector('#overlay').classList.contains('full') }));
ok(fin.t.includes('Kurczak obiecał podwyżki') && fin.t.includes('Nagrody za wygranie zostaną wypłacone w Ziarnach na podsumowaniu rocznym firmy'), 'okno z obietnicą podwyżek');
ok(fin.full && /Wygrana|Porażka|Remis/.test(fin.t), 'okno na pełnym ekranie z wynikiem');
await p.screenshot({ path: OUT + '/pojedynek-wynik.png' });
await p.click('[data-act=duelleave]'); await wait(600);
ok(!!(await p.$('[data-act=new]')) && !(await p.$('#duelhud')), 'powrót do menu, pasek terminu znika');
ok(!(await p.$eval('[data-act=duel]', e => e.classList.contains('on'))), 'przycisk „Pojedynek” nie świeci po zakończeniu');
ok(errs.length === 0, 'brak błędów w konsoli' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await b.close();
