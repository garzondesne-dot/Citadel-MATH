"""공통수학1 36차시 한꺼번에 다시 짓기 → PLAN.md(구성표) · MOTION.md(모션그래픽 주문서 모음) · unit/castle-*.json|md(성채 문항 시안)"""
import sys, importlib, json, os
sys.path.insert(0, '.'); sys.path.insert(0, 'lessons')
from cm1lib import build, write
UNITS = [('u1', 'Ⅰ-1 다항식의 연산', range(1, 5)), ('u2', 'Ⅰ-2 나머지정리와 인수분해', range(5, 10)), ('u3', 'Ⅱ-1 복소수와 이차방정식', range(10, 16)),
         ('u4', 'Ⅱ-2 이차방정식과 이차함수', range(16, 20)), ('u5', 'Ⅱ-3 여러 가지 방정식과 부등식', range(20, 27)), ('u6', 'Ⅲ-1 경우의 수', range(27, 33)), ('u7', 'Ⅳ-1 행렬과 그 연산', range(33, 37))]
Ls = {n: importlib.import_module(f'l{n:02d}').L for n in range(1, 37)}
os.makedirs('unit', exist_ok=True)
plan = ['# 공통수학1 전체 구성표 — 36차시 시안', '', '> 미래엔 공통수학1 · 차시마다 ⏱ 45분 안팎(여유 문제 빼고) · 몬스터 3 ~ 4 + 여유 문제 1 + 형성평가 4 · 소문항 ≤ 4 · 모든 문항 단독 풀이 가능 · 판 0 ~ 6', '',
        '| 차시 | 중단원 | 쪽 | 제목 | ⏱ 분 | 여유 + | 산(어려운 문제) | 문항 줄 | ✅ | ❌ | 글 | 같은 판 |', '|---|---|---|---|---|---|---|---|---|---|---|---|']
motion = ['# 공통수학1 모션그래픽 주문서 모음 — 36차시', '', '> 영상 한 편 = 주문 한 장. 스타일 = 「UI 데모」(웜그레이 캔버스 · 흰 카드 하나 · 30초 루프 · 720p · 1MB 이내). 아직 영상은 만들지 않았고 주문서만 있음.', '']
tot = dict(rows=0, ok=0, bad=0, lint=0, dup=0, min=0); packs = {}; n_m = 0
for n in range(1, 37):
    L = Ls[n]; pack, rep = build(L); packs[n] = (pack, rep)
    nr = len(rep['rows']); ok = sum(1 for r in rep['rows'] if r[5] == '✅'); bad = sum(1 for r in rep['rows'] if r[5] == '❌')
    un = next(u[1] for u in UNITS if n in u[2])
    hard = (L.get('hard_from') or '—').replace('산 = ', '')
    plan.append(f"| {n} | {un} | {L['pages']} | {L['title']} | {rep['min']} | {rep['extra']} | {hard} | {nr} | {ok} | {bad} | {len(rep['lint'])} | {len(rep['dup'])} |")
    tot['rows'] += nr; tot['ok'] += ok; tot['bad'] += bad; tot['lint'] += len(rep['lint']); tot['dup'] += len(rep['dup']); tot['min'] += rep['min']
    for m in L.get('motion', []):
        n_m += 1
        motion += [f"## {n}차시 · {L['title']} — 🎬 {m['title']}", '', '```', f"제목: {m['title']}", f"쓰는 곳: {n}차시 개념 {m.get('at', 'c1')} 설명", f"핵심 한 줄: {m['key']}", '장면:'] + [f"  {i+1}. {s}" for i, s in enumerate(m['scenes'])] + [f"마지막 화면: {m['end']}", '```', '']
plan += ['', f"**합계**: 36차시 · 문항 {tot['rows']}줄 · 계산 검산 ✅ {tot['ok']} · ❌ {tot['bad']} · 글 검사 걸림 {tot['lint']} · 같은 판 {tot['dup']} · 평균 ⏱ {tot['min']/36:.1f}분 · 모션그래픽 주문서 {n_m}장", '',
         '## 읽는 법', '', '- ⏱ = 도입 3분 + 개념 5 ~ 6분씩 + 문항 형식별 시간(고르기 1.3 · 숫자 1.9 · ○✕ 0.7분, 산은 × 1.3) 으로 어림한 값 — 실제 수업으로 맞춰 봐야 함.', '- 여유 + = 일찍 끝난 반 · 학생용 「여유 문제」 시간.', '- 「산」 = 차시마다 1개. 본문에 어려운 문제가 있으면 그것, 없으면 중단원 마무리 수준에서 1개.', '- 판 0 = 학습지에 실을 문항(시안), 판 1 ~ 6 = 숫자 바꾼 판.']
open('PLAN.md', 'w', encoding='utf8').write('\n'.join(plan) + '\n'); open('MOTION.md', 'w', encoding='utf8').write('\n'.join(motion) + '\n')
# 성채(단원 평가) 문항 시안: 다른 씨앗으로 다시 뽑아 수업 판과 숫자가 겹치지 않게
for uid, un, rg in UNITS:
    rooms = [dict(title='1관 · 기본', items=[]), dict(title='2관 · 익히기', items=[]), dict(title='3관 · 산', items=[])]
    chk = [0, 0]
    for n in rg:
        L = Ls[n]; pack, rep = build(L, seed0=20261123)
        chk[0] += sum(1 for r in rep['rows'] if r[5] == '✅'); chk[1] += sum(1 for r in rep['rows'] if r[5] == '❌')
        b = pack['boss']['vers']
        for i in range(len(b[1])): rooms[0 if i < 2 else 1]['items'].append(dict(b[1 + (i % 3)][i], src=f'{n}차시 형성평가 {i+1}'))
        for m in L['mons']:
            if m.get('hard'):
                for i, it in enumerate(pack['mons'][m['id']]['vers'][2]): rooms[2]['items'].append(dict(it, src=f"{n}차시 {m['id']}-{i+1}"))
    c = dict(id=f'cm1-castle-{uid}', title=f'성채 · {un}', unit=un, note='시안 · 수업 팩과 다른 씨앗으로 뽑은 숫자 · 실제 성채 꼴(eval-*.json)로 옮길 때 손발이 방 수 · 문항 수를 맞춤', rooms=rooms)
    json.dump(c, open(f'unit/castle-{uid}.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    md = [f'# 성채 문항 시안 — {un}', '', f'> 차시 {rg[0]} ~ {rg[-1]} 의 형성평가 · 산 문항을 다른 숫자로 다시 뽑음 · 다시 뽑은 줄 검산 ✅ {chk[0]} · ❌ {chk[1]}', '']
    for r in rooms:
        md += [f"## {r['title']} ({len(r['items'])}문항)", '', '| # | 나온 곳 | 문항 | 보기 | 정답 | 풀이 |', '|---|---|---|---|---|---|']
        for i, it in enumerate(r['items']):
            ans = it['a'] if it['type'] not in ('choice', 'multi') else ' · '.join(it['ch'][int(x)] for x in it['a'].split(','))
            md.append(f"| {i+1} | {it['src']} | {it['q']} | {' / '.join(it['ch'])} | {ans} | {it['sol']} |")
        md.append('')
    open(f'unit/castle-{uid}.md', 'w', encoding='utf8').write('\n'.join(md))
    print(uid, un, [len(r['items']) for r in rooms], chk)
print(tot, n_m)
