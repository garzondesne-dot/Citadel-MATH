// ⭐ 기호 톡 ↔ 모루 카드 (#129 · DECISIONS 「⭐ 기호 톡 ↔ 모루 연결 다시」) — 기호 톡 줄 id → 그 기호를 만드는 모루 카드
//   카드 id · 이름 · 수식 = 정식 lessons/unit-set.js 그대로 (집합 단원) · 짝이 없는 기호(U · 2ⁿ · n(A ∪ B))는 찜 단추 없음
export interface SymCard { id: string; name: string; fm: string; hint: string }
export const SYM_CARD: Record<string, SymCard> = {
  in: { id: 'belong', name: '속한다', fm: 'a ∈ A', hint: '원소가 집합 안에 쏙 들어간다' },
  notin: { id: 'notbelong', name: '속하지 않는다', fm: 'b ∉ A', hint: '원소가 집합 밖에 있다' },
  list: { id: 'roster', name: '원소나열법', fm: '{1, 2, 4, 8}', hint: '원소를 중괄호에 하나씩 넣어 보자' },
  build: { id: 'builder', name: '조건제시법', fm: '{x | x는 8의 약수}', hint: '성질(조건)을 중괄호에 담아 보자' },
  n: { id: 'count', name: '원소의 개수', fm: 'n(A)', hint: '집합에 n( ) 을 씌워 보자' },
  empty: { id: 'empty', name: '공집합', fm: '∅ , n(∅) = 0', hint: '원소가 하나도 없는 집합에 n( )' },
  sub: { id: 'subset', name: '부분집합', fm: 'A ⊂ B', hint: '두 집합 사이에 ⊂' },
  eq: { id: 'equal', name: '서로 같은 집합', fm: 'A = B', hint: '두 집합 사이에 =' },
  cap: { id: 'inter', name: '교집합', fm: 'A ∩ B', hint: '두 집합의 겹친 곳 ∩' },
  cup: { id: 'union', name: '합집합', fm: 'A ∪ B', hint: '두 집합을 합치는 ∪' },
  disj: { id: 'disjoint', name: '서로소', fm: 'A ∩ B = ∅', hint: '교집합 카드 = 공집합' },
  compl: { id: 'comp', name: '여집합', fm: 'Aᶜ = U − A', hint: '집합에 ᶜ 을 붙여 보자' },
  diff: { id: 'diff', name: '차집합', fm: 'A − B', hint: '두 집합 사이에 −' },
};
/** 아직 안 만든 찜 수 (캠프 모루 이름표 ★n) */
export const wishLeft = (wishes: Record<string, true> | undefined, made: Record<string, true> | undefined) => Object.keys(wishes || {}).filter((sym) => SYM_CARD[sym] && !made?.[SYM_CARD[sym]!.id]).length;
