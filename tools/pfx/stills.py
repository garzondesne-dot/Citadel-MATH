# ⚔ 스킬 탭 정지 그림표 굽기 (#73-5 · 2026-11-11): manifest fx2.fx 의 띠마다 맞는 순간(pk) 한 칸 → 120×70 칸 · 8열 한 장
#   python3 tools/pfx/stills.py → assets/art/pfx/fx-stills-v1.webp + 출력된 fxStills 한 줄을 assets/manifest.js 에 (파일 이름을 바꾸면 캐시 때문에 v 번호도)
import json, math, re, sys
from PIL import Image
s = open('assets/manifest.js').read(); i = s.find('  fx2: '); line = s[i + 7:s.find('\n', i)]; obj = json.loads(line[:line.rfind('}') + 1])
fx = obj['fx']; keys = list(fx); CW, CH, cols = 120, 70, 8; rows = math.ceil(len(keys) / cols)
sheet = Image.new('RGBA', (CW * cols, CH * rows), (0, 0, 0, 0)); idx = {}
for n, kd in enumerate(keys):
    sp = fx[kd]; im = Image.open('assets/art/' + sp['src']).convert('RGBA'); pk = sp.get('pk'); pk = pk if pk is not None else min(sp['n'] - 1, int(sp['n'] * 0.38))
    fr = im.crop((pk * sp['w'], 0, (pk + 1) * sp['w'], sp['h'])); k = min(CW / sp['w'], CH / sp['h']); w, h = max(1, round(sp['w'] * k)), max(1, round(sp['h'] * k))
    sheet.alpha_composite(fr.resize((w, h), Image.NEAREST), ((n % cols) * CW + (CW - w) // 2, (n // cols) * CH + (CH - h) // 2)); idx[kd] = n
out = sys.argv[1] if len(sys.argv) > 1 else 'assets/art/pfx/fx-stills-v1.webp'; sheet.save(out, 'WEBP', lossless=True)
print('fxStills: ' + json.dumps({'src': out.replace('assets/art/', ''), 'w': CW, 'h': CH, 'cols': cols, 'rows': rows, 'idx': idx}, ensure_ascii=False, separators=(',', ':')))
