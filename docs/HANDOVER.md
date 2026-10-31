# Citadel-MATH 인계 문서

## 한눈에
| 항목 | 내용 |
|---|---|
| 목표 | 고1 공통수학2 집합·포함 관계 협동 수업 도구 (학생 폰 · 교사 · PC 공개 화면) |
| 단계 | **개발 순서 2~3단계**: 최소 화면 + 상태 확인 API 완성, Cloudflare 연결 대기 |
| 버전 | `0.0.1` (`public/version.js`) |
| 기술 | Cloudflare Pages + Functions + D1 (무료), 빌드 도구 없음 |
| 이전 프로젝트 | DIMENSION SLASHER 복사본은 2026-10-31 삭제. 기록은 `docs/origin/`(참고용), 코드는 git 커밋 `ce9798c` |

## 진행 현황
| 항목 | 상태 |
|---|---|
| 최소 화면 3개 (학생·교사·공개) + `/api/health` | ✅ 구현 |
| 로컬 Cloudflare(wrangler + D1)에서 smoke 테스트 | ✅ 통과 (버전 일치, '007' 문자열 왕복, 재초기화, 화면 4개), 폰 폭 390px 콘솔 오류 0 |
| Cloudflare Pages 실제 배포 | ⏳ 선생님 계정 연결 대기 (`docs/deploy-cloudflare.md`) |
| 푸시 → 같은 주소 자동 반영 검증 | ⏳ 배포 후 버전 0.0.1 → 0.0.2 로 확인 예정 |
| 실기기(폰) 확인 | ⏳ |

## 파일 구조
| 파일 | 역할 |
|---|---|
| `public/index.html`, `teacher.html`, `screen.html` | 학생 · 교사 · 공개 화면 (지금은 자리만) |
| `public/version.js` | 버전 (화면·서버 공용) |
| `public/common.js`, `app.css`, `_headers` | 공통 상태 표시, 스타일, 캐시(no-cache) |
| `functions/api/health.js` | `GET /api/health`: 버전 + D1 연결·문자열 왕복 확인 |
| `functions/_lib/db.js` | D1 스키마(IF NOT EXISTS, 재실행 안전) |
| `tests/smoke.test.js` | 실제 서버 대상 검사 (로컬·배포 주소) |
