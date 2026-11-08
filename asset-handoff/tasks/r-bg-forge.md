# r-bg-forge · 모루 공방 배경

> ⛔ 결과물은 `asset-handoff/outputs/r-bg-forge/` 에만. 템플릿 상자 · 선 · 글자는 그리지 않는다.

| 항목 | 값 |
|---|---|
| 고유 ID | `r-bg-forge` |
| 이름 | 모루 공방 배경 |
| 게임 내 용도 | 대장간(모루 연성) 화면 배경 · **세로 그림** |
| 우선순위 | P7 |
| 구분 | 수정 (ASSET-SPEC 4장 D) |
| 단일 / 시트 | **단일 이미지** (마스터 = 결과물 자체 · 동작 없음) |
| 출력 파일 (GPT) | `outputs/r-bg-forge/r-bg-forge_bg_1.png` (다시 만들면 `_r2` · `_r3`) |
| 게임 경로 (#4) | `assets/art/forgec-background-v3.webp` |
| 파일 형식 | PNG (꽉 찬 그림 · 투명 · 마젠타 아님) |
| 원본 크기 | **세로 1:2** (예: 640×1280 · 도구가 1024×1536 만 내면 좌우 끝이 조금 잘림) |
| 최종 출력 크기 (#4) | 지금 그림과 같은 비율 (지금 640×1280 (1:2 세로) — 16:9 아님 · 같은 비율로) |
| 안전 영역 | 미정 (모루 화면 배치에서 다시 잼) · 참고만: [템플릿](../templates/tpl-bg-1600x900-zones.png): 몬스터 상자 가로 37~63% · 세로 9~55% (보스 35~65% · 7~61%) · 용사 발 세로 72% · 87% (가로 7~93%) · 위 0~8% 상단 막대(미정) · 폰은 가운데 91% 폭만 보임 |
| 화면 | 교실 TV 전체 화면 (`cover` · `center 65%`) · 학생 폰 전투 장면 240px 높이 |

## 그림 내용

- 지금 그림 소재 그대로 · 크기 = 지금 640×1280 (1:2 세로) — 16:9 아님 · 같은 비율로

## 참고 이미지

| 파일 | 역할 |
|---|---|
| [dg-04-mine-v2.webp](../references/dg-04-mine-v2.webp) | 화풍 · 구도 기준 (가운데 소실점 · 아래 평평한 바닥 · 양옆 소품) |
| [forgec-background-v2-now-preview.webp](../references/now/forgec-background-v2-now-preview.webp) | 지금 그림 (소재 참고) |

## 유지할 요소 / 바꿀 요소

- 유지: 소재 · 분위기
- 바꿀 것: v2 도트

## 프롬프트 (한 장)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 · backgrounds: no outline, dithering allowed]
Use the attached template only for composition; do NOT draw its boxes, lines or labels.
Portrait (1:2) workshop background, pixel art (every art pixel is the same square block).
Theme: "모루 공방 배경" — a cozy blacksmith workshop interior, warm forge glow, tools on the walls.
One-point perspective with the vanishing point at the center. Lower ~45% of the image = a FLAT, open, medium-dark floor where heroes and a monster stand (no props on the floor center). Keep the area behind the center-top monster box simple and darker so the monster pops. Decorations and light sources on the left and right sides. Dark and desaturated overall with a few glowing accents. No characters, no monsters, no text, no frame.
```

한국어 요약: 모루 공방 배경 v2 도트.

## 완료 확인

- [ ] 세로 1:2 · 꽉 찬 그림 · 테두리 · 글자 · 숫자 · 사람 · 몬스터 없음 · 템플릿 표시 없음
- [ ] 아래 약 45% 평평한 바닥 · 가운데 소실점 · 몬스터 상자 뒤가 단순 · 어두움
- [ ] 소품 · 광원은 양옆 · 바닥 가운데 비움
- [ ] 픽셀 블록이 고름 · 매끈한 그라데이션 · 흐림 없음 (배경은 디더링 조금 괜찮음)
- [ ] [dg-04-mine-v2](../references/dg-04-mine-v2.webp) 옆에 두어도 같은 게임 배경으로 보임
