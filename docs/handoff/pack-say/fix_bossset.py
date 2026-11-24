# 👑 형성평가 첫 시도(boss.sets[1]) = 학습지 판으로 맞춤 (2026-11-24 · 📚 차시팩 #1 · 14차시 수업 중 「형성평가 학습지랑 레이드 불일치」)
#   엔진 bossItem: 시도 0 = sets['1'][i] · 시도 1 ~ = pool[i] 차례 → 학습지 판은 sets[1] 에, pool 엔 숫자 바꾼 판만 (11 ~ 13차시 꼴)
#   14 ~ 17차시 팩은 sets[1] = 바꾼 판 · pool[i][0] = 학습지 판으로 뒤바뀌어 있었음 → sets[1] = pool[i][0] · pool[i] = pool[i][1:]
#   쓰는 법: python3 fix_bossset.py <팩.json> <출력.json> <학습지 형성평가 글 조각 1> … (문항마다 · 바꾼 뒤 세트 1 에 들어 있어야 함)
import json, sys, copy
src, out, *must = sys.argv[1:]
d = json.load(open(src, encoding='utf8')); old = copy.deepcopy(d); B = d['boss']
s1 = B['sets'][1] if isinstance(B['sets'], list) else B['sets']['1']; P = B['pool']
assert len(s1) == len(P) == B['items']
for i in range(len(P)): assert s1[i] in P[i] and P[i][0] != s1[i], i      # 옛 세트 1 = pool 안 · pool[0] 은 다른 판
new = [copy.deepcopy(P[i][0]) for i in range(len(P))]
for i, m in enumerate(must): assert m in json.dumps(new[i], ensure_ascii=False), (i, m)   # 학습지 글 조각 확인
if isinstance(B['sets'], list): B['sets'][1] = new
else: B['sets']['1'] = new
B['pool'] = [P[i][1:] for i in range(len(P))]
for i in range(len(P)): assert s1[i] in B['pool'][i] and new[i] not in B['pool'][i]
o = copy.deepcopy(old); o['boss']['sets'] = B['sets']; o['boss']['pool'] = B['pool']; assert o == d   # 형성평가 말고 그대로
json.dump(d, open(out, 'w', encoding='utf8'), ensure_ascii=False)
print('세트 1 =', [q['question'].split('\n')[0][:28] for q in new], '· pool', [len(p) for p in B['pool']])
