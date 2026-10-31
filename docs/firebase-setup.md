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

## ⚠ v0.5.0 배포 때 규칙 다시 게시
Realtime Database → 규칙 → `firebase/database.rules.json` 전체를 붙여 넣고 **게시**. 새로 생긴 경로:

| 경로 | 쓰기 |
|---|---|
| `rooms/{코드}/online/{uid}` | 본인 (접속 표시 · 연결이 끊기면 서버가 지움) |
| `rooms/{코드}/words/{uid}` | 참여 학생 본인 (한마디 20자, 고치기 1번까지) |
| `rooms/{코드}/hide/{uid}` | 교사 · 종합상황실 (말풍선 숨김) |
| `unlock/{반}` | 교사 계정 (차시 배포 → 모루 열림, 1~30) |
| `cards/{반}/{번호}/{카드}` | 그 반·번호 계정 본인 (만든 카드) |
| `wordLock` | 교사 계정 (다음 차시에도 한마디 잠금) |

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

> **v0.3.0 (계정) 준비 — 콘솔에서 두 가지:**
> 1. Authentication → 로그인 방법(Sign-in method) → **이메일/비밀번호** 사용 설정 (익명 로그인은 그대로 켜 둠)
> 2. Realtime Database → 규칙 → `firebase/database.rules.json` 새로 붙여 넣고 **게시**
> 그다음 앱 첫 화면 → 수업 준비(또는 교사 폰) → **교사 계정 만들기**를 학생보다 먼저 한 번. 교사 계정은 처음 한 명만 만들 수 있다.
>
> | 경로 | 쓰기 |
> |---|---|
> | `admins/{uid}` | 교사 계정 — 아직 아무도 없을 때 한 번만 |
> | `roster/{반}/{번호}` (이름) | 교사만. 읽기는 로그인한 계정만 (익명은 못 읽음) |
> | `rosterMask/{반}/{번호}` (가린 이름) | 교사만. 로그인 전 확인용으로 누구나 읽음 |
> | `accounts/{반}/{번호}` | 교사(초기화) 또는 본인 — 처음 가입 · 초기화된 뒤 · 본인 용사 바꾸기 |
> | `rooms/{코드}` 새로 만들기 · `prep/` · `secrets` 읽기 | 교사 계정만 |
>
> **v0.2.0 배포 뒤 규칙을 다시 게시해야 한다.** 규칙 탭에 `firebase/database.rules.json` 내용을 새로 붙여 넣고 **게시**. 안 하면 실시간 모드에서 학생 제출·이미지 올리기가 거절된다.
