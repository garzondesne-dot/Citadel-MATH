# tools/auto — 차시 자동화 (v0.9.6)

열쇠는 **클라우드 환경 설정(비밀 값)** 에만 둔다. 저장소 · 채팅 · 로그에 쓰지 않는다.

| 환경 변수 | 내용 | 만드는 법 |
|---|---|---|
| `GDRIVE_RCLONE_TOKEN` | rclone 의 `token = {…}` JSON (refresh_token) | PC 에서 `rclone config` → drive · scope 1 → `rclone config show gdrive` |
| `FIREBASE_SA_JSON` | Firebase 서비스 계정 키 JSON | 콘솔 → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 |
| Allowed domains | `citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app` | 환경 설정 → Network access |

| 도구 | 하는 일 |
|---|---|
| `google.js` | 열쇠 → 접근 토큰 (드라이브: rclone 공개 앱 ID 로 refresh · Firebase: 서비스 계정 JWT) |
| `gdrive.js` | `check` 연결 확인 · `up <파일> <폴더id> [이름]` (같은 이름이면 새 판으로 덮어써 링크 유지) · `down <id> <경로>` · `ls <폴더id>` |
| `fbprep.js` | `<차시 id> <레이드용 PDF> [--dry]` → 수업 준비 「PDF 한 번에 넣기」와 같은 코드로 칸을 잘라 Firebase `prep/{차시}/img · has` 에 씀 (먼저 `python3 -m http.server 8765`) |

드라이브 폴더 id: 01 학습지 `1fFTvDkoQiyHOK5bzKAfzSPMWEVKVdkgp` · 02 레이드학습지 `1gcvXDs8FQETGkNZJrI2WlHJ3x8Jdzs0W` · 05 모션그래픽 `1wCaC9DlV8rofxd6uNYWdkIrRKrBAaBsT` · 07 에셋 원본 `1k3kOFsn8y1hmnTyBvGRZXt0HaV46kcXO` · 99 지난판 `1WZJ1FO-Kbql1jBjEWmrlvMM0j8KHdx0F`
