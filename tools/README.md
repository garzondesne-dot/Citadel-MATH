# tools — 수업 자료 제작 도구 (게임 앱과 별개, 배포에 영향 없음)

새 대화(작업 공간)로 옮겨도 같은 스타일로 이어 만들 수 있게 저장소에 둔다 (2026-11-02, v0.9.4).
모두 Playwright(Chromium) + ffmpeg 로 돌아간다. 이 클라우드 작업 공간에는 둘 다 설치되어 있다.

## motion/ — 개념 모션그래픽 (스킬 「math-motion-graphics」 지침 · 다크 네온 테마)

| 파일 | 하는 일 |
|---|---|
| `lib.js` | 공통 엔진: 이징 · 스프링 · 글로우 · 키네틱 타이포 · 벤 다이어그램 원 그리기 · 원소 공 · 결과 상자 · 반짝이 · 링 · 화살표 · 요약 카드 · 와이프 · 카메라 줌 펀치 · 수식 글자(A B C U x n 이탤릭, `^C` 위 첨자) |
| `index.html` | 배경(남색 그라디언트 · 점 격자 · 비네팅) + `scenes/v{번호}.js` 를 불러 `render(t)` |
| `scenes/v11~v17.js` | 장면 콘티 (5차시 11~14 · 3차시 15~17). 새 영상 = 이 파일 하나 복사해서 `window.SCENE = { D, punch, draw(t) }` 만 바꾸면 된다 |
| `shot.js` | 컨택트 시트: `node tools/motion/shot.js 15 2,6,9,14,20` → `out/sheet-15.png` (전체 렌더 전에 겹침 · 잘림 · 글자 크기 확인) |
| `render720.js` | **기본 렌더**: `CRF=28 node tools/motion/render720.js 15 "(03차시) 15_이름.mp4"` → `out720/` · 1280×720 · 30fps · 그레인 없음 · 편당 400~800KB |
| `render1080.js` | 1080p · CRF 18 (크다: 4~6MB. 쓰지 말 것 — 필름 그레인은 압축이 안 된다) |

- 색 의미 고정: A 시안 `#3ee6ff` · B 앰버 `#ffb547` · C 파랑 `#7f9cff` · 교집합/강조 마젠타 `#ff4fa3` · U 바이올렛 `#9b7bff` · 정답 민트 `#4dffb0` · 오류 코랄 `#ff6b6b`
- 예시 숫자는 그 차시 **학습지 문제와 같게** (영상 → 바로 학습지 문제로)
- 파일 이름: `(0n차시) 번호_개념_핵심문구.mp4`, 번호는 이어서 (다음 = 18). 올릴 곳: 드라이브 「학습지 > 공통수학2 > 05 모션그래픽」 → 「모션 첨부」

## worksheet/ — 레이드용 학습지 PDF (A4 2쪽 · 2단 · 게임 꼬리표)

| 파일 | 하는 일 |
|---|---|
| `gen_ws6v3.py` | ⭐ **기준 양식 (2026-11-05 · 사용자 PDF)** 6차시 레이드용 v3 · wslib 조판. **새 차시 = 이 파일을 복사해서 내용만 바꾼다.** `bash tools/worksheet/setup_wslib.sh` 뒤 `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/worksheet/gen_ws6v3.py <출력.pdf>` (단 아래끝 mm 출력) |
| `crops_pdf.py` | 완성 PDF 에서 칸 위치(crops) 재기 (글자 위치 · 같은 단 다음 칸 / ✏ 메모 / 🏰 까지): `python3 tools/worksheet/crops_pdf.py <pdf> '{"c1":"STEP 1","m1":"문제 1)","boss":"6차시 형성평가"}' --png <확인 폴더>` → 빨간 상자 그림으로 확인 뒤 차시 파일 `crops` 에 |
| `gen_ws5.py` 등 | 옛 양식(`style.css.txt`) 생성기 — 지난 차시 기록용 · 새 차시에는 쓰지 않음 |
| `pdf.js` | HTML → A4 PDF + 칸마다 남는 공간(음수 = 넘침) 출력: `node tools/worksheet/pdf.js <html 절대경로> <pdf 경로>` |
| `measure_crops.js` | (옛 양식 HTML 용) 개념 · 문제 칸 위치(crops) 재기: `node tools/worksheet/measure_crops.js <html> '{"c1":"STEP 1 ...","m1":"문제 1)"}'` → 차시 파일 `crops` 에 붙인다 |

- 꼬리표: `게임: 몬스터 n` · `게임: 보강던전 ①` · `게임: 보스` · 보강은 보라 상자 · 형성평가는 문항마다 풀이 공간 (사진용 답 칸 없음, 사용자 결정)
- 완성본은 드라이브 「학습지 > 공통수학2 > 02 레이드학습지」에 「(0n차시) 레이드용_vN.pdf」 이름으로 사용자가 올린다

## sprite/templates_v0911.js — v0.9.11 그림 템플릿

`node tools/sprite/templates_v0911.js` → `assets/templates/v0911/tpl-{punch,bat,chest,feather,arena}.png` (마젠타 칸 · 기준선 · 자리 표시). 프롬프트는 `docs/ASSET-SPEC.md` 6-7.

## qr/ — 수업 입장 QR (A4 한 장, 게임 느낌 없는 판)

`node tools/qr/mk.js <tools/qr 절대경로>` → `class-qr.html` 을 A4 PDF 로. `decode-check.js` 로 QR 이 학생 주소로 읽히는지 확인.

## apps-script/ — 📷 서술형 사진 채점 중계소 (초안)

Google Apps Script 웹 앱 `photo-grade.gs` · 매니페스트 · 채점 기준표 초안. 설치 · 결정할 것은 `docs/PHOTO-PREP.md`, 모의 시험은 `node tests/photo-gs.test.js`. API 키는 스크립트 속성에만.

## e2e/ — 브라우저 회귀 시험 (로컬 체험 모드)

먼저 저장소 폴더에서 `python3 -m http.server 8765` 를 띄운다. 그다음 `node tools/e2e/e2e11.js <출력 폴더>`.

| 파일 | 확인하는 것 |
|---|---|
| `e2e11.js` | 교사 폰 리모컨 시작 · 종합상황실 교사 캠프 시작 → 수업 시작 시 자동 전환 · 기회 4번 · 학급 결과 · 수업 끝 → 교사 캠프 |
| `e2e13.js` | 연습 공격 (다 맞힌 뒤 데미지 0 · 「이미 성공」) |
| `e2e14.js` | 5차시 테스트 모드 처음부터 끝까지 · 보강던전 ③ 그림 보기 |
| `e2e15.js` | 수업 준비 PDF → 칸 이미지 좌우 단 · 공격 자세 · 🎮 시연 → 소멸 (인자: 레이드용 학습지 PDF 경로) |
| `e2e71.js` | 📝 설문 수동 열기: 교사 메뉴 「📝 설문」 차시 10 → 반 열기 → 학생 📝 버튼 · 10차시 → 모든 반 열기/닫기 → 설문 내면 💎 10 |
| `e2e70.js` | 📷 서술형 사진 채점: 교사 설정 · 기준표 올리기 → 시범 방만 열림 → 숫자 답 → 📷 찍기 · 자르기 → 재도전 · 🙋 이의 신청 → 대시보드 ✔ 인정 → 처치 · 하루 다 씀 안내 · 통과 처치 · 보낸 사진 1024px JPEG (중계소는 가짜 응답) |
| `e2e59.js` | 👑 형성평가 문항마다 4번 · 재도전 = 숫자 바뀐 새 문제 · 기회를 다 쓰면 해설 · 시도별 저장 |
| `e2e58.js` | 종합상황실 비밀번호 고정 · 코드 없이 수업 찾기 · 다음 수업 자동 입장 · 교사 캠프(학생 캠프 그대로 · 모든 방) · 출석부 없음 |
| `e2e57.js` | v0.9.11 🦇 박쥐 → 🎁 상자 · ✨ 퍼펙트 · 🔥 콤보 10 · 👑 보스 2단계 · 🏁 반대항 경주(가까운 차시 레인) · 조각 보상 |
| `e2e16.js` · `e2e17.js` | 캠프 · 설정 · 교사 캠프 차원문 · 교사 말풍선 / 모루 한 화면 (390×844 · 360×640) |
