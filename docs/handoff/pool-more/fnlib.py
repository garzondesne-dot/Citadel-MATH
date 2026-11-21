"""함수 단원(14~17차시) 팩 검산 · 생성 공용 (설계 방 · 묶음 #5) — 식 글자 ↔ 계산"""
import re
from fractions import Fraction as Fr
SUP = {'²': '**2', '³': '**3', '⁴': '**4'}
def ev(expr, x):
    """'2x + 1' · '−x²' · '(1/4)x + 2' · '3x² − 4' 를 x 에서 계산(분수로)."""
    s = expr.replace('−', '-').replace(' ', '')
    for k, v in SUP.items(): s = s.replace(k, v)
    s = re.sub(r'\((-?\d+)/(\d+)\)', r'Fr(\1,\2)', s)
    s = re.sub(r'(?<![\d,(])(\d+)/(\d+)', r'Fr(\1,\2)', s)
    s = re.sub(r'(\d|\))x', r'\1*x', s)
    s = re.sub(r'\|([^|]+)\|', r'abs(\1)', s)
    return eval(s, {'Fr': Fr, 'abs': abs}, {'x': Fr(x)})
def num(s):
    s = s.strip().replace('−', '-').replace(' ', '')
    m = re.fullmatch(r'(-?\d+)/(\d+)', s)
    return Fr(int(m[1]), int(m[2])) if m else Fr(s)
def same(e1, e2, xs=(-3, -2, -1, 0, 1, 2, 3, 5)):
    return all(ev(e1, x) == ev(e2, x) for x in xs)
def sg(n):   # 부호 붙인 수 글자
    return f"− {abs(n)}" if n < 0 else f"+ {n}"
def lin(a, b, v='x'):
    """a·v + b 글자 (계수 1 · 0 숨김)."""
    a, b = Fr(a), Fr(b)
    def co(c):
        if c == 1: return ''
        if c == -1: return '−'
        if c.denominator == 1: return ('−' if c < 0 else '') + str(abs(c.numerator))
        return ('−' if c < 0 else '') + f"({abs(c.numerator)}/{c.denominator})"
    def cn(c): return (str(abs(c.numerator)) if c.denominator == 1 else f"{abs(c.numerator)}/{c.denominator}")
    if a == 0: return ('−' if b < 0 else '') + cn(b)
    t = co(a) + v
    if b == 0: return t
    return f"{t} {'−' if b < 0 else '+'} {cn(b)}"
def n2s(n):
    n = Fr(n)
    if n.denominator == 1: return ('−' if n < 0 else '') + str(abs(n.numerator))
    return ('−' if n < 0 else '') + f"{abs(n.numerator)}/{n.denominator}"
def wa(word):   # 받침에 따라 와/과
    last = word.strip()[-1]
    jong = {'0': 1, '1': 1, '2': 0, '3': 1, '4': 0, '5': 0, '6': 1, '7': 1, '8': 1, '9': 0, 'x': 0, '²': 0, '⁴': 0, ')': 0}
    return '과' if jong.get(last, 0) else '와'
def eul(word):
    last = word.strip()[-1]
    jong = {'0': 1, '1': 1, '2': 0, '3': 1, '4': 0, '5': 0, '6': 1, '7': 1, '8': 1, '9': 0}
    return '을' if jong.get(last, 0) else '를'
