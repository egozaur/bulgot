// Bulgot: testy decyzji w stylu EV (jak w pokerze). Dla każdej postaci i palnika puszcza bota z bazową polityką i z wariantami jednej decyzji
// (odpoczynek, dokupowanie, ulepszanie, rerolle, drzwi, dodatkowe rundy, trasy, jednokolorowe buildy) i liczy różnicę wygranych oraz średniego wyniku.
// Wznawialny: pomija konfiguracje, które już są w pliku wyników. Maks. 5 procesów równolegle, niski priorytet (komputer jest też do grania).
// Użycie: node dev/analiza-ev.mjs <plik-wyników.jsonl> [--n 300] [--mode full] [--garnek 4,5] [--chars a,b] [--limit-min 9]
import { spawn } from 'node:child_process';
import { readFileSync, appendFileSync, existsSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2];
if (!out) { console.error('Podaj plik wyników (.jsonl)'); process.exit(1); }
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const N = +arg('n', 300), MODE = arg('mode', 'full'), GARNEKS = arg('garnek', '4,5').split(',').map(Number), LIMIT = +arg('limit-min', 9) * 60000;
const ALLCH = ['pyrtek', 'zjarany', 'barista', 'ges', 'rzeznik', 'gigachad', 'jajeczko', 'emeryt', 'sanepid', 'wanda', 'zwiazkowiec', 'pacyfista'];
const CHARS = arg('chars', ALLCH.join(',')).split(',');
const WORKERS = Math.min(5, Math.max(1, os.cpus().length >> 1));

// Warianty: jedna decyzja naraz. `base` to polityka domyślna bota (odpoczynek poniżej 55% życia, dokup od +5% siły, reroll przy słabej ofercie, ulepszanie gdy rośnie siła).
export const VARIANTS = {
  base: [],
  'odpoczynek: nigdy': ['--norest'], 'odpoczynek: poniżej 80%': ['--restbelow', '80'],
  'dokup: nigdy': ['--nobuy'], 'dokup: wszystko co nie szkodzi': ['--buymin', '1.0'],
  'ulepszanie: wyłączone': ['--noupgrade'], 'reroll: wyłączony': ['--noreroll'],
  'dodatkowe rundy: nigdy': ['--extra', 'never'], 'dodatkowe rundy: zawsze': ['--extra', 'always'], 'dodatkowe rundy: od 85% życia': ['--extrahp', '85'],
  'trasa: Chłodnia': ['--route', 'chlodnia'], 'trasa: Kotłownia': ['--route', 'kotlownia'], 'trasa: Magazyn': ['--route', 'magazyn'], 'trasa: Kanały': ['--route', 'kanaly'], 'trasa: Sortownia': ['--route', 'sortownia'],
  'build: czysty ogień': ['--arch', 'burn'], 'build: czysty mróz': ['--arch', 'frost'], 'build: czysta Salmonella': ['--arch', 'poison'], 'build: czysta krew': ['--arch', 'bleed'],
  'build: same statystyki': ['--arch', 'stats'], 'build: same umiejętności': ['--arch', 'skills'], 'build: same przedmioty': ['--arch', 'items'],
  'build: ekonomia': ['--arch', 'econ'], 'build: dziobnięcia': ['--arch', 'crit'], 'build: twardziel': ['--arch', 'tank'],
  // progi decyzji (dokładniejsze) i Klątwy Prezesa (zysk punktowy kontra spadek wygranych)
  'dodatkowe rundy: od 30% życia': ['--extrahp', '30'], 'dodatkowe rundy: od 45% życia': ['--extrahp', '45'],
  'odpoczynek: poniżej 65%': ['--restbelow', '65'], 'odpoczynek: zawsze (100%)': ['--restbelow', '100'],
  'klątwa: Zakaz Wymian': ['--curses', 'zakaz-wymian'], 'klątwa: Przegrzany Piec': ['--curses', 'przegrzany-piec'], 'klątwa: Zakaz Drzemek': ['--curses', 'zakaz-drzemek'], 'klątwa: Podatek Kurzy': ['--curses', 'podatek'],
  'klątwa: Ciasne Gniazdo': ['--curses', 'ciasne-gniazdo'], 'klątwa: Pospiech': ['--curses', 'pospiech'], 'klątwa: Mgła Zarządu': ['--curses', 'mgla'], 'klątwa: Kruche Kości': ['--curses', 'kruche-kosci'],
};

const done = new Set();
if (existsSync(out)) for (const l of readFileSync(out, 'utf8').split('\n')) { if (!l.trim()) continue; try { const j = JSON.parse(l); done.add(`${j.char}|${j.garnek}|${j.variant}|${j.mode}`); } catch { /* ignoruj */ } }
else writeFileSync(out, '');
const jobs = [];
for (const v of Object.keys(VARIANTS)) for (const g of GARNEKS) for (const c of CHARS) if (!done.has(`${c}|${g}|${v}|${MODE}`)) jobs.push({ c, g, v });
console.log(`do zrobienia: ${jobs.length} konfiguracji, ${WORKERS} procesów, limit ${LIMIT / 60000} min`);
const t0 = Date.now(); let running = 0, idx = 0, finished = 0;
const prio = path.join(here, 'lib-prio.cjs');
await new Promise(resolve => {
  const next = () => {
    while (running < WORKERS && idx < jobs.length && Date.now() - t0 < LIMIT) {
      const j = jobs[idx++]; running++;
      const args = ['--require', prio, path.join(here, 'sim-balance.mjs'), '--mode', MODE, '--garnek', String(j.g), '--n', String(N), '--char', j.c, '--json', ...VARIANTS[j.v]];
      const p = spawn(process.execPath, args, { cwd: path.dirname(here) });
      let buf = ''; p.stdout.on('data', d => { buf += d; });
      p.on('close', () => {
        running--; finished++;
        const line = buf.split('\n').find(l => l.startsWith('JSON '));
        if (line) { const r = JSON.parse(line.slice(5)); r.variant = j.v; appendFileSync(out, JSON.stringify(r) + '\n'); }
        else console.error('BRAK WYNIKU', j);
        if (running === 0 && (idx >= jobs.length || Date.now() - t0 >= LIMIT)) resolve(); else next();
      });
    }
    if (running === 0 && (idx >= jobs.length || Date.now() - t0 >= LIMIT)) resolve();
  };
  next();
});
console.log(`zrobione w tej turze: ${finished}, pozostało: ${jobs.length - idx}`);
