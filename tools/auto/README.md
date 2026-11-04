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

## 모션그래픽 방에서 쓰기 (2026-11-03)
같은 클라우드 환경의 다른 방(저장소 없음)도 열쇠는 있으므로 두 파일만 받아 쓴다:

```bash
mkdir -p /home/user/dtools && cd /home/user/dtools && for f in google gdrive; do curl -fsSL -o $f.js https://raw.githubusercontent.com/garzondesne-dot/Citadel-MATH/main/tools/auto/$f.js; done
node gdrive.js check && node gdrive.js swap 03 /path/"(03차시) 22_부분집합.mp4" … --dry
```
`google.js` · `gdrive.js` 는 Node 기본 모듈만 쓴다(설치 없음). 이 두 파일이 다른 파일을 require 하게 바꾸지 말 것.

## 🔄 comci.js — 컴시간 → 교사 시간표 (v0.9.7.1)
- GitHub Actions `.github/workflows/comci.yml` 가 매일 06:00 KST 에 돌림 (「Run workflow」 버튼으로도). 비밀 값: `FIREBASE_SA_JSON` · `COMCI_SCHOOL` · `COMCI_TEACHER` (저장소에 넣지 않음).
- 결과 = Firebase `sched/comci` { ok, week: { '요일-교시': '학년-반' }, err } · 수학 칸만. 게임 반영은 `sched/comciOn = true` 일 때만 (실제 자료로 읽는 방식을 확인한 뒤 켬). 수동 칸이 우선, `'-'` = 수동으로 비움.
- 클라우드 작업 공간은 https 만 나갈 수 있어 컴시간(http · 4082 포트)을 직접 못 읽는다 → 첫 실행은 `--raw` 로 원본을 `sched/comci/raw` 에 저장해 확인한 뒤 지운다.
