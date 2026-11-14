import json, random, math
rnd = random.Random(1313)
def sh(correct, traps, seed):
    r = random.Random(seed); ch = [correct] + [t for t in traps if t != correct]
    assert len(set(ch)) == len(ch), ch
    r.shuffle(ch); return ch, str(ch.index(correct))
def C(q, correct, traps, sol, seed, **kw):
    ch, a = sh(correct, traps, seed); d = {'type': 'choice', 'q': q, 'a': a, 'ch': ch, 'sol': sol}; d.update(kw); return d
def OX(q, ok, sol): return {'type': 'ox', 'q': q, 'a': 'O' if ok else 'X', 'ch': [], 'sol': sol}
sq = lambda n: int(round(math.isqrt(n)))
# ── m1 절대부등식 ○ / × ──
POOL = [  # (식, 참?, 풀이)
 lambda k: (f'(a − b)² ≥ 0', True, '(□)² 은 언제나 0 이상'),
 lambda k: (f'|x − {k}| ≥ 0', True, '절댓값은 언제나 0 이상'),
 lambda k: (f'x² + x + 1 < 0', False, f'x = 0 이면 1 < 0 → 거짓'),
 lambda k: (f'|a + {k}| > 1', False, f'a = −{k} 이면 0 > 1 → 거짓'),
 lambda k: (f'(x + {k})² ≥ 0', True, '(□)² 은 언제나 0 이상'),
 lambda k: (f'(x − {k})² > 0', False, f'x = {k} 이면 0 > 0 → 거짓'),
 lambda k: (f'x² + {k} > 0', True, f'x² ≥ 0 이므로 x² + {k} ≥ {k} > 0'),
 lambda k: (f'x² − {k} ≥ 0', False, f'x = 0 이면 −{k} ≥ 0 → 거짓'),
 lambda k: (f'{k}x > 0', False, f'x = 0 이면 0 > 0 → 거짓'),
 lambda k: (f'a² + b² ≥ 0', True, '제곱의 합은 0 이상'),
 lambda k: (f'x² > 0', False, 'x = 0 이면 0 > 0 → 거짓'),
 lambda k: (f'|x| + {k} > 0', True, f'|x| ≥ 0 이므로 |x| + {k} ≥ {k} > 0'),
]
def m1(v):
    if v == 0: picks = [(0, 0), (1, 2), (2, 0), (3, 3)]
    else:
        r = random.Random(100 + v)
        while True:
            idx = r.sample(range(4, len(POOL)), 4); picks = [(i, r.randint(2, 9)) for i in idx]
            vals = [POOL[i](k)[1] for i, k in picks]
            if True in vals and False in vals: break
    out = []
    for n, (i, k) in enumerate(picks):
        e, ok, why = POOL[i](k)
        out.append(OX(f'문제 1) 다음 부등식이 절대부등식이면 ○, 아니면 ×\n({n+1}) {e}', ok, ('절대부등식 — ' if ok else '절대부등식 아님 — ') + why))
        out[-1]['expr'] = e
    return out
# ── m2 x² + k² ≥ 2kx ──
def m2(v):
    k = [3, 4, 5, 2, 6, 7, 8][v]; P = f'실수 x 에 대하여 x² + {k*k} ≥ {2*k}x 증명'
    return [
     C(f'문제 2) {P}\n(1) (좌변) − (우변) = ?', f'x² − {2*k}x + {k*k}', [f'x² + {2*k}x + {k*k}', f'x² − {k*k}'], f'x² + {k*k} − {2*k}x = x² − {2*k}x + {k*k}', 200+v, say=f'(좌변) − (우변) = x² − {2*k}x + {k*k}', k=k),
     C(f'문제 2) {P}\n(2) x² − {2*k}x + {k*k} = (□)² 의 □ 는?', f'x − {k}', [f'x + {k}', f'x − {k*k}'], f'x² − {2*k}x + {k*k} = (x − {k})²', 210+v, say=f'= (x − {k})²', k=k),
     C(f'문제 2) {P}\n(3) (x − {k})² ≥ 0 이므로 x² + {k*k} (  ?  ) {2*k}x', '≥', ['<', '='], '완전제곱식은 0 이상 → (좌변) − (우변) ≥ 0', 220+v, say=f'(x − {k})² ≥ 0 이므로 x² + {k*k} ≥ {2*k}x', k=k),
     C(f'문제 2) {P}\n(4) 등호는 x = ? 일 때', str(k), [f'−{k}', str(k*k)], f'x − {k} = 0 → x = {k}', 230+v, say=f'등호는 x = {k} 일 때 성립한다.', k=k),
    ]
# ── m3 x + c/x ──
def m3(v):
    c = [4, 9, 16, 25, 36, 49, 64][v]; s = sq(c); P = f'x > 0 일 때 x + {c}/x 의 최솟값'
    t3 = [str(c), str(2*s)] if c != 4 else ['4', '3']
    return [
     C(f'문제 3) {P}\n(1) 두 수의 곱 x × ({c}/x) = ?', str(c), [str(2*c), str(c*c)], f'x × {c}/x = {c} (곱이 일정)', 300+v, c=c),
     C(f'문제 3) {P}\n(2) x + {c}/x ≥ 2√{c} = ?', str(2*s), [str(s), str(2*c)], f'2√{c} = 2 × {s} = {2*s} → 최솟값 {2*s}', 310+v, c=c),
     C(f'문제 3) {P}\n(3) 등호는 x = {c}/x, 즉 x = ? 일 때', str(s), t3, f'x² = {c}, x > 0 → x = {s}', 320+v, c=c),
    ]
# ── m4 소레이드 (a + p/b)(b + q/a) ──
PQ = [(2, 8), (1, 9), (4, 9), (2, 18), (3, 12), (1, 16), (3, 27)]
def fr(n, d): return f'{n}/{d}'
def m4(v):
    p, q = PQ[v]; m = p*q; r = sq(m); E = f'(a + {p}/b)(b + {q}/a)'; P = f'a > 0, b > 0 일 때 {E} 의 최솟값'
    WHY = {'pre': '∵ a > 0, b > 0 이면 a + b ≥', 'post': '(산술평균과 기하평균의 관계)', 'choices': ['2√(ab)', '√(ab)', 'ab'], 'answer': 0, 'text': '∵ a > 0, b > 0 이면 a + b ≥ 2√(ab) (산술평균과 기하평균의 관계)'}
    return [
     C(f'문제 4) {P}\n{E} 를 전개하면?', f'ab + {m}/(ab) + {p+q}', [f'ab + {m}/(ab)', f'ab + {p+q}'], f'ab + {q} + {p} + {m}/(ab) = ab + {m}/(ab) + {p+q}', 400+v, say=f'{E} = ab + {m}/(ab) + {p+q}', P_=p, Q_=q),
     C(f'문제 4) {P}\na > 0, b > 0 이 뜻하는 것은?', f'ab > 0, {m}/(ab) > 0 → 산술평균 · 기하평균을 쓸 수 있다', ['ab < 0 → 산술평균 · 기하평균을 쓸 수 없다', 'a = b 이다'], '두 수가 모두 양수여야 산술평균 · 기하평균의 관계를 쓴다', 410+v, say=f'a > 0, b > 0 이므로 ab > 0, {m}/(ab) > 0 이다.', P_=p, Q_=q),
     C(f'문제 4) {P}\nab + {m}/(ab) ≥ ?', str(2*r), [str(m), str(r)], f'ab + {m}/(ab) ≥ 2√(ab × {m}/(ab)) = 2√{m} = {2*r}', 420+v, say=f'ab + {m}/(ab) ≥ 2√{m} = {2*r}', why=WHY, P_=p, Q_=q),
     C(f'문제 4) {P}\n등호가 성립하는 때는? (ab = ?)', str(r), [str(m), str(2*r)], f'ab = {m}/(ab) → (ab)² = {m} → ab = {r}', 430+v, say=f'등호는 ab = {m}/(ab), 즉 ab = {r} 일 때 성립한다.', P_=p, Q_=q),
     C(f'문제 4) {P}\n그러므로 최솟값은?', str(2*r + p + q), [str(2*r), str(p + q)], f'{2*r} + {p+q} = {2*r+p+q}', 440+v, say=f'그러므로 최솟값은 {2*r} + {p+q} = {2*r+p+q} 이다.', P_=p, Q_=q),
    ]
# ── 형성평가 ──
ABS = [lambda k: (f'x² + {k} > 0', True), lambda k: (f'(x − {k})² ≥ 0', True), lambda k: (f'|x| + {k} > 0', True)]
NOT = [lambda k: (f'x > {k}', False), lambda k: (f'x² > 0', False), lambda k: (f'(x − {k})² > 0', False), lambda k: (f'x² − {k} ≥ 0', False), lambda k: (f'{k}x > 0', False)]
def boss(v):
    r = random.Random(500 + v); circ = ['①', '②', '③']
    b1 = C('1. 문자에 어떤 실수를 넣어도 항상 성립하는 부등식은?', '절대부등식', ['항등식', '방정식'], '어떤 실수를 넣어도 성립 = 절대부등식', 510+v)
    if v == 0: opts = [('x > 1', False), ('x² + 2 > 0', True), ('x² > 0', False)]
    else:
        good = r.choice(ABS)(r.randint(1, 9)); bads = [f(r.randint(1, 9)) for f in r.sample(NOT, 2)]; opts = [good] + bads; r.shuffle(opts)
    lab = [f'{circ[i]} {e}' for i, (e, _) in enumerate(opts)]; ans = [i for i, (_, ok) in enumerate(opts) if ok][0]
    b2 = {'type': 'choice', 'q': '2. 다음 중 절대부등식인 것은?', 'a': str(ans), 'ch': lab, 'sol': f'{lab[ans]} 만 어떤 실수를 넣어도 성립', 'opts': opts}
    k = [2, 3, 4, 5, 6, 7, 8][v]
    b3 = C(f'3. x² − {2*k}x + {k*k} = (□)² ≥ 0 의 □ 는?', f'x − {k}', [f'x + {k}', f'x − {2*k}'], f'x² − {2*k}x + {k*k} = (x − {k})²', 530+v, k=k)
    c = [9, 16, 25, 36, 49, 64, 81][v]; s = sq(c)
    b4 = C(f'4. x > 0 일 때 x + {c}/x 의 최솟값은?', str(2*s), [str(c), str(s)], f'x + {c}/x ≥ 2√{c} = {2*s} (등호 x = {s})', 540+v, c=c)
    S = [10, 6, 8, 12, 14, 16, 20][v]
    b5 = C(f'5. a > 0, b > 0, a + b = {S} 일 때 ab 의 최댓값은?', str((S//2)**2), [str(S), str(S*S)], f'{S} = a + b ≥ 2√(ab) → √(ab) ≤ {S//2} → ab ≤ {(S//2)**2}', 550+v, S=S)
    return [b1, b2, b3, b4, b5]
V = range(7)
mons = {
 'm1': {'title': '몬스터 1 충분 나비', 'sprite': 'garden2:0', 'vers': [m1(v) for v in V]},
 'm2': {'title': '몬스터 2 필요 덩굴', 'sprite': 'garden1:0', 'vers': [m2(v) for v in V]},
 'm3': {'title': '몬스터 3 천칭 가고일', 'sprite': 'garden0:0', 'vers': [m3(v) for v in V]},
 'm4': {'title': '몬스터 4 쌍둥이 구름 정령 · ⚔ 소레이드', 'sprite': 'garden3:0', 'chain': True, 'note': '전개 → 양수 확인 → 산술 · 기하평균 → 등호 → 최솟값', 'vers': [m4(v) for v in V]},
}
steps = [
 {'kind': 'intro', 'id': 'intro', 'title': '도입 · 🔁 전시 확인 · 생각 열기', 'img': 'review', 'say': '🔁 전시 확인: ① 결론을 부정하여 모순을 이끌어 내는 증명법 = (귀류법) ② 「a, b 중 적어도 하나는 짝수」의 부정 = (a, b 모두 홀수)\n🔍 생각 열기: x² − 4x + 3 = 0 · x² + 2x − 15 < 0 → 특정한 x 에서만 성립 / (x − 1)² = x² − 2x + 1 · (x − 1)² ≥ 0 → 어떤 x 를 넣어도 성립'},
 {'kind': 'concept', 'id': 'c1', 'title': 'STEP 1 · 절대부등식', 'say': '낱말 상자 [ 절대부등식 · 모든 ]\n부등식의 문자에 (모든) 실수를 대입하여도 항상 성립하는 부등식을 (절대부등식)이라고 한다.\n예) x² ≥ 0, x² + 1 > 0 · x + 1 > 0 은 x = −2 이면 거짓 → 절대부등식 아님'},
 {'kind': 'monster', 'id': 'm1', 'title': mons['m1']['title']},
 {'kind': 'concept', 'id': 'c2', 'title': 'STEP 2 · 완전제곱식으로 증명하기', 'say': '낱말 상자 [ 완전제곱식 · 등호 ]\n예) a² + b² ≥ 2ab : (좌변) − (우변) = a² − 2ab + b² = (a − b)² ≥ 0 ← (완전제곱식)의 값은 0 이상\n(등호)는 a = b 일 때 성립'},
 {'kind': 'monster', 'id': 'm2', 'title': mons['m2']['title']},
 {'kind': 'concept', 'id': 'c3', 'title': 'STEP 3 · 산술평균과 기하평균', 'say': '낱말 상자 [ 산술평균 · 기하평균 · 등호 ]\na > 0, b > 0 일 때 (a + b)/2 ≥ √(ab) ((등호)는 a = b 일 때)\n(a + b)/2 = (산술평균) · √(ab) = (기하평균)\n→ a + b ≥ 2√(ab) : 곱이 일정하면 합의 최솟값 · 합이 일정하면 곱의 최댓값'},
 {'kind': 'monster', 'id': 'm3', 'title': mons['m3']['title']},
 {'kind': 'monster', 'id': 'm4', 'title': mons['m4']['title']},
 {'kind': 'concept', 'id': 'recap', 'title': '📝 오늘 정리', 'say': '절대부등식 : 문자에 어떤 실수를 넣어도 항상 성립하는 부등식\n증명 순서 : ① (좌변) − (우변) → ② 완전제곱식 (□)² ≥ 0 → ③ 등호 조건\n산술 · 기하평균 : a > 0, b > 0 → a + b ≥ 2√(ab) · 등호 a = b'},
 {'kind': 'boss', 'id': 'sum', 'title': '👑 13차시 형성평가 · 필요충분의 천칭 수호자'},
]
pack = {'id': 'ex-13', 'no': 13, 'title': '절대부등식', 'unit': '공통수학2 Ⅱ. 집합과 명제 2. 명제 03. 명제의 증명', 'goal': '① 절대부등식의 뜻을 안다. ② 완전제곱식과 산술평균 · 기하평균의 관계를 이용하여 간단한 절대부등식을 증명할 수 있다.', 'theme': '12-skygarden', 'pct': 90,
 'next': {'title': '14차시 · 함수', 'ask': '정의역의 원소 하나에 공역의 원소가 꼭 하나씩 — 화살표로 나타내면?', 'link': '새 단원 Ⅲ. 함수와 그래프를 시작해요'},
 'steps': steps, 'mons': mons,
 'boss': {'title': '필요충분의 천칭 수호자', 'sprite': 'gardenboss0:0', 'items': 5, 'hpItems': 5, 'tags': ['c1', 'c1', 'c2', 'c3', 'c3'], 'vers': [boss(v) for v in V]},
 'img': [], 'video': [{'file': 'v13-55', 'at': ['c1', 'm1']}, {'file': 'v13-56', 'at': ['c2', 'm2']}, {'file': 'v13-57', 'at': ['c3', 'm3', 'm4', 'recap']}]}
json.dump(pack, open('raw.json', 'w'), ensure_ascii=False, indent=1)
print('ok')
