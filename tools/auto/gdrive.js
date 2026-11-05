// 드라이브 올리기 · 내려받기 · 목록 (v0.9.6 차시 자동화)
// node tools/auto/gdrive.js up <파일> <폴더 id> [이름]   → 올린 파일 id · 링크 (같은 이름이 있으면 새 판으로 덮어씀)
// node tools/auto/gdrive.js down <파일 id> <저장 경로>
// node tools/auto/gdrive.js ls <폴더 id>
// node tools/auto/gdrive.js check                       → 열쇠 확인 (내 드라이브 이름)
// node tools/auto/gdrive.js mkdir <부모 폴더 id> <이름>     → 폴더 id (같은 이름이 있으면 그것)
// ── 모션그래픽 교체 (2026-11-03) ── 폴더 기본값: 05 모션그래픽 → 99 지난판
// node tools/auto/gdrive.js swap <차시 2자리> <새 mp4 …> [--trash] [--dry]
//     ① 새 mp4 를 05 모션그래픽에 올리고 ② 같은 「(0n차시)」 옛 영상 중 이번에 올린 이름이 아닌 것을 99 지난판으로 옮김
//     옮길 때 「링크가 있는 모든 사용자」 보기 권한을 붙여 두어, 게임에 연결된 옛 링크가 새 영상으로 바뀔 때까지 끊기지 않음
//     --trash = 옮기지 않고 휴지통 (30일 안에 되살릴 수 있음) · --dry = 무엇을 할지 보여 주기만
// node tools/auto/gdrive.js retire <차시 2자리> [--trash] [--dry]   → 올리기 없이 그 차시 옛 영상만 정리
const fs = require('fs'), path = require('path');
const { driveToken } = require('./google');
const API = 'https://www.googleapis.com/drive/v3', UP = 'https://www.googleapis.com/upload/drive/v3';
const MIME = { '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.gif': 'image/gif', '.zip': 'application/zip', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation' };
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
const MOTION = '1wCaC9DlV8rofxd6uNYWdkIrRKrBAaBsT', OLD = '1WZJ1FO-Kbql1jBjEWmrlvMM0j8KHdx0F'; // 05 모션그래픽 · 99 지난판
const tag = (n) => `(${String(n).padStart(2, '0')}차시)`;
async function keepLink(id) { // 옮겨도 옛 링크가 열리게: 「링크가 있는 모든 사용자 · 보기」
  await call(`${API}/files/${id}/permissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ role: 'reader', type: 'anyone' }) }).catch(() => {});
}
async function retire(no, keepNames = [], opt = {}) {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const old = (await ls(MOTION)).filter((f) => f.name.startsWith(tag(no)) && !keepNames.includes(f.name));
  for (const f of old) {
    if (opt.dry) { console.log(`(미리보기) ${opt.trash ? '휴지통' : '99 지난판'} ← ${f.name}`); continue; }
    if (opt.trash) await call(`${API}/files/${f.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ trashed: true }) });
    else { await keepLink(f.id); await call(`${API}/files/${f.id}?addParents=${OLD}&removeParents=${MOTION}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: f.name.replace(/\.mp4$/, `_지난판${day}.mp4`) }) }); }
    console.log(`${opt.trash ? '🗑 휴지통' : '📦 99 지난판'} ← ${f.name}  (${f.id})`);
  }
  return old.length;
}
async function swap(no, files, opt = {}) {
  const names = [];
  for (const f of files) {
    const name = path.basename(f);
    if (!name.startsWith(tag(no))) throw new Error(`파일 이름이 「${tag(no)}」로 시작해야 해요: ${name}`);
    names.push(name);
    if (opt.dry) { console.log(`(미리보기) 05 모션그래픽 ← ${name}`); continue; }
    console.log('⬆', JSON.stringify(await up(f, MOTION, name)));
  }
  const n = await retire(no, names, opt);
  console.log(`✅ ${tag(no)} 새 영상 ${names.length}개 · 옛 영상 ${n}개 ${opt.trash ? '휴지통' : '99 지난판'}${opt.dry ? ' (미리보기)' : ''}`);
}
module.exports = { ls, up, down, retire, swap };
if (require.main === module) {
  const args = process.argv.slice(2), flags = { trash: args.includes('--trash'), dry: args.includes('--dry') };
  const [cmd, a, b, c] = args.filter((x) => !x.startsWith('--'));
  (async () => {
    if (cmd === 'mkdir') {
      const same = (await ls(a)).find((f) => f.name === b && f.mimeType === 'application/vnd.google-apps.folder');
      if (same) { console.log(same.id); return; }
      const j = await (await call(`${API}/files?fields=id`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: b, mimeType: 'application/vnd.google-apps.folder', parents: [a] }) })).json();
      console.log(j.id); return;
    }
    if (cmd === 'up') console.log(JSON.stringify(await up(a, b, c)));
    else if (cmd === 'down') console.log(await down(a, b));
    else if (cmd === 'ls') (await ls(a)).forEach((f) => console.log(`${f.id}  ${f.size || '-'}  ${f.name}`));
    else if (cmd === 'swap') await swap(a, args.filter((x) => !x.startsWith('--')).slice(2), flags);
    else if (cmd === 'retire') await retire(a, [], flags);
    else if (cmd === 'check') { const j = await (await call(`${API}/about?fields=user(emailAddress)`)).json(); console.log('드라이브 연결 OK:', j.user.emailAddress); }
    else console.log('사용: up <파일> <폴더id> [이름] · down <id> <경로> · ls <폴더id> · check · swap <차시> <mp4…> [--trash] [--dry] · retire <차시> [--trash] [--dry]');
  })().catch((e) => { console.error('❌', e.message); process.exit(1); });
}
