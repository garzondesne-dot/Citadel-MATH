// 📖 기호 톡 — 정식 js/engine/symtalk.js (문구 원본 = hero-v2 docs/SYMBOL-TALK.md · 집합 단원 16줄 + 개념 톡) 을 그대로 옮김
//   pick(줄, 자리) = 문맥으로 기호 고르기 (A ∩ B = ∅ → 서로소 · n(A ∪ B) → 개수 공식 · Aᶜ → 여집합 …) · 명제 단원(8 · 9차시 8줄 + 10 ~ 13차시 9줄) = PROP · 명제 차시에서만 (#49)
export interface SymRow { id: string; sym: string; easy: string; def: string; memo: string }
export const ROWS: SymRow[] = [
  { id: 'in', sym: 'a ∈ A', easy: 'a 는 A 팀 소속!', def: '「a 는 집합 A 에 속한다」 · a 가 집합 A 의 원소일 때', memo: '∈ = 원소(element)의 e 를 바꾼 기호 · 왼쪽 = 원소, 오른쪽 = 집합' },
  { id: 'notin', sym: 'b ∉ A', easy: 'b 는 A 팀 소속이 아니다', def: '「b 는 집합 A 에 속하지 않는다」 · b 가 A 의 원소가 아닐 때', memo: '' },
  { id: 'list', sym: '{1, 2, 4, 8}', easy: '원소를 하나하나 다 적기 (원소나열법)', def: '집합에 속하는 모든 원소를 { } 안에 나열', memo: '순서는 상관없음 · 같은 원소는 한 번만' },
  { id: 'build', sym: '{x | 조건}', easy: '{ 누구 | 어떤 애들 } · 조건에 맞는 x 를 다 모은 것 (조건제시법)', def: '원소들이 갖는 공통된 성질을 조건으로 제시 · x = 원소를 대표하는 문자', memo: '| 는 「그중에서 이런 것」이라고 읽으면 쉬움' },
  { id: 'n', sym: 'n(A)', easy: 'A 안에 원소가 몇 개?', def: '유한집합 A 의 원소의 개수', memo: 'n = 개수(number)의 첫 글자 · 예 n({1, 2, 4, 8}) = 4' },
  { id: 'empty', sym: '∅', easy: '텅 빈 집합 (원소 0개)', def: '원소가 하나도 없는 집합 = 공집합', memo: 'n(∅) = 0 · {0} 은 0 이 들어 있으니 공집합 아님' },
  { id: 'sub', sym: 'A ⊂ B', easy: 'A 가 B 안에 쏙 들어간다 (A 의 원소는 모두 B 에도 있다)', def: 'A 의 모든 원소가 B 에 속할 때 A 는 B 의 부분집합 · 「A 는 B 에 포함된다」', memo: '자기 자신도 부분집합(A ⊂ A) · ∅ 은 모든 집합의 부분집합 · 원소 n 개 → 부분집합 2ⁿ 개' },
  { id: 'nsub', sym: 'A ⊄ B', easy: 'A 에 B 밖으로 삐져나온 원소가 있다', def: 'A 가 B 의 부분집합이 아닐 때', memo: '하나만 삐져나와도 ⊄' },
  { id: 'eq', sym: 'A = B', easy: '원소가 똑같은 두 집합', def: 'A ⊂ B 이고 B ⊂ A 일 때 서로 같다', memo: '순서가 달라도 같은 집합' },
  { id: 'cap', sym: 'A ∩ B', easy: 'A 와 B 가 겹친 곳 (둘 다 있는 원소)', def: 'A 에도 속하고 B 에도 속하는 모든 원소로 이루어진 집합 = 교집합', memo: '「그리고」 · 모양이 아래로 열린 ∩ = 좁아진다' },
  { id: 'cup', sym: 'A ∪ B', easy: 'A 와 B 를 합친 것 (겹친 건 한 번만)', def: 'A 에 속하거나 B 에 속하는 모든 원소로 이루어진 집합 = 합집합', memo: '「또는」 · 위로 열린 ∪ = 담는 그릇' },
  { id: 'disj', sym: 'A ∩ B = ∅', easy: 'A 와 B 는 하나도 안 겹친다 (서로소)', def: '공통인 원소가 하나도 없을 때 A 와 B 는 서로소', memo: '서로소면 n(A ∪ B) = n(A) + n(B)' },
  { id: 'ncup', sym: 'n(A ∪ B)', easy: '합친 개수 = 더하고, 겹친 만큼 한 번 빼기', def: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)', memo: '겹친 곳을 두 번 세지 않게' },
  { id: 'U', sym: 'U', easy: '지금 다루는 원소 전부 (전체집합)', def: '부분집합을 생각할 때 처음의 집합', memo: 'U = universal set 의 첫 글자' },
  { id: 'compl', sym: 'Aᶜ', easy: 'U 안에서 A 밖에 있는 것 전부 (여집합)', def: 'U 의 원소 중 A 에 속하지 않는 모든 원소로 이루어진 집합', memo: 'C = complement 의 첫 글자 · Aᶜ = U − A · 「A 가 아니다」' },
  { id: 'diff', sym: 'A − B', easy: 'A 에서 B 를 빼고 남은 것 (A 쪽만)', def: 'A 에 속하지만 B 에는 속하지 않는 모든 원소로 이루어진 집합 = A 에 대한 B 의 차집합', memo: 'A − B ≠ B − A · A − B = A ∩ Bᶜ' },
];
export const CONCEPTS: (SymRow & { where: RegExp })[] = [
  { id: '2^n', sym: '2ⁿ', easy: '원소마다 「넣을까 뺄까」 2가지씩 → 2 × 2 × … (원소 수만큼)', def: '원소가 n 개인 집합의 부분집합의 개수는 2ⁿ 개', memo: '2³ = 2 × 2 × 2 = 8 · 2⁵ = 2 × 2 × 2 × 2 × 2 = 32 (25 아님) · 지수 n = 원소의 개수', where: /집합 X 의 개수는\?|부분집합의 개수/ },
];
/** 📖 명제 단원 (📜 #49 · SYMBOL-TALK.md 「명제 단원」 8 · 9차시 절 그대로 · 정식 symtalk.js PROP) — ~ · → 기호 + 낱말(명제 · 조건 · 진리집합 · 반례 · 역 · 대우) · 명제 차시에서만 */
export const PROP: SymRow[] = [
  { id: 'neg', sym: '~p', easy: 'p를 거꾸로 뒤집은 말', def: '「p가 아니다」 = p의 부정 · p가 참이면 ~p는 거짓, p가 거짓이면 ~p는 참', memo: '~(~p) = p · 「x > 2」의 부정은 「x ≤ 2」 (같다도 들어감)' },
  { id: 'prop', sym: '명제', easy: '참 · 거짓이 딱 정해지는 말', def: '참 또는 거짓을 명확하게 판별할 수 있는 문장이나 식', memo: '「아름답다」 · 「높다」처럼 기준이 사람마다 다르면 명제가 아님' },
  { id: 'cond', sym: '조건', easy: 'x가 정해져야 참 · 거짓이 정해지는 말', def: '변수의 값에 따라 참, 거짓을 판별할 수 있는 문장이나 식', memo: '「x는 3의 배수」 → x = 6이면 참, x = 5이면 거짓' },
  { id: 'truth', sym: '진리집합 P', easy: 'U에서 조건을 통과한 것만 모은 집합', def: '전체집합 U의 원소 중 조건 p를 참이 되게 하는 모든 원소의 집합', memo: 'U가 바뀌면 진리집합도 바뀜(x² = 4 → 자연수면 {2}, 정수면 {−2, 2}) · ~p의 진리집합 = Pᶜ' },
  { id: 'imp', sym: 'p → q', easy: 'p이면 q (p일 때 꼭 q)', def: '명제 「p이면 q이다」를 기호로 나타낸 것 · p = 가정, q = 결론', memo: 'P ⊂ Q이면 참 · 하나라도 어긋나면 거짓' },
  { id: 'counter', sym: '반례', easy: '「아닌데?」 하나면 끝', def: '명제가 거짓임을 보이는 예', memo: '「소수는 홀수」 → 2' },
  { id: 'conv', sym: '역', easy: '앞뒤를 바꾼 말', def: 'p → q의 가정과 결론을 서로 바꾼 명제 q → p', memo: '원래가 참이어도 역은 거짓일 수 있음' },
  { id: 'contra', sym: '대우', easy: '앞뒤를 바꾸고 둘 다 뒤집은 말', def: 'p → q의 가정과 결론을 각각 부정하여 서로 바꾼 명제 ~q → ~p', memo: '원래 명제와 참 · 거짓이 같음' },
  // 📖 10 ~ 13차시 (#49 ② · SYMBOL-TALK.md 「10 ~ 13차시」 절 9줄 그대로 · 2026-11-17 선생님 「컨펌」)
  { id: 'all', sym: '모든 x 에 대하여', easy: '하나도 빠짐없이 전부', def: '전체집합의 모든 원소에 대하여 성립한다', memo: '부정 = 「어떤 x 에 대하여 ~p」' },
  { id: 'some', sym: '어떤 x 에 대하여', easy: '딱 하나라도 있으면 OK', def: '전체집합의 원소 중 적어도 하나에 대하여 성립한다', memo: '부정 = 「모든 x 에 대하여 ~p」' },
  { id: 'dimp', sym: 'p ⇒ q', easy: '「p이면 q」가 참! (줄 하나 더 = 확신)', def: '명제 p → q 가 참일 때 p ⇒ q 로 나타낸다', memo: 'P ⊂ Q 와 같은 뜻 · 거짓이면 ⇒ 를 쓰지 않음' },
  { id: 'suff', sym: '충분조건', easy: '화살을 쏘는 쪽 (출발 = 충분 · ㅊ)', def: 'p ⇒ q 일 때 p 는 q 이기 위한 충분조건', memo: '주어가 화살을 쏘면 충분 · 진리집합이 안쪽(P ⊂ Q 의 P)' },
  { id: 'need', sym: '필요조건', easy: '화살을 맞는 쪽 (피 = 필요 · ㅍ)', def: 'p ⇒ q 일 때 q 는 p 이기 위한 필요조건', memo: '주어가 화살을 맞으면 필요 · 진리집합이 바깥쪽(P ⊂ Q 의 Q)' },
  { id: 'iff', sym: 'p ⇔ q', easy: '서로 쏘고 서로 맞는다 = 진리집합이 똑같다', def: 'p ⇒ q 이고 q ⇒ p 일 때 p ⇔ q · p 는 q 이기 위한 필요충분조건', memo: 'P = Q · 「나도 너를 포함 · 너도 나를 포함」' },
  { id: 'absurd', sym: '귀류법', easy: '「아니라고 치자」 → 말이 안 됨 → 그러니 맞다', def: '명제의 결론을 부정하여 가정이나 이미 알려진 사실에 모순됨을 보여 원래 명제가 참임을 증명하는 방법', memo: '첫 줄 = 결론을 부정하기 · 끝 줄 = 「모순이므로」' },
  { id: 'absineq', sym: '절대부등식', easy: '문자에 무엇을 넣어도 늘 참인 부등식', def: '부등식의 문자에 어떤 실수를 대입해도 항상 성립하는 부등식', memo: '예 x² ≥ 0 · 등호가 언제 성립하는지 꼭 적기' },
  { id: 'amgm', sym: '(a + b)/2 ≥ √(ab)', easy: '양수 둘: 더해서 반 ≥ 곱해서 루트', def: 'a > 0, b > 0 일 때 산술평균은 기하평균보다 크거나 같다', memo: '등호 = a = b 일 때 · 양수일 때만 씀' },
];
export const BY: Record<string, SymRow> = Object.fromEntries([...ROWS, ...CONCEPTS, ...PROP].map((r) => [r.id, r]));
/** 명제 낱말 · 기호를 붙이는 차시 = 명제 차시(8차시부터 · 성채 제외) + 성채 2층(명제 방) + 3층(대단원 · 📜 #51 2026-11-17 선생님 「3층 켜기」) */
export const propOn = (L: { id: string; no?: number; kind?: string } | null | undefined): boolean => !!L && (L.id === 'eval-2' || L.id === 'eval-3' || (!/^eval-/.test(L.id) && L.kind !== 'castle' && Number(L.no) >= 8));
// 긴 낱말 먼저: 필요충분조건(⇔ 줄) → 충분조건 · 필요조건 → 조건 · ⇒ · ⇔ 는 → 와 다른 글자 · 산술기하 = 그 식 꼴 또는 「산술평균」 · 「기하평균」
const AMGM = String.raw`\(\s*[a-z]\s*\+\s*[a-z]\s*\)\s*\/\s*2\s*≥\s*√\s*\(?\s*[a-z]\s*[a-z]\s*\)?|산술평균|기하평균`;
const PROPRE = new RegExp(String.raw`~(?=\s*[pqr](?![A-Za-z]))|(?<=~?[pqr] )→(?= ~?[pqr](?![A-Za-z]))|⇔|⇒|모든\s*[a-z]\s*에\s*대하여|어떤\s*[a-z]\s*에\s*대하여|필요충분조건|충분조건|필요조건|귀류법|절대부등식|${AMGM}|반례|(?<![가-힣])대우(?=[은는이가를와의도]|[\s」:.,]|$)|(?<![가-힣])역(?=[은는이을과의도]|[\s」:.,]|$)|진리집합|명제|조건(?!제시)|(?<![A-Za-z])P(?![A-Za-z])`, 'g');
const PROPID: [RegExp, string][] = [[/^~$/, 'neg'], [/^→$/, 'imp'], [/^⇒$/, 'dimp'], [/^⇔$|^필요충분조건$/, 'iff'], [/^모든/, 'all'], [/^어떤/, 'some'], [/^충분조건$/, 'suff'], [/^필요조건$/, 'need'], [/^귀류법$/, 'absurd'], [/^절대부등식$/, 'absineq'], [new RegExp(`^(?:${AMGM})$`), 'amgm'], [/^반례$/, 'counter'], [/^역$/, 'conv'], [/^대우$/, 'contra'], [/^명제$/, 'prop'], [/^조건$/, 'cond']];
/** 명제 낱말 · 기호 찾기 (정식 propHits 그대로 + 10 ~ 13차시 9줄) — 진리집합 기호 P 는 같은 글에 「진리집합」 낱말이 있을 때만 */
export function propHits(t: string, whole = t): { i: number; len: number; id: string }[] {
  const out: { i: number; len: number; id: string }[] = [], tp = /진리집합/.test(whole); PROPRE.lastIndex = 0; let m;
  while ((m = PROPRE.exec(t))) { const w = m[0]; const id = PROPID.find(([r]) => r.test(w))?.[1] ?? 'truth'; if (w === 'P' && !tp) continue; out.push({ i: m.index, len: w.length, id }); }
  return out;
}

const SETR = /[A-ZU)ᶜ}∅]$/;
const before = (t: string, i: number) => t.slice(0, i).replace(/\s+$/, ''), after = (t: string, i: number, n = 1) => t.slice(i + n).replace(/^\s+/, '');
const inNum = (t: string, i: number) => /n\(\s*[^()]*$/.test(t.slice(0, i));
const isDisj = (t: string, i: number) => { const m = /[A-Z](?:ᶜ)?\s*∩\s*[A-Z](?:ᶜ)?\s*=\s*∅/g; let x; while ((x = m.exec(t))) { if (i >= x.index && i < x.index + x[0].length) return true; } return false; };
const setLeft = (t: string, i: number) => { const b = before(t, i); if (!SETR.test(b)) return false; if (/\)$/.test(b)) { const k = b.lastIndexOf('('); if (k > 0 && /n$/.test(b.slice(0, k).replace(/\s+$/, ''))) return false; } return true; };
const setRight = (t: string, i: number, n = 1) => /^[A-Z(∅{]/.test(after(t, i, n)) && !/^n\(/.test(after(t, i, n));
/** 기호 고르기 (정식 pick → #108 ④ / 정식 #109 「형광펜 = 연산 기호만」): 줄 t 의 i 번째 글자가 어떤 기호인지 (null = 칠하지 않음 · 누를 수 없음)
 *  바뀐 점: 집합을 정의하는 { } · | · 「U = {…}」 의 = 와 U 는 칠하지 않음 · 집합끼리의 = (A = B · A ∩ B = ∅)만 칠함 */
export function pick(t: string, i: number): string | null {
  const c = t[i];
  if (c === '∈') return 'in';
  if (c === '∉') return 'notin';
  if (c === '⊂') return 'sub';
  if (c === '⊄') return 'nsub';
  if (c === '∅') return isDisj(t, i) ? 'disj' : 'empty';
  if (c === '∩') return isDisj(t, i) ? 'disj' : 'cap';
  if (c === '∪') return inNum(t, i) ? 'ncup' : 'cup';
  if (c === 'ᶜ') return 'compl';
  if (c === '=') { if (isDisj(t, i)) return 'disj'; return setLeft(t, i) && !inNum(t, i) && /^[A-Z(∅]/.test(after(t, i)) && !/^n\(/.test(after(t, i)) ? 'eq' : null; }
  if (c === '−') return setLeft(t, i) && setRight(t, i) && !inNum(t, i) ? 'diff' : null;
  if (c === 'U') return null; // 전체집합 이름 = 연산 기호 아님 (#108 ④)
  if (c === 'n' && t[i + 1] === '(' && !/[A-Za-z]/.test(t[i - 1] || '')) { const close = t.indexOf(')', i); return /∪/.test(t.slice(i, close < 0 ? undefined : close)) ? 'ncup' : 'n'; }
  if (c === '{' || c === '|') return null; // 집합을 정의하는 { } · | 는 칠하지 않음 (#108 ④)
  return null;
}
const CH = /[∈∉⊂⊄∅∩∪=−ᶜ]|n(?=\()/g;
export type Seg = { text: string; id?: string };
/** 문제 글 → 글 조각 · 기호 조각 (기호 = 한 글자 · ᶜ 는 앞 글자와 함께 「Aᶜ」 로 묶어 누르는 칸을 넓힘) · 끝에 개념 톡 칩 */
export function segments(t: string, o: { prop?: boolean } = {}): Seg[] {
  const hits: { i: number; len: number; id: string }[] = [];
  CH.lastIndex = 0; let m;
  while ((m = CH.exec(t))) {
    const id = pick(t, m.index); if (!id) continue;
    if (id === 'compl' && m.index > 0 && /[A-Z]/.test(t[m.index - 1] as string)) { const prev = hits[hits.length - 1]; if (prev && prev.i === m.index - 1) hits.pop(); hits.push({ i: m.index - 1, len: 2, id }); continue; }
    hits.push({ i: m.index, len: 1, id });
  }
  if (o.prop) { hits.push(...propHits(t)); hits.sort((a, b) => a.i - b.i); } // 📜 #49 명제 차시 = 명제 낱말 · ~ · → 도
  const out: Seg[] = []; let at = 0;
  for (const h of hits) { if (h.i < at) continue; if (h.i > at) out.push({ text: t.slice(at, h.i) }); out.push({ text: t.slice(h.i, h.i + h.len), id: h.id }); at = h.i + h.len; }
  if (at < t.length) out.push({ text: t.slice(at) });
  const c = CONCEPTS.find((x) => x.where.test(t)); if (c) out.push({ text: ' ' }, { text: c.sym, id: c.id });
  return out;
}
