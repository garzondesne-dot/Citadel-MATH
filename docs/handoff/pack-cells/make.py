# 13 ~ 17차시 팩 = 칸 그림 따로 (2026-11-24 · 📚 차시팩 #1 · 선생님 「열쇠 · 전시 학습 · 도입 · 개념 따로 분리 · 13차시부터」 · PACK-GUIDE 검사 16)
#   도입 1 단계 → 3 단계: 🔑 key(입장 열쇠) → 🔁 intro(전시 확인 · id 그대로) → 🔍 open(생각 열기) · 칸 그림 = crop_cells.py 로 자른 png 를 zip 에 넣음
#   개념 c1 … · recap 도 따로 자른 그림 · 몬스터 · 형성평가 칸은 그대로(올리기 창 자동 자르기) · 문제 · 정답 · 형성평가(세트 1) 그대로
#   쓰는 법: python3 make.py <바탕 팩.json> <칸 그림 폴더> <학습지.pdf> <출력.zip> [영상 mp4 …]
import json, sys, os, copy, zipfile, re
src, cells, pdf, out, *media = sys.argv[1:]
d = json.load(open(src, encoding='utf8')); old = copy.deepcopy(d)
pre = 'ex' + str(d['no'])
pngs = {f[len(pre) + 1:-4]: os.path.join(cells, f) for f in os.listdir(cells) if f.startswith(pre + '_') and f.endswith('.png')}
st = d['steps']; i = next(k for k, s in enumerate(st) if s['kind'] == 'intro')
it = st[i]; say = it.get('say', '')
rv = '\n'.join(l for l in say.split('\n') if not l.startswith('🔍')).strip()
op = '\n'.join(l for l in say.split('\n') if l.startswith('🔍')).strip()
assert rv and op, say
key = {'id': 'key', 'kind': 'intro', 'img': 'key', 'title': '도입 ① 🔑 입장 열쇠', 'say': '🔑 대기실에서 푼 입장 열쇠(중학교 복습) · 답을 같이 확인해요'}
it2 = dict(it); it2.update({'img': 'review', 'title': '도입 ② 🔁 전시 확인', 'say': rv})
opn = {'id': 'open', 'kind': 'intro', 'img': 'open', 'title': '도입 ③ 🔍 생각 열기', 'say': op}
d['steps'] = st[:i] + [key, it2, opn] + st[i + 1:]
cellsets = [c for c in ['key', 'review', 'open'] + [s['id'] for s in d['steps'] if s['kind'] == 'concept']]
for c in cellsets: assert c in pngs, (c, sorted(pngs))
d['imgCells'] = list(dict.fromkeys(['key', 'review', 'open'] + [c for c in d['imgCells'] if c != 'review'] + [c for c in pngs if c in cellsets]))
# 문제 · 정답 · 형성평가는 그대로
for k in ('monsters', 'boss', 'keys'): assert d.get(k) == old.get(k), k
ids = [s['id'] for s in d['steps']]; assert len(ids) == len(set(ids)), ids
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr(f"{pre}.json", json.dumps(d, ensure_ascii=False))
    z.write(pdf, f'{pre}-worksheet.pdf')
    for c in cellsets: z.write(pngs[c], f'{pre}_{c}.png')
    for m in media: z.write(m, os.path.basename(m))
print(pre, '단계', ids, '· 그림 칸', cellsets)
