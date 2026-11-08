# r-ui-cards · 옛 카드 그림 8

> ⛔ 결과물은 `asset-handoff/outputs/r-ui-cards/` 에만. 한 장 = 한 그림(한 칸 · 한 상태).

| 항목 | 값 |
|---|---|
| 고유 ID | `r-ui-cards` (칸마다 `r-ui-cards-NN`) |
| 게임 내 용도 | `cards` 시트 (forge · fun · td 에서 `DS.Art.card`) — 새 카드는 이미 `card-arts-v2` |
| 우선순위 | P7 (쓰임 확인 뒤) |
| 구분 | 수정 후보 |
| 지금 파일 | `assets/art/cards-v4.webp (1536×1024 · 4×2)` · [미리보기](../references/now/cards-v4-now-preview.webp) |
| 게임 경로 (#4) | `(#4 확인: card-arts-v2 로 대신할 수 있으면 그리지 않음)` (이름 예정) |
| 단일 / 시트 | **칸마다 단일 이미지** · 첫 칸이 마스터(승인 뒤 나머지는 마스터 + 템플릿 한 칸만 첨부) · 시트는 #4 |
| 원본 · 최종 크기 | 원본 32×32 |
| 배경 | 마젠타 `#FF00FF` 단색 |
| 출력 파일 | `outputs/r-ui-cards-NN/r-ui-cards-NN_icon_1.png` |

## 내용

- 0 소속 · 1 개수 · 2 공집합 · 3 포함 · 4 반례 · 5 같음 · 6 부분집합 목록 · 7 개수의 비밀 (배치표 주석)

## 유지할 요소 / 바꿀 요소

- 유지: 지금 그림의 칸 순서 · 모티프 · 대표 색 (칸 번호를 코드가 씀)
- 바꿀 것: 「HD 도트 느낌」 → v2 도트 · 외곽선 `#1a1228` · 적은 색

## 프롬프트 (칸마다 한 장)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
One magical card art object: [모티프].
(마스터가 승인된 뒤 둘째 칸부터) Match the attached MASTER exactly in style, outline, palette and size; only the motif changes.
Single image, centered, solid flat magenta #FF00FF background. No text, no numbers.
```

## 완료 확인

- [ ] 칸마다 한 장 · 마젠타 배경 · 글자 · 숫자 · 테두리 없음
- [ ] 같은 묶음끼리 크기 · 외곽선 · 빛(왼쪽 위) · 색 수가 같음 (마스터 대비 ±5%)
- [ ] 금지: 글자 · 숫자 · 수식 · 워터마크 · 테두리 · 바닥 그림자 · 배경 소품 · 템플릿 선/번호 없음 · 마젠타(#FF00FF)와 진한 분홍은 몬스터 안에 쓰지 않음
