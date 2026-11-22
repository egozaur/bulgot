// Bulgot: dźwięk syntezowany w WebAudio (zero plików). Efekty (sfx) włączone domyślnie, muzyka domyślnie wyłączona.
// Wyciszenie lobby (localStorage.pl3y_mute === '1') wycisza także efekty tej gry.
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
export const settings = {
  sfx: store.get('bulgot:sfx') !== '0',
  music: store.get('bulgot:music') === '1',
};
const lobbyMuted = () => store.get('pl3y_mute') === '1';

let ctx = null, master = null, musicBus = null;
function ac() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.35; musicBus.connect(master);
    } catch (e) { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
export function unlock() { ac(); if (settings.music) startMusic(); }

function tone(freq, dur, { type = 'sine', vol = 0.2, slide = 0, delay = 0, bus = null } = {}) {
  const c = ac(); if (!c) return;
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus || master); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, { vol = 0.2, freq = 1800, q = 0.8, delay = 0, type = 'bandpass', slide = 0, bus = null } = {}) {
  const c = ac(); if (!c) return;
  const t = c.currentTime + delay, n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = buf;
  const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (slide) f.frequency.exponentialRampToValueAtTime(Math.max(60, freq + slide), t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(bus || master); s.start(t);
}

const SFX = {
  click: () => tone(520, 0.06, { type: 'triangle', vol: 0.12 }),
  hover: () => tone(740, 0.03, { type: 'sine', vol: 0.04 }),
  pick: () => { tone(440, 0.09, { type: 'triangle', vol: 0.18 }); tone(660, 0.1, { type: 'triangle', vol: 0.18, delay: 0.07 }); tone(880, 0.16, { type: 'triangle', vol: 0.16, delay: 0.14 }); },
  reroll: () => bubble(5),
  coin: () => { tone(988, 0.07, { type: 'square', vol: 0.1 }); tone(1319, 0.18, { type: 'square', vol: 0.1, delay: 0.06 }); },
  hit: () => { noise(0.09, { vol: 0.22, freq: 900, slide: -500 }); tone(180, 0.09, { type: 'square', vol: 0.12, slide: -90 }); },
  crit: () => { noise(0.12, { vol: 0.3, freq: 1400, slide: -700 }); tone(220, 0.16, { type: 'sawtooth', vol: 0.16, slide: -120 }); tone(1180, 0.18, { type: 'triangle', vol: 0.12, delay: 0.04 }); },
  hurt: () => { noise(0.14, { vol: 0.26, freq: 500, slide: -300, type: 'lowpass' }); tone(110, 0.16, { type: 'sawtooth', vol: 0.14, slide: -50 }); },
  miss: () => noise(0.12, { vol: 0.1, freq: 2600, slide: 1400, type: 'highpass' }),
  skill: () => { tone(330, 0.12, { type: 'sawtooth', vol: 0.14, slide: 330 }); tone(990, 0.18, { type: 'triangle', vol: 0.12, delay: 0.1 }); },
  stun: () => { tone(300, 0.3, { type: 'square', vol: 0.1, slide: 200 }); },
  heal: () => { tone(523, 0.1, { type: 'sine', vol: 0.16 }); tone(659, 0.1, { type: 'sine', vol: 0.16, delay: 0.09 }); tone(784, 0.2, { type: 'sine', vol: 0.16, delay: 0.18 }); },
  telegraph: () => { tone(240, 0.14, { type: 'square', vol: 0.1 }); tone(240, 0.14, { type: 'square', vol: 0.1, delay: 0.2 }); },
  boss: () => { tone(98, 0.7, { type: 'sawtooth', vol: 0.22, slide: -30 }); tone(147, 0.7, { type: 'sawtooth', vol: 0.16, slide: -40, delay: 0.05 }); noise(0.6, { vol: 0.14, freq: 300, type: 'lowpass' }); },
  phase: () => { tone(196, 0.4, { type: 'sawtooth', vol: 0.2, slide: 90 }); noise(0.3, { vol: 0.16, freq: 600, slide: 1200 }); },
  fury: () => { for (let i = 0; i < 4; i++) tone(180 + i * 30, 0.12, { type: 'square', vol: 0.12, delay: i * 0.1 }); },
  win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.2, delay: i * 0.11 })); },
  lose: () => { [392, 330, 262, 196, 147].forEach((f, i) => tone(f, 0.3, { type: 'sawtooth', vol: 0.15, delay: i * 0.18, slide: -20 })); bubble(8, 0.5); },
  tink: () => { tone(1760, 0.07, { type: 'triangle', vol: 0.1 }); tone(2349, 0.12, { type: 'triangle', vol: 0.07, delay: 0.05 }); },
  unlock: () => { [659, 880, 1175, 1568].forEach((f, i) => tone(f, 0.18, { type: 'square', vol: 0.1, delay: i * 0.08 })); },
  bulgot: () => bubble(10),
  egg: () => { tone(900, 0.06, { type: 'square', vol: 0.1 }); noise(0.2, { vol: 0.18, freq: 500, slide: -300 }); },
};
function bubble(n = 6, delay0 = 0) {
  for (let i = 0; i < n; i++) {
    const f = 180 + Math.random() * 420, d = delay0 + i * (0.05 + Math.random() * 0.07);
    tone(f, 0.1, { type: 'sine', vol: 0.11, slide: f * 0.9, delay: d });
  }
}
export function sfx(name) {
  if (!settings.sfx || lobbyMuted()) return;
  try { (SFX[name] || (() => {}))(); } catch (e) {}
}
export function setSfx(on) { settings.sfx = on; store.set('bulgot:sfx', on ? '1' : '0'); if (on) sfx('click'); }

// ---------- muzyka: prosta pętla w molowej pentatonice z bulgotem ----------
let musicTimer = null, step = 0, nextTime = 0;
const SCALE = [0, 3, 5, 7, 10];
const hz = (semi) => 110 * Math.pow(2, semi / 12);
const BASS = [0, 0, 3, 5, 0, 0, 7, 5];
function schedule() {
  const c = ac(); if (!c || !settings.music || lobbyMuted()) return;
  const beat = 60 / 104;
  if (nextTime < c.currentTime) nextTime = c.currentTime + 0.05;
  while (nextTime < c.currentTime + 0.4) {
    const bar = Math.floor(step / 8), s = step % 8, t = nextTime - c.currentTime;
    tone(hz(BASS[s] - 12), beat * 0.9, { type: 'triangle', vol: 0.5, delay: t, bus: musicBus });
    if (s % 2 === 0) {
      const lead = SCALE[(s / 2 + bar * 2 + (bar % 3)) % 5] + (s === 6 ? 12 : 0);
      tone(hz(lead + 12), beat * 0.55, { type: 'square', vol: 0.12, delay: t + beat * 0.5, bus: musicBus });
    }
    if (s === 3 || s === 7) noise(0.12, { vol: 0.08, freq: 400 + Math.random() * 500, q: 3, delay: t + beat * 0.25, bus: musicBus });
    noise(0.04, { vol: 0.06, freq: 6000, type: 'highpass', delay: t, bus: musicBus });
    step++; nextTime += beat / 2;
  }
}
export function startMusic() { if (musicTimer || !settings.music) return; if (!ac()) return; nextTime = 0; musicTimer = setInterval(schedule, 120); schedule(); }
export function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }
export function setMusic(on) { settings.music = on; store.set('bulgot:music', on ? '1' : '0'); on ? startMusic() : stopMusic(); }
