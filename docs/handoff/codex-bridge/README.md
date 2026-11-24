# 🤖 코덱스 다리 (2026-11-24 KST · 🎨 에셋 방 2)

선생님 PC 의 코덱스(GPT 구독)를 클라우드 에셋 방이 드라이브로 부르는 길. Remote Control 폴더가 클라우드 방에 열리지 않아(윈도우 · 「not_available」) 대신 만듦.

```
에셋 방(클라우드) ──주문 .json──▶ 드라이브 「모두의 던전 에셋 원본 (비공개) › 코덱스 주문함」
                                        │ (Google Drive 앱이 PC 로 동기화)
선생님 PC watcher.py ── codex exec ──▶ 저장소 docs/handoff/assets/codex-out/<이름>.png
                     └─ 복사 ──────▶ 「코덱스 받은편지함」(그림 · <id>.log.txt · _다리기록.txt)
에셋 방 ◀── gdrive.js 로 받아 확인 · 배경 지우기 · 저장소 커밋
```

- 주문 꼴: `{"id": "...", "prompt": "작업대 카드 주문 글", "name": "파일이름.png"}`
- 끝난 주문 = 「코덱스 주문함 › 끝난 주문」 · 실패 = `.error` 이름
- 드라이브 문자는 스스로 찾음(선생님 PC = I:)
- PC 가 꺼져 있거나 watcher 가 안 돌면 주문은 쌓여 있다가 켜질 때 처리
