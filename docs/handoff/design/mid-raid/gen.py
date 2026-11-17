#!/usr/bin/env python3
"""🏰 집합 · 명제 중단원 레이드 2차시 · 차시 팩 만들기 (🌊 설계 묶음 #3 · 설계 방)

python3 gen.py  →  mid-set.json · mid-prop.json  (꼴 = docs/handoff/pack13/ex-13.json · 판 7개 = 첫 판 + 한 번 더 6)
첫 판(판 0) = 교과서 원래 숫자(미래엔 공통수학2 78~79쪽 · 96~97쪽). 판 1~6 = 숫자만 바꿈 · 꼴(type)은 판 0 과 같음.
문항마다 par(숫자 원본)를 같이 넣어 verify.py 가 다른 방법(직접 세기)으로 다시 계산한다.
"""
import json, os, random, math
from math import gcd

HERE = os.path.dirname(os.path.abspath(__file__))
NV = 7
SUB = str.maketrans('0123456789', '₀₁₂₃₄₅₆₇₈₉')
def neg(n): return str(n) if n >= 0 else '−' + str(-n)
def setstr(xs): return '{' + ', '.join(str(x) for x in xs) + '}' if xs else '∅'
def lcm(a, b): return a * b // gcd(a, b)
def divs(n): return [d for d in range(1, n + 1) if n % d == 0]

def shuf(correct, traps, seed):
    ch = [correct] + [t for t in traps if t != correct]
    assert len(set(ch)) == len(ch), ch
    random.Random(seed).shuffle(ch)
    return ch, str(ch.index(correct))
def C(q, correct, traps, sol, seed, **kw):
    ch, a = shuf(correct, traps, seed)
    d = {'type': 'choice', 'q': q, 'a': a, 'ch': ch, 'sol': sol}; d.update(kw); return d
def CF(q, ch, ai, sol, **kw):  # 보기 순서 고정
    d = {'type': 'choice', 'q': q, 'a': str(ai), 'ch': ch, 'sol': sol}; d.update(kw); return d
def M(q, ch, correct, sol, **kw):
    a = ','.join(str(i) for i, c in enumerate(ch) if c in correct)
    assert len(a.split(',')) == len(correct), (ch, correct)
    d = {'type': 'multi', 'q': q, 'a': a, 'ch': [str(c) for c in ch], 'sol': sol}; d.update(kw); return d
def N(q, ans, sol, **kw):
    d = {'type': 'number', 'q': q, 'a': str(ans), 'ch': [], 'sol': sol}; d.update(kw); return d

# ════════════════════════ 집합 ════════════════════════
# 몬스터 1 · 문제 1 (교과서 02) 원소나열법 · 문제 2 (교과서 03) 포함 관계
S02A = [21, 26, 14, 27, 33, 35, 39]
S02B = [(1, 6), (2, 9), (1, 9), (2, 6), (3, 5), (1, 8), (2, 7)]
S03A = [([1, 3, 7, 15], '홀수', 0), ([2, 6, 10, 14], '짝수', 0), ([3, 9, 12, 21], '3의 배수', 0), ([2, 5, 8, 12], '짝수', 3),
        ([4, 8, 20, 28], '4의 배수', 0), ([1, 5, 6, 11], '홀수', 3), ([5, 15, 25, 40], '5의 배수', 0)]
S03B = [(16, [2, 4], 'B'), (20, [4, 5], 'B'), (12, [2, 3], 'A'), (18, [3, 4], 'X'), (24, [3, 8], 'B'), (15, [3, 5], 'A'), (28, [4, 7], 'B')]
PRED = {'홀수': lambda x: x % 2 == 1, '짝수': lambda x: x % 2 == 0, '3의 배수': lambda x: x % 3 == 0,
        '4의 배수': lambda x: x % 4 == 0, '5의 배수': lambda x: x % 5 == 0}
REL = ['A ⊂ B', 'B ⊂ A', 'A = B', '포함 관계가 없다']

def set_m1(v):
    n = S02A[v]; D = divs(n)
    r = random.Random(1100 + v)
    pool = [x for x in range(1, n + 1) if x not in D]
    ch = sorted(D + r.sample(pool, 8 - len(D)))
    r1, r2 = S02B[v]; b, c = r1 + r2, r1 * r2
    ch2 = [neg(-r2), neg(-r1)] + [str(x) for x in range(1, max(7, r2) + 1)]
    A, name, _ = S03A[v]; okA = all(PRED[name](x) for x in A)
    n3, B3, mode = S03B[v]; D3 = divs(n3)
    if mode == 'B':   q4 = f'A = {{x | x는 {n3}의 약수}}, B = {setstr(B3)}'; a4 = 1; s4 = f'{n3} 의 약수 = {setstr(D3)} 가 {setstr(B3)} 를 모두 포함 → B ⊂ A'
    elif mode == 'A': q4 = f'A = {setstr(B3)}, B = {{x | x는 {n3}의 약수}}'; a4 = 0; s4 = f'{setstr(B3)} 의 원소는 모두 {n3} 의 약수 {setstr(D3)} → A ⊂ B'
    else:
        bad = [x for x in B3 if x not in D3][0]
        q4 = f'A = {{x | x는 {n3}의 약수}}, B = {setstr(B3)}'; a4 = 3; s4 = f'{bad} 는 {n3} 의 약수가 아니고, {n3} 의 약수가 모두 B 에 있지도 않다 → 포함 관계가 없다'
    return [
        M(f'문제 1) 다음 집합을 원소나열법으로 나타내시오.\n⑴ {{x | x는 {n}의 약수}} — 원소를 모두 고르시오.', ch, D, f'{n} 의 약수 → {setstr(D)}', ref='02 ⑴', par={'k': 'div', 'n': n}),
        M(f'문제 1) 다음 집합을 원소나열법으로 나타내시오.\n⑵ {{x | x² − {b}x + {c} = 0}} — 원소를 모두 고르시오.', ch2, [str(r1), str(r2)],
          f'(x − {r1})(x − {r2}) = 0 → x = {r1} 또는 {r2} → {setstr([r1, r2])}', ref='02 ⑵', par={'k': 'quad', 'b': b, 'c': c}),
        CF(f'문제 2) 두 집합 A 와 B 사이의 포함 관계는?\n⑴ A = {setstr(A)}, B = {{x | x는 {name}}}', REL, 0 if okA else 3,
           (f'{setstr(A)} 의 원소는 모두 {name} → A ⊂ B' if okA else f'{[x for x in A if not PRED[name](x)][0]} 은(는) {name}가 아니다 → 포함 관계가 없다'),
           ref='03 ⑴', par={'k': 'relpred', 'A': A, 'pred': name}),
        CF(f'문제 2) 두 집합 A 와 B 사이의 포함 관계는?\n⑵ {q4}', REL, a4, s4, ref='03 ⑵', par={'k': 'reldiv', 'n': n3, 'S': B3, 'mode': mode}),
    ]

# 몬스터 2 · 문제 3 (교과서 05) 교 · 합 · 여 · 차집합
S05 = [([1, 5, 9, 10], 10), ([2, 3, 6, 9], 6), ([1, 4, 7, 8], 8), ([3, 6, 8, 9], 9), ([1, 2, 6, 7], 6), ([4, 5, 8, 10], 8), ([1, 3, 5, 9], 9)]
def set_m2(v):
    A, n = S05[v]; U = list(range(1, 11)); B = divs(n)
    I = [x for x in A if x in B]; Un = sorted(set(A) | set(B)); Ac = [x for x in U if x not in A]; Df = [x for x in A if x not in B]
    head = f'문제 3) U = {{1, 2, 3, …, 10}}, A = {setstr(A)}, B = {{x | x는 {n}의 약수}} 일 때'
    par = {'k': 'ops', 'A': A, 'n': n}
    return [
        M(f'{head}\n⑴ A ∩ B 의 원소를 모두 고르시오.', U, I, f'B = {setstr(B)} → 둘 다 있는 것 → A ∩ B = {setstr(I)}', ref='05 ⑴', par=dict(par, op='i')),
        M(f'{head}\n⑵ A ∪ B 의 원소를 모두 고르시오.', U, Un, f'B = {setstr(B)} → 모두 모으기 → A ∪ B = {setstr(Un)}', ref='05 ⑵', par=dict(par, op='u')),
        M(f'{head}\n⑶ Aᶜ 의 원소를 모두 고르시오.', U, Ac, f'U 에서 A 를 빼기 → Aᶜ = {setstr(Ac)}', ref='05 ⑶', par=dict(par, op='c')),
        M(f'{head}\n⑷ A − B 의 원소를 모두 고르시오.', U, Df, f'B = {setstr(B)} → A 에서 B 에 있는 것 빼기 → A − B = {setstr(Df)}', ref='05 ⑷', par=dict(par, op='d')),
    ]

# 몬스터 3 (산 · ⚔ 소레이드) · 문제 4 (교과서 10) 여집합의 원소의 개수
S10 = [(30, 6, 24), (40, 5, 20), (36, 9, 18), (50, 10, 20), (24, 4, 12), (45, 3, 18), (42, 7, 28)]
def set_m3(v):
    u, a, b = S10[v]
    A = [x for x in range(1, u + 1) if x % a == 0]; B = [x for x in divs(b) if x <= u]
    I = [x for x in A if x in B]; nA, nB, nI = len(A), len(B), len(I); nU = nA + nB - nI
    P = f'문제 4) U = {{x | x는 {u} 이하의 자연수}}, A = {{x | x는 {a}의 배수}}, B = {{x | x는 {b}의 약수}} 일 때 n(Aᶜ ∩ Bᶜ)'
    par = {'k': 'comp', 'u': u, 'a': a, 'b': b}
    WHY1 = {'pre': '∵ n(A ∪ B) = n(A) + n(B) −', 'post': '(합집합의 원소의 개수)', 'choices': ['n(A ∩ B)', 'n(A ∪ B)', 'n(U)'], 'answer': 0,
            'text': '∵ n(A ∪ B) = n(A) + n(B) − n(A ∩ B) (합집합의 원소의 개수)'}
    WHY2 = {'pre': '∵ n(Xᶜ) = n(U) −', 'post': '(여집합의 원소의 개수)', 'choices': ['n(X)', 'n(Xᶜ)', 'n(∅)'], 'answer': 0,
            'text': '∵ n(Xᶜ) = n(U) − n(X) (여집합의 원소의 개수)'}
    pairs = [f'n(A) = {x}, n(B) = {y}' for x, y in [(nA, nB), (nA + 1, nB), (nA, nB - 1), (nA + 1, nB - 1)]]
    return [
        C(f'{P}\nAᶜ ∩ Bᶜ 와 같은 집합은?', '(A ∪ B)ᶜ', ['(A ∩ B)ᶜ', 'A ∪ B'], '드모르간의 법칙 : Aᶜ ∩ Bᶜ = (A ∪ B)ᶜ', 1300 + v,
          say='드모르간의 법칙에 의해 Aᶜ ∩ Bᶜ = (A ∪ B)ᶜ 이다.', par=dict(par, step=1)),
        C(f'{P}\nn(A), n(B) 는?', pairs[0], pairs[1:], f'A = {setstr(A)} · B = {setstr(B)}', 1310 + v,
          say=f'A = {setstr(A)} 이므로 n(A) = {nA}, B = {setstr(B)} 이므로 n(B) = {nB} 이다.', par=dict(par, step=2)),
        N(f'{P}\nn(A ∪ B) 의 값은?', nU, f'A ∩ B = {setstr(I)} → {nA} + {nB} − {nI} = {nU}',
          say=f'A ∩ B = {setstr(I)} 이므로 n(A ∪ B) = {nA} + {nB} − {nI} = {nU} 이다.', why=WHY1, par=dict(par, step=3)),
        N(f'{P}\n그러므로 n(Aᶜ ∩ Bᶜ) 의 값은?', u - nU, f'{u} − {nU} = {u - nU}',
          say=f'그러므로 n(Aᶜ ∩ Bᶜ) = n(U) − n(A ∪ B) = {u} − {nU} = {u - nU} 이다.', why=WHY2, par=dict(par, step=4)),
    ]

# 형성평가 4 = 교과서 01 · 04 · 06 · 09
SETQ = [('키가 큰 학생의 모임', False), ('10보다 작은 짝수의 모임', True), ('예쁜 꽃의 모임', False), ('100에 가까운 자연수의 모임', False),
        ('12의 약수의 모임', True), ('노래를 잘하는 가수의 모임', False), ('한 자리 소수의 모임', True), ('유명한 수학자의 모임', False),
        ('20 이하의 3의 배수의 모임', True), ('우리 반에서 안경을 쓴 학생의 모임', True), ('맛있는 음식의 모임', False), ('7보다 작은 자연수의 모임', True)]
S04 = [(18, 23, 30), (15, 20, 27), (12, 19, 25), (24, 17, 33), (20, 26, 38), (14, 22, 29), (25, 16, 34)]
S06 = [(5, [1, 2, 4]), (6, [1, 2, 3, 5]), (5, [2, 3, 5]), (6, [2, 4, 5, 6]), (5, [1, 3, 4]), (6, [1, 3, 4, 6]), (5, [1, 2, 5])]
S09 = [(10, 3, 8), (4, 6, 10), (8, 3, 5), (9, 2, 5), (12, 5, 8), (5, 4, 6), (15, 2, 4)]
def set_boss(v):
    r = random.Random(1500 + v)
    if v == 0: opts = [('인구수가 많은 나라의 모임', False), ('π보다 작은 자연수의 모임', True), ('1에 가까운 실수의 모임', False)]
    else:
        while True:
            opts = r.sample(SETQ, 3)
            if 1 <= sum(o[1] for o in opts) <= 2: break
    lab = [f'{"⑴⑵⑶"[i]} {t}' for i, (t, _) in enumerate(opts)]; good = [lab[i] for i, (_, ok) in enumerate(opts) if ok]
    b1 = M('1. 다음에서 집합인 것을 모두 고르시오.', lab, good, '대상이 분명하게 정해지는 모임만 집합 · 「많은 · 가까운 · 큰 · 예쁜」은 기준이 사람마다 다르다', ref='01', par={'k': 'isset', 'truth': [ok for _, ok in opts]})
    a, b, u = S04[v]
    b2 = N(f'2. 두 집합 A 와 B 에 대하여 n(A) = {a}, n(B) = {b}, n(A ∪ B) = {u} 일 때 n(A ∩ B) 는?', a + b - u, f'n(A ∩ B) = n(A) + n(B) − n(A ∪ B) = {a} + {b} − {u} = {a + b - u}', ref='04', par={'k': 'inter', 'a': a, 'b': b, 'u': u})
    n, A = S06[v]; rest = [x for x in range(1, n + 1) if x not in A]; x, y = rest
    good6 = ['∅', setstr([x]), setstr([y]), setstr([x, y])]
    traps = [setstr([A[0], x]), setstr([A[1]]), setstr(sorted([A[-1], y])), setstr(sorted([A[0], A[1]]))]
    ch6 = good6 + traps; random.Random(1560 + v).shuffle(ch6)
    b3 = M(f'3. 전체집합 U = {setstr(range(1, n + 1))} 의 부분집합 중에서 집합 A = {setstr(A)} 와 서로소인 집합을 모두 고르시오.', ch6, good6,
           f'A 와 겹치지 않으려면 U − A = {setstr(rest)} 의 부분집합 → ∅, {setstr([x])}, {setstr([y])}, {setstr([x, y])} (4개)', ref='06', par={'k': 'disj', 'n': n, 'A': A})
    p, q, t = S09[v]; n1, n2, n3 = 100 // lcm(p, q), 100 // lcm(p, t), 100 // lcm(lcm(p, q), t)
    sp, sq_, st = (str(z).translate(SUB) for z in (p, q, t))
    b4 = N(f'4. 100 이하의 자연수 중에서 자연수 k 의 배수의 집합을 Aₖ 로 나타낼 때, n(A{sp} ∩ (A{sq_} ∪ A{st})) 의 값은?', n1 + n2 - n3,
           f'A{sp} ∩ (A{sq_} ∪ A{st}) = A{str(lcm(p, q)).translate(SUB)} ∪ A{str(lcm(p, t)).translate(SUB)} → {n1} + {n2} − {n3} = {n1 + n2 - n3}', ref='09', par={'k': 'mult', 'p': p, 'q': q, 't': t})
    return [b1, b2, b3, b4]

# ════════════════════════ 명제 ════════════════════════
# 몬스터 1 · 문제 1 (교과서 02) 진리집합 · 문제 2 (교과서 05) 「모든 · 어떤」의 부정
P02 = [(7, 2, 4, 3), (8, 3, 5, 2), (9, 2, 7, 4), (7, 1, 5, 6), (8, 2, 6, 5), (9, 4, 5, 1), (7, 3, 6, 2)]
P05A = [(1, 1), (2, 3), (4, 5), (4, 7), (6, 10), (2, 5), (6, 12)]
P05B = [(3, 2), (2, 7), (5, 3), (4, 3), (2, 9), (5, 1), (3, 7)]
def lin(b, c): return ('' if b == 1 else str(b)) + f'x − {c}'
def prop_m1(v):
    n, r1, r2, t = P02[v]; U = list(range(1, n + 1)); Pset = [r1, r2]; Q = [x for x in U if x != t]
    head = f'문제 1) U = {{x | x는 {n} 이하의 자연수}}, p: x² − {r1 + r2}x + {r1 * r2} = 0, q: x² − {2 * t}x + {t * t} > 0 일 때'
    par = {'k': 'truth', 'n': n, 'b': r1 + r2, 'c': r1 * r2, 't2': 2 * t, 'tt': t * t}
    it = [
        M(f'{head}\n⑴ 조건 p 의 진리집합의 원소를 모두 고르시오.', U, Pset, f'(x − {r1})(x − {r2}) = 0 → P = {setstr(Pset)}', ref='02 ⑴', par=dict(par, w='p')),
        M(f'{head}\n⑵ 조건 q 의 진리집합의 원소를 모두 고르시오.', U, Q, f'(x − {t})² > 0 → x ≠ {t} → Q = {setstr(Q)}', ref='02 ⑵', par=dict(par, w='q')),
        M(f'{head}\n⑶ 조건 ~p 의 진리집합의 원소를 모두 고르시오.', U, [x for x in U if x not in Pset], f'Pᶜ = {setstr([x for x in U if x not in Pset])}', ref='02 ⑶', par=dict(par, w='np')),
        M(f'{head}\n⑷ 조건 ~q 의 진리집합의 원소를 모두 고르시오.', U, [t], f'Qᶜ = {setstr([t])}', ref='02 ⑷', par=dict(par, w='nq')),
    ]
    b, c = P05A[v]; e = lin(b, c); h = b // 2 if b % 2 == 0 else None
    why = (f'x² − {b}x + {c} = (x − {h})² + {c - h * h} > 0' if h else f'x² − x + {c} = (x − 1/2)² + {c}−1/4 > 0')
    it.append(C(f'문제 2) 다음 명제의 부정과 그 참 · 거짓으로 알맞은 것은?\n⑴ 모든 실수 x에 대하여 x² > {e}이다.',
                f'어떤 실수 x에 대하여 x² ≤ {e} — 거짓',
                [f'어떤 실수 x에 대하여 x² ≤ {e} — 참', f'어떤 실수 x에 대하여 x² < {e} — 거짓', f'모든 실수 x에 대하여 x² ≤ {e} — 거짓'],
                f'「모든」 ↔ 「어떤」 · > 의 부정은 ≤ · {why} 이 늘 참 → 처음 명제가 참 → 부정은 거짓', 2100 + v, ref='05 ⑴', par={'k': 'negall', 'b': b, 'c': c}))
    m, k = P05B[v]; e2 = f'|{m}x − {k}|'
    it.append(C(f'문제 2) 다음 명제의 부정과 그 참 · 거짓으로 알맞은 것은?\n⑵ 어떤 실수 x에 대하여 {e2} < 0이다.',
                f'모든 실수 x에 대하여 {e2} ≥ 0 — 참',
                [f'모든 실수 x에 대하여 {e2} ≥ 0 — 거짓', f'모든 실수 x에 대하여 {e2} > 0 — 참', f'어떤 실수 x에 대하여 {e2} ≥ 0 — 거짓'],
                '「어떤」 ↔ 「모든」 · < 의 부정은 ≥ · 절댓값은 늘 0 이상 → 부정은 참', 2110 + v, ref='05 ⑵', par={'k': 'negsome', 'm': m, 'n': k}))
    return it

# 몬스터 2 · 문제 3 (교과서 03) 역과 대우 · 문제 4 (교과서 04) 충분 · 필요 · 필요충분
P03A = [('자연수', '유리수'), ('자연수', '정수'), ('정수', '실수'), ('유리수', '실수'), ('4의 배수', '2의 배수'), ('6의 배수', '3의 배수'), ('9의 배수', '3의 배수')]
P03B = [1, 2, 3, 6, 4, 7, 5]
def josa(w): return '이' if (ord(w[-1]) - 0xAC00) % 28 else '가'
def prop_m2(v):
    s, t = P03A[v]
    orig = f'x가 {s}이면 x는 {t}이다.'
    conv = f'x가 {t}이면 x는 {s}이다'; contra = f'x가 {t}{josa(t)} 아니면 x는 {s}{josa(s)} 아니다'
    k = P03B[v]; f = f'x {"+" if k > 0 else "−"} {abs(k)}'
    o2 = f'x({f}) = 0이면 {f} = 0이다.'
    conv2 = f'{f} = 0 이면 x({f}) = 0 이다'; contra2 = f'{f} ≠ 0 이면 x({f}) ≠ 0 이다'
    def four(right, rt, other, seed):
        return C('', f'{right} — {"참" if rt else "거짓"}', [f'{right} — {"거짓" if rt else "참"}', f'{other} — 참', f'{other} — 거짓'], '', seed)
    def mk(q, right, rt, other, sol, seed, **kw):
        d = four(right, rt, other, seed); d['q'] = q; d['sol'] = sol; d.update(kw); return d
    it = [
        mk(f'문제 3) 다음 명제의 역과 그 참 · 거짓으로 알맞은 것은?\n⑴ {orig}', conv, False, contra, f'역 = 가정과 결론을 바꿈 → {conv} (거짓 · {t}이지만 {s}{josa(s)} 아닌 수가 있다)', 2200 + v, ref='03 ⑴', par={'k': 'conv', 'S': s, 'T': t, 'w': 'conv'}),
        mk(f'문제 3) 다음 명제의 대우와 그 참 · 거짓으로 알맞은 것은?\n⑴ {orig}', contra, True, conv, f'대우 = 바꾸고 둘 다 부정 → {contra} (참 · 처음 명제와 참 · 거짓이 같다)', 2210 + v, ref='03 ⑴', par={'k': 'conv', 'S': s, 'T': t, 'w': 'contra'}),
        mk(f'문제 3) 다음 명제의 역과 그 참 · 거짓으로 알맞은 것은?\n⑵ {o2}', conv2, True, contra2, f'역 = 가정과 결론을 바꿈 → {conv2} (참)', 2220 + v, ref='03 ⑵', par={'k': 'zero', 'kk': k, 'w': 'conv'}),
        mk(f'문제 3) 다음 명제의 대우와 그 참 · 거짓으로 알맞은 것은?\n⑵ {o2}', contra2, False, conv2, f'대우 = 바꾸고 둘 다 부정 → {contra2} (거짓 · 반례 x = 0)', 2230 + v, ref='03 ⑵', par={'k': 'zero', 'kk': k, 'w': 'contra'}),
    ]
    KIND = ['충분조건', '필요조건', '필요충분조건', '아무것도 아니다']
    A4 = [(1, -3, 0, 'n'), (2, -5, 0, 'n'), (0, -5, -2, 's'), (3, -1, 2, 'n'), (4, 0, 3, 's'), (-1, -6, -3, 'n'), (5, 1, 4, 's')]
    u, lo, hi, m = A4[v]
    if m == 'n': q1 = f'p: x ≤ {neg(u)}, q: {neg(lo)} ≤ x ≤ {neg(hi)}'; a1 = 1; s1 = f'Q = {{x | {neg(lo)} ≤ x ≤ {neg(hi)}}} ⊂ P = {{x | x ≤ {neg(u)}}} → q ⇒ p → p 는 필요조건'
    else:        q1 = f'p: {neg(lo)} ≤ x ≤ {neg(hi)}, q: x ≤ {neg(u)}'; a1 = 0; s1 = f'P = {{x | {neg(lo)} ≤ x ≤ {neg(hi)}}} ⊂ Q = {{x | x ≤ {neg(u)}}} → p ⇒ q → p 는 충분조건'
    B4 = [('a = b', 'a² = b²', 0, 'a = b 이면 a² = b² (참) · 거꾸로는 a = 1, b = −1 반례 → 충분조건'),
          ('a² = b²', 'a = b', 1, 'a = b 이면 a² = b² 이므로 q ⇒ p · p ⇒ q 는 a = 1, b = −1 반례 → 필요조건'),
          ('x = 2', 'x² = 4', 0, 'x = 2 이면 x² = 4 (참) · 거꾸로는 x = −2 반례 → 충분조건'),
          ('x² = 9', 'x = 3', 1, 'x = 3 이면 x² = 9 이므로 q ⇒ p · p ⇒ q 는 x = −3 반례 → 필요조건'),
          ('a = 0', 'ab = 0', 0, 'a = 0 이면 ab = 0 (참) · 거꾸로는 a = 1, b = 0 반례 → 충분조건'),
          ('ab = 0', 'a = 0', 1, 'a = 0 이면 ab = 0 이므로 q ⇒ p · p ⇒ q 는 a = 1, b = 0 반례 → 필요조건'),
          ('x > 3', 'x > 1', 0, 'x > 3 이면 x > 1 (참) · 거꾸로는 x = 2 반례 → 충분조건')]
    p2, q2, a2, s2 = B4[v]
    C4 = [('|x| ≤ 1', '−1 ≤ x ≤ 1'), ('|x| ≤ 7', '−7 ≤ x ≤ 7'), ('x² = 1', '|x| = 1'), ('|x| ≤ 8', '−8 ≤ x ≤ 8'), ('x² ≤ 9', '−3 ≤ x ≤ 3'), ('|x| = 2', 'x² = 4'), ('|x| ≤ 6', '−6 ≤ x ≤ 6')]
    p3, q3 = C4[v]
    Q = '문제 4) 두 조건 p 와 q 가 다음과 같을 때, p 는 q 이기 위한 어떤 조건인가?'
    it += [
        CF(f'{Q}\n⑴ {q1}', KIND, a1, s1, ref='04 ⑴', par={'k': 'cond', 'p': q1.split(', q: ')[0][3:], 'q': q1.split(', q: ')[1]}),
        CF(f'{Q}\n⑵ p: {p2}, q: {q2}', KIND, a2, s2, ref='04 ⑵', par={'k': 'cond', 'p': p2, 'q': q2}),
        CF(f'{Q}\n⑶ p: {p3}, q: {q3}', KIND, 2, f'{p3} ⇔ {q3} → 필요충분조건', ref='04 ⑶', par={'k': 'cond', 'p': p3, 'q': q3}),
    ]
    return it

# 몬스터 3 (산 · ⚔ 소레이드) · 문제 5 (교과서 08) 충분조건이 되는 a
P08 = [(1, 9), (2, 8), (3, 7), (1, 6), (2, 10), (4, 9), (3, 11)]
def prop_m3(v):
    m, n = P08[v]
    P = f'문제 5) 실수 x 에 대하여 두 조건 p: x² − {m + n}x + {m * n} ≤ 0, q: x ≤ a 일 때, p 가 q 이기 위한 충분조건이 되도록 하는 실수 a 의 값의 범위'
    par = {'k': 'suff', 'b': m + n, 'c': m * n}
    WHY = {'pre': '∵ 명제 p → q 가', 'post': '이면 p 는 q 이기 위한 충분조건', 'choices': ['참', '거짓', '조건'], 'answer': 0, 'text': '∵ 명제 p → q 가 참이면 p 는 q 이기 위한 충분조건'}
    return [
        C(f'{P}\n조건 p 의 진리집합 P 는?', f'{{x | {m} ≤ x ≤ {n}}}', [f'{{x | x ≤ {m} 또는 x ≥ {n}}}', f'{{x | −{n} ≤ x ≤ −{m}}}'],
          f'x² − {m + n}x + {m * n} = (x − {m})(x − {n}) ≤ 0 → {m} ≤ x ≤ {n}', 2300 + v,
          say=f'x² − {m + n}x + {m * n} = (x − {m})(x − {n}) ≤ 0 이므로 P = {{x | {m} ≤ x ≤ {n}}} 이다.', par=dict(par, step=1)),
        C(f'{P}\n「p 가 q 이기 위한 충분조건」을 진리집합 P, Q 로 나타내면?', 'P ⊂ Q', ['Q ⊂ P', 'P = Q'],
          '충분조건 ⇔ p ⇒ q ⇔ P ⊂ Q', 2310 + v, say='p 가 q 이기 위한 충분조건이려면 p ⇒ q, 즉 P ⊂ Q 이어야 한다.', why=WHY, par=dict(par, step=2)),
        C(f'{P}\nQ = {{x | x ≤ a}} 가 P 를 모두 포함하려면, P 의 원소 중 꼭 Q 에 들어가야 하는 것은?', f'가장 큰 수 {n}', [f'가장 작은 수 {m}', f'가운데 수 {(m + n) // 2}'],
          f'x ≤ a 는 왼쪽으로 뻗은 집합 → P 의 가장 큰 수 {n} 만 들어가면 나머지도 모두 들어간다', 2320 + v, say=f'Q = {{x | x ≤ a}} 가 P 를 모두 포함하려면 P 에서 가장 큰 수({n})가 Q 에 들어가야 한다.', par=dict(par, step=3)),
        C(f'{P}\n그러므로 실수 a 의 값의 범위는?', f'a ≥ {n}', [f'a ≤ {n}', f'a ≥ {m}', f'a ≤ {m}'],
          f'P ⊂ Q ⇔ {n} ≤ a', 2330 + v, say=f'그러므로 구하는 a 의 값의 범위는 a ≥ {n} 이다.', par=dict(par, step=4)),
    ]

# 형성평가 4 = 교과서 01 · 06 · 07 · 10
PT = ['√16 은 유리수이다.', '2는 소수이다.', '12는 4의 배수이다.', '정삼각형의 세 변의 길이는 같다.', '7은 홀수이다.', '3 + 4 = 7이다.']
PF = ['15는 4의 배수이다.', '9는 소수이다.', '√2 는 유리수이다.', '1은 2보다 크다.', '10은 3의 배수이다.', '2 × 3 = 5이다.']
PC = ['x는 10보다 작은 수이다.', 'x는 3의 배수이다.', 'x + 2 = 5이다.', 'x는 짝수이다.', 'x는 20의 약수이다.', '2x > 6이다.']
PN = ['수학은 재미있는 과목이다.', '장미는 예쁜 꽃이다.', '100은 큰 수이다.', '우리 학교는 좋은 학교이다.', '봄은 따뜻한 계절이다.', '치킨은 맛있는 음식이다.']
TRUE6 = ['P ⊂ Qᶜ', 'Q ⊂ Pᶜ', 'P ∩ Q = ∅', 'Pᶜ ∩ Q = Q', 'P ∩ Qᶜ = P', 'Pᶜ ∪ Qᶜ = U', 'P − Q = P']
FALSE6 = ['P ∩ Q = Q', 'P ⊂ Q', 'P ∪ Q = U', 'Pᶜ ⊂ Q', 'Q ⊂ P', 'P ∪ Q = P']
P07 = [(2, 3, 4), (2, 1, 6), (3, 1, 7), (2, 5, 4), (3, 4, 6), (4, 2, 9), (2, -2, 7)]
P10 = [(1, 4, 5), (1, 2, 3), (2, 3, 6), (3, 2, 6), (2, 1, 7), (3, 4, 6), (1, 3, 8)]
def prop_boss(v):
    r = random.Random(2500 + v); circ = '⑴⑵⑶⑷'
    if v == 0: items = [('√4 는 유리수이다.', 'T'), ('x는 100보다 큰 수이다.', 'C'), ('26은 3의 배수이다.', 'F'), ('우리나라는 아름다운 나라이다.', 'N')]
    else:
        items = [(PT[v - 1], 'T'), (PC[v - 1], 'C'), (PF[v - 1], 'F'), (PN[v - 1], 'N')]; r.shuffle(items)
    pos = {k: circ[i] for i, (_, k) in enumerate(items)}
    def lab(d): return ' · '.join(f'{circ[i]} {d[k]}' for i, (_, k) in enumerate(items) if k in d)
    right = lab({'T': '참', 'F': '거짓'})
    traps = [lab({'T': '참', 'F': '참'}), lab({'T': '참', 'F': '거짓', 'C': '거짓'}), lab({'T': '참', 'F': '거짓', 'N': '참'})]
    b1 = C('1. 다음에서 명제를 모두 찾고, 그 참 · 거짓을 바르게 판별한 것은?\n' + ' '.join(f'{circ[i]} {t}' for i, (t, _) in enumerate(items)), right, traps,
           f'참 · 거짓을 분명히 가릴 수 있는 문장만 명제 → {right} ({pos["C"]} 는 x 에 따라 달라지는 조건 · {pos["N"]} 는 기준이 사람마다 다름)', 2510 + v, ref='01', par={'k': 'isprop', 'kinds': [k for _, k in items]})
    if v == 0: st = [('P ⊂ Qᶜ', True), ('P ∩ Q = Q', False), ('Pᶜ ∩ Q = Q', True), ('Pᶜ ∪ Qᶜ = U', True)]
    else:
        nt = [3, 2, 1, 2, 3, 2][v - 1]
        st = [(s, True) for s in r.sample(TRUE6, nt)] + [(s, False) for s in r.sample(FALSE6, 4 - nt)]; r.shuffle(st)
    lab6 = [f'{"ㄱㄴㄷㄹ"[i]}. {s}' for i, (s, _) in enumerate(st)]; good = [lab6[i] for i, (_, ok) in enumerate(st) if ok]
    b2 = M('2. 전체집합 U 에 대하여 두 조건 p 와 q 의 진리집합을 각각 P 와 Q 라 하자. 명제 p → ~q 가 참일 때, 옳은 것을 모두 고르시오.', lab6, good,
           'p → ~q 참 ⇔ P ⊂ Qᶜ ⇔ P ∩ Q = ∅ → ' + ', '.join(g[0] for g in good), ref='06', par={'k': 'pnq', 'st': [s for s, _ in st]})
    k, c, rr = P07[v]; lo, hi = c - rr, c + rr; need = max(abs(lo), abs(hi)); amin = -(-need // k)
    ab = f'|x {"−" if c > 0 else "+"} {abs(c)}|'
    b3 = N(f'3. 실수 x 에 대하여 두 조건 p: x² − {k * k}a² ≤ 0, q: {ab} ≤ {rr} 일 때, 명제 p → q 의 역이 참이 되도록 하는 자연수 a 의 최솟값은? (풀이는 학습지에)', amin,
           f'p: −{k}a ≤ x ≤ {k}a · q: {neg(lo)} ≤ x ≤ {hi} · 역 q → p 참 ⇔ Q ⊂ P ⇔ {k}a ≥ {need} → a 의 최솟값 {amin}', ref='07', par={'k': 'convmin', 'kk': k, 'c': c, 'r': rr})
    kk, cc, s = P10[v]
    Mx = -(kk * kk // cc) - 1 if (kk * kk) % cc == 0 else -(kk * kk // cc) - 1
    b4 = N(f'4. 실수 x 에 대하여 두 조건 p: ax² + {2 * kk}x − {cc} ≥ 0, q: x² + 2bx + {s * s} > 0 이다. (가) 어떤 실수 x 에 대하여 p 이다. (나) ~p 는 q 이기 위한 충분조건이다. — 두 명제가 모두 거짓이 되도록 하는 정수 a 의 최댓값을 M, 자연수 b 의 최솟값을 m 이라 할 때 M + m 의 값은? (풀이는 학습지에)', Mx + s,
           f'(가) 거짓 ⇔ 모든 x 에 대하여 ax² + {2 * kk}x − {cc} < 0 ⇔ a < 0, {kk * kk} + {cc}a < 0 → M = {neg(Mx)} · (나) 거짓 ⇔ q 가 늘 참은 아님 ⇔ b² − {s * s} ≥ 0 → m = {s} → {Mx + s}', ref='10', par={'k': 'twofalse', 'kk': kk, 'c': cc, 's': s})
    return [b1, b2, b3, b4]

# ════════════════════════ 팩 조립 ════════════════════════
def vers(f): return [f(v) for v in range(NV)]

SET = {
    'id': 'mid-set', 'no': '?', 'title': '집합 중단원 레이드', 'unit': '공통수학2 Ⅱ. 집합과 명제 1. 집합 · 중단원 마무리 (교과서 78~79쪽)',
    'goal': '① 집합 단원의 핵심 개념을 한 장으로 정리한다. ② 중단원 마무리 문제를 반 전체가 함께 해결한다.',
    'theme': '05-ruins', 'pct': 90, 'img': [], 'video': [],
    'steps': [
        {'kind': 'intro', 'id': 'intro', 'title': '도입 · 🔁 전시 확인 · 집합 한 장 정리', 'img': 'review',
         'say': '🔁 집합 한 장 정리 (빈칸을 함께 채워요)\n① 대상이 분명한 모임 = (집합) · 집합을 이루는 대상 하나하나 = (원소)\n② 원소를 { } 안에 나열 = (원소나열법) · 조건으로 나타냄 = (조건제시법)\n③ A 의 모든 원소가 B 에 속한다 = A (⊂) B\n④ 둘 다 = A (∩) B · 적어도 한쪽 = A (∪) B · U 에서 A 를 뺀 것 = (Aᶜ) · A 에만 = (A − B)\n⑤ n(A ∪ B) = n(A) + n(B) − (n(A ∩ B))\n⑥ 드모르간의 법칙 : (A ∪ B)ᶜ = (Aᶜ ∩ Bᶜ) · (A ∩ B)ᶜ = (Aᶜ ∪ Bᶜ)'},
        {'kind': 'concept', 'id': 'c1', 'title': 'STEP 1 · 집합의 표현과 포함 관계',
         'say': '낱말 상자 [ 원소나열법 · 약수 · ⊂ ]\n조건제시법 {x | x는 6의 약수} → (원소나열법) {1, 2, 3, 6}\n{1, 3} 의 원소가 모두 {1, 2, 3, 6} 에 있다 → {1, 3} (⊂) {1, 2, 3, 6}\n방정식의 해도 집합의 원소 : {x | x² − 3x + 2 = 0} = {1, 2}'},
        {'kind': 'monster', 'id': 'm1', 'title': '몬스터 1 수정 슬라임'},
        {'kind': 'concept', 'id': 'c2', 'title': 'STEP 2 · 집합의 연산과 원소의 개수',
         'say': '낱말 상자 [ 교집합 · 합집합 · 여집합 · 차집합 · 드모르간 ]\nA ∩ B = (교집합) · A ∪ B = (합집합) · Aᶜ = (여집합) · A − B = (차집합)\nn(A ∪ B) = n(A) + n(B) − n(A ∩ B) · n(Aᶜ) = n(U) − n(A)\n(드모르간)의 법칙 : Aᶜ ∩ Bᶜ = (A ∪ B)ᶜ'},
        {'kind': 'monster', 'id': 'm2', 'title': '몬스터 2 바위 골렘'},
        {'kind': 'monster', 'id': 'm3', 'title': '몬스터 3 반사 골렘 · ⚔ 소레이드'},
        {'kind': 'boss', 'id': 'sum', 'title': '👑 집합 중단원 형성평가 · 성채 드래곤'},
    ],
    'mons': {
        'm1': {'title': '몬스터 1 수정 슬라임', 'sprite': 'base0:0', 'vers': vers(set_m1)},
        'm2': {'title': '몬스터 2 바위 골렘', 'sprite': 'base1:0', 'vers': vers(set_m2)},
        'm3': {'title': '몬스터 3 반사 골렘 · ⚔ 소레이드', 'sprite': 'mirror1:0', 'chain': True, 'note': '드모르간 → n(A), n(B) → n(A ∪ B) → 전체에서 빼기', 'vers': vers(set_m3)},
    },
    'boss': {'title': '성채 드래곤', 'sprite': 'base2:0', 'items': 4, 'hpItems': 4, 'tags': ['c1', 'c2', 'c2', 'c2'], 'links': ['', 'm1', 'm2', 'm2'], 'vers': vers(set_boss)},
}
PROP = {
    'id': 'mid-prop', 'no': '?', 'title': '명제 중단원 레이드', 'unit': '공통수학2 Ⅱ. 집합과 명제 2. 명제 · 중단원 마무리 (교과서 96~97쪽)',
    'goal': '① 명제 단원의 핵심 개념을 한 장으로 정리한다. ② 중단원 마무리 문제를 반 전체가 함께 해결한다.',
    'theme': '11-keyvault', 'pct': 90, 'img': [], 'video': [],
    'steps': [
        {'kind': 'intro', 'id': 'intro', 'title': '도입 · 🔁 전시 확인 · 명제 한 장 정리', 'img': 'review',
         'say': '🔁 명제 한 장 정리 (빈칸을 함께 채워요)\n① 참 · 거짓을 분명히 가릴 수 있는 문장 = (명제) · x 의 값에 따라 달라지는 문장 = (조건)\n② 조건이 참이 되는 원소의 집합 = (진리집합) · ~p 의 진리집합 = (Pᶜ)\n③ 「모든」의 부정 = (어떤) · 「어떤」의 부정 = (모든)\n④ p → q 가 참 ⇔ P (⊂) Q\n⑤ p → q 의 역 = (q → p) · 대우 = (~q → ~p) · 명제와 (대우)는 참 · 거짓이 같다\n⑥ p ⇒ q 일 때 p 는 q 이기 위한 (충분)조건 · q 는 p 이기 위한 (필요)조건'},
        {'kind': 'concept', 'id': 'c1', 'title': 'STEP 1 · 조건과 진리집합 · 부정',
         'say': '낱말 상자 [ 진리집합 · 여집합 · 어떤 · 모든 ]\nU = {1, 2, 3, 4}, p: x 는 짝수 → (진리집합) P = {2, 4} · ~p 의 진리집합 = P 의 (여집합) = {1, 3}\n「모든 x 에 대하여 p」의 부정 = 「(어떤) x 에 대하여 ~p」\n「어떤 x 에 대하여 p」의 부정 = 「(모든) x 에 대하여 ~p」 · > 의 부정은 ≤'},
        {'kind': 'monster', 'id': 'm1', 'title': '몬스터 1 열쇠 유령'},
        {'kind': 'concept', 'id': 'c2', 'title': 'STEP 2 · 역과 대우 · 충분조건과 필요조건',
         'say': '낱말 상자 [ 역 · 대우 · 충분 · 필요 ]\np → q 의 (역) = q → p · (대우) = ~q → ~p (명제와 대우는 참 · 거짓이 같다)\nP ⊂ Q 이면 p ⇒ q : p 는 q 이기 위한 (충분)조건 · q 는 p 이기 위한 (필요)조건\nP = Q 이면 필요충분조건'},
        {'kind': 'monster', 'id': 'm2', 'title': '몬스터 2 뒤집개 박쥐'},
        {'kind': 'monster', 'id': 'm3', 'title': '몬스터 3 천칭 가고일 · ⚔ 소레이드'},
        {'kind': 'boss', 'id': 'sum', 'title': '👑 명제 중단원 형성평가 · 필요충분의 천칭 수호자'},
    ],
    'mons': {
        'm1': {'title': '몬스터 1 열쇠 유령', 'sprite': 'keyvault1:0', 'vers': vers(prop_m1)},
        'm2': {'title': '몬스터 2 뒤집개 박쥐', 'sprite': 'keyvault4:0', 'vers': vers(prop_m2)},
        'm3': {'title': '몬스터 3 천칭 가고일 · ⚔ 소레이드', 'sprite': 'garden0:0', 'chain': True, 'note': '진리집합 P → 충분조건 = P ⊂ Q → P 의 가장 큰 수 → 범위', 'vers': vers(prop_m3)},
    },
    'boss': {'title': '필요충분의 천칭 수호자', 'sprite': 'gardenboss0:0', 'items': 4, 'hpItems': 4, 'tags': ['c1', 'c1', 'c2', 'c2'], 'links': ['', 'm1', 'm2', 'm3'], 'vers': vers(prop_boss)},
}

def minutes(p):
    """⏱ 처음 값(DECISIONS 11/16): 도입 3 · 개념 4 · 정찰 1 · 소문제 1.5 · 소레이드 단계 2 · 형성평가 문항 1 · 마무리 3"""
    t = 3 + 3
    for s in p['steps']:
        if s['kind'] == 'concept': t += 4
        if s['kind'] == 'monster':
            m = p['mons'][s['id']]; n = len(m['vers'][0]); t += 1 + (2 * n if m.get('chain') else 1.5 * n)
        if s['kind'] == 'boss': t += p['boss']['items']
    return t

if __name__ == '__main__':
    for p in (SET, PROP):
        json.dump(p, open(os.path.join(HERE, p['id'] + '.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
        print(p['id'], '· 몬스터', len(p['mons']), '· 형성평가', p['boss']['items'], '· ⏱ 예상', minutes(p), '분')
