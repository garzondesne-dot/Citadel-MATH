// 🏰 성채던전 · 🎯 복습 허수아비 (2026-11-05 사용자 확정 · 옛 🟪 중단원던전을 둘로 나눔) — 학생 혼자 · 레이드(수업)와 따로
// - 🏰 성채던전 = 단원 평가 문제만: 1층 집합 중단원(eval-1 · 12방) · 2층 명제 중단원(eval-2 · 11방 · 2026-11-06) · 3층 집합과 명제 대단원(eval-3 · 17방)
//   방 하나 = 몬스터 한 마리 = 문항 하나 · 순서 없음 · 교사 해금 설정 없음 → 그 문항을 풀 수 있는 차시(room.no)를 우리 반이 수업하면(unlock/{반}) 열림
//   👑 보스 방(마지막 문항) = 그 층에서 열린 방(보스 제외)의 60% 이상(올림)을 처치해야 열림 · 새로 열린 방 = NEW (방에 들어가면 꺼짐)
// - 🎯 허수아비 = 「복습! n차시」: 배운 차시의 수업 문제(숫자만 바뀜) + 👑 형성평가 재대결 → 기록 남음 → 📕 오답노트 「복습 완료」
//   (보강 문항은 2026-11-05 삭제 · 보강의 역할은 성채던전이 맡음)
// - 처치 조건 = 소문제 전부 맞히기. 기회 4번(첫 시도 + 재도전 3번) — 틀린 소문제만 새 숫자로. 실패해도 벌 없음 (💧 표시만)
// - 🟪 인장 = 허수아비에서 그 차시 👑 형성평가 재대결 처치 · 성채 층 = 👑 보스 방 처치 (옛 규칙으로 받은 인장도 그대로 셈 — LEGACY)
//   → 인장 1 · 2 · 4 · 6 · 8 · 10개에서 화려한 공격 이펙트가 하나씩 열린다
// - 기록: bonus/{반}/{번호}/{차시 · 평가}/{몬스터 · boss · 방} = { clear, tries, at, mis } (예전 기록 그대로 이어짐 · 성적이 아니라 참여 기록)
window.DS = window.DS || {};

DS.Bonus = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const N = () => DS.Net;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const UNLOCK = [1, 2, 4, 6, 8, 10];             // 인장 개수 → 화려한 이펙트 FANCY[i]
  const TRIES = (DS.Raid ? DS.Raid.RETRIES : 3) + 1; // 레이드와 같은 기회 수
  const BOSS_PCT = 60;
  const PHOTO_READY = () => !!(DS.Photo && DS.Photo.ready && DS.Photo.ready()); // 📷 서술형 사진 분석 (v0.9.10) — 생기기 전까지 서술형 방은 잠금 · 보스 60% 계산에서도 뺌 (2026-11-05 사용자)                             // 👑 보스 방: 열린 방의 60% 처치 (2026-11-05 사용자 규칙)
  let me = null, no = 0, mine = {}, prepCache = {};
  let train = false; // true = 🎯 허수아비 복습 · false = 🏰 성채던전
  let rift = null;   // ⏳ 이어하기 포털 { lesson, no, until, code } — 허수아비 복습 화면을 그 차시 하나로 (2026-11-05)
  const fieldIds = (l) => l.steps.filter((st) => st.kind === 'monster' && l.monsters[st.id]).map((st) => st.id);
  // 옛 보강 · 옛 꼭대기 층 인장 (2026-11-05 전 규칙): 그 몬스터를 모두 처치했으면 인장 그대로
  const LEGACY = { 'set-04': ['b1', 'b2', 'b3'], 'set-05': ['b1', 'b2', 'b3'], 'set-06': ['b1'], 'eval-1': ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'eb'] };
  const FLOORS = [{ id: 'eval-1', floor: 1, title: '집합 중단원' }, { id: 'eval-2', floor: 2, title: '명제 중단원' }, { id: 'eval-3', floor: 3, title: '집합과 명제 대단원' }]; // 2026-11-06: 명제 중단원 2층 새로 · 대단원 2층 → 3층 (기록 id 그대로)
  // 🔒 층 잠금 (2026-11-05 사용자 「대단원 평가는 잠그는 거 만들어줘 · 지금은 잠그는 게 좋아」): gcfg/floorOpen/{층} = true 면 학생에게 열림
  //   기본 = 1 · 2층 열림 · 3층(대단원) 잠김 (값이 없을 때) · 선생님은 늘 들어가 볼 수 있고 성채 화면에서 🔓 열기 / 🔒 잠그기 (교사 계정만 · 종합상황실 기기는 보기만)
  const FLOOR_DEFAULT = { 'eval-1': true, 'eval-2': true, 'eval-3': false };
  let floorOpen = {}, isAdm = false;
  const floorIsOpen = (id) => (floorOpen[id] != null ? !!floorOpen[id] : FLOOR_DEFAULT[id] !== false);
  // 고른 층 (이 기기 기억 · 없으면 학생에게 열린 층 중 마지막 = 진도에 가까운 층 · 잠긴 층은 학생이 못 고름 → 열린 층으로)
  const FKEY = 'citadel-floor';
  const selFloor = () => { let v = ''; try { v = localStorage.getItem(FKEY) || ''; } catch (e) { /* 무시 */ } const ok = (id) => FLOORS.some((f) => f.id === id) && (all() || floorIsOpen(id)); return ok(v) ? v : ((FLOORS.filter((f) => ok(f.id)).pop() || FLOORS[0]).id); };
  const setFloor = (id) => { try { localStorage.setItem(FKEY, id); } catch (e) { /* 무시 */ } };
  async function loadLocks() { floorOpen = (await N().get('gcfg/floorOpen').catch(() => null)) || {}; return floorOpen; } // 2층은 문제 확정 뒤 (변경 제안 PDF → 컨펌)
  const castleOf = (id) => DS.Lessons.get(id);
  const lessons = () => DS.Lessons.list.filter((l) => l.no && !l.eval && l.boss).sort((a, b) => a.no - b.no);
  const bossOf = (L) => (L.rooms || []).find((r) => r.boss);
  // 방 상태 (data = bonus/{반}/{번호}) — 옛 7마리 기록은 그 방들을 처치한 것으로
  function roomRec(data, L, rid) {
    const d = (data || {})[L.id] || {}, r = d[rid] || {};
    if (r.clear) return r;
    const old = Object.entries(L.legacy || {}).find(([, ids]) => ids.includes(rid));
    return old && (d[old[0]] || {}).clear ? Object.assign({}, r, { clear: true, legacy: true }) : r;
  }
  // 열린 방 · 👑 보스 방 조건 (upto = 우리 반이 연 마지막 차시)
  function roomsState(L, data, upto, all) {
    const rooms = L.rooms || [], boss = bossOf(L);
    const usable = (r) => !r.photo || PHOTO_READY();
    const open = rooms.filter((r) => usable(r) && (all || r.no <= upto)), plain = open.filter((r) => !r.boss);
    const cleared = plain.filter((r) => roomRec(data, L, r.id).clear).length, need = Math.ceil((plain.length * BOSS_PCT) / 100);
    const bossOpen = !!boss && usable(boss) && (all || boss.no <= upto) && cleared >= need && plain.length > 0;
    return { rooms, open, plain, cleared, need, boss, bossOpen, usable, isOpen: (r) => (!usable(r) ? false : r.boss ? bossOpen : all || r.no <= upto) };
  }
  // 인장 = 처치한 곳 목록: 차시 = 👑 형성평가 재대결 처치 · 성채 층 = 👑 보스 방 처치 · 옛 규칙 인장 그대로
  function seals(data) {
    data = data || {};
    const legacy = (id) => (LEGACY[id] || []).length && LEGACY[id].every((m) => ((data[id] || {})[m] || {}).clear);
    const les = lessons().filter((l) => (((data[l.id] || {}).boss || {}).clear) || legacy(l.id)).map((l) => l.id);
    const cas = FLOORS.map((f) => castleOf(f.id)).filter(Boolean).filter((L) => { const b = bossOf(L); return (b && roomRec(data, L, b.id).clear) || legacy(L.id); }).map((L) => L.id);
    return [...les, ...cas];
  }
  // 🏰 NEW: 열렸는데 아직 들어가 보지 않은 방 (이 기기 기억 + 도전 기록)
  const seenKey = (m) => `citadel-castle-seen-${ck(m.c)}-${m.n}`;
  const seenGet = (m) => { try { return JSON.parse(localStorage.getItem(seenKey(m))) || {}; } catch (e) { return {}; } };
  const seenAdd = (m, id) => { try { const s = seenGet(m); s[id] = 1; localStorage.setItem(seenKey(m), JSON.stringify(s)); } catch (e) { /* 무시 */ } };
  function newRooms(m, data, upto) {
    const seen = m ? seenGet(m) : {};
    return FLOORS.filter((f) => floorIsOpen(f.id)).map((f) => castleOf(f.id)).filter(Boolean).flatMap((L) => { const S = roomsState(L, data, upto); return S.rooms.filter((r) => S.isOpen(r) && !seen[`${L.id}/${r.id}`] && !roomRec(data, L, r.id).tries && !roomRec(data, L, r.id).clear).map((r) => `${L.id}/${r.id}`); });
  }
  // 몬스터 · 소문제 (👑 형성평가 재대결 = 세트 1 · 2 를 번갈아, 체력 문항까지만)
  const isField = (L, mid) => L.steps.some((st) => st.kind === 'monster' && st.id === mid); // 📕 수업 문제 (오답노트 복습)
  const monOf = (L, mid) => (mid === 'boss' ? { title: `👑 ${L.no}차시 형성평가 재대결`, sprite: L.boss.sprite, note: '' } : isField(L, mid) ? { ...L.monsters[mid], title: (L.steps.find((st) => st.id === mid) || {}).title || L.monsters[mid].title || mid } : L.monsters[mid]);
  // 👑 형성평가 재대결 (2026-11-05): 첫 판 = 학습지 그대로 · 다음 판부터 문항마다 숫자가 바뀐 새 문제 (L.boss.make · 없으면 세트 1 ↔ 2)
  const itemsOf = (L, mid, seed, attempt) => (mid === 'boss' ? Array.from({ length: L.boss.hpItems || L.boss.items }, (_, i) => (!attempt ? L.boss.sets[1][i] : L.boss.make ? L.boss.make(i, attempt, DS.Rng(`${seed}|boss|${i}|${attempt}`)) : (L.boss.sets[attempt % 2 === 0 ? 1 : 2] || L.boss.sets[1])[i])) : L.items(mid, seed, attempt));
  // 화려한 이펙트 열림 { fire: true, … }
  function fxOpen(data) {
    const n = seals(data).length, out = {};
    DS.FX.FANCY.forEach((k, i) => { if (n >= UNLOCK[i]) out[k] = true; });
    return out;
  }
  const fxCond = (i) => `🟪 던전 인장 ${UNLOCK[i]}개`;

  let recs = null, heldM = {}; // 📕 records/{반}/{번호} · held/{반}
  let gemD = null; // 💎 gem/{반}/{번호} — 문제 밖에서 「받을 수 있는 마정석」 표시 (2026-11-05 사용자 「꼬드겨야지」)
  let preview = false; // preview = 교사 캠프: 모든 방 · 모든 차시 미리 보기 (기록 저장 안 함)
  // opt.train = 🎯 허수아비 · opt.go = [차시 id, 몬스터 id] → 들어가자마자 그 문제 (📮 우편함 「바로 풀기」)
  async function enter(m, opt = {}) {
    me = m; preview = !!opt.preview; train = !!opt.train; rift = opt.rift || null;
    no = preview || (m && m.test) ? Number(opt.no) || 99 : Number(await N().get(`unlock/${ck(m.c)}`).catch(() => 0)) || 0;
    mine = preview ? {} : (await N().get(`bonus/${ck(m.c)}/${m.n}`).catch(() => null)) || {};
    recs = preview || (m && m.test) ? null : (await N().get(`records/${ck(m.c)}/${m.n}`).catch(() => null)) || {};
    heldM = recs ? (await N().get(`held/${ck(m.c)}`).catch(() => null)) || {} : {};
    gemD = preview || !m || m.test || !DS.Gem ? null : await DS.Gem.mine(m).catch(() => null);
    await loadLocks(); isAdm = all() && DS.Account ? await DS.Account.isAdmin().catch(() => false) : false; // 📕 오답노트 (null = 미리 보기 · 테스트: 표시 안 함)
    DS.UI.show('screen-bonus');
    if (DS.Sound && DS.Sound.bgm) DS.Sound.bgm(train || rift ? 'bgm-dummy' : 'bgm-castle'); // 🎵 2026-11-06: 성채 · 허수아비 배경음 (작게)
    render();
    if (opt.go) { const L = DS.Lessons.get(opt.go[0]); if (L) DS.Control.run(() => fight(L, opt.go[1])); }
  }
  async function prepOf(id) {
    if (DS.Test && DS.Test.active() && DS.Test.prep(id)) return DS.Test.prep(id);
    if (!prepCache[id]) prepCache[id] = await DS.Act.prepLite(id); // 이미지는 누를 때 한 장만 (v0.8.8)
    return prepCache[id];
  }
  const all = () => preview || !!(me && me.test);
  function bindFight() {
    document.querySelectorAll('[data-fight]').forEach((b) => (b.onclick = () => { const [lid, mid] = b.dataset.fight.split('|'); DS.Control.run(() => fight(DS.Lessons.get(lid), mid)); }));
    $('#bn-back').onclick = () => { if (DS.Sound && DS.Sound.bgm) DS.Sound.bgm(null); return preview ? DS.TCamp.back() : DS.Camp.enter(me); };
  }
  // 💎 받을 수 있는 마정석 꼬리표 (처음 처치에만 · 이미 받았으면 안 보임 · 오늘 한도가 차면 「내일」)
  const gLog = (k) => !!((gemD || {}).log || {})[String(k).replace(/[.#$/[\]]/g, '_')];
  const gDayFull = () => { const G = DS.Gem; return !!G && (((gemD || {}).day || {})[G.today()] || 0) >= G.DAY_CAP; };
  const gReviewLeft = () => { const G = DS.Gem; if (!G) return 0; const pre = `review_${G.today()}_`; return Math.max(0, G.G.reviewDay - Object.keys((gemD || {}).log || {}).filter((k) => k.startsWith(pre)).length); };
  const gTag = (n, extra = '', free = false) => (!gemD || !DS.Gem || !n ? '' : `<span class="gm-tag${!free && gDayFull() ? ' full' : ''}" title="${!free && gDayFull() ? '오늘 💎 한도(30)가 찼어요 — 내일 받아요' : '처치하면 받아요'}">💎+${n}${extra}</span>`);
  // 🟪 인장 꼬리표: 이번 인장으로 열리는 것까지 (다음 인장 = 지금 + 1 → 이펙트 · 3개 = 금발 검사)
  const sealTag = () => { const nx = seals(mine).length + 1, i = UNLOCK.indexOf(nx), what = i >= 0 ? DS.FX.NAMES[DS.FX.FANCY[i]] : nx === 3 ? '용사 금발 검사' : '';
    return `<span class="gm-tag seal" title="처치하면 인장 ${nx}개째">🟪 인장${what ? ` → ${esc(what)}` : ''}</span>`; };
  // 🎁 머리 위 보상 줄 (처치 순간 · 차례로 하나씩 떠올라 8초 머묾 · 팝업 위로)
  function headRewards(host) {
    if (!host) return () => {};
    let box = host.querySelector('.hd-rw'); if (!box) { box = document.createElement('div'); box.className = 'hd-rw'; host.appendChild(box); }
    let k = 0;
    return (text, cls = '') => { const e = document.createElement('span'); e.className = `hd-rw-i ${cls}`; e.textContent = text; e.style.animationDelay = `${(k++) * 0.35}s, ${7.4 + k * 0.35}s`; box.appendChild(e); setTimeout(() => e.remove(), 9000 + k * 350); };
  }
  function render() {
    if (train) return renderTrain();
    const A = DS.ASSETS, sl = seals(mine), fresh = me && !all() ? new Set(newRooms(me, mine, no)) : new Set();
    const floor = (f) => {
      const L = castleOf(f.id);
      if (!L) return `<div class="panel framed cs-floor lock"><p class="bn-h"><b>🔒 ${f.floor}층 · ${esc(f.title)}</b></p><p class="muted small">문제를 준비하고 있어요. 그 차시 진도를 나가면 방이 하나씩 열려요.</p></div>`;
      const fOpen = floorIsOpen(f.id);
      if (!fOpen && !all()) return `<div class="panel framed cs-floor lock"><p class="bn-h"><b>🔒 ${f.floor}층 · ${esc(f.title)}</b></p><p class="muted small">선생님이 잠가 두었어요 — 단원 공부를 마치면 열려요.</p></div>`;
      const lockBtn = isAdm ? `<button class="btn small cs-lockbtn" data-flock="${f.id}|${fOpen ? 0 : 1}">${fOpen ? '🔒 학생에게 잠그기' : '🔓 학생에게 열기'}</button>` : '';
      const S = roomsState(L, mine, no, all()), sealed = sl.includes(L.id);
      const tile = (r) => {
        const rr = roomRec(mine, L, r.id), open = S.isOpen(r), m = L.monsters[r.id], isNew = fresh.has(`${L.id}/${r.id}`);
        const st = !open ? 'lock' : rr.clear ? 'clear' : rr.tries ? 'drop' : 'ready';
        const sub = !open ? (!S.usable(r) ? '📷 사진 분석 준비 중' : r.boss && (all() || r.no <= no) ? `${S.cleared} / ${S.need} 처치하면 열려요` : `${r.no}차시 수업 뒤`) : rr.clear ? '✔ 처치' : rr.tries ? `💧 ${rr.tries}번 도전` : '⚔ 도전';
        return `<button class="cs-room ${st}${r.boss ? ' boss' : ''}"${open ? ` data-fight="${L.id}|${r.id}"` : ` data-lockmsg="${esc(!S.usable(r) ? '서술형 방이에요. 📷 사진으로 풀이를 올리는 기능이 생기면 열려요' : r.boss ? `👑 보스 방은 열린 방 ${S.need}개를 처치하면 열려요 (지금 ${S.cleared}개)` : `${r.no}차시 수업을 하면 열려요`)}"`}>
          ${isNew ? '<span class="cs-rnew">NEW</span>' : ''}${!open && r.boss && !sealed ? sealTag() : ''}<span class="cs-no">${r.id.slice(1)}</span>${open ? DS.Art.monster(m.sprite, rr.clear ? 'down' : 'idle') : '<i class="cs-lockic">🔒</i>'}
          <span class="cs-rt">${esc(r.title.replace(/^👑 /, '').replace(/^\d+ /, ''))}</span><span class="cs-rs">${sub}</span>${open && !rr.clear && !gLog(`room_${L.id}_${r.id}`) ? gTag((r.boss ? DS.Gem.G.roomBoss : DS.Gem.G.room) + (r.boss && !sealed ? DS.Gem.G.seal : 0)) : ''}${open && r.boss && !rr.clear && !sealed ? sealTag() : ''}</button>`;
      };
      return `<div class="panel framed cs-floor${sealed ? ' sealed' : ''}"><p class="bn-h"><b>${f.floor}층 · ${esc(f.title)}</b><span class="muted small">처치 ${S.rooms.filter((r) => roomRec(mine, L, r.id).clear).length} / ${S.rooms.length} · 열린 방 ${S.rooms.filter((r) => S.isOpen(r)).length}</span>${sealed ? '<span class="bn-stamp">🟪 인장</span>' : ''}${all() ? (fOpen ? '<span class="cs-lk on">🔓 학생에게 열림</span>' : '<span class="cs-lk">🔒 학생에게 잠김</span>') : ''}${lockBtn}</p>
        <div class="cs-rooms">${S.rooms.map(tile).join('')}</div></div>`;
    };
    // 🌀 층 고르기 (2026-11-06 사용자 「중단원 · 대단원을 쭉 나열하지 말고 맨 위 포털 메뉴 → 그 층 몬스터만」)
    const portal = (f) => {
      const L = castleOf(f.id), on = selFloor() === f.id, lk = !floorIsOpen(f.id) && !all();
      const S = L ? roomsState(L, mine, no, all()) : null, done = S ? S.rooms.filter((r) => roomRec(mine, L, r.id).clear).length : 0;
      const nNew = L && !lk ? S.rooms.filter((r) => fresh.has(`${L.id}/${r.id}`)).length : 0;
      return `<button class="cs-portal${on ? ' on' : ''}${lk || !L ? ' lock' : ''}${sl.includes(f.id) ? ' sealed' : ''}" data-floor="${f.id}"><i class="cs-pt-ic">${lk || !L ? '🔒' : '🌀'}</i><b>${f.floor}층</b><span>${esc(f.title)}</span><em>${!L ? '준비 중' : lk ? '잠김' : `처치 ${done} / ${S.rooms.length}`}${sl.includes(f.id) ? ' · 🟪' : ''}</em>${nNew ? `<span class="cs-rnew">NEW ${nNew}</span>` : ''}</button>`;
    };
    const nextFx = UNLOCK.findIndex((u) => sl.length < u);
    $('#bonus').innerHTML = `<div class="bn-top"><button class="btn small" id="bn-back">≪ ${preview ? '교사 캠프' : '모닥불'}</button><b>🏰 성채던전</b><span class="bn-seal">🟪 인장 ${sl.length}개</span></div>
      <div class="cs-hero" style="background-image:url('${A.base}${(A.citadel || {}).boss || ''}')"><p>교과서 단원 평가를 숫자만 바꾼 문제 · <b>방 하나에 몬스터 한 마리</b><br><span class="small">순서 없이 아무 방이나 · 그 차시 진도를 나가면 방이 열려요 · 👑 보스 방은 열린 방의 ${BOSS_PCT}%를 처치하면!</span></p></div>
      <p class="bn-fx">✨ 화려한 이펙트: ${nextFx < 0 ? '모두 열렸어요!' : `인장 <b>${UNLOCK[nextFx]}개</b>가 되면 「${esc(DS.FX.NAMES[DS.FX.FANCY[nextFx]])}」이 열려요 (지금 ${sl.length}개 · 🎯 허수아비에서 형성평가 재대결 · 🏰 보스 방을 처치하면 인장)`}</p>
      ${gemD ? `<p class="gm-line">💎 방을 처음 처치하면 <b>+${DS.Gem.G.room}</b> · 👑 보스 방 <b>+${DS.Gem.G.roomBoss}</b> + 🟪 인장 <b>+${DS.Gem.G.seal}</b>${gLog('firstcastle') ? '' : ` · 🎁 첫 방은 <b>+${DS.Gem.G.first}</b> 더!`}${gDayFull() ? ' <span class="muted small">(오늘 한도 30 이 찼어요 — 인장 💎 은 한도 밖)</span>' : ''}</p>` : ''}
      <div class="cs-portals">${FLOORS.map(portal).join('')}</div>
      ${floor(FLOORS.find((f) => f.id === selFloor()) || FLOORS[0])}`;
    bindFight();
    document.querySelectorAll('[data-floor]').forEach((b) => (b.onclick = () => { const id = b.dataset.floor; if (!all() && !floorIsOpen(id)) { DS.Sound.squish(); DS.UI.toast('🔒 선생님이 잠가 두었어요 — 단원 공부를 마치면 열려요', 2600); return; } DS.Sound.clank(); setFloor(id); render(); }));
    document.querySelectorAll('[data-lockmsg]').forEach((b) => (b.onclick = () => { DS.Sound.squish(); DS.UI.toast(`🔒 ${b.dataset.lockmsg}`, 2600); }));
    document.querySelectorAll('[data-flock]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const [id, v] = b.dataset.flock.split('|'), f = FLOORS.find((x) => x.id === id) || {};
      if (!window.confirm(v === '1' ? `🔓 ${f.floor}층 「${f.title}」을 모든 반 학생에게 열까요?` : `🔒 ${f.floor}층 「${f.title}」을 학생에게 잠글까요?\n(학생 기록은 그대로 남아요)`)) return;
      await N().set(`gcfg/floorOpen/${id}`, v === '1'); await loadLocks(); render(); DS.UI.toast(v === '1' ? '🔓 열었어요' : '🔒 잠갔어요');
    })));
  }
  // 📕 오답노트: 그 차시의 문제마다 상태 · 남은 문제
  const noteOf = (l) => (recs && DS.Note && (recs[l.id] || heldM[l.id]) ? DS.Note.lesson(l, recs[l.id], mine[l.id]) : { left: 0, none: true }); // 기록도 없고 반이 게임으로 수업도 안 한 차시 = 표시 안 함
  // 🎯 허수아비 = 복습! n차시: 수업 문제 + 👑 형성평가 재대결 (남은 문제 먼저)
  // ⏳ 이어하기 완주: 기한 안에 그 차시 남은 문제 0 → rift/{반}/{차시}/done/{번호} = true · EXP (한 번)
  async function riftDone() {
    if (!rift || !me || !me.n) return;
    const p = `rift/${ck(me.c)}/${rift.lesson}/done/${me.n}`;
    if ((await N().get(p).catch(() => null)) === true) return;
    await N().set(p, true).catch(() => {});
    if (DS.Grow) DS.Grow.add(me, { rift: 1 }, `rift_${rift.lesson}`).catch(() => {});
    if (DS.Gem) DS.Gem.add(me, DS.Gem.G.rift, `rift_${rift.lesson}`, '이어하기 완주').catch(() => {});
    DS.Sound.correct(); DS.UI.toast(`⏳ ${rift.no}차시 이어하기 완주! 끝까지 간 용사 🎉`, 3600);
  }
  function renderTrain() {
    const sl = seals(mine), open = lessons().filter((l) => (rift ? l.id === rift.lesson : all() || l.no <= no)).sort((a, b) => (noteOf(b).left ? 1 : 0) - (noteOf(a).left ? 1 : 0) || b.no - a.no);
    const card = (l) => {
      const x = noteOf(l), rec = mine[l.id] || {}, sealed = sl.includes(l.id);
      const ids = [...fieldIds(l), 'boss'];
      const stOf = (id) => (id === 'boss' || x.none ? null : x.mons[x.ids.indexOf(id)]);
      const order = ids.slice().sort((a, b) => { const o = (id) => { const s = stOf(id); return s && (DS.Note.OPEN[s] || s === 'a') ? 0 : id === 'boss' ? 1 : 2; }; return o(a) - o(b); });
      return `<div class="panel framed bn-card${sealed ? ' sealed' : ''}${x.left ? ' nt-left' : ''}"><p class="bn-h"><b>🎯 복습! ${l.no}차시 · ${esc(l.title)}</b>${x.none ? '' : x.left ? `<span class="nt-cnt">❗ 남은 문제 ${x.left}</span>${!gLog(`note_${l.id}`) ? gTag(DS.Gem.G.note, ' 다 풀면') : ''}` : '<span class="nt-cnt ok">✔ 복습 완료</span>'}${sealed ? '<span class="bn-stamp">🟪 인장</span>' : ''}</p>
        ${x.none ? '' : DS.Note.rows(x)}
        <div class="bn-list">${order.map((id) => { const s = stOf(id), r = rec[id] || {}, m = monOf(l, id), need = s && (DS.Note.OPEN[s] || s === 'a'), bossNeed = id === 'boss' && !r.clear;
          return `<div class="bn-row${need ? ' nt-open' : r.clear || (s && !need) ? ' clear' : ''}${id === 'boss' ? ' boss' : ''}">${s ? DS.Note.icon(s) : DS.Art.monster(m.sprite, r.clear ? 'down' : 'idle')}<span>${need ? '<b class="nt-ex">❗</b> ' : ''}${esc(m.title)}${s ? ` <span class="muted small">· ${esc(DS.Note.WHY[s] || '')}</span>` : bossNeed ? '' : ''}${(() => { const t = (need && gReviewLeft() ? gTag(DS.Gem.G.review) : bossNeed && !gLog(`bossre_${l.id}`) ? gTag(DS.Gem.G.bossRe + (sealed ? 0 : DS.Gem.G.seal)) : '') + (bossNeed && !sealed ? sealTag() : ''); return t ? `<em class="gm-wrap">${t}</em>` : ''; })()}</span><button class="btn small${need || bossNeed ? ' primary' : ''}" data-fight="${l.id}|${id}">${need ? (s === 'x' ? '⚔ 다시 풀기' : '⚔ 풀기') : r.clear ? '✔ 다시 하기' : id === 'boss' ? '👑 재대결' : '🎯 연습'}</button></div>`; }).join('')}</div></div>`;
    };
    const rx = rift && open[0] ? noteOf(open[0]) : null, rdone = rx && !rx.none && rx.left === 0, rdays = rift ? Math.max(1, Math.ceil((rift.until - Date.now()) / 86400e3)) : 0;
    if (rift && rdone && me && !all()) riftDone();
    $('#bonus').innerHTML = rift ? `<div class="bn-top"><button class="btn small" id="bn-back">≪ 모닥불</button><b>⏳ ${rift.no}차시 이어하기</b><span class="bn-seal">D-${rdays}</span></div>
      <div class="rift-head${rdone ? ' done' : ''}"><p>${rdone ? '✔ <b>이어하기 완주!</b> 끝까지 해낸 용사예요.' : `수업 시간이 모자라 멈춘 던전이에요. <b>남은 몬스터 · 👑 형성평가</b>를 ${rdays}일 안에 마저 해요. 완주하면 보상!`}</p><span class="muted small">📚 못 본 개념은 ⛺ 텐트 책장에서 다시 볼 수 있어요 · 기한이 지나도 🎯 허수아비에서 계속 풀 수 있어요 (벌 없음)</span></div>
      ${open.map(card).join('')}` : `<div class="bn-top"><button class="btn small" id="bn-back">≪ ${preview ? '교사 캠프' : '모닥불'}</button><b>🎯 복습 허수아비</b><span class="bn-seal">🟪 인장 ${sl.length}개</span></div>
      <p class="bn-fx">배운 차시의 <b>수업 문제를 숫자만 바꿔</b> 다시 풀어요. 틀림 · 안 푼 문제를 맞히면 📕 오답노트에 <b>복습 완료</b>! 👑 형성평가 재대결을 처치하면 🟪 인장.</p>
      ${gemD ? `<p class="gm-line">💎 틀림 · 안 푼 문제를 맞히면 <b>+${DS.Gem.G.review}</b> (오늘 <b>${gReviewLeft()}</b>번 남음) · 👑 재대결 <b>+${DS.Gem.G.bossRe}</b> + 🟪 인장 <b>+${DS.Gem.G.seal}</b> · 📕 차시 복습 완료 <b>+${DS.Gem.G.note}</b>${gLog('firstreview') ? '' : ` · 🎁 첫 복습 <b>+${DS.Gem.G.first}</b> 더!`}</p>` : ''}
      ${open.length ? open.map(card).join('') : '<div class="panel framed"><p class="muted">선생님이 우리 반 수업을 열면 그 차시를 복습할 수 있어요.</p></div>'}`;
    bindFight();
  }

  // ── 1:1 전투 ───────────────────────────────────────────
  async function fight(L, mid) {
    const mon = monOf(L, mid), castle = !!L.rooms, rec = Object.assign({}, castle ? roomRec(mine, L, mid) : (mine[L.id] || {})[mid] || {}), prep = await prepOf(L.id);
    if (castle && me && !all()) seenAdd(me, `${L.id}/${mid}`); // NEW 끔
    const first = !rec.tries && !rec.clear, clearedBefore = !!rec.clear, sealedBefore = seals(mine).includes(L.id);
    const wasOpen = (() => { const x = !castle && isField(L, mid) ? noteOf(L) : null; const st = x && !x.none ? x.mons[x.ids.indexOf(mid)] : null; return !!(st && (DS.Note.OPEN[st] || st === 'a')); })(); // 📕 틀림 · 안 풂이었던 문제
    const seed = `${N().uid()}|${Date.now()}`;
    let attempt = first && !isField(L, mid) ? 0 : 1, left = TRIES; // 📕 수업 문제 복습은 처음부터 숫자를 바꿈
    const n = itemsOf(L, mid, seed, attempt).length;
    const solved = new Array(n).fill(false);
    const el = document.createElement('div'); el.className = 'bn-fight';
    document.body.appendChild(el);
    if (DS.Attack) DS.Attack.preload(me.hero || 0, me.fx || 'flame'); // 탄 · 이펙트 그림 미리 받기
    // 👾 몬스터 공격 (중단원던전 · 사용자 확정 2026-11-03): 혼자 하는 곳이라 이 폰에서만 45초마다 1초 잠금. 🎯 허수아비 연습은 공격 없음
    //   학습지 · 영상을 보는 동안 · 화면 꺼짐 동안은 멈춤. 기회 · 경험치는 줄지 않음
    let gT = 0, gLast = Date.now();
    const gTimer = !castle ? null : setInterval(() => {
      if (!document.body.contains(el)) { clearInterval(gTimer); return; }
      const now = Date.now(), dt = Math.min(1, (now - gLast) / 1000); gLast = now;
      const g = el.querySelector('.atk-gauge'); if (!g || document.hidden || document.querySelector('.sheet-modal, .video-modal')) return;
      const { per, lock } = DS.Raid.soloAtk(window.DS_ATK || null); // 45초마다 1초 멈춤 (2026-11-04 버그 고침)
      gT += dt; const p = Math.min(1, gT / per), bar = g.querySelector('i');
      bar.style.width = `${(p * 100).toFixed(1)}%`; g.classList.toggle('hot', p > 0.8);
      if (gT < per) return;
      gT = 0; bar.style.width = '0%'; g.classList.remove('hot');
      const m = el.querySelector('.art.monster'), hb = el.querySelector('.enc-hero');
      if (m) { m.classList.remove('lunge'); void m.offsetWidth; m.classList.add('lunge'); setTimeout(() => m.classList.remove('lunge'), 500); }
      setTimeout(() => {
        const art = () => el.querySelector('.enc-hero .art');
        if (hb) { hb.classList.remove('struck'); void hb.offsetWidth; hb.classList.add('struck'); setTimeout(() => hb.classList.remove('struck'), 600); }
        const a1 = art(); if (a1) a1.outerHTML = DS.Art.hero(me.hero || 0, 'hit', '');
        setTimeout(() => { const a2 = art(); if (a2) a2.outerHTML = DS.Art.hero(me.hero || 0, 'pant', ''); }, 350);
        setTimeout(() => { const a3 = art(); if (a3) a3.outerHTML = DS.Art.hero(me.hero || 0, 'think', 'huff'); }, 350 + lock * 1000 + 500);
        DS.Sound.squish(); if (navigator.vibrate) navigator.vibrate(60);
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        const st = document.createElement('div'); st.className = 'stun'; st.innerHTML = `<b>💥 몬스터의 공격! ${lock}초 멈춤</b>`;
        document.body.appendChild(st); setTimeout(() => st.remove(), lock * 1000);
      }, 200);
    }, 200);
    const img = DS.Act.hasImg(prep, mid), cslot = null, vslot = DS.Video.pick(L, prep.video, mid) ? mid : cslot, vid0 = DS.Video.pick(L, prep.video, vslot);
    // 🎬 꼭대기 층(평가): 소문제마다 풀이 영상(q.video) · 한 번 틀린 뒤에 열림 (예제 영상 → 다른 숫자로 직접, 2026-11-03 사용자 확정)
    let cur = itemsOf(L, mid, seed, attempt), wrongSeen = !!rec.tries;
    const vidNow = () => { if (!L.eval) return vid0; const i = solved.findIndex((x) => !x); return i >= 0 && cur[i] ? cur[i].video || null : null; };
    let drawN = 0;
    const draw = (cls = '', msg = '') => {
      const pips = Array.from({ length: TRIES }, (_, i) => `<i class="${i < left ? 'on' : ''}"></i>`).join('');
      const segs = solved.map((s) => `<i class="${s ? 'gone' : ''}"></i>`).join('');
      const done = solved.every(Boolean);
      const cbg = castle ? ((DS.ASSETS.citadel || {})[(L.rooms.find((r) => r.id === mid) || {}).boss ? 'boss' : 'room']) : '';
      el.innerHTML = `<div class="scene enc ${cbg ? `cs-bg${cbg === (DS.ASSETS.citadel || {}).boss ? ' cs-bossroom' : ''}` : `bg-scene th-${L.theme || ''}`} ${cls}"${cbg ? ` style="background-image:url('${DS.ASSETS.base}${cbg}')"` : ''}><div class="scene-bar"><div><b>⚔ ${esc(mon.title)}</b><br><span class="muted small">${castle ? `🏰 성채던전 ${L.floor || 1}층` : `🎯 복습! ${L.no}차시`} · 소문제 ${n}개를 모두 맞히면 처치</span></div><button class="btn small" id="bf-x">✕</button></div>
          <div class="enc-hero"><div class="enc-tries" title="남은 도전 기회">${pips}</div>${DS.Art.hero(me.hero || 0, done || cls ? 'attack' : 'think', done ? 'pairhop' : cls === 'miss' ? 'slump' : 'huff')}<i class="shadow"></i></div>
          <div class="enc-mon">${DS.Art.monster(mon.sprite, done ? 'down' : 'idle', done ? '' : 'float')}<div class="segs">${segs}</div>${done || !castle ? '' : '<div class="atk-gauge" title="몬스터 공격 게이지"><i></i></div>'}</div></div>
        <div class="bf-body">${msg}${mon.note ? `<p class="muted small">💡 ${esc(mon.note)}</p>` : ''}
          <div class="row">${img ? '<button class="btn small" id="bf-sheet">📄 학습지 보기</button>' : ''}${(() => { const v = vidNow(); if (!v || !DS.Video.ok(v)) return ''; if (L.eval && !wrongSeen) return '<span class="muted small">🔒🎬 풀이 영상은 한 번 틀리면 열려요 — 먼저 스스로!</span>'; return `<button class="btn small" id="bf-vid">🎬 ${L.eval ? '풀이 영상 (예제)' : '설명 보기'}</button>`; })()}</div>
          <div class="row" id="bf-act"></div></div>`;
      el.querySelector('#bf-x').onclick = () => { el.remove(); DS.Quiz.close(); render(); }; // ✕ = 열린 문제 창도 닫음
      // 공격 · 빗나감 동작은 한 번만 → 끝나면 생각하는 자세로 (2026-11-06 사용자: 공격 모션이 계속 남음)
      const dn = ++drawN; if (cls && !done) setTimeout(() => { const a = el.querySelector('.enc-hero .art'); if (a && dn === drawN && document.body.contains(el)) a.outerHTML = DS.Art.hero(me.hero || 0, 'think', 'huff'); }, 900);
      const sh = el.querySelector('#bf-sheet'); if (sh) sh.onclick = () => DS.Control.run(async () => { const src = (prep.img || {})[mid] || (await DS.Act.prepImg(L.id, mid)); if (src) sheet(src, mon.title); else DS.UI.toast('아직 이 칸의 학습지 이미지가 없어요.'); });
      const vb = el.querySelector('#bf-vid'); if (vb) vb.onclick = () => DS.Video.open(vidNow(), mon.title, { lesson: L.id, slot: vslot });
      return el.querySelector('#bf-act');
    };
    let roundNo = 0, anyWrong = false; // ⚡ 필살기: 첫 판 · 하나도 안 틀림 (퍼펙트)
    const wrongs = [], misBase = (DS.Mis && rec.mis) ? DS.Mis.merge({}, rec.mis) : {}; // 🔎 이 판에서 틀린 소문제 (판이 끝날 때마다 다시 계산 · 겹쳐 세지 않음)
    const round = async () => {
      const items = itemsOf(L, mid, seed, attempt); cur = items;
      roundNo++;
      for (let i = 0; i < n; i++) {
        if (solved[i]) continue;
        const ok = await DS.Quiz.ask({ name: mon.title, formula: `${i + 1} / ${n}` }, items[i], { hint: mid !== 'boss' && !L.eval, tag: attempt ? (mid === 'boss' ? '🔄 세트가 바뀌었어요' : '🔄 숫자가 바뀌었어요') : castle ? '🏰 성채던전' : '🎯 복습' });
        if (!document.body.contains(el)) return null; // ✕ 로 전투를 닫음 → 기록 · 데미지 없이 끝
        if (!ok && DS.Mis && DS.Quiz.lastGiven !== undefined) wrongs.push({ i, codes: DS.Mis.classify(items[i], DS.Quiz.lastGiven, mid === 'boss' ? DS.Mis.bossTag(L.id, attempt % 2 === 0 ? 1 : 2, i) : null) }); // 🔎 오개념 (중단원던전만 저장 · 재대결은 형성평가 꼬리표)
        if (ok) solved[i] = true; else { wrongSeen = true; anyWrong = true; }
        // ⚔ 공격 연출 (2026-11-06): 근접 = 돌진 · 원거리 = 탄 → 이펙트 · 멈칫 · 흔들림 · 밀림 (틀리면 튕겨냄 · 벌 없음) — 끝난 뒤 체력 칸을 그림
        if (DS.Attack) { const sc = el.querySelector('.scene'); await DS.Attack.play(sc, { heroBox: sc && sc.querySelector('.enc-hero'), monBox: sc && sc.querySelector('.enc-mon'), hero: me.hero || 0, fx: me.fx || 'flame', miss: !ok, finish: ok && solved.every(Boolean), ultimate: ok && solved.every(Boolean) && roundNo === 1 && !anyWrong && DS.Attack.canUlt(me.fx || 'flame', me.hero || 0) /* 퍼펙트 완성 순간 (처치 여부와 무관 · 2026-11-06) */, s: 1.2 }); }
        else if (ok) DS.FX.play(el.querySelector('.scene'), me.fx || 'flame', { scale: 0.3 });
        if (!document.body.contains(el)) return null;
        draw(DS.Attack ? '' : ok ? 'hit' : 'miss');
      }
      left--;
      const cleared = solved.every(Boolean);
      const tries = Number(rec.tries || 0) + 1;
      rec.tries = tries;
      const patch = { tries, at: N().TS };
      if (cleared) patch.clear = true;
      if (!preview && DS.Usage) DS.Usage.bump(me, castle ? 'c' : 'r'); // 📈 수업 밖 풀이 (2026-11-06)
      if (DS.Mis && wrongs.length) { // 오개념: 이번 판에서 틀린 소문제 → 그 소문제를 결국 맞혔으면 「바로잡음」
        const acc = DS.Mis.merge({}, misBase); wrongs.forEach((w) => DS.Mis.add(acc, w.codes, !!solved[w.i])); if (Object.keys(acc).length) patch.mis = acc;
      }
      if (!preview) await N().update(`bonus/${ck(me.c)}/${me.n}/${L.id}/${mid}`, patch).catch(() => {});
      mine[L.id] = mine[L.id] || {}, mine[L.id][mid] = Object.assign({}, mine[L.id][mid], { tries, clear: cleared || (mine[L.id][mid] || {}).clear }, patch.mis ? { mis: patch.mis } : {});
      if (cleared) return win();
      if (left <= 0) {
        const act = draw('miss', '<p class="gold">기회를 모두 썼어요. 해설을 다시 보고 다음에 새 문제로 도전해요! (벌은 없어요)</p>');
        act.innerHTML = `<button class="btn primary" id="bf-out">${castle ? '성채 방 목록으로' : '허수아비로'}</button>`;
        act.querySelector('#bf-out').onclick = () => { el.remove(); render(); };
        return null;
      }
      const act = draw('', `<p>맞힌 소문제 <b>${solved.filter(Boolean).length} / ${n}</b> — 틀린 것만 새 숫자로 다시!</p>`);
      act.innerHTML = '<button class="btn primary" id="bf-again">🔄 다시 도전</button>';
      act.querySelector('#bf-again').onclick = () => { attempt++; round(); };
      return null;
    };
    const win = async () => {
      const sealed = !sealedBefore && seals(mine).includes(L.id);
      DS.Sound.correct();
      const xp = !clearedBefore && !preview ? DS.Grow.XP.bonusClear + (sealed ? DS.Grow.XP.seal : 0) : 0;
      if (DS.Grow && xp) DS.Grow.add(me, { bonusClear: 1, seal: sealed ? 1 : 0 }).catch(() => {});
      const fx = sealed ? DS.FX.FANCY.find((k, i) => seals(mine).length === UNLOCK[i]) : null;
      const act = draw('', `<p class="okc"><b>🎉 처치!</b>${sealed ? ` <b class="gold">🟪 ${castle ? `성채 ${L.floor || 1}층` : `${L.no}차시`} 인장을 얻었어요!</b>` : ''}${fx ? `<br>✨ 화려한 이펙트 「${esc(DS.FX.NAMES[fx])}」이 열렸어요! ⚙ 설정에서 바꿀 수 있어요` : ''}</p>`);
      act.innerHTML = `<button class="btn primary" id="bf-out">${castle ? '성채 방 목록으로' : '허수아비로'}</button>`;
      act.querySelector('#bf-out').onclick = () => { el.remove(); render(); };
      // 🎁 받은 보상 = 내 용사 머리 위에 줄줄이 (2026-11-05 사용자: 팝업에 가릴 수 있어 오래 · 8초)
      const host = el.querySelector('.enc-hero'), show = headRewards(host);
      if (xp) show(`+${xp} EXP`, 'xp');
      if (DS.Gem && !preview && me && !me.test) { // 💎 (2026-11-05) — 차례로 받아 실제로 받은 만큼만 표시 (이미 받았거나 오늘 한도면 안 뜸)
        const G = DS.Gem.G, gm = async (n, k, why, o) => { const g = await DS.Gem.add(me, n, k, why, o).catch(() => 0); if (g) show(`💎 +${g} ${why}`, 'gem'); };
        if (!clearedBefore) {
          if (castle) { await gm((L.rooms.find((r) => r.id === mid) || {}).boss ? G.roomBoss : G.room, `room_${L.id}_${mid}`, '성채 방 처치'); await gm(G.first, 'firstcastle', '성채 첫 방'); }
          else { if (mid === 'boss') await gm(G.bossRe, `bossre_${L.id}`, '형성평가 재대결'); await gm(G.first, 'firstreview', '첫 복습'); }
        }
        if (!castle && mid !== 'boss' && wasOpen && DS.Usage) DS.Usage.bump(me, 'f'); // 📈 오답 고침
        if (!castle && mid !== 'boss' && wasOpen) { const g = await DS.Gem.addDaily(me, G.review, 'review', G.reviewDay, '복습으로 해결').catch(() => 0); if (g) show(`💎 +${g} 복습으로 해결`, 'gem'); }
        if (sealed) await gm(G.seal, `seal_${L.id}`, '🟪 인장', { free: true });
        if (!castle) { const x = noteOf(L); if (!x.none && x.left === 0) await gm(G.note, `note_${L.id}`, '오답노트 완성'); }
      }
      if (sealed) show(`🟪 인장 ${seals(mine).length}개째!`, 'seal');
      if (fx) show(`✨ ${DS.FX.NAMES[fx]} 열림`, 'seal');
      if (sealed && seals(mine).length === 3) show('🧑 용사 금발 검사 열림', 'seal');
    };
    const act = draw('', `<p>${castle ? (first ? '교과서 단원 평가를 숫자만 바꾼 문제예요. 서술형은 풀이를 학습지에 써요.' : '다시 들어오면 새 숫자로 나와요.') : mid === 'boss' ? (first ? '수업 때 형성평가 문제 그대로예요. 처치하면 🟪 인장!' : '세트를 바꿔 다시 도전해요.') : '📕 수업 때 문제를 숫자만 바꿨어요. 모두 맞히면 오답노트에 복습 완료!'} 기회 ${TRIES}번 — 틀린 소문제만 다시 풀어요.</p>`);
    act.innerHTML = '<button class="btn primary big" id="bf-go">⚔ 전투 시작</button>';
    act.querySelector('#bf-go').onclick = () => round();
  }
  function sheet(src, title) {
    const el = document.createElement('div'); el.className = 'modal sheet-modal';
    el.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📄 ${esc(title)}</b><button class="btn small" data-x>✕ 닫기</button></div><img class="bn-sheet" src="${src}" alt="학습지"></div>`;
    el.querySelector('[data-x]').onclick = () => el.remove();
    document.body.appendChild(el);
  }
  return { enter, seals, fxOpen, fxCond, UNLOCK, FLOORS, BOSS_PCT, LEGACY, roomsState, roomRec, newRooms, loadLocks, floorIsOpen, FLOOR_DEFAULT };
})();
