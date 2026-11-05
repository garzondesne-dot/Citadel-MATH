// 🏁 반대항 기록 채우기 (2026-11-06): v0.9.11 전에 끝난 수업은 punch/{차시}/{반} 기록이 없어 경주에 안 나옴
//   → Firebase 에 남은 지난 수업 방(rooms)을 읽어 같은 계산(DS.Combo.analyze · punch)으로 기록을 만든다
//   반 · 차시마다 가장 늦게 연 수업 하나 · 이미 있는 기록은 건드리지 않음 (--force 면 덮음) · 옛 방은 콤보 기록이 없어 나머지 4가지(80점)를 100점으로 환산
//   node tools/auto/punch_backfill.js [--dry] [--force]
const { firebaseToken } = require('./google');
const load = require('../../tests/load');
const DB = 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app';
const dry = process.argv.includes('--dry'), force = process.argv.includes('--force');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-02.js', 'lessons/set-03.js', 'lessons/set-04.js', 'lessons/set-05.js', 'lessons/set-06.js', 'js/raid/model.js', 'js/raid/combo.js']);
const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
const unpack = (s) => { try { return JSON.parse(s); } catch (e) { return null; } };
function unpackRoom(R) { // actions.js unpackRoom 과 같음 (학생 답은 JSON 문자열로 저장됨)
  const out = JSON.parse(JSON.stringify(R || {}));
  Object.values(out.subs || {}).forEach((byU) => Object.values(byU || {}).forEach((byA) => Object.keys(byA || {}).forEach((k) => { if (typeof byA[k] === 'string') byA[k] = unpack(byA[k]); })));
  Object.values(out.bossTry || {}).forEach((byI) => Object.values(byI || {}).forEach((byA) => Object.keys(byA || {}).forEach((k) => { if (typeof byA[k] === 'string') byA[k] = unpack(byA[k]); })));
  Object.values(out.bossAns || {}).forEach((bySet) => Object.keys(bySet || {}).forEach((k) => { if (typeof bySet[k] === 'string') bySet[k] = unpack(bySet[k]); }));
  return out;
}
(async () => {
  const tok = await firebaseToken(), H = { Authorization: `Bearer ${tok}` };
  const get = async (p, q = '') => { const r = await fetch(`${DB}/${p}.json${q}`, { headers: H }); if (!r.ok) throw new Error(`${r.status} ${p}`); return r.json(); };
  const codes = Object.keys((await get('rooms', '?shallow=true')) || {});
  const punch = (await get('punch')) || {};
  console.log(`수업 방 ${codes.length}개 · 지금 기록 ${Object.entries(punch).map(([l, v]) => `${l}: ${Object.keys(v || {}).join(',')}`).join(' / ') || '없음'}`);
  const best = {}; // `${lesson}|${cls}` → { R, L, at }
  for (const code of codes) {
    const raw = await get(`rooms/${code}`).catch(() => null); if (!raw || !raw.meta) continue;
    const R = unpackRoom(raw), L = DS.Lessons.get(R.meta.lesson), cls = R.meta.cls;
    if (!cls || !L || !L.no || L.eval || DS.Raid.isLobby(R) || !DS.Raid.isClosed(R)) continue;
    const studs = Object.values(R.players || {}).filter((p) => !p.teacher).length; if (studs < 3) continue; // 시험 · 연습 방 빼기
    const k = `${L.id}|${cls}`, at = Number(R.meta.created) || 0;
    if (!best[k] || at > best[k].at) best[k] = { R, L, at, code };
  }
  let wrote = 0;
  for (const [k, { R, L, at, code }] of Object.entries(best).sort()) {
    const cls = R.meta.cls, had = (punch[L.id] || {})[ck(cls)];
    const an = DS.Combo.analyze(L, R), p = DS.Combo.punch(L, R, an);
    // 콤보 기록(hits)이 없는 옛 방: 콤보 20점을 0 으로 세면 불리 → 나머지 4가지(80점 만점)를 100점으로 환산
    const noCombo = !R.hits;
    if (noCombo) { const W = DS.Combo.PUNCH_W, raw = Object.entries(W).filter(([key]) => key !== 'combo').reduce((a, [key, w]) => a + w * (p.m[key] || 0), 0); p.s = Math.round(raw / (100 - W.combo) * 100 / 10); p.m = { ...p.m, combo: null }; }
    const e = { s: p.s, m: p.m, best: p.best, n: p.n, at, code, backfill: true, ...(noCombo ? { noCombo: true } : {}) };
    console.log(`${had && !force ? '· 그대로' : dry ? '○ 쓸 것' : '✔ 씀'} ${L.no}차시 ${cls}반 (${code} · ${new Date(at).toISOString().slice(0, 10)}) 점수 ${p.s} · 참여 ${p.n}명 · ${JSON.stringify(p.m)}${had ? ` · 있던 기록 ${had.s}` : ''}`);
    if ((had && !force) || dry) continue;
    const r = await fetch(`${DB}/punch/${L.id}/${ck(cls)}.json`, { method: 'PUT', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify(e) });
    if (!r.ok) throw new Error(`쓰기 실패 ${r.status}`); wrote++;
  }
  console.log(dry ? '(미리 보기 · 쓰지 않음)' : `✅ ${wrote}개 기록을 채웠어요`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
