# Cloudflare 배포 (무료 플랜, 한 번만 설정)

GitHub에 푸시하면 Cloudflare가 자동으로 받아 배포한다. 복붙·재배포 없음.

## 선생님이 직접 할 일 (약 10분, PC 권장)
| 단계 | 할 일 |
|---|---|
| 1 | https://dash.cloudflare.com 무료 가입 (결제 수단 등록 불필요) |
| 2 | **Workers & Pages → Create → Pages → Connect to Git** → GitHub 승인 → 저장소 `Citadel-MATH` 선택 (비공개 저장소 가능) |
| 3 | 설정: Production branch `main` · Framework preset **None** · Build command **비움** · Build output directory **`public`** → Save and Deploy |
| 4 | **Storage & Databases → D1 → Create** → 이름 `citadel-math-db` |
| 5 | Pages 프로젝트 → **Settings → Bindings → Add → D1 database** → Variable name **`DB`**, 데이터베이스 `citadel-math-db` (Production·Preview 둘 다) |
| 6 | **Deployments → 최신 배포 ⋯ → Retry deployment** (바인딩은 다음 배포부터 적용) |
| 7 | 운영 주소(`https://<프로젝트이름>.pages.dev`)를 Claude에게 알려 주기 |

## 확인
- `https://<주소>/api/health` → `"ok":true`, `"version"`, `"db":{"bound":true,...,"got":"007"}`
- Claude가 `node tests/smoke.test.js https://<주소>` 로 검사한다.

## 주소 규칙
| 브랜치 | 주소 |
|---|---|
| `main` | `https://<프로젝트>.pages.dev` (운영, 학생용) |
| 그 밖의 브랜치 | `https://<브랜치이름>.<프로젝트>.pages.dev` (미리보기, 학생 화면에 영향 없음) |

## 비밀값
- 교사 암호 등은 저장소에 넣지 않는다. 필요해지면 Pages → Settings → Variables and Secrets 에 **Secret** 으로 넣는다(추후 단계에서 안내).
