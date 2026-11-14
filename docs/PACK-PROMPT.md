[역할] 고등학교 1학년 수학 「차시 팩」 JSON 을 만든다. JSON 한 덩어리만 출력하고, 맨 뒤에 검산 표를 붙인다.

[규칙]
1. 학습지 문제 · 보기 · 정답 · 숫자를 그대로 쓴다.
2. 문항 = {"type","q","a","ch","sol"} 다섯 칸 모두. a 는 늘 글자. 보기 없으면 "ch": [].
3. choice · multi 의 a = 보기 번호(0부터) "1" · "0,2". 보기 글자 금지.
4. theme · sprite 는 아래 도감 ID 만. 몬스터 그림을 모르면 "base0:0". 빈 칸 금지.
5. boss.items · boss.hpItems 는 숫자(목록 아님). items = 그 차시 버전 0 형성평가 문항 수(직접 센다). tags 개수 = items(문항마다 묻는 개념 칸 id).
6. 계산으로 확인 못 하는 문항은 검산 표에 「눈으로 확인」.

[도감] theme: 01-burrow · 02-deep-forest · 04-mine · 05-ruins · 06-frost · 07-volcano · 11-keyvault · 12-skygarden
sprite(뒤에 :0): base0(기본) base1 base2 · garden0~garden4 · gardenboss0 · keyvault0~keyvault4 · keyvaultboss0 · mirror0~mirror4 · mirrorboss80 · crown0~crown9 · new0~new9 · extra0~extra4 · extra6~extra9

[틀]
{
  "id": "ex-11", "no": 11, "title": "차시 이름", "unit": "단원", "goal": "목표 한 줄",
  "theme": "12-skygarden",
  "steps": [
    {"kind": "intro", "id": "intro", "title": "도입", "img": "review", "say": "말할 거리"},
    {"kind": "concept", "id": "c1", "title": "개념 1", "say": "…"},
    {"kind": "monster", "id": "m1", "title": "문제 1"},
    {"kind": "monster", "id": "m2", "title": "문제 2"},
    {"kind": "boss", "id": "sum", "title": "형성평가"}
  ],
  "mons": {
    "m1": {"title": "문제 1", "sprite": "garden4:0", "vers": [[ {"type": "text", "q": "…", "a": "…", "ch": [], "sol": "…"} ]]},
    "m2": {"title": "문제 2", "sprite": "base0:0", "vers": [[ {"type": "multi", "q": "…", "a": "0,2", "ch": ["ㄱ. …", "ㄴ. …", "ㄷ. …"], "sol": "…"} ]]}
  },
  "boss": {
    "title": "형성평가", "sprite": "gardenboss0:0",
    "items": 3, "hpItems": 3, "tags": ["c1", "c1", "c1"],
    "vers": [[ {"type": "blanks", "q": "…", "a": "…", "ch": [], "sol": "…"}, {"type": "choice", "q": "…", "a": "1", "ch": ["①", "②", "③", "④"], "sol": "…"}, {"type": "ox", "q": "…", "a": "O", "ch": [], "sol": "…"} ]]
  },
  "img": [], "video": [], "pct": 100
}

[출력 전 검사]
① boss.items = 버전 0 형성평가 문항 수 = tags 개수
② 1 ≤ hpItems ≤ items (둘 다 숫자)
③ theme · 모든 sprite 가 도감에 있고 빈 칸 없음
④ steps 의 monster id 마다 mons 항목 · tags 값은 concept id
⑤ choice · multi 의 a 가 보기 번호 범위 안

[검산 표] | 문항 | 정답 | 계산 한 줄 | ✅ / 눈으로 확인 |
