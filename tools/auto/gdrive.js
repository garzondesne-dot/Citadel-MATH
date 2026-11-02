// 드라이브 올리기 · 내려받기 · 목록 (v0.9.6 차시 자동화)
// node tools/auto/gdrive.js up <파일> <폴더 id> [이름]   → 올린 파일 id · 링크 (같은 이름이 있으면 새 판으로 덮어씀)
// node tools/auto/gdrive.js down <파일 id> <저장 경로>
// node tools/auto/gdrive.js ls <폴더 id>
// node tools/auto/gdrive.js check                       → 열쇠 확인 (내 드라이브 이름)
const fs = require('fs'), path = require('path');
const { driveToken } = require('./google');
const API = 'https://www.googleapis.com/drive/v3', UP = 'https://www.googleapis.com/upload/drive/v3';
const MIME = { '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.gif': 'image/gif', '.zip': 'application/zip' };
async function call(url, opt = {}) {
  const r = await fetch(url, { ...opt, headers: { Authorization: `Bearer ${await driveToken()}`, ...(opt.headers || {}) } });
  if (!r.ok) throw new Error(`드라이브 ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r;
}
async function ls(folder) {
  const q = encodeURIComponent(`'${folder}' in parents and trashed = false`);
  const j = await (await call(`${API}/files?q=${q}&fields=files(id,name,size,mimeType,createdTime)&pageSize=200&orderBy=createdTime desc`)).json();
  return j.files;
}
async function up(file, folder, name) {
  name = name || path.basename(file);
  const data = fs.readFileSync(file), type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const same = (await ls(folder)).find((f) => f.name === name);
  // 재개 가능 업로드 (큰 mp4 도) → 같은 이름이면 내용만 새 판으로 (id · 링크 · 공유 유지)
  const meta = same ? {} : { name, parents: [folder] };
  const init = await call(same ? `${UP}/files/${same.id}?uploadType=resumable` : `${UP}/files?uploadType=resumable`, { method: same ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': type, 'X-Upload-Content-Length': String(data.length) }, body: JSON.stringify(meta) });
  const done = await (await call(init.headers.get('location'), { method: 'PUT', headers: { 'content-type': type }, body: data })).json();
  return { id: done.id, name, link: `https://drive.google.com/file/d/${done.id}/view`, replaced: !!same };
}
async function down(id, out) {
  const r = await call(`${API}/files/${id}?alt=media`);
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  return out;
}
module.exports = { ls, up, down };
if (require.main === module) {
  const [cmd, a, b, c] = process.argv.slice(2);
  (async () => {
    if (cmd === 'up') console.log(JSON.stringify(await up(a, b, c)));
    else if (cmd === 'down') console.log(await down(a, b));
    else if (cmd === 'ls') (await ls(a)).forEach((f) => console.log(`${f.id}  ${f.size || '-'}  ${f.name}`));
    else if (cmd === 'check') { const j = await (await call(`${API}/about?fields=user(emailAddress)`)).json(); console.log('드라이브 연결 OK:', j.user.emailAddress); }
    else console.log('사용: up <파일> <폴더id> [이름] · down <id> <경로> · ls <폴더id> · check');
  })().catch((e) => { console.error('❌', e.message); process.exit(1); });
}
