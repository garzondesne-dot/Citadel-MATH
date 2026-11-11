#!/usr/bin/env bash
# 🧪 「배포」 전 시험 전부 한 번 (#89 · 2026-11-11): tests/*.test.js 모두 · 단 디펜스 균형 시험(td.test.js · 약 1~10분)은
#   지난 배포(origin/main) 뒤 TD_FILES 중 하나가 바뀐 때만 (셋 다 그대로면 「디펜스 균형 시험 건너뜀(관련 파일 그대로)」 → 배포 보고에 한 줄)
#   bash tools/test-all.sh        (저장소 맨 위에서)
cd "$(dirname "$0")/.." || exit 1
TD_FILES="js/engine/fx.js js/raid/td-maps.js js/raid/td.js"   # td.test.js 가 불러오는 파일 (늘면 여기에)
git fetch -q origin main 2>/dev/null
fail=0
for t in tests/*.test.js; do
  if [ "$t" = tests/td.test.js ] && git diff --quiet origin/main -- $TD_FILES; then echo "⏭ 디펜스 균형 시험 건너뜀(관련 파일 그대로)"; continue; fi
  if out=$(node "$t" 2>&1); then echo "✔ $t"; else echo "✘ $t"; echo "$out" | tail -5; fail=1; fi
done
exit $fail
