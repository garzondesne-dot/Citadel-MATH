# r-camp-anvil · 캠프 모루 3상태

> ⛔ 결과물은 `asset-handoff/outputs/r-camp-anvil/` 에만. 한 장 = 한 그림(한 칸 · 한 상태).

| 항목 | 값 |
|---|---|
| 고유 ID | `r-camp-anvil` (칸마다 `r-camp-anvil-NN`) |
| 게임 내 용도 | 개인 캠프 모루 (대기 · 연성 중 · 완성) |
| 우선순위 | P6 |
| 구분 | 수정 (ASSET-SPEC 4장 B · 모루 3종 중복 → 1종) |
| 지금 파일 | `assets/art/anvil-v1.webp (1086×362 · 3칸)` · [미리보기](../references/now/anvil-v1-now-preview.webp) |
| 게임 경로 (#4) | `assets/art/anvil-v2.webp` (이름 예정) |
| 단일 / 시트 | **칸마다 단일 이미지** · 첫 칸이 마스터(승인 뒤 나머지는 마스터 + 템플릿 한 칸만 첨부) · 시트는 #4 |
| 원본 · 최종 크기 | 원본 96×96 도트 → 768 권장 · 최종 칸 #4 결정 |
| 배경 | 마젠타 `#FF00FF` 단색 |
| 출력 파일 | `outputs/r-camp-anvil-NN/r-camp-anvil-NN_state_1.png` |

## 내용

- 00 대기(차분한 모루) = 마스터 · 01 연성 중(달군 금속 · 불티) · 02 완성(빛나는 카드가 떠오름 · 글자 없음)
- 캠프 소품은 문서 6-4 대로 「오른쪽 모닥불 빛」 예외 허용

## 유지할 요소 / 바꿀 요소

- 유지: 지금 그림의 칸 순서 · 모티프 · 대표 색 (칸 번호를 코드가 씀)
- 바꿀 것: 「HD 도트 느낌」 → v2 도트 · 외곽선 `#1a1228` · 적은 색

## 프롬프트 (칸마다 한 장)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Single camp prop, slight top-down 3/4 view: a sturdy blacksmith anvil on a stump. State: [idle | forging — glowing hot metal and sparks | done — a glowing blank card floating above].
(마스터가 승인된 뒤 둘째 칸부터) Match the attached MASTER exactly in style, outline, palette and size; only the motif changes.
Single image, centered, solid flat magenta #FF00FF background. No text, no numbers.
```

## 완료 확인

- [ ] 칸마다 한 장 · 마젠타 배경 · 글자 · 숫자 · 테두리 없음
- [ ] 같은 묶음끼리 크기 · 외곽선 · 빛(왼쪽 위) · 색 수가 같음 (마스터 대비 ±5%)
- [ ] 금지: 글자 · 숫자 · 수식 · 워터마크 · 테두리 · 바닥 그림자 · 배경 소품 · 템플릿 선/번호 없음 · 마젠타(#FF00FF)와 진한 분홍은 몬스터 안에 쓰지 않음
