#!/usr/bin/env python3
"""🕶 영상 익명 사본 (2026-11-09 #36 · 미래교육상 제출용): 아래 가운데 「K . C . W」 워터마크 자리를 가린 사본을 만든다.

  python3 tools/motion/anon_wm.py <입력.mp4> [출력.mp4] [--color | --blur] [--box x,y,w,h]

- 기본 = 옆 배경 복사: 상자 바로 왼쪽의 같은 크기 배경 조각을 덮어씀 (색 · 그러데이션이 그대로라 티가 안 남 · 그 자리에 다른 그림이 지나가지 않을 때).
- --color = 배경색 상자: 상자 좌우 배경 띠의 평균 색으로 칠함 (YUV 변환 때 1~2 단계 어긋날 수 있음).
- --blur = 상자 안을 강하게 흐림 (배경이 움직이거나 색이 고르지 않을 때).
- 상자 기본값 = 1280×720 기준 x 560 · y 678 · 160 × 36 (math-concept-motion 워터마크 자리) · 다른 크기면 비율로 맞춤.
- 소리는 그대로 복사 · 화질 = 원본 영상 비트레이트에 맞춘 2회 인코딩(용량 · 화질 원본 수준 · 비트레이트를 모르면 CRF 28) · 원본은 건드리지 않음 · 출력 기본 이름 = 「입력_anon.mp4」.
- 워터마크가 없는 옛 영상(흰 배경 개념 영상)은 가릴 필요 없음 — 넣기 전에 프레임을 눈으로 확인.
"""
import json, os, subprocess, sys, tempfile

def probe(src):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,bit_rate', '-of', 'json', src])
    s = json.loads(out)['streams'][0]
    return s['width'], s['height'], int(s.get('bit_rate') or 0)

def sample(src, box, W, H):
    """상자 좌우 띠(각 24px)의 평균 색 · 영상 1초 · 15초 두 장면 평균 (압축 · 그림자 차이를 줄임)"""
    x, y, w, h = box
    from PIL import Image
    px = []
    with tempfile.TemporaryDirectory() as d:
        for i, t in enumerate(('1', '15')):
            png = os.path.join(d, f'f{i}.png')
            subprocess.call(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', t, '-i', src, '-frames:v', '1', png])
            if not os.path.exists(png): continue
            im = Image.open(png).convert('RGB')
            for yy in range(y + 2, y + h - 2, 3):
                for xx in list(range(max(0, x - 28), max(0, x - 4))) + list(range(min(W - 1, x + w + 4), min(W, x + w + 28))):
                    px.append(im.getpixel((xx, yy)))
    n = max(1, len(px))
    return tuple(round(sum(p[k] for p in px) / n) for k in range(3))

def main(a):
    if not a or a[0] in ('-h', '--help'):
        print(__doc__); return 0
    blur = '--blur' in a
    box = None
    if '--box' in a:
        i = a.index('--box'); box = [int(v) for v in a[i + 1].split(',')]; a = a[:i] + a[i + 2:]
    files = [x for x in a if not x.startswith('--')]
    src = files[0]; dst = files[1] if len(files) > 1 else os.path.splitext(src)[0] + '_anon.mp4'
    W, H, BR = probe(src)
    if not box:
        k = W / 1280; box = [round(560 * k), round(678 * H / 720), round(160 * k), round(36 * H / 720)]
    x, y, w, h = box
    mode = 'blur' if blur else 'color' if '--color' in a else 'patch'
    if mode == 'patch':  # 기본: 바로 옆(왼쪽 · 모자라면 오른쪽) 같은 크기 배경 조각을 복사해 덮음 → 색 · 그러데이션이 그대로
        sx = x - w if x - w >= 0 else x + w
        vf = f"[0:v]split[a][b];[b]crop={w}:{h}:{sx}:{y}[p];[a][p]overlay={x}:{y}"
    elif blur:
        vf = f"[0:v]split[a][b];[b]crop={w}:{h}:{x}:{y},boxblur=luma_radius={max(1, min(16, h // 2 - 1))}:luma_power=4:chroma_radius={max(1, min(8, h // 4 - 1))}:chroma_power=4[bl];[a][bl]overlay={x}:{y}"
    else:
        r, g, b = sample(src, box, W, H)
        vf = f"drawbox=x={x}:y={y}:w={w}:h={h}:color=0x{r:02x}{g:02x}{b:02x}@1:t=fill"
    fl = ['-vf' if mode == 'color' else '-filter_complex', vf]
    if BR:  # 원본 비트레이트에 맞춘 2회 인코딩 (1회 평균은 고요한 장면에서 용량이 크게 모자람)
        with tempfile.TemporaryDirectory() as d:
            log = os.path.join(d, 'x264')
            enc = ['-c:v', 'libx264', '-b:v', str(BR), '-preset', 'slow', '-pix_fmt', 'yuv420p', '-passlogfile', log]
            subprocess.check_call(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, *fl, *enc, '-pass', '1', '-an', '-f', 'mp4', os.devnull])
            subprocess.check_call(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, *fl, *enc, '-pass', '2', '-c:a', 'copy', '-movflags', '+faststart', dst])
    else:
        subprocess.check_call(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, *fl, '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', dst])
    print(f'✔ {dst} · 상자 {x},{y} {w}×{h} · { {'patch': '옆 배경 복사', 'color': '배경색', 'blur': '흐림'}[mode] } · {os.path.getsize(dst) // 1024}KB')
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
