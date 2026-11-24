// Bulgot: uruchamia testy właściwe dla obszaru zmiany (serwer, e2e w Edge) jednym poleceniem.
// Sam startuje serwer plików (port 8090, jeśli nie działa), odpala testy po kolei, wypisuje zwięzłe podsumowanie i sprząta.
// Użycie: node dev/test-area.mjs <obszar>[,<obszar>...] [--keep]     |     node dev/test-area.mjs --list
// Zrzuty ekranu trafiają do katalogu tymczasowego (poza repo). Wymaga Edge i puppeteer-core z C:\Users\Kurczak\tools\pt.
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '..');
const ROOT = path.resolve(REPO, '..');                       // C:\Users\Kurczak\pl3y
const SERVE = 'C:/Users/Kurczak/tools/scripts/serve.mjs';
const PORT = 8090;

// Obszar → testy (zgodnie z tabelą w .claude/context/development-workflow.md). 'srv' = testy serwera Bulgota (ok. 3 s).
const AREAS = {
  silnik: ['srv', 'smoke'],
  serwer: ['srv'],
  uklad: ['e2e-uklad', 'e2e-panel', 'e2e-schody'],
  panel: ['e2e-panel', 'e2e-uklad'],
  schody: ['e2e-schody'],
  walka: ['e2e-walka', 'e2e-efekty'],
  start: ['e2e-start', 'e2e-postacie', 'e2e-ukryte'],
  postacie: ['e2e-postacie', 'e2e-ukryte'],
  faktura: ['e2e-faktura'],
  koniec: ['e2e-analiza'],
  podpowiedzi: ['e2e-podpowiedzi'],
  staz: ['e2e-staz'],
  kasyno: ['e2e-kasyno'],
  pojedynek: ['e2e-pojedynek'],
  ksiega: ['e2e-ksiega'],
  kafelki: ['e2e-poziomy', 'e2e-ikony'],
  nowosci: ['e2e-nowosci', 'e2e-extra'],
  jeszcze: ['e2e-jeszcze'],
  smoke: ['smoke'],
  wszystko: ['srv', 'smoke', 'e2e-ui', 'e2e-sciezki', 'e2e-odpoczynek', 'e2e-rozbudowa', 'e2e-strzalki', 'e2e-jeszcze', 'e2e-uklad', 'e2e-ukryte', 'e2e-efekty', 'e2e-podpowiedzi', 'e2e-analiza', 'e2e-schody', 'e2e-panel', 'e2e-faktura', 'e2e-start', 'e2e-staz', 'e2e-kasyno', 'e2e-pojedynek', 'e2e-ksiega', 'e2e-poziomy', 'e2e-ikony', 'e2e-postacie', 'e2e-nowosci', 'e2e-extra', 'e2e-walka'],
};

if (process.argv.includes('--list') || process.argv.length < 3) {
  console.log('Obszary:\n' + Object.entries(AREAS).map(([k, v]) => `  ${k.padEnd(12)} ${v.join(', ')}`).join('\n'));
  process.exit(process.argv.includes('--list') ? 0 : 2);
}

const wanted = process.argv[2].split(',').flatMap(a => { if (!AREAS[a]) { console.error('Nieznany obszar: ' + a + ' (node dev/test-area.mjs --list)'); process.exit(2); } return AREAS[a]; });
const tests = [...new Set(wanted)];

const portOpen = () => new Promise(res => { const s = net.connect(PORT, '127.0.0.1'); s.once('connect', () => { s.destroy(); res(true); }); s.once('error', () => res(false)); });
let server = null;
if (tests.some(t => t !== 'srv') && !(await portOpen())) {
  server = spawn(process.execPath, [SERVE, ROOT, String(PORT)], { env: { ...process.env, LOBBY: path.join(ROOT, 'egozaur.github.io') }, stdio: 'ignore' });
  for (let i = 0; i < 30 && !(await portOpen()); i++) await new Promise(r => setTimeout(r, 200));
  if (!(await portOpen())) { console.error('Serwer plików nie wystartował'); server.kill(); process.exit(2); }
}
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bulgot-e2e-'));

let failed = 0;
for (const t of tests) {
  const t0 = Date.now();
  let r;
  if (t === 'srv') r = spawnSync(process.execPath, ['--test', '--test-name-pattern=bulgot', 'test/all.test.js'], { cwd: path.join(ROOT, 'pl3y-server'), encoding: 'utf8', maxBuffer: 64 << 20 });
  else r = spawnSync(process.execPath, [path.join(here, t + '.mjs'), t === 'smoke' ? 'quick' : outDir], { cwd: 'C:/Users/Kurczak/tools/pt', encoding: 'utf8', timeout: 600000, maxBuffer: 64 << 20 });
  const out = (r.stdout || '') + (r.stderr || '');
  const lines = out.split('\n');
  const fails = lines.filter(l => /^(FAIL|✖|not ok)|PAGEERR|CONSOLE|Error:/.test(l.trim()) || /^\s*✖/.test(l));
  const oks = lines.filter(l => /^OK\b|^✔/.test(l.trim())).length;
  const bad = r.status !== 0 || fails.length > 0;
  if (bad) failed++;
  console.log(`${bad ? 'FAIL' : 'ok  '} ${t.padEnd(16)} ${((Date.now() - t0) / 1000).toFixed(1)} s  (${oks} OK)${r.error ? '  ' + r.error.message : ''}`);
  for (const l of fails.slice(0, 8)) console.log('       ' + l.trim().slice(0, 200));
}
if (server && !process.argv.includes('--keep')) server.kill();
console.log(failed ? `\nNIEZALICZONE: ${failed} z ${tests.length}. Zrzuty: ${outDir}` : `\nWszystko zielone (${tests.length}). Zrzuty: ${outDir}`);
process.exit(failed ? 1 : 0);
