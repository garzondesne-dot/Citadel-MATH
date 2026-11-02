// 학습지 PDF → 칸별 이미지 → Firebase prep/{차시}/img · has (v0.9.6 차시 자동화)
// 수업 준비 「PDF 한 번에 넣기」와 똑같은 코드로 자른다: 이 기기 체험 모드(?local)에서 PDF 를 넣고 → 나온 이미지를 Firebase 에 쓴다
// 먼저 저장소 폴더에서 python3 -m http.server 8765 를 띄운다.
// node tools/auto/fbprep.js <차시 id 예: set-06> <레이드용 PDF> [--dry]   (--dry = Firebase 에 쓰지 않고 칸 수 · 크기만)
const fs = require('fs');
const { chromium } = require('playwright');
const { firebaseToken } = require('./google');
const DB = 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app';
const [lesson, pdf, dry] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  p.on('dialog', (d) => d.accept());
  await p.goto('http://localhost:8765/index.html?local&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'auto'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.selectOption('#p-lesson', lesson); await p.click('#p-go'); await p.waitForTimeout(800);
  const b64 = fs.readFileSync(pdf).toString('base64');
  await p.evaluate((b64) => { const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); const dt = new DataTransfer(); dt.items.add(new File([bin], 'w.pdf', { type: 'application/pdf' })); const i = document.querySelector('#p-pdf'); i.files = dt.files; i.dispatchEvent(new Event('change')); }, b64);
  await p.waitForSelector('#p-all', { timeout: 60000 }); await p.click('#p-all'); await p.waitForTimeout(3000);
  const img = await p.evaluate(async (l) => (await DS.Net.get(`prep/${l}/img`)) || {}, lesson);
  await b.close();
  const slots = Object.keys(img);
  console.log(`${lesson}: 칸 ${slots.length}개 · ${(slots.reduce((a, k) => a + img[k].length, 0) / 1024).toFixed(0)} KB — ${slots.join(' ')}`);
  if (!slots.length) throw new Error('잘린 칸이 없어요 (차시 파일 crops 확인)');
  if (dry) return;
  const tok = await firebaseToken();
  const put = async (path, val) => { const r = await fetch(`${DB}/${path}.json`, { method: 'PUT', headers: { Authorization: `Bearer ${tok}`, 'content-type': 'application/json' }, body: JSON.stringify(val) }); if (!r.ok) throw new Error(`Firebase ${r.status} ${path}: ${(await r.text()).slice(0, 200)}`); };
  for (const k of slots) { await put(`prep/${lesson}/img/${k}`, img[k]); await put(`prep/${lesson}/has/${k}`, true); }
  console.log(`✅ Firebase prep/${lesson} 에 ${slots.length}칸 올림`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
