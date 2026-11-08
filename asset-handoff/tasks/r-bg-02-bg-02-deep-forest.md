# r-bg-02 · 던전 배경 02-deep-forest 「깊은 숲 성역」 v2

> ⛔ 결과물은 `asset-handoff/outputs/r-bg-02/` 에만. 템플릿 상자 · 선 · 글자는 그리지 않는다.

| 항목 | 값 |
|---|---|
| 고유 ID | `r-bg-02` |
| 이름 | 던전 배경 02-deep-forest 「깊은 숲 성역」 v2 |
| 게임 내 용도 | 2차시 던전 |
| 우선순위 | P6 |
| 구분 | 수정 (v1 → v2 · ASSET-SPEC 4장 D) |
| 단일 / 시트 | **단일 이미지** (마스터 = 결과물 자체 · 동작 없음) |
| 출력 파일 (GPT) | `outputs/r-bg-02/r-bg-02_bg_1.png` (다시 만들면 `_r2` · `_r3`) |
| 게임 경로 (#4) | `assets/art/dg-02-deep-forest-v2.webp` |
| 파일 형식 | PNG (꽉 찬 그림 · 투명 · 마젠타 아님) |
| 원본 크기 | **16:9** (1920×1080 또는 1600×900). 도구가 1536×1024 만 내면 그대로 내되 **위아래 각 80px 는 잘림** (중요한 것은 가운데 1536×864 안) |
| 최종 출력 크기 (#4) | **1600×900** webp (실제 게임 값 · `dg-04-mine-v2`) — 문서 값 480×270 ×4 = 1920×1080 |
| 안전 영역 | [템플릿](../templates/tpl-bg-1600x900-zones.png): 몬스터 상자 가로 37~63% · 세로 9~55% (보스 35~65% · 7~61%) · 용사 발 세로 72% · 87% (가로 7~93%) · 위 0~8% 상단 막대(미정) · 폰은 가운데 91% 폭만 보임 |
| 화면 | 교실 TV 전체 화면 (`cover` · `center 65%`) · 학생 폰 전투 장면 240px 높이 |

## 그림 내용

- 지금 v1 의 소재 · 분위기 그대로 (깊은 숲 성역)
- v2 도트 · 8차시 광산과 같은 구도

## 참고 이미지

| 파일 | 역할 |
|---|---|
| [dg-04-mine-v2.webp](../references/dg-04-mine-v2.webp) | 화풍 · 구도 기준 (가운데 소실점 · 아래 평평한 바닥 · 양옆 소품) |
| [dg-04-mine-v2-ui-zones-preview.png](../references/dg-04-mine-v2-ui-zones-preview.png) | UI 자리 (몬스터 · 용사 · 상단 막대 · 폰 잘림) |
| [tpl-bg-1600x900-zones.png](../templates/tpl-bg-1600x900-zones.png) | 구도 템플릿 (첨부용 · 표시는 그리지 않음) |
| [dg-02-deep-forest-v1-now-preview.webp](../references/now/dg-02-deep-forest-v1-now-preview.webp) | 지금 v1 (소재 참고 · 화풍은 따르지 않음) |

## 유지할 요소 / 바꿀 요소

- 유지: 테마 소재 · 대표 색
- 바꿀 것: 「HD 도트 느낌」 → v2 도트 · 어두운 바닥 · 가운데 소실점 구도

## 프롬프트 (한 장)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 · backgrounds: no outline, dithering allowed]
Use the attached template only for composition; do NOT draw its boxes, lines or labels.
Side-view battle background for a dungeon RPG, 16:9, pixel art (every art pixel is the same square block).
Theme: "깊은 숲 성역" — a deep forest sanctuary with giant mossy trees, stone altar ruins and glowing mushrooms.
One-point perspective with the vanishing point at the center. Lower ~45% of the image = a FLAT, open, medium-dark floor where heroes and a monster stand (no props on the floor center). Keep the area behind the center-top monster box simple and darker so the monster pops. Decorations and light sources on the left and right sides. Dark and desaturated overall with a few glowing accents. No characters, no monsters, no text, no frame.
```

한국어 요약: 깊은 숲 성역 배경을 v2 도트로 다시.

## 완료 확인

- [ ] 16:9 · 꽉 찬 그림 · 테두리 · 글자 · 숫자 · 사람 · 몬스터 없음 · 템플릿 표시 없음
- [ ] 아래 약 45% 평평한 바닥 · 가운데 소실점 · 몬스터 상자 뒤가 단순 · 어두움
- [ ] 소품 · 광원은 양옆 · 바닥 가운데 비움
- [ ] 픽셀 블록이 고름 · 매끈한 그라데이션 · 흐림 없음 (배경은 디더링 조금 괜찮음)
- [ ] [dg-04-mine-v2](../references/dg-04-mine-v2.webp) 옆에 두어도 같은 게임 배경으로 보임
