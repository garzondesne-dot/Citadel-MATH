// v0.9.11 그림 템플릿 (사용자가 그림 AI 로 뽑을 때 붙이는 안내 시트) — node tools/sprite/templates_v0911.js [출력 폴더] [--only id,id]
//   성채 2 · 3층 몬스터 (2026-11-06): node tools/sprite/templates_v0911.js assets/templates/castle --only castle3,castleboss2
//   칸 = 마젠타 #FF00FF · 원본 1px = 시트에서 4px (배경은 2px) · 하늘색 = 발 기준선 · 노랑 점선 = 가운데 · 흰 점선 = 안전 여백(8px)
//   만든 그림은 가로 한 줄로 이어 붙여 보내 주면 Claude 가 격자 · 팔레트 · 배경 제거 · 압축 · assets/manifest.js thrill 등록을 한다
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ARGS = process.argv.slice(2), oi = ARGS.indexOf('--only'), ONLY = oi >= 0 ? ARGS[oi + 1].split(',') : null;
const OUT = (ARGS[0] && !ARGS[0].startsWith('--') && path.resolve(ARGS[0])) || path.join(__dirname, '..', '..', 'assets', 'templates', 'v0911');
const FONT = path.join(__dirname, '..', '..', 'assets', 'fonts');
const SHEETS = [
  { id: 'bat', title: '🦇 황금 박쥐', file: 'thrill-bat-v1.png', w: 64, h: 64, k: 4, base: null,
    frames: ['① 날개 위', '② 날개 가운데', '③ 날개 아래', '④ 잡힘 (그물 · 눈 빙글)'],
    notes: ['금빛 박쥐 · 귀엽게 · 왼쪽을 봄 · 몸통 위치 네 칸 같게', '① → ② → ③ 이 날갯짓 반복 (공중이라 기준선 없음)', '④ 는 작은 금빛 그물에 걸린 모습'] },
  { id: 'chest', title: '🎁 보물 상자', file: 'thrill-chest-v1.png', w: 64, h: 64, k: 4, base: 58,
    frames: ['① 닫힘', '② 흔들림 (기울고 빛 새어 나옴)', '③ 열림 (빛 · 반짝이)'],
    notes: ['나무 + 금테 상자 · 정면에서 살짝 위', '세 칸 바닥 위치 같게 (하늘색 선)', '상자 안 보상(조각 · 깃털)은 그리지 않음 — 게임이 띄움'] },
  { id: 'icons', title: '✨ v0.9.11 아이콘 18개', file: 'thrill-icons-v1.png', w: 32, h: 32, k: 4, base: null, cols: 6,
    frames: ['① 콤보 5 불꽃', '② 콤보 10 번개', '③ 콤보 20 무지개', '④ 콤보 30 왕관', '⑤ 퍼펙트 반짝', '⑥ 쇠사슬(묶기)', '⑦ 보물 상자', '⑧ 황금 깃털', '⑨ 황금 박쥐 얼굴', '⑩ 마정석 조각', '⑪ 1등 트로피', '⑫ 결승 깃발', '⑬ 참여 (손 든 손)', '⑭ 고침 (돌아가는 화살표)', '⑮ 콤보 (불꽃 숫자)', '⑯ 첫 시도 (과녁)', '⑰ 돕기 (초록 하트)', '⑱ 연장전 (모래시계)'],
    notes: ['32×32 아이콘 18개 · 가로 6 × 세로 3 (칸 사이 틈 없이)', '교실 TV 에서 이모지가 안 보여서 게임 안 이모지를 이 그림으로 바꿈', '1px 진한 외곽선 · 배경 마젠타 · 글자 없음'] },
  { id: 'combo', title: '🔥 콤보 창 (단계 4개)', file: 'thrill-combo-v1.png', w: 96, h: 48, k: 4, base: null,
    frames: ['① 기본 · 5 불꽃 (주황)', '② 10 번개 (노랑)', '③ 20 무지개', '④ 30 왕관 (금)'],
    notes: ['숫자 · COMBO 글자는 게임이 위에 씀 → 가운데(흰 점선 안)는 어둡고 비워 둠', '테두리 장식만 단계마다 화려하게 · 네 칸 크기 같게', '오른쪽 위 구석에 작게 뜨는 창'] },
  { id: 'track', title: '🏁 반대항 경주 트랙 배경', file: 'thrill-track-v1.png', w: 480, h: 270, k: 2, base: null, bg: true,
    frames: ['배경 (16:9)'], notes: ['위에서 비스듬히 본 경주 트랙 · 던전 안 훈련장 느낌 · 흙길 레인 4~6줄', '외곽선 없음 · 글자 없음 · 캐릭터 없음', '빨간 칸 = 게임이 올리는 자리 (반 이름 · 출발선 · 결승선 · 레인) → 단순하고 어둡게'] },
  { id: 'card', title: '🃏 수학 카드 틀 (도트)', file: 'card-frame-v2.png', w: 64, h: 88, k: 5, base: null,
    frames: ['카드 틀'], notes: ['용사 · 몬스터와 같은 도트 화풍 · 어두운 남색 바탕 + 금속 테두리 (지금 카드보다 단순하게)', '빨간 칸: 위 = 그림 자리(32×32) · 가운데 = 수식 · 아래 = 이름판 → 비워 둠', '배경 마젠타 · 글자 없음'] },
  { id: 'cardart', title: '🃏 카드 그림 16개 (소단원)', file: 'card-arts-v2.png', w: 32, h: 32, k: 4, base: null, cols: 8,
    frames: ['① 집합 · 원소 ∈', '② 원소의 개수', '③ 공집합', '④ 부분집합 ⊂', '⑤ 서로 같은 집합', '⑥ 부분집합의 개수', '⑦ 교집합 ∩', '⑧ 합집합 ∪', '⑨ 여집합 · 차집합', '⑩ 연산 법칙 · 드모르간', '⑪ 명제 · 조건 · 진리집합', '⑫ 모든 / 어떤', '⑬ 역 · 대우 (거울)', '⑭ 충분 · 필요 (열쇠 · 자물쇠)', '⑮ 증명 (대우 · 귀류법)', '⑯ 절대부등식 (저울)'],
    notes: ['32×32 그림 16개 · 가로 8 × 세로 2 · 소단원마다 하나 (같은 소단원 카드는 같은 그림)', '수학 기호를 빛나는 룬처럼 넣은 물건 그림 (검 · 수정 · 열쇠 · 저울 …) · 글자 없음', '카드 틀 위쪽 그림 자리에 들어감'] },
  { id: 'plat', title: '⚖ 밸런스 게임 발판', file: 'fun-plat-v2.png', w: 160, h: 120, k: 3, base: 12,
    frames: ['① 멀쩡한 발판', '② 금 간 발판'], notes: ['허공에 뜬 돌 · 나무 발판 · 위에 용사 6~8명이 설 자리 (하늘색 선 = 발 딛는 면)', '무너질 때는 게임이 그림을 세로로 6조각 내서 떨어뜨림', '배경 마젠타 · 글자 없음'] },
  // 🏰 성채 3층 「집합과 명제 대단원」 새 몬스터 5 · 2층 「명제 중단원」 새 보스 1 (2026-11-06)
  // ⚡ 필살기 컷인 · 용사 눈빛 클로즈업 18장 (2026-11-06): 가로로 긴 눈 부분 · 오른쪽(몬스터 쪽)을 노려봄
  { id: 'faces', title: '⚡ 필살기 컷인 · 용사 눈빛 클로즈업 18장', file: 'hero-faces-v1.png', w: 192, h: 72, k: 2, base: null, cols: 3,
    frames: ['0 검사', '1 마녀', '2 엘프 궁수', '3 닌자', '4 사제', '5 창술사', '6 드워프', '7 현자', '8 성기사', '9 격투가', '10 무희', '11 음유시인', '12 연금술사', '13 해적', '14 빙결 마법사', '15 조련사', '16 금발 검사', '17 수학자'],
    notes: ['칸마다 용사 한 명의 「이마 ~ 코」만 크게 · 두 눈이 칸 가운데(노랑 점선 높이)', '눈빛: 결의에 찬 표정 · 오른쪽(몬스터 쪽)을 노려봄 · 눈동자에 하이라이트 · 칸 밖으로 머리카락이 잘려도 됨', '용사 도트 시트와 같은 머리색 · 눈색 · 모자 · 장신구 (참고 그림으로 그 용사 시트를 첨부) · 글자 없음'] },
  { id: 'faces1', title: '⚡ 필살기 눈빛 클로즈업 · 1회차 (0~5번)', file: 'hero-faces1-v1.png', w: 192, h: 72, k: 2, base: null, cols: 3, eye: true,
    frames: ['1) 검사', '2) 마녀', '3) 엘프 궁수', '4) 닌자', '5) 사제', '6) 창술사'], refs: ['hero-sword-v3c.webp', 'hero-witch-v2c.webp', 'hero-elf-v2c.webp', 'hero-ninja-v2c.webp', 'hero-priest-v2c.webp', 'hero-lancer-v2c.webp'],
    notes: ['칸마다 아래 용사 한 명의 이마 ~ 코만 크게 · 두 눈을 노랑 「눈높이」 선에', '오른쪽(몬스터 쪽)을 노려보는 결의에 찬 눈빛 · 눈동자 하이라이트 · 머리카락은 칸 밖으로 잘려도 됨', '칸 아래 작은 그림 = 그 용사 (머리색 · 눈색 · 모자 · 장신구를 그대로) · 글자 · 번호는 그리지 않음'] },
  { id: 'faces2', title: '⚡ 필살기 눈빛 클로즈업 · 2회차 (6~11번)', file: 'hero-faces2-v1.png', w: 192, h: 72, k: 2, base: null, cols: 3, eye: true,
    frames: ['1) 드워프', '2) 현자', '3) 성기사', '4) 격투가', '5) 무희', '6) 음유시인'], refs: ['hero-dwarf-v2c.webp', 'hero-sage-v2c.webp', 'hero-paladin-v2c.webp', 'hero-monk-v2c.webp', 'hero-dancer-v2c.webp', 'hero-bard-v2c.webp'],
    notes: ['칸마다 아래 용사 한 명의 이마 ~ 코만 크게 · 두 눈을 노랑 「눈높이」 선에', '오른쪽(몬스터 쪽)을 노려보는 결의에 찬 눈빛 · 눈동자 하이라이트 · 머리카락은 칸 밖으로 잘려도 됨', '칸 아래 작은 그림 = 그 용사 (머리색 · 눈색 · 모자 · 장신구를 그대로) · 글자 · 번호는 그리지 않음'] },
  { id: 'faces3', title: '⚡ 필살기 눈빛 클로즈업 · 3회차 (12~17번)', file: 'hero-faces3-v1.png', w: 192, h: 72, k: 2, base: null, cols: 3, eye: true,
    frames: ['1) 연금술사', '2) 해적', '3) 빙결 마법사', '4) 조련사', '5) 금발 검사', '6) 수학자'], refs: ['hero-alchemist-v2c.webp', 'hero-pirate-v2c.webp', 'hero-frost-v2c.webp', 'hero-tamer-v2c.webp', 'hero-blond-v2-2c.webp', 'hero-math-v2c.webp'],
    notes: ['칸마다 아래 용사 한 명의 이마 ~ 코만 크게 · 두 눈을 노랑 「눈높이」 선에', '오른쪽(몬스터 쪽)을 노려보는 결의에 찬 눈빛 · 눈동자 하이라이트 · 머리카락은 칸 밖으로 잘려도 됨', '칸 아래 작은 그림 = 그 용사 (머리색 · 눈색 · 모자 · 장신구를 그대로) · 글자 · 번호는 그리지 않음'] },
  { id: 'castle3', title: '🏰 성채 3층 몬스터 5마리 (대단원)', file: 'monsters-castle3-v1.png', w: 96, h: 96, k: 2, base: 90, cols: 3,
    frames: [1, 2, 3, 4, 5].flatMap((n, i) => [['진리집합 수정 골렘', '역 · 대우 사슬 망령', '귀류법 미로 거미', '절대부등식 탑 수호자', '필요충분 쌍둥이 열쇠 기사'][i]].flatMap((m) => [`${n}-대기 · ${m}`, `${n}-공격`, `${n}-쓰러짐`])),
    notes: ['한 줄 = 몬스터 한 마리 · 왼쪽부터 대기 | 공격 | 쓰러짐 (5줄 × 3칸)', '왼쪽(용사 쪽)을 봄 · 발은 하늘색 선 위 · 몸 가운데는 노랑 점선', '1 · 2층 성채 몬스터와 같은 크기 · 같은 화풍 (참고 그림으로 지금 성채 몬스터 시트를 함께 첨부)'] },
  { id: 'castleboss2', title: '👑 성채 2층 보스 「진리의 심판관」', file: 'monsters-castleboss2-v1.png', w: 192, h: 192, k: 2, base: 184,
    frames: ['① 대기', '② 공격 (판결 망치 내려침)', '③ 쓰러짐'],
    notes: ['명제 중단원 보스 · 이기면 호칭 「논리의 탐정」', '왼쪽(용사 쪽)을 봄 · 발은 하늘색 선 · 세 칸 위치 같게', '1층 성주 · 3층 군주와 같은 크기 (보스 칸 192 · 일반 몬스터의 2배)'] }
];
const css = `@font-face{font-family:G;src:url('file://${FONT}/Galmuri11.woff2')}@font-face{font-family:G;font-weight:bold;src:url('file://${FONT}/Galmuri11-Bold.woff2')}
body{margin:0;background:#1b1d2a;font-family:G,sans-serif;color:#e8e8f0}.sheet{display:inline-block;padding:22px 26px 18px;background:#1b1d2a}
h1{margin:0 0 4px;font-size:24px;color:#ffd25a}.sub{margin:0 0 14px;font-size:14px;color:#aab}.row{display:flex;flex-wrap:wrap;gap:22px 18px;align-items:flex-start}
.cell{position:relative;background:#ff00ff;outline:2px solid #fff;image-rendering:pixelated}.cell.bg{background:#2a2433}
.cell i{position:absolute;pointer-events:none}.ctr{left:50%;top:0;bottom:0;border-left:2px dashed #ffe14a99}.mid{top:50%;left:0;right:0;border-top:2px dashed #ffe14a55}
.safe{border:2px dashed #ffffffaa}.baseline{left:0;right:0;border-top:3px solid #4fe0ff}.lab{margin-top:8px;font-size:14px;text-align:center;word-break:keep-all}.dim{font-size:12px;color:#99a;text-align:center}
ul{margin:14px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#cfd2e6}.zone{position:absolute;border:3px solid #ff4a4a;background:#ff4a4a22;color:#ffb0b0;font-size:13px;display:flex;align-items:center;justify-content:center;text-align:center}
.out{margin-top:10px;font-size:14px;color:#7dffb0}.eyel{left:0;right:0;border-top:4px solid #ffe14a}.eyet{position:absolute;right:6px;font-size:13px;color:#ffe14a;font-weight:bold}.ref{display:flex;justify-content:center;margin-top:4px}.ref i{display:block;width:160px;height:128px;background-size:400% 1200%;background-position:0 0;image-rendering:pixelated;background-color:#2a2f45;border-radius:6px}`;
function html(s) {
  const W = s.w * s.k, H = s.h * s.k, sf = 8 * s.k;
  const Z = (list) => list.map(([t, x, y, w, h]) => `<div class="zone" style="left:${x * W}px;top:${y * H}px;width:${w * W}px;height:${h * H}px">${t}</div>`).join('');
  const zones = s.id === 'track' ? Z([['반 이름 칸', 0.02, 0.06, 0.16, 0.88], ['출발선', 0.19, 0.04, 0.02, 0.92], ['레인 1', 0.22, 0.08, 0.72, 0.13], ['레인 2', 0.22, 0.24, 0.72, 0.13], ['레인 3', 0.22, 0.40, 0.72, 0.13], ['레인 4', 0.22, 0.56, 0.72, 0.13], ['레인 5 · 6', 0.22, 0.72, 0.72, 0.2], ['결승선', 0.95, 0.04, 0.03, 0.92]])
    : s.id === 'card' ? Z([['그림 32×32', 0.25, 0.08, 0.5, 0.36], ['수식', 0.12, 0.48, 0.76, 0.24], ['이름판', 0.12, 0.78, 0.76, 0.14]]) : s.id === 'arena' ? [
    ['7세그 숫자판', 0.40, 0.04, 0.22, 0.17], ['게이지 (반 기록선)', 0.91, 0.08, 0.06, 0.70], ['펀치 기계', 0.47, 0.42, 0.15, 0.40], ['용사', 0.16, 0.55, 0.12, 0.27], ['반 이름', 0.02, 0.03, 0.14, 0.09], ['바닥 (아래 18%)', 0, 0.82, 1, 0.18]
  ].map(([t, x, y, w, h]) => `<div class="zone" style="left:${x * W}px;top:${y * H}px;width:${w * W}px;height:${h * H}px">${t}</div>`).join('') : '';
  const CW = Math.max(W, 130);
  const ART = path.join(__dirname, '..', '..', 'assets', 'art');
  const ref = (i) => (s.refs && s.refs[i] ? `<div class="ref"><i style="background-image:url('file://${ART}/${s.refs[i]}')"></i></div>` : '');
  const eye = s.eye ? `<i class="eyel" style="top:${H / 2 - 2}px"></i><b class="eyet" style="top:${H / 2 - 22}px">눈높이</b>` : '';
  let ci = 0;
  const cell = (lab) => { const i = ci++; return `<div style="width:${CW}px"><div class="cell${s.bg ? ' bg' : ''}" style="width:${W}px;height:${H}px">${s.bg ? '' : `<i class="ctr"></i><i class="mid"></i><i class="safe" style="left:${sf}px;top:${sf}px;right:${sf}px;bottom:${sf}px"></i>`}${s.base != null ? `<i class="baseline" style="top:${s.base * s.k}px"></i>` : ''}${zones}${eye}</div><p class="lab">${lab}</p>${ref(i)}<p class="dim">원본 ${s.w}×${s.h}px</p></div>`; };
  return `<!doctype html><meta charset="utf-8"><style>${css}</style><div class="sheet" id="s"><h1>${s.title} — 그림 템플릿</h1>
    <p class="sub">원본 칸 ${s.w}×${s.h}px ${s.frames.length > 1 ? (s.cols ? `· ${s.frames.length}칸 가로 ${s.cols} × 세로 ${Math.ceil(s.frames.length / s.cols)} ` : `· ${s.frames.length}칸 가로 한 줄 `) : ""}· 이 시트는 원본 1px = ${s.k}px 로 키운 것 ${s.bg ? '' : '· 마젠타 #FF00FF = 지울 배경 · 하늘색 = 발(바닥) 기준선 · 노랑 점선 = 가운데 · 흰 점선 = 안전 여백'}</p>
    <div class="row"${s.cols ? ` style="width:${s.cols * (CW + 18)}px"` : ''}>${s.frames.map(cell).join('')}</div><ul>${s.notes.map((n) => `<li>${n}</li>`).join('')}</ul>
    <p class="out">보낼 파일: ${s.file} (${s.frames.length > 1 ? `${s.w * (s.cols || s.frames.length)}×${s.h * Math.ceil(s.frames.length / (s.cols || s.frames.length))}px 한 장 · 칸 사이 틈 없이` : `${s.w}×${s.h}px`} — 8배로 키운 그림도 괜찮아요, Claude 가 줄여 맞춤)</p></div>`;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const s of SHEETS.filter((x) => !ONLY || ONLY.includes(x.id))) {
    const f = path.join(OUT, `tpl-${s.id}.html`); fs.writeFileSync(f, html(s));
    await p.goto('file://' + f); await p.waitForTimeout(300);
    await (await p.$('#s')).screenshot({ path: path.join(OUT, `tpl-${s.id}.png`) });
    fs.unlinkSync(f); console.log('OK', s.id);
  }
  await b.close();
})();
