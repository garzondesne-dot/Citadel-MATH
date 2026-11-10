// 🪞 #81 선생님이 보는 문제 = 학생이 보는 문제 (2026-11-11 CLAUDE.md 같은 이름 절) — node tests/teacherview.test.js
//   ① 소레이드(chain) 몬스터: 종합실 🎮 시연 · 수업 준비 「숫자 4판 보기」가 학생과 같은 L.chainItems 를 씀 (L.items 통째 문제 ✕)
//   ② 첫 판 = 학습지 숫자 (seed 와 상관없이 학생 첫 판과 같음) · ③ 형성평가 다시 판 = L.boss.make (학생 bossItem 과 같은 함수)
const fs = require('fs'), path = require('path');
const load = require('./load');
const lf = fs.readdirSync(path.join(__dirname, '..', 'lessons')).filter((f) => /^set-\d+\.js$/.test(f)).map((f) => `lessons/${f}`);
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', ...lf, 'js/raid/model.js']);
let ok = 0, fail = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const src = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const hall = src('js/raid/hall.js'), prep = src('js/raid/prep.js');
const demo = hall.slice(hall.indexOf('function demoOpen'), hall.indexOf('function demoHero'));
check(/isChain\(L, R, step\.id\)[^\n]*L\.chainItems\(step\.id/.test(demo), '🎮 시연: 소레이드 = L.chainItems (학생과 같은 함수)');
check(/L\.boss\.make\(i, attempt/.test(demo), '🎮 시연: 형성평가 다시 판 = L.boss.make (학생 bossItem 과 같음)');
check(/chain \? L\.chainItems\(id, seed, a\)/.test(prep), '🔢 숫자 4판 보기: 소레이드 = L.chainItems');
check(/function demoChain/.test(hall) && /d\.says\.push\(it\.say/.test(hall) && /why\.text/.test(hall.slice(hall.indexOf('function demoChain'))), '🎮 시연 소레이드: 나의 풀이 한 줄 · 근거 줄 (학생 규칙)');
const R = { meta: { code: 'X' }, state: {}, players: {} };
DS.Lessons.list.filter((L) => Array.isArray(L.chain) && L.chain.length).forEach((L) => L.chain.forEach((mid) => {
  const core = (q) => ({ q: q.question, t: q.type, a: q.type === 'multi' ? q.answer.map((k) => q.options[k]).sort() : q.type === 'choice' ? q.choices[q.answerIndex] : q.answer, say: q.say, why: q.why && q.why.text }); // 숫자 · 정답 · 나의 풀이 · 근거 줄 (틀린 보기 섞임은 학생마다 다름)
  const a = JSON.stringify(L.chainItems(mid, 'demo|T|1', 0).map(core)), b = JSON.stringify(DS.Raid.chainItems(L, R, mid, 'u1', 0).map(core));
  check(a === b, `${L.id} ${mid}: 시연 첫 판 = 학생 첫 판 (학습지 숫자)`);
  check(L.chainItems(mid, 's', 0).length >= 2, `${L.id} ${mid}: 졸개 → 대장 단계`);
}));
console.log(fail ? `❌ 선생님 = 학생 문제 실패 ${fail}` : `✅ 선생님 = 학생 문제: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
