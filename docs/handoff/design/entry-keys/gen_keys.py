#!/usr/bin/env python3
"""🔑 입장 열쇠 = 선수 학습 점검 · 11 · 12 · 13차시 (🌊 설계 묶음 #6 · 설계 방)

python3 gen_keys.py <팩 폴더(pack11 · 12 · 13.json)>  →  keys-11 · 12 · 13.json · 열쇠표.md
열쇠 = 그 차시 문제를 막는 중학교 내용 하나 · 3지선다 · 30초 · 판 0 + 숫자 바꾼 판 2.
정답은 여기 적은 식이 아니라 아래 check 함수(직접 계산)로 다시 구해 대조하고, uses 가 팩에 실제 있는 칸인지 본다."""
import json, os, sys, random, math
HERE = os.path.dirname(os.path.abspath(__file__)); PACK = sys.argv[1]

def Q(q, right, traps, seed):
    ch = [right] + traps; assert len(set(ch)) == 3, ch
    random.Random(seed).shuffle(ch)
    return {'type': 'choice', 'q': q, 'a': str(ch.index(right)), 'ch': ch}
def sq(n): return int(math.isqrt(n))
def bat(n): return n % 10 in (0, 1, 3, 6, 7, 8)          # 받침으로 끝나는 수(영 · 일 · 삼 · 육 · 칠 · 팔 · 십)
def eul(n): return f'{n} 을' if bat(n) else f'{n} 를'
def gwa(n): return f'{n} 과' if bat(n) else f'{n} 와'

# 열쇠 문제 = 그 열쇠가 쓰이는 소문제와 **같은 꼴 · 숫자만 다르게** (2026-11-18 선생님 「지금은 가져다 쓰기만 해도 다행」)
# 열쇠마다: id · 이름 · 중학교 어디 · 💡 한 줄 · 판 3개(문항 · 다시 계산한 정답) · 쓰이는 칸
def k11():
    v1 = [(2, '짝수'), (5, '5의 배수'), (3, '3의 배수')]            # 수업 m2-2 = 「홀수를 k 로 나타낸 식」(2k − 1)
    def a(i):
        m, nm = v1[i]; right = f'{m}k'
        assert all((m * k) % m == 0 for k in range(1, 9)) and any((m * k - 1) % m for k in range(1, 9)) and any((k + m) % m for k in range(1, 9))
        return Q(f'k 가 자연수일 때, {nm}를 k 로 나타낸 식은?', right, [f'{m}k − 1', f'k + {m}'], 1110 + i), right
    v2 = [(4, 8), (6, -4), (4, -12)]                                # 수업 m2-3 = 4k² − 4k + 1 = 2( ? ) + 1
    def b(i):
        p, q = v2[i]; sg = '+' if q > 0 else '−'; e = f'{p}k² {sg} {abs(q)}k + 1'; right = f'{p // 2}k² {sg} {abs(q) // 2}k'
        assert all(2 * (p // 2 * k * k + q // 2 * k) + 1 == p * k * k + q * k + 1 for k in range(1, 7))
        return Q(f'{e} = 2( ? ) + 1 에서 ( ) 안에 알맞은 식은?', right, [f'{p}k² {sg} {abs(q) // 2}k', f'{p // 2}k² {sg} {abs(q)}k'], 1120 + i), right
    v3 = [4, 5, 2]                                                  # 수업 m3-2 = 3의 배수가 아니면 n = 3k − 1 또는 3k − 2
    def c(i):
        m = v3[i]; right = 'n = ' + ' 또는 '.join(f'{m}k − {r}' for r in range(1, m))
        got = {n for k in range(1, 30) for r in range(1, m) for n in [m * k - r]}; assert got == {n for n in range(1, m * 29) if n % m} | (got - set(range(1, m * 29)))
        return Q(f'자연수 n 이 {m}의 배수가 아니면 n 을 어떻게 나타낼 수 있나? (단, k는 자연수)', right, [f'n = {m}k', f'n = {m}k 또는 {m}k − 1' if m > 2 else 'n = 2k − 2'], 1130 + i), right
    return [
        dict(id='k1', name='배수를 식으로', grade='중1 · 문자의 사용과 식', help='2 의 배수(짝수)는 2 × (자연수) = 2k · 5 의 배수는 5k 처럼 써요.', mk=a,
             uses=[('m2', 2), ('boss', 3)]),
        dict(id='k2', name='2( ) + 1 꼴로 묶기', grade='중3 · 인수분해(공통인수)', help='1 을 뺀 나머지 항을 각각 2 로 나누어 괄호 안에 써요.', mk=b,
             uses=[('m2', 3), ('m3', 3), ('m3', 4), ('boss', 4)]),
        dict(id='k3', name='배수가 아닌 수', grade='중1 · 소인수분해(배수와 나머지)', help='4 의 배수 4k 에서 1, 2, 3 을 뺀 수는 4 의 배수가 아니에요(나머지가 남아요).', mk=c,
             uses=[('m3', 2)]),
    ]
def k12():
    v1 = [('a + 3', '합'), ('a − 5', '차'), ('2a', '곱')]            # 수업 m3-3 = 「a 가 유리수이면 a − 1 는?」
    def a(i):
        e, _ = v1[i]
        return Q(f'a 가 유리수이면 {e} 은(는)?', '유리수', ['무리수', '자연수'], 1210 + i), '유리수'
    v2 = [((6, 9), 3, False), ((4, 10), 2, False), ((10, 15), 5, False)]   # 수업 m2-4 = 「m, n 이 모두 짝수 → 서로소에 모순」
    def b(i):
        (x, y), d, _ = v2[i]; assert x % d == 0 and y % d == 0 and math.gcd(x, y) > 1
        nm = '짝수' if d == 2 else f'{d}의 배수'
        return Q(f'{gwa(x)} {y}{"은" if bat(y) else "는"} 모두 {nm}이다. 이 두 수는?', '서로소가 아니다', ['서로소이다', '약수가 1 뿐이다'], 1220 + i), '서로소가 아니다'
    v3 = [(3, 'a', 'b'), (5, 'x', 'y'), (7, 'p', 'q')]              # 수업 m2-2 = 「n = √2m 의 양변을 제곱하면 n² = ?」
    def c(i):
        r, m, n = v3[i]; right = f'{r}{m}²'
        assert all(abs((math.sqrt(r) * t) ** 2 - r * t * t) < 1e-9 for t in range(1, 6))
        return Q(f'{n} = √{r}{m} 의 양변을 제곱하면 {n}² = ?', right, [f'√{r}{m}²', f'{r * r}{m}²'], 1230 + i), right
    return [
        dict(id='k1', name='유리수끼리의 계산', grade='중2 · 유리수와 순환소수', help='유리수에 유리수를 더하거나 빼거나 곱해도 유리수예요(분수 ± 분수 = 분수).', mk=a,
             uses=[('m3', 3)]),
        dict(id='k2', name='서로소', grade='중1 · 소인수분해(최대공약수)', help='공약수가 1 뿐이어야 서로소 · 둘을 함께 나누는 수가 1 말고 또 있으면 서로소가 아니에요.', mk=b,
             uses=[('m2', 4)]),
        dict(id='k3', name='제곱근의 제곱', grade='중3 · 제곱근의 성질', help='(√3a)² = (√3)² × a² = 3a² · 루트는 제곱하면 벗겨져요.', mk=c,
             uses=[('m2', 2)]),
    ]
def k13():
    v1 = [('x − 5', lambda x: (x - 5) ** 2), ('x + 2', lambda x: (x + 2) ** 2), ('a − 1', lambda x: (x - 1) ** 2)]   # 수업 m1-1 · m2-3 = (a − b)² ≥ 0 · (x − 3)² ≥ 0
    def a(i):
        e, f = v1[i]; assert all(f(x / 4) >= 0 for x in range(-80, 81)) and any(f(x / 4) == 0 for x in range(-80, 81))
        return Q(f'{e[0]} 에 어떤 실수를 넣어도 ({e})² 의 값은?', '0 이상이다', ['0 보다 작다', '항상 0 보다 크다'], 1310 + i), '0 이상이다'
    v2 = [(2, '+'), (5, '−'), (4, '+')]                             # 수업 m2-2 = x² − 6x + 9 = (□)²
    def b(i):
        k, s = v2[i]; right = f'x {s} {k}'; o = '−' if s == '+' else '+'
        sg = 1 if s == '+' else -1
        assert all((x + sg * k) ** 2 == x * x + sg * 2 * k * x + k * k for x in range(-5, 6))
        return Q(f'x² {s} {2 * k}x + {k * k} = ( ? )² 에서 ( ) 안에 알맞은 식은?', right, [f'x {o} {k}', f'x {s} {k * k}'], 1320 + i), right
    v3 = [81, 100, 121]                                             # 수업 m3-2 = x + 4/x ≥ 2√4 = ? (수업 · 재도전 판은 4 ~ 64)
    def c(i):
        n = v3[i]; val = 2 * sq(n); assert sq(n) ** 2 == n
        return Q(f'x > 0 일 때 x + {n}/x ≥ 2√{n} = ?', str(val), [str(2 * n), str(sq(n))], 1330 + i), str(val)
    return [
        dict(id='k1', name='제곱한 수는 0 이상', grade='중1 · 정수와 유리수의 곱셈', help='양수든 음수든 제곱하면 양수 · 0 을 제곱하면 0 → 제곱한 값은 늘 0 이상이에요.', mk=a,
             uses=[('m1', 1), ('m2', 3)]),
        dict(id='k2', name='완전제곱식', grade='중3 · 인수분해 공식', help='x² ± 2kx + k² = (x ± k)² · 가운데 항의 절반을 제곱하면 끝 항이에요.', mk=b,
             uses=[('m2', 2), ('boss', 3)]),
        dict(id='k3', name='제곱근 계산', grade='중3 · 제곱근의 뜻', help='√81 = 9 처럼 제곱해서 그 수가 되는 양수 · 2√81 = 2 × 9.', mk=c,
             uses=[('m3', 2), ('m4', 3), ('boss', 4)]),
    ]

def count(pk, at):
    """그 칸의 소문제 수 · 팩이 올리는 꼴(mons · vers)이든 앱 꼴(monsters · first · chain.pool)이든"""
    if at == 'boss':
        return pk['boss']['items']
    m = (pk.get('mons') or pk.get('monsters'))[at]
    if 'vers' in m: return len(m['vers'][0])
    if isinstance(m.get('chain'), dict): return len(m['chain']['pool'][0])
    return len(m['first'])
def text(pk, at, n):
    if at == 'boss':
        b = pk['boss']; it = b['vers'][0][n - 1] if 'vers' in b else b['pool'][n - 1][0]
    else:
        m = (pk.get('mons') or pk.get('monsters'))[at]
        it = m['vers'][0][n - 1] if 'vers' in m else (m['chain']['pool'][0] if isinstance(m.get('chain'), dict) else m['first'])[n - 1]
    return (it.get('q') or it.get('question')).split('\n')[-1]

md = ['# 🔑 입장 열쇠 · 11 · 12 · 13차시 열쇠표 (v2 · 쓰이는 소문제와 같은 꼴 · 숫자만 다르게)', '', '열쇠 문제 = 3지선다 · 30초 · 판 0 + 다시 풀 판 2 · 틀리면 💡 한 줄 → 다시 풀면 열쇠.', '']
for no, fn, title in ((11, k11, '대우를 이용한 증명'), (12, k12, '귀류법'), (13, k13, '절대부등식')):
    pk = json.load(open(os.path.join(PACK, f'pack{no}.json'), encoding='utf8'))
    keys = []; seen = set()
    md += [f'## {no}차시 · {title}', '', '| 열쇠 | 중학교 어디 | 문제(판 0) | 정답 | 💡 한 줄 | 다시 풀 판 | 쓰이는 칸 |', '|---|---|---|---|---|---|---|']
    for k in fn():
        vers = []
        for i in range(3):
            it, want = k['mk'](i); assert it['ch'][int(it['a'])] == want, (no, k['id'], i); vers.append(it)
        assert len({v['q'] + '|'.join(sorted(v['ch'])) for v in vers}) == 3, (no, k['id'], '판끼리 같은 문제')
        uses = []
        for at, n in k['uses']:
            assert 1 <= n <= count(pk, at), (no, k['id'], at, n); assert (at, n) not in seen, ('한 칸에 열쇠 둘', no, at, n); seen.add((at, n))
            uses.append({'at': at, 'n': n})
        assert any(u['at'] != 'boss' for u in uses)
        keys.append({'id': k['id'], 'name': k['name'], 'grade': k['grade'], 'help': k['help'], 'vers': vers, 'uses': uses})
        v0 = vers[0]
        md.append(f'| 🔑 {k["name"]} | {k["grade"]} | {v0["q"]}<br>{" / ".join(v0["ch"])} | **{v0["ch"][int(v0["a"])]}** | {k["help"]} | ' +
                  '<br>'.join(f'{v["q"]} → {v["ch"][int(v["a"])]}' for v in vers[1:]) + ' | ' +
                  '<br>'.join(f'`{u["at"]}` {u["n"]}번 — {text(pk, u["at"], u["n"])[:46]}' for u in uses) + ' |')
    md.append('')
    json.dump({'lesson': no, 'pack': pk['id'], 'keys': keys}, open(os.path.join(HERE, f'keys-{no}.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, '열쇠표.md'), 'w', encoding='utf8').write('\n'.join(md) + '\n')
print('열쇠 9개 · 판 27 · 정답 다시 계산 · 쓰이는 칸 대조 끝')
