#!/usr/bin/env python3
"""14 ~ 17차시 팩 — 바뀐 판 3 → 6 으로 늘리기 + 표기 고침 (설계 방 · 묶음 #5 건 2 · 3)
학습지 문항 꼴 그대로 · 숫자만 바꿈. 답은 여기서 계산해 넣고, check.py 가 문제 글에서 따로 다시 계산해 맞춰 봄.
쓰기: python3 gen_more.py <팩 폴더(ex14.json … 이 든 z14 … z17 의 부모)> <나갈 폴더>"""
import json, random, re, sys, os, copy
from fractions import Fraction as Fr
from fnlib import lin, n2s, wa, eul, ev

R = random.Random(20261121)
def ch(correct, wrongs, extra=()):
    """보기 섞기 → (choices, answerIndex). 겹치면 extra 에서 채움."""
    opts = [correct]
    for w in list(wrongs) + list(extra):
        if w not in opts and len(opts) < 3: opts.append(w)
    if len(opts) < 3:   # 수 보기면 가까운 수로 채움
        try:
            v = int(str(correct).replace('−', '-'))
            for dlt in (1, -1, 2, -2, 3, -3, 5):
                w = n2s(v + dlt)
                if w not in opts and len(opts) < 3: opts.append(w)
        except ValueError: pass
    assert len(opts) == 3, (correct, wrongs)
    R.shuffle(opts); return opts, opts.index(correct)
def C(q, correct, wrongs, sol, say=None, extra=()):
    c, i = ch(correct, wrongs, extra); d = {'type': 'choice', 'question': q, 'choices': c, 'answerIndex': i, 'solution': sol}
    if say: d['say'] = say
    return d
def quad(a, b, c, top='x²'):
    """a·x² + b·x + c 글자."""
    s = ('−' if a < 0 else '') + ('' if abs(a) == 1 else str(abs(a))) + top
    if b: s += f" {'−' if b < 0 else '+'} {'' if abs(b) == 1 else abs(b)}x"
    if c: s += f" {'−' if c < 0 else '+'} {abs(c)}"
    return s
def eun(n): return '은' if str(n)[-1] in '013678' else '는'
def ro(n): return '으로' if str(n)[-1] in '0368' else '로'   # ㄹ 받침(1 · 7 · 8)은 '로'
def i_ga(n): return '이' if str(n)[-1] in '013678' else '가'
def asc(a, b):
    """그래프 글자(영문): y=(1/3)x+1/3 꼴."""
    a, b = Fr(a), Fr(b)
    co = '' if a == 1 else '-' if a == -1 else (str(a.numerator) if a.denominator == 1 else f"({a.numerator}/{a.denominator})")
    s = f"{co}x"
    if b: s += ('+' if b > 0 else '-') + (str(abs(b.numerator)) if b.denominator == 1 else f"{abs(b.numerator)}/{b.denominator}")
    return s

# ───────────────────────── 16차시 합성함수 ─────────────────────────
def m16_1(a, b, c, p, q, r):
    F, G = lin(a, b), quad(1, 0, c); f = lambda x: a * x + b; g = lambda x: x * x + c
    head = f"문제 1) 두 함수 f(x) = {F} {wa(F)} g(x) = {G} 에 대하여\n"
    return [
        C(head + f"(g∘f)({n2s(p)}) 의 값은?", n2s(g(f(p))), [n2s(f(p)), n2s(f(g(p)))], f"(g∘f)({n2s(p)}) = g(f({n2s(p)})) = g({n2s(f(p))}) = {n2s(g(f(p)))} · 먼저 f", extra=[n2s(g(p)), n2s(g(f(p)) + 1)]),
        C(head + f"(f∘g)({n2s(q)}) 의 값은?", n2s(f(g(q))), [n2s(g(q)), n2s(g(f(q)))], f"(f∘g)({n2s(q)}) = f(g({n2s(q)})) = f({n2s(g(q))}) = {n2s(f(g(q)))} · 먼저 g", extra=[n2s(f(q)), n2s(f(g(q)) - 1)]),
        C(head + f"(f∘f)({n2s(r)}) 의 값은?", n2s(f(f(r))), [n2s(f(r)), n2s(f(r) ** 2)], f"(f∘f)({n2s(r)}) = f(f({n2s(r)})) = f({n2s(f(r))}) = {n2s(f(f(r)))}", extra=[n2s(f(f(r)) + 2), n2s(-f(f(r)))])]
def m16_2(k):
    F = lin(1, k); head = f"문제 2) 두 함수 f(x) = {F} {wa(F)} g(x) = −x² 에 대하여\n"
    gf = quad(-1, -2 * k, -k * k); fg = quad(-1, 0, k)
    return [
        C(head + "(g∘f)(x) 는?", gf, [quad(-1, 0, -k * k), quad(-1, 2 * k, -k * k)], f"g(f(x)) = g({F}) = −({F})² = {gf}"),
        C(head + "(f∘g)(x) 는?", fg, [gf, quad(-1, 0, -k)], f"f(g(x)) = f(−x²) = {fg}"),
        C(head + "(g∘g)(x) 는?", '−x⁴', ['−x²', 'x⁴'], "g(g(x)) = g(−x²) = −(−x²)² = −x⁴")]
def m16_3(a, b, s, t):
    """f = ax + b · h = sx + t · g = f(h) = (as)x + (at + b)"""
    c, d = a * s, a * t + b; F, G, H = lin(a, b), lin(c, d), lin(s, t)
    ah = f"{a}h(x)"; fh = f"{ah} {'−' if b < 0 else '+'} {abs(b)}"; rhs = lin(c, d - b)
    head = f"중단원 07) 두 함수 f(x) = {F} {wa(F)} g(x) = {G} 에 대하여 (f∘h)(x) = g(x) 를 만족시키는 h(x) 를 구하시오.\n"
    mv = f"{G} {'+' if b < 0 else '−'} {abs(b)}"
    return [
        C(head + "(f∘h)(x) 를 바꿔 쓰면?", 'f(h(x))', ['h(f(x))', 'f(x) × h(x)'], "(f∘h)(x) = f(h(x)) — 오른쪽 h 먼저, 다음 f", "(f∘h)(x) = f(h(x)) 이다."),
        C(head + "f(h(x)) 를 h(x) 로 나타내면?", fh, [f"h({F})", f"{F} + h(x)"], "f 의 x 자리에 h(x) 를 통째로 넣는다", f"f 의 x 자리에 h(x) 를 넣으면 f(h(x)) = {fh}"),
        C(head + "세울 수 있는 식은?", f"{fh} = {G}", [f"h(x) = {G}", f"{fh} = {F}"], "(f∘h)(x) = g(x) 이므로 두 식을 같다고 놓는다", f"(f∘h)(x) = g(x) 이므로 {fh} = {G}"),
        C(head + f"{ah} 는?", f"{ah} = {rhs}", [f"{ah} = {G}", f"{ah} = {lin(c, d + b)}"], f"{abs(b)} {eul(str(abs(b)))} 옮기면 {ah} = {mv} = {rhs}", f"{ah} = {rhs}"),
        C(head + "그러므로 h(x) 는?", f"h(x) = {H}", [f"h(x) = {lin(s, -t)}", f"h(x) = {rhs}"], f"양변을 {a} {ro(a)} 나누면 h(x) = {H} · 검산 f(h(x)) = {a}({H}) {'−' if b < 0 else '+'} {abs(b)} = {G}", f"그러므로 h(x) = {H} (검산 f(h(x)) = {G})")]
def boss16(k, a, c, p, q, fa, fb, hs, ht):
    F, G = lin(1, k), quad(a, 0, c); f = lambda x: x + k; g = lambda x: a * x * x + c
    head = f"두 함수 f(x) = {F} {wa(F)} g(x) = {G} 에 대하여 "
    fg = quad(a, 0, c + k); gfx = quad(a, 2 * a * k, a * k * k + c)
    F2 = lin(fa, fb); gc, gd = fa * hs, fa * ht + fb; G2 = lin(gc, gd); H = lin(hs, ht)
    return [
        C("1. " + head + f"(g∘f)({n2s(p)}) 의 값은?", n2s(g(f(p))), [n2s(g(p)), n2s(f(g(p)))], f"g(f({n2s(p)})) = g({n2s(f(p))}) = {n2s(g(f(p)))}", extra=[n2s(f(p)), n2s(g(f(p)) + 3)]),
        C("2. " + head + f"(g∘g)({n2s(q)}) 의 값은?", n2s(g(g(q))), [n2s(g(q)), n2s(g(q) ** 2)], f"g(g({n2s(q)})) = g({n2s(g(q))}) = {n2s(g(g(q)))}", extra=[n2s(g(g(q)) - 2), n2s(-g(g(q)))]),
        C("3. " + head + "(f∘g)(x) 는?", fg, [lin(a, c + k), gfx], f"f(g(x)) = ({G}) {'−' if k < 0 else '+'} {abs(k)} = {fg}"),
        C(f"4. 두 함수 f(x) = {F2}, g(x) = {G2} 에 대하여 (f∘h)(x) = g(x) 를 만족시키는 h(x) 는?", f"h(x) = {H}", [f"h(x) = {lin(hs, -ht)}", f"h(x) = {lin(gc, gd - fb)}"],
          f"f(h(x)) = {fa}h(x) {'−' if fb < 0 else '+'} {abs(fb)} = {G2} → h(x) = {H}")]

# ───────────────────────── 17차시 역함수 ─────────────────────────
def m17_1(Y, perm, hide, ys, xa, yb, xc):
    """perm[i] = X 의 i+1 이 가는 Y 의 자리 · hide = 가린 x(1~4)"""
    f = {i + 1: Y[perm[i]] for i in range(4)}; inv = {v: k for k, v in f.items()}
    given = ', '.join(f"{x} → {f[x]}" for x in range(1, 5) if x != hide)
    head = f"문제 1) X = {{1, 2, 3, 4}} 에서 Y = {{{', '.join(map(str, Y))}}} 로의 함수 f 의 역함수가 존재하도록 그림을 완성하면 ({given})\n"
    allf = ', '.join(f"{x}→{f[x]}" for x in range(1, 5))
    others = lambda bad: [str(v) for v in list(range(1, 5)) + Y if str(v) not in bad]
    def one(q, cor, w, sol):
        w = [str(v) for v in w]; return C(head + q, str(cor), w, sol, extra=others([str(cor)] + w))
    return [
        {'type': 'match', 'question': head + "역함수가 존재하도록 f 의 화살표를 모두 이으시오. (빈 곳 하나를 채우기)", 'xs': ['1', '2', '3', '4'], 'ys': [str(v) for v in Y],
         'answer': [[i, perm[i]] for i in range(4)], 'xn': 'X', 'yn': 'Y', 'solution': f"일대일대응이 되려면 남은 {hide} {eun(hide)} 남은 {f[hide]} {ro(f[hide])} → {allf}"},
        one(f"f⁻¹({ys}) 의 값은?", inv[ys], [ys, f[inv[ys]] if f[inv[ys]] != ys else 1], f"f({inv[ys]}) = {ys} 이므로 f⁻¹({ys}) = {inv[ys]}"),
        one(f"(f⁻¹∘f)({xa}) 의 값은?", xa, [f[xa]], f"(f⁻¹∘f)({xa}) = f⁻¹(f({xa})) = f⁻¹({f[xa]}) = {xa} · 항등"),
        one(f"(f∘f⁻¹)({yb}) 의 값은?", yb, [inv[yb]], f"(f∘f⁻¹)({yb}) = f(f⁻¹({yb})) = f({inv[yb]}) = {yb} · 항등"),
        one(f"(f⁻¹)⁻¹({xc}) 의 값은?", f[xc], [xc], f"(f⁻¹)⁻¹ = f 이므로 (f⁻¹)⁻¹({xc}) = f({xc}) = {f[xc]}")]
def inv_lin(a, b): a, b = Fr(a), Fr(b); return 1 / a, -b / a
def m17_2(a1, b1, n2, c2, a3, b3):
    ia, ib = inv_lin(a1, b1); E1, I1 = lin(a1, b1), lin(ia, ib)
    E2, I2 = lin(Fr(1, n2), c2), lin(n2, -n2 * c2)
    ja, jb = inv_lin(a3, b3); E3 = lin(a3, b3); G = lambda aa, bb: f"graph:y={asc(a3, b3)}; y={asc(aa, bb)}; --y=x @-3,3,-3,3"
    return [
        C(f"문제 2) 다음 함수의 역함수를 구하시오.\n(1) y = {E1} 의 역함수는?", f"y = {I1}", [f"y = {lin(-ia, ib)}", f"y = {lin(ia, -ib)}"], f"x 에 대하여 풀면 x = {lin(ia, ib, 'y')} → x 와 y 를 바꾸면 y = {I1}"),
        C(f"문제 2) 다음 함수의 역함수를 구하시오.\n(2) y = {E2} 의 역함수는?", f"y = {I2}", [f"y = {lin(n2, n2 * c2)}", f"y = {lin(-n2, -n2 * c2)}"], f"x 에 대하여 풀면 x = {lin(n2, -n2 * c2, 'y')} → x 와 y 를 바꾸면 y = {I2}"),
        C(f"문제 4) 함수 y = {E3} {wa(E3)} 그 역함수(파란 선)의 그래프로 알맞은 것은? (점선 = y = x)", G(ja, jb), [G(ja, b3), G(-a3, b3)], f"역함수 y = {lin(ja, jb)} — 원래 그래프를 점선 y = x 로 접은 모양")]
def eq(x, y):   # x·a + b = y
    co = '' if x == 1 else '−' if x == -1 else n2s(x); return f"{co}a + b = {n2s(y)}"
def m17_3(a, b, x1, x2, t):
    y1, y2 = a * x1 + b, a * x2 + b; ft = a * t + b
    c1 = f"f({n2s(x1)}) = {n2s(y1)}"; c2 = f"f⁻¹({n2s(y2)}) = {n2s(x2)}"; d2 = f"f({n2s(x2)}) = {n2s(y2)}"
    head = f"중단원 08) 함수 f(x) = ax + b 가 {c1} {wa(n2s(y1))} {c2} {eul(n2s(x2))} 만족시킬 때, f({n2s(t)}) 의 값을 구하시오. (단, a 와 b 는 상수)\n"
    return [
        C(head + f"{c2} 의 뜻은?", d2, [f"f({n2s(x2)}) = {n2s(-y2)}", f"f({n2s(y2)}) = {n2s(x2)}"], f"{c2} ⇔ {d2}", f"{c2} 이므로 {d2}"),
        C(head + f"{c1} {eul(n2s(y1))} 식으로 쓰면?", eq(x1, y1), [eq(-x1, y1), eq(x1, -y1)], f"{c1} → {eq(x1, y1)}", f"{c1} 에서 {eq(x1, y1)}", extra=[eq(y1, x1), eq(x1, y1 + 1)]),
        C(head + f"{d2} {eul(n2s(y2))} 식으로 쓰면?", eq(x2, y2), [eq(x2, -y2), eq(y2, x2)], f"{d2} → {eq(x2, y2)}", f"{d2} 에서 {eq(x2, y2)}", extra=[eq(-x2, y2), eq(x2, y2 + 1)]),
        C(head + "두 식을 풀면?", f"a = {n2s(a)}, b = {n2s(b)}", [f"a = {n2s(-a)}, b = {n2s(-b)}", f"a = {n2s(a)}, b = {n2s(-b)}"], f"두 식을 빼면 a = {n2s(a)} → b = {n2s(b)}", f"두 식을 연립하면 a = {n2s(a)}, b = {n2s(b)}", extra=[f"a = {n2s(-a)}, b = {n2s(b)}", f"a = {n2s(b)}, b = {n2s(a)}"]),
        C(head + f"그러므로 f({n2s(t)}) {eun(abs(t))}?", n2s(ft), [n2s(-ft), n2s(a * t - b)], f"f(x) = {lin(a, b)} → f({n2s(t)}) = {n2s(ft)}", f"f(x) = {lin(a, b)} 이므로 f({n2s(t)}) = {n2s(ft)}", extra=[n2s(ft + 2), n2s(ft - 3)])]
def boss17(a, b, yv, a3, b3, a4, b4, x1, x2, t):
    E = lin(a, b); ia, ib = inv_lin(a, b); xv = (Fr(yv) - b) / a; assert xv.denominator == 1
    ja, jb = inv_lin(a3, b3); E3 = lin(a3, b3); G = lambda aa, bb: f"graph:y={asc(a3, b3)}; y={asc(aa, bb)}; --y=x @-3,3,-3,3"
    y1, y2, ft = a4 * x1 + b4, a4 * x2 + b4, a4 * t + b4
    return [
        C(f"1. 함수 f(x) = {E} 에 대하여 f⁻¹({n2s(yv)}) 의 값은?", n2s(xv), [n2s(-xv), n2s(a * yv + b)], f"f(a) = {n2s(yv)} 인 a : {lin(a, b, 'a')} = {n2s(yv)} → a = {n2s(xv)}", extra=[n2s(xv + 1), n2s(xv - 2)]),
        C(f"2. 함수 f(x) = {E} 에 대하여 y = f⁻¹(x) 는?", f"y = {lin(ia, ib)}", [f"y = {lin(ia, -ib)}", f"y = {lin(-ia, ib)}"], f"x = (y {'−' if b > 0 else '+'} {abs(b)})/{a} → y = {lin(ia, ib)}"),
        C(f"3. 함수 y = {E3} {wa(E3)} 그 역함수(파란 선)의 그래프는? (점선 = y = x)", G(ja, jb), [G(-a3, -b3), G(a3, -b3)], f"역함수 y = {lin(ja, jb)} · 점선 y = x 대칭"),
        C(f"4. 함수 f(x) = ax + b 가 f({n2s(x1)}) = {n2s(y1)}, f⁻¹({n2s(y2)}) = {n2s(x2)} {eul(n2s(x2))} 만족시킬 때, f({n2s(t)}) 의 값은?", n2s(ft), [n2s(-ft), n2s(a4 * t - b4)],
          f"f⁻¹({n2s(y2)}) = {n2s(x2)} → f({n2s(x2)}) = {n2s(y2)} · f({n2s(x1)}) = {n2s(y1)} → a = {n2s(a4)}, b = {n2s(b4)} → f({n2s(t)}) = {n2s(ft)}", extra=[n2s(ft + 3), n2s(ft - 2)])]

# ───────────────────────── 14차시 함수 ─────────────────────────
YL = ['a', 'b', 'c', 'd']
def m14_1(order, fmap, miss, missmap, dbl, dblmap):
    """order = ('F','M','D') 의 순서 · fmap = 함수(4글자) · missmap = 빠진 x 를 뺀 dict · dblmap = (x→y 여러 개) 쌍 목록"""
    head = "문제 1) X = {1, 2, 3, 4} 에서 Y = {a, b, c, d} 로의 대응\n"
    txt = {'F': ', '.join(f"{i + 1}→{y}" for i, y in enumerate(fmap)), 'M': ', '.join(f"{x}→{y}" for x, y in missmap), 'D': ', '.join(f"{x}→{y}" for x, y in dblmap)}
    out = []; fidx = order.index('F') + 1
    for i, kind in enumerate(order, 1):
        e = {'F': 1, 'M': miss, 'D': dbl}[kind]
        opts = {'F': '함수이다', 'M': f"함수가 아니다 — X 의 원소 {e} 에 대응하는 Y 의 원소가 없다", 'D': f"함수가 아니다 — X 의 원소 {e} 에 대응하는 Y 의 원소가 2개이다"}
        sol = {'F': "X 의 원소마다 Y 의 원소가 오직 하나씩 → 함수", 'M': f"X 의 원소 {e} 에서 나가는 화살표가 없다", 'D': f"X 의 원소 {e} 에서 나가는 화살표가 2개다"}[kind]
        out.append(C(head + f"({i}) {txt[kind]}\n이 대응은?", opts[kind], [v for k, v in opts.items() if k != kind], sol))
    rng = sorted(set(fmap)); rs = '{' + ', '.join(rng) + '}'
    out.append(C(f"문제 1) 함수인 ({fidx}) 의 공역은?", '{a, b, c, d}', [rs, '{1, 2, 3, 4}'], "공역 = Y 전체 = {a, b, c, d} (치역과 다름)"))
    out.append({'type': 'multi', 'question': f"문제 1) 함수인 ({fidx}) 의 치역의 원소를 모두 고르시오.", 'options': YL[:], 'answer': [YL.index(y) for y in rng], 'solution': f"치역 = 화살표를 받은 원소 = {rs}"})
    return out
def m14_2(a, b, sgn, c):
    E1 = lin(a, b); E2 = quad(sgn, 0, c); op = '≤' if sgn < 0 else '≥'; no = '≥' if sgn < 0 else '≤'
    return [
        C(f"문제 2) (1) y = {E1} 의 정의역은?", '{x | x 는 실수}', ['{x | x ≠ 0}', '{x | x ≥ 0}'], "정의역이 없으면 함수가 정의되는 실수 전체"),
        C(f"문제 2) (1) y = {E1} 의 치역은?", '{y | y 는 실수}', ['{y | y > 0}', f"{{y | y ≥ {n2s(b)}}}"], "x 가 실수 전체를 움직이면 y 도 실수 전체"),
        C(f"문제 2) (2) y = {E2} 의 정의역은?", '{x | x 는 실수}', ['{x | x ≥ 0}', f"{{x | x ≤ {n2s(c)}}}"], "정의역이 없으면 실수 전체"),
        C(f"문제 2) (2) y = {E2} 의 치역은?", f"{{y | y {op} {n2s(c)}}}", [f"{{y | y {no} {n2s(c)}}}", '{y | y 는 실수}'],
          f"{'−x² ≤ 0' if sgn < 0 else 'x² ≥ 0'} 이므로 y {op} {n2s(c)} (x = 0 일 때 가장 {'큼' if sgn < 0 else '작음'})")]
def m14_3(p, r, c):
    b = 1 - p - r; a = p * p + b * p + c - p
    G = f"x² + bx + {c}"; head = f"문제 3) 정의역이 {{{p}, {r}}}인 두 함수 f(x) = x + a, g(x) = {G} 에 대하여 f = g 일 때\n"
    pb = lambda v: 'b' if v == 1 else f"{v}b"
    e1 = f"{p} + a = {p * p + c} + {pb(p)}"; e2 = f"{r} + a = {r * r + c} + {pb(r)}"
    return [
        C(head + "f = g 가 뜻하는 것은?", f"f({p}) = g({p}), f({r}) = g({r})", ['f(x) = g(x) 인 x 가 하나만 있으면 된다', '두 함수의 식이 똑같다'], "서로 같은 함수 = 정의역의 모든 원소에서 함숫값이 같다", f"f = g 이므로 f({p}) = g({p}), f({r}) = g({r}) 이다."),
        C(head + f"f({p}) = g({p}) {eul(')')} 식으로 쓰면?", e1, [f"{p} + a = {c} + {pb(p)}" if p > 1 else f"{p} + a = {c + 2} + {pb(p)}", f"a = {p * p + c} + {pb(p)}"], f"f({p}) = {p} + a · g({p}) = {p * p} + {pb(p)} + {c}", f"f({p}) = g({p}) 에서 {e1}"),
        C(head + f"f({r}) = g({r}) {eul(')')} 식으로 쓰면?", e2, [f"{r} + a = {c + r} + {pb(r)}", f"{r} + a = {r * r} + {pb(r)}"], f"f({r}) = {r} + a · g({r}) = {r * r} + {pb(r)} + {c}", f"f({r}) = g({r}) 에서 {e2}"),
        C(head + "두 식을 빼서 구한 b 는?", f"b = {n2s(b)}", [f"b = {n2s(b + 1)}", f"b = {n2s(-b)}"], f"(뒤 식) − (앞 식) : {r - p} = {r * r - p * p} + {pb(r - p)} → b = {n2s(b)}", f"두 식을 빼면 b = {n2s(b)}"),
        C(head + "그러므로 a 와 b 는?", f"a = {n2s(a)}, b = {n2s(b)}", [f"a = {n2s(b)}, b = {n2s(a)}", f"a = {n2s(a)}, b = {n2s(-b)}"], f"{e1} 에 b = {n2s(b)} {eul(n2s(b))} 넣으면 a = {n2s(a)}", f"그러므로 a = {n2s(a)}, b = {n2s(b)} 이다.", extra=[f"a = {n2s(-a)}, b = {n2s(b)}", f"a = {n2s(a + 1)}, b = {n2s(b)}"])]
def boss14(fm, mm, dm, order, a, b, Y, sgn, c, p, r):
    opt = {'F': ', '.join(f"{i + 1}→{y}" for i, y in enumerate(fm)), 'M': ', '.join(f"{x}→{y}" for x, y in mm), 'D': ', '.join(f"{x}→{y}" for x, y in dm)}
    chs = [f"{'①②③'[i]} {opt[k]}" for i, k in enumerate(order)]
    rng = [a * x + b for x in (1, 2, 3)]; assert all(v in Y for v in rng)
    E = lin(a, b); E3 = quad(sgn, 0, c); op = '≤' if sgn < 0 else '≥'; no = '≥' if sgn < 0 else '≤'
    A, Bc = p + r, -p * r
    return [
        {'type': 'choice', 'question': "1. X = {1, 2, 3} 에서 Y = {a, b} 로의 대응 중 함수인 것은?", 'choices': chs, 'answerIndex': order.index('F'), 'solution': "X 의 원소마다 화살표가 꼭 하나 → 함수"},
        {'type': 'multi', 'question': f"2. X = {{1, 2, 3}} 에서 Y = {{{', '.join(map(str, Y))}}} 로의 함수 f(x) = {E} 의 치역의 원소를 모두 고르시오.", 'options': [str(v) for v in Y], 'answer': sorted(Y.index(v) for v in set(rng)), 'solution': f"치역 = 함숫값 모음 = {{{', '.join(map(n2s, sorted(set(rng))))}}}"},
        C(f"3. 함수 y = {E3} 의 치역은?", f"{{y | y {op} {n2s(c)}}}", [f"{{y | y {no} {n2s(c)}}}", '{y | y 는 실수}'], f"{'−x² ≤ 0' if sgn < 0 else 'x² ≥ 0'} 이므로 y {op} {n2s(c)}"),
        C(f"4. 정의역이 {{{p}, {r}}}인 두 함수 f(x) = ax + b, g(x) = x² 에 대하여 f = g 일 때, 상수 a, b 는?", f"a = {A}, b = {n2s(Bc)}", [f"a = {A}, b = {n2s(-Bc)}", f"a = {n2s(Bc)}, b = {A}"], f"f({p}) = g({p}), f({r}) = g({r}) {eul(')')} 연립")]

# ───────────────────────── 15차시 함수의 그래프 ─────────────────────────
def pts(P): return 'pts ' + ' '.join(f"({x},{y})" for x, y in P)
def m15_1(a, b, bad_pts, bad_x, circ_r, la, lb):
    E = lin(a, b); P = [(x, a * x + b) for x in (0, 1, 2, 3)]; S = [(y, x) for x, y in P]
    M = max(abs(v) for q in P + S for v in q) + 1; W = f" @-{M},{M},-{M},{M}"
    L = f"graph:y={asc(a, b)}{W}"; ptxt = ', '.join(f"({x}, {n2s(y)})" for x, y in P)
    m2 = max(abs(v) for q in bad_pts for v in q) + 1; w3 = max(3, circ_r + 1)
    reasons = ['세로선 x = a 와 두 점 이상에서 만나는 곳이 있다', '점으로만 되어 있거나 곡선이다', '가로선 y = b 와 두 점에서 만나는 곳이 있다']
    return [
        C(f"문제 4) 정의역이 {{0, 1, 2, 3}} 인 함수 y = {E} 의 그래프는?", f"graph:{pts(P)}{W}", [f"graph:{pts(S)}{W}", L], f"x = 0, 1, 2, 3 을 넣은 점 4개 : {ptxt}", f"정의역이 {{0, 1, 2, 3}} 이면 그래프는 점 4개 {ptxt}"),
        C(f"문제 4) 정의역이 {{x | x 는 실수}} 인 함수 y = {E} 의 그래프는?", L, [f"graph:{pts(P)}{W}", f"graph:y={asc(-a, b)}{W}"], f"정의역이 실수 전체 → 점이 이어져 직선 y = {E}"),
        C("문제 5) 다음 중 함수의 그래프인 것은?", f"graph:y={asc(la, lb)} @-{w3},{w3},-{w3},{w3}", [f"graph:{pts(bad_pts)} @-1,{m2},-1,{m2}", f"graph:circle (0,0) {circ_r} @-{w3},{w3},-{w3},{w3}"], "세로선 x = a 를 그어 보면 어디서나 한 점에서만 만나는 것은 직선뿐"),
        C("문제 5) 함수의 그래프가 아닌 두 그림의 까닭은?", reasons[0], reasons[1:], f"점 그림은 x = {bad_x} 에서 점이 2개 · 원은 세로선과 두 점에서 만남 → 함수가 아니다")]
def m15_2(a, b, c, d, k):
    o = [f"(1) y = {lin(a, b)}", f"(2) y = {quad(-1, 0, c)}", f"(3) y = |x|" + (f" {'−' if d < 0 else '+'} {abs(d)}" if d else ''), f"(4) x ≥ 0 이면 y = {lin(-k, 0)} · x < 0 이면 y = x²"]
    g = f"(4) 의 그래프 [[graph:y=x^2 (-5,0); y=-{'' if k == 1 else k}x [0,5) @-3,3,-4,4]]"; v = c - 1; assert v != 0
    return [
        {'type': 'multi', 'question': f"문제 6) 다음 함수 중 일대일함수를 모두 고르시오. (정의역 · 공역 = 실수 전체)\n{g}", 'options': o, 'answer': [0, 3], 'solution': "가로줄을 그었을 때 그래프와 한 번만 만나는 것 = (1), (4) · (2) (3) 은 x = −1, 1 에서 값이 같다"},
        {'type': 'multi', 'question': f"문제 6) 다음 함수 중 일대일대응을 모두 고르시오. (정의역 · 공역 = 실수 전체)\n{g}", 'options': o, 'answer': [0, 3], 'solution': "(1) · (4) 는 일대일함수이고 치역 = 실수 전체 = 공역 → 일대일대응"},
        C(f"문제 6) (2) y = {quad(-1, 0, c)} {i_ga(c)} 일대일함수가 아닌 까닭은?", f"f(−1) = f(1) = {n2s(v)} 이다", [f"f(0) = {n2s(c)} {i_ga(c)} 가장 크다", f"f(−1) = {n2s(-v)}, f(1) = {n2s(v)} 이다"], f"(−1)² = 1² = 1 → f(−1) = f(1) = −1 + {c} = {n2s(v)}")]
KN = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ']
def bogi(order, cv, la, lb, qa, qc):
    """order = 'C I L Q' 의 자리(ㄱ~ㄹ) · 글자 · 값"""
    ex = {'C': n2s(cv), 'I': 'x', 'L': lin(la, lb), 'Q': quad(qa, 0, qc)}
    return ex, '   '.join(f"{KN[i]}. y = {ex[k]}" for i, k in enumerate(order)), {k: KN[i] for i, k in enumerate(order)}
def m15_3(order, cv, la, lb, qa, qc):
    ex, line, at = bogi(order, cv, la, lb, qa, qc); v = qa + qc; assert v != 0
    head = f"중단원 02) 보기에서 일대일대응, 항등함수, 상수함수를 찾으시오. (정의역 · 공역 = 실수 전체)\n{line}\n"
    one = sorted([at['I'], at['L']], key=KN.index); pair = ' · '.join(one); pc = ', '.join(one)
    summ = f"일대일대응 {pc} · 항등함수 {at['I']} · 상수함수 {at['C']}"
    oth = lambda k: [x for x in KN if x != at[k]]
    return [
        C(head + "모든 x 에 같은 값 하나가 대응하는 상수함수는?", at['C'], [at['I'], at['L']], f"{at['C']}. y = {ex['C']} → 모든 x 에 {ex['C']} 하나가 대응", f"상수함수 = 모든 x 에 같은 값 하나 → {at['C']}"),
        C(head + "f(x) = x 인 항등함수는?", at['I'], [at['L'], at['C']], "f(x) = x → 자기 자신이 대응", f"항등함수 = f(x) = x → {at['I']}"),
        C(head + f"{at['Q']}. y = {ex['Q']} {eun(abs(qc)) if qc else '는'} 일대일함수일까?", f"f(−1) = f(1) = {n2s(v)} 이므로 일대일함수가 아니다", [f"f(0) = {n2s(qc)} 이므로 일대일함수가 아니다", f"f(−1) = {n2s(-v)}, f(1) = {n2s(v)} 이므로 일대일함수이다"],
          f"{at['Q']} : (−1)² = 1² → f(−1) = f(1) = {n2s(v)}", f"{at['Q']} 는 −1 ≠ 1 이지만 f(−1) = f(1) = {n2s(v)} → 일대일함수가 아니다"),
        C(head + f"일대일함수인 {pair} 의 치역은?", '실수 전체', ['{y | y ≥ 0}', '{y | y > 0}'], f"{pair} 는 직선 → x 가 실수 전체면 y 도 실수 전체 = 공역", f"{pair} 의 치역 = 실수 전체 = 공역 → 일대일대응"),
        {'type': 'match', 'question': head + f"그러므로? 이름에서 보기로 화살표를 이으시오. (한 이름에서 여러 개 · {at['I']} 처럼 두 이름에서 올 수도 있음)", 'xs': ['일대일대응', '항등함수', '상수함수'], 'ys': KN[:],
         'answer': sorted([[0, KN.index(at['I'])], [0, KN.index(at['L'])]]) + [[1, KN.index(at['I'])], [2, KN.index(at['C'])]], 'xn': '이름', 'yn': '보기', 'solution': summ, 'say': '그러므로 ' + summ}]
def boss15(a, b, nonf, fs, opts3, ans3, order, cv, la, lb, qa, qc):
    E = lin(a, b); P = [(x, a * x + b) for x in (-1, 0, 1)]; S = [(y, x) for x, y in P]; Z = [(x, a * x) for x in (-1, 0, 1)]
    W = " @-4,4,-5,5"; ex, line, at = bogi(order, cv, la, lb, qa, qc)
    one = sorted([at['I'], at['L']], key=KN.index)
    c2 = [f"graph:{g} @-3,3,-3,3" for g in fs] + [f"graph:{nonf} @-3,3,-3,3"]; cor = c2[-1]; R.shuffle(c2)
    return [
        C(f"1. 정의역이 {{−1, 0, 1}} 인 함수 f(x) = {E} 의 그래프는?", f"graph:{pts(P)}{W}", [f"graph:{pts(Z)}{W}", f"graph:{pts(S)}{W}"], "순서쌍 " + ', '.join(f"({n2s(x)}, {n2s(y)})" for x, y in P)),
        {'type': 'choice', 'question': "2. 다음 중 함수의 그래프가 아닌 것은?", 'choices': c2, 'answerIndex': c2.index(cor), 'solution': f"{nonf} {eun(nonf[-1]) if nonf[-1].isdigit() else '은'} 세로선과 두 점 이상(또는 한 줄 전체)에서 만난다 → 함수가 아니다"},
        {'type': 'multi', 'question': "3. 정의역 · 공역이 실수 전체일 때, 일대일대응인 것을 모두 고르시오.", 'options': [f"y = {o}" for o in opts3], 'answer': ans3, 'solution': "일대일함수이고 치역 = 실수 전체인 것 = 직선 (기울기 ≠ 0)"},
        {'type': 'match', 'question': f"4. 보기에서 일대일대응 · 항등함수 · 상수함수를 찾아 이름에서 보기로 화살표를 이으시오. (정의역 · 공역 = 실수 전체)\n{line}", 'xs': ['일대일대응', '항등함수', '상수함수'], 'ys': KN[:],
         'answer': sorted([[0, KN.index(at['I'])], [0, KN.index(at['L'])]]) + [[1, KN.index(at['I'])], [2, KN.index(at['C'])]], 'xn': '이름', 'yn': '보기', 'solution': f"일대일대응 {', '.join(one)} · 항등함수 {at['I']} · 상수함수 {at['C']}"}]

# ───────────────────────── 새 판의 숫자 (판 3개씩) ─────────────────────────
NEW = {
 16: dict(m1=[m16_1(2, -3, 1, 3, -1, 2), m16_1(-1, 4, -2, 1, 2, -1), m16_1(4, 1, -3, -1, 2, 1)],
          m2=[m16_2(2), m16_2(-5), m16_2(6)],
          m3=[m16_3(3, 5, 2, -1), m16_3(4, -3, -1, 2), m16_3(5, 1, 3, 2)],
          boss=[boss16(2, 1, -3, 1, 2, 3, 4, 2, -1), boss16(-2, 2, 3, 4, -1, 4, -5, 3, 2), boss16(-4, -1, 6, 2, 1, 2, 9, -3, 1)]),
 17: dict(m1=[m17_1([3, 5, 7, 9], [2, 0, 3, 1], 3, 5, 1, 9, 4), m17_1([2, 3, 5, 8], [1, 3, 0, 2], 1, 2, 2, 5, 4), m17_1([4, 6, 7, 9], [3, 1, 2, 0], 4, 6, 3, 9, 1)],
          m2=[m17_2(4, -8, 2, 3, -2, 4), m17_2(-2, 6, 5, -1, -3, 3), m17_2(5, 10, 3, -2, 4, -2)],
          m3=[m17_3(2, 3, 1, -1, 4), m17_3(-3, 4, 2, -1, 3), m17_3(4, -5, 2, 1, -1)],
          boss=[boss17(2, -4, 6, 3, 3, 3, -1, 1, 2, -2), boss17(3, 5, -4, -2, 2, -2, 5, 1, 3, -1), boss17(5, -3, 7, 4, 2, 4, -3, 2, -1, 3)]),
 14: dict(m1=[m14_1(('M', 'D', 'F'), 'bdbc', 1, [(2, 'a'), (3, 'c'), (4, 'd')], 2, [(1, 'd'), (2, 'a'), (2, 'c'), (3, 'b'), (4, 'b')]),
              m14_1(('D', 'F', 'M'), 'dbad', 4, [(1, 'b'), (2, 'b'), (3, 'd')], 3, [(1, 'a'), (2, 'd'), (3, 'b'), (3, 'c'), (4, 'a')]),
              m14_1(('F', 'D', 'M'), 'acca', 2, [(1, 'd'), (3, 'a'), (4, 'b')], 4, [(1, 'b'), (2, 'c'), (3, 'd'), (4, 'a'), (4, 'c')])],
          m2=[m14_2(-2, 5, 1, -4), m14_2(4, 3, -1, 7), m14_2(-3, -1, 1, 2)],
          m3=[m14_3(2, 3, 4), m14_3(1, 4, 3), m14_3(2, 4, 6)],
          boss=[boss14('bab', [(1, 'b'), (3, 'a')], [(1, 'a'), (2, 'b'), (3, 'a'), (3, 'b')], ('M', 'F', 'D'), 3, -2, [1, 2, 4, 7], -1, 6, 2, 4),
                boss14('aab', [(2, 'a'), (3, 'b')], [(1, 'b'), (2, 'a'), (2, 'b'), (3, 'b')], ('D', 'M', 'F'), -1, 5, [1, 2, 3, 4, 5], 1, -2, 1, 2),
                boss14('bba', [(1, 'a'), (2, 'b')], [(1, 'a'), (1, 'b'), (2, 'b'), (3, 'a')], ('F', 'D', 'M'), 2, 3, [3, 5, 7, 9], -1, -3, 3, 4)]),
 15: dict(m1=[m15_1(-1, 3, [(1, 2), (2, 1), (3, 3), (3, 1), (4, 2)], 3, 1, -1, 2), m15_1(3, -2, [(0, 1), (1, 3), (1, 0), (2, 2), (3, 4)], 1, 2, 2, -1), m15_1(-3, 5, [(1, 4), (2, 2), (3, 1), (4, 3), (4, 1)], 4, 1, 1, -2)],
          m2=[m15_2(-2, 1, 4, -1, 2), m15_2(4, -3, 3, 1, 4), m15_2(-1, 5, 6, 0, 5)],
          m3=[m15_3('LQCI', -2, 5, -1, 1, -3), m15_3('QICL', 4, -2, 3, -1, 5), m15_3('ICQL', -5, 3, 1, 3, -1)],
          boss=[boss15(-2, 1, 'circle (0,0) 1', ['y=x-1', 'y=-x^2+2', 'y=1'], ['2x + 5', '|x| − 1', '−x² + 4', '−x − 2'], [0, 3], 'CLIQ', 3, -2, 1, 1, 4),
                boss15(2, 3, 'x=-2', ['y=|x|-1', 'y=-2', 'y=2x'], ['x² + 2', '−4x', '|x| + 3', '3x − 1'], [1, 3], 'QLCI', -1, 4, -3, -1, 2),
                boss15(-3, -1, 'circle (0,0) 2', ['y=-x', 'y=x^2-2', 'y=3'], ['−x + 1', '5x', '−x² − 1', '|x|'], [0, 1], 'LCQI', 6, -1, 2, 2, -5)]),
}

# ───────────────────────── 표기 고침 (있던 판에) ─────────────────────────
def fix_text(s):
    if not isinstance(s, str) or s.startswith('graph:'): return s
    t = re.sub(r'(?<![\d/(])1x\b', 'x', s)
    t = re.sub(r'(x²) − 0\b', r'\1', t)
    t = re.sub(r'\((-)(\d+)\)', r'(−\2)', t)
    def josa(m):
        last, p = m[1][-1], m[2]; j = {'0': 1, '1': 1, '2': 0, '3': 1, '4': 0, '5': 0, '6': 1, '7': 1, '8': 1, '9': 0, 'x': 0, '²': 0, '⁴': 0}.get(last)
        if j is None: return m[0]
        pair = {'와': ('와', '과'), '과': ('와', '과'), '을': ('를', '을'), '를': ('를', '을')}[p]
        return f"{m[1]} {pair[j]} "
    return re.sub(r'([0-9x²⁴])\s(와|과|을|를)\s', josa, t)
def fix_item(it):
    for k in ('question', 'solution', 'say'):
        if k in it: it[k] = fix_text(it[k])
    for k in ('choices', 'options'):
        if k in it: it[k] = [fix_text(c) for c in it[k]]
    return it
def walk_items(d):
    for m in d['monsters'].values():
        for it in m['first']: yield it
        for s in m.get('retry', {}).get('pool', []): yield from s
        if m.get('chain'):
            for s in m['chain']['pool']: yield from s
    for vs in d['boss']['pool']: yield from vs
    for s in d['boss'].get('sets') or []:
        if s: yield from s

def build(n, src, out):
    d = json.load(open(src)); fixed = 0
    for it in walk_items(d):
        before = json.dumps(it, ensure_ascii=False); fix_item(it); fixed += before != json.dumps(it, ensure_ascii=False)
    if n == 15:   # ① 오답 보기가 참인 것 고침  ② 「ㄴ 처럼」 = 그 판의 항등함수 자리로
        for it in walk_items(d):
            if it.get('type') == 'choice' and '일대일함수가 아닌 까닭' in it['question']:
                for i, c in enumerate(it['choices']):
                    m = re.fullmatch(r'f\(−1\) = (−?\d+), f\(1\) = (−?\d+) 이다', c)
                    if m and m[1] == m[2] and i != it['answerIndex']: it['choices'][i] = f"f(−1) = {n2s(-(int(m[1].replace('−', '-')) + 1))}, f(1) = {n2s(int(m[1].replace('−', '-')) + 1)} 이다"; fixed += 1
            if it.get('type') == 'match' and '처럼 두 이름에서' in it['question']:
                iden = [KN[y] for x, y in it['answer'] if x == 1][0]; q = re.sub(r'· [ㄱ-ㄹ] 처럼', f'· {iden} 처럼', it['question'])
                fixed += q != it['question']; it['question'] = q
    for k, sets in NEW[n].items():
        if k == 'boss':
            for v in sets:
                for i, item in enumerate(v): d['boss']['pool'][i].append(item)
            continue
        m = d['monsters'][k]
        for s in sets:
            m['retry']['pool'].append([{kk: vv for kk, vv in it.items() if kk != 'say' or m.get('chain')} for it in copy.deepcopy(s)])
            if m.get('chain'): m['chain']['pool'].append(copy.deepcopy(s))
    d['v'] = (d.get('v') or 1) + 1
    json.dump(d, open(out, 'w'), ensure_ascii=False, indent=1)
    return fixed

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
    for n in (14, 15, 16, 17):
        f = build(n, f"{src}/z{n}/ex{n}.json", f"{dst}/ex{n}-more.json"); print(f"{n}차시: 있던 문항 표기 고침 {f}개 · 새 판 3개씩 더함 → {dst}/ex{n}-more.json")
