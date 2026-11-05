// v0.9.11 그림 템플릿 (사용자가 그림 AI 로 뽑을 때 붙이는 안내 시트) — node tools/sprite/templates_v0911.js [출력 폴더]
//   칸 = 마젠타 #FF00FF · 원본 1px = 시트에서 4px (배경은 2px) · 하늘색 = 발 기준선 · 노랑 점선 = 가운데 · 흰 점선 = 안전 여백(8px)
//   만든 그림은 가로 한 줄로 이어 붙여 보내 주면 Claude 가 격자 · 팔레트 · 배경 제거 · 압축 · assets/manifest.js thrill 등록을 한다
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, '..', '..', 'assets', 'templates', 'v0911');
const FONT = path.join(__dirname, '..', '..', 'assets', 'fonts');
const SHEETS = [
  { id: 'punch', title: '🥊 펀치 기계 (샌드백)', file: 'thrill-punch-v1.png', w: 128, h: 192, k: 3, base: 176,
    frames: ['① 기본 (가만히)', '② 맞은 순간 (뒤로 휘청 · 번쩍)'],
    notes: ['오락실 펀치 기계 + 빨간 샌드백 · 왼쪽(용사 쪽)을 봄', '숫자판 · 글자는 그리지 않음 (7세그 숫자는 게임이 그림)', '두 칸 크기 · 받침 위치 같게 · 바닥 그림자 없음'] },
  { id: 'bat', title: '🦇 황금 박쥐', file: 'thrill-bat-v1.png', w: 64, h: 64, k: 4, base: null,
    frames: ['① 날개 위', '② 날개 가운데', '③ 날개 아래', '④ 잡힘 (그물 · 눈 빙글)'],
    notes: ['금빛 박쥐 · 귀엽게 · 왼쪽을 봄 · 몸통 위치 네 칸 같게', '① → ② → ③ 이 날갯짓 반복 (공중이라 기준선 없음)', '④ 는 작은 금빛 그물에 걸린 모습'] },
  { id: 'chest', title: '🎁 보물 상자', file: 'thrill-chest-v1.png', w: 64, h: 64, k: 4, base: 58,
    frames: ['① 닫힘', '② 흔들림 (기울고 빛 새어 나옴)', '③ 열림 (빛 · 반짝이)'],
    notes: ['나무 + 금테 상자 · 정면에서 살짝 위', '세 칸 바닥 위치 같게 (하늘색 선)', '상자 안 보상(조각 · 깃털)은 그리지 않음 — 게임이 띄움'] },
  { id: 'feather', title: '🪶 황금 깃털 아이콘', file: 'thrill-feather-v1.png', w: 32, h: 32, k: 8, base: null,
    frames: ['① 깃털'], notes: ['금빛 깃털 하나 · 대각선', '1px 진한 외곽선 · 배경 마젠타'] },
  { id: 'arena', title: '🏟 반대항 경기장 배경', file: 'thrill-arena-v1.png', w: 480, h: 270, k: 2, base: 221, bg: true,
    frames: ['배경 (16:9)'], notes: ['어두운 지하 투기장 · 횃불 · 관중석 실루엣 (디아블로 1 느낌)', '마젠타 아님 — 꽉 찬 배경 · 외곽선 없음 · 글자 없음', '빨간 칸은 게임이 위에 올리는 자리 → 비워 두거나 어둡고 단순하게'] },
];
const css = `@font-face{font-family:G;src:url('file://${FONT}/Galmuri11.woff2')}@font-face{font-family:G;font-weight:bold;src:url('file://${FONT}/Galmuri11-Bold.woff2')}
body{margin:0;background:#1b1d2a;font-family:G,sans-serif;color:#e8e8f0}.sheet{display:inline-block;padding:22px 26px 18px;background:#1b1d2a}
h1{margin:0 0 4px;font-size:24px;color:#ffd25a}.sub{margin:0 0 14px;font-size:14px;color:#aab}.row{display:flex;gap:28px;align-items:flex-start}
.cell{position:relative;background:#ff00ff;outline:2px solid #fff;image-rendering:pixelated}.cell.bg{background:#2a2433}
.cell i{position:absolute;pointer-events:none}.ctr{left:50%;top:0;bottom:0;border-left:2px dashed #ffe14a99}.mid{top:50%;left:0;right:0;border-top:2px dashed #ffe14a55}
.safe{border:2px dashed #ffffffaa}.baseline{left:0;right:0;border-top:3px solid #4fe0ff}.lab{margin-top:8px;font-size:15px;text-align:center}.dim{font-size:12px;color:#99a;text-align:center}
ul{margin:14px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#cfd2e6}.zone{position:absolute;border:3px solid #ff4a4a;background:#ff4a4a22;color:#ffb0b0;font-size:13px;display:flex;align-items:center;justify-content:center;text-align:center}
.out{margin-top:10px;font-size:14px;color:#7dffb0}`;
function html(s) {
  const W = s.w * s.k, H = s.h * s.k, sf = 8 * s.k;
  const zones = s.id === 'arena' ? [
    ['7세그 숫자판', 0.40, 0.04, 0.22, 0.17], ['게이지 (반 기록선)', 0.91, 0.08, 0.06, 0.70], ['펀치 기계', 0.47, 0.42, 0.15, 0.40], ['용사', 0.16, 0.55, 0.12, 0.27], ['반 이름', 0.02, 0.03, 0.14, 0.09], ['바닥 (아래 18%)', 0, 0.82, 1, 0.18]
  ].map(([t, x, y, w, h]) => `<div class="zone" style="left:${x * W}px;top:${y * H}px;width:${w * W}px;height:${h * H}px">${t}</div>`).join('') : '';
  const cell = (lab) => `<div><div class="cell${s.bg ? ' bg' : ''}" style="width:${W}px;height:${H}px">${s.bg ? '' : `<i class="ctr"></i><i class="mid"></i><i class="safe" style="left:${sf}px;top:${sf}px;right:${sf}px;bottom:${sf}px"></i>`}${s.base != null ? `<i class="baseline" style="top:${s.base * s.k}px"></i>` : ''}${zones}</div><p class="lab">${lab}</p><p class="dim">원본 ${s.w}×${s.h}px</p></div>`;
  return `<!doctype html><meta charset="utf-8"><style>${css}</style><div class="sheet" id="s"><h1>${s.title} — 그림 템플릿</h1>
    <p class="sub">원본 칸 ${s.w}×${s.h}px ${s.frames.length > 1 ? `· ${s.frames.length}칸 가로 한 줄 ` : ""}· 이 시트는 원본 1px = ${s.k}px 로 키운 것 ${s.bg ? '' : '· 마젠타 #FF00FF = 지울 배경 · 하늘색 = 발(바닥) 기준선 · 노랑 점선 = 가운데 · 흰 점선 = 안전 여백'}</p>
    <div class="row">${s.frames.map(cell).join('')}</div><ul>${s.notes.map((n) => `<li>${n}</li>`).join('')}</ul>
    <p class="out">보낼 파일: ${s.file} (${s.frames.length > 1 ? `${s.w * s.frames.length}×${s.h}px 한 장 · 칸 사이 틈 없이` : `${s.w}×${s.h}px`} — 8배로 키운 그림도 괜찮아요, Claude 가 줄여 맞춤)</p></div>`;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const s of SHEETS) {
    const f = path.join(OUT, `tpl-${s.id}.html`); fs.writeFileSync(f, html(s));
    await p.goto('file://' + f); await p.waitForTimeout(300);
    await (await p.$('#s')).screenshot({ path: path.join(OUT, `tpl-${s.id}.png`) });
    fs.unlinkSync(f); console.log('OK', s.id);
  }
  await b.close();
})();
