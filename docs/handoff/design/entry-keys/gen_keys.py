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

# 열쇠마다: id · 이름 · 중학교 어디 · 💡 한 줄 · 판 3개(문항 · 다시 계산한 정답) · 쓰이는 칸
def k11():
    v1 = [(2, '2k − 1', [1, 2, 3]), (2, '2k', [1, 2, 3]), (2, '2k + 1', [1, 2, 3])]
    def a(i):
        mul, e, ks = v1[i]; f = {'2k − 1': lambda k: 2 * k - 1, '2k': lambda k: 2 * k, '2k + 1': lambda k: 2 * k + 1}[e]
        vals = [f(k) for k in ks]; kind = '홀수' if all(x % 2 for x in vals) else '짝수'
        return Q(f'k = 1, 2, 3 을 차례로 넣으면 {e} 의 값은 {", ".join(map(str, vals))} 이다. k 가 자연수일 때 {e} 의 값은 어떤 수인가?', kind, [('짝수' if kind == '홀수' else '홀수'), '3의 배수'], 1110 + i), kind
    v2 = [(6, 4), (8, 6), (10, 4)]
    def b(i):
        p, q = v2[i]; right = f'{p // 2}k + {q // 2}'
        assert all(2 * (p // 2 * k + q // 2) == p * k + q for k in range(1, 6))
        return Q(f'{p}k + {q} = 2( ? ) 에서 ( ) 안에 알맞은 식은?', right, [f'{p // 2}k + {q}', f'{p}k + {q // 2}'], 1120 + i), right
    v3 = [(7, 3), (11, 3), (14, 3)]
    def c(i):
        n, m = v3[i]; r = n % m
        return Q(f'{eul(n)} {m} 으로 나눈 나머지는?', str(r), [str((r + 1) % 3), str((r + 2) % 3)], 1130 + i), str(r)
    return [
        dict(id='k1', name='짝수 · 홀수를 식으로', grade='중1 · 문자의 사용과 식의 값', help='2 × (자연수) 는 짝수 · 거기서 1 을 빼거나 더하면 홀수예요.', mk=a,
             uses=[('m2', 2), ('boss', 3)]),
        dict(id='k2', name='2 로 묶어 내기', grade='중3 · 인수분해(공통인수)', help='각 항을 2 로 나눈 것을 괄호 안에 써요. 6k + 4 = 2 × 3k + 2 × 2.', mk=b,
             uses=[('m2', 3), ('m3', 3), ('m3', 4), ('boss', 4)]),
        dict(id='k3', name='3 으로 나눈 나머지', grade='중1 · 소인수분해(배수와 나머지)', help='3 으로 나눈 나머지는 0, 1, 2 뿐 · 나머지가 0 이면 3 의 배수예요.', mk=c,
             uses=[('m3', 2)]),
    ]
def k12():
    v1 = [('0.5', '√2', 'π'), ('3/4', '√3', 'π'), ('−2', '√5', '√2')]
    def a(i):
        r, t1, t2 = v1[i]
        return Q('유리수는 (정수) / (0 이 아닌 정수) 꼴의 분수로 나타낼 수 있는 수이다. 다음 중 유리수는?', r, [t1, t2], 1210 + i), r
    v2 = [((4, 9), (6, 9), (4, 10)), ((8, 15), (6, 15), (8, 12)), ((9, 10), (9, 12), (10, 15))]
    def b(i):
        opts = v2[i]; good = [o for o in opts if math.gcd(*o) == 1]; assert len(good) == 1 and good[0] == opts[0]
        s = lambda o: f'{gwa(o[0])} {o[1]}'
        return Q('공약수가 1 뿐인 두 자연수를 서로소라고 한다. 다음 중 서로소인 두 수는?', s(opts[0]), [s(opts[1]), s(opts[2])], 1220 + i), s(opts[0])
    v3 = [(2, 3), (3, 2), (2, 5)]
    def c(i):
        r, m = v3[i]; val = r * m * m
        return Q(f'(√{r} × {m})² 의 값은?', str(val), [str(r * m), str(r * r * m)], 1230 + i), str(val)
    return [
        dict(id='k1', name='유리수와 분수 꼴', grade='중2 · 유리수와 순환소수 / 중3 · 제곱근과 실수', help='분수로 쓸 수 있으면 유리수 · √2, π 처럼 분수로 쓸 수 없으면 유리수가 아니에요.', mk=a,
             uses=[('m2', 1), ('m3', 3), ('boss', 2)]),
        dict(id='k2', name='서로소', grade='중1 · 소인수분해(최대공약수)', help='두 수를 함께 나누는 수가 1 뿐이면 서로소 · 둘 다 짝수면 2 로 나누어져 서로소가 아니에요.', mk=b,
             uses=[('m2', 4)]),
        dict(id='k3', name='제곱근의 제곱', grade='중3 · 제곱근의 성질', help='(√a)² = a · 곱의 제곱은 각각 제곱해서 곱해요. (√2 × 3)² = 2 × 9.', mk=c,
             uses=[('m2', 2)]),
    ]
def k13():
    v1 = [-3, -5, -4]
    def a(i):
        n = v1[i]; val = n * n
        return Q(f'({str(n).replace("-", "−")})² 의 값은?', str(val), [f'−{val}', f'−{2 * -n}'], 1310 + i), str(val)
    v2 = [(2, '+'), (5, '−'), (4, '+')]
    def b(i):
        k, s = v2[i]; right = f'x {s} {k}'; o = '−' if s == '+' else '+'
        sg = 1 if s == '+' else -1
        assert all((x + sg * k) ** 2 == x * x + sg * 2 * k * x + k * k for x in range(-5, 6))
        return Q(f'x² {s} {2 * k}x + {k * k} = ( ? )² 에서 ( ) 안에 알맞은 식은?', right, [f'x {o} {k}', f'x {s} {k * k}'], 1320 + i), right
    v3 = [9, 16, 25]
    def c(i):
        n = v3[i]; val = 2 * sq(n); assert sq(n) ** 2 == n
        return Q(f'2√{n} 의 값은?', str(val), [str(2 * n), str(sq(n))], 1330 + i), str(val)
    return [
        dict(id='k1', name='제곱한 수는 0 이상', grade='중1 · 정수와 유리수의 곱셈', help='음수를 제곱해도 양수 · 어떤 실수든 제곱하면 0 이상이에요.', mk=a,
             uses=[('m1', 1), ('m2', 3)]),
        dict(id='k2', name='완전제곱식', grade='중3 · 인수분해 공식', help='x² ± 2kx + k² = (x ± k)² · 가운데 항의 절반을 제곱하면 끝 항이에요.', mk=b,
             uses=[('m2', 2), ('boss', 3)]),
        dict(id='k3', name='제곱근 계산', grade='중3 · 제곱근의 뜻', help='√9 = 3 처럼 제곱해서 그 수가 되는 양수 · 2√9 = 2 × 3.', mk=c,
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

md = ['# 🔑 입장 열쇠 · 11 · 12 · 13차시 열쇠표', '', '열쇠 문제 = 3지선다 · 30초 · 판 0 + 다시 풀 판 2 · 틀리면 💡 한 줄 → 다시 풀면 열쇠.', '']
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
