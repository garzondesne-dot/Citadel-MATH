// 📷 사진 채점 중계소(tools/apps-script/photo-grade.gs) 모의 시험 — 구글 · Firebase · Claude 를 가짜로 바꿔 흐름만 확인 (돈 안 듦)
//   node tests/photo-gs.test.js
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const SRC = fs.readFileSync(path.join(__dirname, '../tools/apps-script/photo-grade.gs'), 'utf8');
const RUB = JSON.parse(fs.readFileSync(path.join(__dirname, '../tools/apps-script/rubrics.draft.json'), 'utf8'));

function world(opt = {}) {
  const props = Object.assign({ ANTHROPIC_API_KEY: 'k-test', FIREBASE_WEB_KEY: 'w', DB_URL: 'https://db.test', ENABLED: '1', DAILY_MAX: '3', GLOBAL_MAX: '300' }, opt.props || {});
  const rub = JSON.parse(JSON.stringify(RUB['eval-1'].q07)); rub.on = true;
  const db = { accounts: { '1-3': { 7: { uid: 'U7' } } }, photo_rubric: { 'eval-1': { q07: rub } }, photo_q: {}, photo: {} };
  const calls = { claude: [], put: [] };
  const at = (p) => p.split('/').reduce((o, k) => (o == null ? undefined : o[k]), db);
  const put = (p, v) => { const ks = p.split('/'), last = ks.pop(); let o = db; ks.forEach((k) => { o = o[k] = o[k] || {}; }); o[last] = v; };
  const reply = (code, body) => ({ getResponseCode: () => code, getContentText: () => (typeof body === 'string' ? body : JSON.stringify(body)) });
  const claudeOut = opt.claude || { readable: true, final_answer: '8', steps: [{ id: 's1', earned: 1, note: '' }, { id: 's2', earned: 1, note: '' }, { id: 's3', earned: 1, note: '' }, { id: 's4', earned: 1, note: '' }], confidence: 'high', feedback: '잘했어요.', flags: [] };
  const ctx = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null) }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ setMimeType: () => ({ text: t }) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => opt.lock !== false, releaseLock() {} }) },
    Utilities: { formatDate: () => '20261107', sleep() {} },
    ScriptApp: { getOAuthToken: () => 'oauth' },
    Logger: { log() {} },
    UrlFetchApp: {
      fetch(url, o) {
        if (url.startsWith('https://identitytoolkit')) { const t = JSON.parse(o.payload).idToken; return t === 'good' ? reply(200, { users: [{ localId: 'U7' }] }) : t === 'other' ? reply(200, { users: [{ localId: 'U9' }] }) : reply(400, {}); }
        if (url.startsWith('https://db.test/')) {
          assert.ok(url.includes('access_token=oauth'), '관리자 토큰으로 Firebase 접근');
          const p = decodeURIComponent(url.slice('https://db.test/'.length).split('.json')[0]);
          if (o.method === 'get') return reply(200, at(p) === undefined ? null : at(p));
          calls.put.push([p, JSON.parse(o.payload)]); put(p, JSON.parse(o.payload)); return reply(200, o.payload);
        }
        if (url === 'https://api.anthropic.com/v1/messages') {
          const b = JSON.parse(o.payload); calls.claude.push({ b, h: o.headers });
          if (opt.http) return reply(opt.http, { error: { type: 'overloaded_error' } });
          if (opt.stop) return reply(200, { stop_reason: opt.stop, content: [] });
          return reply(200, { stop_reason: 'end_turn', usage: { input_tokens: 2400, output_tokens: 600 }, content: [{ type: 'thinking', thinking: '', signature: 'x' }, { type: 'text', text: JSON.stringify(claudeOut) }] });
        }
        throw new Error('모르는 주소 ' + url);
      },
    },
  };
  vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const post = (req) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(req) } }).text);
  return { post, db, calls, ctx };
}
const REQ = { idToken: 'good', c: '1-3', n: 7, lesson: 'eval-1', room: 'q07', ask: '07 …', answer: 8, ref: 'X ⊂ {3, 9, 12} → 2³ = 8', params: { p: 6, q: 3, N: 18 }, image: 'AAAA', media: 'image/jpeg' };
let ok = 0; const t = (name, fn) => { fn(); ok++; console.log('✔', name); };

t('만점 → pass · 사진은 저장 안 함 · 점수는 서버 계산', () => {
  const w = world(), r = w.post(REQ);
  assert.strictEqual(r.ok, true); assert.strictEqual(r.status, 'pass'); assert.strictEqual(r.score, 4); assert.strictEqual(r.total, 4); assert.strictEqual(r.left, 2);
  const saved = Object.values(w.db.photo['1-3'][7]['eval-1_q07'])[0];
  assert.ok(!JSON.stringify(saved).includes('AAAA'), '사진 base64 가 저장되면 안 됨');
  assert.deepStrictEqual(saved.at, { '.sv': 'timestamp' });
  const { b, h } = w.calls.claude[0];
  assert.strictEqual(b.model, 'claude-haiku-5-5'); assert.strictEqual(h['x-api-key'], 'k-test'); assert.ok(h['anthropic-version']);
  assert.strictEqual(b.output_config.format.type, 'json_schema'); assert.ok(!('temperature' in b) && !('thinking' in b));
  assert.strictEqual(b.messages[0].content[0].type, 'image');
  assert.ok(b.messages[0].content[1].text.includes('x는 6의 약수') && b.messages[0].content[1].text.includes('18 이하의 3의 배수'), 'ask 의 {p} {N} {q} 가 채워짐');
});
t('부분 점수 → retry · 배점보다 큰 점수는 잘림', () => {
  const w = world({ claude: { readable: true, final_answer: '8', steps: [{ id: 's1', earned: 9, note: '' }, { id: 's2', earned: 0, note: '' }], confidence: 'high', feedback: '', flags: [] } });
  const r = w.post(REQ); assert.strictEqual(r.status, 'retry'); assert.strictEqual(r.score, 1); assert.strictEqual(r.steps.length, 4);
});
t('확신 낮음 · 사진 속 지시 → check (선생님 확인)', () => {
  assert.strictEqual(world({ claude: { readable: true, final_answer: '', steps: [], confidence: 'low', feedback: '', flags: [] } }).post(REQ).status, 'check');
  assert.strictEqual(world({ claude: { readable: true, final_answer: '8', steps: [{ id: 's1', earned: 1, note: '' }, { id: 's2', earned: 1, note: '' }, { id: 's3', earned: 1, note: '' }, { id: 's4', earned: 1, note: '' }], confidence: 'high', feedback: '', flags: ['instructions_in_image'] } }).post(REQ).status, 'check');
  assert.strictEqual(world({ stop: 'refusal' }).post(REQ).status, 'check');
});
t('답만 쓴 풀이 → retry (선생님 확인까지는 아님)', () => {
  const r = world({ claude: { readable: true, final_answer: '8', steps: [{ id: 's4', earned: 1, note: '' }], confidence: 'high', feedback: '', flags: ['copied_answer_only'] } }).post(REQ);
  assert.strictEqual(r.status, 'retry'); assert.strictEqual(r.score, 1);
});
t('로그인 토큰 · 다른 학생 · 기준표 없음 · 꺼짐 · 모양', () => {
  assert.strictEqual(world().post({ ...REQ, idToken: 'bad' }).err, 'auth');
  assert.strictEqual(world().post({ ...REQ, idToken: 'other' }).err, 'who');
  assert.strictEqual(world().post({ ...REQ, room: 'q11' }).err, 'rubric');
  assert.strictEqual(world({ props: { ENABLED: '0' } }).post(REQ).err, 'off');
  assert.strictEqual(world().post({ ...REQ, image: '' }).err, 'bad');
  const w = world(); w.post({ ...REQ, idToken: 'bad' }); assert.strictEqual(w.calls.claude.length, 0, '확인 전에는 Claude 를 부르지 않음');
});
t('하루 3장 · 전체 한도 · 붐빔', () => {
  const w = world(); [1, 2, 3].forEach(() => assert.strictEqual(w.post(REQ).ok, true));
  assert.strictEqual(w.post(REQ).err, 'quota'); assert.strictEqual(w.calls.claude.length, 3);
  assert.strictEqual(world({ props: { GLOBAL_MAX: '0' } }).post(REQ).err, 'quota');
  assert.strictEqual(world({ lock: false }).post(REQ).err, 'busy');
});
t('Claude 실패 → 장 수 되돌림 · 붐빔은 3번까지 다시', () => {
  const w = world({ http: 529 }), r = w.post(REQ);
  assert.strictEqual(r.err, 'api'); assert.strictEqual(w.calls.claude.length, 3); assert.strictEqual(w.db.photo_q['1-3'][7]['20261107'], 0);
  const m = world({ stop: 'max_tokens' }); assert.strictEqual(m.post(REQ).err, 'api'); assert.strictEqual(m.db.photo_q['1-3'][7]['20261107'], 0);
});
t('기준표 초안: 7문항 · 배점 합 = total · pass ≤ total', () => {
  const all = Object.entries(RUB).filter(([k]) => k !== '_').flatMap(([l, rs]) => Object.entries(rs).map(([id, r]) => [l + '/' + id, r]));
  assert.deepStrictEqual(all.map((x) => x[0]), ['eval-1/q07', 'eval-1/q11', 'eval-2/q07', 'eval-2/q10', 'eval-3/q15', 'eval-3/q16', 'eval-3/q17']);
  all.forEach(([k, r]) => { assert.strictEqual(r.steps.reduce((a, s) => a + s.pts, 0), r.total, k); assert.ok(r.pass <= r.total, k); assert.strictEqual(new Set(r.steps.map((s) => s.id)).size, r.steps.length, k); });
  // 게임의 서술형 방(photo: true)과 같은지
  global.window = global; global.DS = {}; const reg = []; DS.Lessons = { register: (L) => reg.push(L) };
  ['eval-1', 'eval-2', 'eval-3'].forEach((f) => require(path.join(__dirname, '../lessons', f + '.js')));
  const rooms = reg.flatMap((L) => (L.rooms || []).filter((r) => r.photo).map((r) => L.id + '/' + r.id));
  assert.deepStrictEqual(rooms, all.map((x) => x[0]));
});
console.log(`\n📷 사진 채점 중계소 모의 시험 ${ok}개 통과`);
