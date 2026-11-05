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
for v in FX.values(): v.pop('act', None)
heroes = {'sword': '검사', 'pirate': '해적', 'tamer': '조련사', 'witch': '마녀', 'elf': '엘프 궁수', 'priest': '사제', 'sage': '현자', 'bard': '음유시인', 'alchemist': '연금술사', 'frost': '빙결 마법사', 'math': '수학자'}
files = {'sword': 'hero-sword-v3c.webp'}
H = {}
for k in heroes:
    f = files.get(k, f'hero-{k}-v2c.webp')
    if REL: H[k] = AREL + f; continue
    im = Image.open(A + f).convert('RGBA'); H[k] = pil64(im.crop((0, 0, 320, 64 * 3)))  # idle · walk · attack 줄
monsrc = AREL + 'monsters-castle2-v1.webp' if REL else pil64(Image.open(A + 'monsters-castle2-v1.webp').convert('RGBA').crop((0, 0, 192, 192)))
EFFECTS = [('cut', '⚔ 베기', '기본'), ('flame', '🔥 불꽃', '기본'), ('spark', '⚡ 번개', '기본'), ('frost', '❄ 얼음', '기본'), ('twinkle', '✨ 별', '기본'), ('orb', '🔮 마법탄', '기본'),
           ('fire', '🔥 화염 폭발', '인장 1'), ('lightning', '⚡ 천둥 낙뢰', '인장 2'), ('ice', '❄ 얼음 파쇄', '인장 4'), ('stars', '✨ 별빛 폭죽', '인장 6'), ('slash', '⚔ 삼연 참격', '인장 8'), ('vortex', '🌀 차원 소용돌이', '인장 10'), ('wings', '🪶 황금 날개', '깃털 5')]
RANGED = [('elf', 'p-elf', '🏹 화살'), ('witch', 'p-witch', '🔮 마법 구슬'), ('sage', 'p-sage', '🔥 화염구'), ('frost', 'p-frost', '❄ 얼음 창'), ('priest', 'p-priest', '☀ 빛의 구슬'), ('bard', 'p-bard', '🎵 음표 (새로 만듦)'), ('alchemist', 'p-alch', '🧪 물약 (새로 만듦)'), ('math', 'p-math', '∑ 수식 룬 (새로 만듦)')]
MELEE = [('sword', '검사'), ('pirate', '해적'), ('tamer', '조련사')]
data = dict(REL=REL, FX=FX, H=H, MON=monsrc, EFFECTS=EFFECTS, RANGED=RANGED, MELEE=MELEE, NAMES=heroes)
html = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gallery_tpl.html')).read().replace('/*DATA*/', 'const D = ' + json.dumps(data, ensure_ascii=False) + ';')
open(os.path.join(S, 'gallery.html' if REL else 'pfx-gallery.html'), 'w').write(html); print(len(html) // 1024, 'KB')
