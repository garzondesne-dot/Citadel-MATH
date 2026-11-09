# 학습지 판을 바꿀 때 문제 · 숫자 · 형성평가 글자가 그대로인지 확인 (2026-11-09 #26 · 6 · 7차시 나누기 형평성)
#   python3 tools/worksheet/check_same_text.py <옛판.pdf> <새판.pdf> [새판2.pdf …] '<문장1>' '<문장2>' …
#   글자는 단(왼쪽 · 오른쪽)마다 블록 순서로 이어 붙이고 띄어쓰기를 지운 뒤, 문장이 옛판 · 새판 모두에 있는지 본다 (교사용 쪽은 빼고 넘길 것)
import re, subprocess, sys
def text(pdf):
    h = subprocess.run(['pdftotext', '-bbox-layout', pdf, '/dev/stdout'], capture_output=True, text=True).stdout
    out = []
    for pg in h.split('<page ')[1:]:
        for blk in re.finditer(r'<block xMin="[\d.]+"[^>]*>(.*?)</block>', pg, re.S):
            out.append(re.sub(r'\s+', '', ' '.join(re.findall(r'>([^<]*)</word>', blk.group(1)))))
    return ''.join(out)
pdfs = [a for a in sys.argv[1:] if a.endswith('.pdf')]; stems = [re.sub(r'\s+', '', a) for a in sys.argv[1:] if not a.endswith('.pdf')]
old, new = text(pdfs[0]), ''.join(text(p) for p in pdfs[1:]); bad = 0
for s in stems:
    ok = s in old and s in new; bad += not ok
    print('같음' if ok else ('옛판에 없음' if s not in old else '새판에 없음!'), '|', s[:40])
sys.exit(1 if bad else 0)
