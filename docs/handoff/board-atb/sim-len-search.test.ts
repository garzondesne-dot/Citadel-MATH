import { it } from 'vitest';
import { SUBJ } from '../src/engine/subject';
import { HEROES } from '../src/model/hero';
import { newBattle } from '../src/board/atb/engine';
import { newBot, simulate } from '../src/board/atb/bots';
import { statsOf } from '../src/board/atb/heroes';
import { botHeroes } from '../src/board/atbLink';
import { BOSSES, T } from '../src/board/atb/tune';
const NOS = (process.env.NOS || '4,6,7,9,14').split(',').map(Number);
const GRID = JSON.parse(process.env.GRID || '[[1,1]]') as [number, number][];
const N = +(process.env.N || 30);
const all = HEROES.map((h) => h.id);
function evalOne(no: number, k: number, m: number, N: number) {
  const Tm = T as any;
  Tm.bossHpByNo[no] = HP0[no].map((x: number, i: number) => (i === 3 ? Math.round(x * k) : x)); Tm.bossAtkByNo[no] = ATK0[no] * m;
  const L = SUBJ.lessons.find((p) => p.no === no) ?? SUBJ.lessons.find((p) => p.no === 10)!;
  let win = 0, n = 0, twin = 0, tsum = 0;
  for (let ppl = 1; ppl <= 4; ppl++) for (let s = 1; s <= N; s++) {
    const seed = no * 1000 + ppl * 100 + s, pick = [...all].sort((a, b) => ((a * 7919 + seed * 31) % 97) - ((b * 7919 + seed * 31) % 97)).slice(0, ppl);
    const team = [...pick, ...botHeroes(no, pick, all.filter((h) => !pick.includes(h)), 4 - ppl)];
    const S = newBattle({ boss: BOSSES[no]!, diff: 'normal', party: team.map((h) => statsOf({ hero: h, lv: 1, enh: 1, tier: 1 })), seed });
    simulate(L, S, S.heroes.map((_, i) => newBot(L, i, 'normal', seed)), { maxT: 700 });
    n++; tsum += S.t; if (S.end?.win) { win++; twin += S.t; }
  }
  return { w: win / n, tw: win ? twin / win / 60 : 0, t: tsum / n / 60 };
}
const HP0 = JSON.parse(JSON.stringify((T as any).bossHpByNo)), ATK0 = { ...(T as any).bossAtkByNo };
it('search', () => {
  const TGT = +(process.env.TGT || 3.5), out: string[] = [];
  for (const no of NOS) {
    let best: any = null;
    for (const k of [1, 1.3, 1.6, 2, 2.5, 3, 3.6]) {
      let lo = 0.25, hi = 2.2, r: any = null, m = 1;
      for (let it = 0; it < 6; it++) { m = (lo + hi) / 2; r = evalOne(no, k, m, N); if (r.w > 0.7) lo = m; else hi = m; }
      const c = { k, m: +m.toFixed(2), ...r };
      if (!best || Math.abs(c.tw - TGT) < Math.abs(best.tw - TGT)) best = c;
      if (r.tw > TGT + 0.6) break;
    }
    out.push(`${no}\t${best.k}\t${best.m}\t${Math.round(best.w * 100)}%\t${best.tw.toFixed(1)}\t${best.t.toFixed(1)}\t${Math.round(HP0[no][3] * best.k)}\t${(ATK0[no] * best.m).toFixed(2)}`);
    console.log(out.at(-1));
  }
  console.log('\nno\tHPx\tATKx\twin\tminWin\tminAll\tHP4\tatk\n' + out.join('\n'));
}, 3600000);
it.skip('len', () => {
  const Tm = T as any, hp0 = JSON.parse(JSON.stringify(Tm.bossHpByNo)), atk0 = { ...Tm.bossAtkByNo };
  const out: string[] = [];
  for (const no of NOS) for (const [k, m] of GRID) {
    Tm.bossHpByNo[no] = hp0[no].map((x: number, i: number) => (i === 3 ? Math.round(x * k) : x)); Tm.bossAtkByNo[no] = atk0[no] * m;
    const L = SUBJ.lessons.find((p) => p.no === no) ?? SUBJ.lessons.find((p) => p.no === 10)!;
    let win = 0, n = 0, tsum = 0, twin = 0;
    for (let ppl = 1; ppl <= 4; ppl++) for (let s = 1; s <= N; s++) {
      const seed = no * 1000 + ppl * 100 + s, pick = [...all].sort((a, b) => ((a * 7919 + seed * 31) % 97) - ((b * 7919 + seed * 31) % 97)).slice(0, ppl);
      const team = [...pick, ...botHeroes(no, pick, all.filter((h) => !pick.includes(h)), 4 - ppl)];
      const S = newBattle({ boss: BOSSES[no]!, diff: 'normal', party: team.map((h) => statsOf({ hero: h, lv: 1, enh: 1, tier: 1 })), seed });
      simulate(L, S, S.heroes.map((_, i) => newBot(L, i, 'normal', seed)), { maxT: 700 });
      n++; tsum += S.t; if (S.end?.win) { win++; twin += S.t; }
    }
    out.push(`${no}\t${k}\t${m}\t${Math.round((win / n) * 100)}%\t${(tsum / n / 60).toFixed(1)}\t${win ? (twin / win / 60).toFixed(1) : '-'}`);
  }
  Tm.bossHpByNo = hp0;
  console.log('\nno\tHPx\tATKx\twin\tmin\tminWin\n' + out.join('\n'));
}, 600000);
