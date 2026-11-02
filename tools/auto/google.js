// 열쇠 → 접근 토큰 (v0.9.6 차시 자동화). 열쇠는 클라우드 환경 설정(비밀 값)에서만 읽는다 — 저장소 · 로그에 남기지 않는다
//  - 드라이브: GDRIVE_RCLONE_TOKEN = rclone 의 token JSON (refresh_token) → rclone 의 공개 앱 ID 로 새 토큰
//  - Firebase: FIREBASE_SA_JSON = 서비스 계정 키 JSON → JWT 서명 → 토큰 (데이터베이스 관리자 권한, 규칙을 거치지 않음)
const crypto = require('crypto');
const parse = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} 이 없어요 — 클라우드 환경 설정(비밀 값)에 넣고 새 세션을 여세요`);
  try { return JSON.parse(v); } catch (e) { return JSON.parse(v.replace(/\r?\n/g, '\\n')); }
};
async function tokenFor(body) {
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body) });
  const j = await r.json();
  if (!j.access_token) throw new Error(`토큰 실패: ${j.error || r.status} ${j.error_description || ''}`);
  return j.access_token;
}
let drive = null, fb = null;
async function driveToken() {
  if (drive) return drive;
  const t = parse('GDRIVE_RCLONE_TOKEN');
  drive = await tokenFor({ grant_type: 'refresh_token', refresh_token: t.refresh_token,
    client_id: process.env.GDRIVE_CLIENT_ID || '202264815644.apps.googleusercontent.com', client_secret: process.env.GDRIVE_CLIENT_SECRET || 'X4Z3ca8xfWDb1Voo-F9a7ZxJ' });
  return drive;
}
async function firebaseToken() {
  if (fb) return fb;
  const k = parse('FIREBASE_SA_JSON'), now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = b64({ alg: 'RS256', typ: 'JWT' }), claim = b64({ iss: k.client_email, scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const sig = crypto.createSign('RSA-SHA256').update(`${head}.${claim}`).sign(k.private_key, 'base64url');
  fb = await tokenFor({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` });
  return fb;
}
module.exports = { driveToken, firebaseToken };
