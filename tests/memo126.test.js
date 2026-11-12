// 📝 #126 검증: node tests/memo126.test.js  (2026-11-12 선생님 「세특 메모 = 생기부에 어울리는 용어로」 · DECISIONS 「📝 세특 초안 = 생기부 낱말」)
// 가짜 학생 3명 → 게임 낱말 0개 · 순서(참여 → 이해 → 협력 → 오류 수정 → 자기주도 → 성찰) · 4~6문장 · 500자 안 · 문장 끝 -함 · -임 · -보임 · 남는 문장 = 더 보기
const load = require('./load');
const fs = require('fs');
const lessons = fs.readdirSync(__dirname + '/../lessons').filter((f) => /^(set|eval)-\d+\.js$/.test(f)).sort().map((f) => `lessons/${f}`);
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', ...lessons, 'lessons/rubrics.js', 'lessons/curriculum.js', 'js/raid/note.js', 'js/raid/dash.js']);
let fail = 0, n = 0;
const check = (c, m) => { n++; if (!c) { fail++; console.error('FAIL:', m); } };
const BAN = ['레이드', '몬스터', '보스', '던전', '성채', '허수아비', '모루', '용사', '마정석', '서술 조각', '레벨', 'EXP', '콤보', '랭킹', '처치', '💎', '📜', '등수', 'Lv'];
const ORDER = [['참여'], ['이해', '성취기준', '형성평가'], ['협력', '친구'], ['바로잡음', '고쳐 씀', '서술함', '단서'], ['단원 평가', '반복 연습', '오답', '기호와 개념', '기호의 뜻'], ['성찰']];
const stage = (t) => (t.includes('성찰') ? 5 : ORDER.findIndex((ws) => ws.some((w) => t.includes(w))));
const M = DS.Dash._memo;
const L9 = DS.Lessons.get('set-09');
const misCode = Object.keys(DS.Mis.CODES)[0];
const studs = [
  { went: 6, heldN: 6, conc: { a: { name: '역과 대우', ok: 9, total: 10 } }, std: {}, boss: 88, hg: 3, fixed: 7, mis: { [misCode]: [3, 2] }, photoN: 3, photoRev: 2, hints: 4, tryEval: 12, trySet: 5, noteDone: 4, cards: 9, symt: { 'set-09': { conv: 3 } }, surveyed: true },
  { went: 4, heldN: 6, conc: {}, std: {}, boss: 50, hg: 0, fixed: 0, mis: {}, photoN: 0, photoRev: 0, hints: 0, tryEval: 0, trySet: 0, noteDone: 0, cards: 0, symt: {}, surveyed: false },
  { went: 5, heldN: 6, conc: { b: { name: '충분조건과 필요조건', ok: 4, total: 5 } }, std: {}, boss: null, hg: 1, fixed: 2, mis: {}, photoN: 1, photoRev: 0, hints: 0, tryEval: 3, trySet: 0, noteDone: 0, cards: 0, symt: {}, surveyed: true },
];
studs.forEach((s, k) => {
  const { main, more } = M(s), sent = main.replace(/\.$/, '').split('. '), all = main + ' ' + more.join(' ');
  check(BAN.every((w) => !all.includes(w)), `학생 ${k + 1}: 게임 낱말 없음 — ${BAN.filter((w) => all.includes(w))}`);
  check(sent.length >= 3 && sent.length <= 6, `학생 ${k + 1}: 본문 문장 수 ${sent.length} (${main})`);
  check(main.length <= 500, `학생 ${k + 1}: 500자 안 (${main.length})`);
  check(sent.every((t) => /(함|임|보임|씀|음)(\(.+\))?$/.test(t)), `학생 ${k + 1}: 문장 끝 -함 · -임 · -보임 · -음 ${sent.filter((t) => !/(함|임|보임|씀|음)(\(.+\))?$/.test(t))}`);
  const st = sent.map(stage); check(st.every((x) => x >= 0) && st.every((x, i) => i === 0 || x >= st[i - 1]), `학생 ${k + 1}: 순서 고정 ${st}`);
  check(sent[0].startsWith('모둠 협동학습 형태의 수학 수업'), `학생 ${k + 1}: 첫 문장 = 참여`);
});
// 기록이 많은 학생: 본문 6문장 · 남는 문장은 더 보기 · 6단계가 모두 한 번씩은 본문에 (넘칠 때만 뒤 단계가 더 보기로)
{ const { main, more } = M(studs[0]); const sent = main.replace(/\.$/, '').split('. ');
  check(sent.length === 6 && more.length > 0, `많은 기록 = 본문 6 + 더 보기 ${more.length}`);
  check(new Set(sent.map(stage)).size === 6, `본문에 여섯 단계 모두 ${sent.map(stage)}`);
  check(main.includes('(전 차시 참여)') && main.includes("'역과 대우' 개념에서 첫 시도 정답률 90%"), '사실 · % 그대로'); }
// 기록이 적은 학생: 없는 기록 문장은 안 나옴
{ const { main } = M(studs[1]); check(!/바로잡음|단원 평가|성찰|친구를 돕/.test(main) && main.includes('6차시 중 4차시'), `적은 기록 = 있는 사실만 (${main})`); }
check(M({ went: 0 }).main === '저장된 수업 기록이 없음.', '기록 없음');
// 문장에 들어갈 수 있는 낱말 원천(개념 이름 · 오개념 · 성취기준)에도 게임 낱말 없음
const conceptNames = DS.Lessons.list.flatMap((L) => (L.steps || []).filter((s) => s.kind === 'concept').map((s) => s.title.replace(/^개념 \d+ · /, '')));
check(conceptNames.every((t) => BAN.every((w) => !t.includes(w))), `개념 이름에 게임 낱말 ${conceptNames.filter((t) => BAN.some((w) => t.includes(w)))}`);
check(Object.values(DS.Mis.CODES).every((c) => BAN.every((w) => !String(c.seteuk || '').includes(w))), '오개념 문구에 게임 낱말 없음');
// 🐞 대시보드 계산 줄이 주석 뒤에 붙어 형성평가 · 고친 수 · 힌트 · OX 가 늘 0 이던 것 (2026-11-11 ~ · #126 하다가 찾음)
{ const d = DS.Dash._build({ 1: '가나' }, { 1: { 'set-09': { no: 9, conc: { c1: [3, 4] }, boss: 3, bossN: 4, fixed: 5, perfects: 1, hints: 2, ox: [4, 5] } } }, {}, {}, {}), s = d.studs[0];
  check(s.fixed === 5 && s.boss === 75 && s.hints === 2 && s.perf === 1 && s.ox === 80, `대시보드 계산: 고친 수 · 형성평가 · 힌트 · 퍼펙트 · OX ${JSON.stringify({ f: s.fixed, b: s.boss, h: s.hints, p: s.perf, o: s.ox })}`); }
console.log(`${fail ? '❌' : '✅'} 📝 #126 세특 초안 ${n}개 · 실패 ${fail}`);
if (fail) process.exit(1);
