#!/usr/bin/env python3
"""공통수학1 차시 시안 — 공통 도구 (🌊 설계 방 · 2026-11-22 밤)
팩 꼴 = docs/PACK-GUIDE.md v3 (mons.mN.vers[0..6] · boss.vers · 문항 = type · q · a · ch · sol)
문항 틀(template) = f(v, rng) → item dict. 식은 파이썬 꼴 글자("a**2+2*a*b")로 쓰고 D() 로 화면 글자, ev() 로 값 검산.
"""
import json, random, re, math, hashlib
from fractions import Fraction as Fr

SUP = str.maketrans('0123456789-', '⁰¹²³⁴⁵⁶⁷⁸⁹⁻')
def D(e):
    """파이썬 꼴 식 → 화면 글자: x**2 → x² · 2*x → 2x · - → − · 1*x → x"""
    s = str(e).replace(' ', '')
    s = re.sub(r'\*\*\(?(-?\d+)\)?', lambda m: m.group(1).translate(SUP), s)
    s = s.replace('*', '')
    s = re.sub(r'(?<![\d.])1(?=[a-zA-Zα-ω(])', '', s)          # 1x → x
    s = re.sub(r'\+-', '-', s); s = re.sub(r'--', '+', s)
    s = re.sub(r'(?<=[^(=,<>≤≥^])([+\-])', r' \1 ', s)           # 사이 띄기(맨 앞 · 괄호 뒤 부호는 붙임)
    s = s.replace('-', '−').replace('<=', '≤').replace('>=', '≥').replace('!=', '≠')
    return re.sub(r'\s+', ' ', s).strip()
def N(n):
    """수 → 글자(음수 − · 분수 a/b)"""
    if isinstance(n, Fr): n = n.numerator if n.denominator == 1 else n
    if isinstance(n, Fr): return ('−' if n < 0 else '') + f'{abs(n.numerator)}/{n.denominator}'
    if isinstance(n, float) and n == int(n): n = int(n)
    return str(n).replace('-', '−')
def ev(e, **kw):
    return eval(str(e), {'__builtins__': {}, 'Fr': Fr, 'abs': abs, 'sqrt': math.sqrt}, kw)
def same(e1, e2, vars='x', tries=6, rng=None):
    """두 식이 항등인지 수 대입으로 확인"""
    r = rng or random.Random(7)
    for _ in range(tries):
        kw = {v: Fr(r.randint(-7, 9), r.choice([1, 1, 2, 3])) for v in vars}
        try:
            if ev(e1, **kw) != ev(e2, **kw): return False
        except ZeroDivisionError: continue
    return True
def P(cs, var='x'):
    """계수 목록(높은 차수부터) → 파이썬 꼴 식"""
    n = len(cs) - 1; out = ''
    for i, c in enumerate(cs):
        if c == 0: continue
        d = n - i; body = '' if d == 0 else var if d == 1 else f'{var}**{d}'
        coef = abs(c); t = (str(coef) if (coef != 1 or d == 0) else '') + ('*' if (coef != 1 and d) else '') + body
        out += ('-' if c < 0 else '+' if out else '') + t
    return out or '0'
def pmul(a, b):
    r = [0] * (len(a) + len(b) - 1)
    for i, x in enumerate(a):
        for j, y in enumerate(b): r[i + j] += x * y
    return r
def padd(a, b, sign=1):
    n = max(len(a), len(b)); a = [0] * (n - len(a)) + list(a); b = [0] * (n - len(b)) + list(b)
    r = [x + sign * y for x, y in zip(a, b)]
    while len(r) > 1 and r[0] == 0: r.pop(0)
    return r
def pdiv(a, b):
    a = [Fr(x) for x in a]; q = []
    while len(a) >= len(b):
        c = a[0] / b[0]; q.append(c)
        for i, y in enumerate(b): a[i] -= c * y
        a.pop(0)
    r = a or [0]
    while len(r) > 1 and r[0] == 0: r.pop(0)
    I = lambda L: [int(x) if x.denominator == 1 else x for x in L]
    return I(q or [0]), I(r)
def peval(cs, x):
    v = 0
    for c in cs: v = v * x + c
    return v

# ── 조사 ──
_J = {'0': 1, '1': 1, '2': 0, '3': 1, '4': 0, '5': 0, '6': 1, '7': 1, '8': 1, '9': 0, 'l': 1, 'm': 1, 'n': 1, 'r': 1, 'L': 1, 'M': 1, 'N': 1, 'R': 1}
def _jong(s):
    s = re.sub(r'[\s)\]}」』\'"]+$', '', str(s))
    s = s.translate(str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹', '0123456789'))
    if not s: return 0
    c = s[-1]
    if '가' <= c <= '힣': return (ord(c) - 0xAC00) % 28 != 0
    return bool(_J.get(c, 0))
def J(s, pair):
    """J('x + 3', '은는') → 'x + 3은' · pair = 은는 · 이가 · 을를 · 과와 · 으로"""
    a, b = (pair[0], pair[1]) if pair != '으로' else ('으로', '로')
    if pair == '으로' and re.sub(r'[\s)]+$', '', str(s))[-1:] in ('l', 'L', '1', '7', '8', 'r', 'R') : return f'{s}로'
    return f'{s}{a if _jong(s) else b}'

# ── 문항 만들기 ──
def _uniq(xs):
    out = []
    for x in xs:
        if x not in out: out.append(x)
    return out
def choice(rng, q, right, wrongs, sol, n=4, chk=None, keep=False):
    """고르기: right = 정답 글자 · wrongs = 오답 글자들(정답과 같으면 빼고 n−1개만) · keep = 보기 순서 그대로"""
    ws = [w for w in _uniq([str(w) for w in wrongs]) if w != str(right)][:n - 1]
    assert len(ws) >= 2, f'오답 보기가 모자람: {q} / {right} / {wrongs}'
    ch = [str(right)] + ws
    if not keep: rng.shuffle(ch)
    return dict(type='choice', q=q, a=str(ch.index(str(right))), ch=ch, sol=sol, _chk=chk)
def multi(rng, q, opts, sol, chk=None, keep=True):
    """모두 고르기: opts = [(글자, 맞음?)…] · 정답 1개 이상 · 전부는 아님"""
    if not keep: opts = opts[:]; rng.shuffle(opts)
    ch = [o[0] for o in opts]; a = [str(i) for i, o in enumerate(opts) if o[1]]
    assert len(set(ch)) == len(ch) and 1 <= len(a) < len(ch), f'multi 꼴: {q} {opts}'
    return dict(type='multi', q=q, a=','.join(a), ch=ch, sol=sol, _chk=chk)
def ox(q, truth, sol, chk=None):
    return dict(type='ox', q=q, a='O' if truth else 'X', ch=[], sol=sol, _chk=chk)
def number(q, a, sol, chk=None):
    assert int(a) == a, f'number 는 정수만: {q} {a}'
    return dict(type='number', q=q, a=str(int(a)), ch=[], sol=sol, _chk=chk)
def blanks(q, answers, sol, chk=None):
    return dict(type='blanks', q=q, a=','.join(str(x) for x in answers), ch=[], sol=sol, _chk=chk)
def pick(v, rng, base, pool):
    """판 0 = base · 판 1~6 = pool 에서(없으면 rng 로)"""
    return base if v == 0 else pool(rng)

# ── 차시 조립 · 검사 ──
MIN = dict(choice=1.3, multi=1.6, ox=0.7, number=1.9, blanks=1.6, text=2.0)
LINT = [(r'(?<![\d.])1[a-zA-Z](?![a-zA-Z])', '「1x」 꼴'), (r'은\(는\)|이\(가\)|을\(를\)|와\(과\)', '조사 자리표시'), (r'\+ −|− −|\+ \+', '부호 겹침'),
        (r'\(\d\)의|앞 문제|위의 |앞에서 |그림에서|표에서', '다른 칸을 가리킴'), (r'\*|\*\*', '파이썬 기호 남음'), (r'None|nan', '빈 값'), (r'자연수 또는 실수', '「또는」 단서')]
def build(L, seed0=20261122):
    """L = 차시 dict → (pack, report). L['mons'] = [{id,title,hard?,extra?,subs:[f…]}] · L['boss'] = [(f, tag, link)…]"""
    rep = dict(rows=[], lint=[], dup=[], t={})
    def gen(key, f):
        vers, seen = [], set()
        for v in range(7):
            for att in range(40):
                rng = random.Random(int(hashlib.md5(f"{seed0}|{L['id']}|{key}|{v}|{att}".encode()).hexdigest()[:12], 16))
                it = f(v, rng); sig = it['q'] + '|' + '|'.join(it['ch'])
                if sig not in seen or att == 39: break
            if sig in seen: rep['dup'].append(f'{key} 판 {v} = 앞 판과 같은 문항')
            seen.add(sig); vers.append(it)
        return vers
    def check(key, v, it, t0):
        ok = '눈으로 확인'
        if it.get('_chk') is not None:
            r = it['_chk']() if callable(it['_chk']) else it['_chk']
            ok = '✅' if r else '❌'
        if it['type'] != t0: rep['lint'].append(f'{key} 판 {v}: 형식이 판 0 과 다름')
        if it['type'] in ('choice', 'multi'):
            idx = [int(x) for x in it['a'].split(',')]
            if not all(0 <= i < len(it['ch']) for i in idx) or len(set(it['ch'])) != len(it['ch']): rep['lint'].append(f'{key} 판 {v}: 보기 번호 · 겹침')
        if not it['sol'] or len(it['sol']) > 90: rep['lint'].append(f'{key} 판 {v}: 풀이 길이 {len(it["sol"] or "")}')
        blob = it['q'] + ' ' + ' '.join(it['ch']) + ' ' + it['sol']
        for pat, why in LINT:
            if re.search(pat, blob): rep['lint'].append(f'{key} 판 {v}: {why} — {re.search(pat, blob).group(0)!r}')
        ans = it['a'] if it['type'] not in ('choice', 'multi') else ' · '.join(it['ch'][int(i)] for i in it['a'].split(','))
        rep['rows'].append((key, v, it['type'], ans, it['sol'], ok))
        return {k: x for k, x in it.items() if not k.startswith('_')}
    steps = [dict(kind='intro', id='intro', title='도입 · 전시 확인', img='review', say=L.get('intro', ''))]
    for c in L['concepts']:
        st = dict(kind='concept', id=c['id'], title=c['title'], say=c['say'])
        if c.get('check'): st['check'] = c['check']
        steps.append(st)
    mons = {}; tmin = 3 + sum(5 + (1 if c.get('check') else 0) for c in L['concepts']); textra = 0
    for m in L['mons']:
        assert 1 <= len(m['subs']) <= 4, f"소문항은 4개까지: {m['id']}"   # 📜 11/22 밤 선생님 「소문항이 4개를 넘어서지 않게」
        vs = [gen(f"{m['id']}-{i+1}", f) for i, f in enumerate(m['subs'])]
        packed = [[check(f"{m['id']}-{i+1}", v, vs[i][v], vs[i][0]['type']) for i in range(len(vs))] for v in range(7)]
        title = ('🌱 여유 문제 · ' if m.get('extra') else '') + m['title'] + (' ⛰' if m.get('hard') else '')
        steps.append(dict(kind='monster', id=m['id'], title=title)); mons[m['id']] = dict(title=title, sprite='', vers=packed)
        mt = sum(MIN[x[0]['type']] for x in vs) * (1.3 if m.get('hard') else 1) + 1
        rep['t'][m['id']] = round(mt, 1)
        if m.get('extra'): textra += mt
        else: tmin += mt
    bv = [gen(f'b-{i+1}', f) for i, (f, _, _) in enumerate(L['boss'])]
    bpacked = [[check(f'b-{i+1}', v, bv[i][v], bv[i][0]['type']) for i in range(len(bv))] for v in range(7)]
    steps.append(dict(kind='boss', id='sum', title='형성평가'))
    tb = sum(MIN[x[0]['type']] for x in bv) + 2; tmin += tb
    cids = {c['id'] for c in L['concepts']}; mids = set(mons)
    for _, tag, link in L['boss']:
        assert tag in cids and (link == '' or link in mids), f'tags · links: {tag} {link}'
    pack = dict(id=L['id'], no=L['no'], title=L['title'], unit=L['unit'], goal=L['goal'], theme='', steps=steps, mons=mons,
                boss=dict(title='형성평가', sprite='', items=len(bv), hpItems=len(bv), tags=[t for _, t, _ in L['boss']], links=[l for _, _, l in L['boss']], vers=bpacked),
                img=[], video=[], pct=100)
    rep['min'] = round(tmin, 1); rep['extra'] = round(textra, 1); rep['boss_min'] = round(tb, 1)
    rep['hard'] = [m['id'] for m in L['mons'] if m.get('hard')]
    return pack, rep
def write(L, outdir='out'):
    pack, rep = build(L)
    bad = [r for r in rep['rows'] if r[5] == '❌']
    json.dump(pack, open(f"{outdir}/{L['id']}.json", 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    nr = len(rep['rows']); nc = sum(1 for r in rep['rows'] if r[5] == '✅'); ne = sum(1 for r in rep['rows'] if r[5] == '눈으로 확인')
    md = [f"# {L['no']}차시 · {L['title']} — 시안 (공통수학1 · {L['unit']})", '',
          f"> 교과서 {L['pages']}쪽 · 목표: {L['goal']}", f"> ⏱ 예상 {rep['min']}분(여유 문제 빼고) · 여유 문제 +{rep['extra']}분 · 어려운 문제(산) = {', '.join(rep['hard']) or '없음'}{' · ' + L['hard_from'] if L.get('hard_from') else ''}",
          f"> 문항 {nr}줄(판 0 ~ 6) · 계산 검산 ✅ {nc} · 눈으로 확인 {ne} · ❌ {len(bad)} · 글 검사 걸림 {len(rep['lint'])} · 같은 판 {len(rep['dup'])}", '',
          '## 학습지 구성 (판 0 = 학습지에 실을 문항)', '', f"- 🔁 전시 확인: {L.get('review', '—')}", f"- 💭 생각 열기: {L.get('intro', '—')}"]
    for c in L['concepts']: md += [f"- 📘 {c['id']} {c['title']}: {c['say']}" + (f" · ✔ 개념 체크: {c['check']['q']} → {c['check']['a']}" if c.get('check') else '')]
    md.append('')
    def show(key, it):
        ans = it['a'] if it['type'] not in ('choice', 'multi') else ' · '.join(it['ch'][int(i)] for i in it['a'].split(','))
        return f"  - ({key}) [{it['type']}] {it['q']}" + (f"  〔보기: {' / '.join(it['ch'])}〕" if it['ch'] else '') + f"  → **{ans}** · {it['sol']}"
    for st in pack['steps']:
        if st['kind'] == 'monster':
            md.append(f"- 👾 {st['id']} {st['title']} (⏱ {rep['t'][st['id']]}분)")
            md += [show(f"{st['id']}-{i+1}", it) for i, it in enumerate(pack['mons'][st['id']]['vers'][0])]
    md.append(f"- 👑 형성평가 {pack['boss']['items']}문항 (⏱ {rep['boss_min']}분) · 짝 = {pack['boss']['links']}")
    md += [show(f'b-{i+1}', it) for i, it in enumerate(pack['boss']['vers'][0])]
    md += ['', '## 검산 표 (판 1 ~ 6 은 걸린 줄만 · 나머지 모두 ✔)', '', '| 문항 · 판 | 형식 | 정답 | 풀이 한 줄 | 확인 |', '|---|---|---|---|---|']
    for key, v, t, ans, sol, ok in rep['rows']:
        if v == 0 or ok == '❌': md.append(f"| {key} · 판 {v} | {t} | {ans} | {sol} | {ok} |")
    if rep['lint'] or rep['dup']: md += ['', '## 걸린 곳', ''] + [f'- {x}' for x in rep['lint'] + rep['dup']]
    if L.get('notes'): md += ['', '## 설계 방이 정한 것 · 선생님 확인 거리', ''] + [f'- {x}' for x in L['notes']]
    open(f"{outdir}/{L['id']}.md", 'w', encoding='utf8').write('\n'.join(md) + '\n')
    print(f"{L['id']} {L['title']}: ⏱ {rep['min']}분 (+여유 {rep['extra']}) · 문항 {nr} · ✅ {nc} · 눈 {ne} · ❌ {len(bad)} · 글 {len(rep['lint'])} · 같은 판 {len(rep['dup'])}")
    for x in (rep['lint'] + rep['dup'])[:8]: print('   ', x)
    for r in bad[:6]: print('   ❌', r[:4])
    return rep

# ── 두 문자 식 · 항 목록 ──
def T(terms, vs='xy'):
    """항 목록 [(계수, x차수, y차수…)] → 파이썬 꼴 식 (주어진 순서 그대로 · 계수 0 은 뺌)"""
    out = ''
    for c, *ds in terms:
        if c == 0: continue
        body = '*'.join(v if d == 1 else f'{v}**{d}' for v, d in zip(vs, ds) if d)
        coef = abs(c); t = (str(coef) if (coef != 1 or not body) else '') + ('*' if (coef != 1 and body) else '') + body
        out += ('-' if c < 0 else '+' if out else '') + t
    return out or '0'
def tadd(a, b, sign=1):
    """항 목록 더하기(같은 차수끼리) · 순서 = a 의 순서 다음 b 에만 있는 항"""
    d = {}; order = []
    for c, *ds in a: d[tuple(ds)] = d.get(tuple(ds), 0) + c; order.append(tuple(ds)) if tuple(ds) not in order else None
    for c, *ds in b: d[tuple(ds)] = d.get(tuple(ds), 0) + sign * c; order.append(tuple(ds)) if tuple(ds) not in order else None
    return [(d[k], *k) for k in order]
def tscale(a, k): return [(c * k, *ds) for c, *ds in a]
def sortx(terms, i=0, rev=True):
    return sorted(terms, key=lambda t: (-t[1 + i] if rev else t[1 + i], -sum(t[1:])))
def ri(rng, lo, hi, no=(0,)):
    while True:
        x = rng.randint(lo, hi)
        if x not in no: return x
