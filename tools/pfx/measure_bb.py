# 🎯 그림 실제 범위 재기 (2026-11-08 · 종합실 전투 이펙트 재정비): 투명 여백을 뺀 「보이는 부분」 상자
#   ① 몬스터 시트마다 줄(몬스터)별 대기 자세 칸의 몸통 상자 → manifest `bodies: { 시트: [[x0, y0, x1, y1] (칸 비율 0~1) …] }`
#   ② 공격 이펙트 띠마다 모든 칸을 겹친 보이는 상자 → manifest `fxbb: { 종류: [x0, y0, x1, y1] (칸 픽셀) }`
#   python3 -I tools/pfx/measure_bb.py   (저장소 맨 위에서) — 그림을 바꾸면 다시 돌린다
import json, re, subprocess
from PIL import Image
M = 'assets/manifest.js'
A = json.loads(subprocess.check_output(['node', '-e', "global.window=global;global.DS={};require('./assets/manifest.js');console.log(JSON.stringify(DS.ASSETS))"]))
base = 'assets/art/'
def bbox(im, thr):
    a = im.getchannel('A').point(lambda v: 255 if v > thr else 0)
    return a.getbbox()
bodies = {}
for k, s in A.items():
    if not (k.startswith('monsters') and isinstance(s, dict) and s.get('src')): continue
    im = Image.open(base + s['src']).convert('RGBA'); W, H = im.size; cw, ch = W / s['cols'], H / s['rows']; col = (s.get('poses') or {}).get('idle', 0)
    rows = []
    for r in range(s['rows']):
        c = im.crop((round(col * cw), round(r * ch), round((col + 1) * cw), round((r + 1) * ch))); b = bbox(c, 60)
        rows.append([round(b[0] / c.width, 3), round(b[1] / c.height, 3), round(b[2] / c.width, 3), round(b[3] / c.height, 3)] if b else [0.2, 0.15, 0.8, 0.95])
    bodies[k] = rows
fxbb = {}
for k, sp in A['fx2']['fx'].items():
    im = Image.open(base + sp['src']).convert('RGBA'); u = None
    for i in range(sp['n']):
        b = bbox(im.crop((i * sp['w'], 0, (i + 1) * sp['w'], sp['h'])), 40)
        if b: u = b if not u else (min(u[0], b[0]), min(u[1], b[1]), max(u[2], b[2]), max(u[3], b[3]))
    fxbb[k] = list(u or (0, 0, sp['w'], sp['h']))
src = open(M, encoding='utf-8').read()
src = re.sub(r"\n  (bodies|fxbb): \{.*\}, // 자동 \(tools/pfx/measure_bb\.py\)", '', src)
line = lambda key, v: f"\n  {key}: {json.dumps(v, ensure_ascii=False, separators=(',', ':'))}, // 자동 (tools/pfx/measure_bb.py)"
i = src.rindex('\n};')
src = src[:i] + line('bodies', bodies) + line('fxbb', fxbb) + src[i:]
open(M, 'w', encoding='utf-8').write(src)
print('bodies', {k: len(v) for k, v in bodies.items()}); print('fxbb', len(fxbb))
