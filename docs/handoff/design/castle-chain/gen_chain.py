#!/usr/bin/env python3
"""🏰 성채 서술형 7방 = 소레이드화 (🌊 설계 묶음 #5 · 설계 방)

python3 gen_chain.py <성채 팩 폴더(eval-1 · 2 · 3.json)>  →  castle-chain.json (바꿔 넣을 방 7개 · 판 0~6) · 단계표.md
문제 글 · 숫자 · 마지막 정답은 팩 그대로. 풀이만 단계(졸개 → 대장)로 쪼개고 「나의 풀이」 한 줄(say) · 💡 근거 줄(why)을 더한다.
- 이미 소레이드인 방(1층 07 · 11 · 3층 15): 단계 · 정답 그대로 + 문제 전체를 단계 글 맨 위에(1층) + 근거 줄 1개
- 단계 꼴이지만 chain 이 아니던 방(3층 16 · 17): chain 켬 + say + 근거 줄 (17 은 전개 단계 1개 더함)
- 답 하나만 묻던 방(2층 07 · 10): 판마다 그 판 숫자로 5단계를 새로 씀(마지막 답 = 팩의 답과 같은지 대조)
"""
import json, os, re, sys, random, copy
from fractions import Fraction as F
HERE = os.path.dirname(os.path.abspath(__file__)); PACK = sys.argv[1]
def load(n): return json.load(open(os.path.join(PACK, f'eval-{n}.json'), encoding='utf8'))
def room(pk, rid): return copy.deepcopy([r for r in pk['rooms'] if r['id'] == rid][0])
def neg(n): return str(n) if n >= 0 else '−' + str(-n)
def fr(x): x = F(x); return neg(x.numerator) if x.denominator == 1 else f'{neg(x.numerator)}/{x.denominator}'
def shuf(correct, traps, seed):
    ch = [correct] + traps; assert len(set(ch)) == len(ch), ch
    random.Random(seed).shuffle(ch); return ch, str(ch.index(correct))
def C(q, correct, traps, sol, say, seed, **kw):
    ch, a = shuf(correct, traps, seed); d = {'type': 'choice', 'q': q, 'a': a, 'ch': ch, 'sol': sol, 'say': say}; d.update(kw); return d
def MU(q, good, traps, sol, say, seed, **kw):
    ch = good + traps; assert len(set(ch)) == len(ch); random.Random(seed).shuffle(ch)
    d = {'type': 'multi', 'q': q, 'a': ','.join(str(ch.index(g)) for g in good), 'ch': ch, 'sol': sol, 'say': say}; d.update(kw); return d
def NUM(q, a, sol, say, **kw):
    d = {'type': 'number', 'q': q, 'a': a, 'ch': [], 'sol': sol, 'say': say}; d.update(kw); return d
def WHY(pre, choices, post=''):
    return {'pre': pre, 'post': post, 'choices': choices, 'answer': 0, 'text': (pre + ' ' + choices[0] + (' ' + post if post else '')).strip()}
W_UNION = WHY('∵ n(A ∩ B) = n(A) + n(B) −', ['n(A ∪ B)', 'n(U)', 'n(A)'], '(합집합의 원소의 개수)')
W_SUBSETS = WHY('∵ 원소가 n 개인 집합의 부분집합의 개수 =', ['2ⁿ', 'n²', '2n'])
CIRC = '①②③④⑤⑥'

def relabel(vv, head):
    """단계 글 맨 위에 문제 전체(P1) · 번호 ① ② … 마지막은 👑"""
    for i, it in enumerate(vv):
        body = it['q'].split('\n')[-1]; body = re.sub(r'^(①|②|③|④|⑤|👑)\s*', '', body)
        it['q'] = f'{head}\n{"👑" if i == len(vv) - 1 else CIRC[i]} {body}'
    return vv

# ── 1층 07 조건을 만족하는 X ──
def e1q07(pk):
    r = room(pk, 'q07')
    for vv in r['vers']:
        A, B = (g['label'] for g in vv[0]['groups'])
        relabel(vv, f'07 두 집합 {A}, {B} 에 대하여 A ∩ X = ∅ 과 B ∪ X = B 를 만족시키는 집합 X 의 개수는?')
        vv[3]['why'] = W_SUBSETS
    r['note'] = 'A, B 나열 → 조건의 뜻 → X 에 들어갈 원소 → 2ⁿ'
    return r
# ── 1층 11 겹침의 최대 · 최소 ──
def e1q11(pk):
    r = room(pk, 'q11')
    for vv in r['vers']:
        T, a, b = map(int, re.search(r'회원 (\d+)명 중 A 코스 (\d+)명, B 코스 (\d+)명', vv[0]['q']).groups())
        vv[0]['q'] = '두 코스를 모두 다녀온 회원 수가 가장 많을 때는?'
        relabel(vv, f'11 동아리 회원 {T}명 중 A 코스를 다녀온 회원은 {a}명, B 코스는 {b}명이다. 두 코스를 모두 다녀온 회원 수의 최댓값과 최솟값은?')
        vv[3]['why'] = W_UNION
    r['note'] = '가장 많을 때 → 최댓값 → 가장 적을 때 → 최솟값'
    return r
# ── 3층 15 두 동아리 ──
def e3q15(pk):
    r = room(pk, 'q15')
    for vv in r['vers']: vv[0]['why'] = W_UNION
    r['note'] = '둘 다 가입한 학생 수 → 한 곳만 가입한 남 · 여 → 식 두 개 → 여학생 수'
    return r
# ── 2층 07 역이 참이 되는 a (새 소레이드) ──
def e2q07(pk):
    r = room(pk, 'q07'); out = []
    for v, vv in enumerate(r['vers']):
        o = vv[0]; k2, sg, c, rr = re.search(r'x² − (\d+)a² ≤ 0, q: \|x (−|\+) (\d+)\| ≤ (\d+)', o['q']).groups()
        k = int(int(k2) ** .5); assert k * k == int(k2); c = int(c) * (1 if sg == '−' else -1); rr = int(rr)
        lo, hi = c - rr, c + rr; need = max(abs(lo), abs(hi)); amin = -(-need // k); assert str(amin) == o['a'], (v, amin, o['a'])
        head = o['q'].replace(' (풀이는 학습지에)', '')
        ab = f'|x {sg} {abs(c)}|'
        out.append([
            C(f'{head}\n① 조건 p 의 진리집합 P 는?', f'{{x | −{k}a ≤ x ≤ {k}a}}', [f'{{x | x ≤ −{k}a 또는 x ≥ {k}a}}', f'{{x | −{k2}a ≤ x ≤ {k2}a}}'],
              f'x² − {k2}a² = (x + {k}a)(x − {k}a) ≤ 0 → −{k}a ≤ x ≤ {k}a', f'x² − {k2}a² ≤ 0 에서 (x + {k}a)(x − {k}a) ≤ 0 이므로 P = {{x | −{k}a ≤ x ≤ {k}a}} 이다.', 7100 + v),
            C(f'{head}\n② 조건 q 의 진리집합 Q 는?', f'{{x | {neg(lo)} ≤ x ≤ {hi}}}', [f'{{x | −{rr} ≤ x ≤ {rr}}}', f'{{x | x ≤ {neg(lo)} 또는 x ≥ {hi}}}'],
              f'−{rr} ≤ x {sg} {abs(c)} ≤ {rr} → {neg(lo)} ≤ x ≤ {hi}', f'{ab} ≤ {rr} 에서 −{rr} ≤ x {sg} {abs(c)} ≤ {rr} 이므로 Q = {{x | {neg(lo)} ≤ x ≤ {hi}}} 이다.', 7110 + v),
            C(f'{head}\n③ 「명제 p → q 의 역이 참」을 진리집합 P, Q 로 나타내면?', 'Q ⊂ P', ['P ⊂ Q', 'P ∩ Q = ∅'],
              '역 = q → p · q → p 가 참 ⇔ Q ⊂ P', '명제 p → q 의 역 q → p 가 참이려면 Q ⊂ P 이어야 한다.', 7120 + v,
              why=WHY('∵ 명제 p → q 의 역은', ['q → p', '~q → ~p', '~p → ~q'])),
            MU(f'{head}\n④ Q ⊂ P 가 되기 위해 맞는 식을 모두 고르시오.', [f'−{k}a ≤ {neg(lo)}', f'{hi} ≤ {k}a'], [f'{k}a ≤ {hi}', f'{neg(lo)} ≤ −{k}a', f'{k}a ≤ {neg(lo)}'],
               'Q 의 왼쪽 끝 · 오른쪽 끝이 모두 P 안에', f'Q ⊂ P 이려면 −{k}a ≤ {neg(lo)} 이고 {hi} ≤ {k}a 이어야 한다.', 7130 + v),
            NUM(f'{head}\n👑 그러므로 자연수 a 의 최솟값은?', o['a'], f'a ≥ {fr(F(-lo, k))} 이고 a ≥ {fr(F(hi, k))} → a ≥ {fr(F(need, k))}',
                f'두 식에서 a ≥ {fr(F(-lo, k))}, a ≥ {fr(F(hi, k))} 이므로 a ≥ {fr(F(need, k))} 이다. 그러므로 자연수 a 의 최솟값은 {amin} 이다.', ref='07'),
        ])
    r['vers'] = out; r['chain'] = True; r['note'] = 'P → Q → 역이 참 = Q ⊂ P → 양 끝 식 두 개 → 최솟값'
    return r
# ── 2층 10 두 명제가 거짓 (새 소레이드) ──
def e2q10(pk):
    r = room(pk, 'q10'); out = []
    for v, vv in enumerate(r['vers']):
        o = vv[0]; b2, c, s2 = map(int, re.search(r'ax² \+ (\d+)x − (\d+) ≥ 0, q: x² \+ 2bx \+ (\d+) > 0', o['q']).groups())
        k = b2 // 2; s = int(s2 ** .5); assert s * s == s2
        Mx = -(k * k // c) - 1; assert neg(Mx + s) == o['a'], (v, Mx + s, o['a'])
        head = o['q'].replace(' (풀이는 학습지에)', '')
        P = f'ax² + {b2}x − {c}'; Q = f'x² + 2bx + {s2}'
        out.append([
            C(f'{head}\n① (가) 「어떤 실수 x 에 대하여 p 이다」가 거짓이라는 것은?', f'모든 실수 x 에 대하여 {P} < 0 이다', [f'모든 실수 x 에 대하여 {P} ≥ 0 이다', f'어떤 실수 x 에 대하여 {P} < 0 이다'],
              '거짓인 명제의 부정은 참 · 「어떤 … p」의 부정 = 「모든 … ~p」', f'(가)가 거짓이므로 그 부정 「모든 실수 x 에 대하여 {P} < 0」 이 참이다.', 7200 + v,
              why=WHY('∵ 「어떤 x 에 대하여 p」의 부정은', ['「모든 x 에 대하여 ~p」', '「어떤 x 에 대하여 ~p」', '「모든 x 에 대하여 p」'])),
            MU(f'{head}\n② 모든 실수 x 에 대하여 {P} < 0 이 되기 위해 맞는 조건을 모두 고르시오. (D 는 판별식)', ['a < 0', 'D < 0'], ['a > 0', 'D > 0', 'D = 0'],
               '위로 볼록(a < 0)이고 x 축과 만나지 않음(D < 0)', f'모든 실수 x 에 대하여 {P} < 0 이려면 a < 0 이고 판별식 D < 0 이어야 한다.', 7210 + v),
            NUM(f'{head}\n③ D/4 = {k * k} + {c}a < 0 을 풀어, 정수 a 의 최댓값 M 을 구하면?', neg(Mx), f'{k * k} + {c}a < 0 → a < {fr(F(-k * k, c))} → M = {neg(Mx)}',
                f'D/4 = {k}² + {c}a < 0 에서 a < {fr(F(-k * k, c))} 이므로 정수 a 의 최댓값 M = {neg(Mx)} 이다.'),
            C(f'{head}\n④ (가)가 거짓이면 ~p 는 모든 실수에서 참이다. 이때 (나) 「~p 는 q 이기 위한 충분조건」이 거짓이 되려면?', f'q 가 참이 아닌 실수 x 가 있다 → b² − {s2} ≥ 0',
              [f'q 가 모든 실수 x 에서 참이다 → b² − {s2} < 0', f'q 가 참인 실수 x 가 없다 → b² − {s2} > 0'],
              f'~p 의 진리집합 = 실수 전체 → (나) 거짓 ⇔ {Q} ≤ 0 인 x 가 있음 ⇔ D/4 = b² − {s2} ≥ 0',
              f'~p 의 진리집합이 실수 전체이므로, (나)가 거짓이려면 {Q} ≤ 0 인 실수 x 가 있어야 한다. 곧 D/4 = b² − {s2} ≥ 0 이다.', 7230 + v),
            NUM(f'{head}\n👑 b² − {s2} ≥ 0 인 자연수 b 의 최솟값 m 을 구하면, 그러므로 M + m 의 값은?', o['a'], f'b² ≥ {s2} → m = {s} · M + m = {neg(Mx)} + {s} = {neg(Mx + s)}',
                f'b² ≥ {s2} 에서 자연수 b 의 최솟값 m = {s} 이다. 그러므로 M + m = {neg(Mx)} + {s} = {neg(Mx + s)} 이다.', ref='10'),
        ])
    r['vers'] = out; r['chain'] = True; r['note'] = '(가)의 부정 → a < 0, D < 0 → M → (나)의 뜻 → m → M + m'
    return r
# ── 3층 16 귀류법 ──
def e3q16(pk):
    r = room(pk, 'q16')
    for vv in r['vers']:
        k = re.search(r'√(\d+)', vv[0]['q']).group(1)
        says = [f'√{k} 가 유리수라고 가정하자.',
                f'√{k} = m/n (m, n 은 서로소인 자연수)이라 하면 양변을 제곱하여 m² = {k}n² 이다. 따라서 m 은 {k} 의 배수이다.',
                f'm = {k}t (t 는 자연수)라 하면 {int(k) ** 2}t² = {k}n², 곧 n² = {k}t² 이므로 n 도 {k} 의 배수이다.',
                f'그러므로 m, n 이 모두 {k} 의 배수가 되어 m, n 이 서로소라는 것에 모순이다. 따라서 √{k} 는 유리수가 아니다.']
        for it, s in zip(vv, says): it['say'] = s
        vv[0]['why'] = WHY('∵ 결론을 부정하여 모순을 이끌어 내는 증명법 =', ['귀류법', '대우를 이용한 증명', '직접 증명'])
        vv[3]['q'] = vv[3]['q'].replace('\n④ ', '\n👑 ')
    r['chain'] = True; r['note'] = '결론 부정 → m² = kn² → n² = kt² → 서로소에 모순'
    return r
# ── 3층 17 👑 절대부등식 증명 ──
def e3q17(pk):
    r = room(pk, 'q17'); out = []
    for v, vv in enumerate(r['vers']):
        head = vv[0]['q'].split('\n')[0]
        new = C(f'{head}\n② (좌변) − (우변) 을 전개하여 정리하면?', 'a³ + b³ − a²b − ab²', ['a³ + b³ + a²b + ab²', 'a³ − b³'],
                '2a³ + 2b³ − (a³ + ab² + a²b + b³) = a³ + b³ − a²b − ab²', '2(a³ + b³) − (a + b)(a² + b²) = a³ + b³ − a²b − ab²', 7300 + v)
        a, b, c, d = (copy.deepcopy(x) for x in vv)
        a['say'] = '(좌변) − (우변) ≥ 0 임을 보이면 된다.'
        b['q'] = f'{head}\n③ a³ + b³ − a²b − ab² 을 인수분해하면?'; b['sol'] = 'a²(a − b) − b²(a − b) = (a − b)(a² − b²) = (a + b)(a − b)²'; b['say'] = '= a²(a − b) − b²(a − b) = (a + b)(a − b)²'
        c['q'] = f'{head}\n④ (a + b)(a − b)² 이 0 이상인 까닭은?'
        c['say'] = 'a > 0, b > 0 이므로 a + b > 0 이고 (a − b)² ≥ 0 이다. 따라서 (좌변) − (우변) ≥ 0, 곧 2(a³ + b³) ≥ (a + b)(a² + b²) 이다.'
        c['why'] = WHY('∵ 실수를 제곱한 값은 항상', ['0 이상', '0 보다 큼', '0 이하'])
        d['q'] = f'{head}\n👑 등호가 성립하는 조건은?'; d['say'] = '여기서 등호는 a = b 일 때 성립한다.'
        out.append([a, new, b, c, d])
    r['vers'] = out; r['chain'] = True; r['note'] = '(좌변) − (우변) → 전개 → 인수분해 → 0 이상인 까닭 → 등호'
    return r

RUB = {  # 단계 → 기준표 칸
 ('eval-1', 'q07'): ['(준비)', 's1 · s2', 's3', 's4'], ('eval-1', 'q11'): ['s2', 's3', 's2', 's4 (+ 근거 줄 = s1)'],
 ('eval-2', 'q07'): ['s1', 's2', 's3', 's4', 's4'], ('eval-2', 'q10'): ['s1', 's2', 's2', 's3 · s4', 's4 · s5'],
 ('eval-3', 'q15'): ['s1', '(준비)', 's2 · s3', 's4'], ('eval-3', 'q16'): ['s1', 's2', 's3', 's4'], ('eval-3', 'q17'): ['(방법)', 's1', 's2', 's3', 's4'],
}
if __name__ == '__main__':
    P = {n: load(n) for n in (1, 2, 3)}
    out = {'eval-1': {'q07': e1q07(P[1]), 'q11': e1q11(P[1])}, 'eval-2': {'q07': e2q07(P[2]), 'q10': e2q10(P[2])},
           'eval-3': {'q15': e3q15(P[3]), 'q16': e3q16(P[3]), 'q17': e3q17(P[3])}}
    md = ['# 🏰 성채 서술형 7방 · 소레이드 단계표 (판 0 = 성채 학습지와 같은 숫자)', '']
    for pid, rs in out.items():
        for rid, r in rs.items():
            n = len(r['vers'][0]); r['card'] = f'⚔ 소레이드 · {n}단계 · 📷 서술형'
            assert all(len(vv) == n and [i['type'] for i in vv] == [i['type'] for i in r['vers'][0]] for vv in r['vers']), (pid, rid)
            assert all('say' in it for vv in r['vers'] for it in vv), (pid, rid)
            md += [f'## {pid[-1]}층 {rid[1:]} · {r["title"]} — {r["card"]}', '', f'> {r["vers"][0][0]["q"].split(chr(10))[0]}', '',
                   '| 단계 | 묻는 것 | 답 꼴 | 정답 | 💡 근거 줄 | 「나의 풀이」에 쌓일 한 줄 | 기준표 |', '|---|---|---|---|---|---|---|']
            for i, it in enumerate(r['vers'][0]):
                ask = it['q'].split('\n')[-1]
                ans = ' · '.join(it['ch'][int(x)] for x in it['a'].split(',')) if it['ch'] else it['a']
                kind = {'choice': f'고르기({len(it["ch"])})', 'multi': f'모두 고르기({len(it["ch"])})', 'number': '숫자 칸'}[it['type']]
                why = it['why']['pre'] + ' ( ' + it['why']['choices'][0] + ' ) ' + it['why']['post'] if 'why' in it else '—'
                md.append(f'| {"👑 대장" if i == n - 1 else "졸개 " + str(i + 1)} | {ask} | {kind} | {ans} | {why} | {it["say"]} | {RUB[(pid, rid)][i]} |')
            md.append('')
    json.dump(out, open(os.path.join(HERE, 'castle-chain.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    open(os.path.join(HERE, '단계표.md'), 'w', encoding='utf8').write('\n'.join(md) + '\n')
    print('방 7개 ·', {f'{p[-1]}층 {r[1:]}': len(x['vers'][0]) for p, rs in out.items() for r, x in rs.items()})
