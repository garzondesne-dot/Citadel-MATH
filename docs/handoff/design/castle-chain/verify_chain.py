#!/usr/bin/env python3
"""🏰 성채 서술형 소레이드 · 검산 — python3 verify_chain.py <성채 팩 폴더>
① 문제 글(첫 줄의 숫자) · 마지막 정답이 원래 팩과 같은지 ② 원래 있던 단계의 꼴 · 정답 · 보기가 그대로인지
③ 새로 쓴 2층 07 · 10 의 단계 정답을 직접 대입해 다시 계산 ④ 3층 17 전개 · 인수분해를 숫자 대입으로 확인"""
import json, os, re, sys
from fractions import Fraction as F
HERE = os.path.dirname(os.path.abspath(__file__)); PACK = sys.argv[1]
new = json.load(open(os.path.join(HERE, 'castle-chain.json'), encoding='utf8'))
XS = [F(n, 8) for n in range(-240, 241)]
def pick(it): return [it['ch'][int(i)] for i in it['a'].split(',')]
def num(s): return int(s.replace('−', '-'))
bad = []; n_items = 0
for pid, rooms in new.items():
    pk = json.load(open(os.path.join(PACK, pid + '.json'), encoding='utf8'))
    for rid, r in rooms.items():
        o = [x for x in pk['rooms'] if x['id'] == rid][0]
        for k in ('id', 'no', 'title', 'sprite', 'photo'): assert r.get(k) == o.get(k), (pid, rid, k)
        assert r['chain'] is True and len(r['vers']) == 7
        for v, (nv, ov) in enumerate(zip(r['vers'], o['vers'])):
            n_items += len(nv)
            if nv[-1]['a'] != ov[-1]['a']: bad.append((pid, rid, v, '마지막 정답이 팩과 다름'))
            nums = lambda s: re.findall(r'\d+', s)
            # 문제에 나온 숫자가 모두 새 단계 글 첫 줄에 있는지
            src = ' '.join(i['q'] for i in ov) if (pid, rid) not in (('eval-1', 'q07'),) else ' '.join(g['label'] for g in ov[0]['groups'])
            head = nv[0]['q'].split('\n')[0]
            if (pid, rid) in (('eval-2', 'q07'), ('eval-2', 'q10')):
                if head != ov[0]['q'].replace(' (풀이는 학습지에)', ''): bad.append((pid, rid, v, '문제 글이 다름'))
            if len(nv) == len(ov):                       # 단계 수가 같은 방 = 꼴 · 정답 · 보기 그대로
                for a, b in zip(nv, ov):
                    if (a['type'], a['a'], a['ch']) != (b['type'], b['a'], b['ch']): bad.append((pid, rid, v, '원래 단계가 바뀜'))
            if (pid, rid) == ('eval-2', 'q07'):
                k2, sg, c, rr = re.search(r'x² − (\d+)a² ≤ 0, q: \|x (−|\+) (\d+)\| ≤ (\d+)', head).groups()
                k2, c, rr = int(k2), int(c) * (1 if sg == '−' else -1), int(rr)
                Q = [x for x in XS if abs(x - c) <= rr]; lo, hi = min(Q), max(Q)
                amin = min(a for a in range(1, 80) if all(x * x - k2 * a * a <= 0 for x in Q))
                k = int(k2 ** .5)
                exp = [[f'{{x | −{k}a ≤ x ≤ {k}a}}'], [f'{{x | {str(lo).replace("-", "−")} ≤ x ≤ {hi}}}'], ['Q ⊂ P'], None, str(amin)]
                for a in (1, 2, 5):                      # ① P 꼴 = 직접 대입
                    P = [x for x in XS if x * x - k2 * a * a <= 0]; assert (min(P), max(P)) == (-k * a, k * a) or k * a > 30
                good4 = pick(nv[3])                      # ④ 고른 식 = a 가 최솟값 이상일 때 꼭 참 · 고르지 않은 식은 그렇지 않음
                def ev(e, a): return eval(e.replace('−', '-').replace('a', f'*{a}').replace('≤', '<='))
                for e in nv[3]['ch']:
                    always = all(ev(e, a) for a in range(amin, amin + 6)); needed = (e in good4)
                    if always != needed: bad.append((pid, rid, v, '④ 식', e))
                if not all(all(ev(e, a) for e in good4) == (a >= amin) for a in range(1, 40)): bad.append((pid, rid, v, '④ 두 식 ⇔ a ≥ 최솟값 이 아님'))
                for i in (0, 1, 2):
                    if pick(nv[i]) != exp[i]: bad.append((pid, rid, v, i + 1, pick(nv[i]), exp[i]))
                if nv[4]['a'] != exp[4]: bad.append((pid, rid, v, 5, nv[4]['a'], exp[4]))
            if (pid, rid) == ('eval-2', 'q10'):
                b2, c, s2 = map(int, re.search(r'ax² \+ (\d+)x − (\d+) ≥ 0, q: x² \+ 2bx \+ (\d+) > 0', head).groups())
                big = [F(n, 840) for n in range(-8400, 8401)]      # −10 ~ 10 · 분모 840(2~8 의 공배수) → 꼭짓점 x = −k/a 가 표본에 들어감
                M = max(a for a in range(-80, 0) if all(a * x * x + b2 * x - c < 0 for x in big))
                assert not all((M + 1) * x * x + b2 * x - c < 0 for x in big)
                m = min(b for b in range(1, 80) if any(x * x + 2 * b * x + s2 <= 0 for x in big))
                if num(nv[2]['a']) != M: bad.append((pid, rid, v, 'M', nv[2]['a'], M))
                if num(nv[4]['a']) != M + m: bad.append((pid, rid, v, 'M + m', nv[4]['a'], M + m))
                if sorted(pick(nv[1])) != ['D < 0', 'a < 0']: bad.append((pid, rid, v, '②'))
                if f'D/4 = {(b2 // 2) ** 2} + {c}a < 0' not in nv[2]['q']: bad.append((pid, rid, v, '③ 판별식 글'))
                if not pick(nv[0])[0].startswith('모든 실수 x 에 대하여') or '< 0' not in pick(nv[0])[0]: bad.append((pid, rid, v, '①'))
                if '참이 아닌 실수 x 가 있다' not in pick(nv[3])[0] or f'b² − {s2} ≥ 0' not in pick(nv[3])[0]: bad.append((pid, rid, v, '④'))
            if (pid, rid) == ('eval-3', 'q17'):
                for a in (1, 2, 3, 5):
                    for b in (1, 2, 4, 7):
                        d = 2 * (a ** 3 + b ** 3) - (a + b) * (a * a + b * b)
                        assert d == a ** 3 + b ** 3 - a * a * b - a * b * b == (a + b) * (a - b) ** 2 >= 0
                if pick(nv[1]) != ['a³ + b³ − a²b − ab²'] or pick(nv[2]) != ['(a + b)(a − b)²'] or pick(nv[4]) != ['a = b']: bad.append((pid, rid, v, '17 단계'))
                if [(x['type'], x['a'], x['ch']) for x in (nv[0], nv[2], nv[3], nv[4])] != [(x['type'], x['a'], x['ch']) for x in ov]: bad.append((pid, rid, v, '17 원래 단계가 바뀜'))
            for it in nv:
                if 'why' in it: assert it['why']['answer'] == 0 and len(set(it['why']['choices'])) == 3
                if it['ch']: assert len(set(it['ch'])) == len(it['ch']) or 'groups' in it, (pid, rid, v)
print('방 7 · 판 7 · 단계', n_items, '· 문제', len(bad))
for b in bad: print('  ❌', b)
sys.exit(1 if bad else 0)
