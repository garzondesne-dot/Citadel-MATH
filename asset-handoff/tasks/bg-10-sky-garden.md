# bg-10 · 10차시 ⚖ 저울의 공중 정원 배경

> ⛔ 결과물은 `asset-handoff/outputs/bg-10/` 에만. 템플릿 상자 · 선 · 글자는 그리지 않는다.

| 항목 | 값 |
|---|---|
| 고유 ID | `bg-10` |
| 이름 | 10차시 ⚖ 저울의 공중 정원 배경 (**확정** · 2026-11-08 선생님 「추천대로」) |
| 게임 내 용도 | 10차시 던전 전투 배경 (테마 id `12-skygarden` · 새 테마 · #4 가 배치표에 추가) |
| 우선순위 | P2 |
| 구분 | 신규 (테마 확정 2026-11-08) |
| 단일 / 시트 | **단일 이미지** (마스터 = 결과물 자체 · 동작 없음) |
| 출력 파일 (GPT) | `outputs/bg-10/bg-10_bg_1.png` (다시 만들면 `_r2` · `_r3`) |
| 게임 경로 (#4) | `assets/art/dg-12-skygarden-v1.webp` (이름 예정) |
| 파일 형식 | PNG (꽉 찬 그림 · 투명 · 마젠타 아님) |
| 원본 크기 | **16:9** (1920×1080 또는 1600×900). 도구가 1536×1024 만 내면 그대로 내되 **위아래 각 80px 는 잘림** (중요한 것은 가운데 1536×864 안) |
| 최종 출력 크기 (#4) | **1600×900** webp (실제 게임 값 · `dg-04-mine-v2`) — 문서 값 480×270 ×4 = 1920×1080 |
| 안전 영역 | [템플릿](../templates/tpl-bg-1600x900-zones.png): 몬스터 상자 가로 37~63% · 세로 9~55% (보스 35~65% · 7~61%) · 용사 발 세로 72% · 87% (가로 7~93%) · 위 0~8% 상단 막대(미정) · 폰은 가운데 91% 폭만 보임 |
| 화면 | 교실 TV 전체 화면 (`cover` · `center 65%`) · 학생 폰 전투 장면 240px 높이 |

## 그림 내용

- 구름 위에 떠 있는 흰 대리석 정원 테라스 · 양옆 기둥에 감긴 연두 덩굴 · 꽃
- 양옆에 큰 금빛 천칭 저울 조각 · 작은 분수
- 먼 가운데 = 구름 사이 아치 문 · 저녁 하늘빛
- 하늘색 · 흰 대리석 · 연두 + 금빛 (다른 차시보다 밝지만 바닥 가운데는 차분하게)

## 참고 이미지

| 파일 | 역할 |
|---|---|
| [dg-04-mine-v2.webp](../references/dg-04-mine-v2.webp) | 화풍 · 구도 기준 (가운데 소실점 · 아래 평평한 바닥 · 양옆 소품) |
| [dg-04-mine-v2-ui-zones-preview.png](../references/dg-04-mine-v2-ui-zones-preview.png) | UI 자리 (몬스터 · 용사 · 상단 막대 · 폰 잘림) |
| [tpl-bg-1600x900-zones.png](../templates/tpl-bg-1600x900-zones.png) | 구도 템플릿 (첨부용 · 표시는 그리지 않음) |
| [dg-10-sky-v1-now-preview.webp](../references/now/dg-10-sky-v1-now-preview.webp) | 구름 위 분위기만 참고 (화풍은 따르지 않음) |

## 유지할 요소 / 바꿀 요소

- 유지: 8차시 광산 배경(dg-04-mine-v2)과 같은 구도 · 화풍 · 어두운 바닥
- 바꿀 것: 테마 소재만

## 프롬프트 (한 장)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 · backgrounds: no outline, dithering allowed]
Use the attached template only for composition; do NOT draw its boxes, lines or labels.
Side-view battle background for a dungeon RPG, 16:9, pixel art (every art pixel is the same square block).
Theme: "Sky Garden of Scales" — a floating white-marble garden terrace above the clouds: vine-wrapped pillars and flowers on both sides, large golden balance-scale statues on the left and right, small fountains, a cloud archway at the far center, dusk sky; sky blue, white marble, light green and gold palette (brighter than other levels but keep the floor center calm and medium-dark).
One-point perspective with the vanishing point at the center. Lower ~45% of the image = a FLAT, open, medium-dark floor where heroes and a monster stand (no props on the floor center). Keep the area behind the center-top monster box simple and darker so the monster pops. Decorations and light sources on the left and right sides. Dark and desaturated overall with a few glowing accents. No characters, no monsters, no text, no frame.
```

한국어 요약: 구름 위 대리석 정원 · 양옆 금빛 천칭 저울 · 가운데 구름 아치 문 · 아래 평평한 바닥.

## 완료 확인

- [ ] 16:9 · 꽉 찬 그림 · 테두리 · 글자 · 숫자 · 사람 · 몬스터 없음 · 템플릿 표시 없음
- [ ] 아래 약 45% 평평한 바닥 · 가운데 소실점 · 몬스터 상자 뒤가 단순 · 어두움
- [ ] 소품 · 광원은 양옆 · 바닥 가운데 비움
- [ ] 픽셀 블록이 고름 · 매끈한 그라데이션 · 흐림 없음 (배경은 디더링 조금 괜찮음)
- [ ] [dg-04-mine-v2](../references/dg-04-mine-v2.webp) 옆에 두어도 같은 게임 배경으로 보임
