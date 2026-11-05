# pixelfx sheet → 가로 띠(webp) + 메타 : python3 -I bake.py <records 폴더> <id> <출력 이름> <최대 초> <fps>
import sys, json, os
from PIL import Image
rec, fid, name, tmax, fps = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), int(sys.argv[5])
base = os.path.join(rec, fid, fid.split('/')[1])
im = Image.open(base + '.png').convert('RGBA'); j = json.load(open(base + '.json'))
m = j['meta']['pixelfx']; fw, fh = m['frameSize']; cols = m['columns']; src_fps = m['fps']; n = m['frames']
step = max(1, round(src_fps / fps)); idx = [i for i in range(0, n, step) if i / src_fps <= tmax]
frames = [im.crop(((i % cols) * fw, (i // cols) * fh, (i % cols + 1) * fw, (i // cols + 1) * fh)) for i in idx]
bb = None
for f in frames:
    b = f.getbbox()
    if b: bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
bb = bb or (0, 0, fw, fh)
# 비어 있는 끝 프레임 빼기
while len(frames) > 1 and not frames[-1].getbbox(): frames.pop()
w, h = bb[2] - bb[0], bb[3] - bb[1]
strip = Image.new('RGBA', (w * len(frames), h), (0, 0, 0, 0))
for k, f in enumerate(frames): strip.paste(f.crop(bb), (k * w, 0))
out = sys.argv[6] if len(sys.argv) > 6 else '.'
strip.save(os.path.join(out, name + '.webp'), lossless=True, quality=100, method=6)
px, py = m['pivot']
meta = dict(id=fid, w=w, h=h, n=len(frames), fps=round(src_fps / step), px=px - bb[0], py=py - bb[1], loop=m['loop'], act=m.get('act'))
print(json.dumps({name: meta}))
