#!/bin/bash
# 📦 저작권 등록용 엔진 소스 묶음 (2026-11-04): 교과서 기반 차시 · AI 그림 · 영상 · 외부 라이브러리 · 글꼴을 뺀 엔진만 + 예시 차시
#   bash tools/registration/bundle.sh <출력 폴더>  → 모두의던전_엔진소스_v<판>.zip · 파일 목록 · 줄 수
set -e
OUT=${1:?출력 폴더}; ROOT=$(cd "$(dirname "$0")/../.." && pwd); V=$(sed -n "s/.*VERSION = 'citadel-\([0-9.]*\)'.*/\1/p" "$ROOT/js/config.js" | head -1)
B="$OUT/모두의던전_엔진소스_v$V"; rm -rf "$B"; mkdir -p "$B"
cd "$ROOT"
INC="index.html privacy.html manifest.webmanifest sw.js css js assets/manifest.js firebase/database.rules.json lessons/curriculum.js lessons/unit-set.js"
for p in $INC; do mkdir -p "$B/$(dirname $p)"; cp -r "$p" "$B/$p"; done
rm -f "$B/js/engine/qrcode.min.js" "$B/js/engine/LICENSE-qrcodejs.txt"   # 외부 라이브러리 (MIT) — 제외 목록에 적음
mkdir -p "$B/lessons" && cp tools/registration/sample-lesson.js "$B/lessons/sample-01.js"
mkdir -p "$B/tests" && cp tests/load.js tests/model.test.js tests/save.test.js tests/fun.test.js tests/note.test.js tests/grow.test.js tests/pwa.test.js tests/sched.test.js tests/hint.test.js "$B/tests/" 2>/dev/null || true
# index.html: 교과서 기반 차시 스크립트 → 예시 차시 하나로
python3 - "$B/index.html" <<'PY'
import sys,re
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
s=re.sub(r'<script src="lessons/(set-\d+|eval-\d+)\.js"></script>\s*','',s)
s=s.replace('<script src="lessons/curriculum.js"></script>','<script src="lessons/sample-01.js"></script><script src="lessons/curriculum.js"></script>',1)
open(p,'w',encoding='utf-8').write(s)
PY
cat > "$B/README-등록용.txt" <<TXT
모두의 던전 — 학습지 입력형 교실 협동 레이드 수업 플랫폼 (엔진 소스 v$V)
저작자: 김찬우 · 이 묶음은 저작권 등록 신청용 복제물입니다.

[포함] 프로그램 엔진 전체(js · css · html · 서비스 워커 · 데이터베이스 규칙 · 배치표), 직접 작성한 문구 · 놀이 질문 · OX 문장 · 카드 조합표 · 오개념 분류, 자체 시험 코드, 예시 차시 1개(lessons/sample-01.js, 등록용으로 새로 지은 문항)
[제외] 특정 교과서 · 학습지를 바탕으로 한 실제 수업 차시(lessons/set-02~06 · eval-1), 그림 파일(생성형 AI 산출물), 영상, 글꼴(Galmuri · OFL), QR 라이브러리(qrcode.js · MIT)
[실행] 정적 웹 서버로 index.html 을 열고 주소 끝에 ?local 을 붙이면 이 기기 체험 모드로 동작합니다 (그림 파일이 빠져 있어 화면 그림은 비어 보일 수 있음).
TXT
find "$B" -type f | sed "s#$B/##" | sort > "$OUT/파일목록.txt"
( cd "$B" && find . -name '*.js' -o -name '*.css' -o -name '*.html' | xargs wc -l | tail -1 ) > "$OUT/줄수.txt"
( cd "$OUT" && rm -f "$(basename $B).zip" && zip -qr "$(basename $B).zip" "$(basename $B)" )
echo "✅ $B.zip · 파일 $(wc -l < "$OUT/파일목록.txt")개 · $(cat "$OUT/줄수.txt")"
