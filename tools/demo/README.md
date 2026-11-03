# tools/demo — 🎮 한 파일 체험판 (2026-11-03)

동료 교사 홍보용: 다른 과목 · 다른 단원 한 차시를 **학생 폰 화면 하나짜리 HTML 파일**로 만든다. 더블클릭하면 인터넷 없이 열리고, 가상 친구 6명과 레이드 한 판(기록 없음).

| 재료 | 내용 |
|---|---|
| 차시 파일 | `lessons/set-0N.js` 와 같은 형식 (`DS.Lessons.register`, 몬스터 `make(attempt, rng)`, 보스 세트 1·2). 형식은 choice · ox · multi 가 가장 무난 |
| 개념 카드 | 단계 id 이름의 그림 (`intro.webp`, `c1.webp` …) — 폰 개념 설명 화면에 크게 뜬다 (720px 폭 권장) |
| 그림 목록 | `record` 가 한 바퀴 돌며 실제로 불러온 `assets/` 파일만 모음 (보통 12개 · 약 5MB) |

```bash
python3 -m http.server 8765        # 저장소 폴더에서 (record 용)
node tools/demo/pack.js record <차시.js> <카드 폴더> <그림목록.json>
node tools/demo/pack.js build  <차시.js> <카드 폴더> <그림목록.json> <출력.html> "제목"
```

- 체험판 모드 = `DS.DEMO` (app.js `demoBoot` → `DS.Test.start(…, { demo: true, prep })`): 서버(`DS.FIREBASE = null`) · 로그인 · 모닥불 없이 바로 던전 대기실, 끝나면 「처음부터 다시 하기」
- 다른 과목 · 교과서 기반 차시 내용과 카드는 **저장소에 넣지 않는다** (스크래치 · 드라이브에만). 교과서 사진은 카드에 넣지 않고 문장 · 그림을 새로 만든다
- 첫 체험판: 통합과학2 Ⅱ-1 「생물과 환경」(미래엔 72~75쪽) → 드라이브 PPT 폴더 `체험판_통합과학2_생물과환경.html` (7MB)
