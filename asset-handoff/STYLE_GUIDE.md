# 공통 스타일 가이드 (모든 그림 공통)

> ⛔ 쓰기 범위: 결과물은 `asset-handoff/outputs/` 에만. `assets/` · `js/` · `lessons/` · `css/` · main 브랜치는 건드리지 않는다. 자르기 · 팔레트 맞춤 · webp · 배치표 등록 · 버전 올리기는 #4(코드 방)가 한다.

## 1. 화풍

| 항목 | 기준 |
|---|---|
| 분위기 | 디아블로 1 의 어둡고 고딕한 횃불 던전(배경) + 메이플스토리처럼 한눈에 읽히는 귀여운 캐릭터 + 모으고 싶은 기사단 RPG 느낌 |
| 그림 방식 | **도트(픽셀 아트)**: 정사각 픽셀 블록 · 번짐(안티에일리어싱) · 흐림 · 붓 터치 · 매끈한 그라데이션 없음 |
| 대비 | 배경 = 어둡고 채도 낮게 · 캐릭터 · 몬스터 · 보스 = 밝고 채도 높게 (작은 폰 화면에서 바로 보이게) |
| 비율 · 실루엣 | 용사 2~2.5 등신 · 큰 머리 · 굵고 단순한 실루엣. 몬스터 = 「귀엽지만 위험한」 · 실루엣만 봐도 무엇인지 알 것. 보스 = 일반 몬스터보다 확실히 크고 자세함 · 빛나는 강조색 하나 |
| 수학 룬 | 명제 단원 몬스터는 그 차시 개념을 모양으로 + 몸에 **빛나는 수학 기호 룬 하나**(→ ⊂ ∀ ≥ 같은 기호 한두 개, DECISIONS 2026-11-04). 낱말 · 숫자 · 긴 식은 그리지 않는다 |
| 시점 | 옆에서 본 전투 화면 · 캐릭터는 약간 3/4 · 배경은 정면 원근(가운데 소실점, 아래쪽이 평평한 바닥) |

### 스타일 기준 이미지 (이것에 맞춘다)

| 종류 | 기준 그림 | 맞출 것 |
|---|---|---|
| 일반 몬스터 | [references/monsters-mirror-v2.webp](references/monsters-mirror-v2.webp) (8차시 거울 수정 광산) | 픽셀 블록 굵기 · 외곽선 · 빛 · 채도 · 칸 안에서의 크기 · 빛나는 청록 강조 · 룬 표현 |
| 보스 | [references/monsters-mirrorboss-v3.webp](references/monsters-mirrorboss-v3.webp) (부정의 수정 여왕 · 2026-11-08 배포) | 보스의 자세함 · 장신구 · 강조색 · 3자세 구성 |
| 배경 | [references/dg-04-mine-v2.webp](references/dg-04-mine-v2.webp) | 가운데 소실점 · 아래 45% 평평한 바닥 · 양옆 소품 · 어두운 색 + 빛나는 포인트 |
| 용사 (참고) | [references/hero-sword-v3c.webp](references/hero-sword-v3c.webp) | 등신 · 외곽선 · 색 수 (용사는 모두 완료 · 새로 안 그림) |

## 2. 색

| 항목 | 값 |
|---|---|
| 외곽선 | 캐릭터 · 몬스터 · 소품 = **1 도트 두께의 진한 남보라 `#1a1228`** (검정 아님 · `tools/sprite/demagenta.py` 의 `OUTLINE = [26, 18, 40]`). 배경 = 외곽선 없음 |
| 팔레트 | 문서 값: Lospec 「Resurrect 64」 64색 (`docs/ASSET-SPEC.md` 2장). 실제 게임 값: 용사 · 진짜 도트 시트는 약 49~100색 · 8차시 몬스터 · 보스 시트는 축소 과정에서 색이 많아짐(13만 색). → **그릴 때는 적은 색(한 그림 32~64색)으로**, 맞춤은 #4 가 한다 |
| 명암 | 밝은 면 1 + 그림자 최대 **2단계** |
| 빛 | **왼쪽 위**에서 (문서 6-4 캠프 소품의 「오른쪽 모닥불 빛」은 캠프 소품만의 예외) |
| 디더링 | 배경에만 조금 |
| UI 색 (숯청동 B+ · 정돈판) | 바탕 `#14110f` · 패널 `#1f1a16` · `#2b241e` · 청동 `#b08d57` · 글 `#f3ecdc` · 흐린 글 `#ad9f8a` · 금 `#ebb84f` · 💎 `#6cc6ea` · 초록 `#62d394` · 빨강 `#e5534b` — 아이콘 · UI 조각은 이 색과 어울리게 |

## 3. 방향 · 배경 · 그림자

| 항목 | 기준 |
|---|---|
| 방향 | **용사 = 오른쪽**을 봄 · **몬스터 · 보스 = 왼쪽**(용사 쪽)을 봄. 오른쪽을 보고 그리면 게임이 뒤집어야 하므로(`flip`) 처음부터 왼쪽으로 |
| 캐릭터 배경 | **단색 마젠타 `#FF00FF`** 꽉 채움 (투명 PNG 아님). #4 가 `demagenta.py` 로 지운다. 그림 안에 마젠타 · 진한 분홍을 쓰지 않는다 (같이 지워짐) |
| 배경 그림 | 화면 꽉 채움 (마젠타 아님 · 투명 아님) |
| 바닥 그림자 | 그리지 않는다 (게임이 `.raid2-shadow` 타원으로 넣음) |
| 이펙트 | 공격 자세에 붙는 작은 이펙트(휘두름 궤적 · 물보라)는 **칸 안**에서만. 큰 공격 이펙트는 게임이 따로 그림(`pfx` 띠) |

## 4. 도트 규칙 (픽셀)

| 항목 | 문서 값 (ASSET-SPEC) | 실제 게임 값 (2026-11-08 측정) |
|---|---|---|
| 일반 몬스터 | 원본 96×96 · 8배(768) 확대로 전달 | 게임 시트 칸 **192×192** (cut_grid 로 줄임) · 7차시 `monsters-rift-v2` 만 칸 96 |
| 보스 | 원본 192×192 | 게임 시트 칸 **384×384** · `monsters-riftboss-v2` 만 192 |
| 배경 | 원본 480×270 · 4배 = 1920×1080 | `dg-04-mine-v2` **1600×900** · `dg-03-dimensional-v2` 960×540 · 옛 v1 1672×941 |
| 확대 | nearest-neighbor 정수배 | 게임은 `image-rendering: pixelated` 로 그림 |

→ 그릴 때: **한 픽셀 = 같은 크기의 정사각 블록**(블록 4~8px 권장) · 블록이 격자에 맞게 · 반투명 가장자리 없음.

## 5. 원본 고정 규칙 (선생님 지침 2026-11-08)

1. 캐릭터 · 몬스터마다 **마스터(대기 1프레임)를 먼저** → 선생님 승인 → `references/masters/{ID}_master.png` (유일한 정답지).
2. 다른 동작은 **한 장에 한 프레임** · 첨부는 **마스터 + 템플릿 한 칸**만 · 앞 결과물 이어 쓰기 금지.
3. 여러 칸 시트는 그리지 않는다 (#4 도구가 합침).
4. 프롬프트마다: `Match the attached MASTER exactly: same face, colors, proportions, outline, size; only the pose changes.`
5. 어긋나면 덧칠하지 말고 다시 생성 · 같은 프레임 최대 3번 → 그다음은 선생님께.

## 6. 금지 사항

- 글자 · 숫자 · 수식 · 워터마크 · 서명 · 로고 (예외: 위 「수학 룬」 = 기호 한두 개만. 수식 · 정답 · 문제 글은 게임 코드가 위에 씀)
- 그림 전체를 두르는 테두리 · 액자 · 둥근 모서리
- 템플릿의 칸 선 · 번호 · 기준선 · 점선 · 빨간 표시 · 안내 글자를 결과물에 그리기
- 실제 게임 · 작품의 캐릭터 · 로고 · 문양 따라 그리기 (예: 오징어 게임 기호 · 포켓몬 · 메이플 몬스터 그대로)
- 실제 학생의 얼굴 · 이름 · 사진 · 학교 이름 · 교복 학교 표식
- 글꼴(Galmuri11 · Noto Sans KR)로 쓴 글자 — 글꼴은 게임이 쓰고 그림에는 넣지 않는다
- 캐릭터 그림 안의 배경 소품 · 바닥 · 그림자

## 7. 공통 머리말 (모든 프롬프트 맨 앞 · `docs/ASSET-SPEC.md` 6-0 을 이 폴더 기준으로 다듬음)

```
STYLE BIBLE — "Everyone's Dungeon" v2
True pixel art on a strict pixel grid: every art pixel is the same square block, no anti-aliasing, no blur,
no gradients, no painterly brushwork. Mood: Diablo 1 gothic torch-lit dungeon backgrounds (dark, low
saturation) + MapleStory-like readable cute characters (2–2.5 heads tall, big clear silhouettes, bright
saturated colors) + collectible knight-order RPG feel. Limited palette (32–64 colors, in the spirit of
Lospec "Resurrect 64"). 1-pixel dark navy-purple outline (#1a1228, not pure black) on characters, monsters
and props; no outline on backgrounds. Light from the top-left, max 2 shadow steps.
No text, no letters, no numbers, no watermark, no logo, no ground shadow, no frame/border.
Characters: solid flat magenta #FF00FF background, no magenta or hot pink inside the character.
Do NOT draw any template guide lines, labels, numbers or boxes.
```
