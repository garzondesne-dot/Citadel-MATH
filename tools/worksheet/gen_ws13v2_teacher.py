# 13차시 레이드용 v2 (🔑 입장 열쇠) · 교사용 (2026-11-23 · 📚 차시팩 #1 · 메인 머리 요청 「13차시 교사용 레이드학습지」)
#   학생용 gen_ws13v2.py 를 그대로 읽어 빈칸 · 괄호 · 서술 칸 · 메모 칸만 정답(빨간 글씨) · 풀이로 바꿈 → 같은 판 · 같은 쪽 배치
#   정답 출처 = 운영 서버 13차시 팩(docs/handoff/design5/packs-server/ex-13.json)의 첫 판 정답 · sol 과 같은 숫자 · 독립 검산 = 아래 CHECK
#   쓰는 법: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws13v2_teacher.py <출력.pdf> [학생용 생성기=gen_ws13v2.py] [열쇠 json]
#   (2026-11-23) v3 = gen_ws13v3.py + docs/handoff/pack-13keys/keys-13.json (열쇠만 바뀜)
import os, sys, re, json, math
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = sys.argv[1]
BASE = sys.argv[2] if len(sys.argv) > 2 else 'gen_ws13v2.py'
KEYS = sys.argv[3] if len(sys.argv) > 3 else os.path.join(ROOT, 'docs/handoff/design/entry-keys/keys-13.json')

# ── 독립 검산 (팩을 읽지 않고 다시 계산) ─────────────────────────────
import itertools
sys.path.insert(0, HERE)
from wslib import v as _v
xs = [i / 4 for i in range(-80, 81)]
CHECK = {
    'm1(1) (a−b)² ≥ 0': all((a - b) ** 2 >= 0 for a in xs[::8] for b in xs[::8]),
    'm1(2) |x−2| ≥ 0': all(abs(x - 2) >= 0 for x in xs),
    'm1(3) x²+x+1<0 거짓(x=0)': not (0 ** 2 + 0 + 1 < 0),
    'm1(4) |a+3|>1 거짓(a=−3)': not (abs(-3 + 3) > 1),
    'm2 x²+9−6x=(x−3)², 등호 x=3': all(abs((x * x + 9 - 6 * x) - (x - 3) ** 2) < 1e-9 for x in xs),
    'm3 min(x+4/x)=4 at x=2': abs(min(x + 4 / x for x in xs if x > 0) - 4) < 1e-9,
    'm4 전개 = ab+16/(ab)+10': all(abs((a + 2 / b) * (b + 8 / a) - (a * b + 16 / (a * b) + 10)) < 1e-9 for a in xs[81::6] for b in xs[81::6]),
    'm4 최솟값 18 (ab=4)': abs(min((a + 2 / b) * (b + 8 / a) for a in xs[81:] for b in xs[81:]) - 18) < 1e-9,
    '형1 절대부등식 · 형2 ② x²+2>0': all(x * x + 2 > 0 for x in xs) and not all(x > 1 for x in xs) and not all(x * x > 0 for x in xs),
    '형3 x²−4x+4=(x−2)²': all(abs((x * x - 4 * x + 4) - (x - 2) ** 2) < 1e-9 for x in xs),
    '형4 min(x+9/x)=6': abs(min(x + 9 / x for x in xs if x > 0) - 6) < 1e-9,
    '형5 a+b=10 → max ab=25': max(a * (10 - a) for a in xs if 0 < a < 10) == 25,
}
bad = [k for k, ok in CHECK.items() if not ok]
assert not bad, f'독립 검산 실패: {bad}'
print('독립 검산', len(CHECK), '항목 모두 ✔')

src = open(os.path.join(HERE, BASE), encoding='utf-8').read()
if 'WSD = os.path' not in src:
    src = src.replace(src[src.index('WSD = '):src.index('\n', src.index('WSD = '))], f'WSD = {HERE!r}')
src = src.replace('os.path.abspath(__file__)', repr(os.path.join(HERE, BASE)))
src = src.replace('def keybox(', 'def _keybox_student(')   # v3 처럼 생성기 안에 keybox 가 있으면 교사용 keybox 를 씀
src = src.replace('OUT = sys.argv[1]', '')
src = src.replace('from keybox import keybox, KCSS', 'from keybox import KCSS')

# 빨간 정답 · 풀이
R = '#d32f2f'
TCSS = f'''
.ans {{ color:{R}; font-weight:700; border-bottom:1px solid {R}; padding:0 1.2mm; }}
.tsol {{ color:{R}; font-size:8.4pt; line-height:1.35; padding:0.4mm 0 0 4mm; overflow:hidden; }}
.tmemo {{ border:1.3px solid {R}; border-radius:5px; padding:1.2mm 2.4mm; color:{R}; font-size:8.6pt; line-height:1.45; margin-top:2mm; }}
.tmemo b {{ color:{R}; }}
.essay .tl {{ border-bottom:1px dashed #b9c4d8; min-height:7mm; color:{R}; font-size:9pt; line-height:7mm; }}
.tag-t {{ display:inline-block; background:{R}; color:#fff; font-size:8pt; font-weight:700; padding:0.2mm 2mm; border-radius:4px; margin-left:2mm; }}
'''
A = lambda s: f'<span class="ans">{_v(s)}</span>'

# 빈칸(BL) 29곳 = 학생용 소스 순서 그대로
ANS = [
    A('귀류법'), A('a, b 모두 홀수'),                                  # 전시 확인
    A('특정한 x 에서만 성립'), A('모든 x 에서 성립'),                    # 생각 열기
    A('모든'), A('절대부등식'),                                         # STEP 1
    A('완전제곱식'), A('등호'),                                          # STEP 2 예
    A('x² − 6x + 9'), A('x − 3'), A('≥'), A('3'),                        # 몬스터 2
    A('등호'), A('산술평균'), A('기하평균'),                             # STEP 3
    A('4'), A('4'), A('2'),                                              # 몬스터 3
    A('10'), A('&gt;'), A('8'), A('4'), A('18'),                         # 몬스터 4
    A('2√(ab)'),                                                         # 근거 줄
    A('절대부등식'), A('x − 2'), A('6'), A('25'),                         # 형성평가 1 · 3 · 4 · 5
    None,                                                                # 맞은 개수 = 비워 둠
]
toks = list(re.finditer(r'BL\["(s|m|l|xl)"\]', src))
assert len(toks) == len(ANS), (len(toks), len(ANS))
out, last = [], 0
for i, m in enumerate(toks):
    out.append(src[last:m.start()]); out.append(m.group(0) if ANS[i] is None else f'ANS[{i}]'); last = m.end()
src = ''.join(out) + src[last:]

# ○ / × 괄호 4곳 · 형성평가 2 괄호
for a in ['○', '○', '×', '×']:
    src = src.replace('(&nbsp;&nbsp;&nbsp;&nbsp;)', f'( {A(a)} )', 1)
assert '(&nbsp;&nbsp;&nbsp;&nbsp;)' not in src
src = src.replace('( &nbsp;&nbsp;&nbsp; )<br>', "( <span class='ans'>②</span> )<br>", 1)  # 큰따옴표 문자열 안이라 홑따옴표

# 메모 칸 3곳 → 교사용 풀이 · 지도 포인트
MEMOS = [
    '<div class="tmemo"><b>풀이</b> (3) x = 0 이면 1 &lt; 0 → 거짓 · (4) a = −3 이면 0 &gt; 1 → 거짓</div>',
    '',   # 1쪽 오른쪽 = 남는 자리 없음 · 정답은 빈칸 안에
    '<div class="tmemo"><b>풀이</b> 몬스터 3 : x × 4/x = 4 (곱이 일정) → x + 4/x ≥ 2√4 = 4 · x² = 4, x &gt; 0 → x = 2</div>',
]
for t in MEMOS:
    i = src.index('{MEMO}'); src = src[:i] + t + src[i + 6:]
assert '{MEMO}' not in src

# ✍ 서술형 = 모범 답안 + 채점 요소
ESSAY = ['(a + 2/b)(b + 8/a) = ab + 8 + 2 + 16/(ab) = ab + 16/(ab) + 10',
         'a &gt; 0, b &gt; 0 이므로 ab &gt; 0, 16/(ab) &gt; 0',
         '산술평균과 기하평균의 관계에 의해 ab + 16/(ab) ≥ 2√(ab × 16/(ab)) = 8',
         '등호는 ab = 16/(ab), 즉 ab = 4 일 때 성립',
         '따라서 최솟값은 8 + 10 = 18']
lines = '<div class="ln"></div>' * 5
assert lines in src
src = src.replace(lines, ''.join(f'<div class="tl">{s}</div>' for s in ESSAY) +
                  f'<div class="mini" style="color:{R};margin-top:1mm"><b>채점 요소</b> ① 전개 (상수 10) ② 두 항이 양수 ③ 산술 · 기하평균 → 8 ④ 등호 ab = 4 ⑤ 최솟값 18</div>', 1)

# 형성평가 빈 줄 → 풀이 한 줄 (같은 높이)
FS = {1: '어떤 실수를 넣어도 성립 = 절대부등식',
      2: '② x² + 2 &gt; 0 만 언제나 성립 (① x = 0 · ③ x = 0 이면 거짓)',
      3: 'x² − 4x + 4 = (x − 2)²',
      4: 'x + 9/x ≥ 2√9 = 6 (등호 x = 3)',
      5: '10 = a + b ≥ 2√(ab) → ab ≤ 25 (a = b = 5)'}
old = "fq = lambda n, s, h: f'<div class=\"q\">{n}. {s}</div>{W(h)}'"
assert old in src
src = src.replace(old, "fq = lambda n, s, h: f'<div class=\"q\">{n}. {s}</div><div class=\"tsol\" style=\"height:{h}mm\">{FS[n]}</div>'")

# 머리 · 제목 · 출력
src = src.replace("hd = header('13차시', rng)", "hd = header('13차시 · 교사용', rng)")
src = re.sub(r"(레이드용 v\d \(🔑 입장 열쇠\))'\n", r"\1 · 교사용 정답 · 학생 배포 ✕'\n", src, count=1)
src = re.sub(r"(<title>학습과정 13차시 레이드용 v\d \(🔑 입장 열쇠\))</title><style>\{CSS\}\{EXTRA\}\{KCSS\}</style>",
             r"\1 · 교사용</title><style>{CSS}{EXTRA}{KCSS}{TCSS}</style>", src, count=1)
assert '교사용 정답 · 학생 배포' in src
assert '{TCSS}' in src

def keybox(n, one=False):
    """학생용 keybox.py 와 같은 꼴 · 답 칸에 정답"""
    from wslib import v
    d = json.load(open(KEYS, encoding='utf8'))
    C = '①②③④⑤'
    rows = ''
    for i, k in enumerate(d['keys']):
        q = k['vers'][0]
        use = k['help'].split('·')[-1].strip().replace('이 열쇠는 ', '').replace('에서 써요.', '')
        ch = ' &nbsp; '.join(f'{C[j]} {v(c)}' for j, c in enumerate(q['ch'])) if q['ch'] else '○ / ×'
        a = ('○' if str(q['a']).upper() in ('O', 'TRUE') else '×') if q['type'] == 'ox' else f'{C[int(q["a"])]} {q["ch"][int(q["a"])]}'
        rows += (f'<div class="kq"><b>🔑{i+1} {k["name"]}</b> <span class="kg"> · {use}</span><br>'
                 f'{v(q["q"])}<div class="kc">{ch} &nbsp;&nbsp; 답 ( {A(a)} )</div></div>')
    return (f'<div class="keys"><div class="kt">🔑 입장 열쇠 <span class="mini">대기실에서 먼저 · 중학교 복습</span></div><div class="kr{" one" if one else ""}">{rows}</div></div>')

exec(compile(src, 'gen_ws13v2(teacher)', 'exec'), {'__name__': '__main__', 'OUT': OUT, 'ANS': ANS, 'FS': FS, 'TCSS': TCSS, 'keybox': keybox, 'sys': sys})
