# 코덱스 다리 (Codex bridge) · 🎨 에셋 방 2 · 2026-11-24 KST
# 선생님 PC 에서 켜 두는 감시 프로그램(표준 라이브러리만 씀).
# 클라우드 에셋 방이 구글 드라이브 「코덱스 주문함」에 주문(.json)을 넣으면
#  → 이 PC 의 코덱스(GPT 구독)로 그림을 만들고 → 「코덱스 받은편지함」에 그림 · 기록을 저장한다.
# 주문 파일 꼴: {"id": "mg-o-alk-board-1", "prompt": "…주문 글…", "name": "alk-board-codex-1.png"}
import json, os, shutil, string, subprocess, sys, time, traceback
from datetime import datetime
from pathlib import Path

SUB = Path("내 드라이브") / "모두의 던전 에셋 원본 (비공개)"
REPO = Path.home() / "Documents" / "citadel-MATH"
OUT_DIR = Path("docs") / "handoff" / "assets" / "codex-out"   # 저장소 안(코덱스가 쓸 수 있는 곳)
WAIT = 20  # 초마다 주문함 확인

def find_root():
    for d in string.ascii_uppercase:
        p = Path(f"{d}:\\") / SUB
        if p.exists():
            return p
    sys.exit("구글 드라이브 「모두의 던전 에셋 원본 (비공개)」 폴더를 못 찾았어요. Google Drive 앱이 켜져 있는지 확인하세요.")

ROOT = find_root()
ORDERS, INBOX = ROOT / "코덱스 주문함", ROOT / "코덱스 받은편지함"
DONE = ORDERS / "끝난 주문"
for p in (ORDERS, INBOX, DONE, REPO / OUT_DIR):
    p.mkdir(parents=True, exist_ok=True)

def log(msg):
    line = f"[{datetime.now():%m-%d %H:%M:%S}] {msg}"
    print(line, flush=True)
    with open(INBOX / "_다리기록.txt", "a", encoding="utf-8") as f:
        f.write(line + "\n")

def run_codex(prompt):
    tries = [["exec", "--full-auto", "--skip-git-repo-check", "-"],
             ["exec", "--sandbox", "workspace-write", "--skip-git-repo-check", "-"],
             ["exec", "-"]]
    r = None
    for args in tries:
        r = subprocess.run(["cmd", "/c", "codex", *args], cwd=REPO, input=prompt, text=True,
                           encoding="utf-8", errors="replace", capture_output=True, timeout=1200)
        bad = "unexpected argument" in (r.stderr or "") or "unrecognized" in (r.stderr or "")
        if not bad:
            return r, args
    return r, args

def handle(f):
    order = json.loads(f.read_text(encoding="utf-8"))
    oid = order.get("id") or f.stem
    name = order.get("name") or f"{oid}.png"
    target = OUT_DIR / name
    prompt = (order["prompt"].strip() +
              f"\n\n---\n그림 생성 도구로 그림 1장을 만들고, 최종 PNG 를 이 작업 폴더 안의 `{target.as_posix()}` 에 저장해. "
              "다른 파일은 만들거나 고치지 마. 끝나면 저장한 경로 한 줄만 말해.")
    log(f"주문 시작: {oid}")
    t0 = time.time()
    r, args = run_codex(prompt)
    (INBOX / f"{oid}.log.txt").write_text(f"명령: codex {' '.join(args)}\n종료 코드: {r.returncode}\n\n[출력]\n{r.stdout}\n\n[오류]\n{r.stderr}", encoding="utf-8")
    src = REPO / target
    if src.exists():
        shutil.copy2(src, INBOX / name)
        log(f"완료: {oid} → 받은편지함/{name} ({time.time()-t0:.0f}초)")
    else:
        log(f"그림 없음: {oid} (기록 {oid}.log.txt 확인)")
    shutil.move(str(f), str(DONE / f.name))

log(f"코덱스 다리 시작 · 주문함 = {ORDERS}")
while True:
    try:
        for f in sorted(ORDERS.glob("*.json")):
            try:
                handle(f)
            except Exception:
                log("오류: " + f.name + "\n" + traceback.format_exc())
                shutil.move(str(f), str(DONE / (f.name + ".error")))
    except Exception:
        log("감시 오류\n" + traceback.format_exc())
    time.sleep(WAIT)
