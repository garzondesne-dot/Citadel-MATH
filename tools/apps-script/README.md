# tools/apps-script — 📷 서술형 사진 채점 중계소 (초안)

| 파일 | 내용 |
|---|---|
| `photo-grade.gs` | Google Apps Script 웹 앱: Firebase 로그인 확인 → 하루 장 수 → Claude Haiku 5.5 → 결과 글자만 `photo/` 저장 (사진 저장 ✗) · `checkSetup()` 설정 확인 |
| `appsscript.json` | 매니페스트 (서울 시간 · 외부 요청 · Firebase · 웹 앱 = 나로 실행 · 모든 사용자) |
| `rubrics.draft.json` | 서술형 7문항 채점 기준표 초안 → 확정 뒤 Firebase `photo_rubric/` |

- 설치 · 구조 · 결정할 것: `docs/PHOTO-PREP.md`
- 모의 시험 (구글 · Firebase · Claude 를 가짜로 · 돈 안 듦): `node tests/photo-gs.test.js`
- **API 키는 Apps Script 「스크립트 속성」에만.** 이 폴더 · 저장소 · 대화에 키를 쓰지 않는다.
