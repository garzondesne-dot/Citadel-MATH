# 15차시 서술형 교체 = 팩 v7 · 학습지 v3 (2026-11-25 · 📚 차시팩 #1 · DECISIONS bd5c7e4)

선생님: 「15차시 레이드학습지 서술형문항 교과서에 있는거 페이지 119 서술형 10번문항으로 교체해줘」

- 몬스터 3 = 중단원 10(미래엔 119쪽 · 발전 · 서술형) ⚔ 소레이드 5단계 · 정답 (3, −4), (−3, 8) · 판 7(판 0 = 교과서 숫자)
- 학습지 = `tools/worksheet/gen_ws15v3.py` · 교사용 = `gen_ws15v3_teacher.py`
- 팩 = `tools/pack/build15.py` (+ `overlays/ex-15.json` 에서 옛 m3 손질 뺌) → `docs/handoff/pack-cells/make.py` 로 칸 그림 zip
  - 옛 m3 섞기만큼 rnd 를 돌려 형성평가 · 나머지 보기 순서가 v6 와 같음 · 새 m3 는 r3 따로
  - v6 와 다른 곳 = 몬스터 3 · 열쇠 2(쓰는 곳 문제 6 만) · 형성평가 4 짝 links "" 뿐
- 검산 = `verify_m3.py` → `check_m3.md` (문항 글만 읽고 정수 a, b 전수) · 앱 업로드 검사기 오류 0 · 알림 0
- 사진 채점 기준 = `docs/handoff/pack-rubric/rubrics-11-17.json` set-15 m3 (새 문항)
- 변경 한 장 = `change_pdf.py`
