from cm1lib import *
X = lambda cs, v='x': D(P(cs, v))
POS = ['서로 다른 두 점에서 만난다', '한 점에서 만난다 (접한다)', '만나지 않는다']
pos = lambda d: POS[0 if d > 0 else 1 if d == 0 else 2]
def m1a(v, rng):
    a, b = pick(v, rng, (-1, 3), lambda r: tuple(sorted(r.sample(range(-5, 6), 2)))); cs = pmul([1, -a], [1, -b])
    return choice(rng, f'이차함수 y = {X(cs)} 의 그래프와 x축이 만나는 점의 x좌표를 모두 구한 것은?', f'{N(a)}, {N(b)}', [f'{N(-b)}, {N(-a)}' if (-b, -a) != (a, b) else f'{N(a-1)}, {N(b+1)}', f'{N(a+b)}, {N(a*b)}', f'{N(a)}, {N(-b)}' if b else f'{N(a)}, 1', f'{N(a+1)}, {N(b+1)}'], f'y = 0 으로 놓은 이차방정식 {X(cs)} = 0 의 실근이 x좌표.', chk=lambda: peval(cs, a) == 0 and peval(cs, b) == 0)
def m1b(v, rng):
    k, s = pick(v, rng, (3, -1), lambda r: (ri(r, -5, 5, (0,)), r.choice([1, -1, 2]))); cs = pmul([s], pmul([1, -k], [1, -k]))
    return number(f'이차함수 y = {X(cs)} 의 그래프와 x축이 만나는 점의 x좌표는?', k, f'{X(cs)} = 0 → {N(s) if s != 1 else ""}(x {"−" if k>0 else "+"} {abs(k)})² = 0 → 중근(접점 하나).', chk=lambda: peval(cs, k) == 0)
def QD(v, rng, k=0): return pick(v, rng, [[1, 4, 2], [2, -3, 2], [-1, 2, -1]][k], lambda r: r.choice([[r.choice([1, -1, 2, -3]), ri(r, -6, 6), ri(r, -5, 5)], [(s := r.choice([1, -1])), 2 * s * (t := ri(r, -4, 4, (0,))), s * t * t], [ri(r, 1, 3), ri(r, -3, 3), ri(r, 2, 6)]]))
def m2(k):
    def f(v, rng):
        cs = QD(v, rng, k); d = cs[1] ** 2 - 4 * cs[0] * cs[2]
        return choice(rng, f'이차함수 y = {X(cs)} 의 그래프와 x축의 위치 관계는?', pos(d), [p for p in POS if p != pos(d)], f'{X(cs)} = 0 의 판별식 D = {N(d)} {">" if d>0 else "=" if d==0 else "<"} 0.', n=3, keep=True, chk=True)
    return f
def KK(v, rng): return pick(v, rng, -4, lambda r: ri(r, -5, 5, (0,)))     # y = x² + 2p x + k
def m3a(v, rng):
    p = KK(v, random.Random(rng.random() if v else 1)); t = p * p
    return choice(rng, f"이차함수 y = x² {'+' if p>0 else '−'} {abs(2*p)}x + k 의 그래프가 x축과 서로 다른 두 점에서 만나도록 하는 실수 k 의 값의 범위는?", f'k < {t}', [f'k > {t}', f'k ≤ {t}', f'k ≥ {t}'], f'D > 0: D/4 = {t} − k > 0.', chk=True)
def m3b(v, rng):
    p = KK(v, random.Random(rng.random() if v else 1))
    return number(f"이차함수 y = x² {'+' if p>0 else '−'} {abs(2*p)}x + k 의 그래프가 x축에 접하도록 하는 실수 k 의 값은?", p * p, f'접한다 ⟺ D = 0: {p*p} − k = 0.', chk=True)
# 산: 두 교점 사이의 거리 (중단원 마무리 05 꼴)
def HD(v, rng):
    r1, d = pick(v, rng, (-2, 8), lambda r: (ri(r, -7, -1), ri(r, 3, 9))); r2 = r1 + d
    if r1 + r2 <= 0: r1, r2 = -r2, -r1
    if r1 + r2 == 0: r1, r2 = r1 + 1, r2 + 1
    return r1, r2, d
def hs(v, rng):
    r1, r2, d = HD(v, random.Random(rng.random() if v else 1)); c = r1 * r2
    return r1, r2, d, c, f"이차함수 y = x² − ax {'+' if c>=0 else '−'} {abs(c)} 의 그래프가 x축과 만나는 두 점 사이의 거리가 {d} 이다 (a > 0)."
def m4a(v, rng):
    r1, r2, d, c, s = hs(v, rng)
    return multi(rng, f'{s} 두 교점의 x좌표를 α, β 라 할 때, 맞는 식을 모두 고르시오.', [('α + β = a', True), ('α + β = −a', False), (f'αβ = {N(c)}', True), (f'αβ = {N(-c)}', False), (f'|α − β| = {d}', True)], 'x² − ax + (상수) = 0 의 두 근 → 합 a, 곱 = 상수항. 거리 = 두 근의 차.', chk=True)
def m4b(v, rng):
    r1, r2, d, c, s = hs(v, rng)
    return choice(rng, f'{s} 두 교점의 x좌표 α, β 에 대하여 (α − β)² 을 α + β 와 αβ 로 나타내면?', '(α + β)² − 4αβ', ['(α + β)² − 2αβ', '(α + β)² + 4αβ', '(α + β)² − αβ'], '(α − β)² = α² − 2αβ + β² = (α + β)² − 4αβ.', chk=lambda: same('(a-b)**2', '(a+b)**2-4*a*b', 'ab'))
def m4c(v, rng):
    r1, r2, d, c, s = hs(v, rng)
    return number(f'{s} a 의 값은?', r1 + r2, f'{d}² = a² − 4 × ({N(c)}) → a² = {d*d + 4*c} → a > 0 이므로 {r1 + r2}.', chk=lambda: (r1 + r2) ** 2 - 4 * c == d * d and r1 + r2 > 0)
def ex1(v, rng):
    a, b = pick(v, rng, (-1, 3), lambda r: tuple(sorted(r.sample(range(-5, 6), 2))))
    return number(f'이차함수 y = x² + ax + b 의 그래프가 x축과 만나는 두 점의 x좌표가 {N(a)}, {N(b)} 일 때, a + b 의 값은? (식의 a, b 는 상수)'.replace('y = x² + ax + b', 'y = x² + px + q').replace('a + b 의', 'p + q 의').replace('식의 a, b', 'p, q'), -(a + b) + a * b, f'x² + px + q = (x − ({N(a)}))(x − ({N(b)})) → p = {N(-(a+b))}, q = {N(a*b)}.', chk=True)
L = dict(id='cm1-16', no=16, title='이차함수의 그래프와 x축', unit='Ⅱ-2 이차방정식과 이차함수', pages='64 ~ 65', goal='이차방정식과 이차함수를 연결하여 그래프와 x축의 위치 관계를 설명할 수 있다.',
  review='13차시: 판별식 D 와 근의 종류 · 중학교: 이차함수의 그래프(포물선)', intro='y = x² − 5x + 4 의 그래프가 x축과 만나는 곳의 x좌표 1, 4 = 방정식 x² − 5x + 4 = 0 의 근.',
  concepts=[dict(id='c1', title='그래프와 x축이 만나는 점', say='y = ax² + bx + c 의 그래프와 x축이 만나는 점의 x좌표 = 이차방정식 ax² + bx + c = 0 의 실근.', check=dict(type='ox', q='이차함수 y = x² + 1 의 그래프는 x축과 만난다.', ch=[], a='X', why='x² + 1 = 0 은 실근이 없다(D < 0).')),
            dict(id='c2', title='판별식과 위치 관계', say='D > 0 서로 다른 두 점에서 만난다 · D = 0 한 점에서 만난다(접한다) · D < 0 만나지 않는다.')],
  mons=[dict(id='m1', title='문제 1 · x축과 만나는 점', subs=[m1a, m1b]), dict(id='m2', title='문제 2 · x축과의 위치 관계', subs=[m2(0), m2(1), m2(2)]), dict(id='m3', title='문제 3 · 위치 관계로 k 구하기', subs=[m3a, m3b]),
        dict(id='m4', title='문제 4 · 두 교점 사이의 거리', hard=True, subs=[m4a, m4b, m4c]), dict(id='m5', title='교점으로 식 찾기', extra=True, subs=[ex1])],
  boss=[(m1a, 'c1', 'm1'), (m2(1), 'c2', 'm2'), (m3a, 'c2', 'm3'), (m3b, 'c2', 'm3')],
  hard_from='산 = 중단원 마무리 05번 꼴(본문에 어려운 문제가 없어 가져옴)',
  motion=[dict(title='포물선이 뜨고 가라앉을 때', key='x축과 만나는 점의 개수 = 실근의 개수 = D 의 부호.', scenes=['카드에 좌표평면과 포물선 y = x² − 4x + k, 아래에 k 슬라이더.', 'k 를 올리면 포물선이 떠오르며 교점이 2개 → 1개(접함) → 0개.', '교점 수가 바뀔 때마다 D > 0 · D = 0 · D < 0 딱지가 켜진다.', '세 장면이 나란히 정리된다.'], end='D > 0 두 점 · D = 0 접한다 · D < 0 만나지 않는다', at='c2')],
  notes=['문제 2 는 그래프 그림 없이 식만으로 판별(게시판에서도 혼자 풀리게).', '그래프 그림이 필요한 문항은 학습지에만 두는 것을 권함(선생님 확인 거리).'])
if __name__ == '__main__': write(L)
