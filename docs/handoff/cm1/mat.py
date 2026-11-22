from cm1lib import *
NOTE = ' (; 는 행을 나누는 표시)'
def M(m): return '(' + ' ; '.join('  '.join(N(x) for x in row) for row in m) + ')'
def madd(a, b, s=1): return [[x + s * y for x, y in zip(r1, r2)] for r1, r2 in zip(a, b)]
def msc(k, a): return [[k * x for x in r] for r in a]
def mmul(a, b): return [[sum(a[i][k] * b[k][j] for k in range(len(b))) for j in range(len(b[0]))] for i in range(len(a))]
def rmat(rng, r, c, lo=-4, hi=5): return [[rng.randint(lo, hi) for _ in range(c)] for _ in range(r)]
def tot(a): return sum(sum(r) for r in a)
def PN(x): return N(x) if x >= 0 else '(' + N(x) + ')'
