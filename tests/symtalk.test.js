// 📖 기호 톡 (#54 · 2026-11-10): 문구 = docs/SYMBOL-TALK.md 그대로 · 문맥으로 기호 고르기 — node tests/symtalk.test.js
const fs = require('fs'), path = require('path');
const DS = require('./load')(['js/engine/ui.js', 'js/engine/symtalk.js']), S = DS.SymTalk;
let ok = 0, fail = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };

// ① 문구 = SYMBOL-TALK.md 집합 단원 표 그대로 (** 굵게 표시만 빼고 · \| = |)
const md = fs.readFileSync(path.join(__dirname, '..', 'docs/SYMBOL-TALK.md'), 'utf8');
const rows = md.split('\n').filter((l) => /^\| .* \| (6\d|7\d) \|$/.test(l)).map((l) => l.replace(/\\\|/g, '¦').split('|').slice(1, -1).map((c) => c.trim().replace(/¦/g, '|').replace(/\*\*/g, '')));
check(rows.length === 16 && S.ROWS.length === 16, `기호 16줄 (문서 ${rows.length} · 코드 ${S.ROWS.length})`);
rows.forEach(([sym, easy, def, memo], i) => { const r = S.ROWS[i] || {};
  check(r.sym === sym, `${i + 1} 기호 「${r.sym}」 = 「${sym}」`);
  check(r.easy === easy, `${sym} ① 쉬운 한 줄 「${r.easy}」 = 「${easy}」`);
  check(r.def === def, `${sym} ② 정의 「${r.def}」 = 「${def}」`);
  check(r.memo === (memo === '—' ? '' : memo), `${sym} ③ 기억 고리 「${r.memo}」 = 「${memo}」`); });

// ①-2 개념 톡 (#58 F): SYMBOL-TALK 「개념 톡」 표 그대로 · 붙는 곳 = 부분집합의 개수 문제 글
{ const row = md.split('\n').find((l) => /^\| 「집합 X 의 개수는\?」/.test(l)).split('|').slice(1, -1).map((c) => c.trim().replace(/\*\*/g, '')), c = S.CONCEPTS[0];
  check(c && c.id === '2^n' && c.sym === '2ⁿ', '개념 톡 기록 키 「2^n」 · 칩 「2ⁿ」');
  check(c.easy === row[1], `개념 톡 ① 「${c.easy}」 = 「${row[1]}」`); check(c.def === row[2], `개념 톡 ② 「${c.def}」 = 「${row[2]}」`); check(c.memo === row[3], `개념 톡 ③ 「${c.memo}」 = 「${row[3]}」`);
  check(c.where.test('집합 X 의 개수는?') && !c.where.test('A ∩ B 의 가장 작은 원소는?'), '붙는 곳 = 집합 X 의 개수 문제만'); }
// ①-3 명제 단원 (#62): SYMBOL-TALK 「명제 단원」 표 그대로 (쪽 8x) · 붙는 곳
{ const sec8 = md.slice(md.indexOf('## 명제 단원'), md.indexOf('### 9차시')); const pr = sec8.split('\n').filter((l) => /^\| .* \| 8\d \|$/.test(l)) /* 8차시 표만 (9차시 = #66) */.map((l) => l.split('|').slice(1, -1).map((c) => c.trim().replace(/\*\*/g, '')));
  const ids = ['neg', 'prop', 'cond', 'truth'];
  check(pr.length === 4 && S.PROP.length === 8 && S.PROP.slice(0, 4).map((r) => r.id).join() === ids.join(), `명제 4줄 (문서 ${pr.length} · 코드 ${S.PROP.length})`);
  pr.forEach(([, easy, def, memo], i) => { const r = S.PROP[i] || {};
    check(r.easy === easy, `${r.id} ① 「${r.easy}」 = 「${easy}」`); check(r.def === def, `${r.id} ② 「${r.def}」 = 「${def}」`); check(r.memo === memo, `${r.id} ③ 「${r.memo}」 = 「${memo}」`); });
  const H = (t, w) => S.propHits(t, w).map((h) => `${t.substr(h.i, h.len)}:${h.id}`).join(' ');
  check(H('(1) 조건 p : x는 홀수 의 부정 ~p 의 진리집합의') === '조건:cond ~:neg 진리집합:truth', `8차시 문제 글 (${H('(1) 조건 p : x는 홀수 의 부정 ~p 의 진리집합의')})`);
  check(H('~q : x ≤ 3') === '~:neg' && H('~ 5') === '' && H('x ~ y') === '', '~ 는 ~p · ~q · ~r 꼴만');
  check(H('조건제시법으로 나타내면') === '', '「조건제시법」 은 안 붙음');
  check(H('Pᶜ = {2, 4}', '진리집합') === 'P:truth' && H('Pᶜ = {2, 4}', '집합 P') === '' && H('APB') === '', 'P = 「진리집합」 낱말이 같은 문제 글에 있을 때만');
  check(H('다음 중 명제인 것은?') === '명제:prop', '「명제」 낱말'); }
// ①-4 9차시 (#66): SYMBOL-TALK 「9차시」 표 그대로 · p → q · 반례 · 역 · 대우
{ const sec9 = md.slice(md.indexOf('### 9차시'), md.indexOf('## 개념 톡')), pr = sec9.split('\n').filter((l) => /^\| .* \| 8\d \|$/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim().replace(/\*\*/g, '')));
  const P9 = S.PROP.slice(4), ids = ['imp', 'counter', 'conv', 'contra'];
  check(pr.length === 4 && P9.map((r) => r.id).join() === ids.join(), `9차시 4줄 (문서 ${pr.length} · 코드 ${P9.map((r) => r.id)})`);
  pr.forEach(([, easy, def, memo], i) => { const r = P9[i] || {}; check(r.easy === easy, `${r.id} ① 「${r.easy}」 = 「${easy}」`); check(r.def === def, `${r.id} ② 「${r.def}」 = 「${def}」`); check(r.memo === memo, `${r.id} ③ 「${r.memo}」 = 「${memo}」`); });
  const H = (t) => S.propHits(t).map((h) => `${t.substr(h.i, h.len)}:${h.id}`).join(' ');
  check(H('명제 p → q 의 역은 q → p') === '명제:prop →:imp 역:conv →:imp', `p → q · 역 (${H('명제 p → q 의 역은 q → p')})`);
  check(H('대우 ~q → ~p') === '대우:contra ~:neg →:imp ~:neg' && H('반례를 모두 고르시오') === '반례:counter', '대우 · 반례');
  check(H('역사는 지역') === '' && H('x² = 4 → x = 2') === '', '「역사 · 지역」 · 식 사이 → 는 안 붙음'); }
// ② 문맥 (요청 #54 예: 「A ∩ B = ∅」 → 서로소 · 「n(A ∪ B)」 → 개수 공식 · 「Aᶜ」 → 여집합 · 「A − B」 → 차집합 · 「a ∈ A」 → 속한다)
const at = (t, ch, k = 0) => { let i = -1; for (let j = 0; j <= k; j++) i = t.indexOf(ch, i + 1); return S.pick(t, i); };
const T = [
  ['A ∩ B = ∅ 이므로', '∩', 'disj'], ['A ∩ B = ∅ 이므로', '∅', 'disj'], ['A ∩ B = ∅ 이므로', '=', 'disj'],
  ['X ⊂ B − A = {12, 16, 20}', '⊂', 'sub'], ['X ⊂ B − A = {12, 16, 20}', '−', 'diff'], ['X ⊂ B − A = {12, 16, 20}', '{', 'list'],
  ['n(A ∪ B) = n(A) + n(B) − n(A ∩ B)', '∪', 'ncup'], ['n(A ∪ B) = n(A) + n(B) − n(A ∩ B)', 'n', 'ncup'], ['n(A ∪ B) = n(A) + n(B) − n(A ∩ B)', '−', null],
  ['n(A) = 4', 'n', 'n'], ['n(A) = 4', '=', null], ['99 − 3 = 96', '−', null], ['99 − 3 = 96', '=', null],
  ['a ∈ A', '∈', 'in'], ['b ∉ A', '∉', 'notin'], ['A ⊄ B', '⊄', 'nsub'], ['A ∩ B 의 원소', '∩', 'cap'], ['A ∪ B = B 이므로', '∪', 'cup'], ['A ∪ B = B 이므로', '=', 'eq'],
  ['Aᶜ ∪ Bᶜ = (A ∩ B)ᶜ', 'ᶜ', 'compl'], ['Aᶜ ∪ Bᶜ = (A ∩ B)ᶜ', '∪', 'cup'], ['Aᶜ ∪ Bᶜ = (A ∩ B)ᶜ', '=', 'eq'],
  ['A = {x | x는 8의 약수}', '{', 'build'], ['A = {x | x는 8의 약수}', '|', 'build'], ['A = {x | x는 8의 약수}', '=', null],
  ['U = 100 미만의 자연수', 'U', 'U'], ['n(U) = 99', 'U', 'U'], ['n(∅) = 0', '∅', 'empty'], ['A − B ≠ B − A', '−', 'diff'],
];
T.forEach(([t, ch, want]) => { const got = at(t, ch); check(got === want, `「${t}」의 ${ch} → ${want} (${got})`); });
check(Object.keys(S.BY).every((k) => S.ROWS.some((r) => r.id === k) || S.CONCEPTS.some((r) => r.id === k) || S.PROP.some((r) => r.id === k)), '모든 id = 기호 16줄 + 개념 톡 + 명제');

// ③ 대시보드 순위: 반 · 차시 거르기
const xp = { 1: { st: { 'set-06': { cap: 3, compl: 1 }, 'eval-1': { cap: 2 } } }, 2: { st: { 'set-06': { compl: 5 } } }, 3: { total: 10 } };
let r = S.rank(xp, ''); check(r[0].id === 'compl' && r[0].n === 6 && r[0].who === 2 && r[1].id === 'cap' && r[1].n === 5, `모두: Aᶜ 6 · ∩ 5 (${r.map((x) => `${x.id}${x.n}`)})`);
r = S.rank(xp, 'eval-1'); check(r.length === 1 && r[0].id === 'cap' && r[0].n === 2, '차시 거르기 (성채 1층 = ∩ 2)');

// ④ 화면 코드에서 부르는 곳 (수업 · 성채 · 허수아비 = 기록 차시) · 대시보드 탭
const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
check(/SymTalk\.setCtx\(/.test(read('js/raid/student.js')) && /SymTalk\.setCtx\(/.test(read('js/raid/bonus.js')), '학생 폰 · 성채 · 허수아비 = 기록 차시 알림');
check(/\['sym', '📖 기호 톡'\]/.test(read('js/raid/dash.js')), '대시보드 「📖 기호 톡」 탭');
check(/symtalk\.js/.test(read('index.html')) && /symtalk\.js/.test(read('sw.js')), 'index.html · sw.js 에 들어감');
console.log(fail ? `❌ 기호 톡 실패 ${fail}` : `✅ 기호 톡: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
