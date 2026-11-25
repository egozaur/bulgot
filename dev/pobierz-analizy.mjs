// Bulgot: pobiera partie wysłane przez graczy przyciskiem „Zgłoś błąd” (dawniej „Wyślij do analizy”) do folderu C:\Users\Kurczak\pl3y\analizy-bulgot.
// Wymaga sekretu BG_ADMIN_KEY (ten sam, który jest ustawiony w Workerze: `wrangler secret put BG_ADMIN_KEY`).
// Użycie: BG_ADMIN_KEY=... node dev/pobierz-analizy.mjs [--usun] [--api https://pl3y-server.pl3y.workers.dev] [--out <folder>]
//   --usun  po zapisaniu plików kasuje te partie z serwera (domyślnie zostają).
import fs from 'node:fs';
import path from 'node:path';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
const API = String(arg('--api', 'https://pl3y-server.pl3y.workers.dev')).replace(/\/$/, '');
const OUT = String(arg('--out', 'C:/Users/Kurczak/pl3y/analizy-bulgot'));
const KEY = process.env.BG_ADMIN_KEY;
if (!KEY) { console.error('Brak zmiennej BG_ADMIN_KEY.'); process.exit(1); }
const res = await fetch(API + '/api/bg/analysis', { headers: { 'X-Admin-Key': KEY } });
if (!res.ok) { console.error('Serwer odpowiedział ' + res.status + ': ' + (await res.text())); process.exit(1); }
const { list } = await res.json();
fs.mkdirSync(OUT, { recursive: true });
let nowe = 0;
for (const e of list) {
  const d = new Date(e.sentAt || e.ended || Date.now()).toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const file = path.join(OUT, `${d}_${String(e.nick || e.n).replace(/[^\p{L}\p{N}_-]+/gu, '')}_${e.mode}_${e.outcome || 'run'}_${e.id}.json`);
  if (!fs.existsSync(file)) { fs.writeFileSync(file, JSON.stringify(e, null, 1)); nowe++; }
}
console.log(`Partii na serwerze: ${list.length}, nowych zapisanych: ${nowe}, folder: ${OUT}`);
if (arg('--usun', false) && list.length) {
  const r = await fetch(API + '/api/bg/analysis-del', { method: 'POST', headers: { 'X-Admin-Key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: list.map(e => e.id) }) });
  console.log('Usunięto z serwera:', (await r.json()).deleted);
}
