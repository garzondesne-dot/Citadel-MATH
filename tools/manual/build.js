// 📘 교사용 사용설명서 PDF 만들기 (2026-11-04): tools/manual/manual.html + 스크린샷 → A4 PDF
//   스크린샷은 체험 모드(?local · 가짜 학생)에서 tools/e2e 시험이 찍은 것 — 실제 학생 이름 · 학교 정보는 들어가지 않는다
//   node tools/manual/build.js <스크린샷 폴더> <출력.pdf>      (그림 태그: <img data-s="e11/01-teacher.png">)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const [SHOTS, OUT] = process.argv.slice(2);
if (!SHOTS || !OUT) { console.error('쓰는 법: node tools/manual/build.js <스크린샷 폴더> <출력.pdf>'); process.exit(1); }
const html0 = fs.readFileSync(path.join(__dirname, 'manual.html'), 'utf8');
const root = path.join(__dirname, '..', '..');
const VERSION = (fs.readFileSync(path.join(root, 'js/config.js'), 'utf8').match(/VERSION = 'citadel-([^']+)'/) || [])[1] || '';
const missing = [];
// 그림 줄이기: 폭 1300px 이하 · JPEG 82 (투명 그림은 PNG 그대로) — 파이썬 PIL
const { execFileSync } = require('child_process'), os = require('os');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-'));
const shrink = (f) => {
  const out = path.join(TMP, `${Math.random().toString(36).slice(2)}.jpg`);
  const r = execFileSync('python3', ['-c', `import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1])\nif im.mode in ('RGBA','LA','P') and 'transparency' in im.info or im.mode=='RGBA':\n  print('keep');sys.exit()\nim=im.convert('RGB')\nif im.height>im.width*2.3: im=im.crop((0,0,im.width,int(im.width*2.3)))\nw=1300\nif im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)\nim.save(sys.argv[2],'JPEG',quality=82,optimize=True)\nprint('ok')`, f, out]).toString().trim();
  return r === 'ok' ? out : f;
};
const uri = (f0) => { const f = /\.(png|jpe?g)$/i.test(f0) ? shrink(f0) : f0; const ext = path.extname(f).slice(1).replace('jpg', 'jpeg'); return `data:image/${ext};base64,${fs.readFileSync(f).toString('base64')}`; };
const html = html0.replace(/\{\{VERSION\}\}/g, VERSION).replace(/data-s="([^"]+)"/g, (m, rel) => {
  const f = rel.startsWith('repo:') ? path.join(root, rel.slice(5)) : path.join(SHOTS, rel);
  if (!fs.existsSync(f)) { missing.push(rel); return 'src="" data-missing="1"'; }
  return `src="${uri(f)}"`;
});
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  await p.pdf({ path: OUT, format: 'A4', printBackground: true, margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true, headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-size:8px;color:#8a8f9c;padding:0 14mm;display:flex;justify-content:space-between;font-family:'Noto Sans CJK KR',sans-serif"><span>모두의 던전 : 공통수학2 · 교사용 사용설명서 · v${VERSION}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>` });
  await b.close();
  console.log(`✅ ${OUT} (${(fs.statSync(OUT).size / 1048576).toFixed(1)}MB)${missing.length ? ` · ⚠ 그림 없음 ${missing.length}: ${missing.join(', ')}` : ''}`);
})();
