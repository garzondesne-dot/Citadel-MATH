# tools/pfx/final.jsonl → assets/art/pfx/*-v1.webp 이름 바꾸기 + manifest.js 의 fx2 줄 (한 줄 JSON) 출력
#   python3 -I tools/pfx/manifest_fx.py   (저장소 맨 위에서)
import json, os
from PIL import Image
D = 'assets/art/pfx'; meta = {}
for l in open('tools/pfx/final.jsonl'): meta.update(json.loads(l))
fx, proj = {}, {}
for k, v in meta.items():
    src = f'{k}-v1.webp'
    if os.path.exists(f'{D}/{k}.webp'): os.replace(f'{D}/{k}.webp', f'{D}/{src}')
    act = v.get('act') or {}; hits = act.get('hits') or []
    e = {'src': 'pfx/' + src, 'w': v['w'], 'h': v['h'], 'n': v['n'], 'fps': v['fps'], 'px': v['px'], 'py': v['py']}
    im = Image.open(f'{D}/{src}').convert('RGBA')  # 고르기 화면 정지 그림 = 가장 밝게 빛나는 칸 (pk · 밝기 × 불투명도 합)
    def glow(i):
        c = im.crop((i * v['w'], 0, (i + 1) * v['w'], v['h'])).resize((max(1, v['w'] // 2), max(1, v['h'] // 2)))
        return sum((0.3 * r + 0.59 * g + 0.11 * b) * a / 255 / 255 for r, g, b, a in c.get_flattened_data() if a > 40)
    e['pk'] = max(range(v['n']), key=glow)
    t = act.get('targets') or []
    # 손에서 쏘아 맞는 곳까지 가는 것만 tx (2026-11-06: 불꽃 고리 · 뇌명 · 서리 폭발은 시전자 중심 범위 → tx 없이 몬스터 가운데)
    if t and k in ('fx-moon', 'fx-slash', 'fx-twin', 'fx-chain', 'fx-orb'): e['tx'] = max(t) if k == 'fx-orb' else t[0]
    if hits: h = hits[0]; e['hit'] = [round(h.get('t', 0), 3), round(h.get('freeze', 0), 3), round(h.get('shake', 0), 3), h.get('amp', 0)]
    if k.startswith('fx-'): fx[k[3:]] = e
    else: e['loop'] = True; proj[k[2:]] = e
for k in ('p-witch', 'p-priest'):  # 떠 있는 구슬: 가운데 기준
    p = proj[k[2:]]; p['px'] = p['w'] // 2; p['py'] = p['h'] // 2
print('  fx2: ' + json.dumps({'fx': fx, 'proj': proj}, ensure_ascii=False, separators=(',', ':')) + ',')
