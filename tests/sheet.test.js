// 엑셀 문제 은행 → 차시 검사: node tests/sheet.test.js
// 양식 파일(assets/templates/question-bank-v1.xlsx)을 파이썬 없이 읽을 수 없으므로, 같은 내용을 표로 넣어 검사한다
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'js/engine/sheet-lesson.js']);
const S = DS.SheetLesson, Q = DS.Quiz;
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const H = ['단계ID', '칸', '버전', '형식', '문제', '보기1', '보기2', '보기3', '보기4', '보기5', '정답', '해설', '꼬리표', '세트'];
const tabs = {
  차시: [['안내'], ['과목', '단원', '차시 번호', '제목', '차시ID', '던전 테마'], ['공통수학2', 'Ⅱ-1 집합', '2', '예시', 'ex1', '02-deep-forest']],
  순서: [['안내'], ['단계ID', '종류', '제목', '요약'], ['c1', '개념', '개념 1', '요약'], ['m1', '문제', '문제 1'], ['s1', '보강', '보강'], ['boss', '형성평가', '형성평가']],
  문항: [['안내'], H,
    ['m1', '1', '0', '기호', 'A = {1, 3, 5} 일 때 || 3 □ A', '∈', '∉', '', '', '', '∈'],
    ['m1', '1', '1', '기호', 'A = {2, 4} 일 때 || 5 □ A', '∈', '∉', '', '', '', '∉'],
    ['m1', '1', '2', '기호', 'A = {1} 일 때 || 1 □ A', '∈', '∉', '', '', '', '∈'],
    ['m1', '2', '0', '숫자', 'n({3,6,9}) = ?', '', '', '', '', '', '3'],
    ['m1', '3', '0', '여러개', '6의 약수', '1', '2', '3', '4', '6', '1,2,3,5'],
    ['s1', '1', '0', '선다', '공집합은?', '{0}', '{x | x는 1보다 작은 자연수}', '{1}', '', '', '2'],
    ['s1', '2', '0', 'OX', '{0}은 공집합', '', '', '', '', '', 'X'],
    ['s1', '3', '0', '단답', '원소가 없는 집합은?', '', '', '', '', '', '공집합, 공 집합'],
    ['boss', '1', '', '숫자', 'n({a,b}) = ?', '', '', '', '', '', '2', '', '', '1'],
    ['boss', '1', '', '숫자', 'n({p,q,r}) = ?', '', '', '', '', '', '3', '', '', '2'],
  ],
};
const r = S.build(tabs);
check(r.errors.length === 0, `오류 없음 ${r.errors}`);
check(r.pack.id === 'xl-ex1' && r.pack.no === 2 && r.pack.theme === '02-deep-forest', '차시 정보');
check(r.pack.steps.map((s) => s.kind).join() === 'concept,monster,monster,boss' && r.pack.steps[2].special, '순서 · 보강 = 스페셜');
check(r.warnings.some((w) => /2칸/.test(w)), '버전 부족 경고');
// 서버를 거친 모양(배열 → 객체)도 다시 배열로
const toObj = (v) => (Array.isArray(v) ? Object.fromEntries(v.map((x, i) => [i, toObj(x)])) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toObj(x)])) : v);
const L = S.attach(toObj(r.pack));
check(DS.Lessons.get('xl-ex1') === L, '등록');
const a0 = L.items('m1', 'seed', 0);
check(a0.length === 3 && a0[0].items[0].answer === '∈' && a0[0].question.startsWith('A = {1, 3, 5}'), '첫 시도 = 버전 0');
check(Q.grade(a0[2], [0, 1, 2, 4]) && !Q.grade(a0[2], [0, 1, 2]), '여러개 채점 (1,2,3,6)');
check(Q.grade(a0[1], 3) && !Q.grade(a0[1], 4), '숫자 채점');
// 재도전: 버전 1·2 에서, 직전과 다르게
let diff = 0; for (let s = 0; s < 50; s++) { const x1 = L.items('m1', `s${s}`, 1)[0], x2 = L.items('m1', `s${s}`, 2)[0]; check(x1.question !== a0[0].question && x2.question !== a0[0].question, '재도전은 원문이 아님'); if (x1.question !== x2.question) diff++; }
check(diff === 50, `재도전 1 · 2 는 서로 다른 버전 (${diff}/50)`);
const s1 = L.items('s1', 'x', 0);
check(Q.grade(s1[0], 1) && Q.grade(s1[1], false) && Q.grade(s1[2], ' 공 집합 ') && Q.grade(s1[2], '공집합') && !Q.grade(s1[2], '부분집합'), '선다 · OX · 단답 채점');
check(L.boss.items === 1 && L.boss.sets[1][0].answer === 2 && L.boss.sets[2][0].answer === 3, '형성평가 세트1 · 2');
// 오류 찾기
const bad = S.build({ ...tabs, 문항: [['x'], H, ['m1', '1', '0', '선다', '문제', 'a', 'b', '', '', '', '5'], ['zz', '1', '0', 'OX', 'q', '', '', '', '', '', 'O'], ['m1', '2', '0', '기호', '식 없음', '∈', '∉', '', '', '', '∈'], ['m1', '3', '0', '모름', 'q', '', '', '', '', '', '1']] });
check(bad.errors.some((e) => /보기 번호/.test(e)) && bad.errors.some((e) => /zz/.test(e)) && bad.errors.some((e) => /□/.test(e)) && bad.errors.some((e) => /형식/.test(e)) && bad.errors.some((e) => /형성평가에 문항/.test(e)), `오류 메시지 ${bad.errors.join(' | ')}`);
if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 엑셀 문제 은행 — 차시 · 순서 · 6가지 형식 채점 · 첫 시도/재도전 버전 · 형성평가 세트 · 오류 찾기 통과');
