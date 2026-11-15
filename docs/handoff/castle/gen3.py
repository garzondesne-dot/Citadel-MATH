import json, random, math
from fractions import Fraction as Fr
d = json.load(open('eval-3.json'))
def C(q, correct, traps, sol, seed, say=None, why=None, multi=None):
    r = random.Random(seed)
    if multi:
        ch = multi[0] + multi[1]; r.shuffle(ch)
        assert len(set(ch)) == len(ch), ch
        o = {'type': 'multi', 'q': q, 'a': ','.join(str(ch.index(c)) for c in multi[0]), 'ch': ch, 'sol': sol}
    else:
        ch = [correct] + [t for t in traps]
        assert len(set(ch)) == len(ch), ch
        r.shuffle(ch); o = {'type': 'choice', 'q': q, 'a': str(ch.index(correct)), 'ch': ch, 'sol': sol}
    if say: o['say'] = say
    if why: o['why'] = why
    return o
def N(q, ans, sol, say=None): o = {'type': 'number', 'q': q, 'a': str(ans).replace('-', '−'), 'ch': [], 'sol': sol}; o.update({'say': say} if say else {}); return o
# ── 11 충분조건 (소레이드 · 열림 10) ──
PQ = [(5, 14), (3, 10), (4, 12), (6, 16), (2, 8), (5, 12), (7, 18)]
def q11(v):
    P, Qn = PQ[v]; lo = max(P, math.ceil(Qn / 4)); hi = Qn // 2; s = sum(range(lo, hi + 1))
    head = f'11 실수 x 에 대하여 두 조건 p: (x − a + {P})(x + 2a − {Qn}) = 0, q: x(x − 2a) ≤ 0 일 때, p 가 q 이기 위한 충분조건이 되도록 하는 모든 정수 a 의 값의 합은?'
    q4 = f'{Qn/4:g} ≤ a ≤ {hi}' if Fr(Qn, 4) != lo else f'{lo - 1} ≤ a ≤ {hi}'
    WHY = {'pre': '∵ p 가 q 이기 위한 충분조건이면 진리집합', 'post': '이다.', 'choices': ['P ⊂ Q', 'Q ⊂ P', 'P = Q'], 'answer': 0, 'text': '∵ p 가 q 이기 위한 충분조건이면 진리집합 P ⊂ Q 이다.'}
    return [
        C(head + '\n① p 가 q 이기 위한 충분조건이 뜻하는 것은?', 'P ⊂ Q', ['Q ⊂ P', 'P = Q'], '충분조건 ⇔ P ⊂ Q', 1100 + v, say='p 가 q 이기 위한 충분조건이므로 P ⊂ Q 이다.', why=WHY),
        C(head + '\n② p 의 진리집합 P 는?', f'{{a − {P}, {Qn} − 2a}}', [f'{{{P} − a, 2a − {Qn}}}', f'{{a + {P}, {Qn} + 2a}}'], f'(x − a + {P}) = 0 → x = a − {P} · (x + 2a − {Qn}) = 0 → x = {Qn} − 2a', 1110 + v, say=f'P = {{a − {P}, {Qn} − 2a}}'),
        C(head + '\n③ a > 0 일 때 q 의 진리집합 Q 는?', '{x | 0 ≤ x ≤ 2a}', ['{x | x ≤ 0 또는 x ≥ 2a}', '{x | −2a ≤ x ≤ 0}'], 'x(x − 2a) ≤ 0 → 0 ≤ x ≤ 2a', 1120 + v, say='Q = {x | 0 ≤ x ≤ 2a}'),
        C(head + '\n④ P 의 두 원소가 모두 Q 에 들어가는 a 의 범위는?', f'{lo} ≤ a ≤ {hi}', [q4, f'a ≥ {lo}'], f'0 ≤ a − {P} ≤ 2a 이고 0 ≤ {Qn} − 2a ≤ 2a → {lo} ≤ a ≤ {hi}', 1130 + v, say=f'a − {P} ≥ 0, {Qn} − 2a ≥ 0, {Qn} − 2a ≤ 2a 에서 {lo} ≤ a ≤ {hi}'),
        N(head + '\n👑 그러므로 정수 a 의 값의 합은?', s, ' + '.join(map(str, range(lo, hi + 1))) + f' = {s}', say=f'그러므로 정수 a 의 값의 합은 {s} 이다.'),
    ]
# ── 14 절대부등식 최솟값 (소레이드 · 열림 13) ──
MN = [(4, 9), (1, 16), (9, 4), (1, 9), (4, 25), (9, 16), (16, 9)]
def q14(v):
    m, n = MN[v]; r = int(math.isqrt(m * n)); mn = m * n; xy = Fr(int(math.isqrt(m)), int(math.isqrt(n)))
    fs = lambda f: str(f.numerator) if f.denominator == 1 else f'{f.numerator}/{f.denominator}'
    head = f'14 x > 0 이고 y > 0 일 때, (x + {m}/y)(1/x + {n}y) 의 최솟값은?'
    WHY = {'pre': '∵ a > 0, b > 0 이면 a + b ≥', 'post': '(산술평균과 기하평균의 관계)', 'choices': ['2√(ab)', '√(ab)', 'ab'], 'answer': 0, 'text': '∵ a > 0, b > 0 이면 a + b ≥ 2√(ab) (산술평균과 기하평균의 관계)'}
    traps4 = [t for t in [fs(Fr(m, n)), fs(Fr(n, m)), fs(xy * 2), str(mn)] if t != fs(xy)][:2]
    return [
        C(head + '\n① 전개하면?', f'{n}xy + {m}/(xy) + {mn + 1}', [f'{n}xy + {m}/(xy) + 1', f'{n}xy + {m}/(xy)'], f'1 + {n}xy + {m}/(xy) + {mn} = {n}xy + {m}/(xy) + {mn + 1}', 1400 + v, say=f'(x + {m}/y)(1/x + {n}y) = {n}xy + {m}/(xy) + {mn + 1}'),
        C(head + '\n② x > 0, y > 0 이 뜻하는 것은?', f'{n}xy > 0, {m}/(xy) > 0 → 산술평균 · 기하평균을 쓸 수 있다', ['xy < 0 → 산술평균 · 기하평균을 쓸 수 없다', 'x = y 이다'], '두 수가 모두 양수여야 산술 · 기하평균의 관계를 쓴다', 1410 + v, say=f'x > 0, y > 0 이므로 {n}xy > 0, {m}/(xy) > 0 이다.'),
        C(head + f'\n③ {n}xy + {m}/(xy) ≥ ?', str(2 * r), [str(mn), str(r)], f'2√({n}xy × {m}/(xy)) = 2√{mn} = {2 * r}', 1420 + v, say=f'{n}xy + {m}/(xy) ≥ 2√{mn} = {2 * r}', why=WHY),
        C(head + '\n④ 등호가 성립할 때 xy 의 값은?', fs(xy), traps4, f'{n}xy = {m}/(xy) → (xy)² = {fs(Fr(m, n))} → xy = {fs(xy)}', 1430 + v, say=f'등호는 {n}xy = {m}/(xy), 즉 xy = {fs(xy)} 일 때 성립한다.'),
        N(head + '\n👑 그러므로 최솟값은?', 2 * r + mn + 1, f'{2 * r} + {mn + 1} = {2 * r + mn + 1}', say=f'그러므로 최솟값은 {2 * r + mn + 1} 이다.'),
    ]
# ── 15 두 동아리 (소레이드 · ✍ · 열림 4) ──
BGS = [(26, 22, 58), (24, 18, 52), (30, 26, 66), (21, 17, 48), (28, 20, 60), (25, 23, 56), (27, 19, 58)]
def q15(v):
    B, G, S = BGS[v]; T = S - (B + G); y = (T - (B - G)) // 2; x = T - y
    assert T > 0 and y > 0 and x > 0 and (T - (B - G)) % 2 == 0, (B, G, S)
    head = f'15 두 동아리 A 또는 B 에 가입한 남학생 {B}명과 여학생 {G}명을 조사하였더니, A 에 가입한 학생 수와 B 에 가입한 학생 수의 합은 {S} 이고, 한 동아리에만 가입한 남학생 수와 여학생 수가 같았다. 두 동아리에 모두 가입한 여학생 수는?'
    return [
        C(head + '\n① 두 동아리에 모두 가입한 학생 수 n(A ∩ B) 는?', str(T), [str(S - B), str(B + G)], f'n(A) + n(B) − n(A ∪ B) = {S} − {B + G} = {T}', 1500 + v, say=f'n(A ∩ B) = {S} − {B + G} = {T}'),
        C(head + '\n② 둘 다 가입한 남학생을 x 명, 여학생을 y 명이라 하면 한 동아리에만 가입한 남 · 여는?', f'{B} − x, {G} − y', [f'{B} − {T}, {G} − {T}', f'x − {B}, y − {G}'], f'남 {B} 명 중 둘 다 x 명 → 한 곳만 {B} − x', 1510 + v, say=f'한 동아리에만 가입한 남학생은 {B} − x, 여학생은 {G} − y 명이다.'),
        C(head + '\n③ 맞는 식을 모두 고르시오.', None, None, f'{B} − x = {G} − y (한 곳만 같음) · x + y = {T} (둘 다 가입)', 1520 + v, say=f'{B} − x = {G} − y, x + y = {T}', multi=([f'{B} − x = {G} − y', f'x + y = {T}'], ['x = y', f'x + y = {B + G}', f'x − y = {T}'])),
        N(head + '\n👑 그러므로 두 동아리에 모두 가입한 여학생 수는?', y, f'x − y = {B - G}, x + y = {T} → y = {y}', say=f'그러므로 두 동아리에 모두 가입한 여학생 수는 {y} 이다.'),
    ]
# ── 16 귀류법 (단계 문항 · ✍ · 열림 12) ──
PR = [5, 2, 3, 7, 11, 13, 17]
def q16(v):
    p = PR[v]; head = f'16 「√{p} 는 유리수가 아니다」를 귀류법으로 증명하시오.'
    return [
        C(head + '\n① 처음 가정은?', f'√{p} 는 유리수이다.', [f'√{p} 는 무리수이다.', f'√{p} 는 정수이다.'], '결론을 부정해 가정한다', 1600 + v),
        N(head + f'\n② √{p} = m/n (m, n 은 서로소인 자연수)이라 하면 m² = ☐ × n² 이다. ☐ 는?', p, f'양변을 제곱 → m² = {p}n²'),
        N(head + f'\n③ m 은 {p} 의 배수이므로 m = {p}t 라 하면 n² = ☐ × t² 이다. ☐ 는?', p, f'{p * p}t² = {p}n² → n² = {p}t²'),
        C(head + f'\n④ m, n 이 모두 {p} 의 배수이므로 무엇에 모순인가?', 'm, n 이 서로소라는 것', [f'√{p} 가 무리수라는 것', 'm = n 이라는 것'], f'공약수 {p} → 서로소에 모순 → √{p} 는 유리수가 아니다', 1630 + v),
    ]
# ── 👑 17 절대부등식 증명 (단계 문항 · ✍ · 열림 13) ──
def q17(v):
    head = '👑 17 a > 0, b > 0 일 때, 부등식 2(a³ + b³) ≥ (a + b)(a² + b²) 이 성립함을 증명하시오.'
    return [
        C(head + '\n① 증명 방법은?', '(좌변) − (우변) ≥ 0 을 보인다', ['(좌변) ÷ (우변) ≥ 1 을 보인다', '양변에 같은 수를 넣어 본다'], '13차시 순서: (좌변) − (우변)', 1700 + v),
        C(head + '\n② (좌변) − (우변) 을 정리하면?', '(a + b)(a − b)²', ['(a − b)(a + b)²', '(a + b)²(a − b)'], 'a³ + b³ − a²b − ab² = (a + b)(a − b)²', 1710 + v),
        C(head + '\n③ ② 가 0 이상인 까닭은?', 'a + b > 0, (a − b)² ≥ 0', ['a − b > 0, (a + b)² ≥ 0', 'ab > 0'], '양수 × (완전제곱 ≥ 0) ≥ 0', 1720 + v),
        C(head + '\n④ 등호가 성립하는 조건은?', 'a = b', ['a = −b', 'a = 0'], '(a − b)² = 0 → a = b', 1730 + v),
    ]
NEW = {'q11': (10, q11, True), 'q14': (13, q14, True), 'q15': (4, q15, True), 'q16': (12, q16, False), 'q17': (13, q17, False)}
for r in d['rooms']:
    if r['id'] in NEW:
        no, f, chain = NEW[r['id']]; r['no'] = no; r['vers'] = [f(v) for v in range(7)]
        if chain: r['chain'] = True
        else: r.pop('chain', None)
d['after'] = 13; d['title'] = '집합과 명제 대단원'; d['unit'] = '공통수학2 Ⅱ 집합과 명제 · 평가3 (교과서 99~101쪽 · 변경 제안 v2)'
json.dump(d, open('eval-3v2.json', 'w'), ensure_ascii=False, indent=1)
print('ok', [(r['id'], r['no'], r.get('chain', False), len(r['vers'][0])) for r in d['rooms']])
