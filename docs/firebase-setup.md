# Firebase 설정 (약 10분, 한 번만)

Firebase 를 연결하면 학생 폰·교사 폰·종합상황실이 인터넷으로 **즉시** 연결된다. 설정 전에는 '이 기기 체험 모드'(같은 브라우저 탭끼리만)로 동작한다.
무료 요금제(Spark)로 충분하다: 동시 접속 100, 저장 1GB, 하루 전송 10GB — 한 반 30명 수업은 여유롭다.

| 순서 | 할 일 |
|---|---|
| 1 | https://console.firebase.google.com → **프로젝트 추가** → 이름 `citadel-math` → Google 애널리틱스 **끄기** → 만들기 |
| 2 | 왼쪽 **빌드 → Authentication** → 시작하기 → 로그인 방법 → **익명** → 사용 설정 → 저장 |
| 3 | 왼쪽 **빌드 → Realtime Database** → 데이터베이스 만들기 → 위치 **싱가포르(asia-southeast1)** → **잠금 모드**로 시작 |
| 4 | Realtime Database 의 **규칙** 탭 → 내용을 모두 지우고 `firebase/database.rules.json` 내용을 붙여 넣기 → **게시** |
| 5 | 톱니바퀴 **프로젝트 설정 → 일반 → 내 앱** → 웹 `</>` → 앱 닉네임 `citadel` → 앱 등록 (Hosting 체크 안 함) |
| 6 | 화면의 `const firebaseConfig = { … }` 부분을 복사해서 Claude 에게 붙여 넣기 → `js/config.js` 에 넣고 푸시해 줌 |
| 7 | (GitHub Pages) 저장소 Settings → Pages → Branch `main` / `/ (root)` → Save |

- `firebaseConfig`(apiKey 등)는 비밀번호가 아니라 웹 페이지에 공개되는 값이다. 데이터는 4번 보안 규칙이 지킨다.
- `databaseURL` 줄이 꼭 있어야 한다 (3번을 먼저 하면 생긴다).
- 익명 로그인이 막히면: Authentication → 설정 → 승인된 도메인에 `garzondesne-dot.github.io` 추가.

## 보안 규칙 요약 (`firebase/database.rules.json`)
| 경로 | 쓰기 |
|---|---|
| `secrets/{코드}` (종합상황실 키) | 수업을 만든 교사만, 한 번. **아무도 못 읽음** |
| `rooms/{코드}` 새로 만들기 | 교사(자기 uid 를 meta.teacher 로) |
| `hosts/{uid}` | 본인이 키를 맞게 넣었을 때만 → 종합상황실 권한 |
| `state` · `active` | 교사·종합상황실만 (단계 ◀▶ · 기준% · 미제출 제외) |
| `players` | 본인만 |
| `help` | 본인 또는 교사 기기 |
| `subs/{몬스터}/{uid}/{시도 0~2}` | 참여 학생 본인만, 시도마다 한 번 (v0.2.0) |
| `bossAns/{uid}/{세트 1·2}` | 참여 학생 본인만 |
| `prep/{차시}` (수업 준비: 학습지 이미지 · 기준%) | 로그인한 누구나 (⚠ 계정 도입 전 임시. 2단계에서 교사만으로 좁힘) |

> **v0.2.0 배포 뒤 규칙을 다시 게시해야 한다.** 규칙 탭에 `firebase/database.rules.json` 내용을 새로 붙여 넣고 **게시**. 안 하면 실시간 모드에서 학생 제출·이미지 올리기가 거절된다.
