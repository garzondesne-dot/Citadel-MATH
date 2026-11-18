import json
from wslib import v
def keybox(n, one=False):
    d = json.load(open(f'/home/user/hv2/docs/handoff/design/entry-keys/keys-{n}.json', encoding='utf8'))
    C = '①②③④⑤'
    rows = ''
    for i, k in enumerate(d['keys']):
        q = k['vers'][0]
        use = k['help'].split('·')[-1].strip().replace('이 열쇠는 ', '').replace('에서 써요.', '')
        ch = ' &nbsp; '.join(f'{C[j]} {v(c)}' for j, c in enumerate(q['ch']))
        rows += (f'<div class="kq"><b>🔑{i+1} {k["name"]}</b> <span class="kg"> · {use}</span><br>'
                 f'{v(q["q"])}<div class="kc">{ch} &nbsp;&nbsp; 답 ( &nbsp;&nbsp;&nbsp; )</div></div>')
    return (f'<div class="keys"><div class="kt">🔑 입장 열쇠 <span class="mini">대기실에서 먼저 · 중학교 복습</span></div><div class="kr{" one" if one else ""}">{rows}</div></div>')
KCSS = '''
.keys { border:1.4px solid #b8860b; background:#fffaf0; border-radius:2mm; padding:1.2mm 2.2mm; margin:0 0 2mm 0; font-size:8.3pt; line-height:1.4; }
.keys .kt { font-weight:700; color:#7a5a00; margin-bottom:0.6mm; }
.keys .kr { display:grid; grid-template-columns:1fr 1fr 1fr; gap:2mm; }
.keys .kq { border-left:1px dashed #d9c7a0; padding:0 0 0 2mm; } .keys .kq:first-child { border-left:none; padding-left:0; }
.keys .kr.one { grid-template-columns:1fr; gap:0.8mm; } .keys .kr.one .kq { border-left:none; padding-left:0; border-top:1px dashed #d9c7a0; padding-top:0.6mm; }
.keys .kg { font-size:7.8pt; color:#8a7a5a; font-weight:400; }
.keys .kc { margin-top:0.3mm; }
'''
