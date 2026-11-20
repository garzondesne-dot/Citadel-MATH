# 🧙 용사 에셋 검사 1단계 (2026-11-20 · 읽기만 · 그림 고치지 않음)

대상 = 베타 저장소 citadel-MATH-test `public/art` 의 용사 그림 109파일 · 1,735칸 (전투 v5 · 각성 3 · 숨쉬기 idle8 · 각성 3 · 오라 aura10 33 · 초상 2). 스크립트 = `audit.py`(검사) · `fig.py`(확대 그림) · 칸별 결과 = `out/cells.json` · 파일별 = `out/files.json`.

## 한눈에 (결론)

- **마젠타 키 남은 곳 = 전투 · 숨쉬기에는 0**. 배경 지우기는 깨끗함. 선생님이 본 「형광색」은 아래 ①②가 원인으로 보임.
- ① **이펙트의 형광 분홍 빛**(수학소년 룬 원 · 메카닉 · 몽크): 배경 번짐이 아니라 이펙트 색 → 고칠 대상이 아니라 **색을 줄일지 선생님 판단**.
- ② **오라 · 마검사 칼날의 형광 분홍 줄**(진짜 거슬리는 잡티 · 0,0 · 0,1 두 칸에 215픽셀씩 · 나머지 칸은 거의 없음) · **오라 · 녹스(dknight) 불꽃 외톨이 점 300여 개**(불똥으로도 보임).
- ③ **칸 위쪽 잘림 = 녹스 각성 전투 시트 2칸**(이펙트가 칸 위 가장자리에서 잘림).
- ④ 반투명 찌꺼기 · 발 줄 어긋남: 전투 · 숨쉬기에서는 거의 없음(발 줄 어긋남 칸은 아래 표).
- ⑤ 색 수: 전투 · 숨쉬기 시트는 256색 팔레트 고정이라 「48색 넘음」이 전부(검사 의미 없음 · 파일 색 수만 files.json 에). 초상 2장(faces-v3 · portraits-v2)은 그림 화풍(그라데이션 · 반투명)이라 픽셀 기준을 적용하지 않음 → 점수 표시만.

## 종류별 심각도 칸 수

| 종류 | 상 | 중 | 하 | 문제 없음 |
|---|---|---|---|---|
| 전투 | 0 | 5 | 26 | 1117 |
| 숨쉬기 | 0 | 0 | 3 | 293 |
| 오라 | 1 | 10 | 33 | 220 |
| 초상 | 15 | 7 | 5 | 0 |

심각도 = 문제 종류별 점수 합(마젠타 키 · 외톨이 형광 · 가장자리 점 · 칸 밖 번짐 · 반투명 · 발 줄 어긋남). 분홍 가장자리(`pink`)는 이펙트 빛일 수 있어 점수에 넣지 않고 files.json 에만 적음.

## 심한 것 상위 10 (초상 제외)

| # | 파일 | 칸(줄,열) | 종류 | 마젠타 | 외톨이 형광 | 가장자리 점 | 칸 밖 번짐 | 반투명 | 발 줄 어긋남 | 심각도 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | aura10-dknight-v1.webp | 0,4 | 오라 | 0 | 85 | 0 | 0 | 0 | 2 | 중 |
| 2 | aura10-spellblade-v1.webp | 0,0 | 오라 | 215 | 0 | 0 | 0 | 0 | 0 | 중 |
| 3 | aura10-spellblade-v1.webp | 0,1 | 오라 | 215 | 0 | 0 | 0 | 0 | 0 | 중 |
| 4 | aura10-dknight-v1.webp | 0,3 | 오라 | 0 | 50 | 0 | 0 | 0 | 4 | 중 |
| 5 | aura10-dknight-v1.webp | 0,2 | 오라 | 0 | 43 | 0 | 0 | 0 | 2 | 중 |
| 6 | aura10-dknight-v1.webp | 0,1 | 오라 | 0 | 36 | 0 | 0 | 0 | 3 | 중 |
| 7 | aura10-dknight-v1.webp | 0,7 | 오라 | 0 | 32 | 0 | 0 | 0 | 3 | 중 |
| 8 | aura10-dknight-v1.webp | 0,0 | 오라 | 0 | 26 | 0 | 0 | 0 | 6 | 상 |
| 9 | aura10-dknight-v1.webp | 0,5 | 오라 | 0 | 21 | 0 | 0 | 0 | 1 | 중 |
| 10 | aura10-dknight-v1.webp | 0,6 | 오라 | 0 | 16 | 0 | 0 | 0 | 1 | 중 |

## 전투 · 숨쉬기 · 오라 에서 문제 있는 칸 전부 (초상 제외)

| 파일 | 칸 | 마젠타 | 외톨이 | 가장자리 점 | 번짐 | 반투명 | 발 줄 | 심각도 |
|---|---|---|---|---|---|---|---|---|
| aura10-abacus-v1.webp | 0,3 |  |  |  |  |  | 3 | 하 |
| aura10-abacus-v1.webp | 0,4 |  |  |  |  |  | 4 | 하 |
| aura10-abacus-v1.webp | 0,6 |  |  |  |  |  | 4 | 하 |
| aura10-alchemist-v1.webp | 0,5 |  | 3 |  |  |  |  | 하 |
| aura10-alchemist-v1.webp | 0,6 |  | 3 |  |  |  |  | 하 |
| aura10-alchemist-v1.webp | 0,7 |  | 2 |  |  |  |  | 하 |
| aura10-bard-v1.webp | 0,5 |  |  |  |  |  | 6 | 하 |
| aura10-crossbow-v1.webp | 0,0 |  |  |  |  |  | 4 | 하 |
| aura10-crossbow-v1.webp | 0,1 |  |  |  |  |  | 3 | 하 |
| aura10-crossbow-v1.webp | 0,3 |  |  |  |  |  | 5 | 하 |
| aura10-crossbow-v1.webp | 0,4 |  | 1 |  |  |  | 3 | 중 |
| aura10-crossbow-v1.webp | 0,5 |  |  |  |  |  | 4 | 하 |
| aura10-dknight-v1.webp | 0,0 |  | 26 |  |  |  | 6 | 상 |
| aura10-dknight-v1.webp | 0,1 |  | 36 |  |  |  | 3 | 중 |
| aura10-dknight-v1.webp | 0,2 |  | 43 |  |  |  | 2 | 중 |
| aura10-dknight-v1.webp | 0,3 |  | 50 |  |  |  | 4 | 중 |
| aura10-dknight-v1.webp | 0,4 |  | 85 |  |  |  | 2 | 중 |
| aura10-dknight-v1.webp | 0,5 |  | 21 |  |  |  | 1 | 중 |
| aura10-dknight-v1.webp | 0,6 |  | 16 |  |  |  | 1 | 중 |
| aura10-dknight-v1.webp | 0,7 |  | 32 |  |  |  | 3 | 중 |
| aura10-dragoon-v1.webp | 0,0 |  |  |  |  |  | 3 | 하 |
| aura10-dragoon-v1.webp | 0,1 |  | 3 |  |  |  | 2 | 하 |
| aura10-elemental-v1.webp | 0,1 |  |  |  |  |  | 3 | 하 |
| aura10-elemental-v1.webp | 0,4 |  |  |  |  |  | 3 | 하 |
| aura10-elemental-v1.webp | 0,5 |  |  |  |  |  | 3 | 하 |
| aura10-merchant-v1.webp | 0,6 |  |  |  |  |  | 4 | 하 |
| aura10-paladin-v1.webp | 0,0 |  |  |  |  |  | 3 | 하 |
| aura10-paladin-v1.webp | 0,1 |  |  |  |  |  | 5 | 하 |
| aura10-paladin-v1.webp | 0,2 |  |  |  |  |  | 9 | 하 |
| aura10-paladin-v1.webp | 0,4 |  |  |  |  |  | 5 | 하 |
| aura10-paladin-v1.webp | 0,5 |  |  |  |  |  | 5 | 하 |
| aura10-sage-v1.webp | 0,5 |  |  |  |  |  | 3 | 하 |
| aura10-spellblade-v1.webp | 0,0 | 215 |  |  |  |  |  | 중 |
| aura10-spellblade-v1.webp | 0,1 | 215 |  |  |  |  |  | 중 |
| aura10-spellblade-v1.webp | 0,4 | 2 |  |  |  |  |  | 하 |
| aura10-spellblade-v1.webp | 0,7 | 3 |  |  |  |  |  | 하 |
| aura10-sword-v1.webp | 0,0 |  |  |  | 4 |  |  | 하 |
| aura10-sword-v1.webp | 0,1 |  |  |  | 8 |  |  | 하 |
| aura10-sword-v1.webp | 0,2 |  |  |  | 6 |  |  | 하 |
| aura10-sword-v1.webp | 0,3 |  |  |  | 4 |  |  | 하 |
| aura10-sword-v1.webp | 0,4 |  |  |  |  |  | 6 | 하 |
| aura10-sword-v1.webp | 0,5 |  |  |  | 1 |  |  | 하 |
| aura10-sword-v1.webp | 0,6 |  |  |  |  |  | 5 | 하 |
| aura10-tamer-v1.webp | 0,6 |  |  |  |  |  | 3 | 하 |
| hero-abacus-v5.webp | 4,1 |  |  |  | 11 |  |  | 하 |
| hero-astro-v5.webp | 4,1 |  |  |  | 10 |  |  | 하 |
| hero-astro-v5.webp | 6,1 |  |  |  | 27 |  |  | 하 |
| hero-bone-v5.webp | 2,2 |  |  |  | 8 |  |  | 하 |
| hero-dknight-awk-idle8-v1.webp | 0,0 |  |  |  |  |  | 3 | 하 |
| hero-dknight-awk-idle8-v1.webp | 0,1 |  |  |  |  |  | 3 | 하 |
| hero-dknight-awk-idle8-v1.webp | 0,7 |  | 1 |  |  |  |  | 하 |
| hero-dknight-awk-v5.webp | 0,1 |  | 1 |  |  |  |  | 하 |
| hero-dknight-awk-v5.webp | 1,0 |  |  |  | 55 |  | 7 | 중 |
| hero-dknight-awk-v5.webp | 2,2 |  | 1 |  | 77 |  |  | 중 |
| hero-dknight-awk-v5.webp | 5,1 |  | 2 |  |  |  |  | 하 |
| hero-dknight-awk-v5.webp | 9,0 |  | 1 |  |  |  |  | 하 |
| hero-dknight-awk-v5.webp | 11,1 |  | 2 |  |  |  |  | 하 |
| hero-dknight-v5.webp | 2,2 |  |  |  | 36 |  |  | 하 |
| hero-dwarf-v5.webp | 6,1 |  |  |  | 3 |  |  | 하 |
| hero-frost-v5.webp | 2,2 |  |  |  | 39 |  |  | 하 |
| hero-geometry-v5.webp | 2,1 |  |  |  | 29 |  |  | 하 |
| hero-hacker-v5.webp | 2,2 |  |  |  | 8 |  |  | 하 |
| hero-math-v5.webp | 5,1 |  |  | 5 | 3 |  |  | 중 |
| hero-mathboy-v5.webp | 2,2 |  |  |  | 3 |  |  | 하 |
| hero-mathboy-v5.webp | 2,3 |  |  |  | 20 |  |  | 하 |
| hero-monk-v5.webp | 4,1 |  |  |  | 4 |  |  | 하 |
| hero-monk-v5.webp | 11,0 |  | 3 |  |  |  |  | 하 |
| hero-monk-v5.webp | 11,1 |  | 2 |  |  |  |  | 하 |
| hero-paladin-awk-v5.webp | 3,1 |  |  | 5 | 5 |  |  | 중 |
| hero-paladin-awk-v5.webp | 4,1 |  |  |  | 13 |  |  | 하 |
| hero-paladin-v5.webp | 4,1 |  |  |  | 3 |  |  | 하 |
| hero-priest-v5.webp | 4,1 |  |  |  | 15 |  |  | 하 |
| hero-priest-v5.webp | 6,0 |  |  |  | 8 |  |  | 하 |
| hero-priest-v5.webp | 6,1 |  |  |  | 33 |  |  | 하 |
| hero-sage-v5.webp | 2,2 |  |  |  | 31 |  |  | 하 |
| hero-valkyrie-awk-v5.webp | 2,2 |  |  |  | 4 |  |  | 하 |
| hero-valkyrie-awk-v5.webp | 2,3 |  |  | 3 | 3 |  | 2 | 중 |
| hero-valkyrie-v5.webp | 2,2 |  |  |  | 1 |  |  | 하 |

## 자동 · 수동 나누기 (초상 제외 · 문제 칸 78)

- 🤖 **자동으로 고칠 수 있음 19칸**: 마젠타 키 · 외톨이 점 · 가장자리 점 · 반투명 → 지우기 / 이웃 색으로 바꾸기 (`fig.py` 의 `fix()` 미리 보기 = fig 폴더 세 번째 그림).
- 👀 **사람이 봐야 함 59칸**: 칸 밖 번짐(이펙트 잘림은 GPT 에 다시 · 칸 위치 · 크기 판단) · 발 줄 어긋남(동작이 일부러 다를 수 있음).
- 🎨 **선생님 판단**: 이펙트의 형광 분홍(수학소년 · 메카닉 · 몽크 · 마검사 오라 칼날) — 지울 잡티인지 이펙트 색인지.

## 확대 비교 그림 (fig/)

- `01·04·05·06-aura10-dknight` : 불꽃 외톨이 점 (원본 · 문제 빨강 · 자동 고침)
- `02·03-aura10-spellblade` : 칼날의 형광 분홍 줄 (0,0 · 0,1)
- `pink1·2-hero-mathboy-v5` · `pink3-hero-mechanic-v5` : 이펙트 분홍 빛 (잡티 아님 · 선생님 판단)
- `bleed1-hero-dknight-awk-v5-r2c2` : 녹스 각성 이펙트 위쪽 잘림
- `edot1-hero-paladin-awk-v5-r3c1` : 칸 가장자리 점

## 2단계 제안 · 손발 테스트 #1 에 넘길 후보 (선생님 컨펌 뒤에만)

| 파일 | 고칠 것 | 방법 |
|---|---|---|
| aura10-alchemist-v1.webp | 3칸 (0,5, 0,6, 0,7) | 자동 (fix) |
| aura10-dknight-v1.webp | 4칸 (0,2, 0,4, 0,5, 0,6) | 자동 (fix) |
| aura10-dragoon-v1.webp | 1칸 (0,1) | 자동 (fix) |
| aura10-spellblade-v1.webp | 4칸 (0,0, 0,1, 0,4, 0,7) | 자동 (fix) |
| hero-dknight-awk-idle8-v1.webp | 1칸 (0,7) | 자동 (fix) |
| hero-dknight-awk-v5.webp | 4칸 (0,1, 5,1, 9,0, 11,1) | 자동 (fix) |
| hero-monk-v5.webp | 2칸 (11,0, 11,1) | 자동 (fix) |
| aura10-abacus-v1.webp | 3칸 (0,3, 0,4, 0,6) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-bard-v1.webp | 1칸 (0,5) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-crossbow-v1.webp | 5칸 (0,0, 0,1, 0,3, 0,4, 0,5) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-dknight-v1.webp | 4칸 (0,0, 0,1, 0,3, 0,7) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-dragoon-v1.webp | 1칸 (0,0) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-elemental-v1.webp | 3칸 (0,1, 0,4, 0,5) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-merchant-v1.webp | 1칸 (0,6) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-paladin-v1.webp | 5칸 (0,0, 0,1, 0,2, 0,4, 0,5) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-sage-v1.webp | 1칸 (0,5) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-sword-v1.webp | 7칸 (0,0, 0,1, 0,2, 0,3, 0,4, 0,5…) | 👀 수동 · GPT 에 그 칸만 다시 |
| aura10-tamer-v1.webp | 1칸 (0,6) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-abacus-v5.webp | 1칸 (4,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-astro-v5.webp | 2칸 (4,1, 6,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-bone-v5.webp | 1칸 (2,2) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-dknight-awk-idle8-v1.webp | 2칸 (0,0, 0,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-dknight-awk-v5.webp | 2칸 (1,0, 2,2) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-dknight-v5.webp | 1칸 (2,2) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-dwarf-v5.webp | 1칸 (6,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-frost-v5.webp | 1칸 (2,2) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-geometry-v5.webp | 1칸 (2,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-hacker-v5.webp | 1칸 (2,2) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-math-v5.webp | 1칸 (5,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-mathboy-v5.webp | 2칸 (2,2, 2,3) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-monk-v5.webp | 1칸 (4,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-paladin-awk-v5.webp | 2칸 (3,1, 4,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-paladin-v5.webp | 1칸 (4,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-priest-v5.webp | 3칸 (4,1, 6,0, 6,1) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-sage-v5.webp | 1칸 (2,2) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-valkyrie-awk-v5.webp | 2칸 (2,2, 2,3) | 👀 수동 · GPT 에 그 칸만 다시 |
| hero-valkyrie-v5.webp | 1칸 (2,2) | 👀 수동 · GPT 에 그 칸만 다시 |
