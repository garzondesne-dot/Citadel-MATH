"""🏰 성채 레이드 표 만들기 — python3 run_tables.py > 모의표.md"""
import raid_sim as S
B = dict(S.BASE)
ITEMS = [3, 4, 4, 3]            # 성채 원문항(서술형 사진 단계 뺀 뒤) 소문항 수 어림
def raid(acts, atk=1.1, gain=2, hard=0.08, slow=5, limit=600, rage2=True):
    return dict(B, acts=acts, single=B['single'] * atk, aoe=B['aoe'] * atk, hard=hard, slow=slow, limit=limit, hurry_at=limit - 180,
                rage_from_act=2 if rage2 else None, items=ITEMS, gain=gain)
CAND = {
 'A 머리 뼈대 그대로 (1막 4칸 · 2막 4칸 · 공격 ×1.5 · 구슬 그대로)': raid([(0.8, 4, 0.3), (0.5, 4, 0.2)], atk=1.5, gain=1),
 'B 뼈대 + 큰 구슬 (1막 4칸 · 2막 4칸 · 공격 ×1.5 · 큰 구슬 2)': raid([(0.8, 4, 0.3), (0.5, 4, 0.2)], atk=1.5),
 'C 공격만 낮춤 (1막 4칸 · 2막 4칸 · 공격 ×1.1 · 큰 구슬 2)': raid([(0.8, 4, 0.3), (0.5, 4, 0.2)]),
 'R 추천 (1막 3칸 80% · 2막 4칸 50% · 공격 ×1.1 · 큰 구슬 2)': raid([(0.8, 3, 0.3), (0.5, 4, 0.2)]),
 'S 순한 맛 (1막 2칸 75% · 2막 3칸 45% · 공격 ×1.1 · 큰 구슬 2)': raid([(0.75, 2, 0.3), (0.45, 3, 0.2)]),
}
print('## 1. 후보 견주기 — 사람 4명 · 정답률 65%(레이드 문항이라 −8%p · 소문항 +5초) · 승률 50% 가 되는 보스 HP\n')
print('| 후보 | 보스 HP (일반 3800 의 몇 배) | 승률 | 이긴 판(분) | 전체(분) | 💨 도망 | 1막 뜸 → 깨는 데 | 2막 뜸 → 깨는 데 | 2막 깨고 이김 |\n|---|---|---|---|---|---|---|---|---|')
HP = {}
for name, P in CAND.items():
    hp = S.tune_hp(P, 4, 0.65, 0.5); HP[name] = hp; r = S.rate(P, 4, 0.65, hp)
    print(f"| {name} | {hp} (×{hp/3800:.1f}) | {r['win']*100:.0f}% | {r['tw']:.1f} | {r['t']:.1f} | {r['flee']*100:.0f}% | {r['up0']:.1f}분 → {r['brk0']:.0f}초 | {r['up1']:.1f}분 → {r['brk1']:.0f}초 | {r['clr1']*100:.0f}% |")
import sys
pick = sys.argv[1] if len(sys.argv) > 1 else 'R'
name = next(k for k in CAND if k.startswith(pick)); P = CAND[name]; hp = int(sys.argv[2]) if len(sys.argv) > 2 else HP[name]
print(f'\n## 2. 고른 후보 = {name} · HP {hp}\n')
print('| 사람 수(나머지 봇) | 사람 정답률 | 승률 | 이긴 판(분) | 전체(분) | 💨 도망 | 1막 깨는 데(초) | 2막 뜨는 시각(분) | 2막 깨는 데(초) |\n|---|---|---|---|---|---|---|---|---|')
for ppl in (4, 3, 2, 1):
    for p in (0.5, 0.65, 0.8):
        r = S.rate(P, ppl, p, hp)
        print(f"| {ppl} | {int(p*100)}% | {r['win']*100:.0f}% | {r['tw']:.1f} | {r['t']:.1f} | {r['flee']*100:.0f}% | {r['brk0']:.0f} | {r['up1']:.1f} | {r['brk1']:.0f} |")
print('\n## 3. 민감도 — 고른 후보에서 하나씩 바꿈 (사람 4 · 65%)\n')
print('| 바꾼 것 | 승률 | 이긴 판(분) | 도망 |\n|---|---|---|---|')
def row(lbl, Q, h=hp):
    r = S.rate(Q, 4, 0.65, h); print(f"| {lbl} | {r['win']*100:.0f}% | {r['tw']:.1f} | {r['flee']*100:.0f}% |")
row('그대로', P)
row('HP +15%', P, hp * 1.15); row('HP −15%', P, hp * 0.85)
row('공격 ×1.5', dict(P, single=B['single'] * 1.5, aoe=B['aoe'] * 1.5)); row('공격 ×1.3', dict(P, single=B['single'] * 1.3, aoe=B['aoe'] * 1.3)); row('공격 ×1.0', dict(P, single=B['single'], aoe=B['aoe']))
row('큰 구슬 없음(구슬 1)', dict(P, gain=1)); row('큰 구슬 1.5', dict(P, gain=1.5))
row('2막 실드 피해 ×0.3(일반과 같게)', dict(P, acts=[P['acts'][0], (P['acts'][1][0], P['acts'][1][1], 0.3)]))
row('2막 3칸', dict(P, acts=[P['acts'][0], (P['acts'][1][0], 3, 0.2)])); row('1막 4칸', dict(P, acts=[(0.8, 4, 0.3), P['acts'][1]]))
row('2막부터 분노 없음(30% 에서만)', dict(P, rage_from_act=None))
row('도망 8분', dict(P, limit=480, hurry_at=300)); row('도망 12분', dict(P, limit=720, hurry_at=540))
row('문항이 일반 난도(−0%p · +0초)', dict(P, hard=0, slow=0))
row('문항이 더 어려움(−15%p · +8초)', dict(P, hard=0.15, slow=8))
row('빈자리 봇이 속성을 안 채움', P) if False else None
print('\n## 4. 견줌 — 같은 모형의 일반 게시판 판 (HP 3800 · 실드 2칸 70%)\n')
print('| 사람 수 | 정답률 | 승률 | 이긴 판(분) |\n|---|---|---|---|')
for ppl in (4, 1):
    for p in (0.5, 0.65, 0.8):
        r = S.rate(B, ppl, p, 3800); print(f"| {ppl} | {int(p*100)}% | {r['win']*100:.0f}% | {r['tw']:.1f} |")
print('\n## 5. 층별 — 추천 규칙(R) · 문항 길이와 어려움만 다름 · 사람 4 · 65% 가 승률 50% 가 되는 HP\n')
print('| 층 | 원문항 소문항 수 | 어려움 가정(정답률 · 소문항 시간) | 보스 HP | 4명 승률 50/65/80% | 2명 65% | 혼자(봇 3) 65% | 이긴 판(분) | 2막 뜸(분) | 2막 깨는 데(초) | 💨 도망 |\n|---|---|---|---|---|---|---|---|---|---|---|')
FL = {'1층 집합': ([4, 4, 4, 4, 5, 4], 0.05, 4), '2층 명제': ([4, 4, 5, 5, 3, 4], 0.08, 5), '3층 대단원': ([5, 5, 4, 4, 5, 3], 0.11, 6)}
for nm, (its, hd, sl) in FL.items():
    Q = dict(P, items=its, hard=hd, slow=sl); h = S.tune_hp(Q, 4, 0.65, 0.5)
    a = [S.rate(Q, 4, p, h) for p in (0.5, 0.65, 0.8)]; b = S.rate(Q, 2, 0.65, h); c = S.rate(Q, 1, 0.65, h)
    print(f"| {nm} | {'·'.join(map(str, its))} | −{int(hd*100)}%p · +{sl}초 | {h} (×{h/3800:.1f}) | {a[0]['win']*100:.0f} / {a[1]['win']*100:.0f} / {a[2]['win']*100:.0f}% | {b['win']*100:.0f}% | {c['win']*100:.0f}% | {a[1]['tw']:.1f} | {a[1]['up1']:.1f} | {a[1]['brk1']:.0f} | {a[1]['flee']*100:.0f}% |")
