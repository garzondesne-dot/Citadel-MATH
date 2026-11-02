# v2 용사 기준점 재기 (2026-11-03): 정리된 용사 시트 → 배치표에 넣을 값 자동 계산
#   cx      = 대기 프레임의 머리 가운데 (칸 가로 비율) → 게임이 머리를 상자 가운데에 맞춘다 (무기 길이와 상관없이 정렬)
#   anchors = 프레임마다 머리 기준점 [x, y] (칸 픽셀: 머리 가운데 · 머리 꼭대기) → 장신구(모자 · 머리띠)를 프레임마다 붙이는 자리
#   머리 = 키의 위 40% 안에서 가장 넓은 덩어리 쪽 (머리카락 · 모자 포함). 뒷모습 · 누운 자세도 같은 규칙으로 잰다
# 사용: python3 tools/sprite/hero_meta.py <시트.png> [칸 가로=80] [칸 세로=64] [줄별 프레임 수=4,4,4,1,2,2,2,4,2,2,2,2]
#   출력 한 줄을 assets/manifest.js 의 heroesV2.list 항목에 붙인다: { src, name, rows, cx, anchors }
import sys, json
import numpy as np
from PIL import Image

src = sys.argv[1]
CW, CH = (int(sys.argv[i]) if len(sys.argv) > i else d for i, d in ((2, 80), (3, 64)))
counts = [int(x) for x in (sys.argv[4] if len(sys.argv) > 4 else '4,4,4,1,2,2,2,4,2,2,2,2').split(',')]
a = np.asarray(Image.open(src).convert('RGBA'))[..., 3] > 0
rows = min(len(counts), a.shape[0] // CH)

def head(cell):
    ys = np.where(cell.any(1))[0]
    if not len(ys): return None
    top, bot = ys.min(), ys.max(); band = cell[top: top + max(3, int((bot - top + 1) * 0.40))]
    cols = np.where(band.any(0))[0]
    # 무기 · 이펙트처럼 가늘게 튀어나온 열은 빼고(열마다 칠해진 칸이 3 미만) 머리 덩어리 가운데를 잡는다
    dens = band.sum(0); solid = np.where(dens >= 3)[0]
    xs = solid if len(solid) else cols
    return [int(round((xs.min() + xs.max()) / 2)), int(top)]

anchors = []
for r in range(rows):
    row = []
    for c in range(counts[r]):
        h = head(a[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW]); row.append(h)
    anchors.append(row)
cx = round(anchors[0][0][0] / CW, 3) if anchors and anchors[0][0] else 0.4
print(json.dumps({ 'rows': rows, 'cx': cx, 'anchors': anchors }, separators=(',', ':')))
