// 📮 우편함 = 선생님 소식 + 보내기 (2026-11-07 6판 · 시안 「복습 · 우편함 · 출제 공방」 확정)
//   받은 소식: 🎁 선생님 선물(gem log gift) · 🎁 친구 선물(fgift · 「받기」) · 📢 공지(notice) · 💌 선생님 답장(fbr)
//   보내기: 💌 편지(= 의견 보내기) · 📝 설문 · 🎁 친구 선물(반마다 선생님이 켜야 · 처음엔 꺼짐)
//   📕 오답노트는 🎯 복습 허수아비로 옮김 · 안 읽은 소식 수 = 우편함 배지
//   저장: notice/{반}/{id} = { t, at } · fbr/{반}/{번호}/{fb id} = { t, at, q } · fgift/{반}/{받는 번호}/{id} = { from, fromName, fromUid, g, msg, at, got } · gcfg/giftOn/{반} = true
window.DS = window.DS || {};
DS.Mail = (() => {
  const { esc } = DS.UI;
  const N = () => DS.Net, ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const GIFT = { sendDay: 10, recvDay: 10, steps: [1, 2, 3, 5, 10], words: ['고마워', '힘내!', '잘했어'] };
  const day = () => (DS.Gem && DS.Gem.today ? DS.Gem.today() : new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10));
  const dayOf = (t) => new Date(Number(t) + 9 * 3600e3).toISOString().slice(0, 10);
  const md = (t) => { const x = new Date(Number(t) + 9 * 3600e3); return `${x.getUTCMonth() + 1}/${x.getUTCDate()} ${String(x.getUTCHours()).padStart(2, '0')}:${String(x.getUTCMinutes()).padStart(2, '0')}`; };
  const seenKey = (m) => `citadel-mail-seen-${ck(m.c)}-${m.n}`;
  const seenGet = (m) => { try { return Number(localStorage.getItem(seenKey(m))) || 0; } catch (e) { return 0; } };
  const seenSet = (m, t) => { try { localStorage.setItem(seenKey(m), String(t)); } catch (e) { /* 이 기기만 */ } };
  // 📢 #61 공지 팝업: 마지막으로 본 공지 시각 (우편함을 열었으면 그때까지도 본 것)
  const ntKey = (m) => `citadel-notice-seen-${ck(m.c)}-${m.n}`;
  const ntGet = (m) => { try { return Math.max(Number(localStorage.getItem(ntKey(m))) || 0, seenGet(m)); } catch (e) { return seenGet(m); } };
  const ntSet = (m, t) => { try { localStorage.setItem(ntKey(m), String(t)); } catch (e) { /* 이 기기만 */ } };
  const giftOn = async (c) => (await N().get(`gcfg/giftOn/${ck(c)}`).catch(() => null)) === true;

  // 받은 소식 목록 (최근 순)
  async function inbox(m) {
    const k = ck(m.c);
    const [gem, fg, nt, rp] = await Promise.all([
      DS.Gem ? DS.Gem.mine(m).catch(() => ({})) : {},
      N().get(`fgift/${k}/${m.n}`).catch(() => null), N().get(`notice/${k}`).catch(() => null), N().get(`fbr/${k}/${m.n}`).catch(() => null),
    ]);
    const out = [];
    (DS.Gem && DS.Gem.giftList ? DS.Gem.giftList(gem) : []).forEach((x) => out.push({ k: 'tgift', at: Number(x.at) || 0, g: x.g, s: x.s, t: x.why || '선생님 선물', got: true }));
    Object.entries(fg || {}).forEach(([id, x]) => x && out.push({ k: 'fgift', id, at: Number(x.at) || 0, g: x.g, t: `${x.fromName || '친구'} · 💎 ${x.g}${x.msg ? ` · 「${x.msg}」` : ''}`, got: !!x.got }));
    Object.entries(nt || {}).forEach(([id, x]) => x && x.t && out.push({ k: 'notice', id, at: Number(x.at) || 0, t: x.t }));
    Object.entries(rp || {}).forEach(([id, x]) => x && x.t && out.push({ k: 'reply', id, at: Number(x.at) || 0, t: x.t, q: x.q || '' }));
    return out.sort((a, b) => b.at - a.at);
  }
  async function unread(m) { if (!m || m.test || m.teacher) return 0; const s = seenGet(m); return (await inbox(m)).filter((x) => x.at > s || (x.k === 'fgift' && !x.got)).length; }

  // 🎁 친구 선물 받기: 내 💎 에 더하고 got 표시 (하루 받기 한도 💎 10)
  async function claim(m, id) {
    const p = `fgift/${ck(m.c)}/${m.n}/${id}`, x = await N().get(p);
    if (!x || x.got) return 0;
    const all = (await N().get(`fgift/${ck(m.c)}/${m.n}`).catch(() => null)) || {};
    const today = Object.values(all).filter((y) => y && y.got && dayOf(y.gotAt || y.at) === day()).reduce((a, y) => a + (Number(y.g) || 0), 0);
    const g = Math.max(0, Math.min(Number(x.g) || 0, GIFT.recvDay - today));
    if (!g) throw Object.assign(new Error('오늘은 친구 선물을 💎 10 까지 받았어요 — 내일 받아요!'), { user: true });
    const d = await DS.Gem.mine(m);
    await N().update(`gem/${ck(m.c)}/${m.n}`, { total: (Number(d.total) || 0) + g, earned: (Number(d.earned) || 0) + g, [`log/fg_${id}`]: { g, at: N().TS, why: `🎁 ${String(x.fromName || '친구').slice(0, 12)} 선물` } });
    await N().update(p, { got: true, gotAt: N().TS, gotG: g });
    return g;
  }
  // 🎁 친구 선물 보내기: 내 💎 에서 빠짐 · 하루 보내기 💎 10 · 같은 친구 하루 1번 · 같은 반만
  async function send(m, toN, g, msg) {
    g = Math.floor(Number(g) || 0); toN = Number(toN);
    if (!(await giftOn(m.c))) throw Object.assign(new Error('친구 선물은 선생님이 켜야 보낼 수 있어요.'), { user: true });
    if (!toN || toN === Number(m.n)) throw Object.assign(new Error('선물할 친구를 골라요.'), { user: true });
    if (g < 1 || g > GIFT.sendDay) throw Object.assign(new Error(`💎 1 ~ ${GIFT.sendDay} 까지 보낼 수 있어요.`), { user: true });
    const d = await DS.Gem.mine(m), log = d.log || {}, today = day();
    const sent = Object.entries(log).filter(([k]) => k.startsWith(`fs_${today}_`));
    const sum = sent.reduce((a, [, x]) => a - (Number(x.g) || 0), 0);
    if (sent.some(([k]) => k.startsWith(`fs_${today}_${toN}_`))) throw Object.assign(new Error('이 친구에게는 오늘 이미 보냈어요 — 내일 또!'), { user: true });
    if (sum + g > GIFT.sendDay) throw Object.assign(new Error(`오늘은 💎 ${GIFT.sendDay - sum} 까지만 더 보낼 수 있어요.`), { user: true });
    if ((Number(d.total) || 0) < g) throw Object.assign(new Error(`💎 가 ${g - (Number(d.total) || 0)}개 모자라요.`), { user: true });
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    await N().set(`fgift/${ck(m.c)}/${toN}/${id}`, { from: Number(m.n), fromName: `${m.n}번 ${m.name || ''}`.trim(), fromUid: N().uid(), g, msg: GIFT.words.includes(msg) ? msg : '', at: N().TS });
    await N().update(`gem/${ck(m.c)}/${m.n}`, { total: (Number(d.total) || 0) - g, [`log/fs_${today}_${toN}_${id}`]: { g: -g, at: N().TS, why: `🎁 ${toN}번에게 선물` } });
    return g;
  }

  // ── 학생 우편함 ───────────────────────────────
  async function open(m, opt = {}) {
    const el = document.createElement('div'); el.className = 'modal camp-modal mail-modal'; document.body.appendChild(el);
    const ICON = { tgift: '🎁', fgift: '🎁', notice: '📢', reply: '💌' }, KIND = { tgift: '선생님 선물', fgift: '친구 선물', notice: '선생님 공지', reply: '선생님 답장' };
    const draw = async () => {
      const [list, on, gem, sv] = await Promise.all([inbox(m), giftOn(m.c), DS.Gem ? DS.Gem.mine(m).catch(() => ({})) : {}, DS.Survey && DS.Survey.pending && DS.Survey.pending() ? 1 : 0]);
      const s = seenGet(m), un = list.filter((x) => x.at > s || (x.k === 'fgift' && !x.got)).length;
      el.innerHTML = `<div class="quiz-box framed rs-box mail-box"><div class="quiz-head"><b>📮 우편함</b><span class="mail-gem">💎 ${Number(gem.total) || 0}</span><button class="btn small" id="ml-x">✕ 닫기</button></div>
        <p class="mail-sub"><b>받은 소식</b><span class="muted small">${un ? `안 읽음 ${un}` : '모두 읽음'}</span></p>
        <div class="mail-list">${list.length ? list.slice(0, 30).map((x) => `<div class="mi${x.at > s || (x.k === 'fgift' && !x.got) ? ' unread' : ''}"><span class="ico2">${ICON[x.k]}</span><span class="tx">${esc(x.k === 'tgift' ? `${x.t}${x.g ? ` · 💎 ${x.g}` : ''}${x.s ? ` · 📜 ${x.s}` : ''}` : x.t)}${x.k === 'reply' && x.q ? `<small>내 편지 「${esc(String(x.q).slice(0, 24))}…」</small>` : ''}<small>${KIND[x.k]} · ${md(x.at)}</small></span>${x.k === 'fgift' && !x.got ? `<button class="btn small primary" data-claim="${x.id}">받기</button>` : x.k === 'fgift' || x.k === 'tgift' ? '<span class="muted small">✔ 받음</span>' : ''}</div>`).join('') : '<p class="muted small">아직 받은 소식이 없어요.</p>'}</div>
        <p class="mail-sub"><b>보내기</b></p>
        <div class="sendrow"><button class="btn" id="ml-letter"><i>💌</i>편지</button><button class="btn" id="ml-sv"${sv ? '' : ' disabled'}><i>📝</i>설문${sv ? `<b class="mk-bd">${sv}</b>` : ''}</button><button class="btn" id="ml-gift"${on ? '' : ' disabled'} title="${on ? '' : '선생님이 켜면 보낼 수 있어요'}"><i>🎁</i>친구 선물</button></div>
        <p class="muted small">편지 = 선생님께 · 버그 · 아이디어 · 기타 · 위 💬 단추로도 바로 써요${on ? '' : ' · 🎁 친구 선물은 선생님이 켜면 열려요'}</p>
        <p class="mail-sub"><b>🎒 지난 전리품</b></p><div id="ml-hist" class="lh-list"><p class="muted small">불러오는 중…</p></div></div>`; // #71 (2026-11-11): 접힌 「지난 수업 결과」 → 펼친 채 한 창
      seenSet(m, Date.now());
      el.querySelector('#ml-x').onclick = () => { el.remove(); if (opt.onClose) opt.onClose(); };
      el.querySelectorAll('[data-claim]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { const g = await claim(m, b.dataset.claim); if (g) { DS.UI.toast(`🎁 💎 +${g} 받았어요!`); if (DS.Sound && DS.Sound.coin) DS.Sound.coin(); } await draw(); })));
      el.querySelector('#ml-letter').onclick = () => DS.Feedback.open(m, { from: '우편함' });
      el.querySelector('#ml-sv').onclick = () => { if (DS.Survey && DS.Survey.open) DS.Survey.open(m, () => draw()); };
      el.querySelector('#ml-gift').onclick = () => DS.Control.run(() => giftDlg(m, () => draw()));
      { const box = el.querySelector('#ml-hist'); N().get(`records/${ck(m.c)}/${m.n}`).catch(() => null).then((rec) => { if (box.isConnected) box.innerHTML = DS.Result ? DS.Result.lootHist(rec || {}) : ''; }); }
    };
    await draw();
  }
  // 📢 #61 공지 팝업 (캠프 · 대기실에 들어올 때 · 안 읽은 공지만 · 선물 · 답장은 띄우지 않음)
  //   「📮 우편함 열기」 = 캠프 📮 와 같은 창 · 두 단추 모두 그 공지까지 본 것으로
  let popBusy = false;
  async function noticeUnread(m) {
    if (!m || m.teacher || m.c == null || !m.n) return [];
    const nt = (await N().get(`notice/${ck(m.c)}`).catch(() => null)) || {}, s = ntGet(m);
    return Object.values(nt).filter((x) => x && x.t && (Number(x.at) || 0) > s).sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
  }
  async function noticePop(m, opt = {}) {
    if (popBusy || document.querySelector('.nt-pop')) return false;
    popBusy = true;
    try {
      const list = await noticeUnread(m);
      if (!list.length || (opt.ok && !opt.ok())) return false;
      const top = list[0], until = Number(top.at) || Date.now();
      const el = document.createElement('div'); el.className = 'modal camp-modal nt-pop'; document.body.appendChild(el);
      el.innerHTML = `<div class="quiz-box framed rs-box nt-box"><div class="quiz-head"><b>📢 선생님 공지</b></div>
        ${list.length > 1 ? `<p class="nt-n">새 공지 ${list.length}개</p>` : ''}<p class="nt-t">${esc(top.t)}</p><p class="muted small">${md(top.at)}</p>
        <div class="nt-btns"><button class="btn primary" id="nt-mail">📮 우편함 열기</button><button class="btn" id="nt-x">닫기</button></div></div>`;
      const done = () => { ntSet(m, until); el.remove(); };
      el.querySelector('#nt-x').onclick = done;
      if (DS.UI.frame) DS.UI.frame(el); // 🪟 창 공통 틀: 위 ✕ 만 (아래 「닫기」 는 숨김 · 2026-11-10 선생님 「위에 X만」) · 바깥 누르면 닫힘
      el.querySelector('#nt-mail').onclick = () => { done(); if (opt.openMail) opt.openMail(); else DS.Control.run(() => open(m)); };
      return true;
    } finally { popBusy = false; }
  }
  const noticeClose = () => document.querySelectorAll('.nt-pop').forEach((e) => e.remove());
  // 🎁 친구 선물 창
  async function giftDlg(m, done) {
    const masks = (await N().get(`rosterMask/${ck(m.c)}`).catch(() => null)) || {};
    const fg = {}; // 오늘 받은 친구 (흐리게): 내 반 친구들 받은 합 · 내가 오늘 보낸 친구
    const gem = await DS.Gem.mine(m), today = day();
    const sentTo = new Set(Object.keys(gem.log || {}).filter((k) => k.startsWith(`fs_${today}_`)).map((k) => Number(k.split('_')[2])));
    const sentSum = Object.entries(gem.log || {}).filter(([k]) => k.startsWith(`fs_${today}_`)).reduce((a, [, x]) => a - (Number(x.g) || 0), 0);
    const friends = Object.keys(masks).map(Number).filter((n) => n && n !== Number(m.n)).sort((a, b) => a - b);
    let to = 0, g = Math.min(5, Math.max(1, GIFT.sendDay - sentSum)), msg = GIFT.words[1];
    const el = document.createElement('div'); el.className = 'modal camp-modal'; document.body.appendChild(el);
    const draw = () => {
      el.innerHTML = `<div class="quiz-box framed rs-box gift-box"><div class="quiz-head"><b>🎁 친구에게 선물</b><button class="btn small" id="gf-x">✕ 닫기</button></div>
        <p class="mail-sub"><b>누구에게?</b><span class="muted small">우리 반만 · 오늘 보낸 친구는 흐리게</span></p>
        <div class="gf-to">${friends.map((n) => `<button class="btn small${n === to ? ' on' : ''}${sentTo.has(n) ? ' off' : ''}" data-to="${n}"${sentTo.has(n) ? ' disabled' : ''}>${n} ${esc(masks[n] || '')}</button>`).join('') || '<p class="muted small">명단이 없어요.</p>'}</div>
        <p class="mail-sub"><b>얼마?</b><span class="muted small">가진 💎 ${Number(gem.total) || 0}</span></p>
        <div class="stepper"><button class="btn" data-g="-1">−</button><b>💎 ${g}</b><button class="btn" data-g="1">＋</button></div>
        <p class="mail-sub"><b>한마디</b><span class="muted small">고르기만</span></p>
        <div class="phr">${GIFT.words.map((w) => `<button class="btn small${w === msg ? ' on' : ''}" data-w="${w}">${w}</button>`).join('')}</div>
        <p class="muted small">오늘 보낸 💎 ${sentSum} / ${GIFT.sendDay} · 같은 친구는 하루 1번 · 친구도 하루 💎 ${GIFT.recvDay} 까지만 받아요 · 내 💎 에서 빠져요 · 보낸 기록은 선생님이 봐요</p>
        <button class="btn primary big" id="gf-go"${to ? '' : ' disabled'}>🎁 💎 ${g} 보내기</button></div>`;
      el.querySelector('#gf-x').onclick = () => el.remove();
      el.querySelectorAll('[data-to]').forEach((b) => (b.onclick = () => { to = Number(b.dataset.to); draw(); }));
      el.querySelectorAll('[data-g]').forEach((b) => (b.onclick = () => { g = Math.max(1, Math.min(GIFT.sendDay - sentSum, g + Number(b.dataset.g))); draw(); }));
      el.querySelectorAll('[data-w]').forEach((b) => (b.onclick = () => { msg = b.dataset.w; draw(); }));
      el.querySelector('#gf-go').onclick = () => DS.Control.run(async () => { await send(m, to, g, msg); DS.UI.toast(`🎁 ${to}번에게 💎 ${g} 보냈어요!`); el.remove(); if (done) done(); });
    };
    draw();
  }

  // ── 교사: 📢 공지 · 💌 답장 · 🎁 친구 선물 켜기 · 기록 ─────────
  async function notice(cls, t) { t = String(t || '').trim().slice(0, 300); if (!t) return; const id = Date.now().toString(36); await N().set(`notice/${ck(cls)}/${id}`, { t, at: N().TS }); }
  // 📢 #61 모든 반에 같은 공지 (같은 id · all 표시 = 교사 목록 「전체」)
  async function noticeAll(classes, t) { t = String(t || '').trim().slice(0, 300); if (!t || !classes.length) return 0; const id = Date.now().toString(36); await Promise.all(classes.map((c) => N().set(`notice/${ck(c)}/${id}`, { t, at: N().TS, all: true }))); return classes.length; }
  async function reply(c, n, fbId, t, q) { t = String(t || '').trim().slice(0, 300); if (!t) return; await N().set(`fbr/${ck(c)}/${n}/${fbId}`, { t, at: N().TS, q: String(q || '').slice(0, 60) }); }
  async function setGift(cls, on) { await N().set(`gcfg/giftOn/${ck(cls)}`, on ? true : null); }
  async function giftLog(cls) {
    const v = (await N().get(`fgift/${ck(cls)}`).catch(() => null)) || {}, out = [];
    Object.entries(v).forEach(([n, byId]) => Object.values(byId || {}).forEach((x) => x && out.push({ to: Number(n), ...x })));
    return out.sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
  }
  async function teacher() {
    const cls = Object.keys((await N().get('rosterMask').catch(() => null)) || {}).sort();
    const el = document.createElement('div'); el.className = 'modal camp-modal'; document.body.appendChild(el);
    let cur = cls[0] || '';
    const draw = async () => {
      const on = cur ? await giftOn(cur) : false, log = cur ? await giftLog(cur) : [], nts = cur ? (await N().get(`notice/${ck(cur)}`).catch(() => null)) || {} : {};
      el.innerHTML = `<div class="quiz-box framed rs-box"><div class="quiz-head"><b>📮 우편함 보내기 (교사)</b><button class="btn small" id="tm-x">✕ 닫기</button></div>
        <label>반 <select id="tm-cls">${cls.map((c) => `<option${c === cur ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
        <p class="mail-sub"><b>📢 공지</b><span class="muted small">이 반 학생 우편함에 「새 소식」으로</span></p>
        <textarea id="tm-t" maxlength="300" rows="2" placeholder="예: 내일 6차시 형성평가 있어요"></textarea><div class="tm-sendrow"><button class="btn primary" id="tm-send">📢 공지 보내기</button><button class="btn" id="tm-all"${cls.length ? '' : ' disabled'}>📢 모든 반에 보내기</button></div>
        <div class="mail-list">${Object.entries(nts).sort((a, b) => (b[1].at || 0) - (a[1].at || 0)).slice(0, 5).map(([id, x]) => `<div class="mi"><span class="ico2">📢</span><span class="tx">${x.all ? '<b class="tm-all">전체</b> ' : ''}${esc(x.t)}<small>${md(x.at)}${x.all ? ' · 모든 반' : ''}</small></span><button class="btn small" data-del="${id}">🗑</button></div>`).join('')}</div>
        <p class="mail-sub"><b>🎁 친구 선물</b><span class="muted small">반마다 처음엔 꺼짐 · 하루 보내기 · 받기 💎 ${GIFT.sendDay}</span></p>
        <button class="btn${on ? ' primary' : ''}" id="tm-gift">${on ? '🎁 켜짐 → 끄기' : '🎁 꺼짐 → 켜기'}</button>
        <div class="mail-list">${log.slice(0, 20).map((x) => `<div class="mi"><span class="ico2">🎁</span><span class="tx">${esc(x.fromName || '')} → ${x.to}번 · 💎 ${x.g}${x.msg ? ` · 「${esc(x.msg)}」` : ''}<small>${md(x.at)}${x.got ? ' · 받음' : ' · 아직 안 받음'}</small></span></div>`).join('') || '<p class="muted small">아직 친구 선물 기록이 없어요.</p>'}</div></div>`;
      el.querySelector('#tm-x').onclick = () => el.remove();
      el.querySelector('#tm-cls').onchange = (e) => { cur = e.target.value; draw(); };
      el.querySelector('#tm-send').onclick = () => DS.Control.run(async () => { await notice(cur, el.querySelector('#tm-t').value); DS.UI.toast('📢 공지를 보냈어요'); draw(); });
      el.querySelector('#tm-all').onclick = () => DS.Control.run(async () => { const t = el.querySelector('#tm-t').value.trim(); if (!t) return DS.UI.toast('공지 글을 먼저 써 주세요'); if (!confirm(`${cls.length}개 반에 보낼까요?`)) return; const n = await noticeAll(cls, t); DS.UI.toast(`📢 ${n}개 반에 공지를 보냈어요`); draw(); });
      el.querySelector('#tm-gift').onclick = () => DS.Control.run(async () => { await setGift(cur, !on); draw(); });
      el.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { await N().set(`notice/${ck(cur)}/${b.dataset.del}`, null); draw(); })));
    };
    await draw();
  }
  return { GIFT, inbox, unread, claim, send, open, giftDlg, notice, noticeAll, noticeUnread, noticePop, noticeClose, reply, setGift, giftOn, giftLog, teacher };
})();
