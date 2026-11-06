// 📷 서술형 사진 채점 (v0.9.12 · 2026-11-06 사용자 「추천안대로 진행」 · 설계 = docs/PHOTO-PREP.md)
//   학생: 성채 서술형 방에서 숫자 답을 맞히면 → 📷 풀이 사진 → 자르기 · 돌리기 → 1024px JPEG → Apps Script 중계소 → Claude Haiku 5.5
//         → pass(통과 = 처치) · retry(점수 + 피드백 · 다시 찍기 · 🙋 이의 신청) · check(⏳ 선생님 확인 · 장 수 안 깎임)
//   교사: 「📷 사진 채점」 = 웹 앱 주소 · 켜기 · 기준표 올리기/방마다 켜기 · 대시보드 「📷 서술형」 = 결과 · ✔ 처치 인정 / ✖ 그대로
//   Firebase: gcfg/photo = { url, on } · photo_rubric/{차시}/{방} · photo/{반}/{번호}/{차시_방}/{id} (중계소만 씀 · 사진 ✗) · photo_q/{반}/{번호}/{날짜}
//   사진은 이 폰에서 줄여 보내기만 하고 어디에도 저장하지 않는다 · 결과는 성적이 아니다
window.DS = window.DS || {};

DS.Photo = (function () {
  const N = () => DS.Net, { esc } = DS.UI;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const EDGE = 1024, QUAL = 0.82;
  const day = () => { const d = new Date(Date.now() + 9 * 3600e3); return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`; };
  let cfg = null, rub = null;
  async function load(force) {
    if (cfg && !force) return cfg;
    const [c, r] = await Promise.all([N().get('gcfg/photo').catch(() => null), N().get('photo_rubric').catch(() => null)]);
    cfg = c || {}; rub = r || {}; return cfg;
  }
  // ready() = 켜짐 · 주소 있음 / ready(차시, 방) = 그 방 기준표도 켜짐 (결정 5: 시범 방만 열림)
  const ROOM0 = 2, COOL0 = 30, DAILY0 = 6, WARN_DAY0 = 150, WARN_MONTH0 = 3000, WON = 1.2; // 학생 하루 장 수 · 경고 기준(학교 전체 하루 · 이번 달) · 1장 ≈ 1.2원 (실측)
  const daily = () => Number((cfg || {}).daily) || DAILY0;
  const roomMax = () => Number((cfg || {}).room) || ROOM0; // A: 방 하나 하루 장 수
  const coolSec = () => ((cfg || {}).cool != null && (cfg || {}).cool !== '' ? Number(cfg.cool) : COOL0); // D: 결과 뒤 쉬는 초
  const ready = (lid, rid) => !!(cfg && cfg.on && cfg.url) && (!lid || !!(((rub || {})[lid] || {})[rid] || {}).on);
  const keyOf = (lid, rid) => `${lid}_${rid}`;

  // 문제 글 · 정답 · 모범 풀이 · 숫자 (학생이 지금 푼 그 숫자 그대로)
  function pack(items) {
    const clean = (t) => String(t || '').replace(/\s*\(풀이는 학습지에\)\s*/g, ' ').replace(/^\d+\s+/, '').replace(/^\(이어서\)\s*/, '').trim();
    return { ask: items.map((q) => clean(q.question)).join(' / ').slice(0, 600), answer: items.map((q) => String(q.answer)).join(' / ').slice(0, 80), ref: items.map((q) => q.solution || '').join(' / ').slice(0, 600), params: Object.assign({}, ...items.map((q) => q.check || {})) };
  }
  const errMsg = (res) => (res && res.err === 'roomquota' ? `이 방은 오늘 ${roomMax()}번 다 해 봤어요 — 다른 방을 풀거나 내일 다시 도전해요!` : res && res.err === 'wait' ? `📷 ${Number(res.sec) || coolSec()}초 뒤에 다시 보낼 수 있어요 — 그동안 풀이를 고쳐 써요` : ERR[(res && res.err) || 'net'] || ERR.net);
  const ERR = { off: '선생님이 사진 채점을 잠깐 꺼 두었어요.', auth: '로그인이 풀렸어요. 다시 로그인해 주세요.', who: '이 기기의 로그인과 계정이 달라요. 다시 로그인해 주세요.', rubric: '이 문항은 아직 사진 채점을 준비 중이에요.', quota: '오늘 사진 채점을 다 썼어요 — 내일 또 해요!', busy: '지금 친구들이 한꺼번에 보내고 있어요. 30초 뒤 다시 보내 주세요.', api: '채점 서버가 잠깐 바빠요. 조금 뒤 다시 보내 주세요 (장 수는 그대로예요).', bad: '사진을 보내지 못했어요. 다시 찍어 주세요.', net: '인터넷이 끊겼거나 너무 오래 걸렸어요. 다시 보내 주세요.' };

  // ── 사진 고르기 · 돌리기 · 자르기 · 줄이기 ─────────────────────
  function pickFile(cam) {
    return new Promise((res) => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; if (cam) i.setAttribute('capture', 'environment');
      i.style.display = 'none'; document.body.appendChild(i);
      i.onchange = () => { const f = i.files && i.files[0]; i.remove(); res(f || null); };
      i.click();
    });
  }
  const loadImg = (file) => new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('사진을 열지 못했어요')); }; im.src = u; });
  // 돌린 원본 (긴 변 2048 까지) → 캔버스
  function rotated(im, r) {
    const s = Math.min(1, 2048 / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.round(im.naturalWidth * s), h = Math.round(im.naturalHeight * s);
    const c = document.createElement('canvas'), q = r % 2 === 1; c.width = q ? h : w; c.height = q ? w : h;
    const g = c.getContext('2d'); g.translate(c.width / 2, c.height / 2); g.rotate((r * Math.PI) / 2); g.drawImage(im, -w / 2, -h / 2, w, h); return c;
  }
  // 자른 부분 → 긴 변 1024 JPEG base64
  function exportJpeg(src, rc) {
    const s = Math.min(1, EDGE / Math.max(rc.w, rc.h)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(rc.w * s)); c.height = Math.max(1, Math.round(rc.h * s));
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(src, rc.x, rc.y, rc.w, rc.h, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', QUAL).split(',')[1];
  }

  // 단계마다 ✅ 칭찬 · ✏ 힌트 (2026-11-06 사용자 「맞은 것은 칭찬도」) — 기준표 문장은 안 보이고 AI 가 학생에게 쓴 한 줄만
  const stepList = (steps) => { const xs = Object.values(steps || {}).filter((x) => x && x.note); return xs.length ? `<ul class="ph-steps">${xs.map((x) => `<li class="${x.earned ? 'ok' : 'no'}"><i>${x.earned ? '✅' : '✏'}</i><span>${esc(x.note)}</span></li>`).join('')}</ul>` : ''; };
  async function post(body) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, t = setTimeout(() => ctl && ctl.abort(), 90000);
    try { const r = await fetch(cfg.url, { method: 'POST', body: JSON.stringify(body), redirect: 'follow', signal: ctl ? ctl.signal : undefined }); return await r.json(); } // text/plain = CORS 사전 요청 없음
    catch (e) { return { ok: false, err: 'net' }; } finally { clearTimeout(t); }
  }
  async function leftToday(m, rk) { const q = (await N().get(`photo_q/${ck(m.c)}/${m.n}/${day()}`).catch(() => null)) || {}; return { left: Math.max(0, daily() - (Number(q.n) || 0)), roomLeft: Math.max(0, roomMax() - (Number((q.r || {})[rk]) || 0)), wait: Math.max(0, Math.ceil(((Number(q.last) || 0) + coolSec() * 1000 - Date.now()) / 1000)) }; }

  // ── 학생: 채점 창 · ctx = { lesson, room, title, items } → Promise<{ status, id } | null> ─────────
  function grade(m, ctx) {
    return new Promise((done) => {
      const P = pack(ctx.items), r0 = ((rub || {})[ctx.lesson] || {})[ctx.room] || {};
      const el = document.createElement('div'); el.className = 'modal camp-modal ph-modal'; document.body.appendChild(el);
      let left = null, roomLeft = null, finished = false, coolUntil = 0; const rk = keyOf(ctx.lesson, ctx.room).replace(/[.#$/[\]]/g, '_');
      // D: 쉬는 시간 — 단추에 남은 초를 보여 주고 0 이 되면 누를 수 있게
      const coolBtn = (b, label) => { if (!b) return; const tick = () => { if (!document.body.contains(b)) return; const w = Math.ceil((coolUntil - Date.now()) / 1000); if (w > 0) { b.disabled = true; b.textContent = `${label} (${w}초 뒤)`; setTimeout(tick, 500); } else { b.disabled = false; b.textContent = label; } }; tick(); };
      const close = (v) => { if (finished) return; finished = true; el.remove(); done(v || null); };
      const head = (t) => `<div class="set-head"><h2>${t}</h2><button class="btn" data-x>닫기</button></div>`;
      const bindX = () => el.querySelectorAll('[data-x]').forEach((b) => (b.onclick = () => close(null)));
      const intro = (msg = '') => {
        el.innerHTML = `<div class="quiz-box framed ph-box">${head('📷 풀이 사진 올리기')}
          <p class="ph-q"><b>${esc(ctx.title || '')}</b><br>${esc(P.ask)}</p>
          ${msg}
          <ul class="ph-tips"><li>📄 <b>이 숫자 그대로</b> 종이에 풀이를 처음부터 끝까지 써요</li><li>💡 밝은 곳 · 위에서 똑바로 · 종이 한 장만 보이게</li><li>🙈 이름 · 얼굴은 찍히지 않게 (사진은 저장되지 않아요)</li><li>✅ 통과 = ${r0.total || 4}점 중 <b>${r0.pass || 3}점</b> 이상 · 하루 ${daily()}장 · 이 방은 하루 ${roomMax()}장${left != null ? ` (오늘 <b>${left}</b>장 · 이 방 <b>${roomLeft}</b>장 남음)` : ''}</li></ul>
          <div class="row ph-pick"><button class="btn primary big" id="ph-cam">📷 찍기</button><button class="btn" id="ph-alb">🖼 앨범에서</button></div>
          <p class="muted small">AI 가 기준표대로 먼저 채점하고, 애매하면 선생님이 직접 확인해요. 성적에는 쓰지 않아요.</p></div>`;
        bindX();
        coolBtn(el.querySelector('#ph-cam'), '📷 찍기'); coolBtn(el.querySelector('#ph-alb'), '🖼 앨범에서');
        el.querySelector('#ph-cam').onclick = () => choose(true);
        el.querySelector('#ph-alb').onclick = () => choose(false);
      };
      const choose = async (cam) => {
        const f = await pickFile(cam); if (!f) return;
        let im; try { im = await loadImg(f); } catch (e) { DS.UI.toast(e.message); return; }
        edit(im);
      };
      // ✂ 손가락으로 끌어 자르기 · ⟳ 돌리기
      const edit = (im) => {
        let r = 0, src = rotated(im, r), rc = { x: 0, y: 0, w: src.width, h: src.height };
        el.innerHTML = `<div class="quiz-box framed ph-box">${head('✂ 풀이 부분만 남기기')}
          <p class="muted small">사진 위를 손가락으로 끌면 그 부분만 남아요 (풀이 전체가 들어가게).</p>
          <div class="ph-stage"><canvas id="ph-cv"></canvas></div>
          <div class="row"><button class="btn" id="ph-rot">⟳ 돌리기</button><button class="btn" id="ph-all">↺ 전체</button><button class="btn" id="ph-re">📷 다시 찍기</button></div>
          <div class="row"><button class="btn primary big" id="ph-send">📨 채점 받기</button></div></div>`;
        bindX();
        const cv = el.querySelector('#ph-cv'), g = cv.getContext('2d');
        let sc = 1;
        const paint = () => {
          const box = el.querySelector('.ph-stage'), mw = Math.max(200, (box && box.clientWidth) || 320), mh = Math.max(200, Math.min(window.innerHeight * 0.55, 560));
          sc = Math.min(mw / src.width, mh / src.height); cv.width = Math.round(src.width * sc); cv.height = Math.round(src.height * sc);
          g.drawImage(src, 0, 0, cv.width, cv.height);
          g.fillStyle = 'rgba(0,0,0,.55)'; const X = rc.x * sc, Y = rc.y * sc, W = rc.w * sc, H = rc.h * sc;
          g.fillRect(0, 0, cv.width, Y); g.fillRect(0, Y + H, cv.width, cv.height - Y - H); g.fillRect(0, Y, X, H); g.fillRect(X + W, Y, cv.width - X - W, H);
          g.strokeStyle = '#ffd25a'; g.lineWidth = 2; g.strokeRect(X + 1, Y + 1, Math.max(0, W - 2), Math.max(0, H - 2));
        };
        let p0 = null;
        const at = (e) => { const b = cv.getBoundingClientRect(); return { x: Math.max(0, Math.min(src.width, ((e.clientX - b.left) / b.width) * src.width)), y: Math.max(0, Math.min(src.height, ((e.clientY - b.top) / b.height) * src.height)) }; };
        cv.onpointerdown = (e) => { p0 = at(e); if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId); e.preventDefault(); };
        cv.onpointermove = (e) => { if (!p0) return; const p = at(e); rc = { x: Math.min(p0.x, p.x), y: Math.min(p0.y, p.y), w: Math.abs(p.x - p0.x), h: Math.abs(p.y - p0.y) }; paint(); };
        cv.onpointerup = () => { p0 = null; if (rc.w < 40 || rc.h < 40) rc = { x: 0, y: 0, w: src.width, h: src.height }; paint(); };
        el.querySelector('#ph-rot').onclick = () => { r = (r + 1) % 4; src = rotated(im, r); rc = { x: 0, y: 0, w: src.width, h: src.height }; paint(); };
        el.querySelector('#ph-all').onclick = () => { rc = { x: 0, y: 0, w: src.width, h: src.height }; paint(); };
        el.querySelector('#ph-re').onclick = () => intro();
        el.querySelector('#ph-send').onclick = () => send(exportJpeg(src, rc));
        paint();
      };
      const send = async (image) => {
        el.innerHTML = `<div class="quiz-box framed ph-box"><h2>📨 채점 중…</h2><div class="ph-wait"><i></i></div><p class="muted">AI 가 풀이를 읽고 있어요 (10~20초) — 창을 닫지 말아 주세요.</p></div>`;
        const tok = await N().idToken().catch(() => null);
        const res = await post({ idToken: tok, c: m.c, n: m.n, lesson: ctx.lesson, room: ctx.room, ask: P.ask, answer: P.answer, ref: P.ref, params: P.params, image, media: 'image/jpeg' });
        if (finished) return;
        if (!res || !res.ok) { if (res && res.err === 'quota') left = 0; if (res && res.err === 'roomquota') roomLeft = 0; if (res && res.err === 'wait') coolUntil = Date.now() + (Number(res.sec) || coolSec()) * 1000; intro(`<p class="ph-err">⚠ ${esc(errMsg(res))}</p>`); return; }
        left = res.left != null ? res.left : left; roomLeft = res.roomLeft != null ? res.roomLeft : roomLeft; coolUntil = Date.now() + (res.cool != null ? Number(res.cool) : coolSec()) * 1000;
        result(res);
      };
      const result = (res) => {
        const sc = `<div class="ph-score ${res.status}"><b>${res.score}</b> / ${res.total}<span>통과 ${res.pass}점</span></div>`;
        const fb = (res.feedback ? `<p class="ph-fb">💬 ${esc(res.feedback)}</p>` : '') + stepList(res.steps);
        if (res.status === 'pass') {
          if (DS.Sound) DS.Sound.correct();
          el.innerHTML = `<div class="quiz-box framed ph-box">${head('🎉 풀이 통과!')}${sc}${fb}<div class="row"><button class="btn primary big" id="ph-ok">⚔ 처치하러!</button></div></div>`;
          bindX(); el.querySelector('#ph-ok').onclick = () => close({ status: 'pass', id: res.id });
          el.querySelector('[data-x]').onclick = () => close({ status: 'pass', id: res.id });
          return;
        }
        if (res.status === 'check') {
          el.innerHTML = `<div class="quiz-box framed ph-box">${head('⏳ 선생님이 직접 볼게요')}<p>사진이 흐리거나 AI 가 확신하지 못했어요. <b>선생님이 확인하면 처치</b>로 바뀌어요. 이번 장은 세지 않았어요${left != null ? ` (오늘 ${left}장 남음)` : ''}.</p>${fb}<div class="row"><button class="btn primary" id="ph-ok">알겠어요</button>${left && roomLeft !== 0 ? '<button class="btn" id="ph-again">📷 더 또렷하게 다시 찍기</button>' : ''}</div></div>`;
          bindX(); el.querySelector('#ph-ok').onclick = () => close({ status: 'check', id: res.id });
          el.querySelector('[data-x]').onclick = () => close({ status: 'check', id: res.id });
          const ag = el.querySelector('#ph-again'); if (ag) { ag.onclick = () => intro(); coolBtn(ag, '📷 더 또렷하게 다시 찍기'); }
          return;
        }
        el.innerHTML = `<div class="quiz-box framed ph-box">${head('✏ 조금만 더!')}${sc}${fb}<p class="muted small">빠진 단계를 채워 다시 찍어요 · 이 방 ${roomLeft != null ? roomLeft : '?'}장 · 오늘 ${left != null ? left : '?'}장 남음 · 점수가 이상하면 🙋 이의 신청 (선생님이 확인)</p>
          <div class="row">${left && roomLeft !== 0 ? '<button class="btn primary" id="ph-again">📷 고쳐서 다시 찍기</button>' : ''}<button class="btn" id="ph-app">🙋 이의 신청</button><button class="btn" data-x>나중에</button></div></div>`;
        bindX();
        const ag = el.querySelector('#ph-again'); if (ag) { ag.onclick = () => intro(); coolBtn(ag, '📷 고쳐서 다시 찍기'); }
        el.querySelector('#ph-app').onclick = () => appeal(res);
      };
      const appeal = (res) => {
        el.innerHTML = `<div class="quiz-box framed ph-box fb-box">${head('🙋 이의 신청')}<p class="muted small">어느 부분을 맞게 썼는지 적어 주세요. 선생님이 확인하고 맞으면 처치로 바꿔 줘요.</p>
          <textarea id="ph-at" maxlength="300" rows="4" placeholder="예) 2번째 줄에 X ⊂ B 라고 썼어요"></textarea><div class="row"><button class="btn primary" id="ph-as">📨 보내기</button></div></div>`;
        bindX();
        el.querySelector('#ph-as').onclick = () => DS.Control.run(async () => {
          const t = el.querySelector('#ph-at').value.trim(); if (t.length < 2) { DS.UI.toast('조금만 더 적어 주세요.'); return; }
          await N().set(`photo/${ck(m.c)}/${m.n}/${keyOf(ctx.lesson, ctx.room)}/${res.id}/appeal`, { t: t.slice(0, 300), at: N().TS });
          DS.UI.toast('📨 이의 신청을 보냈어요. 선생님이 확인할게요!', 3000); close({ status: 'appeal', id: res.id });
        });
      };
      intro();
      leftToday(m, rk).then((v) => { left = v.left; roomLeft = v.roomLeft; if (v.wait) coolUntil = Date.now() + v.wait * 1000; if (!finished && el.querySelector('#ph-cam')) intro(); }).catch(() => {});
    });
  }
  // 학생: 기다리던 확인 결과 → 'ok' (처치 인정) · 'no' (그대로) · 'wait'
  async function pendState(m, lid, rid, id) {
    const x = await N().get(`photo/${ck(m.c)}/${m.n}/${keyOf(lid, rid)}/${id}`).catch(() => null);
    return !x ? 'no' : x.ok === true ? 'ok' : x.ok === false ? 'no' : 'wait';
  }

  // ── 교사: 설정 · 기준표 ─────────────────────────────────
  async function settings() {
    await load(true);
    const el = document.createElement('div'); el.className = 'modal fb-modal ph-modal'; document.body.appendChild(el);
    const list = () => Object.entries(DS.Rubrics || {}).flatMap(([l, rs]) => Object.entries(rs).map(([r, x]) => ({ l, r, x, fb: (rub[l] || {})[r] })));
    let U = await usage().catch(() => null);
    const draw = () => {
      const q = list(), up = q.filter((y) => y.fb).length;
      el.innerHTML = `<div class="quiz-box framed fb-box wide">${'<div class="set-head"><h2>📷 사진 채점 설정</h2><button class="btn" data-x>닫기</button></div>'}
        <p class="muted small">설치 · 결정은 docs/PHOTO-PREP.md · API 키는 Apps Script 스크립트 속성에만 (여기 넣지 않아요) · 사진은 저장되지 않아요</p>
        <div class="ph-set"><label>웹 앱 주소 <input id="ph-url" type="url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(cfg.url || '')}"></label>
          <label class="ph-on"><input type="checkbox" id="ph-on"${cfg.on ? ' checked' : ''}> 학생에게 켜기 (끄면 서술형 방이 다시 잠겨요)</label>
          <div class="ph-lim"><label>학생 하루 <input id="ph-daily" type="number" min="1" max="20" value="${daily()}"> 장 · 방 하나 하루 <input id="ph-room" type="number" min="1" max="10" value="${roomMax()}"> 장 · 다음 사진까지 <input id="ph-cool" type="number" min="0" max="600" value="${coolSec()}"> 초</label><label>⚠ 경고: 학교 전체 하루 <input id="ph-wd" type="number" min="10" max="1000" value="${Number(cfg.warnDay) || WARN_DAY0}"> 장 · 이번 달 <input id="ph-wm" type="number" min="100" max="50000" value="${Number(cfg.warnMonth) || WARN_MONTH0}"> 장 넘으면</label></div>
          <div class="row"><button class="btn primary" id="ph-save">💾 저장</button><button class="btn" id="ph-ping">🔌 연결 확인</button></div></div>
        ${useHtml(U)}
        <h3>채점 기준표 <small class="muted">올림 ${up} / ${q.length} · 켠 방만 학생에게 열려요 (시범 = 1층 07 · 11)</small></h3>
        <table class="ph-rub"><tr><th>방</th><th>배점</th><th>Firebase</th><th>켜기</th></tr>${q.map((y) => `<tr><td>${esc(y.l.replace('eval-', '평가'))} · ${esc(y.x.title)}</td><td>${y.x.pass} / ${y.x.total}</td><td>${y.fb ? '✔ 올림' : '<span class="muted">없음</span>'}</td><td><input type="checkbox" data-on="${y.l}|${y.r}"${y.fb && y.fb.on ? ' checked' : ''}${y.fb ? '' : ' disabled'}></td></tr>`).join('')}</table>
        <div class="row"><button class="btn" id="ph-up">📤 기준표 올리기 (코드의 기준표 → Firebase · 켜기는 그대로)</button></div></div>`;
      el.querySelector('[data-x]').onclick = () => el.remove();
      el.querySelector('#ph-save').onclick = () => DS.Control.run(async () => {
        const url = el.querySelector('#ph-url').value.trim(), on = el.querySelector('#ph-on').checked;
        if (url && !/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) { DS.UI.toast('Apps Script 웹 앱 주소(https://script.google.com/…/exec)를 넣어 주세요.'); return; }
        if (on && !url) { DS.UI.toast('주소를 먼저 넣어 주세요.'); return; }
        const num = (id, lo, hi, d) => Math.max(lo, Math.min(hi, Math.round(Number(el.querySelector(id).value) || d)));
        await N().update('gcfg/photo', { url, on, daily: num('#ph-daily', 1, 20, DAILY0), room: num('#ph-room', 1, 10, ROOM0), cool: Math.max(0, Math.min(600, Math.round(Number(el.querySelector('#ph-cool').value)))), warnDay: num('#ph-wd', 10, 1000, WARN_DAY0), warnMonth: num('#ph-wm', 100, 50000, WARN_MONTH0) }); await load(true); U = await usage().catch(() => U); draw(); DS.UI.toast(on ? '📷 켰어요 — 기준표를 켠 방이 학생에게 열려요' : '💾 저장했어요');
      });
      el.querySelector('#ph-ping').onclick = () => DS.Control.run(async () => {
        const url = el.querySelector('#ph-url').value.trim(); if (!url) { DS.UI.toast('주소를 먼저 넣어 주세요.'); return; }
        try { const r = await (await fetch(url, { redirect: 'follow' })).json(); DS.UI.toast(r && r.alive ? `✅ 연결됨 · 중계소 ${r.on ? '켜짐' : '꺼짐(ENABLED=0)'}` : '⚠ 응답이 이상해요', 3500); }
        catch (e) { DS.UI.toast('❌ 연결 안 됨 — 웹 앱 배포(액세스: 모든 사용자)와 주소를 확인해 주세요', 4000); }
      });
      el.querySelector('#ph-up').onclick = () => DS.Control.run(async () => {
        const q = list(); if (!confirm(`기준표 ${q.length}개를 Firebase 에 올릴까요? (켜기 상태는 그대로 · 처음 올리는 방은 코드 기본값)`)) return;
        for (const y of q) await N().set(`photo_rubric/${y.l}/${y.r}`, Object.assign({}, y.x, { on: y.fb ? !!y.fb.on : !!y.x.on }));
        await load(true); draw(); DS.UI.toast('📤 올렸어요');
      });
      el.querySelectorAll('[data-on]').forEach((b) => (b.onchange = () => DS.Control.run(async () => { const [l, r] = b.dataset.on.split('|'); await N().set(`photo_rubric/${l}/${r}/on`, b.checked); await load(true); draw(); })));
    };
    draw();
  }

  // ── 교사: 대시보드 「📷 서술형」 ──────────────────────────
  async function all() {
    const v = (await N().get('photo').catch(() => null)) || {}, out = [];
    Object.entries(v).forEach(([c, byN]) => Object.entries(byN || {}).forEach(([n, byK]) => Object.entries(byK || {}).forEach(([k, byId]) => Object.entries(byId || {}).forEach(([id, x]) => { if (x && x.status) out.push({ ...x, steps: Object.values(x.steps || {}), flags: Object.values(x.flags || {}), c, n: Number(n), k, id }); }))));
    return out.sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
  }
  const needs = (x) => x.ok == null && (x.status === 'check' || !!x.appeal);
  async function pending() { return (await all()).filter(needs).length; }
  // 📊 사용량 · ⚠ 경고 (2026-11-06 사용자 「실제 전체 시행 횟수가 많으면 경고」): photo_q/_all/{날짜} = 그날 학교 전체 장 수
  async function usage() {
    await load(); const v = (await N().get('photo_q/_all').catch(() => null)) || {}, d = day(), mon = d.slice(0, 6);
    const today = Number(v[d]) || 0, month = Object.entries(v).filter(([k]) => k.startsWith(mon)).reduce((a, [, n]) => a + (Number(n) || 0), 0);
    const wd = Number((cfg || {}).warnDay) || WARN_DAY0, wm = Number((cfg || {}).warnMonth) || WARN_MONTH0;
    return { today, month, won: Math.round(month * WON), wd, wm, warn: today >= wd || month >= wm, why: [today >= wd ? `오늘 학교 전체 ${today}장 (기준 ${wd})` : '', month >= wm ? `이번 달 ${month}장 ≈ ${Math.round(month * WON).toLocaleString()}원 (기준 ${wm}장)` : ''].filter(Boolean).join(' · ') };
  }
  const useHtml = (u) => (!u ? '' : `<div class="ph-use${u.warn ? ' warn' : ''}">${u.warn ? `<b>⚠ 사용량 경고</b> ${esc(u.why)} — 학생 하루 장 수를 줄이거나 잠깐 꺼 둘 수 있어요<br>` : ''}📈 오늘 학교 전체 <b>${u.today}</b>장 · 이번 달 <b>${u.month}</b>장 ≈ <b>${u.won.toLocaleString()}</b>원</div>`);
  // host = 그릴 곳 · opt = { cls(없으면 모든 반), roster }
  async function board(host, opt = {}) {
    let list = await all(), filt = 'need'; const U = await usage().catch(() => null);
    const nm = (x) => { const r = ((opt.roster || {})[x.c] || {})[x.n]; return typeof r === 'string' ? r : (r && r.name) || ''; };
    const roomT = (k) => { const [l, r] = k.split('_'); const y = ((DS.Rubrics || {})[l] || {})[r]; return `${l.replace('eval-', '평가')} ${y ? y.title : r}`; };
    const when = (t) => { const d = new Date(Number(t) + 9 * 3600e3); return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };
    const ST = { pass: '✅ 통과', retry: '✏ 재도전', check: '⏳ 확인 필요' };
    const draw = () => {
      const mine = list.filter((x) => !opt.cls || x.c === ck(opt.cls)), shown = mine.filter((x) => (filt === 'need' ? needs(x) : true));
      const tin = mine.reduce((a, x) => a + ((x.tok || {}).in || 0), 0), tout = mine.reduce((a, x) => a + ((x.tok || {}).out || 0), 0), won = Math.round(((tin * 0.1 + tout * 0.5) / 1e6) * 1400);
      host.innerHTML = `${useHtml(U)}<p class="muted small">AI 채점 결과 (성적 아님) · ⏳ 확인 필요 = 확신 낮음 · 사진 속 지시 · 다른 문제 등 · 🙋 = 학생 이의 신청 · ✔ 를 누르면 그 학생이 성채에 들어올 때 처치로 바뀌어요 · 사진은 저장되지 않아 글자만 보여요</p>
        <div class="tabs"><button class="tab${filt === 'need' ? ' on' : ''}" data-pf="need">확인할 것 ${mine.filter(needs).length}</button><button class="tab${filt === 'all' ? ' on' : ''}" data-pf="all">전체 ${mine.length}</button><span class="muted small ph-cost">통과 ${mine.filter((x) => x.status === 'pass').length} · 재도전 ${mine.filter((x) => x.status === 'retry').length} · 토큰 ${tin.toLocaleString()} / ${tout.toLocaleString()} ≈ ${won.toLocaleString()}원</span></div>
        <div class="fb-list">${shown.map((x) => `<div class="fb-item${needs(x) ? ' new' : ''}"><div class="fb-meta"><b>${ST[x.status] || esc(x.status)}${x.ok === true ? ' → ✔ 인정' : x.ok === false ? ' → ✖ 그대로' : ''}</b> · ${esc(x.c)}반 ${x.n}번 ${esc(nm(x))} · ${esc(roomT(x.k))} · <b>${x.score} / ${x.total}</b> (통과 ${x.pass}) · 확신 ${esc(x.conf || '')} · ${when(x.at)}${(x.flags || []).length ? ` · 🚩 ${esc(x.flags.join(', '))}` : ''}</div>
          <p>📝 ${esc(x.ask || '')}<br>정답 ${esc(x.right || '')} · AI 가 읽은 답 ${esc(x.ans || '-')}<br>단계 ${(x.steps || []).map((s) => `${esc(s.id)} ${s.earned}/${s.pts}${s.note ? ` (${esc(s.note)})` : ''}`).join(' · ')}<br>💬 ${esc(x.fb || '')}${x.appeal ? `<br><b>🙋 이의 신청:</b> ${esc(x.appeal.t || '')}` : ''}</p>
          ${x.ok == null ? `<div class="row"><button class="btn small primary" data-ok="${esc(x.c)}|${x.n}|${esc(x.k)}|${esc(x.id)}|1">✔ 처치 인정</button><button class="btn small" data-ok="${esc(x.c)}|${x.n}|${esc(x.k)}|${esc(x.id)}|0">✖ 그대로 (다시 풀기)</button></div>` : ''}</div>`).join('') || '<p class="muted">확인할 것이 없어요.</p>'}</div>`;
      host.querySelectorAll('[data-pf]').forEach((b) => (b.onclick = () => { filt = b.dataset.pf; draw(); }));
      host.querySelectorAll('[data-ok]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
        const [c, n, k, id, v] = b.dataset.ok.split('|');
        await N().update(`photo/${c}/${n}/${k}/${id}`, { ok: v === '1', okAt: N().TS });
        const x = list.find((y) => y.c === c && String(y.n) === n && y.k === k && y.id === id); if (x) x.ok = v === '1';
        draw(); DS.UI.toast(v === '1' ? '✔ 처치로 인정했어요' : '✖ 그대로 두었어요');
      })));
    };
    draw();
  }
  return { load, ready, pack, grade, pendState, settings, board, pending, all, keyOf, day, usage, useHtml, daily };
})();
