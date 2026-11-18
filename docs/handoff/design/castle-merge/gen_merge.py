#!/usr/bin/env python3
"""🏰 성채 학습지 합본 (1층 + 2층 + 서술형 소레이드 7방) · 학생용 2쪽 + 교사용
쉬운 문제(각 층 01~04) = 풀이 칸 작게 · 서술형 = 소레이드 단계 + 서술형 칸 최대 · 나머지 = 넉넉 → 2쪽을 꽉 채우도록 칸 높이를 자동 조절."""
import json, os, sys, re
D = '/home/user/hv2/docs/handoff/design'
sys.path.insert(0, '/home/user/hv2/tools/worksheet')
import wslib
from wslib import v, C, BL, build, teacher
PACK = '/home/user/beta/tools/pack-upload/castle'
OUT = sys.argv[1]; ARGS = sys.argv[2:]
sys.argv = ['x', PACK]
sys.path.insert(0, D + '/castle-ws'); import gen_castle_ws as W
src = open(D + '/castle-chain/gen_chain_ws.py', encoding='utf8').read()
ns = {'__file__': D + '/castle-chain/gen_chain_ws.py'}
exec(src[:src.index("body = ('<div class=\"how\">")].replace("OUT = sys.argv[1] if len(sys.argv) > 1 else HERE", "OUT=''"), ns)
ROOMS, CH = ns['ROOMS'], ns['D']
EXTRA = W.EXTRA + ns['EXTRA'].replace('body { font-size:9.7pt; line-height:1.45; }', '') + '''
body { font-size:9.3pt; line-height:1.45; }
.rm { margin:0 0 1.6mm 0; padding:1.2mm 2.2mm 1mm; break-inside:avoid; }
.sub { line-height:1.7; }
.pf { line-height:1.6; font-size:9pt; }
.sec { font-weight:700; color:#fff; background:#2a4468; border-radius:1.5mm; padding:0.6mm 2.4mm; margin:0 0 1.4mm 0; font-size:9.5pt; }
.essay .ln { height:6mm; }
.wk.sm { margin-top:0.8mm; }
'''
PH = {(1, 'q07'), (1, 'q11'), (2, 'q07'), (2, 'q10')}
EASY = {'q01', 'q02', 'q03', 'q04'}
CIRC = '①②③④⑤'; S = ns['S']
CHMAP = {(int(p[-1]), r): (p, r, prob, steps, hint, lines, key) for p, r, prob, steps, hint, lines, key in ROOMS}

def chain_block(fl, rid, essay_mm):
    p, r_, prob, steps, hint, lines, key = CHMAP[(fl, rid)]
    r = CH[p][rid]; n = len(r['vers'][0]); no = rid[1:]; boss = r.get('boss')
    tag = (f'<b>{"👑 " if boss else ""}{fl}층 {no}</b><span class="pill">🏰 {fl}층 {no}번 방 · {r["no"]}차시 뒤 열림</span>'
           f'<span class="pill ch">⚔ 소레이드 · {n}단계</span><span class="pill ph">📷 서술형</span>')
    rows = '<br>'.join(f'{"👑" if i == n - 1 else CIRC[i]} {S}{t}' for i, t in enumerate(steps))
    nl = max(2, int(essay_mm // 6))
    return (f'<div class="rm{" boss" if boss else ""}"><div class="tagl">{tag}</div>{prob}<div class="pf">{rows}</div>'
            f'<div class="hint">💡 근거 : {hint}</div><div class="essay"><b>✍ 서술형 답</b> <span class="mini">({r["note"]})</span>' + '<div class="ln"></div>' * nl + '</div></div>')

def floor_blocks(fl, rows, easy_mm, mid_mm, essay_mm):
    pk = json.load(open(f'{PACK}/eval-{fl}.json', encoding='utf8')); rooms = {r['id']: r for r in pk['rooms']}
    out = [f'<div class="sec">🏰 {fl}층 · {"집합" if fl == 1 else "명제"} ({len(rows)}방)</div>']
    for rid, html, wk, a, sol, frags, chk in rows:
        if (fl, rid) in PH: out.append(chain_block(fl, rid, essay_mm)); continue
        r = rooms[rid]; no = rid[1:]; boss = r.get('boss')
        tag = f'<b>{"👑 " if boss else ""}{no}</b><span class="pill">🏰 {fl}층 {no}번 방 · {r["no"]}차시 뒤 열림</span>'
        if boss: tag += f'<span class="pill bs">👑 보스 방 · 열린 방의 {pk["bossPct"]}%를 처치하면 열림</span>'
        h = easy_mm if rid in EASY else mid_mm
        if rid in EASY and wk == 0: h = 0          # ⑴⑵ 칸에 바로 쓰는 문제 = 풀이 칸 없음
        work = f'<div class="wk{" sm" if rid in EASY else ""}" style="height:{h}mm">✏ 풀이</div>' if h else ''
        out.append(f'<div class="rm{" boss" if boss else ""}"><div class="tagl">{tag}</div>{html}{work}</div>')
    return out

def body_of(easy, mid, essay):
    how = ('<div class="how"><b>🏰 성채던전 1 ~ 3층과 같은 문제 · 같은 숫자</b>예요. 먼저 여기에 풀고, 캠프 → 🏰 성채던전의 그 방에서 답을 넣어 보세요. '
           '꼬리표의 차시 수업을 하면 방이 열려요. 한 번 틀리면 방의 숫자가 바뀌어요. '
           '<span class="pill ph">📷 서술형</span> = ⚔ 소레이드 빈칸을 채운 뒤 ✍ 서술형 답을 손으로 써서 찍어 올리면 통과(📜 서술 조각 +1).</div>')
    b = [how] + floor_blocks(1, W.F1, easy, mid, essay) + floor_blocks(2, W.F2, easy, mid, essay)
    b += ['<div class="sec">🏰 3층 · 서술형 (3방)</div>'] + [chain_block(3, r, essay) for r in ('q15', 'q16', 'q17')]
    return ''.join(b)

def try_build(easy, mid, essay, out):
    wslib.STAMP = ''
    return build(out, '🏰 성채던전 학습지', '공통수학2 Ⅱ. 집합과 명제 · 성채 1층 12 · 2층 11 · 3층 서술형 3',
                 '① 집합 · 명제 중단원 문제를 스스로 푼다. ② 서술형은 소레이드 단계로 나누어 풀이를 끝까지 쓴다.', body_of(easy, mid, essay), EXTRA)

if __name__ == '__main__':
    import contextlib, io
    def fits(e, m, s):
        with contextlib.redirect_stdout(io.StringIO()):
            bot = try_build(e, m, s, OUT + '/_t.pdf')
        return max(bot) <= 281, bot
    E = 3; M = 10; S_ = 12
    ok, bot = fits(E, M, S_); print('기본', ok, bot)
    if not ok: sys.exit('기본 칸도 넘침')
    while True:      # 서술형 먼저 최대로 (나머지 10mm 유지)
        ok, b = fits(E, M, S_ + 6)
        if not ok: break
        S_ += 6
    while True:      # 남는 자리 = 나머지 문제 넉넉하게
        ok, b = fits(E, M + 2, S_)
        if not ok: break
        M += 2
    print('결정: 쉬움', E, '나머지', M, '서술형', S_)
    print(try_build(E, M, S_, OUT + '/castle-all-ws.pdf'))
