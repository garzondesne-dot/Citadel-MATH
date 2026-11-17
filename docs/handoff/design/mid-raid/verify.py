#!/usr/bin/env python3
"""🏰 중단원 레이드 팩 · 정답 독립 검산 (gen.py 의 식을 쓰지 않고 직접 세어 다시 계산)

python3 verify.py [성채 팩 폴더]  →  검산표.md
① 문항마다 par(숫자)로 정답을 다시 구해 팩의 a 와 대조 ② par 숫자가 문제 글에 실제로 들어 있는지
③ 꼴 검사(PACK-GUIDE 7 · 14 · 16절) ④ (폴더를 주면) 성채 1 · 2층 팩과 문제 글이 겹치지 않는지
"""
import json, os, re, sys, itertools
from fractions import Fraction as F

HERE = os.path.dirname(os.path.abspath(__file__))
THEMES = {'01-burrow', '02-deep-forest', '04-mine', '05-ruins', '06-frost', '07-volcano', '11-keyvault', '12-skygarden'}
SPR = {'base0', 'base1', 'base2', 'garden0', 'garden1', 'garden2', 'garden3', 'garden4', 'gardenboss0', 'keyvault0', 'keyvault1', 'keyvault2',
       'keyvault3', 'keyvault4', 'keyvaultboss0', 'mirror0', 'mirror1', 'mirror2', 'mirror3', 'mirror4', 'mirrorboss80'}
PRED = {'홀수': lambda x: x % 2 == 1, '짝수': lambda x: x % 2 == 0, '3의 배수': lambda x: x % 3 == 0, '4의 배수': lambda x: x % 4 == 0, '5의 배수': lambda x: x % 5 == 0}
XS = [F(n, 4) for n in range(-80, 81)]          # 실수 대신 촘촘한 유리수 표본(−20 ~ 20 · 0.25 간격)
def picked(it): return [it['ch'][int(i)] for i in it['a'].split(',')]
def num(s): return int(s.replace('−', '-'))
def subsets(xs): return [set(c) for r in range(len(xs) + 1) for c in itertools.combinations(xs, r)]

def cond(expr):
    """문제 4 의 조건 글 → 판별 함수(x 또는 (a, b))"""
    e = expr.replace('−', '-').replace('²', '**2').replace('≤', '<=').replace('≥', '>=')
    e = re.sub(r'\bab\b', 'a*b', e)
    e = re.sub(r'\|([^|]+)\|', r'abs(\1)', e)
    e = re.sub(r'(?<![<>=!])=(?!=)', '==', e)
    return e

def recompute(it):
    p = it['par']; k = p['k']
    if k == 'div':   return sorted(str(d) for d in range(1, p['n'] + 1) if p['n'] % d == 0)
    if k == 'quad':  return sorted(str(x).replace('-', '−') for x in range(-30, 31) if x * x - p['b'] * x + p['c'] == 0)
    if k == 'relpred':
        ok = all(PRED[p['pred']](x) for x in p['A']); return ['A ⊂ B' if ok else '포함 관계가 없다']
    if k == 'reldiv':
        D = {d for d in range(1, p['n'] + 1) if p['n'] % d == 0}; S = set(p['S'])
        A, B = (D, S) if p['mode'] in ('B', 'X') else (S, D)
        return ['A = B' if A == B else 'A ⊂ B' if A <= B else 'B ⊂ A' if B <= A else '포함 관계가 없다']
    if k == 'ops':
        U = set(range(1, 11)); A = set(p['A']); B = {d for d in U if p['n'] % d == 0}
        R = {'i': A & B, 'u': A | B, 'c': U - A, 'd': A - B}[p['op']]; return sorted(str(x) for x in R)
    if k == 'comp':
        U = set(range(1, p['u'] + 1)); A = {x for x in U if x % p['a'] == 0}; B = {x for x in U if p['b'] % x == 0}
        return {1: ['(A ∪ B)ᶜ'], 2: [f'n(A) = {len(A)}, n(B) = {len(B)}'], 3: str(len(A | B)), 4: str(len((U - A) & (U - B)))}[p['step']]
    if k == 'isset': return None                      # 문장 판단 = 눈으로 확인
    if k == 'inter': return str(p['a'] + p['b'] - p['u'])
    if k == 'disj':
        U = list(range(1, p['n'] + 1)); A = set(p['A'])
        return sorted(('{' + ', '.join(map(str, sorted(s))) + '}') if s else '∅' for s in subsets(U) if not (s & A))
    if k == 'mult':
        return str(sum(1 for x in range(1, 101) if x % p['p'] == 0 and (x % p['q'] == 0 or x % p['t'] == 0)))
    if k == 'truth':
        U = range(1, p['n'] + 1); P = {x for x in U if x * x - p['b'] * x + p['c'] == 0}; Q = {x for x in U if x * x - p['t2'] * x + p['tt'] > 0}
        R = {'p': P, 'q': Q, 'np': set(U) - P, 'nq': set(U) - Q}[p['w']]; return sorted(str(x) for x in R)
    if k == 'negall':
        orig = all(x * x > p['b'] * x - p['c'] for x in XS)          # 처음 명제(모든 x)
        e = ('' if p['b'] == 1 else str(p['b'])) + f"x − {p['c']}"
        return [f'어떤 실수 x에 대하여 x² ≤ {e} — {"거짓" if orig else "참"}']
    if k == 'negsome':
        orig = any(abs(p['m'] * x - p['n']) < 0 for x in XS)
        return [f"모든 실수 x에 대하여 |{p['m']}x − {p['n']}| ≥ 0 — {'거짓' if orig else '참'}"]
    if k == 'conv':
        NAT = set(range(1, 40)); pool = [F(n, 2) for n in range(-40, 41)] + ['√2']
        def mem(name, x):
            if x == '√2': return name == '실수'
            if name == '자연수': return x.denominator == 1 and x >= 1
            if name == '정수': return x.denominator == 1
            if name in ('유리수', '실수'): return True
            m = int(name.split('의')[0]); return x.denominator == 1 and x % m == 0
        S, T = p['S'], p['T']
        conv = all(mem(S, x) for x in pool if mem(T, x)); contra = all(not mem(S, x) for x in pool if not mem(T, x))
        return ['— 참' if (conv if p['w'] == 'conv' else contra) else '— 거짓']
    if k == 'zero':
        kk = p['kk']; f = lambda x: x + kk
        conv = all(x * f(x) == 0 for x in XS if f(x) == 0); contra = all(x * f(x) != 0 for x in XS if f(x) != 0)
        return ['— 참' if (conv if p['w'] == 'conv' else contra) else '— 거짓']
    if k == 'cond':
        ep, eq = cond(p['p']), cond(p['q'])
        if 'a' in p['p'] + p['q']: dom = [{'a': a, 'b': b} for a in range(-4, 5) for b in range(-4, 5)]
        else: dom = [{'x': x} for x in XS]
        pq = all(eval(eq, {}, d) for d in dom if eval(ep, {}, d)); qp = all(eval(ep, {}, d) for d in dom if eval(eq, {}, d))
        return ['필요충분조건' if pq and qp else '충분조건' if pq else '필요조건' if qp else '아무것도 아니다']
    if k == 'suff':
        P = [x for x in XS if x * x - p['b'] * x + p['c'] <= 0]; lo, hi = min(P), max(P)
        ok = [a for a in XS if all(x <= a for x in P)]; amin = min(ok)
        return {1: [f'{{x | {lo} ≤ x ≤ {hi}}}'], 2: ['P ⊂ Q'], 3: [f'가장 큰 수 {hi}'], 4: [f'a ≥ {amin}']}[p['step']]
    if k == 'isprop': return None
    if k == 'pnq':
        U = {1, 2, 3}; out = []
        for i, s in enumerate(p['st']):
            e = s.replace('Pᶜ', '(U-P)').replace('Qᶜ', '(U-Q)').replace('∩', '&').replace('∪', '|').replace('⊂', '<=').replace('∅', 'set()').replace('−', '-').replace(' = ', ' == ')
            always = all(eval(e, {}, {'P': P, 'Q': Q, 'U': U}) for P in subsets(U) for Q in subsets(U) if not (P & Q))
            if always: out.append('ㄱㄴㄷㄹ'[i] + '. ' + s)
        return sorted(out)
    if k == 'convmin':
        kk, c, r = p['kk'], p['c'], p['r']; Q = [x for x in XS if abs(x - c) <= r]
        return str(min(a for a in range(1, 60) if all(x * x - kk * kk * a * a <= 0 for x in Q)))
    if k == 'twofalse':
        kk, c, s = p['kk'], p['c'], p['s']; big = [F(n, 8) for n in range(-4000, 4001)]
        Mx = max(a for a in range(-60, 0) if all(a * x * x + 2 * kk * x - c < 0 for x in big))      # (가) 거짓 = 어떤 x 에서도 p 가 아님
        assert not all((Mx + 1) * x * x + 2 * kk * x - c < 0 for x in big)
        m = min(b for b in range(1, 60) if any(x * x + 2 * b * x + s * s <= 0 for x in big))        # (나) 거짓 = q 가 늘 참은 아님
        return str(Mx + m)
    raise KeyError(k)

def intext(it):
    """par 의 숫자가 문제 글에 들어 있는지"""
    q = it['q']; p = it['par']
    vals = [x for kk, x in p.items() if kk not in ('k', 'step', 'w', 'op', 'mode', 'truth', 'kinds', 'st', 'pred', 'S', 'T', 'p', 'q', 'kk', 'c', 'r', 's', 't2', 'tt', 'A') and isinstance(x, int)]
    sub = str.maketrans('₀₁₂₃₄₅₆₇₈₉', '0123456789')
    return all(str(abs(x)) in q.translate(sub) for x in vals)

rows, bad = [], []
castle = set()
if len(sys.argv) > 1:
    for n in (1, 2):
        d = json.load(open(os.path.join(sys.argv[1], f'eval-{n}.json'), encoding='utf8'))
        for r in d['rooms']:
            for vv in r['vers']:
                for it in vv: castle.add(re.sub(r'^\d\d\s*(⑴|⑵|⑶|⑷)?\s*', '', it['q']).strip())

for name in ('mid-set', 'mid-prop'):
    pk = json.load(open(os.path.join(HERE, name + '.json'), encoding='utf8'))
    # 꼴 검사
    assert pk['theme'] in THEMES, pk['theme']
    cids = [s['id'] for s in pk['steps'] if s['kind'] == 'concept']; mids = [s['id'] for s in pk['steps'] if s['kind'] == 'monster']
    assert pk['steps'][-1]['kind'] == 'boss' and sum(s['kind'] == 'boss' for s in pk['steps']) == 1
    assert set(mids) == set(pk['mons']), mids
    b = pk['boss']; assert isinstance(b['items'], int) and 1 <= b['hpItems'] <= b['items']
    assert len(b['tags']) == b['items'] == len(b['links']) and all(t in cids for t in b['tags']) and all(l == '' or l in mids for l in b['links'])
    groups = list(pk['mons'].items()) + [('boss', b)]
    for gid, g in groups:
        assert g['sprite'].split(':')[0] in SPR and g['sprite'].endswith(':0'), g['sprite']
        assert len(g['vers']) == 7
        if gid == 'boss': assert all(len(vv) == b['items'] for vv in g['vers'])
        for vi, vv in enumerate(g['vers']):
            assert [it['type'] for it in vv] == [it['type'] for it in g['vers'][0]], (name, gid, vi, '판 0 과 꼴이 다름')
            for qi, it in enumerate(vv):
                idx = [int(i) for i in it['a'].split(',')] if it['type'] in ('choice', 'multi') else []
                assert all(0 <= i < len(it['ch']) for i in idx), (name, gid, vi, qi)
                if it['type'] not in ('choice', 'multi'): assert it['ch'] == []
                assert len(set(it['ch'])) == len(it['ch']), ('보기 겹침', it['ch'])
                want = recompute(it)
                if want is None: res = '눈으로 확인'
                else:
                    got = sorted(picked(it)) if it['type'] in ('choice', 'multi') else it['a']
                    if isinstance(want, list) and len(want) == 1 and want[0].startswith('— '): ok = got[0].endswith(want[0])
                    else: ok = (got == want)
                    res = '✅' if ok else f'❌ 다시 계산 = {want}'
                    if not ok: bad.append((name, gid, vi, qi, got, want))
                if not intext(it): bad.append((name, gid, vi, qi, 'par 숫자가 문제 글에 없음', it['par']))
                for line in it['q'].split('\n'):          # 숫자가 든 줄이 성채 팩 문제 글 안에 그대로 있으면 겹침
                    body = re.sub(r'^(문제 \d+\)|\d+\.|⑴|⑵|⑶|⑷)\s*', '', line).strip()
                    body = re.sub(r'\s*(일 때.*|— 원소를 모두 고르시오\.)$', '', body)
                    if vi > 0 and castle and len(re.findall(r'\d', body)) >= 2 and any(body in c for c in castle):   # 판 0 = 교과서 숫자는 성채의 한 번 더 판에도 있을 수 있음
                        bad.append((name, gid, vi, qi, '성채 팩과 같은 문제 글', body))
                ans = ' · '.join(picked(it)) if it['type'] in ('choice', 'multi') else it['a']
                rows.append((name, gid, vi, qi + 1, it.get('ref', '소레이드 ' + str(it['par'].get('step', ''))), ans, it['sol'], res))
        # 판끼리 문제 글이 겹치지 않는지(첫 판 = 교과서 숫자가 한 번 더 판에 다시 나오지 않게)
        firsts = [vv[0]['q'] + '|' + vv[-1]['q'] for vv in g['vers']]
        if len(set(firsts)) != 7: bad.append((name, gid, '판끼리 같은 문제', ''))

out = ['# 🏰 중단원 레이드 팩 · 정답 독립 검산표', '', f'- 문항 수(판 7개 모두) = {len(rows)} · 다시 계산해 맞음 = {sum(r[7] == "✅" for r in rows)} · 눈으로 확인 = {sum(r[7] == "눈으로 확인" for r in rows)} · 틀림 = {sum(r[7].startswith("❌") for r in rows)}',
       '- 다시 계산하는 법 = verify.py (집합은 원소를 하나씩 세고, 부등식 · 명제는 −20 ~ 20 을 0.25 간격으로 모두 넣어 봄)', '- 「눈으로 확인」 = 문장이 집합 · 명제인지 고르는 문항(계산이 아님) → 아래 표의 판 0 은 교과서 정답과 대조함', '',
       '## 판 0 (첫 판 = 교과서 원래 숫자)', '', '| 팩 | 칸 | 번호 | 교과서 | 정답 | 계산 한 줄 | 확인 |', '|---|---|---|---|---|---|---|']
for r in rows:
    if r[2] == 0: out.append(f'| {r[0]} | {r[1]} | {r[3]} | {r[4]} | {r[5]} | {r[6]} | {r[7]} |')
out += ['', '## 판 1 ~ 6 (숫자 바꾼 판)', '', '| 팩 | 칸 | 판 | 번호 | 정답 | 확인 |', '|---|---|---|---|---|---|']
for r in rows:
    if r[2] > 0: out.append(f'| {r[0]} | {r[1]} | {r[2]} | {r[3]} | {r[5]} | {r[7]} |')
open(os.path.join(HERE, '검산표.md'), 'w', encoding='utf8').write('\n'.join(out) + '\n')
print('문항', len(rows), '· 맞음', sum(r[7] == '✅' for r in rows), '· 눈으로', sum(r[7] == '눈으로 확인' for r in rows), '· 문제', len(bad))
for x in bad: print('  ❌', x)
sys.exit(1 if bad else 0)
