import json, base64, io, os, sys
REL = len(sys.argv) > 1 and sys.argv[1] == 'rel'  # rel: 그림을 파일 안에 넣지 않고 같은 폴더 fx/ · 저장소 assets/art 를 불러옴 (저장소 tools/pfx/out/<폴더> 기준)
from PIL import Image
S = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'art') + '/'
AREL = '../../../../assets/art/'
meta = {}
for l in open(os.path.join(S, 'meta.jsonl')): meta.update(json.loads(l))
def b64(path): return 'data:image/webp;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
def pil64(im):
    bio = io.BytesIO(); im.save(bio, 'WEBP', lossless=True); return 'data:image/webp;base64,' + base64.b64encode(bio.getvalue()).decode()
FX = {k: dict(v, src=('fx/' + k + '.webp') if REL else b64(os.path.join(S, 'fx', k + '.webp'))) for k, v in meta.items()}
for k, v in FX.items():  # 휘두르는 사람(손) 기준 이펙트: 맞는 곳까지 거리 tx (마법탄 1 은 가장 먼 곳)
    t = (v.pop('act', None) or {}).get('targets') or []
    if t: v['tx'] = max(t) if k == 'orb1' else t[0]
heroes = {'sword': '검사', 'pirate': '해적', 'tamer': '조련사', 'witch': '마녀', 'elf': '엘프 궁수', 'priest': '사제', 'sage': '현자', 'bard': '음유시인', 'alchemist': '연금술사', 'frost': '빙결 마법사', 'math': '수학자'}
files = {'sword': 'hero-sword-v3c.webp'}
H = {}
for k in heroes:
    f = files.get(k, f'hero-{k}-v2c.webp')
    if REL: H[k] = AREL + f; continue
    im = Image.open(A + f).convert('RGBA'); H[k] = pil64(im.crop((0, 0, 320, 64 * 3)))  # idle · walk · attack 줄
monsrc = AREL + 'monsters-castle2-v1.webp' if REL else pil64(Image.open(A + 'monsters-castle2-v1.webp').convert('RGBA').crop((0, 0, 192, 192)))
# 계열 × 단계 (Ⅰ 기본 · Ⅱ 숙련 · Ⅲ 화려 · Ⅳ 전설) — (칸, 이름, 여는 법)
TIERS = [
  ('⚔ 베기', [('cut2', '베기', '처음부터'), ('cut1', '달빛 베기', '💎 20'), ('slash1', '삼연 참격', '인장 8 · 💎 60'), ('slash2', '쌍월 참', '💎 120 · Ⅲ 있으면')]),
  ('🔥 불', [('flame1', '불꽃', '처음부터'), ('flame2', '불꽃 고리', '💎 20'), ('fire1', '화염 폭발', '인장 1 · 💎 40'), ('fire2', '화염 기둥', '💎 120 · Ⅲ 있으면')]),
  ('⚡ 번개', [('spark1', '번개', '처음부터'), ('spark2', '연쇄 번개', '💎 20'), ('lightning1', '천둥 낙뢰', '인장 2 · 💎 40'), ('lightning2', '뇌명', '💎 120 · Ⅲ 있으면')]),
  ('❄ 얼음', [('frost1', '얼음', '처음부터'), ('frost2', '얼음 가시', '💎 20'), ('ice1', '얼음 파쇄', '인장 4 · 💎 40'), ('ice2', '서리 폭발', '💎 120 · Ⅲ 있으면')]),
  ('✨ 별', [('twinkle2', '별', '처음부터'), ('twinkle1', '마나 폭발', '💎 20'), ('stars1', '별빛 폭죽', '인장 6 · 💎 60'), ('stars2', '유성우', '💎 120 · Ⅲ 있으면')]),
  ('🔮 마법', [('orb1', '마법탄', '처음부터'), ('orb2', '치명 섬광', '💎 20'), ('vortex1', '차원 소용돌이', '인장 10 · 💎 80'), ('vortex2', '블랙홀', '💎 120 · Ⅲ 있으면')]),
]
SPECIAL = [('wings1', '🪶 황금 날개', '황금 깃털 5개'), ('wings2', '☀ 심판의 빛', '업적 (예: 성채 보스 모두)')]
EFFECTS = [('cut', '⚔ 베기', '기본'), ('flame', '🔥 불꽃', '기본'), ('spark', '⚡ 번개', '기본'), ('frost', '❄ 얼음', '기본'), ('twinkle', '✨ 별', '기본'), ('orb', '🔮 마법탄', '기본'),
           ('fire', '🔥 화염 폭발', '인장 1'), ('lightning', '⚡ 천둥 낙뢰', '인장 2'), ('ice', '❄ 얼음 파쇄', '인장 4'), ('stars', '✨ 별빛 폭죽', '인장 6'), ('slash', '⚔ 삼연 참격', '인장 8'), ('vortex', '🌀 차원 소용돌이', '인장 10'), ('wings', '🪶 황금 날개', '깃털 5')]
RANGED = [('elf', 'p-elf', '🏹 화살'), ('witch', 'p-witch', '🔮 마법 구슬'), ('sage', 'p-sage', '🔥 화염구'), ('frost', 'p-frost', '❄ 얼음 창'), ('priest', 'p-priest', '☀ 빛의 구슬'), ('bard', 'p-bard', '🎵 음표 (새로 만듦)'), ('alchemist', 'p-alch', '🧪 물약 (새로 만듦)'), ('math', 'p-math', '∑ 수식 룬 (새로 만듦)')]
MELEE = [('sword', '검사'), ('pirate', '해적'), ('tamer', '조련사')]
data = dict(REL=REL, TIERS=TIERS, SPECIAL=SPECIAL, FX=FX, H=H, MON=monsrc, EFFECTS=EFFECTS, RANGED=RANGED, MELEE=MELEE, NAMES=heroes)
html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gallery_tpl.html')).read().replace('/*DATA*/', 'const D = ' + json.dumps(data, ensure_ascii=False) + ';')
open(os.path.join(S, 'gallery.html' if REL else 'pfx-gallery.html'), 'w').write(html); print(len(html) // 1024, 'KB')
