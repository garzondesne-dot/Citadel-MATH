import json, collections, numpy as np
R = json.load(open('out/cells.json'))
G = collections.defaultdict(list)
for d in R: G[(d['hero'], d['awk'], d['kind'])].append(d)
STAND = {0, 1, 4, 6, 7, 9, 10}
issues = []
def add(d, kind, msg, val=0): issues.append(dict(hero=d['hero'], awk=d['awk'], file=d['file'], skind=d['kind'], slot=d['slot'], row=d['row'], col=d['col'], act=d['act'], type=kind, msg=msg, val=val))
for key, cells in G.items():
    hero, awk, sk = key
    if sk == 'sheet':
        base = [c for c in cells if c['row'] == 0]
        if not base: continue
        h0 = np.median([c['h'] for c in base]); b0 = np.median([c['bot'] for c in base]); x0 = np.median([c['cx'] for c in base])
        for c in cells:
            r = c['row']
            if c['clipbot']: add(c, '발끝 잘림', '칸 아래 가장자리에 픽셀 닿음', c['allbot'])
            if c['cliptop']: add(c, '머리 잘림', '칸 위 가장자리에 픽셀 닿음', c['alltop'])
            if c['cliplr']: add(c, '좌우 잘림', '칸 옆 가장자리에 픽셀 닿음', 0)
            db = c['bot'] - b0
            lim = 5 if r in (5, 8) else 3
            if abs(db) >= lim and r not in (7,): add(c, '발 줄', f'서기 발 줄 {b0:.0f} 와 {db:+.0f}px', db)
            if r in (0, 1, 6, 9, 10) and (c['h'] / h0 < 0.85 or c['h'] / h0 > 1.15): add(c, '키', f'서기 키 {h0:.0f} 대비 {c["h"]/h0*100:.0f}%', c['h'] / h0)
            if r == 0 and abs(c['cx'] - x0) > 10: add(c, '가운데', f'가운데 {c["cx"]-x0:+.0f}px', c['cx'] - x0)
        # 무기 연속성: 줄마다
        byrow = collections.defaultdict(list)
        for c in cells: byrow[c['row']].append(c)
        for r, L in byrow.items():
            if len(L) < 2 or r in (5, 8, 11): continue
            n = [c['nweap'] for c in L]; wa = [c['weaparea'] for c in L]; gp = [c['weapgap'] for c in L]
            if r in (0, 1, 2, 4, 6, 9, 10, 7):
                if min(n) != max(n) and (max(wa) > 60): add(L[int(np.argmin(wa))], '무기 깜빡임', f'떨어진 덩어리 수 {n} · 면적 {wa}', max(wa) - min(wa))
                if max(gp) >= 4 and min(gp) < 2 and r in (0, 1, 9, 10, 6, 4): add(L[int(np.argmax(gp))], '무기 뜸', f'손과의 거리 {["%.0f"%g for g in gp]}', max(gp))
    else:
        h = [c['h'] for c in cells]; b = [c['bot'] for c in cells]; n = [c['nweap'] for c in cells]; wa = [c['weaparea'] for c in cells]; gp = [c['weapgap'] for c in cells]
        hm = np.median(h); bm = np.median(b)
        for c in cells:
            if abs(c['bot'] - bm) >= 3: add(c, '발 줄(숨쉬기)', f'발 줄 {c["bot"]-bm:+.0f}px', c['bot'] - bm)
            if c['h'] / hm < 0.9 or c['h'] / hm > 1.1: add(c, '키(숨쉬기)', f'키 {c["h"]/hm*100:.0f}%', c['h'] / hm)
            if c['clipbot'] or c['cliptop'] or c['cliplr']: add(c, '잘림(숨쉬기)', '칸 가장자리 닿음')
        if min(n) != max(n) and max(wa) > 60: add(cells[int(np.argmin(wa))], '무기 깜빡임(숨쉬기)', f'덩어리 수 {n} 면적 {wa}', max(wa) - min(wa))
        if max(gp) >= 4 and min(gp) < 2: add(cells[int(np.argmax(gp))], '무기 뜸(숨쉬기)', f'거리 {["%.0f"%g for g in gp]}', max(gp))
json.dump(issues, open('out/issues.json', 'w'), ensure_ascii=False)
c = collections.Counter(i['type'] for i in issues); print(c)
by = collections.Counter((i['hero'], i['awk'], i['skind']) for i in issues)
for k, v in by.most_common(25): print(k, v)
# 영웅 간 키 비교
hs = collections.defaultdict(list)
for d in R:
    if d['kind'] == 'sheet' and d['row'] == 0 and d['awk'] == 'base': hs[d['hero']].append(d['h'])
m = {k: np.median(v) for k, v in hs.items()}; med = np.median(list(m.values()))
print('median hero idle height', med); print(sorted([(round(v / med, 2), k) for k, v in m.items()])[:8], sorted([(round(v / med, 2), k) for k, v in m.items()])[-4:])
