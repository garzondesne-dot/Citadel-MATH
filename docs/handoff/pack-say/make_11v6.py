# 11차시 차시팩 v6_서술 (2026-11-23 · 📚 차시팩 #1 · 선생님 「11차시 서술형 풀이 과정 안 나옴」)
#   원인: 드라이브 v3(팩 꼴 · say 없음) → v4 열쇠 → v5 혼자풀리게 로 이어져 서버에서 더한 say(11/19)가 빠짐
#   고침: v5 바탕 · m3 · m4 소레이드 문항(first · chain · retry)마다 say · 근거 줄(why) 넣음 · 다른 칸 그대로
#   say 출처 = 베타 저장소 tools/pack-upload/official/set-11.json (11/22 · m3 70/70 · m4 42/42) — 문항 글 끝줄 + 정답으로 짝지음
#   쓰는 법: python3 make_11v6.py <v5.json> <say 출처.json> <출력.json>
import json, sys, copy, re
v5, src, out = sys.argv[1:4]
V = json.load(open(v5, encoding='utf8')); O = json.load(open(src, encoding='utf8')); old = copy.deepcopy(V)
tail = lambda q: q['question'].split('\n')[-1].strip()
ans = lambda q: json.dumps(q.get('answerIndex', q.get('answer')), ensure_ascii=False) + '|' + json.dumps(q.get('choices') or q.get('options'), ensure_ascii=False)
def items(M):
    r = list(M.get('first') or [])
    for k in ('chain', 'retry'):
        if isinstance(M.get(k), dict): r += [q for v in M[k]['pool'] for q in v]
    return r
log = {}
# 판 = 첫 문항(끝줄 + 정답 · 보기)으로 짝짓고 · 단계는 같은 자리 (5단계 끝줄은 11/22 혼자 풀리게로 글이 바뀌어 글로는 못 짝지음)
def vers(M):
    r = [M['first']] if M.get('first') else []
    for k in ('chain', 'retry'):
        if isinstance(M.get(k), dict): r += M[k]['pool']
    return r
for m in ('m3', 'm4'):
    bank = {}
    for v in vers(O['monsters'][m]):
        if all(q.get('say') for q in v): bank.setdefault((tail(v[0]), ans(v[0])), []).append(v)
    n = 0
    for v in vers(V['monsters'][m]):
        c = bank.get((tail(v[0]), ans(v[0])))
        assert c, (m, tail(v[0]))
        w = c[0]; assert all([q['say'] for q in x] == [q['say'] for q in w] for x in c)   # 같은 판은 같은 say
        assert len(w) == len(v) and all(ans(a) == ans(b) for a, b in zip(v, w)), (m, tail(v[0]))  # 단계마다 정답 · 보기 같음
        for a, b in zip(v, w):
            a['say'] = b['say']; n += 1
            if b.get('why'): a['why'] = copy.deepcopy(b['why']); log[m + ' why'] = log.get(m + ' why', 0) + 1   # 근거 줄도 같이 빠졌었음 (서버 rev 8 에 있던 것)
    log[m] = n
# 독립 검산 (say 가 그 판 정답과 맞는지)
for m in ('m3', 'm4'):
    for q in items(V['monsters'][m]):
        s = q['say']
        if q['type'] == 'multi':                            # 항상 참 → 고른 기호가 say 에 그대로
            want = ', '.join(q['options'][i].split('.')[0] for i in q['answer'])
            assert s.endswith(f'{want} 이다.'), (s, want)
        elif m == 'm3' and '( ) 안의 식은?' in q['question']:   # n² = 3( ? ) + r → say 에 정답 식
            assert q['choices'][q['answerIndex']] in s, (s, q['choices'][q['answerIndex']])
        elif m == 'm4' and '대우는?' in q['question']:
            assert q['choices'][q['answerIndex']] in s, (s,)
        elif m == 'm4' and '포함 관계는?' in q['question']:
            assert q['choices'][q['answerIndex']] in s, (s,)
# 근거 줄 검산: why 정답 = 「대우」 · 「참」
for m in ('m3', 'm4'):
    for q in items(V['monsters'][m]):
        w = q.get('why')
        if w: assert w['choices'][w['answer']] in ('대우', '참') and w['text'] == f"{w['pre']} {w['choices'][w['answer']]}{w['post']}" or w['text'].replace(' ', '') == (w['pre'] + w['choices'][w['answer']] + w['post']).replace(' ', ''), w
# say · why 말고는 그대로
o = copy.deepcopy(V)
for m in ('m3', 'm4'):
    for q in items(o['monsters'][m]): q.pop('say', None); q.pop('why', None)
for m in ('m3', 'm4'):
    for q in items(old['monsters'][m]): q.pop('say', None); q.pop('why', None)
assert o == old
json.dump(V, open(out, 'w', encoding='utf8'), ensure_ascii=False)
print('say 넣음', log)
