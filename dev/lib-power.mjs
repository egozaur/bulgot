// Bulgot: ocena siły buildu (obrażenia na sekundę × wytrzymałość × mnożniki), wspólna dla bota i analizy kart.
import { heroStats } from '../../pl3y-server/src/games/bulgot/stats.js';
import { loadoutOf } from '../../pl3y-server/src/games/bulgot/rules.js';

export function power(run) {
  const S = heroStats(loadoutOf(run));
  const crit = Math.min(1, S.crit / 100) * (S.critMult / 100 - 1);
  const hps = S.aspd / 100;   // ciosy na sekundę
  const burn = S.burnHit ? S.atk * 0.10 * (1 + S.burnPct / 100) * Math.min(10 + S.burnMax, hps * S.burnHit / 100 * 4) * (S.pressure ? 1.4 : 1) : 0;
  const poison = S.poisonHit ? S.atk * 0.06 * (1 + S.poisonPct / 100) * Math.min(12, hps * S.poisonHit / 100 * 6) * 1.2 : 0;
  const bleed = S.bleed ? (S.bleed + S.atk * 0.08) * Math.min(3 + S.bleedMax, hps * 3) : 0;
  const frost = S.frostHit ? Math.min(1, hps * S.frostHit / 100 * 0.8) : 0;   // ułamek czasu, przez który wrogowie mają Mróz
  const cold = 1 + frost * (S.vsCold / 100 + 0.15 + (S.shatter ? 0.25 : 0) + (S.freezePct ? 0.1 : 0));
  const dps = (S.atk * hps * (1 + crit) * (1 + S.dmg / 100) + (S.egg ? 1.2 * S.atk / (S.egg / 10) : 0) + burn + poison + bleed) * cold + S.startBurn * S.atk * 0.05;
  const ehp = (S.maxHp * (1 + S.regen / 120)) * (1 + S.armor / 100) / (1 - Math.min(75, S.evade) / 100);
  const skills = run.skills.reduce((a, s) => a + (s.lvl >= 3 ? 0.22 : s.lvl >= 2 ? 0.16 : 0.1), 0);
  const econ = 1 + (S.coinFlat + S.bossCoins / 4 + S.freeReroll * 1.5 + S.restDisc / 2) * 0.012 + (S.noSteal ? 0.02 : 0) + S.buyDisc * 0.002;
  // Etap 2: nowe efekty przedmiotów (przybliżone mnożniki)
  const extra = (1 + S.double / 100) * (1 + S.cleave * 0.004) * (1 + (S.vsBurn ? S.vsBurn / 100 * 0.5 : 0)) * (1 + (S.burnSpread ? 0.05 : 0)) * (1 + (S.burnArmor ? 0.05 : 0)) * (1 + (S.frostWeak ? S.frostWeak / 100 * 0.25 : 0)) * (1 + (S.firstFrost ? 0.03 : 0)) * (1 + (S.surprise ? 0.07 : 0)) * (1 + (S.scare ? 0.06 : 0)) * (1 + (S.medkit ? 0.07 : 0)) * (1 + S.skillReset * 0.004);
  const legend = (1 + S.allStatus * 0.1) * (1 + (S.alphaCd ? 0.05 : 0)) * (S.planB ? 1.12 : 1) * (1 + (S.skillCrit ? 0.06 : 0)) * (1 + S.bigInterest * 0.0008);
  return legend * extra * dps * ehp * (1 + skills) * (S.revive ? 1.1 : 1) * (1 + S.luck * 0.004) * econ * (1 + S.frostThorns * 0.05);
}
