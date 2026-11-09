// 🏰 타워 디펜스 균형 시험 (2026-11-07): 반 구성을 바꿔 가며 여러 판을 돌려 이길 확률을 잼 — node tests/td.test.js
//   목표: 지도마다 평균 이길 확률 55~90% (확정안 ≈ 70% · 반 구성 5가지 평균) · 어느 구성도 25% 밑으로 안 내려감 · 모든 판 225초 안에 끝 · 지도 5종
//   반 구성: 보통 20명 · 보통 12명 · 약한 20명 · 강한 20명 · 4명 (선생님 타워 · 방패 · 응원 · 기술 · 판 안 업그레이드 포함) · TD_N=판 수 (기본 12)
global.window = global; global.DS = {}; global.document = undefined;
require('../js/engine/fx.js'); require('../js/raid/td-maps.js'); require('../js/raid/td.js');
const TD = DS.TD, MAPS = DS.TDMaps.MAPS;
const FX = DS.FX.FAMS.map((f) => f.ids);
function klass(n, kind, R) {
  const lv = { weak: [2, 4], mid: [4, 7], strong: [7, 11] }[kind], en = { weak: [0, 1], mid: [0, 4], strong: [3, 9] }[kind], tw = { weak: [0, 1], mid: [0, 2], strong: [1, 3] }[kind];
  const r = (a, b) => a + Math.floor(R() * (b - a + 1));
  return Array.from({ length: n }, (_, i) => { const hero = r(0, 17), fam = R() < 0.45 ? FX.find((ids) => ids[0] === DS.FX.affOf(hero).ids[0]) : FX[r(0, FX.length - 1)];
    return { uid: 'u' + i, p: { lv: r(...lv), enh: r(...en), hero, fx: fam[r(...tw)] }, ranged: R() < 0.4 }; });
}
function play(map, n, kind, seed) {
  const R = TD.rng(`${map.id}|${n}|${kind}|${seed}`), studs = klass(n, kind, R), slots = DS.TDMaps.slots(map).map((s) => s.no);
  const stars = DS.TDMaps.slots(map).filter((s) => s.star).map((s) => s.no), free = new Set(slots);
  studs.forEach((s, i) => { const pool = (i < 6 && R() < 0.7 ? stars : slots).filter((x) => free.has(x)); const pick = pool.length ? pool[Math.floor(R() * pool.length)] : [...free][0]; free.delete(pick); s.slot = pick; });
  const towers = [...studs, { uid: 'T', teacher: true, p: { lv: 6, enh: 0, hero: 17, fx: 'meteor' }, ranged: true }];
  const hp0 = TD.calibrate({ map, seed, towers }, process.env.TD_F != null ? Number(process.env.TD_F) : undefined), S = TD.create({ map, seed, towers, hp0 }); const useAt = Object.fromEntries(studs.map((s) => [s.uid, 80 + R() * 120]));
  TD.run(S, (S) => {
    S.towers.forEach((T) => { while (TD.pending(T) > 0) TD.upgrade(S, T.uid, TD.auto(T, R)); if (!T.teacher && !T.used && S.t >= useAt[T.uid] && S.mons.some((m) => !m.dead)) TD.skill(S, T.uid); });
    if (S.life <= 12 && !S.shieldUsed) TD.shieldOn(S);
    if (TD.WAVE_AT.some((w) => Math.abs(S.t - w - 6) < TD.DT / 2)) TD.cheer(S);
  });
  return S;
}
let fail = 0; const out = [];
const N = Number(process.env.TD_N) || 12;
for (const map of MAPS.filter((m) => !process.env.TD_MAP || m.id === process.env.TD_MAP)) { // TD_MAP=지도 하나만 (맞추기용)
  const row = { map: map.id };
  for (const [n, kind] of [[20, 'mid'], [12, 'mid'], [20, 'weak'], [20, 'strong'], [4, 'mid']]) {
    let win = 0, tmax = 0, life = 0; for (let s = 0; s < N; s++) { const S = play(map, n, kind, s); if (S.win) win++; tmax = Math.max(tmax, S.t); life += S.life; }
    row[`${kind}${n}`] = `${Math.round((100 * win) / N)}%`; row[`t${kind}${n}`] = Math.round(tmax);
    const w = win / N; (row.ws = row.ws || []).push(w);
    if (tmax > TD.LIMIT + 1) { fail++; console.log(`✘ ${map.id} ${kind}${n}: 시간 넘음 ${tmax}`); }
    if (w < 0.25) { fail++; console.log(`✘ ${map.id} ${kind}${n}: 너무 어려움 ${Math.round(w * 100)}%`); }
  }
  const avg = row.ws.reduce((a, b) => a + b, 0) / row.ws.length; row.avg = `${Math.round(avg * 100)}%`;
  if (avg < 0.55 || avg > 0.9) { fail++; console.log(`✘ ${map.id} 평균 이길 확률 ${row.avg} (목표 55~90% · 확정안 ≈ 70%)`); }
  out.push(row);
}
console.table(out.map((r) => ({ 지도: r.map, '보통20': r.mid20, '보통12': r.mid12, '약한20': r.weak20, '강한20': r.strong20, '4명': r.mid4, '평균': r.avg, '최장(초)': Math.max(r.tmid20, r.tweak20, r.tstrong20) })));
console.log(fail ? `❌ 균형 목표 밖 ${fail}개` : '✅ 타워 디펜스 균형 목표 안'); process.exit(fail ? 1 : 0);
