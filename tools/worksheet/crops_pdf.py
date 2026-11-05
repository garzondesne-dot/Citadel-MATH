# 칸 위치(crops) 재기 — 완성된 학습지 PDF 에서 바로 (wslib 양식 · 사용자가 보낸 PDF 도 됨) · 2026-11-05
#   python3 tools/worksheet/crops_pdf.py <학습지.pdf> '{"c1":"STEP 1","m1":"문제 1)","boss":"✔"}' [--png 확인폴더]
#   칸 = 시작 글자 줄부터 같은 쪽 · 같은 단의 다음 칸 시작(또는 ✏ 풀이 메모 · 🏰 · 확인 도장 · 쪽 번호) 바로 위까지
#   글자 위치는 pdftotext -bbox-layout (poppler) · 단 = 글자 x 가 쪽 가운데보다 왼쪽이면 왼쪽 단
#   --png 를 주면 칸을 빨간 상자로 그린 쪽 그림을 남긴다 (눈으로 꼭 확인 · 잘린 줄이 있으면 차시 파일에서 손으로 조금 늘림)
import json, re, subprocess, sys, tempfile, os

STOP = re.compile(r'^(✏|🏰|확인 도장|- .*차시 \(\d/\d\) -)')

def lines(pdf):
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, 'bb.html')
        subprocess.run(['pdftotext', '-bbox-layout', pdf, out], check=True)
        h = open(out, encoding='utf-8').read()
    res = []
    for pi, pg in enumerate(h.split('<page ')[1:], 1):
        W = float(re.search(r'width="([\d.]+)"', pg).group(1)); H = float(re.search(r'height="([\d.]+)"', pg).group(1))
        for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', pg, re.S):
            t = ' '.join(re.findall(r'>([^<]*)</word>', m.group(5)))
            x0 = float(m.group(1)) / W
            res.append({'p': pi, 'col': 0 if x0 < 0.5 else 1, 'y': float(m.group(2)) / H, 't': t})
    return res

def measure(pdf, slots):
    L = lines(pdf)
    sq = lambda s: re.sub(r'\s+', '', s)
    starts = {}
    for sid, key in slots.items():
        hit = next((l for l in L if sq(l['t']).startswith(sq(key))), None)
        if not hit: print(f'⚠ {sid}: 「{key}」 를 못 찾음', file=sys.stderr); continue
        starts[sid] = hit
    out = {}
    for sid, s in starts.items():
        same = [l for l in L if l['p'] == s['p'] and l['col'] == s['col'] and l['y'] > s['y'] + 0.005]
        nxt = [o['y'] - 0.002 for k, o in starts.items() if k != sid and o['p'] == s['p'] and o['col'] == s['col'] and o['y'] > s['y'] + 0.005]
        stop = [l['y'] - 0.007 for l in same if STOP.match(l['t'])]
        end = min(nxt + stop + [0.955])
        x, w = (0.045, 0.455) if s['col'] == 0 else (0.507, 0.452)
        y = round(s['y'] - 0.005, 4)
        out[sid] = [{'p': s['p'], 'x': x, 'y': y, 'w': w, 'h': round(end - y, 4)}]
    return out

if __name__ == '__main__':
    pdf, slots = sys.argv[1], json.loads(sys.argv[2])
    crops = measure(pdf, slots)
    s = json.dumps(crops, ensure_ascii=False, separators=(', ', ': '))
    for a in 'pxywh': s = s.replace(f'"{a}"', a)
    print(s)
    if '--png' in sys.argv:
        d = sys.argv[sys.argv.index('--png') + 1]; os.makedirs(d, exist_ok=True)
        subprocess.run(['pdftoppm', '-r', '80', '-png', pdf, os.path.join(d, 'pg')], check=True)
        from PIL import Image, ImageDraw
        pages = sorted(f for f in os.listdir(d) if f.startswith('pg-'))
        for i, f in enumerate(pages, 1):
            im = Image.open(os.path.join(d, f)).convert('RGB'); dr = ImageDraw.Draw(im); W, H = im.size
            for sid, [c] in crops.items():
                if c['p'] != i: continue
                dr.rectangle([c['x'] * W, c['y'] * H, (c['x'] + c['w']) * W, (c['y'] + c['h']) * H], outline=(255, 0, 0), width=2); dr.text((c['x'] * W + 3, c['y'] * H + 2), sid, fill=(255, 0, 0))
            im.save(os.path.join(d, f'box-{i}.png'))
        print(f'확인 그림: {d}/box-*.png', file=sys.stderr)
