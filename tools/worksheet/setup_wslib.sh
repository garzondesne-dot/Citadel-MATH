#!/usr/bin/env bash
# 학습지 조판 준비 (math-lesson-designer 스킬 · wslib.py) — 클라우드 세션은 매번 새 컨테이너라 세션마다 한 번 실행
#   한글 Noto Sans CJK KR · 수식 DejaVu Serif 이탤릭 · 파이썬 playwright(이미 깔린 Chromium 1.63 을 씀)
set -e
fc-list | grep -q "Noto Sans CJK KR" && fc-list | grep -q "DejaVu Serif:style=Italic" || { apt-get install -y fonts-noto-cjk fonts-dejavu-extra >/dev/null 2>&1 || (apt-get update >/dev/null 2>&1 && apt-get install -y fonts-noto-cjk fonts-dejavu-extra >/dev/null 2>&1); fc-cache -f >/dev/null; }
python3 -c "import playwright" 2>/dev/null || pip install -q "playwright==$(node -e "console.log(require('playwright/package.json').version)")" 2>/dev/null
echo "export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers  # 파이썬 playwright 가 이미 깔린 브라우저를 쓰게"
fc-list | grep -E "Noto Sans CJK KR|DejaVu Serif:style=Italic" | head -2
