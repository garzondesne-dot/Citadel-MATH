# 📦 팩 손질 기록 (2026-11-24 · 📚 차시팩 #1 · 메타인지 9 「생성기를 드라이브 팩과 같게」)
#   생성기(buildNN.py)는 뼈대(학습지 판 · 정답 독립 검산)를 만들고, 그 뒤 드라이브 팩에서 사람이 손질한 것
#   (판 1 ~ 6 늘림 · 조사 · 「1x → x」 · 보기 글 · 그래프 창 · 형성평가 세트 1 = 학습지)은 overlays/exNN.json 에 경로 · 값으로 남김
#   → 생성기 끝에서 apply() → 나온 팩 = 드라이브 팩(글자까지 같음)
#   새로 손질하면: python3 tools/pack/overlay.py make <생성기 출력.json> <드라이브 팩.json> tools/pack/overlays/exNN.json
#   (경로 하나 = 값이 다른 가장 작은 칸 · 길이가 다른 목록은 통째)
import json, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))


def diff(a, b, path, out):
    if type(a) is not type(b) or isinstance(a, (str, int, float, bool)) or a is None:
        if a != b: out.append([path, b])
        return
    if isinstance(a, dict):
        for k in a:
            if k not in b: out.append([path + [k], '__DEL__'])
        for k in b:
            if k not in a: out.append([path + [k], b[k]])
            else: diff(a[k], b[k], path + [k], out)
    else:
        if len(a) != len(b): out.append([path, b]); return
        for i, (x, y) in enumerate(zip(a, b)): diff(x, y, path + [i], out)


def apply(pack, ov):
    for path, val in ov:
        if not path: return val
        cur = pack
        for k in path[:-1]: cur = cur[k]
        if val == '__DEL__': del cur[path[-1]]
        else: cur[path[-1]] = val
    return pack


def apply_file(pack, lesson_id):
    f = os.path.join(HERE, 'overlays', f'{lesson_id}.json')
    if not os.path.exists(f): return pack
    return apply(pack, json.load(open(f, encoding='utf8'))['edits'])


if __name__ == '__main__' and sys.argv[1] == 'make':
    g, d, out = (json.load(open(sys.argv[2], encoding='utf8')), json.load(open(sys.argv[3], encoding='utf8')), sys.argv[4])
    edits = []; diff(g, d, [], edits)
    assert apply(json.loads(json.dumps(g)), edits) == d
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump({'from': os.path.basename(sys.argv[3]), 'edits': edits}, open(out, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(out, '손질', len(edits), '곳')
