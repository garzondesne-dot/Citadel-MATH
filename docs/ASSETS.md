# 에셋 목록 (`assets/img`, 배치표 `assets/manifest.js`)

2026-10-31 사용자 제공 3묶음(`citadel-assets` · `forest-camp-anvil-kit` · `citadel-assets-expansion`)을 정리했다.
원본 PNG·제작 프롬프트는 저장소에 넣지 않았다 (웹용 webp 만, 큰 그림은 크기를 줄임). 그림을 바꿀 때는 파일 이름을 바꾼다 (`-v2` …, 캐시 때문).

## 지금 쓰는 것
| 키 | 파일 | 배치 |
|---|---|---|
| `heroes` | heroes-v2.webp | 4열(대기·이동·공격·넘어짐) × 8행 (7번 = 선생님) |
| `monsters` | monsters-v2.webp | 3열(기본·공격·패배) × 3행: 수정 슬라임 · 바위 골렘 · 성채 드래곤 |
| `background` · `scene` | dungeon.webp | 첫 화면 배경 · 몬스터 뒤 배경 |
| `frame` | frame-v2.webp | 테두리 (border-image) |
| `cards` | cards-v4.webp | 옛 카드 그림 (지금은 안 씀, 대장간에서 다시 볼 수 있음) |

## 새로 받은 것 (아직 화면에 안 씀)
| 키 | 파일 | 배치 · 내용 | 쓸 곳 (계획) |
|---|---|---|---|
| `heroesExtra` | heroes-extra-v1.webp (444×887) | 4열 × 8행 · 성기사 · 격투가 · 무희 · 음유시인 · 연금술사 · 해적 · 빙결 마법사 · 조련사 | 용사 고르기 확장 (용사 설계 확정 뒤) |
| `monstersExtra` | monsters-extra-v1.webp (614×922) | 3열 × 10행, **칸이 가로로 긴 직사각형(≈2.22:1)** · 에메랄드 멧돼지 · 화염 도마뱀 · 장갑 외눈괴물 · 이끼 미믹 · 자수정 박쥐 · 태엽 딱정벌레 · 서리 늑대 · 버섯 기사 · 마법책 정령 · 흑요석 미노타우로스 | 필드 몬스터·스페셜 몬스터 다양화 |
| `fields` | field-forest / lava / ice -v1.webp | 전투 배경 3종 (달빛 숲 유적 · 화산 대장간 · 빙결 신전) | 몬스터·차시별 배경 |
| `camp.bg` | camp-forest-v1.webp | 어두운 숲 야영지 (텐트 포함) | 3단계 모닥불 화면 |
| `camp.fire` | campfire-v1.webp | 4열 × 2행 = 8프레임, **110ms 반복** | 모닥불 (움직임) |
| `camp.gate` | gates-v1.webp | 2열: 활성(푸른 소용돌이) / 꺼짐 | 던전 차원문 (오른쪽) |
| `camp.trees` | camp-trees-v1.webp | 폭이 다른 4종 — `cuts` [0, 630, 1020, 1550, 2048] / 2048 비율로 자름 · 활엽수 · 침엽수 · 고목 · 전경 나무 | 뒤쪽·앞쪽 나무 배치 |
| `camp.anvil` | anvil-v1.webp | 3열: 대기 / 연성 중 / 완성 | 모루 (왼쪽) · 대장간 |
| `panels` | ui-panels-v1.webp | 2열 × 2행: 남색 인벤토리 · 양피지 문제지 · 청록 대화창 · 보라 보상창 (글자 없음) | 창 배경 |

## 배치 순서 (모닥불 화면, 제공 묶음 권장)
배경 → 뒤쪽 나무 → 던전 입구 → 캐릭터 → 모닥불 → 앞쪽 나무 → UI. 정수 좌표 + `image-rendering: pixelated`. AI 생성이라 칸 안 여백이 조금씩 다를 수 있어 실제 화면에서 위치를 맞춘다.

## 받은 묶음 메모
- `forest-camp-anvil-kit/assets/dungeon-gates.webp` 는 **빈 파일(0바이트)** 이어서 원본 PNG 에서 새로 만들었다.
- `citadel-assets` 묶음은 지금 쓰는 그림의 원본·백업 (heroes·monsters webp 는 저장소 것이 따로 다시 변환한 판).
