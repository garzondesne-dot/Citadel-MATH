// 👩‍🏫 #80 체험판 7차시 검증: node tests/trial7.test.js
// (1) 순서 = 도입 → 문제 4 → 문제 6 → 👑 문제 7 · 형성평가 없음 · 실제 6·7차시 파일은 그대로
// (2) 첫 판 = 체험판 학습지 v1 숫자 (문제 4 (6, 3, 18) · 문제 6 (36, 25, 18) · 문제 7 (50, 3, 4, 1)) · 정답을 원소를 하나하나 세어 따로 계산
// (3) 한 판 더 = 같은 꼴 새 숫자 · 교과서 · 체험판 숫자는 안 나옴 · 졸개 → 대장 단계 수 · 근거 줄 자리 = 실제 수업과 같음
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-06.js']);
let ok = 0, fail = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const S6 = DS.Lessons.get('set-06'), T = S6.trial7();
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const ansOf = (q) => (q.type === 'multi' ? q.answer.map((i) => q.options[i]).join(',') : q.type === 'choice' ? q.choices[q.answerIndex] : String(q.answer));
// (1)
check(T.id === 'trial-07' && T.no === 7 && T.trial && !DS.Lessons.get('trial-07'), '체험판 판 = 따로 (등록은 체험판에서만)');
check(T.steps.map((s) => s.id).join(',') === 'intro,u4,u6,u7' && !T.steps.some((s) => s.kind === 'boss'), `순서 ${T.steps.map((s) => s.id)}`);
check(/👑/.test(T.steps[3].title) && T.chain.join() === 'u4,u6,u7', '문제 7 = 👑 보스 자리 · 소레이드 3개');
check(S6.steps.map((s) => s.id).join(' ') === 'c1 m1 c2 m2 c3 m3 c4 u4 u5 u6 u7 boss' && S6.chainItems('u4', 's', 0)[0].options, '실제 6·7차시 순서 그대로');
check(['u4', 'u6', 'u7'].every((k) => T.crops[k] && T.videos[k] === S6.videos[k]), '칸 위치 · 영상 (실제 수업과 같은 영상)');
// (2) 첫 판 정답 — 따로 계산
{ const A = range(1, 6).filter((d) => 6 % d === 0), B = range(1, 18).filter((x) => x % 3 === 0), D = B.filter((x) => !A.includes(x));
  const a = T.chainItems('u4', 's', 0); check(D.join() === '9,12,15,18' && String(a[a.length - 1].answer) === String(2 ** D.length) && 2 ** D.length === 16, `문제 4 대장 = 16 (${a[a.length - 1].answer})`);
  check(/6의 약수/.test(T.items('u4', 's', 0)[0].question) && /18 이하의 3의 배수/.test(T.items('u4', 's', 0)[0].question), '문제 4 첫 판 문제 글 = 체험판 숫자'); }
{ const a = T.chainItems('u6', 's', 0), nums = a.filter((q) => q.type !== 'choice' && q.type !== 'multi').map((q) => Number(q.answer));
  check(nums.includes(18) && nums.includes(25 + 18 - 36) && 25 + 18 - 36 === 7, `문제 6 최댓값 18 · 최솟값 7 (${nums})`); }
{ const bad = range(1, 49).filter((x) => x % 3 === 0 && x % 4 === 1), a = T.chainItems('u7', 's', 0);
  check(bad.join() === '9,21,33,45' && String(a[a.length - 1].answer) === String(49 - bad.length) && 49 - bad.length === 45, `문제 7 대장 = 45 (${a[a.length - 1].answer})`);
  check(String(a[0].answer) === '49' && String(a[2].answer) === '9', `문제 7 졸개 ① 49 · ③ 9 (${a[0].answer} · ${a[2].answer})`);
  check(/50 미만/.test(T.items('u7', 's', 0)[0].question), '문제 7 첫 판 문제 글'); }
// (3) 한 판 더
const BOOK = { u4: '8의 약수}, B = {x | x는 20 이하의 4의', u6: '회원 40명을 대상으로 두 코스 A와 B를 다녀온 경험이 있는 회원 수를 조사하였더니 A 코스는 28명이고 B 코스는 21명', u7: '100 미만의 자연수 중에서 7의 배수가 아니거나 5로 나누었을 때의 나머지가 3이' },
  TRI = { u4: '6의 약수}, B = {x | x는 18 이하의 3의', u6: '회원 36명을 대상으로 두 코스 A와 B를 다녀온 경험이 있는 회원 수를 조사하였더니 A 코스는 25명이고 B 코스는 18명', u7: '50 미만의 자연수 중에서 3의 배수가 아니거나 4로 나누었을 때의 나머지가 1이' };
for (const id of ['u4', 'u6', 'u7']) {
  const n0 = T.chainItems(id, 's', 0).length, w0 = T.chainItems(id, 's', 0).map((q, i) => (q.why ? i : -1)).filter((i) => i >= 0).join(), s0 = S6.chainItems(id, 's', 0).map((q, i) => (q.why ? i : -1)).filter((i) => i >= 0).join();
  check(n0 === S6.chainItems(id, 's', 0).length && w0 === s0, `${id} 단계 수 · 근거 줄 자리 = 실제 수업과 같음`);
  for (let k = 0; k < 200; k++) {
    const a = T.chainItems(id, 'r' + k, 1 + (k % 3)), p = a[0].problem || '';
    check(!!p && !p.includes(BOOK[id]), `${id} 한 판 더 교과서 숫자 (${p.slice(0, 40)})`);
    check(!p.includes(TRI[id]), `${id} 한 판 더 체험판 숫자 (${p.slice(0, 40)})`);
    check(a.every((q) => ansOf(q) !== '' && ansOf(q) !== 'undefined'), `${id} 정답 있음`);
  }
}
{ const a = T.chainItems('u7', 'x', 2), c = a[a.length - 1].check, bad = range(1, c.N - 1).filter((x) => x % c.p === 0 && x % c.q === c.rem).length; check(String(a[a.length - 1].answer) === String(c.N - 1 - bad), '문제 7 한 판 더 정답 따로 계산'); }
console.log(fail ? `❌ 체험판 7차시 실패 ${fail}` : `✅ 체험판 7차시: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
