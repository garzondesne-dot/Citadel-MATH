# 🎵 #91 배경음 다듬기 (2026-11-11): 원본 mp3 → 모노 · 음량 맞춤(평균 약 −20dB · 리미터) · 반복 이음매(끝 2초를 처음 2초에 겹쳐 녹임 → 반복할 때 끊김 없음 · win 은 반복 안 함) · 56k mp3
#   python3 -I tools/bgm_prep.py <원본 폴더> <출력 폴더>  → <자리>-v1.mp3
import sys, os, subprocess, re
import numpy as np
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True); SR, X = 44100, 2.0
def vd(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.search(r'mean_volume: ([-0-9.]+)', r).group(1))
for f in sorted(os.listdir(src)):
    if not f.endswith('.mp3'): continue
    k = f[:-4]; p = os.path.join(src, f); g = -20 - vd(p)
    a = np.frombuffer(subprocess.check_output(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']), dtype=np.float32).copy()
    n = int(X * SR)
    if k != 'win' and len(a) > 4 * n:
        t = np.linspace(0, 1, n, dtype=np.float32); fi, fo = np.sqrt(t), np.sqrt(1 - t)  # 같은 세기 겹치기
        a = np.concatenate([a[-n:] * fo + a[:n] * fi, a[n:-n]])  # 처음 = 끝 2초 → 처음 2초 로 녹아듦 · 맨 끝(원래 D−2초)이 다시 처음(끝 2초)으로 이어짐
    dst = os.path.join(out, f'{k}-v1.mp3')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', f'volume={g:.1f}dB,alimiter=limit=0.89:level=false', '-b:a', '56k', dst], input=a.tobytes(), check=True)
    print(f'{k:7s} {len(a) / SR:6.1f}s · {vd(dst):5.1f}dB · {os.path.getsize(dst) // 1024}KB')
