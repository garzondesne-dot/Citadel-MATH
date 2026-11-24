# 3차시 팩 zip 묶기 · python3 make_zip3.py <팩.json> <칸 그림 폴더(mid3_*.png)> <학생용 학습지.pdf> <출력.zip> [영상.mp4]
import sys, zipfile, os, json
pk, cells, pdf, out, *vid = sys.argv[1:]
d = json.load(open(pk, encoding='utf8'))
CELLS = ['review', 'open', 'c1', 'c2', 'c3']           # 따로 자른 칸 (몬스터 · 형성평가 칸은 올리기 창이 PDF 에서 자름)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('mid1-stat-03.json', json.dumps(d, ensure_ascii=False, indent=1))
    z.write(pdf, 'mid1-03-worksheet.pdf')
    for c in CELLS: z.write(os.path.join(cells, f'mid3_{c}.png'), f'mid1-03_{c}.png')
    for v in vid:
        assert d['video'] and d['video'][0]['file'] == os.path.basename(v), '팩 video.file = 영상 이름'
        z.write(v, os.path.basename(v))
print(out, [i.filename for i in zipfile.ZipFile(out).infolist()])
