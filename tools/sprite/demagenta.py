# 마젠타 배경 지우기 + 테두리 형광 분홍 정리 (2026-11-04 · 아이콘 · UI 키트 · 용사 시트 공통)
#   그림 AI 가 준 #FF00FF 배경은 가장자리에 분홍이 섞인 픽셀(안티에일리어싱)을 남긴다 → 게임에서 형광 테두리로 보임
#   ① 진한 마젠타 = 투명 ② 투명 옆 「분홍기 도는」 픽셀: 많이 분홍이면 투명, 조금 섞였으면 분홍을 빼고(despill) 어두운 외곽선 색 쪽으로
# 사용: python3 tools/sprite/demagenta.py <입력.png> <출력.png>   (모듈로 쓰면 clean(rgba 배열) · fix_fringe(rgba 배열))
import sys
import numpy as np
from PIL import Image

OUTLINE = np.array([26, 18, 40])  # 외곽선 색 (진한 남보라 · STYLE BIBLE)


def pinkness(a):
    """0~255: 픽셀이 마젠타 쪽으로 얼마나 치우쳤나 (빨강 · 파랑이 초록보다 높고 서로 비슷)"""
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return np.clip(np.minimum(r, b) - g - np.abs(r - b) // 2, 0, 255)


def near_clear(alpha, k=1):
    """투명 칸 옆(상하좌우 k칸 안)에 있는 불투명 픽셀"""
    t = alpha == 0
    m = np.zeros_like(t)
    for dy in range(-k, k + 1):
        for dx in range(-k, k + 1):
            if dx or dy:
                m |= np.roll(np.roll(t, dy, 0), dx, 1)
    return m & ~t


def clean(rgb):
    """RGB(마젠타 배경) → RGBA"""
    a = np.asarray(rgb.convert('RGB')).astype(int)
    p = pinkness(a)
    alpha = np.where((p > 120) & (a[..., 0] > 150) & (a[..., 2] > 150), 0, 255).astype(np.uint8)
    out = np.dstack([a.astype(np.uint8), alpha])
    return fix_fringe(out)


def fix_fringe(rgba, rounds=2):
    """이미 투명 배경인 그림의 형광 분홍 테두리 정리 (용사 시트 점검용) → 고친 픽셀 수도 돌려줌"""
    out = rgba.copy()
    fixed = 0
    for _ in range(rounds):
        a = out[..., :3].astype(int)
        p = pinkness(a)
        edge = near_clear(out[..., 3], 1)
        g = a[..., 1]
        strong = edge & (p > 70) & (g < 60)       # 거의 배경색 → 투명 (초록이 많은 진짜 분홍 · 보라 구슬은 그대로)
        weak = edge & (p > 40) & (g < 45) & ~strong            # 분홍이 섞임 (40 미만 = 진짜 보라 · 연보라 머리는 그대로) → 분홍 빼고 외곽선 색으로 기울임
        out[strong, 3] = 0
        if weak.any():
            px = a[weak].astype(float)
            gg = px[:, 1:2]
            px[:, 0] = np.minimum(px[:, 0], gg[:, 0] + 25); px[:, 2] = np.minimum(px[:, 2], gg[:, 0] + 35)
            px = px * 0.45 + OUTLINE * 0.55
            out[weak, :3] = np.clip(px, 0, 255).astype(np.uint8)
        fixed += int(strong.sum() + weak.sum())
    return out, fixed


if __name__ == '__main__':
    img = Image.open(sys.argv[1])
    if img.mode == 'RGBA' and (np.asarray(img)[..., 3] == 0).any():
        arr, n = fix_fringe(np.asarray(img).copy())
    else:
        arr, n = clean(img)
    Image.fromarray(arr, 'RGBA').save(sys.argv[2])
    print(f'{sys.argv[2]}: 테두리 고친 픽셀 {n}')
