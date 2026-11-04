# 📘 교사용 사용설명서 (동료 교사 배포용 PDF)

- 원고: `manual.html` (13장 + 부록 · 그림 태그 `<img data-s="e11/01-teacher.png">` = 스크린샷 폴더 안 경로, `repo:` 는 저장소 파일)
- 스크린샷: 체험 모드(`?local` · 가상 학생)에서 `tools/e2e` 시험이 찍은 것 + `cap-login.js`(학생 로그인 · 가입 · 명단). 실제 학생 이름 · 학교 정보 없음
- 만들기:

```
python3 -m http.server 8765 &
S=/tmp/manual-shots; for n in 11 18 20 24 27 29 31 32 33 36 37 38 40 42 43 44 45 48 49 50; do mkdir -p $S/e$n; node tools/e2e/e2e$n.js $S/e$n; done
mkdir -p $S/x && node tools/manual/cap-login.js $S/x
node tools/manual/build.js $S 모두의던전_교사용_사용설명서.pdf
```
- 그림은 폭 1300px · JPEG 82 로 줄이고 너무 긴 세로 화면은 위쪽만(가로 × 2.3). 기능이 바뀌면 시험을 다시 돌려 그대로 다시 만든다.
