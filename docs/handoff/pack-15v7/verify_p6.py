# 15차시 팩 v8 문제 6 (몬스터 2) 독립 검산 (2026-11-25 · 📚 차시팩 #1) · 문항 글의 [[graph:…]] 를 읽어 x ∈ [−50, 50] 에서 함숫값을 찍어 일대일 · 치역 판정
import json, re, sys
d = json.load(open(sys.argv[1], encoding='utf8')); m = d['monsters']['m2']
def fn(src):
    pieces = []
    for part in src.split(';'):
        part = part.strip(); mm = re.fullmatch(r'y=(\S+)(?: ([\[(])(-?\d+),(-?\d+)([\])]))?', part); assert mm, part
        e = mm.group(1).replace('^', '**'); e = re.sub(r'\|x\|', 'abs(x)', e); e = re.sub(r'(\d)x', r'\1*x', e)
        dom = None if not mm.group(2) else (int(mm.group(3)), int(mm.group(4)), mm.group(2) == '[')
        pieces.append((e, dom))
    def f(x):
        for e, dom in pieces:
            if dom is None or (dom[0] <= x < 99 if dom[2] else dom[0] > -99 and x < dom[1]) and ((x >= dom[0]) if dom[2] else (x < dom[1])):
                return eval(e, {'abs': abs, 'x': x})
        raise ValueError(x)
    return f
rows = []
for v, items in enumerate([m['first']] + m['retry']['pool']):
    assert [i['type'] for i in items] == ['multi', 'multi']
    head = items[0]['question'].split('\n')[0]; assert items[1]['question'].split('\n')[0] == head   # 두 단계 모두 네 그래프
    gs = re.findall(r'\[\[graph:(.+?) @-3,3,-5,7\]\] \((\d)\) ', head); assert len(gs) == 4, gs
    inj, onto = [], []
    for src, no in gs:
        f = fn(src); xs = [i / 20 for i in range(-1000, 1001)]; ys = [round(f(x), 9) for x in xs]
        inj.append(len(set(ys)) == len(ys))
        onto.append(inj[-1] and min(ys) < -40 and max(ys) > 40)   # 연속 · 일대일 · 양쪽으로 끝없이 → 치역 = 실수 전체
    a1 = [i for i, t in enumerate(inj) if t]; a2 = [i for i, t in enumerate(onto) if t]
    assert items[0]['answer'] == a1 and items[1]['answer'] == a2, (v, a1, a2)
    assert all(o.split(') ', 1)[1] in head for o in items[0]['options'])                  # 보기 식 = 그래프 밑 식
    rows.append(f'| 판 {v} | {" · ".join(s for s, _ in gs)} | {a1} | {a2} | ✔ |')
print('| 판 | 그래프 글 | 일대일 다시 구함 | 대응 다시 구함 | 혼자 풀림 |\n|---|---|---|---|---|'); print('\n'.join(rows)); print('문제 6 판', len(rows), '독립 검산 ✔')
