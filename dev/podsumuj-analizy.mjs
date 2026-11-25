// Bulgot: zwięzłe streszczenie partii wysłanych przez graczy („Zgłoś błąd”, dawniej „Wyślij do analizy”), pobranych do ../analizy-bulgot/*.json
// (pobieranie: dev/pobierz-analizy.mjs). Zamiast czytać surowe JSON-y (po 20+ KB każdy), pokazuje tabelę, agregaty i komentarze graczy.
// Użycie: node dev/podsumuj-analizy.mjs [--dir <folder>] [--since YYYY-MM-DD] [--nick <nick>] [--char <id>] [--notes] [--id <id partii>]
//   --notes  tylko partie z komentarzem lub znacznikami gracza
//   --id     szczegółowy dziennik rund jednej partii (jedna linia na rundę)
import fs from 'node:fs';
import path from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const DIR = arg('dir', 'C:/Users/Kurczak/pl3y/analizy-bulgot');
const SINCE = arg('since', ''), NICK = arg('nick', ''), CHAR = arg('char', ''), ID = arg('id', '');
const NOTES = process.argv.includes('--notes');

if (!fs.existsSync(DIR)) { console.error('Brak folderu ' + DIR + ' (najpierw dev/pobierz-analizy.mjs)'); process.exit(1); }
let runs = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort().map(f => ({ f, ...JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) }));
const dateOf = r => r.f.slice(0, 10);
runs = runs.filter(r => (!SINCE || dateOf(r) >= SINCE) && (!NICK || String(r.nick || r.n).toLowerCase() === NICK.toLowerCase()) && (!CHAR || r.char === CHAR) && (!NOTES || r.note || (r.tags && r.tags.length)));

const foes = e => (e.enemies || []).map(x => x.n).join(' + ');
if (ID) {
  const r = runs.find(x => String(x.id) === ID);
  if (!r) { console.error('Nie ma partii ' + ID); process.exit(1); }
  console.log(`${r.nick} ${r.mode} ${r.char} palnik ${r.garnek} → ${r.outcome}, rundy ${r.floorsDone}/${r.endedOnRound}, wynik ${r.score}, RUN_V ${r.v}${r.note ? '\nKomentarz: ' + r.note : ''}${r.tags && r.tags.length ? '\nZnaczniki: ' + r.tags.join(', ') : ''}`);
  for (const e of r.log || []) console.log(`r${String(e.r).padStart(2)} ${e.win ? 'W' : 'P'} hp ${e.hpBefore}→${e.hpAfter} ziarna ${e.coinsBefore}→${e.coinsAfter} wybór ${e.picked || '-'}${e.bought && e.bought.length ? ' +kup ' + e.bought.length : ''}${e.rested ? ' odp' : ''}${e.event ? ' [' + (e.event.kind || e.event) + ']' : ''} | ${e.boss ? '[BOSS] ' : e.elite ? '[elita] ' : ''}${foes(e)}`);
  process.exit(0);
}

console.log(`Partii: ${runs.length}${SINCE ? ' od ' + SINCE : ''}${NICK ? ', gracz ' + NICK : ''}${CHAR ? ', postać ' + CHAR : ''}\n`);
console.log('data       gracz        tryb  postać       palnik wynik  rundy   punkty  rerolle kupna  RUN_V');
for (const r of runs) console.log(`${dateOf(r)} ${String(r.nick || r.n).slice(0, 12).padEnd(12)} ${String(r.mode).padEnd(5)} ${String(r.char).slice(0, 12).padEnd(12)} ${String(r.garnek).padStart(4)}   ${String(r.outcome).padEnd(5)} ${String(r.endedOnRound).padStart(3)}/${String(r.floorsDone).padEnd(3)} ${String(r.score).padStart(7)} ${String(r.rerolls).padStart(6)} ${String(r.buys).padStart(5)}  ${r.v}`);

// agregaty: postać × palnik
const agg = {};
for (const r of runs) { const k = `${r.mode}|${r.char}|${r.garnek}`; const a = (agg[k] = agg[k] || { n: 0, w: 0, sum: 0 }); a.n++; if (r.outcome === 'win') a.w++; a.sum += r.endedOnRound || 0; }
console.log('\nTryb | postać | palnik: partii, wygrane, średnia runda końca');
for (const [k, a] of Object.entries(agg).sort((x, y) => y[1].n - x[1].n)) console.log(`  ${k.padEnd(28)} ${String(a.n).padStart(3)}  ${Math.round(a.w / a.n * 100)}%  ${(a.sum / a.n).toFixed(1)}`);

// kto zabija
const kill = {};
for (const r of runs) if (r.outcome !== 'win' && r.log && r.log.length) { const e = r.log[r.log.length - 1]; const k = (e.boss ? '[BOSS] ' : e.elite ? '[elita] ' : '') + foes(e); kill[k] = (kill[k] || 0) + 1; }
const kills = Object.entries(kill).sort((a, b) => b[1] - a[1]).slice(0, 8);
if (kills.length) console.log('\nNajczęstsi zabójcy:\n' + kills.map(([k, n]) => `  ${n}× ${k}`).join('\n'));

// komentarze graczy
const withNote = runs.filter(r => r.note || (r.tags && r.tags.length));
if (withNote.length) {
  console.log('\nKomentarze graczy:');
  for (const r of withNote) console.log(`  [${r.id}] ${r.nick} ${r.char} ${r.outcome} r${r.endedOnRound}: ${r.tags && r.tags.length ? '(' + r.tags.join(', ') + ') ' : ''}${r.note || ''}`);
}
console.log('\nSzczegóły partii: node dev/podsumuj-analizy.mjs --id <id>');
