# r-bg-tcamp · 교사 캠프 「푸른 숲 성소」

> ⛔ 결과물은 `asset-handoff/outputs/r-bg-tcamp/` 에만. 템플릿 상자 · 선 · 글자는 그리지 않는다.

| 항목 | 값 |
|---|---|
| 고유 ID | `r-bg-tcamp` |
| 이름 | 교사 캠프 「푸른 숲 성소」 |
| 게임 내 용도 | 교사 캠프 · 종합상황실 시작 화면 배경 |
| 우선순위 | P7 |
| 구분 | 수정 (ASSET-SPEC 4장 D) |
| 단일 / 시트 | **단일 이미지** (마스터 = 결과물 자체 · 동작 없음) |
| 출력 파일 (GPT) | `outputs/r-bg-tcamp/r-bg-tcamp_bg_1.png` (다시 만들면 `_r2` · `_r3`) |
| 게임 경로 (#4) | `assets/art/tcamp-sanctuary-v2.webp` |
| 파일 형식 | PNG (꽉 찬 그림 · 투명 · 마젠타 아님) |
| 원본 크기 | **16:9** (1920×1080 또는 1600×900). 도구가 1536×1024 만 내면 그대로 내되 **위아래 각 80px 는 잘림** (중요한 것은 가운데 1536×864 안) |
| 최종 출력 크기 (#4) | 지금 그림과 같은 비율 (지금 1280×720 · 16:9) |
| 안전 영역 | [템플릿](../templates/tpl-bg-1600x900-zones.png): 몬스터 상자 가로 37~63% · 세로 9~55% (보스 35~65% · 7~61%) · 용사 발 세로 72% · 87% (가로 7~93%) · 위 0~8% 상단 막대(미정) · 폰은 가운데 91% 폭만 보임 |
| 화면 | 교실 TV 전체 화면 (`cover` · `center 65%`) · 학생 폰 전투 장면 240px 높이 |

## 그림 내용

- 지금 그림 소재 그대로 · 크기 = 지금 1280×720 · 16:9

## 참고 이미지

| 파일 | 역할 |
|---|---|
| [dg-04-mine-v2.webp](../references/dg-04-mine-v2.webp) | 화풍 · 구도 기준 (가운데 소실점 · 아래 평평한 바닥 · 양옆 소품) |
| [tcamp-sanctuary-v1-now-preview.webp](../references/now/tcamp-sanctuary-v1-now-preview.webp) | 지금 그림 (소재 참고) |

## 유지할 요소 / 바꿀 요소

- 유지: 소재 · 분위기
- 바꿀 것: v2 도트

## 프롬프트 (한 장)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 · backgrounds: no outline, dithering allowed]
Use the attached template only for composition; do NOT draw its boxes, lines or labels.
Side-view battle background for a dungeon RPG, 16:9, pixel art (every art pixel is the same square block).
Theme: "교사 캠프 「푸른 숲 성소」" — a blue-lit forest sanctuary clearing at night with a stone shrine.
One-point perspective with the vanishing point at the center. Lower ~45% of the image = a FLAT, open, medium-dark floor where heroes and a monster stand (no props on the floor center). Keep the area behind the center-top monster box simple and darker so the monster pops. Decorations and light sources on the left and right sides. Dark and desaturated overall with a few glowing accents. No characters, no monsters, no text, no frame.
```

한국어 요약: 교사 캠프 「푸른 숲 성소」 v2 도트.

## 완료 확인

- [ ] 16:9 · 꽉 찬 그림 · 테두리 · 글자 · 숫자 · 사람 · 몬스터 없음 · 템플릿 표시 없음
- [ ] 아래 약 45% 평평한 바닥 · 가운데 소실점 · 몬스터 상자 뒤가 단순 · 어두움
- [ ] 소품 · 광원은 양옆 · 바닥 가운데 비움
- [ ] 픽셀 블록이 고름 · 매끈한 그라데이션 · 흐림 없음 (배경은 디더링 조금 괜찮음)
- [ ] [dg-04-mine-v2](../references/dg-04-mine-v2.webp) 옆에 두어도 같은 게임 배경으로 보임
