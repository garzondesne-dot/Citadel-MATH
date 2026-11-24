# 교사용 레이드 학습지 공용 틀 (2026-11-24 · 📚 차시팩 #1 · 선생님 「13 ~ 17차시 교사용 정답 전부」)
#   학생용 생성기(gen_wsNN.py) 소스를 읽어 같은 쪽 · 같은 칸에 정답(빨강) · 풀이 · 판서 · 사진 채점 기준을 채우고 그대로 실행
#   차시마다 gen_wsNN_teacher.py 가 ANS(빈칸 순서) · PAR(괄호 순서) · CIRCLE(「( A · B )」 고르기) · MEMOS · ESSAY · RUBRIC · FS 를 넘김
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from wslib import v as _v
R = '#d32f2f'
TCSS = f'''
.ans {{ color:{R}; font-weight:700; border-bottom:1px solid {R}; padding:0 1.2mm; }}
.tsol {{ color:{R}; font-size:8.2pt; line-height:1.35; padding:0.3mm 0 0.6mm 4mm; }}
.tmemo {{ border:1.3px solid {R}; border-radius:5px; padding:1.2mm 2.4mm; color:{R}; font-size:8pt; line-height:1.4; margin-top:1.2mm; }}
.essay .tl {{ border-bottom:1px dashed #b9c4d8; min-height:5.6mm; color:{R}; font-size:8.4pt; line-height:1.4; padding-top:0.6mm; }}
'''
A = lambda s: f'<span class="ans">{_v(s)}</span>'
esc = lambda t: t.replace('{', '{{').replace('}', '}}')     # 학생용 f-string 안에 넣는 글


def build(base, out, *, lesson, ANS, PAR=(), CIRCLE=(), MEMOS=(), ESSAY=(), RUBRIC='', FS=None, KA=(), EXTRA_ONCE=(), P2MEMO=None, title_re=None):
    src = open(os.path.join(HERE, base), encoding='utf-8').read()
    src = src.replace('os.path.dirname(os.path.abspath(__file__))', repr(HERE)).replace('OUT = sys.argv[1]', '')
    toks = list(re.finditer(r'BL\["(s|m|l|xl)"\]', src)); assert len(toks) == len(ANS), (len(toks), len(ANS))
    o, last = [], 0
    for i, m in enumerate(toks):
        o.append(src[last:m.start()]); o.append(m.group(0) if ANS[i] is None else f'ANS[{i}]'); last = m.end()
    src = ''.join(o) + src[last:]
    pars = list(re.finditer(r'\( (?:&nbsp;)+ \)', src)); assert len(pars) == len(PAR), (len(pars), len(PAR))
    o, last = [], 0
    for m, val in zip(pars, PAR):
        o.append(src[last:m.start()]); o.append(m.group(0) if val is None else f'( <span class=ans>{val}</span> )'); last = m.end()
    src = ''.join(o) + src[last:]

    def once(old, new):
        nonlocal src
        assert old in src, old[:70]; src = src.replace(old, new, 1)
    for old, pick in CIRCLE:                                 # 「( 이다 · 아니다 )」 → 고른 말만 빨강
        once(old, old.replace(pick, f'<span class=ans>{pick}</span>', 1))
    for old, new in EXTRA_ONCE: once(old, new)
    for t in MEMOS:
        i = src.index('{MEMO}'); src = src[:i] + esc(t) + src[i + 6:]
    assert '{MEMO}' not in src
    if P2MEMO: once('<div class="add mini">', esc(P2MEMO) + '<div class="add mini">')
    if ESSAY:
        n = src.count('<div class="ln"></div>'); lines = '<div class="ln"></div>' * n
        assert lines in src
        body = ''.join(f'<div class="tl">{_v(s)}</div>' for s in ESSAY)
        if RUBRIC: body += f'<div class="mini" style="color:{R};margin-top:1mm"><b>📸 채점</b> {RUBRIC}</div>'
        src = src.replace(lines, esc(body), 1)
    if FS is not None:
        old = "fq = lambda n, s, h: f'<div class=\"q\">{n}. {s}</div>{W(h)}'"
        assert old in src
        src = src.replace(old, "fq = lambda n, s, h: f'<div class=\"q\">{n}. {s}</div>' + (f'<div class=\"tsol\">{FS[n]}</div>' if n in FS else W(h))")
    once(f"hd = header('{lesson}차시', rng)", f"hd = header('{lesson}차시 · 교사용', rng)")
    src, k = re.subn(r"(rng = '[^'\n]*)'\n", r"\1 · 교사용 정답 · 학생 배포 ✕'\n", src, count=1); assert k == 1
    src, k = re.subn(r"<title>([^<]*)</title><style>\{CSS\}\{EXTRA\}\{KCSS\}</style>", r"<title>\1 · 교사용</title><style>{CSS}{EXTRA}{KCSS}{TCSS}</style>", src, count=1); assert k == 1
    exec(compile(src, f'{base}(teacher)', 'exec'), {'__name__': '__main__', 'OUT': out, 'ANS': ANS, 'FS': FS or {}, 'TCSS': TCSS, 'KA': list(KA), 'sys': sys})
