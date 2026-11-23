# v4 최종 (2026-11-23 · 선생님 고르기 「v4 쓰고 히스토그램만 고침」)
#   = gen_v4_text.py (자료를 문항 글에 적은 판 · 혼자 풀림) + 2차시 문제 3(히스토그램)만 gen_v4_sheet.py 의 「학습지 ③ 히스토그램을 보고」 판
#   까닭: [[graph]] 그림은 학교판에서 그려지지 않음(손발 #1 · 머리 확인) → 그 문항만 학습지를 보고 풂(학습지 자료 필요) · 판 1 ~ 6 = 같은 히스토그램에서 다른 물음
#   쓰는 법: python3 make_v4.py <v3 팩 1.json> <v3 팩 2.json> <출력 폴더> → 검산 python3 verify_v4.py <출력 폴더>
import json, os, subprocess, sys, tempfile
P1, P2, OUT = sys.argv[1:4]; H = os.path.dirname(os.path.abspath(__file__))
with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
    subprocess.run([sys.executable, os.path.join(H, 'gen_v4_text.py'), P1, P2, a], check=True)
    subprocess.run([sys.executable, os.path.join(H, 'gen_v4_sheet.py'), P1, P2, b], check=True)
    p1 = json.load(open(os.path.join(a, 'mid1-stat-01.json'), encoding='utf8'))
    p2 = json.load(open(os.path.join(a, 'mid1-stat-02.json'), encoding='utf8'))
    p2['mons']['m3'] = json.load(open(os.path.join(b, 'mid1-stat-02.json'), encoding='utf8'))['mons']['m3']
assert not any('[[graph' in it['q'] for p in (p1, p2) for m in list(p['mons'].values()) + [p['boss']] for v in m['vers'] for it in v)
os.makedirs(OUT, exist_ok=True)
for p in (p1, p2): json.dump(p, open(os.path.join(OUT, f"{p['id']}.json"), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('v4 최종 = 글 판 + 2차시 m3 학습지 판')
