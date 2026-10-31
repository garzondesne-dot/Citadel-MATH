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

## 2차 추가 (2026-10-31): 몬스터 · 던전 배경 · 포털
| 키 | 파일 | 배치 · 내용 | 쓰는 곳 |
|---|---|---|---|
| `monstersNew` | monsters-new-v1.webp (768×2560) | 3열 × 10행, 칸 256 정사각형 (흰 배경을 지우고 빈 줄로 잘라 다시 맞춤) · 수정 아홀로틀 · 선인장 수호수 · 등불 유령 · 번개 독수리 · 자수정 슬라임 · 해바라기 정령 · 흑요석 표범 · 용암 게 · 황금 스카라베 · 별빛 해파리 (이름은 그림 보고 붙임 — 바꿔도 됨) | **2차시 몬스터** (`sprite: 'new:번호'`) |
| `monstersExtra` | monsters-extra-v2.webp (768×2560) | 위 몬스터 10종을 같은 방식(정사각형 칸)으로 다시 맞춘 판 (v1 은 지움) | 2차 개발 |
| `dungeons` | dg-01-burrow … dg-10-sky -v1.webp | 던전 안 전투 배경 10종 (땅굴 · 깊은 숲 성역 · 차원 균열 · 폐광 · 고대 유적 · 빙결 동굴 · 화산 심연 · 지하 묘실 · 수중 신전 · 천공 성소). 차시 파일 `theme` 으로 고른다 | 2차시 = 02 깊은 숲, 3차시 = 05 고대 유적 |
| `dungeons.portal` | portal-01 … portal-10 -v1.webp | 같은 번호 포털, 2열: 활성 / 봉쇄 (크기 절반) | 3단계 모닥불 차원문 (차시 테마와 짝) |

- 던전 배경 묶음 zip 은 업로드가 끝에서 잘려 있었다. 웹용 배경 10장은 모두 살렸고, 잘린 것은 원본 PNG 몇 장뿐 (안 씀).
- 새 몬스터 시트 원본은 흰 배경 PNG — 배경을 투명하게 지움. 몸 안의 아주 밝은 회색이 일부 투명해졌을 수 있다 (실제 화면에서 이상하면 알려 주기).

## 배치 순서 (모닥불 화면, 제공 묶음 권장)
배경 → 뒤쪽 나무 → 던전 입구 → 캐릭터 → 모닥불 → 앞쪽 나무 → UI. 정수 좌표 + `image-rendering: pixelated`. AI 생성이라 칸 안 여백이 조금씩 다를 수 있어 실제 화면에서 위치를 맞춘다.

## 받은 묶음 메모
- `forest-camp-anvil-kit/assets/dungeon-gates.webp` 는 **빈 파일(0바이트)** 이어서 원본 PNG 에서 새로 만들었다.
- `citadel-assets` 묶음은 지금 쓰는 그림의 원본·백업 (heroes·monsters webp 는 저장소 것이 따로 다시 변환한 판).

## v0.5.0 에서 쓰기 시작한 것
| 파일 | 쓰임 |
|---|---|
| `camp-forest-v1` · `campfire-v1`(8프레임) · `gates-v1` · `camp-trees-v1` · `anvil-v1` | 모닥불 개인 대기실 |
| `card-frame-v1` · `card-arts-v1` | 기존 카드(`cards-v4`) 8장을 겹쳐 뽑은 공통 금테 + 무기·마법 그림 8칸 (배치표 `cardKit`) |
| `forge-anvil-v1` · `forge-hammer-v1` | 사용자 제공 sky-hammer-forge 의 위에서 본 모루 · 망치 (배치표 `forge`, 작업면 `face`) |
