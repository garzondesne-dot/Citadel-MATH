// 💎 경제 자동 시험 (2026-11-06 사용자 「모든 컨텐츠를 했다고 가정했을 때 양이 적당한지 계산하면서 뿌리고 있어?」)
//   기말(12/11)까지 학생 유형별로 모을 수 있는 💎 를 G(적립표) · 콘텐츠 수로 계산 → 상점(용사 + 스킬) 💎 합과 비교
//   목표 (🪜 #96 2026-11-11 선생님 A안 · 옛 띠 80~92 · 35~50 · 10~22): 상점 = 💎 용사 + 14갈래 사다리 4칸(강화는 따로) · 다 함 65~75% · 꾸준 28~38% · 수업만 9~15% · 실력 갈래와 노력 갈래가 비슷한 크기
//   보상 · 값을 바꾸면 node tests/economy.test.js 로 목표 안인지 확인
global.window = global; global.DS = { Net: {} }; require('../js/raid/gem.js');
const G = DS.Gem.G, SHOP = DS.Gem.SHOP;
// 기말까지 콘텐츠 (2026-11-11 #75 · DECISIONS 「💎 경제 시험 = 차시 수를 지금 계획으로」): 레이드 = 기말 범위 2~17차시 + 총정리 · 늦은 반 기준 15 (ROADMAP 2-2)
//   성채 · 서술형 · 카드 = 지금 게임 값 (아래 시험이 차시 파일과 같은지 확인) · fixes = 차시마다 오답 고치기 약 3 (옛 9차시 27 과 같은 비율)
const C = { lessons: 15, rooms: 37, bossRooms: 3, photoRooms: 7, cards: 54, fixes: 45 };
// 📚 도감 특전 용사(CARD_HEROES)는 카드를 다 모으면 💎 를 돌려받으므로 상점 합계에서 뺌 (2026-11-07)
// 🪜 #96 (2026-11-11): 스킬 = 용사 사다리 4칸뿐 · 모든 갈래에 용사가 있으니 14갈래 모두 셈 (옛 A1 「새 4갈래 뺌」 없앰) · 합체 칸 없음
const shop = Object.entries(SHOP).reduce((a, [kind, k]) => a + Object.entries(k).reduce((b, [id, v]) => b + (kind === 'hero' && DS.Gem.CARD_HEROES.includes(Number(id)) ? 0 : v), 0), 0);
// 갈래별 적립 (f = 하는 비율)
function earn(f) {
  const skill = C.lessons * (f.solved * G.solvedMax + f.perfect * G.perfect + f.perfect * G.bossPerfect + f.boss * G.bossRe) + C.rooms * f.rooms * f.first * G.roomFirst + C.photoRooms * f.photo * G.photo; // 🧠 실력
  const effort = C.lessons * (G.join + G.clear /* 시간 안 클리어 */ + f.note * G.note + f.seal * G.seal) + C.rooms * f.rooms * G.room + C.bossRooms * f.rooms * (G.roomBoss + G.seal) + C.fixes * f.review * G.review + C.cards * f.cards * G.card + (f.rooms ? G.first * 2 : 0); // 💪 노력 · 참여
  const etc = C.lessons * f.fun * 7 /* 쉼터 · 박쥐 · 반대항 */ + 18 /* 레벨 */ + G.survey /* 설문 */ + f.streak * 22;
  return { skill, effort, etc, total: skill + effort + etc };
}
const TYPES = {
  '다 함': { solved: 1, perfect: 1, boss: 1, rooms: 1, first: 0.7, photo: 1, note: 1, seal: 1, review: 1, cards: 1, fun: 1, streak: 1 },
  '꾸준': { solved: 0.75, perfect: 0.4, boss: 0.5, rooms: 0.4, first: 0.4, photo: 0.3, note: 0.4, seal: 0.4, review: 0.5, cards: 0.2, fun: 0.6, streak: 0.6 },
  '수업만': { solved: 0.6, perfect: 0.2, boss: 0, rooms: 0, first: 0, photo: 0, note: 0, seal: 0, review: 0, cards: 0, fun: 0.5, streak: 0.3 },
};
const BAND = { '다 함': [0.65, 0.75], '꾸준': [0.28, 0.38], '수업만': [0.09, 0.15] };
let fail = 0; const pct = (x) => `${Math.round(x * 100)}%`;
console.log(`상점(💎 용사 + 14갈래 사다리) 💎 ${shop}`);
Object.entries(TYPES).forEach(([k, f]) => { const e = earn(f), r = e.total / shop, [lo, hi] = BAND[k], ok = r >= lo && r <= hi; if (!ok) fail++;
  console.log(`${ok ? '✔' : '✘'} ${k}: 💎 ${Math.round(e.total)} (실력 ${Math.round(e.skill)} · 노력 ${Math.round(e.effort)} · 그 밖 ${Math.round(e.etc)}) = 상점의 ${pct(r)} (목표 ${pct(lo)}~${pct(hi)})`); });
const all = earn(TYPES['다 함']), ratio = all.effort / all.skill;
const balOk = ratio >= 0.8 && ratio <= 2.2; if (!balOk) fail++;
console.log(`${balOk ? '✔' : '✘'} 실력 : 노력 = 1 : ${ratio.toFixed(2)} (노력만으로도 같은 높이까지 — 1 : 0.8~2.2)`);
const enh = DS.Gem.ENH.slice(1).reduce((a, c) => ({ g: a.g + c.g, s: a.s + (c.s || 0) }), { g: 0, s: 0 });
console.log(`🔨 강화 +10 까지 💎 ${enh.g} + 📜 ${enh.s} (상점 밖 큰 쓸 곳)`);
// 📜 서술 조각 공급 (2026-11-09 #27): 성채 서술형 7방 × 최대 3 (통과 · 만점 · 점수 상승) + 수업 소레이드 ✍ 📸 진필살기 문제당 1 (지금 기준표가 있는 문제 수) · 필요 = 상점 📜 + 강화 📜
{ global.window = global; require('../lessons/rubrics.js'); const RB = DS.Rubrics || {}; let raid = 0, castle = 0; Object.entries(RB).forEach(([l, rs]) => Object.keys(rs).forEach(() => { if (/^eval-/.test(l)) castle++; else raid++; }));
  const need = Object.values(DS.Gem.SCROLL_NEED).reduce((a, k) => a + Object.values(k).reduce((b, v) => b + v, 0), 0) + enh.s, sup = castle * 3 + raid;
  console.log(`📜 공급 ${sup} (성채 ${castle}방 × 3 = ${castle * 3} + 수업 진필살기 ${raid}문제 × 1) · 필요 ${need} (상점 ${need - enh.s} + 강화 ${enh.s}) → ${sup >= need ? '다 모음' : `${need - sup}개 모자람 (수업 ✍ 문제가 늘면 채워짐)`}`); }
// 🔎 #75: 성채 · 서술형 · 카드 수 = 지금 차시 파일 (게임이 바뀌면 위 C 를 같이 고치라고 알림)
{ const fs = require('fs'), path = require('path'), load = require('./load'); const lf = fs.readdirSync(path.join(__dirname, '..', 'lessons')).filter((f) => /^eval-\d+\.js$/.test(f)).map((f) => `lessons/${f}`);
  const X = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', ...lf, 'lessons/unit-set.js']);
  const rs = X.Lessons.list.filter((l) => l.eval && l.rooms).flatMap((l) => l.rooms), g = { rooms: rs.filter((r) => !r.boss).length, bossRooms: rs.filter((r) => r.boss).length, photoRooms: rs.filter((r) => r.photo).length, cards: X.Unit ? X.Unit.CARDS.length : 0 };
  Object.entries(g).forEach(([k, v]) => { const okk = C[k] === v; if (!okk) fail++; console.log(`${okk ? '✔' : '✘'} ${k} = 게임 ${v} (시험 가정 ${C[k]})`); }); }
console.log(fail ? `❌ 경제 목표 밖 ${fail}개` : '✅ 💎 경제 목표 안'); process.exit(fail ? 1 : 0);
