// 종합상황실 (PC · 교실 큰 화면) — 왼쪽: 용사단(접속 ●/○ · 상태) · 가운데: 장면 · 오른쪽: 수업 순서 · ◀ ▶ · 기준% · 🔴 집중모드 · 말풍선 관리
// 장면: 던전 단체 대기실(선생님 주위로 옹기종기) → 개념 설명(학습지 이미지 가운데 크게) → 레이드(큰 몬스터 위 가운데 · 용사는 아래에서 올려 침)
//       → 보스 → 마무리(마지막 한마디 말풍선 · 모두 제자리 점프 · 📮 확인도장 띠) → 수업 끝
// 정답·오답 글자는 띄우지 않는다. 공격 연출(이펙트 · PERFECT! · 데미지 숫자)만 보인다.
window.DS = window.DS || {};

DS.Hall = (function () {
  const $ = (s) => document.querySelector(s);
  // 👩‍🏫 체험판 (2026-11-07 v2): 폰 화면 위 작은 TV 창 안에 종합상황실을 띄움 (embed) — 화면 전환 · 교사 캠프 이동 · 소리는 빼고 (폰 소리와 겹치지 않게) · 컷인은 TV 창 안에서
  let embed = false;
  const MUTE = new Proxy({}, { get: () => () => {} });
  const Snd = () => (embed ? MUTE : DS.Sound);
  const cutHost = () => (embed ? { host: document.getElementById('screen-hall'), mute: true } : {});
  const enhCls = (p) => (p && DS.Gem && DS.Gem.auraCls ? DS.Gem.auraCls(p.enh) : ''); // ✨ 강화 오라 1~10 (2026-11-08) // 🔨 강화 빛 (+3 은 · +5 금 · +7 오라 · +10 무지개)
  const { esc, pretty } = DS.UI;
  const C = () => DS.Control, Raid = () => DS.Raid;
  let code = null, L = null, R = null, raw = null, stop = null, stopPrep = null, prep = {};
  let prepFor = '', lastHit = '', built = '', seen = {}, queue = [], playing = false, wonFx = '', bubbleT = 0, bubbleK = 0, hallKey = '', camped = false, zoom = '', zoomStep = -9, vanished = '', demo = null;

  async function enter(c, key, opt = {}) {
    embed = !!opt.embed;
    await DS.Act.joinHall(c, key);
    if (DS.Art.loadTeacherCfg) await DS.Art.loadTeacherCfg(); // 🧙 #32 선생님 모습 = 서버 gcfg/teacher
    if (code !== c) { hxSeen = lvSeen = ulSeen = hthSeen = null; lvQ = []; ulQ = []; sndKey = ''; try { if (Snd()) { Snd().setSfx(localStorage.getItem('ds-sfx-off') !== '1', false); Snd().setBgm(localStorage.getItem('ds-bgm-off') !== '1', false); } } catch (e) { /* 무시 */ } } // 2026-11-06 검증: 다음 수업으로 넘어가면 「본 것」 기록 · 리모컨 소리 설정을 새로 (+EXP · 필살기 컷인이 안 나오거나 음소거가 이어지던 것)
    code = c; hallKey = String(key); camped = false; L = null; R = null; built = '';
    if (!atkT) atkT = setInterval(hallAtk, 200);
    if (DS.Attack && DS.Attack.preloadFaces) DS.Attack.preloadFaces(); // ⚡ 필살기 컷인 얼굴 (선생님 · 학생) 미리
    if (DS.Attack && DS.Attack.setForce && !embed) DS.Attack.setForce(true); // 👁 2026-11-13 종합실 = 교실 PC 「동작 줄이기」여도 컷인 · 눈빛 연출 (체험판 TV 창은 폰 설정 그대로)
    if (!embed) {
      try { localStorage.setItem('citadel-hall', JSON.stringify({ code: c })); } catch (e) { /* 무시 */ } // 2026-11-06 사용자: 비밀번호는 기억하지 않음 (메뉴로 가거나 다시 접속하면 다시 입력)
      DS.UI.show('screen-hall');
      DS.Scene.save({ role: 'hall', code: c }); // 새로고침 · 다시 접속 → 코드만 채워 두고 비밀번호는 다시
    }
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => {
      if (!v) return;
      raw = v; R = DS.Act.unpackRoom(v);
      const first = !L;
      L = DS.Lessons.get(R.meta.lesson); if (L && L.id !== DS.Art._entered) { DS.Art._entered = L.id; DS.Art.lessonEnter(L); } // v0.9.6 차시별 다운로드
      if (DS.Act.isHost(R)) { DS.Act.admitLate(code, R, L); DS.Act.markBossWin(code, R, L); }
      if (first || L.id !== prepFor) { prepFor = L.id; built = ''; if (stopPrep) stopPrep(); stopPrep = DS.Net.watch(`prep/${L.id}`, (p) => { prep = p || {}; built = ''; if (R) render(); }); } // 🔄 차시 바꾸기: 새 차시의 개념 그림 · 영상
      xpHall(); lvHall(); ulHall();
      { const sd = (R.state || {}).sound, key = sd ? `${sd.sfx}|${sd.bgm}|${sd.vol || ''}` : ''; if (key && key !== sndKey && Snd()) { sndKey = key; Snd().setSfx(sd.sfx !== false, false); Snd().setBgm(sd.bgm !== false, false); if (sd.vol) Snd().setVol(sd.vol, false); } } hallVol(); // 🔇 교사 리모컨 → 종합실 소리
      render();
      thrillHall();
      // v0.9.2: 종합상황실은 교사 캠프(학생 입장 QR · 모루 · 보강던전)에서 시작 — 수업이 시작되면 저절로 이 화면으로
      if (first && !camped && !embed && Raid().isLobby(R) && DS.TCamp) { camped = true; DS.TCamp.enter({ code, hallKey, hall: true }).catch(() => {}); }
    });
  }
  // 🆙 몬스터가 쓰러질 때 공격한 용사들 머리 위 +EXP · 🎉 레벨업 알림 (2026-11-05 · 좋은 순간만 크게 · 레벨 목록 · 순위는 안 보임)
  // 🔉 종합실 구석 소리 단추 (2026-11-09 #24): 🔇 / 작게 / 보통 · 이 PC 에 기억 · 리모컨으로도 바뀜
  function hallVol() {
    { const old = document.getElementById('h-vol'); if (old) old.remove(); return; } // 2026-11-09 선생님: 아래 가운데 소리 단추 없앰 · 왼쪽 가운데 🔊 탭만 (아래는 예전 코드)
    if (!Snd() || !Snd().setLevel) return; // eslint-disable-line no-unreachable
    let b = document.getElementById('h-vol'); const host = document.getElementById('screen-hall') || document.body;
    if (!b) { b = document.createElement('div'); b.id = 'h-vol'; host.appendChild(b); b.onclick = (e) => { const v = e.target.closest('[data-lv]'); if (!v) return; Snd().setLevel(v.dataset.lv); if (v.dataset.lv !== 'off' && Snd().clank) Snd().clank(); hallVol(); }; }
    const lv = Snd().level, k = `v|${lv}`; if (b.dataset.k === k) return; b.dataset.k = k;
    b.innerHTML = `<span>🔊</span>${[['off', '🔇'], ['low', '작게'], ['mid', '보통']].map(([x, t]) => `<button data-lv="${x}" class="${lv === x ? 'on' : ''}">${t}</button>`).join('')}`;
  }
  let hxSeen = null, lvSeen = null, lvQ = [], lvBusy = false, ulSeen = null, ulQ = [], ulBusy = false, sndKey = '';
  function xpHall() {
    if (!L || !R) return;
    const ids = L.steps.filter((s) => s.kind === 'monster' && L.monsters[s.id]).map((s) => s.id), first = !hxSeen;
    if (first) hxSeen = {};
    ids.forEach((mid) => { if (!Raid().cleared(L, R, mid) || hxSeen[mid]) return; hxSeen[mid] = true; if (first) return;
      setTimeout(() => Raid().activeIds(R).forEach((u, k) => { const x = C().xpOf(Raid().record(L, R, mid, u)); if (x) setTimeout(() => C().xpFloat(document.getElementById(`fh-${u}`), `+${x} EXP`), (k % 6) * 120); }), 600); });
    if (Raid().bossHp(L, R).won && !hxSeen.boss) { hxSeen.boss = true; if (!first) setTimeout(() => Raid().activeIds(R).filter((u) => Raid().bossAnswered(R, u) > 0).forEach((u, k) => setTimeout(() => C().xpFloat(document.getElementById(`fh-${u}`), '+10 EXP', 'big'), (k % 6) * 120)), 900); }
  }
  // ⚡ 학생 필살기 (2026-11-06): heals 칸 '!ult' → 종합상황실 큰 화면 컷인 · 한 번에 1명 · 겹치면 3명까지 차례로
  // 2026-11-06 확정: ⚡ 필살기 = 첫 시도 퍼펙트 + 특화 Ⅲ↑ (현재 몬스터) · 🌟 진필살기 = '!true@시각' → 금빛 컷인 + 🗿 석화 · '!ult' = 예전 수업 · 🔥 끈기의 일격 = 두 번 넘게 틀린 뒤 다 맞힘 (띠만)
  function ulHall() {
    const H = R.heals || {}, first = !ulSeen; if (first) ulSeen = {};
    const push = (it) => { if (!first && ulQ.length < 3) ulQ.push(it); else if (!first && it.kind === 'true') ulQ.unshift(it); };
    Object.entries(H).forEach(([mid, byU]) => Object.entries(byU || {}).forEach(([u, byK]) => Object.entries(byK || {}).forEach(([k, v]) => { const key = `${mid}|${u}|${k}`; if ((v !== '!ult' && !Raid().isTrue(v) && !Raid().isTcut(v)) || ulSeen[key]) return; ulSeen[key] = true; push({ u, kind: Raid().isTrue(v) ? 'true' : Raid().isTcut(v) ? 'tcut' : 'ult', ...(Raid().isTcut(v) && (((Raid().stepOf(L, R) || {}).id !== mid) || Raid().cleared(L, R, mid)) ? { noBind: true } : {}) }); }))); // #42: 쓰러진 몬스터 · 지난 문제의 금빛 컷인은 지금 몬스터를 묶지 않음
    const step = Raid().stepOf(L, R);
    if (step && step.kind === 'monster' && DS.Attack) Raid().activeIds(R).forEach((u) => {
      const p = (R.players || {})[u] || {}, rec = Raid().record(L, R, step.id, u);
      const kf = `f|${step.id}|${u}`; if (!ulSeen[kf] && rec.perfectAt === 0 && DS.Attack.canUlt(p.fx, p.hero)) { ulSeen[kf] = true; push({ u, kind: 'ult', noBind: true }); }
      const kg = `g|${step.id}|${u}`; if (!ulSeen[kg] && rec.perfectAt >= 2) { ulSeen[kg] = true; if (!first) gritHall(p); }
    });
    // 👑 형성평가 퍼펙트 (모든 문항 첫 시도 정답) + 특화 Ⅲ↑ → 한 번
    if (L.boss && DS.Attack) Raid().activeIds(R).forEach((u) => { const key = `boss|${u}`; if (ulSeen[key]) return; const p = (R.players || {})[u] || {}, f = Raid().bossFirst(L, R, u); if (f.length && f.every(Boolean) && DS.Attack.canUlt(p.fx, p.hero)) { ulSeen[key] = true; push({ u, kind: 'ult' }); } });
    petriHall(step);
    if (!ulBusy) ulNext();
  }
  function ulNext() {
    const it = ulQ.shift(); if (!it || !DS.Attack) { ulBusy = false; return; } ulBusy = true;
    const p = (R.players || {})[it.u] || {}, gold = it.kind === 'true' || it.kind === 'tcut'; // 🌟 tcut = 📸 진필살기 다음 통과자 (금빛 컷인만)
    DS.Attack.cutin(p.hero || 0, p.fx || 'flame', { gold, ...cutHost() }).then(() => { try { const arena = $('#raid'), m0 = $('#rm'); if (arena && m0) { DS.Attack.ultBlast(arena, m0, p.fx || 'flame'); setTimeout(() => { if (!DS.Thrill) return; if (it.kind === 'true') DS.Thrill.petrify(m0.querySelector('.art.monster') || m0); else if (!it.noBind) DS.Thrill.chain(m0, DS.Combo ? DS.Combo.ULT_BIND : 15, 'ult'); }, 500); } } catch (e) { console.error(e); } }).catch(() => {}).finally(() => setTimeout(ulNext, gold ? 1800 : 1400)); // 중간에 오류가 나도 다음 필살기가 막히지 않게
  }
  // 🗿 석화 남은 초 (교실 TV 위쪽 큰 띠) · 몬스터 회색
  let petriEnd = 0, petriT = null;
  function petriHall(step) {
    const pt = step && step.kind === 'monster' ? Raid().stone(R, step.id) : step && step.kind === 'boss' ? Raid().stone(R, 'boss') : null, arena = $('#raid'), m0 = $('#rm'); // 🗿 진필살기 · 🛡 홀리 방패 석화
    const on = !!(pt && DS.Net.now() < pt.until);
    if (m0) m0.classList.toggle('petrified', on);
    let bn = document.querySelector('.h-petri');
    if (!on) { if (bn) bn.remove(); clearInterval(petriT); petriEnd = 0; return; }
    if (bn && petriEnd === pt.until) return;
    petriEnd = pt.until; if (!bn && arena) { bn = document.createElement('div'); bn.className = 'h-petri'; arena.appendChild(bn); }
    const by = (R.players || {})[pt.by] || {}, draw = () => { const s = Math.ceil((pt.until - DS.Net.now()) / 1000); if (!bn || !bn.isConnected) return; if (s <= 0) { bn.remove(); clearInterval(petriT); if (m0) m0.classList.remove('petrified'); return; } bn.innerHTML = `🗿 석화 <b>${s}</b>초 <small>${pt.holy ? `🛡 ${(pt.all || [pt.by]).map((u) => esc(((R.players || {})[u] || {}).nick || '')).join(' · ')}의 홀리 방패 — 지금 맞히면 💎!` : `${esc(by.nick || '')}의 🌟 진필살기 — 몬스터 공격 멈춤 · 지금 맞히면 💎!</small>`}`; };
    draw(); clearInterval(petriT); petriT = setInterval(draw, 500);
  }
  function gritHall(p) {
    const arena = $('#raid'); if (!arena) return;
    const b = document.createElement('div'); b.className = 'h-grit'; b.textContent = `🔥 끈기의 일격! ${p.num ? `${p.num}번 ` : ''}${p.nick || ''} 드디어 성공!`; arena.appendChild(b); setTimeout(() => b.remove(), 3200);
    if (Snd() && Snd().correct) Snd().correct();
  }
  function lvHall() {
    const v = R.lvup || {}, first = !lvSeen; if (first) lvSeen = {};
    Object.entries(v).forEach(([u, x]) => { const key = `${u}|${x && x.lv}`; if (!x || lvSeen[key]) return; lvSeen[key] = true; if (!first) lvQ.push([u, x.lv]); });
    if (!lvBusy) lvNext();
  }
  function lvNext() {
    const it = lvQ.shift(); if (!it) { lvBusy = false; return; } lvBusy = true;
    const [u, lv] = it, p = (R.players || {})[u] || {};
    const n = document.createElement('div'); n.className = 'h-lvup'; n.innerHTML = `${DS.Art.hero(p.hero || 0, 'attack', 'pairhop')}<div><p>🎉 LEVEL UP!</p><b>${p.num ? `${p.num}번 ` : ''}${esc(p.nick || '')}</b><span>Lv.${lv}</span></div>`;
    document.getElementById('screen-hall').appendChild(n); Snd().correct();
    const h = document.getElementById(`fh-${u}`); if (h) h.classList.add('lv-glow');
    setTimeout(() => { n.remove(); if (h) h.classList.remove('lv-glow'); lvNext(); }, 2200);
  }
  const toCamp = () => DS.Control.run(() => DS.TCamp.enter({ code, hallKey, hall: true }));
  const klassBtn = () => (DS.ShareCard.klassReady(L, R) ? '<button class="btn sc-btn" id="h-klass">🏫 학급 결과</button>' : '');
  // 🏁 반대항 경주 (v0.9.11): 수업이 끝나면 저절로 한 번 · 버튼으로 다시 · ⏳ 연장전 결과는 다음 수업 대기실에서
  const punchable = () => !!(DS.Punch && L && R && R.meta.cls && L.no && !L.eval && !DS.Act.punchOff(R));
  const punchBtn = () => (punchable() ? '<button class="btn" id="h-punch">🏁 반대항 경주</button>' : '');
  let punchSeen = '', otSeen = '';
  const hallOn = () => typeof document !== 'undefined' && !!(document.getElementById('screen-hall') || {}).classList && document.getElementById('screen-hall').classList.contains('active');
  // 🏁 #68 B (2026-11-11): 종합실 끝 = 🏫 학급 결과 한 장 저절로 · 반대항은 선생님이 누를 때만
  let klassSeen = '';
  function klassAuto() { if (klassSeen === code || !DS.ShareCard.klassReady(L, R)) return; klassSeen = code; setTimeout(() => { if (hallOn()) DS.Control.run(() => DS.ShareCard.klassOpen(L, R)); }, 1800); }
  function otAuto() {
    const ot = (R.meta || {}).otShow; if (!ot || !DS.Punch || otSeen === code || DS.Act.punchOff(R)) return; otSeen = code;
    const Lo = DS.Lessons.get(ot.lesson); if (Lo) setTimeout(() => { if (hallOn()) DS.Punch.open(Lo, R, { big: true, overtime: true }).catch(() => {}); }, 2500);
  }
  function bindActs() {
    const pb = $('#h-punch'); if (pb) pb.onclick = () => DS.Control.run(() => DS.Punch.open(L, R, { big: true }));
    const ob = $('#h-ot'); if (ob) ob.onclick = () => { const Lo = DS.Lessons.get(R.meta.otShow.lesson); if (Lo) DS.Control.run(() => DS.Punch.open(Lo, R, { big: true, overtime: true })); };
    const k = $('#h-klass'); if (k) k.onclick = () => DS.Control.run(() => DS.ShareCard.klassOpen(L, R));
    const c = $('#h-tcamp'); if (c) c.onclick = toCamp;
  }
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;
  const studs = () => Object.entries(R.players || {}).filter(([, p]) => !p.teacher).sort((a, b) => a[1].num - b[1].num);
  const inClass = () => studs().filter(([u]) => Raid().isLobby(R) || (R.active || {})[u]);
  const dungeonName = () => { const D = DS.ASSETS.dungeons, i = D.ids.indexOf(L.theme); return i >= 0 ? D.names[i] : '던전'; };

  // 🎯 오늘의 목표 (수업 시작 순간 한 번) · ⏰ 시간 안 클리어 (보스를 이긴 순간 한 번) · 👑 문 닫힘 (교시 끝)
  let goalSeen = '', clearSeen = '';
  function bigNote(html, ms = 3600, cls = '') { const n = document.createElement('div'); n.className = `h-bignote ${cls}`; n.innerHTML = html; document.getElementById('screen-hall').appendChild(n); setTimeout(() => n.remove(), ms); }
  function goalAndClear(i) {
    const d = Raid().deadline(R);
    if (d && i === 0 && goalSeen !== code && R.state.stepAt && DS.Net.now() - R.state.stepAt < 15000) { goalSeen = code; bigNote(`<p>🎯 오늘의 목표</p><b>${C().hm(d)} 종이 치기 전에<br>👑 보스 처치!</b>`, 4200, 'goal'); }
    if (d && Raid().bossHp(L, R).won && clearSeen !== code) {
      clearSeen = code; const st = R.state || {}, won = Number(st.bossWonAt || 0) || DS.Net.now(), left = Math.max(0, Math.round((d - won) / 60e3));
      if (won < d) { bigNote(`<p>⏰ 시간 안에 클리어!</p><b>${left}분 남기고 보스 처치</b>`, 4200, 'clear'); if (DS.Act.isHost(R) && st.clearLeft == null) DS.Net.set(`rooms/${code}/state/clearLeft`, left).catch(() => {}); }
    }
  }
  C().onTimeUp('hall-bat', () => { if (R && L && code && DS.Act.isHost(R) && document.getElementById('screen-hall').classList.contains('active')) DS.Act.batTick(code, R, L).catch(() => {}); }); // 🦇 (v0.9.11)
  // ── v0.9.11 🔥 콤보 미터 · ✨ 퍼펙트 쇠사슬 · ⚡ 단계 · 👑 보스 단계 · 🦇 박쥐 ─────────────
  let han = null, hthSeen = null, hPhase = 0;
  function thrillHall() {
    if (!L || !R || !DS.Combo || !DS.Thrill) return;
    han = DS.Combo.analyze(L, R, DS.Net.now());
    const first = !hthSeen; if (first) hthSeen = {};
    const host = document.getElementById('screen-hall');
    han.ev.forEach((e) => { const k = `${e.u}|${e.k}`; if (hthSeen[k]) return; hthSeen[k] = true; if (first || !e.pf) return;
      setTimeout(() => { DS.Thrill.chain($('#rm'), e.bind, 'pf'); const h = document.getElementById(`fh-${e.u}`); if (h && e.streak > 1) { const t = document.createElement('span'); t.className = 'pf-tag'; t.textContent = `✨ ×${e.streak}`; h.appendChild(t); setTimeout(() => t.remove(), 1800); } }, 900); });
    han.marks.forEach((m) => { const k = `t${m.at}|${m.n}`; if (hthSeen[k]) return; hthSeen[k] = true; if (!first) { DS.Thrill.tierNote(m.n, host); DS.Thrill.chain($('#rm'), DS.Combo.TIER_BIND[m.n]); } });
    const st = Raid().stepOf(L, R), bh = Raid().bossHp(L, R);
    if (st && st.kind === 'boss' && !bh.won && !Raid().isClosed(R)) {
      const ph = DS.Combo.bossPhase(bh.max ? bh.left / bh.max : 1);
      if (hPhase && ph.phase > hPhase) { DS.Thrill.phaseNote(ph, host); const a = $('#raid'); if (a) { a.classList.remove('quake-big'); void a.offsetWidth; a.classList.add('quake-big'); setTimeout(() => a.classList.remove('quake-big'), 1500); } Snd().rumble(); }
      hPhase = ph.phase; const a = $('#raid'); if (a) { a.classList.toggle('ph-2', ph.phase === 2); a.classList.toggle('ph-3', ph.phase === 3); }
    } else hPhase = 0;
    comboHall();
  }
  function comboHall() {
    if (!L || !R || !DS.Combo || !DS.Thrill) return;
    const now = DS.Net.now(), b = DS.Combo.bat(L, R, now);
    if (b && !b.live && b.ok && han && !han.ev.some((e) => e.kind === 'bat')) return thrillHall();
    const cb = $('#h-combo'); if (cb) { const h = DS.Thrill.badge(DS.Combo.comboNow(han, R, now), { big: true }) + (han && han.best >= 5 ? `<small class="th-best">오늘 최고 ${han.best}${(R.meta || {}).comboBest ? ` · 반 기록 ${R.meta.comboBest}` : ''}</small>` : ''); if (cb.innerHTML !== h) cb.innerHTML = h; }
    DS.Thrill.batHall($('#raid'), Raid().isClosed(R) ? null : b);
  }
  C().onTimeUp('hall', (now) => { if (!R || !L || !document.getElementById('screen-hall').classList.contains('active')) return; C().doorMount('hall', code, R, L); if (DS.Act.isHost(R)) C().doorHost(code, R, L, now); }); // ⏰ #68 A 보스 문 닫기 장면 (마감 → 15초 묻기 → 끝)
  // 🧭 위 줄 「도입 · 개념 · 문제 · 형성」 (2026-11-07 최종 정돈판 ⑤): 지금 단계만 금색 + 그 종류 안에서 「1 / 5」 · 아래 얇은 진행 점(단계 하나 = 점 하나 · 형성평가는 긴 점)
  const KIND4 = (st) => (st.kind === 'concept' ? '개념' : st.kind === 'monster' ? '문제' : st.kind === 'boss' ? '형성' : '도입');
  function stepChips(i) {
    const steps = L.steps, now = steps[i], kinds = ['도입', '개념', '문제', '형성'];
    const chips = kinds.map((k) => { const same = steps.filter((x) => KIND4(x) === k); if (!same.length) return ''; const on = now && KIND4(now) === k; return `<i class="${on ? 'on' : ''}">${k}${on && same.length > 1 ? `<small>${same.indexOf(now) + 1} / ${same.length}</small>` : ''}</i>`; }).join('');
    const dots = steps.map((x, k) => `<i class="${x.kind === 'boss' ? 'b ' : x.kind === 'concept' ? 'c ' : ''}${k < i || Raid().isClosed(R) ? 'd' : k === i ? 'on' : ''}"></i>`).join('');
    return `<span class="h-stp">${Raid().isLobby(R) ? '<i class="on">대기실</i>' : Raid().isFinale(L, R) ? '<i class="on">마무리</i>' : chips}</span><span class="h-dots">${dots}</span>`;
  }
  let gearOpen = false; // ⚙ 종합실 메뉴 (메뉴화면 · 선생님 모습 · 캠프 보기 · 전체 화면 · 보스 문 닫힘 시각)
  if (typeof window !== 'undefined') window.addEventListener('ds-roster', () => { try { if (R && L) render(); } catch (e) { /* 무시 */ } }); // 🧮 명단 번호를 받으면 다시 그림
  // 🎵 #91 종합실 TV 배경음 (2026-11-11 DECISIONS): 대기실 lobby · 몬스터 raid-1 → 2 → 3(몬스터마다 다음) · 👑 보스 boss-1 / boss-2(수업마다 번갈아) · 🎉 승리 win 한 번 · 🏕 쉼터 rest · 놀이 bal · rev · ox · nun · td
  //   🎚 전투 음량 = 10% + 60% × (1 − 남은 체력 비율) · 개념 · 도입 = 없음(설명 시간) · 수업 끝 = 없음
  const FUN_BGM = { bal: 'bal', rev: 'rev', ox: 'ox', quiz: 'ox', nun: 'nun', td: 'td' };
  function hallBgm() {
    const S = DS.Sound; if (!S || !S.bgm || !R || !L) return; // 체험판 위 TV(embed)는 효과음만 끄고 배경음은 TV 쪽이 냄
    const st = Raid().stepOf(L, R), sc = (hp) => (hp && hp.max ? 0.1 + 0.6 * (1 - Math.max(0, hp.left) / hp.max) : 0.1);
    let k = null, scale;
    if (Raid().isClosed(R)) k = null;
    else if (Raid().isLobby(R)) k = 'lobby';
    else if (Raid().restOn(R)) k = (R.fun && FUN_BGM[R.fun.kind]) || 'rest';
    else if (st && st.kind === 'monster') { const n = L.steps.filter((x) => x.kind === 'monster').findIndex((x) => x.id === st.id); k = `raid-${(Math.max(0, n) % 3) + 1}`; scale = sc(Raid().monsterHp(L, R, st.id)); }
    else if (st && st.kind === 'boss') { const bh = Raid().bossHp(L, R); if (bh.won) k = 'win'; else { let alt = 1; try { const key = 'ds-boss-bgm', m = JSON.parse(localStorage.getItem(key) || '{}'); if (m[code] == null) { m.n = (m.n || 0) + 1; m[code] = m.n % 2 ? 1 : 2; localStorage.setItem(key, JSON.stringify(m)); } alt = m[code]; } catch (e) { /* 이 기기만 */ } k = `boss-${alt}`; scale = sc(bh); } }
    else if (Raid().isEnd(L, R) && Raid().bossHp(L, R).won) k = 'win';
    S.bgm(k, 'tv', scale != null ? { scale } : {});
    if (S.bgmHold) S.bgmHold('hall', !!(st && (Raid().videoOn(R, st.id) || Raid().sheetOn(R)))); // 🎬 영상 · 📄 학습지 창 = 멈춤
    hallDuck();
  }
  function render() {
    hallBgm();
    const i = R.state.step ?? -1;
    if (DS.Titles && DS.Titles.watch) { DS.Titles.setNo(L && !L.eval ? L.no : null); setTimeout(() => DS.Titles.watch(R, L, 'h', code), 0); } // 🏅 #63 칭호 사건 (그린 뒤 · 동시 5 줄 서기)
    // 2026-11-07 정돈판 비교 1~3: 위 한 줄 = 「n차시 · 단계」 · 4단계 · 시간 막대 · 🚪 코드 · ⚙ (메뉴화면 · 선생님 모습 · 캠프 보기 · 전체 화면은 ⚙ 안)
    $('#h-top').innerHTML = `<b>${L.no ? `${DS.Lessons.noText(L.no)}차시 · ` : ''}${esc(Raid().isLobby(R) ? '대기실' : C().stepName(L, R))}</b>${stepChips(i)}<span class="h-tb2" id="h-tb2"></span><button class="h-code-chip" id="h-code-big" title="늦게 온 학생 · 다시 들어오는 학생용 — 누르면 크게">🚪 코드 <b>${code}</b></button><button class="h-gear" id="h-gear" title="메뉴화면 · 선생님 모습 · 캠프 보기 · 전체 화면">⚙</button>
      <div class="h-gmenu" id="h-gmenu"${gearOpen ? '' : ' hidden'}><button class="btn small" id="h-menu">◀ 메뉴화면</button><button class="btn small" id="h-set">🧙 선생님 모습</button>${!Raid().isClosed(R) && !Raid().isLobby(R) ? '<button class="btn small" id="h-camp">🏕 캠프 보기</button>' : ''}${DS.UI.fs.btn('h-fs')}${DS.Titles && DS.Titles.off ? `<button class="btn small" id="h-tfx">${DS.Titles.off() ? '🏅 칭호 효과 꺼짐 → 켜기' : '🏅 칭호 효과 켜짐 → 끄기'}</button>` : ''}<span class="muted small" id="h-close-at"></span></div>`;
    { const tb = $('#h-tfx'); if (tb) tb.onclick = () => { DS.Titles.setOff(!DS.Titles.off()); tb.textContent = DS.Titles.off() ? '🏅 칭호 효과 꺼짐 → 켜기' : '🏅 칭호 효과 켜짐 → 끄기'; }; } // 🏅 #63 종합실 「칭호 효과 끄기」 (기본 켬 · 이 PC 만)
    { const g = $('#h-gear'); if (g) g.onclick = () => { gearOpen = !gearOpen; const mm = $('#h-gmenu'); if (mm) mm.hidden = !gearOpen; }; const gm = $('#h-gmenu'); if (gm) gm.addEventListener('click', () => { gearOpen = false; setTimeout(() => { const x = $('#h-gmenu'); if (x) x.hidden = true; }, 0); }); /* 고르면 ⚙ 메뉴 닫힘 */ const mb = $('#h-menu'); if (mb) mb.onclick = () => { const nb = document.querySelector('#screen-hall .nav-back'); if (nb) nb.click(); }; }
    { const ca = $('#h-close-at'), dl = Raid().deadline(R); if (ca && dl) { const d = new Date(dl); ca.textContent = `👑 보스 문 닫힘 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; } }
    { const cb = $('#h-code-big'); if (cb) cb.onclick = () => bigNote(`<p class="h-bigcode-t">🚪 수업 코드</p><b class="h-bigcode">${code}</b><p class="muted">학생 폰 → 내 캠프 → 🚪 코드로 입장</p>`, 6000, 'code'); }
    { const hc = $('#h-camp'); if (hc) hc.onclick = toCamp; } // 🏕 수업 중에도 캠프 보기 (2026-11-06 사용자 C · 「교사도 캠프로 가야 되는데」) → 캠프의 「⚔ 레이드로 돌아가기」로 복귀
    { const hs = $('#h-set'); if (hs) hs.onclick = () => C().run(() => DS.Camp.settings({ teacher: true, onSave: async (v) => { await DS.Net.set(`rooms/${code}/state/tlook`, { hero: v.hero, fx: v.fx, at: DS.Net.TS }).catch(() => {}); built = ''; if (R) render(); } })); }
    { const tb = $('#h-tb2'); if (tb) tb.innerHTML = C().tbarHtml(L, R, { mini: true }); } // ⏳ 시간 막대 = 위 한 줄 안 (2026-11-07 비교 2)
    goalAndClear(i);
    DS.UI.fs.bind('h-fs');
    heroes(); side(i);
    const step = Raid().stepOf(L, R);
    videoOverlay(step);
    const el = $('#h-arena');
    el.classList.toggle('focus-on', Raid().focusOn(R) && !Raid().isLobby(R));
    if (Raid().isClosed(R)) { built = 'closed'; el.innerHTML = `<div class="h-victory"><div class="trophy"><i class="trophy-img" style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.trophy}')"></i></div>${(R.state || {}).timeUp ? '<h1>👑 보스가 문을 닫았다!</h1><p class="tu-msg">🏰 성채 · 🎯 허수아비에서 이어서 복습해요</p>' : '<h1>수업 끝!</h1>'}<p class="muted">모두 내 캠프로 돌아갔어요. 게임 기록은 수학 성적이 아니에요.</p><div class="stamp-bar big">📮 반드시 학습지 확인도장 받아가세요.</div><div class="h-acts row">${klassBtn()}${punchBtn()}<button class="btn primary" id="h-tcamp">🏛 교사 캠프 가기</button></div></div>`; bindActs(); klassAuto(); return; }
    if (Raid().restOn(R) && !Raid().isLobby(R) && !Raid().isClosed(R)) { if (DS.Fun && DS.Fun.on(R)) { built = 'fun'; clearInterval(bubbleT); return DS.Fun.hall($('#h-arena'), R, code); } return restScene(); }
    if (step && (step.kind === 'monster' || step.kind === 'boss')) { const key = `f${i}`; if (built !== key || !document.getElementById('rh-bar')) buildFight(step, key); else updateFight(step); /* 장면이 다른 것으로 바뀌어 있었으면 다시 그림 */ sheetOverlay(step); return; }
    clearInterval(bubbleT);
    if (Raid().isLobby(R) || Raid().isFinale(L, R)) return lobbyScene(Raid().isFinale(L, R));
    // v0.9.2: 개념 설명 = 왼쪽 개념 · 오른쪽 바로 이어지는 문제 (일반 문제 m 만 — ⭐ 스페셜 난입은 미리 보이지 않게). 문제 칸 이미지가 없으면 개념 하나만 크게
    const nx = L.steps[i + 1], prob = nx && nx.kind === 'monster' && !nx.special && !nx.review ? nx : null;
    const img = (prep.img || {})[step.img || step.id], pimg = prob ? (prep.img || {})[prob.id] : null, split = !!(img && pimg); // step.img = 다른 칸 그림 (🔁 전시 확인 = 'review' · 2026-11-09 #25)
    if (zoomStep !== i) { zoomStep = i; zoom = ''; }
    const key = `c${i}|${img ? img.length : 0}|${pimg ? pimg.length : 0}|${zoom}`;
    if (built === key) return;
    built = key;
    const one = img ? `<img src="${img}" alt="${esc(step.title)} 학습지">` : `<div class="h-sheet-empty">📄 학습지 이미지 칸<br><span class="muted small">수업 준비 화면에서 '${esc(step.title)}' 이미지를 넣으면 여기에 크게 떠요</span><p class="h-intro">${pretty(step.say || '')}</p></div>`;
    el.innerHTML = split
      ? `<div class="h-concept split${zoom ? ` zoom-${zoom} wfull` : ''}">
        <div class="h-half" data-zoom="l"><p class="h-ctitle">📣 ${esc(step.title)}</p><div class="h-sheet"><img src="${img}" alt="${esc(step.title)} 학습지"></div></div>
        <div class="h-half" data-zoom="r"><p class="h-ctitle prob">⚔ 이어지는 문제 · ${esc(prob.title)}</p><div class="h-sheet"><img src="${pimg}" alt="${esc(prob.title)} 학습지"></div></div>
        <p class="h-zoom-tip muted small">${zoom ? '누르면 좌우로 다시 나눠 봐요' : '한쪽을 누르면 그쪽만 크게'}</p>
        <div class="h-focus-badge">⚠ 집중모드 — 학생 폰 멈춤</div></div>`
      : `<div class="h-concept${zoom && img ? ' wfull' : ''}"${img ? ' data-zoom="one"' : ''}><p class="h-ctitle">📣 ${esc(step.title)}</p>
      <div class="h-sheet">${one}</div>${img ? `<p class="h-zoom-tip muted small">${zoom ? '누르면 원래 크기로' : '그림을 누르면 화면 가득 크게'}</p>` : ''}
      <div class="h-focus-badge">⚠ 집중모드 — 학생 폰 멈춤</div></div>`;
    el.querySelectorAll('[data-zoom]').forEach((h) => (h.onclick = (e) => { e.stopPropagation(); zoom = zoom ? '' : h.dataset.zoom; render(); }));
  }

  // ── 왼쪽: 용사단 ─────────────────────────────────────────
  function heroes() {
    const list = inClass(), step = Raid().stepOf(L, R), fin = Raid().isEnd(L, R);
    const st = (u, p) => {
      if (!Raid().online(R, u) && !Raid().isLobby(R)) return '<span class="st off">끊김</span>';
      if (Raid().isLobby(R)) return '<span class="st">대기</span>';
      if (fin || p.lobby) return (R.words || {})[u] ? '<span class="st ok">💬 남김</span>' : '<span class="st">대기실</span>';
      if (Raid().focusOn(R)) return '<span class="st">👀 집중</span>';
      if (step && step.kind === 'monster') return Raid().record(L, R, step.id, u).submitted ? '<span class="st ok">제출 ✔</span>' : '<span class="st">풀이 중…</span>';
      if (step && step.kind === 'boss') return Raid().bossAnswered(R, u) ? '<span class="st ok">제출 ✔</span>' : '<span class="st">풀이 중…</span>';
      return '<span class="st">수업 중</span>';
    };
    const on = list.filter(([u]) => Raid().online(R, u)).length;
    $('#h-heroes').innerHTML = `<p class="shelf-title">⚔ 용사단 <span class="muted">${Raid().isLobby(R) ? `입장 ${list.length}` : `접속 ${on} / ${list.length}`}</span></p>
      <div class="hrow teach">${DS.Art.hero(DS.Art.teacherHero(R), 'idle', 'mini')}<b>선생님</b><i class="dot"></i></div>
      ${list.map(([u, p]) => `<div class="hrow">${DS.Art.hero(p.hero, 'idle', 'mini')}<span>${DS.Titles.nameHtml(p, { size: 16, short: true, uid: u })}</span>${st(u, p)}<i class="dot${Raid().online(R, u) || Raid().isLobby(R) ? '' : ' off'}"></i></div>`).join('')}
      <p class="muted small h-legend">● 접속 · ○ 끊김 — 정답·오답 글자는 띄우지 않아요</p>`;
  }

  // ── 가운데: 던전 단체 대기실 (수업 전 · 마무리) ─────────────
  function lobbyScene(finale) {
    const list = inClass().filter(([, p]) => !finale || true);
    const mis = finale ? '' : C().missingHtml(R, true); // 🧮 #24 아직 안 들어온 번호
    const onN = list.filter(([u]) => Raid().online(R, u)).length; // 👥 2026-11-09 선생님: 대기실 접속 인원 (지금 연결 / 입장)
    const sig = `lobby|${finale}|${onN}|${mis}|${list.map(([u, p]) => u + p.hero + (p.title || '')).join()}|${finale ? JSON.stringify([R.words, R.hide]) : ''}|${DS.ShareCard.klassReady(L, R)}|t${DS.Art.teacherHero(R)}`; // 2026-11-08 사용자 「교사 캠프에서 모습 바꿔도 던전 들어가면 그대로」: 선생님 모습이 바뀌면 다시 그림
    if (built === sig) return;
    built = sig;
    const n = list.length, size = n > 24 ? 62 : n > 16 ? 72 : 84, per = Math.max(1, Math.ceil(n / 3));
    const pos = list.map(([u, p], i) => {
      const ring = i % 3, k = Math.floor(i / 3), a = Math.PI * (0.04 + 0.92 * ((k + ring * 0.33) / per));
      const rx = 23 + ring * 12.5, ry = 7 + ring * 8.5;
      return { u, p, x: 50 - Math.cos(a) * rx, y: 66 + Math.sin(a) * ry, flip: Math.cos(a) < 0 };
    });
    const words = finale ? Object.entries(R.words || {}).filter(([u]) => !(R.hide || {})[u]).map(([u]) => u) : [];
    $('#h-arena').innerHTML = `<div class="h-lobby2 bg-scene th-${L.theme || ''}${finale ? ' finale' : ''}">
      <p class="lb2-title">${finale ? `<i class="trophy-img sm" style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.trophy}')"></i> ${esc(dungeonName())} 클리어!` : `⚔ ${esc(dungeonName())} · 던전 입장!`}</p>
      <p class="lb2-sub">${finale ? '오늘 배운 것 한마디씩 남기고 가자' : `${esc(L.title)} — 선생님 주위로 모여라`}</p>
      ${finale && DS.Result.floorText(L) ? `<p class="lb2-floor">${DS.Result.floorText(L)}</p>` : ''}
      ${finale ? `<div class="lb2-cnt">💬 ${words.length} / ${n}</div>` : `<div class="lb2-qr"><div id="h-qr" class="qr"></div><b>${code}</b><span>QR · 수업 코드</span></div><div class="lb2-cnt lb2-on">👥 접속 <b>${onN}</b>명 · 입장 ${n}명</div>${mis ? `<div class="lb2-miss">${mis}</div>` : ''}`}
      <div class="lb2-say teacher">${finale ? '모두 수고했네! 오늘 배운 것 한마디씩 남기게' : `${L.no ? `${DS.Lessons.noText(L.no)}차시 ` : ''}${esc(L.title.split('·')[0].trim())} 던전에 온 것을 환영하네!`}</div>
      <div class="lb2-h teacher" style="left:50%;top:60%">${DS.Art.hero(DS.Art.teacherHero(R), finale ? 'attack' : 'idle', finale ? 'pairhop' : 'huff')}<i class="shadow"></i><span class="nm gold">선생님</span></div>
      ${pos.map((o, i) => `<div class="lb2-h${enhCls(o.p)}" style="left:${o.x}%;top:${o.y}%;z-index:${5 + Math.round(o.y / 10)};--sz:${size}px;animation-delay:${(i * 0.13) % 0.9}s"><span class="nm stk">${DS.Titles.nameHtml(o.p, { size: 14, stack: true, uid: o.u })}</span><div class="${(finale ? i % 2 === 1 : o.flip) ? 'face-l' : ''}">${DS.Art.hero(o.p.hero, 'idle', finale ? 'pairhop' : 'huff')}</div><i class="shadow"></i>${finale && words.includes(o.u) ? `<span class="lb2-bub" data-u="${o.u}">${esc(R.words[o.u].t)}</span>` : ''}</div>`).join('')}
      ${finale ? '<div class="stamp-bar wide">📮 반드시 학습지 확인도장 받아가세요.</div>' : ''}
      ${Raid().focusOn(R) ? '<div class="h-focus-badge">⚠ 집중모드</div>' : ''}
      <div class="h-acts corner${finale ? '' : ' below-qr'}">${finale ? klassBtn() + punchBtn() : `<button class="btn small" id="h-tcamp">🏛 교사 캠프</button>${(R.meta || {}).otShow && DS.Punch && !DS.Act.punchOff(R) ? '<button class="btn small" id="h-ot">⏳ 연장전 결과</button>' : ''}`}</div></div>`;
    bindActs(); if (!finale) { otAuto(); C().bindMissing($('#h-arena'), code); }
    if (!finale && window.QRCode) new QRCode($('#h-qr'), { text: studentUrl(), width: 150, height: 150 });
    if (finale) rotateBubbles();
  }
  // 🏕 쉼터 (2026-11-04): 대기실 장면을 편안하게 — 따뜻한 불빛 · 가운데 모닥불 · 모두 둘러앉음 · 타이머 (선생님이 PC 로 퀴즈를 해도 뒤에 깔려 있음)
  function restScene() {
    const list = inClass(), r = (R.state || {}).rest || {}, sig = `rest|${r.at}|${r.min}|${list.map(([u, p]) => u + p.hero).join()}|t${DS.Art.teacherHero(R)}`;
    if (built === sig) return;
    built = sig; clearInterval(bubbleT);
    const n = list.length, size = n > 24 ? 62 : n > 16 ? 72 : 84, per = Math.max(1, Math.ceil(n / 3)), c = DS.ASSETS.camp;
    const pos = list.map(([u, p], i) => {
      const ring = i % 3, k = Math.floor(i / 3), a = Math.PI * (0.04 + 0.92 * ((k + ring * 0.33) / per));
      return { u, p, x: 50 - Math.cos(a) * (23 + ring * 12.5), y: 64 + Math.sin(a) * (7 + ring * 8.5), flip: Math.cos(a) > 0 };
    });
    $('#h-arena').innerHTML = `<div class="h-lobby2 rest bg-scene th-${L.theme || ''}">
      <p class="lb2-title">🏕 쉼터</p><p class="lb2-sub">잠깐 쉬어 가요 — 물 한 모금 · 기지개 쭉!</p>
      <div class="rest-timer">⏱ <b data-rest-end="${C().restEnd(R)}">${C().mmss(C().restLeft(R))}</b></div>
      <div class="rest-fire"><i class="camp-glow"></i><i class="camp-glow g2"></i><i class="camp-fire-img" style="background-image:url('${DS.ASSETS.base}${c.fire.src}');background-size:${c.fire.cols * 100}% ${(c.fire.rows || 1) * 100}%;background-position:0 0"></i></div>
      <div class="lb2-say teacher">잠깐 쉬었다 가세! 🔥</div>
      <div class="lb2-h teacher" style="left:50%;top:44%">${DS.Art.hero(DS.Art.teacherHero(R), 'sit', 'huff')}<i class="shadow"></i><span class="nm gold">선생님</span></div>
      ${pos.map((o, i) => `<div class="lb2-h${enhCls(o.p)}" style="left:${o.x}%;top:${o.y}%;z-index:${5 + Math.round(o.y / 10)};--sz:${size}px;animation-delay:${(i * 0.13) % 0.9}s"><span class="nm stk">${DS.Titles.nameHtml(o.p, { size: 14, stack: true, uid: o.u })}</span><div class="${o.flip ? 'face-l' : ''}">${DS.Art.hero(o.p.hero, 'sit', 'huff')}</div><i class="shadow"></i></div>`).join('')}</div>`;
    const f = c.fire; let k = 0; clearInterval(restFireT);
    restFireT = setInterval(() => { const e = document.querySelector('#h-arena .rest-fire .camp-fire-img'); if (!e) { clearInterval(restFireT); return; } k = (k + 1) % f.frames; e.style.backgroundPosition = `${((k % f.cols) / Math.max(1, f.cols - 1)) * 100}% ${(Math.floor(k / f.cols) / Math.max(1, (f.rows || 1) - 1)) * 100}%`; }, f.ms);
  }
  let restFireT = null;
  // 말풍선은 한 번에 6개까지, 4초마다 돌아가며
  function rotateBubbles() {
    clearInterval(bubbleT);
    const show = () => {
      const b = [...document.querySelectorAll('.lb2-bub')];
      if (!b.length) return;
      const n = Math.min(6, b.length), start = (bubbleK * n) % b.length;
      b.forEach((x, i) => x.classList.toggle('on', ((i - start + b.length) % b.length) < n));
      bubbleK++;
    };
    show(); bubbleT = setInterval(show, 4000);
  }

  // ── 레이드: 큰 몬스터 위 가운데 · 용사들은 아래 두 줄 (왼쪽 절반은 오른쪽을, 오른쪽 절반은 왼쪽을 본다) ──
  const fightOf = (step) => (step.kind === 'boss'
    ? { sprite: L.boss.sprite, hp: Raid().bossHp(L, R), done: Raid().bossHp(L, R).won, title: L.boss.title }
    : { sprite: L.monsters[step.id].sprite, hp: Raid().monsterHp(L, R, step.id), done: Raid().cleared(L, R, step.id), title: step.title });
  function attacks(step) {
    const out = {};
    Raid().activeIds(R).forEach((u) => {
      if (step.kind === 'boss') { const m = Raid().mastery(L, R, u).filter(Boolean).length; const n = Raid().bossTries(L, R, u).length; out[u] = { n, dmg: m }; }
      else if (Raid().isChain && Raid().isChain(L, R, step.id)) { // ⚔ 소레이드 (🐞 2026-11-10 핫픽스 「종합실에서 공격 모션이 아예 안 나감」: 소레이드는 tries 가 늘 0 → 단계 답을 낼 때마다 한 번)
        const rec = Raid().record(L, R, step.id, u), subs = Raid().chainSubs(R, step.id, u).filter((t) => !t.w), last = subs[subs.length - 1], ps = (rec.pass || 0) * 100 + (rec.pStage || 0), was = seen[u] || {};
        const prac = !!(last && last.p), up = prac ? ps > (was.ps || 0) : rec.stage > (was.dmg || 0);
        out[u] = { n: subs.length, dmg: rec.stage, ps, prac: false /* 한 판 더도 「몬스터 묶기!」 글자 없이 공격 모션만 (데미지 0) */, label: up ? (!prac && rec.done ? 'success' : 'partial') : 'fail', h: Object.values(Raid().healsOf(R, step.id)[u] || {}).filter((v) => typeof v === 'string' && !v.startsWith('!')).length }; // 💚 #50 소레이드 힐
      }
      else { const rec = Raid().record(L, R, step.id, u); out[u] = { n: rec.tries.length, dmg: rec.best, label: Raid().resultLabel(rec.last), prac: rec.practice, h: Object.values(Raid().healsOf(R, step.id)[u] || {}).filter((v) => v !== '!ult' && !Raid().isTcut(v)).length }; /* 2026-11-06 검증: ⚡ 필살기 칸은 「💚 응원」으로 세지 않음 (필살기 컷인만) */ }
    });
    return out;
  }
  function buildFight(step, key) {
    built = key; queue = []; wonFx = ''; vanished = ''; lastHit = ''; slKey = ''; if (demo && demo.step !== step) demoClose();
    const f = fightOf(step);
    const hs = studs().filter(([u]) => (R.active || {})[u]);
    const n = hs.length, row0 = Math.ceil(n / 2);
    const pos = hs.map(([u, p], i) => { const r = i < row0 ? 0 : 1, k = r ? i - row0 : i, cnt = r ? n - row0 : row0; const x = 7 + ((k + 0.5) / Math.max(1, cnt)) * 86 + (r ? 2 : 0); return { u, p, x, y: r ? 87 : 72 }; }); // 2026-11-04: 공격대를 위로 (몬스터와 간격 줄이고 아래 잘림 없게 · 예전 82 · 96)
    $('#h-arena').innerHTML = `<div class="raid2 bg-scene th-${L.theme || ''} ${step.kind === 'boss' ? 'boss quake' : ''}${step.special ? ' special' : ''}" id="raid">
      <div class="raid-top"><b>${step.kind === 'boss' ? '👑 ' : step.special ? '⭐ ' : step.review ? '📖 ' : ''}${esc(f.title)}</b></div>
      ${step.special ? '<div class="raid-banner">⭐ 스페셜 몬스터 난입!</div>' : step.kind === 'boss' ? '<div class="raid-banner boss">👑 보스 출현!</div>' : ''}
      <div class="raid2-shadow"></div><div class="raid2-mon" id="rm"><div class="raid-bars over-head"><div class="raid-hp"><i id="rh-bar"></i><span id="rh-txt"></span></div><div class="raid-atk" id="rh-atk" title="몬스터 공격 게이지 (학생 폰과 같은 시계)"><i></i><span></span></div></div>${DS.Art.monster(f.sprite, 'idle', 'float')}<div id="rm-fx"></div></div>
      ${pos.map((o) => `<div class="fh2${enhCls(o.p)}" id="fh-${o.u}" style="left:${o.x}%;top:${o.y}%;z-index:${5 + Math.round(o.y / 10)}"><span class="fh-name stk">${DS.Titles.nameHtml(o.p, { size: 14, stack: true, uid: o.u })}</span><div class="${o.x > 50 ? 'face-l' : ''}">${DS.Art.hero(o.p.hero, 'idle')}</div><i class="shadow"></i></div>`).join('')}
      <div class="h-leg" id="h-leg"></div><div class="raid-clear" id="r-clear" hidden></div><div class="h-focus-badge">⚠ 집중모드</div><div class="h-combo" id="h-combo"></div>
    </div>`;
    seen = attacks(step);
    if (step.kind === 'boss') Snd().rumble();
    updateFight(step);
  }
  function updateFight(step) {
    const f = fightOf(step);
    $('#rh-bar').style.width = `${f.hp.max ? (100 * f.hp.left) / f.hp.max : 0}%`;
    $('#rh-txt').textContent = `${step && step.kind === 'monster' && Raid().isChain && Raid().isChain(L, R, step.id) ? '👑 대장 · ' : ''}HP ${f.hp.left} / ${f.hp.max}`; // #37: 소레이드 = 대장 이름표 // 2026-11-07 비교 6: 기준 % 는 교사 폰에만
    const now = attacks(step);
    Object.entries(now).forEach(([u, a]) => {
      const was = seen[u] || { n: 0, dmg: 0 };
      if (a.n > was.n && !a.prac && a.dmg > was.dmg) lastHit = u; // ⚔ 마무리 일격 후보 = 체력을 깎은 마지막 학생
      if (a.n > was.n) queue.push({ u, dmg: a.prac ? 0 : Math.max(0, a.dmg - was.dmg), label: step.kind === 'boss' ? (a.dmg > was.dmg ? 'partial' : 'fail') : a.prac ? 'practice' : a.label });
      if ((a.h || 0) > (was.h || 0)) queue.push({ u, label: 'heal' }); // v0.9.6 💚 힐: 힐러만 보인다 (받은 학생은 안 보임)
    });
    seen = now;
    legend(step);
    const wait = step.kind === 'monster' ? Raid().waiting(L, R, step.id) : [];
    const clr = $('#r-clear');
    if (f.done) {
      clr.hidden = false; clr.className = 'raid-clear'; clr.innerHTML = step.kind === 'boss' ? '🎉 보스 격파! 모두 함께 이겼다!' : '⚔ 몬스터 격파!';
      if (wonFx !== built) { const fin = lastHit; setTimeout(() => finisher(fin, step), 350 * (queue.length + 1) + 300); }
      if (wonFx !== built) { wonFx = built; setTimeout(() => { const m = $('#rm'); if (m && vanished !== built) { const art = m.querySelector('.art.monster'); if (art) art.outerHTML = DS.Art.monster(f.sprite, 'down'); else m.insertAdjacentHTML('beforeend', DS.Art.monster(f.sprite, 'down')); } /* 2026-11-06 검증: 예전엔 m.innerHTML 로 머리 위 체력 막대(#rh-bar)까지 지워 → 다음 갱신마다 장면을 새로 그려 쓰러진 뒤의 공격(몬스터 묶기 · 힐) 연출이 사라지고 「마무리 일격」이 되풀이됨 */ Snd().correct(); document.querySelectorAll('.fh2').forEach((h, k) => { const a = h.querySelector('.art'); if (!a) return; a.parentElement.classList.toggle('face-l', k % 2 === 1); a.classList.add('pairhop'); a.style.animationDelay = `${(k % 2) * 0.22}s`; }); }, 600); }
    } else if (step.kind === 'monster' && !wait.length && f.hp.left > 0) {
      clr.hidden = false; clr.className = 'raid-clear note'; clr.innerHTML = `모두 공격했다! 남은 체력 ${f.hp.left} — 재도전으로 더 공격하자`;
    } else clr.hidden = true;
    play();
  }
  // 🏷 이름표 상태 + 왼쪽 위 범례 (2026-11-07 최종 정돈판 ⑤): ✓ 제출 · … 풀이 중 · z 끊김 — 정답 · 오답 · 재도전 횟수는 띄우지 않음
  function legend(step) {
    const cnt = { ok: 0, go: 0, off: 0 };
    studs().filter(([u]) => (R.active || {})[u]).forEach(([u]) => {
      const done = step.kind === 'boss' ? Raid().bossAnswered(R, u) : Raid().record(L, R, step.id, u).submitted;
      const k = !Raid().online(R, u) ? 'off' : done ? 'ok' : 'go'; cnt[k]++;
      const h = document.getElementById(`fh-${u}`); if (!h) return;
      h.classList.toggle('off', k === 'off');
      let si = h.querySelector('.si'); if (!si) { si = document.createElement('i'); const nm = h.querySelector('.fh-name .tname') || h.querySelector('.fh-name'); if (nm) nm.prepend(si); }
      si.className = `si ${k}`; si.textContent = k === 'ok' ? '✓' : k === 'go' ? '…' : '📵'; // 📵 #24: 끊김 ≠ 쓰러짐 (흐리게만 · 회색 X)
    });
    const el = document.getElementById('h-leg'); if (!el) return;
    const wait = studs().filter(([u]) => !(R.active || {})[u] && Raid().online(R, u)).length; // ● 접속 · 대기 (늦게 와 대기실에 있는 학생)
    el.innerHTML = `<span><i class="si ok">✓</i>제출 ${cnt.ok}</span><span><i class="si go">…</i>풀이 중 ${cnt.go}</span><span><i class="si on">●</i>접속 · 대기 ${wait}</span><span><i class="si off">📵</i>연결 끊김 ${cnt.off}</span><span class="nt">정답 · 오답 글자는 띄우지 않아요</span>`; // 2026-11-07 비교 4: 「제출 n / m」 큰 줄 삭제 (선생님 지시)
  }
  // ⚔ 마무리 일격 (2026-11-03 · 0.9.6.9 고침: 이름 배너 없앰): 체력을 0 으로 만든 학생의 용사가 슬로모션으로 돌진 → 하얀 섬광 · 큰 이펙트 두 번 · 강한 흔들림
  function finisher(u, step) {
    const arena = $('#raid'), h = u && document.getElementById(`fh-${u}`), m0 = $('#rm'), p = (R.players || {})[u]; if (!arena || !p) return;
    arena.classList.remove('slowmo', 'fin-flash', 'quake-big'); void arena.offsetWidth; arena.classList.add('slowmo'); // 1) 장면이 느려지며 살짝 어두워지고 다가감
    if (h && m0) {
      const hr = h.getBoundingClientRect(), mr = m0.getBoundingClientRect();
      h.style.setProperty('--tx', `${(mr.left + mr.width / 2 - (hr.left + hr.width / 2)) * 0.82}px`);
      h.style.setProperty('--ty', `${(mr.top + mr.height * 0.7 - (hr.top + hr.height / 2)) * 0.82}px`);
      h.classList.remove('dash', 'swing', 'dash-slow'); void h.offsetWidth; h.classList.add('finisher', 'dash-slow');
      pose(h, p.hero || 0, 'attack', 2400);
    }
    setTimeout(() => { // 2) 임팩트
      arena.classList.remove('slowmo'); arena.classList.add('fin-flash', 'quake-big');
      setTimeout(() => arena.classList.remove('fin-flash', 'quake-big'), 1500);
      const ar = arena.getBoundingClientRect(), mr = m0 ? m0.getBoundingClientRect() : ar;
      const at = { x: mr.left - ar.left + mr.width / 2, y: mr.top - ar.top + mr.height / 2 }, sc = Math.min(ar.width, ar.height) / 520;
      if (DS.FX) { DS.FX.play(arena, p.fx || 'flame', { ...at, scale: sc, perfect: true }); setTimeout(() => DS.FX.play(arena, p.fx || 'flame', { ...at, scale: sc * 0.75, perfect: true }), 220); }
      if (m0) { m0.classList.remove('flash'); void m0.offsetWidth; m0.classList.add('flash'); }
      Snd().hit(); setTimeout(() => Snd().hit(), 140); setTimeout(() => Snd().correct(), 380);
    }, 1450);
    if (h) setTimeout(() => h.classList.remove('finisher', 'dash-slow'), 2600);
  }
  // 👾 몬스터 공격 (학생 폰과 같은 시계 DS.Raid.atkClock): 체력바 바로 밑 게이지 → 다 차면 큰 공격 연출 + 용사 전원 피격 · 헉헉
  let atkT = null, atkMemo = {};
  // ❄ 📝 풀이 시간 (2026-11-06): 종합실 = 몬스터의 「꽁꽁 묶기」 → 용사 모두 얼어붙음 + 남은 초 · 끝나면 얼음이 깨짐
  // 🌫 정찰 단계 (2026-11-09 #17 · 옛 「❄ 꽁꽁 묶기」): 몬스터 = 검은 실루엣(숨쉬기) · 학습지 그 칸 크게 · ✋ 준비 완료 n / 전체 · 남은 시간 → 끝나면 색이 돌아오며 포효
  let slKey = '';
  function hallSolve() {
    const arena = $('#raid'); if (!arena || !L || !R) return;
    const lk = Raid().solveLock(L, R, DS.Net.now()), on = !!(lk && lk.on), rd = on ? Raid().readyOf(R, lk.id).length : 0, all = Raid().activeIds(R).filter((u) => u !== (R.meta || {}).teacher).length;
    const key = on ? `${lk.id}|${lk.t0}|${lk.end - lk.cur}|${lk.frz ? 1 : 0}|${rd}|${all}` : '';
    arena.classList.toggle('scouting', on); // 🌫 #22: 정찰 동안 = 학습지 그림 오른쪽 크게 · 실루엣 진형은 왼쪽으로 비켜 섬 (그림 위에 그리지 않음)
    const mon = $('#rm'); if (on && mon && !mon.classList.contains('scout-sil')) mon.classList.add('scout-sil'); // 화면을 다시 그려도 실루엣 유지
    if (on && mon && !mon.querySelector('.sc-pack')) { const s0 = Raid().stepOf(L, R) || {}, ch = s0.kind === 'monster' && Raid().isChain(L, R, s0.id); DS.Art.scoutDeco(mon, true, ch ? { n: Raid().chainDown(L, R, s0.id).length } : {}); } // 🌫 진형(대장 + 졸개 · 소레이드는 단계 수만큼)
    if (key === slKey) return;
    const was = slKey; slKey = key;
    let ban = arena.querySelector('.h-solve');
    if (on) {
      const st = Raid().stepOf(L, R) || {}, img = (prep.img || {})[st.kind === 'boss' ? 'boss' : st.id] || (prep.img || {})[st.id];
      if (mon) mon.classList.add('scout-sil');
      if (!ban) { ban = document.createElement('div'); ban.className = 'h-solve h-scout'; arena.appendChild(ban); }
      ban.innerHTML = `<b>🌫 정찰 — 학습지를 먼저 풀어요</b>${img ? `<img class="scout-img" src="${img}" alt="">` : ''}<p>✋ 준비 완료 <b>${rd}</b> / ${all} · 등장까지 <b class="sl-left" data-sl-end="${lk.end - lk.cur}"${lk.frz ? ` data-fz="${(R.state || {}).fzAt}"` : ''}>${Math.ceil(lk.left / 1000)}초</b></p>`;
    } else {
      if (ban) ban.remove();
      if (mon) DS.Art.scoutDeco(mon, false);
      if (mon && mon.classList.contains('scout-sil')) { mon.classList.remove('scout-sil'); mon.classList.remove('appear'); void mon.offsetWidth; mon.classList.add('appear'); if (Snd() && Snd().hit) Snd().hit(); }
    }
  }
  // ⚔ 소레이드 진행판 (2026-11-09 #18): ①②③👑 칸마다 그 단계 학생 번호 · 🙋 = 선생님 확인 필요 · 맨 위 체력바는 반 전체 그대로
  let crKey = '', dnSeen = null;
  // 🩸 #37 (2026-11-09 선생님 「B안」): 졸개 그림 위 이름표 「졸개1 …」 + 체력 막대(남은/최대) · 쓰러지면 숨김 · 정찰 중(실루엣)엔 없음
  function minionTags(mon, dn) {
    const pack = mon && mon.querySelector('.sc-pack.sc-fight'); if (!pack) return;
    pack.querySelectorAll('.sc-min').forEach((m) => {
      const k = Number(m.dataset.k), d = dn[k]; if (!d) return;
      let t = m.querySelector('.sc-tag'); if (!t) { t = document.createElement('div'); t.className = 'sc-tag'; t.innerHTML = `<b>졸개${k + 1}</b><small></small><span class="mn-hp"><i></i></span>`; m.appendChild(t); }
      const kk = `${d.left}/${d.max}`; if (t.dataset.k === kk) return; t.dataset.k = kk;
      t.querySelector('i').style.width = `${d.max ? (100 * d.left) / d.max : 0}%`; t.querySelector('small').textContent = kk;
    });
  }
  function hallChain() {
    const arena = $('#raid'); if (!arena || !L || !R) return;
    const st = Raid().stepOf(L, R), on = !!(st && st.kind === 'monster' && Raid().isChain && Raid().isChain(L, R, st.id));
    let box = arena.querySelector('.h-chain'); if (!on) { if (box) box.remove(); crKey = ''; dnSeen = null; arena.querySelectorAll('.h-hint, .h-wrok').forEach((e) => e.remove()); return; }
    // 🌟 서술형 통과 n명 (2026-11-09 선생님 보완 5): 석화 1명 · 금빛 컷인 3명 뒤에도 통과한 학생이 보이게
    { const okN = Object.values(R.players || {}).filter((p) => (!p.teacher || Number(p.num) > 0) && (p.wr || {})[st.id] === 'ok').length; let wb = arena.querySelector('.h-wrok');
      if (!okN) { if (wb) wb.remove(); } else { if (!wb) { wb = document.createElement('div'); wb.className = 'h-wrok'; arena.appendChild(wb); } const t = `🌟 서술형 통과 <b>${okN}</b>명`; if (wb.innerHTML !== t) { wb.innerHTML = t; wb.classList.remove('pop'); void wb.offsetWidth; wb.classList.add('pop'); } } }
    // 💡 힌트 주기 (2026-11-09 #26): 첫 1명 = 맞힌 근거 문장 그대로 말풍선 · 나머지 = 👍 +n (숫자 정답 · 자유 입력 없음)
    { const it0 = Raid().chainItems(L, R, st.id, '_', 0) || [], kids = Object.entries(R.players || {}).filter(([, p]) => !p.teacher || Number(p.num) > 0) /* 🧪 테스트 모드 학생(선생님 계정 · 번호 1)도 셈 */;
      // 🧩 #52 ② 근거 줄마다 첫 1명 말풍선 · 가장 최근에 처음 힌트가 나온 줄을 띄움 (👍 = 그 줄의 나머지)
      const lines = Raid().whyStages(it0).map((s2) => { const k = Raid().hintKeyOf(it0, st.id, s2), g = kids.filter(([, p]) => (p.hint || {})[k]).sort((a, b) => Number(a[1].hint[k]) - Number(b[1].hint[k])); return { s: s2, g, t: g.length ? Number(g[0][1].hint[k]) : 0 }; }).filter((x) => x.g.length).sort((a, b) => b.t - a.t);
      const top = lines[0], wq = top ? it0[top.s] : null, givers = top ? top.g : [];
      let hh = arena.querySelector('.h-hint'), hk = `${st.id}|${top ? top.s : ''}|${givers.length}`;
      if (wq && givers.length && (!hh || hh.dataset.k !== hk)) {
        const fresh = !hh || hh.dataset.mid !== st.id; if (!hh) { hh = document.createElement('div'); hh.className = 'h-hint'; arena.appendChild(hh); }
        hh.dataset.k = hk; hh.dataset.mid = st.id; const p0 = givers[0][1];
        hh.innerHTML = `<b>💡 ${esc(p0.nick || '')}의 힌트</b><span>${pretty(wq.why.text)}</span>${givers.length > 1 ? `<i class="h-hint-up">👍 +${givers.length - 1}</i>` : ''}`;
        hh.classList.remove('pop'); void hh.offsetWidth; hh.classList.add('pop'); if (fresh && Snd() && Snd().clank) Snd().clank();
      } else if (!givers.length && hh) hh.remove();
      if (hh && givers.length) { // 💬 2026-11-09 선생님 「말풍선이 아니라 왼쪽 위에 뜸」: 힌트를 준 첫 학생 용사 머리 위 말풍선 (용사를 못 찾으면 왼쪽 위 그대로)
        const fh = arena.querySelector(`#fh-${givers[0][0]}`), ar = arena.getBoundingClientRect();
        if (fh && ar.width) { const r = fh.getBoundingClientRect(), x = r.left - ar.left + r.width / 2, y = r.top - ar.top; const k2 = `${Math.round(x)}|${Math.round(y)}`;
          if (hh.dataset.pos !== k2) { hh.dataset.pos = k2; hh.classList.add('bub'); hh.style.left = `${Math.max(ar.width * 0.17, Math.min(ar.width * 0.83, x))}px`; hh.style.top = `${Math.max(120, y - 6)}px`; hh.style.setProperty('--tx', `${Math.round(x - Math.max(ar.width * 0.17, Math.min(ar.width * 0.83, x)))}px`); } }
        else if (hh.classList.contains('bub')) { hh.classList.remove('bub'); hh.style.left = hh.style.top = ''; delete hh.dataset.pos; }
      }
    }
    // 💥 졸개 쓰러짐: 정찰이 끝난 뒤 대장 앞에 졸개(색) · 반 기준% 가 넘은 졸개는 쓰러짐 + 띠
    const mon = $('#rm'), dn = Raid().chainDown(L, R, st.id), downs = dn.filter((d) => d.down).map((d) => d.k), dk = `${st.id}|${downs.join(',')}`;
    if (mon && !mon.classList.contains('scout-sil')) {
      const pack = mon.querySelector('.sc-pack.sc-fight');
      if (!pack || pack.dataset.key !== dk) {
        DS.Art.scoutDeco(mon, false); DS.Art.scoutDeco(mon, true, { n: dn.length, down: dnSeen && dnSeen.id === st.id ? dnSeen.downs : downs, fight: true }); mon.classList.remove('sc-lead');
        const p2 = mon.querySelector('.sc-pack'); if (p2) p2.dataset.key = dk;
        const fresh = dnSeen && dnSeen.id === st.id ? downs.filter((k) => !dnSeen.downs.includes(k)) : [];
        if (p2 && fresh.length) requestAnimationFrame(() => fresh.forEach((k) => { const e = p2.querySelector(`[data-k="${k}"]`); if (e) e.classList.add('down'); }));
        fresh.forEach((k, i) => setTimeout(() => { const b = document.createElement('div'); b.className = 'h-down-ban'; b.textContent = `💥 졸개 ${'①②③④⑤⑥'[k]} 쓰러짐!`; arena.appendChild(b); if (Snd() && Snd().hit) Snd().hit(); setTimeout(() => b.remove(), 2400); }, i * 900));
        dnSeen = { id: st.id, downs };
      }
    }
    const ids = Raid().activeIds(R).filter((u) => u !== (R.meta || {}).teacher), recs = ids.map((u) => [u, Raid().record(L, R, st.id, u)]), n = recs[0] ? recs[0][1].n : 0;
    const cols = Array.from({ length: n + 1 }, (_, i) => recs.filter(([, r]) => (i === n ? r.done : !r.done && r.stage === i)));
    minionTags(mon, dn); // 🩸 #37 졸개 이름표 · 체력 막대 (몬스터 그림 위)
    const needL = recs.filter(([, r]) => r.locked && !r.done), doneL = cols[n] || []; // #37 보충: 진행판 = 🙋 확인 필요 · 🏁 완료만 (졸개 · 대장 이름은 그림 위 이름표로)
    const key = JSON.stringify([needL.map(([u]) => u), doneL.map(([u, r]) => u + (r.perfect ? '*' : ''))]);
    if (key === crKey && box) return; crKey = key;
    if (!box) { box = document.createElement('div'); box.className = 'h-chain'; arena.appendChild(box); }
    const num = (u) => ((R.players || {})[u] || {}).num;
    box.innerHTML = `${needL.length ? `<div class="hc-col need"><b>🙋 확인</b><div>${needL.map(([u]) => `<span class="hc-p need">🙋${num(u)}</span>`).join('')}</div></div>` : ''}<div class="hc-col done"><b>🏁 완료</b><div>${doneL.map(([u, r]) => `<span class="hc-p${r.perfect ? ' pf' : ''}">${r.perfect ? '🌟' : ''}${num(u)}</span>`).join('')}</div></div>`;
  }
  // 📸 ⚡ 진필살기 충전 중 (2026-11-09 #26): 학생이 찰칵(서술형 사진)을 누르면 금빛 게이지 · 동시 3명 · 나머지 +n명 · 채점이 끝나면 사라짐 (실패 연출 없음)
  let snapSeen = {};
  function snapHall() {
    const arena = $('#raid'); if (!arena || !R) return;
    const now = DS.Net.now(), on = Object.entries(R.players || {}).filter(([, p]) => p.snap && now - Number(p.snap.at || 0) < 180e3).sort((a, b) => Number(a[1].snap.at) - Number(b[1].snap.at));
    let box = arena.querySelector('.h-snap'); if (!on.length) { if (box) box.remove(); snapSeen = {}; return; }
    on.forEach(([u, p]) => { const k = `${u}|${p.snap.at}`; if (!snapSeen[k]) { snapSeen[k] = 1; if (Snd() && Snd().clank) Snd().clank(); } });
    const key = on.map(([u, p]) => `${u}${p.snap.at}`).join(); if (box && box.dataset.k === key) return;
    if (!box) { box = document.createElement('div'); box.className = 'h-snap'; arena.appendChild(box); } box.dataset.k = key;
    box.innerHTML = on.slice(0, 3).map(([, p]) => `<div class="hs-row"><b>⚡ ${esc(p.nick || '')} 진필살기 충전 중…</b><i style="animation-delay:-${((now - Number(p.snap.at)) / 1000).toFixed(1)}s"></i></div>`).join('') + (on.length > 3 ? `<div class="hs-more">+${on.length - 3}명</div>` : '');
  }
  function hallAtk() {
    comboHall(); hallSolve(); hallChain(); snapHall();
    const g = document.getElementById('rh-atk'); if (!g || !L || !R) return;
    const c = Raid().atkClock(L, R, DS.Net.now(), window.DS_ATK || null);
    const bar = g.querySelector('i'), txt = g.querySelector('span');
    if (!c) { bar.style.width = '0%'; txt.textContent = ''; g.classList.remove('hot'); atkMemo = {}; return; }
    if (c.paused) { g.classList.add('bound'); txt.textContent = '⏸ 집중모드'; return; }
    const tr = Raid().atkTrack(atkMemo, c, `${code}|${(R.state || {}).step}|${c.kind}`);
    bar.style.width = `${(tr.p * 100).toFixed(1)}%`; g.classList.toggle('hot', tr.p > 0.8); g.classList.remove('bound');
    txt.textContent = `⏱ ${Math.max(0, Math.ceil((1 - tr.p) * c.per))}${c.bind ? ` · ⛓ ${c.bind}초` : ''}`; // 2026-11-07 비교 6: 「HP ▬ n / N ⏱ 20」 (빠름 · 단계 글자 없음)
    hallHolyMark(c);
    if (tr.strike) { const hg = Raid().holyArmed(R, c.mid, DS.Net.now(), c.per); hallStrike(c, hg.length ? hg : null); }
  }
  // 🛡 홀리 방패 켠 용사 = TV 에 표시 (발밑 방패 · 머리 위 「🛡 준비」) → 서로 알고 눈치 싸움 (2026-11-09 선생님)
  let hgKey = '';
  function hallHolyMark(c) {
    const on = c && (c.kind === 'monster' || c.kind === 'boss') ? Raid().holyArmed(R, c.mid, DS.Net.now(), null) : [], key = on.join();
    if (key === hgKey && document.querySelectorAll('.fh2 .hg-mark').length === on.length) return; hgKey = key;
    document.querySelectorAll('.fh2').forEach((h) => { const u = h.id.slice(3), want = on.includes(u), has = h.querySelector('.hg-mark'); h.classList.toggle('hg-on', want); if (want && !has) h.insertAdjacentHTML('beforeend', '<b class="hg-mark">🛡 준비</b>'); if (!want && has) has.remove(); });
  }
  // 🛡 홀리 방패 막기 (2026-11-09): 켠 용사 모두 날개 · 방패 (여럿이어도 효과 같음) · 반 전체 안 멈춤 (피격 · 헉헉 없음) → 석화 10초
  function hallGuard(c, us) {
    // 🛡 #72 (2026-11-10): 막는 순간 처음 켠 용사의 얼굴 컷인 + 눈빛 (흰 · 하늘빛 · 0.8초) → 이어서 날개 · 방패
    const first = us.slice().sort((a, b) => Number(((R.players[a] || {}).hg || {}).at || 0) - Number(((R.players[b] || {}).hg || {}).at || 0))[0], fp = (R.players || {})[first] || {};
    if (DS.Attack && DS.Attack.cutin && !hallGuard.busy) { hallGuard.busy = 1; return DS.Attack.cutin(fp.hero || 0, fp.fx || 'twinkle', { guard: true }).then(() => { hallGuard.busy = 0; hallGuard2(c, us); }); }
    return hallGuard2(c, us);
  }
  function hallGuard2(c, us) {
    const arena = $('#raid'), m = $('#rm'), names = us.map((u) => esc(((R.players || {})[u] || {}).nick || '친구')).join(' · ');
    const hit = () => {
      const b = document.createElement('div'); b.className = 'atk-banner guard'; b.innerHTML = `🛡 ${names}의 홀리 방패! <small>막았다! 몬스터 ${Raid().HOLY_SEC}초 석화</small>`; arena.appendChild(b); setTimeout(() => b.remove(), 1800);
      Snd().hit(); setTimeout(() => Snd().correct(), 160);
    };
    let ms = 0; us.forEach((u, k) => { const h = document.getElementById(`fh-${u}`); const t = h && DS.Aura && DS.Aura.guard ? DS.Aura.guard(h, k === 0 ? hit : null) : 0; if (t && !ms) ms = t; });
    setTimeout(() => { if (m) { m.classList.remove('lunge-big'); void m.offsetWidth; m.classList.add('lunge-big'); setTimeout(() => m.classList.remove('lunge-big'), 700); } }, Math.max(0, (ms || 300) - 300));
    if (!ms) setTimeout(hit, 300);
  }
  function hallStrike(c, gu) {
    const arena = $('#raid'), m = $('#rm'); if (!arena) return;
    if (gu) return hallGuard(c, gu); // gu = 홀리 방패 켠 용사들
    if (m) { m.classList.remove('lunge-big'); void m.offsetWidth; m.classList.add('lunge-big'); setTimeout(() => m.classList.remove('lunge-big'), 700); }
    setTimeout(() => {
      arena.classList.remove('atk-hit'); void arena.offsetWidth; arena.classList.add('atk-hit'); setTimeout(() => arena.classList.remove('atk-hit'), 800);
      const b = document.createElement('div'); b.className = 'atk-banner'; b.innerHTML = `💥 몬스터의 공격! <small>${c.lock}초 멈춤</small>`; arena.appendChild(b); setTimeout(() => b.remove(), 1600);
      if (DS.FX) DS.FX.play(arena, 'flame', { scale: 0.7 });
      Snd().squish(); setTimeout(() => Snd().hit(), 120);
      document.querySelectorAll('.fh2').forEach((h) => {
        const u = h.id.slice(3), hid = ((R.players || {})[u] || {}).hero || 0;
        h.classList.remove('struck'); void h.offsetWidth; h.classList.add('struck'); setTimeout(() => h.classList.remove('struck'), 600);
        pose(h, hid, 'hit', 400); setTimeout(() => pose(h, hid, 'pant', c.lock * 1000 + 900), 400);
      });
    }, 300);
  }
  // 용사 자세 잠깐 바꾸기 (공격 → ms 뒤 서 있는 자세). 승리 점프(pairhop) 중이면 그대로 둔다
  function pose(h, heroId, p, ms) {
    const art = h.querySelector('.art'); if (!art || art.classList.contains('pairhop')) return;
    const box = art.parentElement; box.innerHTML = DS.Art.hero(heroId, p);
    clearTimeout(h._pt); h._pt = setTimeout(() => { const a2 = box.querySelector('.art'); if (a2 && !a2.classList.contains('pairhop')) box.innerHTML = DS.Art.hero(heroId, 'idle'); }, ms);
  }
  // 공격 연출: 0.35초 간격으로 차례차례. 성공 = 몬스터로 뛰어올라 내 이펙트 + 데미지 숫자 (전부 맞힘이면 크게 + PERFECT! + 흔들림)
  function play() {
    if (playing || !queue.length) return;
    playing = true;
    const a = queue.shift();
    const h = document.getElementById(`fh-${a.u}`), arena = $('#raid'), m0 = $('#rm');
    if (h && a.label === 'heal') {
      const t = document.createElement('span'); t.className = 'heal-tag'; t.textContent = `💚 ${(R.players[a.u] || {}).nick || ''}의 응원!`; h.appendChild(t); setTimeout(() => t.remove(), 1900);
      h.classList.remove('healing'); void h.offsetWidth; h.classList.add('healing'); setTimeout(() => h.classList.remove('healing'), 1300);
      Snd().correct();
    } else if (h && arena && m0) {
      // v0.9.2 연습 공격(이미 다 맞힌 학생): 공격 + 이펙트 + 「몬스터 묶기!」 · 데미지 숫자 · PERFECT 흔들림 없음
      // 2026-11-08 재정비 (사용자 「근접 · 원거리 할 것 없이 가까이 가서 싸움 · 기술 따로 액션 따로 · 바닥 기술이 몸통에서」):
      //   학생 폰과 같은 DS.Attack.play — 근접 = 보이는 몸통 옆까지 돌진 · 원거리 = 제자리 한 걸음 + 탄 · 🔮 쏘는 기술 = 손에서 몸통까지 · 이펙트 = 보이는 몸통 · 발끝 기준
      const prac = a.label === 'practice', ok = a.label !== 'fail', perfect = a.label === 'success';
      const hid = (R.players[a.u] || {}).hero || 0, p = (R.players[a.u] || {}).fx || 'flame';
      const hit = (info) => { // ⚔ #74-2 연타면 타마다 「−1」 · PERFECT 는 마지막 타에
        const multi = info && info.n > 1, last = !info || info.k === info.n - 1;
        if (last) Snd().correct && perfect && setTimeout(() => Snd().correct(), 120);
        m0.classList.remove('flash'); void m0.offsetWidth; m0.classList.add('flash');
        if (prac) { const t = document.createElement('span'); t.className = 'prac-tag'; t.textContent = '몬스터 묶기!'; if (DS.Thrill) DS.Thrill.bindFx(m0); h.appendChild(t); setTimeout(() => t.remove(), 1600); }
        const fx = $('#rm-fx');
        if (fx && a.dmg) { const d = document.createElement('span'); d.className = `dmg${perfect && last ? ' big' : ''}`; d.textContent = multi ? '−1' : `−${a.dmg}`; d.style.left = `${55 + Math.random() * 25}%`; fx.appendChild(d); setTimeout(() => d.remove(), 1300); }
        if (perfect && last) { const t = document.createElement('div'); t.className = 'perfect'; t.textContent = 'PERFECT!'; arena.appendChild(t); setTimeout(() => t.remove(), 1300); }
      };
      const go = () => (h.isConnected && DS.Attack ? DS.Attack.play(arena, { heroBox: h, monBox: m0, hero: hid, fx: p, miss: !ok, finish: perfect, noDmg: true, rest: 'idle', onHit: hit, hits: prac ? 1 : a.dmg }) : Promise.resolve()).catch((e) => console.warn('공격 연출', e));
      h.classList.add('atk-on'); h._atk = (h._atk || Promise.resolve()).then(go).then(() => h.classList.remove('atk-on')); // 같은 용사의 공격은 차례로
      if (!ok) Snd().squish();
    }
    setTimeout(() => { playing = false; play(); }, 350);
  }

  // 🎬 설명 영상 (v0.8.6): 교사 폰 · 이 화면의 「🎬 설명 영상 틀기」 → 큰 화면 위에 재생. 이미지(개념 · 문제 화면)는 그대로 두고 그 위에 뜬다
  let videoKey = '';
  function videoOverlay(step) {
    const url = step && DS.Video.pick(L, prep.video, step.id), on = !!step && Raid().videoOn(R, step.id) && url && DS.Video.ok(url);
    let ov = document.getElementById('h-video-ov');
    if (!on) { if (ov) ov.remove(); videoKey = ''; return; }
    const k = `${step.id}|${url}`;
    if (ov && k === videoKey) return;
    if (!ov) { ov = document.createElement('div'); ov.id = 'h-video-ov'; ov.className = 'h-video-ov'; document.getElementById('screen-hall').appendChild(ov); }
    videoKey = k;
    ov.innerHTML = `<div class="h-video-box"><p class="h-ctitle">🎬 ${esc(step.title || '설명 영상')}</p><div class="video-frame">${DS.Video.frameHtml(url, true)}</div>
      <div class="row"><span class="muted small">드라이브 영상은 ▶ 를 눌러 재생 · 교사 폰 「🎬 영상 닫기」로도 닫혀요</span><button class="btn" id="h-video-x">✕ 영상 닫기</button></div></div>`;
    ov.querySelector('#h-video-x').onclick = () => C().run(() => DS.Act.setVideoOn(code, null));
    DS.Video.attach(ov, url, { lesson: L.id, slot: step.id }).catch((e) => DS.UI.toast(e.message || '영상을 불러오지 못했어요.'));
  }
  // 📄 문제 화면: 교사가 켜면 지금 문제의 학습지 이미지를 레이드 위에 크게 (레이드는 뒤에서 계속, 끄면 그대로 보임)
  let sheetKey = '';
  function sheetOverlay(step) {
    const arena = $('#h-arena'), img = (prep.img || {})[step.id], on = Raid().sheetOn(R);
    let ov = document.getElementById('h-sheet-ov');
    if (!on) { if (ov) ov.remove(); sheetKey = ''; return; }
    if (!ov) { ov = document.createElement('div'); ov.id = 'h-sheet-ov'; ov.className = 'h-sheet-ov'; arena.appendChild(ov); sheetKey = ''; }
    const k = `${step.id}|${img ? img.length : 0}`;
    if (k === sheetKey) return;
    sheetKey = k;
    ov.onclick = () => { if (ov.querySelector('img')) ov.classList.toggle('wfull'); }; // 그림을 누르면 칸 가득 흰 바탕으로 크게 · 다시 누르면 원래대로
    ov.innerHTML = `<p class="h-ctitle">📄 ${esc(step.kind === 'boss' ? L.boss.title : step.title)} · 문제 해설</p>
      <div class="h-sheet">${img ? `<img src="${img}" alt="${esc(step.title || '')} 학습지">` : `<div class="h-sheet-empty">📄 이 문제의 학습지 이미지가 아직 없어요<br><span class="muted small">교사 → 수업 준비 → '${esc(step.title || '형성평가')}' 칸에 넣으면 여기에 떠요</span></div>`}</div>`;
  }

  // ── 오른쪽: 수업 순서 · ◀ ▶ · 기준% · 집중모드 · 말풍선 ──────
  // ── 🎛 떠 있는 조작 막대 (2026-11-07 최종 정돈판 ⑤): 오른쪽 칸(수업 순서 · 조작) 없앰 → 화면 오른쪽 아래 한 줄
  //   🏕 쉼터 · 🎬 영상 · 📄 문제 · 🔴 집중 · 🎮 시연 · ✏ 필기 | ◀ 뒤로 · 앞으로 ▶(다음 단계 이름) · 체력 기준 · 풀이 시간은 교사 폰 리모컨에서만
  //   마우스를 움직이거나 화면을 터치하면 나타나고 3초 뒤 숨음 · 📌 = 늘 보이기 (이 PC 기억) · ✏ 필기 중에는 터치해도 안 나타남
  const PIN = 'citadel-hall-dock-pin';
  const pinned = () => { try { return localStorage.getItem(PIN) === '1'; } catch (e) { return false; } };
  let dockT = 0;
  function dockShow() {
    const d = document.getElementById('h-dock'); if (!d) return;
    d.classList.add('show'); clearTimeout(dockT);
    if (!pinned()) dockT = setTimeout(() => { if (!d.matches(':hover')) d.classList.remove('show'); }, 3000);
  }
  if (typeof document !== 'undefined') ['mousemove', 'touchstart'].forEach((ev) => document.addEventListener(ev, (e) => { if (embed || !hallOn() || (ev === 'touchstart' && DS.Ink && DS.Ink.on())) return; dockShow(); }, { passive: true }));
  function side(i) {
    let d = document.getElementById('h-dock');
    if (!d) {
      d = document.createElement('div'); d.id = 'h-dock'; d.className = 'h-dock'; document.querySelector('#screen-hall .hall').appendChild(d);
      // 숨은 막대를 처음 건드리면 보이기만 (안 보이는 단추가 눌리지 않게) · 마우스는 움직이는 순간 이미 보임
      let was = true; d.addEventListener('pointerdown', () => { was = d.classList.contains('show'); }, true);
      d.addEventListener('click', (e) => { if (!was) { e.stopPropagation(); e.preventDefault(); dockShow(); } was = true; }, true);
    }
    d.classList.toggle('pin', pinned());
    const live = !Raid().isLobby(R) && !Raid().isClosed(R), step = Raid().stepOf(L, R);
    const inkOk = step && (step.kind === 'concept' || Raid().sheetOn(R));
    const fin = Raid().isFinale(L, R);
    d.innerHTML = `${live ? C().iconBar(L, R, prep.video, true) : ''}${live && !Raid().restOn(R) ? `<button class="icb${DS.Ink && DS.Ink.on() ? ' on' : ''}" id="h-ink"${inkOk ? '' : ' disabled'} title="개념 · 문제 화면 위에 손가락 · 펜으로 쓰기 (TV 화면에만 · 저장 안 함)">✏<small>필기</small></button>` : ''}
      <span class="dk-sep"></span>${C().lessonBtn(R)}${C().saveBtn(R, L)}
      <button class="btn" id="h-back"${i < 0 ? ' disabled' : ''}>◀ 뒤로</button><button class="btn primary" id="h-fwd"${Raid().isClosed(R) ? ' disabled' : ''}>${fin ? '수업 끝 ▶' : '앞으로 ▶'}<small>${esc(C().nextName(L, R))}</small></button>
      <button class="icb dk-pin${pinned() ? ' on' : ''}" id="h-pin" title="조작 막대 늘 보이기">📌</button>`;
    const db = $('#h-demo'); if (db) db.onclick = () => demoOpen(Raid().stepOf(L, R));
    const ik = $('#h-ink'); if (ik) ik.onclick = () => { if (DS.Ink) DS.Ink.toggle(document.getElementById('h-arena'), `${code}|${i}|${Raid().sheetOn(R) ? 's' : 'c'}`); side(i); };
    $('#h-pin').onclick = () => { try { localStorage.setItem(PIN, pinned() ? '0' : '1'); } catch (e) { /* 이 PC 만 */ } side(i); dockShow(); };
    C().bindRest(d, code, R); C().bindLesson(d, code, R); C().bindSave(d, code, R, L); C().bindFocus(d, code, R); C().bindSheet(d, code, R); C().bindVideo(d, code, R);
    $('#h-fwd').onclick = () => C().run(() => C().forward(code, R, L));
    $('#h-back').onclick = () => C().run(() => C().back(code, R, L, () => DS.TCamp.enter({ code, hallKey, hall: true })));
    if (DS.Ink) DS.Ink.sync(`${code}|${i}|${Raid().sheetOn(R) ? 's' : 'c'}`); // 다음 단계로 넘기면 필기 저절로 지움
    // 💬 마지막 한마디 (마무리): 오른쪽 위 작은 칸
    let w = document.getElementById('h-words-box');
    if (Raid().isEnd(L, R)) { if (!w) { w = document.createElement('div'); w.id = 'h-words-box'; w.className = 'h-words-box framed'; document.querySelector('#screen-hall .hall').appendChild(w); } w.innerHTML = `<div class="h-words">${C().wordsHtml(R)}</div>`; C().bindWords(w, code, R); } else if (w) w.remove();
    if (pinned()) d.classList.add('show');
  }

  // ── 🎮 시연 (v0.9.3 사용자 요청): 교사가 학생과 똑같은 문제 칸으로 풀어 본다 · 데미지 · 기록 없음 (이 PC 화면에서만) ─────────
  //   다 맞히면 선생님 캐릭터가 돌진해 일격 → 이미 공략된(체력 0) 몬스터면 형체가 완전히 사라진다(소멸) · 아직이면 「시연 · 데미지 없음」
  //   정답 · 오답 표시는 교사 본인의 시연 풀이에만 보인다 (학생 답은 여전히 띄우지 않음 — DECISIONS 예외)
  // 2026-11-06 사용자 「형성평가 시연 최적화」: 형성평가도 일반 문제처럼 한 화면에 펼침 (예전: 문항 번호마다 입력 창 6번) · 💡 정답 펼치기 = 입력 없이 정답 · 풀이 한 번에
  //   형성평가 = 세트 1 (학습지) · 세트 2 (숫자 바꿈) · 체력 문항(1 ~ hpItems)을 다 맞히면 ⚔ / ⚡ · 보너스 문항은 선택 · 부분집합 「모두 쓰기」 문항만 입력 창
  function demoOpen(step, attempt = 0) {
    if (!step || !['monster', 'boss'].includes(step.kind)) return;
    const boss = step.kind === 'boss', seed = `demo|${code}|${Date.now()}`;
    // 🪞 #81 (2026-11-11 선생님 「시연 = 학생과 똑같이」): 학생 폰과 같은 함수 — 소레이드 = L.chainItems (졸개 → 대장 · 근거 줄) · 형성평가 다시 = L.boss.make (bossItem 과 같음) · 일반 = L.items
    if (!boss && Raid().isChain(L, R, step.id)) { demo = { step, attempt, chain: true, boss: false, items: L.chainItems(step.id, seed, attempt), stage: 0, says: [], why: -1, wrong: false, given: [null], shown: false }; demo.hp = demo.items.length; demoDraw(); hallDuck(); return; }
    const nb = (L.boss.sets[1] || []).length, items = boss ? (attempt ? Array.from({ length: nb }, (_, i) => (L.boss.make ? L.boss.make(i, attempt, DS.Rng(`${seed}|boss|${i}|${attempt}`)) : (L.boss.sets[2] || L.boss.sets[1])[i])) : L.boss.sets[1]) : L.items(step.id, seed, attempt);
    demo = { step, attempt, boss, hp: boss ? L.boss.hpItems || items.length : items.length, items, given: items.map((q) => (q.type === 'multi' || q.type === 'subsets' ? [] : q.type === 'text' ? '' : null)), marks: null, shown: false };
    demoDraw(); hallDuck();
  }
  function demoHero(on) {
    const raid = document.getElementById('raid'); let t = document.getElementById('fh-teach');
    if (!on || !raid) { if (t) t.remove(); return; }
    if (t) return;
    raid.insertAdjacentHTML('beforeend', `<div class="fh2 teach" id="fh-teach" style="left:46%;top:60%;z-index:20"><span class="dtag">🎮 시연 중</span><span class="fh-name">👩‍🏫 선생님</span><div>${DS.Art.hero(DS.Art.teacherHero(R), 'idle')}</div><i class="shadow"></i></div>`);
  }
  // 🔉 2026-11-13 선생님 「전투 중에 시연 누르거나 문제 누르면 소리 음소거나 10%로」: 몬스터 · 보스 단계에서 🎮 시연 창 · 📄 문제 창이 열려 있으면 종합실 소리 10% → 닫으면 원래대로
  function hallDuck() { const S = Snd(), st = L && R ? Raid().stepOf(L, R) : null, fight = !!st && ['monster', 'boss'].includes(st.kind) && !Raid().isClosed(R); if (S && S.duck) S.duck('hall-demo', fight && (!!demo || Raid().sheetOn(R))); }
  function demoClose() { const ov = document.getElementById('h-demo-ov'); if (ov) ov.remove(); demo = null; demoHero(false); hallDuck(); }
  const filled = (q, g) => (q.type === 'multi' || q.type === 'subsets' ? g.length > 0 : q.type === 'text' ? String(g || '').trim() !== '' : g != null);
  function ansText(q) { // 💡 정답 펼치기에 쓰는 정답 글
    const SG = DS.SetGen, P = DS.UI.pretty;
    if (q.type === 'choice') return DS.UI.opt(q.choices[q.answerIndex]); // 색칠 그림 보기도 그대로
    if (q.type === 'multi') return P(q.answer.map((k) => q.options[k]).join(' , '));
    if (q.type === 'blanks') return esc(q.items.map((it) => it.answer).join(' , '));
    if (q.type === 'ox') return q.answer ? 'O' : 'X';
    if (q.type === 'text') return esc((q.answers || [q.answer]).join(' / '));
    if (q.type === 'subsets' && SG) return P(SG.allSubsets(q.base).map(SG.setStr).join(' , '));
    return esc(String(q.answer));
  }
  function demoDraw() {
    let ov = document.getElementById('h-demo-ov');
    if (!ov) { ov = document.createElement('div'); ov.id = 'h-demo-ov'; ov.className = 'h-demo-ov side'; document.getElementById('screen-hall').appendChild(ov); }
    // 2026-11-07 최종 정돈판 ⑤: 시연 칸 = 오른쪽에서 밀려 나온 36% 칸 · 레이드는 왼쪽에 그대로 · 선생님 용사가 필드에 (금색 이름표 「🎮 시연 중」)
    demoHero(true);
    if (demo.chain) return demoChain(ov);
    const d = demo, S = DS.Student, need = d.items.slice(0, d.hp), ready = need.every((q, i) => filled(q, d.given[i]));
    const win = d.shown || (d.marks && d.marks.slice(0, d.hp).every(Boolean)), title = d.boss ? L.boss.title : d.step.title;
    const bonusTag = (i) => (d.boss && i >= d.hp ? '<span class="demo-bonus">⭐ 보너스</span>' : '');
    const res = d.marks ? `<div class="demo-res ${win ? 'ok' : 'ng'}">${d.shown ? '💡 정답 · 풀이 — 어떤 공격으로 갈까요?' : win ? '⚔ 모두 맞혔다! 어떤 공격으로 갈까요?' : `✘ ${d.marks.slice(0, d.hp).filter((m) => !m).length}개 틀림 — 해설을 함께 봐요`}</div>${win ? strikeHtml() : ''}
      <div class="marks">${d.items.map((q, i) => `<div class="mark ${d.marks[i] ? 'ok' : 'ng'}"><b>${i + 1}</b> ${d.shown ? '💡' : d.marks[i] ? '✔' : '✘'}${bonusTag(i)} <span class="math">${DS.UI.pretty(S.itemText(q))}</span>${d.shown || !d.marks[i] ? `<br><span class="sol-line math">정답: ${ansText(q)}${S.solOf(q) ? ` · ${DS.UI.pretty(S.solOf(q))}` : ''}</span>` : ''}</div>`).join('')}</div>` : '';
    const itemOf = (q, i) => (q.type === 'subsets'
      ? `<div class="item"><span class="item-no">${i + 1}</span>${bonusTag(i)}<div class="item-q">${DS.UI.rich(q.question || S.itemText(q))}</div><button class="btn" data-ask="${i}">${d.given[i].length ? `✏ ${d.given[i].length}개 썼어요 · 고치기` : '✏ 입력 창 열기'}</button></div>`
      : (bonusTag(i) ? `<div class="demo-bwrap">${bonusTag(i)}${S.withAns(S.itemHtml(q, i, d.given), q, d.given[i], i)}</div>` : S.withAns(S.itemHtml(q, i, d.given), q, d.given[i], i))); // 🪞 2026-11-13 학생과 같은 「✍ 나의 답」 줄
    ov.innerHTML = `<div class="demo-box paper${d.boss ? ' boss' : ''}"><div class="demo-head"><b>🎮 시연 · ${esc(title)}</b><span class="demo-tag">데미지 · 기록 없음</span>
        <button class="btn small${d.attempt ? '' : ' on'}" data-da="0">📄 ${d.boss ? '세트 1 (학습지)' : '학습지 문제'}</button><button class="btn small${d.attempt ? ' on' : ''}" data-da="${d.attempt + 1}">🔄 ${d.boss ? '숫자 바꿈 (한 판 더)' : '숫자 바꾼 문제'}</button><button class="btn small" id="demo-x">✕ 닫기</button></div>
      ${d.marks ? `${d.penRes || ''}${d.stamping ? '' : res}` : `${!d.boss && (L.monsters[d.step.id] || {}).note ? `<p class="muted small">💡 ${esc(L.monsters[d.step.id].note)}</p>` : ''}${d.boss && d.hp < d.items.length ? `<p class="muted small">1~${d.hp}번을 모두 맞히면 선생님의 일격! (${d.hp + 1}번~ 보너스는 골라서)</p>` : ''}<div class="items demo-items${d.boss ? ' two' : ''}">${d.items.map(itemOf).join('')}</div>
        <div class="row demo-go-row"><button class="btn big" id="demo-reveal">💡 정답 펼치기</button><button class="btn primary big" id="demo-go"${ready ? '' : ' disabled'}>⚔ 공격! (시연)</button></div>`}
      ${d.marks ? '<div class="row demo-row"><button class="btn" data-da="1">🔄 숫자 바꿔 다시</button><button class="btn primary" id="demo-x2">✕ 닫고 레이드로</button></div>' : ''}</div>`;
    ov.querySelector('#demo-x').onclick = demoClose; const x2 = ov.querySelector('#demo-x2'); if (x2) x2.onclick = demoClose; bindStrike(ov, d.step);
    ov.querySelectorAll('[data-da]').forEach((b) => (b.onclick = () => demoOpen(d.step, Number(b.dataset.da))));
    const reGo = () => { const go = ov.querySelector('#demo-go'); if (go) go.disabled = !need.every((q, j) => filled(q, d.given[j])); };
    ov.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => {
      const [i, v] = b.dataset.pick.split('|'), k = Number(i), t = d.items[k].type;
      if (t === 'multi') { const n = Number(v); if (d.items[k].empty) d.given[k] = DS.Quiz.chipToggle(d.items[k], d.given[k], n); else { const s = new Set(d.given[k]); if (s.has(n)) s.delete(n); else s.add(n); d.given[k] = [...s].sort((a, b2) => a - b2); } } // 🔘 ∅ 단추
      else if (t === 'choice') d.given[k] = Number(v); else if (t === 'ox') d.given[k] = v === 'O'; else d.given[k] = [v];
      Snd().clank(); demoDraw();
    }));
    ov.querySelectorAll('[data-ask]').forEach((b) => (b.onclick = async () => { // 부분집합 모두 쓰기: 학생과 같은 입력 창
      const i = Number(b.dataset.ask), r = await DS.Quiz.ask({ name: `${title} ${i + 1}번 (시연)`, formula: d.attempt ? '🔄 숫자가 바뀌었어요' : '학습지' }, d.items[i], { collect: true, tag: '🎮 시연' });
      if (!r || demo !== d) return; d.given[i] = r.given || []; demoDraw();
    }));
    DS.UI.runes(ov, (i) => d.given[i], (i, v) => { d.given[i] = v; reGo(); const al = ov.querySelector(`.ans-line[data-al="${i}"]`); if (al) al.outerHTML = S.ansLine(d.items[i], v, i); }); // ⌨ #92 학생과 같은 룬 키패드 · ✍ 나의 답 줄도 바로 (학생과 같음)
    ov.querySelectorAll('[data-text]').forEach((inp) => inp.addEventListener('input', () => { d.given[Number(inp.dataset.text)] = inp.value; reGo(); }));
    const rv = ov.querySelector('#demo-reveal');
    if (rv) rv.onclick = () => { d.shown = true; d.marks = d.items.map(() => true); Snd().slash(); demoDraw(); };
    const go = ov.querySelector('#demo-go');
    if (go) go.onclick = async () => {
      // 🪞 2026-11-13 선생님 「시연할 때 나의 풀이 정돈되면서 해결되는 기믹이 안 나와 · 똑같이」: 학생 폰과 같은 부품 — ✍ 답 줄이 📜 나의 답안으로 모임(mergeAnim) → 줄마다 채점 도장(pen-res · pixIn) → 결과
      go.disabled = true; DS.UI.runeCast(ov);
      const given = d.items.map((q, i) => (q.type === 'number' ? Number(d.given[i]) : d.given[i]));
      await S.mergeAnim(ov); if (demo !== d) return;
      d.marks = d.items.map((q, i) => filled(q, given[i]) && DS.Quiz.grade(q, given[i]));
      d.penRes = S.penBox(`demo|${code}|${d.step.id}|${d.attempt}`, d.items.map((q, i) => ({ t: S.penLine(q, given[i], i), cls: d.marks[i] ? 'pen-ok' : 'pen-gone' })).filter((l) => l.t), ' pen-res');
      d.stamping = true; demoDraw();
      { const t0 = Date.now(); ov.querySelectorAll('.pen-res li.pen-ok').forEach((li) => { const k = [...li.parentNode.children].indexOf(li); li.classList.add('pix-in'); S.pixIn(li, t0 + k * S.STAMP_GAP + 150, k + 7); }); } // 📜 채점 도장 (줄마다 0.4초)
      await new Promise((r) => setTimeout(r, S.stampMs(ov.querySelectorAll('.pen-res li').length))); if (demo !== d) return;
      d.stamping = false; d.penRes = d.penRes.replace(' pen-res', ' pen-res pen-still'); demoDraw();
      if (d.marks.slice(0, d.hp).every(Boolean)) Snd().slash(); else Snd().squish(); // 다 맞히면 ⚔ 일반 · ⚡ 필살기 버튼 (2026-11-06)
    };
  }
  // 🪞 #81 ⚔ 소레이드 시연 = 학생 폰 소레이드와 같은 단계: 졸개 → 👑 대장 (한 단계씩 · 같은 보기 · 원소 칩) · 맞히면 📜 나의 풀이 한 줄
  //   첫 판(학습지 숫자) = 근거 줄이 완성 문장으로 붙음 · 숫자 바꾼 판 = 그 단계 뒤 근거 빈칸 고르기 (학생의 한 판 더와 같은 규칙) · 틀려도 같은 문제 · 💡 = 이 단계 정답 펼치기 · 데미지 · 기록 없음
  function demoChain(ov) {
    const d = demo, S = DS.Student, n = d.items.length, P = DS.UI.pretty, title = d.step.title;
    const wq = d.why >= 0 ? d.items[d.why] : null, done = d.stage >= n && !wq, q = done ? null : wq ? { type: 'choice', question: `${wq.why.pre} ____${wq.why.post}`, choices: wq.why.choices, answerIndex: wq.why.answer } : d.items[d.stage];
    if (q && d.given[0] == null && (q.type === 'multi' || q.type === 'subsets')) d.given[0] = []; // 원소 칩 = 빈 목록부터 (학생과 같음)
    const chips = d.items.map((_, i) => `<span class="cr-chip ${i < d.stage ? 'ok' : i === d.stage ? 'now' : ''}">${i === n - 1 ? '👑' : '①②③④⑤⑥'[i]}${i < d.stage ? '✔' : i === d.stage ? '⚔' : ''}</span>`).join('<i>›</i>');
    const story = d.says.length ? `<div class="cr-story"><b>📜 나의 풀이</b><ol>${d.says.map((t) => `<li>${P(t)}</li>`).join('')}</ol></div>` : '';
    const lbl = wq ? '💡 근거 한 줄' : d.stage === n - 1 ? '👑 대장' : `졸개 ${'①②③④⑤⑥'[d.stage]}`;
    const body = done ? `<div class="demo-res ok">⚔ 소레이드 처치! 어떤 공격으로 갈까요?</div>${strikeHtml()}`
      : `<p class="cr-now"><b>${lbl}</b>${d.wrong ? ' <span class="paper-note">✘ 다시 생각해 봐요 — 같은 문제예요</span>' : ''}</p><div class="items demo-items">${S.itemHtml(q, 0, d.given)}</div>
        ${d.shown ? `<p class="sol-line math">💡 정답: ${ansText(q)}${S.solOf(q) ? ` · ${P(S.solOf(q))}` : ''}</p>` : ''}
        <div class="row"><button class="btn primary" id="demo-go"${filled(q, d.given[0]) ? '' : ' disabled'}>⚔ 공격 (확인)</button><button class="btn" id="demo-reveal">💡 정답 펼치기</button></div>`;
    ov.innerHTML = `<div class="demo-box paper"><div class="demo-head"><b>🎮 시연 · ${esc(title)}</b><span class="demo-tag">데미지 · 기록 없음</span>
        <button class="btn small${d.attempt ? '' : ' on'}" data-da="0">📄 학습지 숫자</button><button class="btn small${d.attempt ? ' on' : ''}" data-da="${d.attempt + 1}">🔄 숫자 바꿈</button><button class="btn small" id="demo-x">✕ 닫기</button></div>
      <div class="cr-chips">${chips}</div>${story}${body}</div>`;
    if (S.sandApply) S.sandApply(ov, `demo|${code}|${d.step.id}|${d.attempt}|${d.t0 || (d.t0 = Date.now())}`); // 🪞 2026-11-13 학생과 같은 「📜 나의 풀이」 모래 새김 (새 줄마다)
    ov.querySelector('#demo-x').onclick = demoClose;
    ov.querySelectorAll('[data-da]').forEach((b) => (b.onclick = () => demoOpen(d.step, Number(b.dataset.da))));
    if (done) return bindStrike(ov, d.step);
    ov.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => {
      const v = b.dataset.pick.split('|')[1], t = q.type;
      if (t === 'multi') { const k = Number(v); if (q.empty) d.given[0] = DS.Quiz.chipToggle(q, d.given[0] || [], k); else { const st = new Set(d.given[0] || []); if (st.has(k)) st.delete(k); else st.add(k); d.given[0] = [...st].sort((a, b2) => a - b2); } }
      else if (t === 'choice') d.given[0] = Number(v); else if (t === 'ox') d.given[0] = v === 'O'; else d.given[0] = [v];
      Snd().clank(); demoChain(ov);
    }));
    DS.UI.runes(ov, () => d.given[0], (i, v) => { d.given[0] = v; const g = ov.querySelector('#demo-go'); if (g) g.disabled = !filled(q, v); }); // ⌨ #92
    ov.querySelectorAll('[data-text]').forEach((inp) => inp.addEventListener('input', () => { d.given[0] = inp.value; const g = ov.querySelector('#demo-go'); if (g) g.disabled = !filled(q, d.given[0]); }));
    const rv = ov.querySelector('#demo-reveal'); if (rv) rv.onclick = () => { d.shown = true; demoChain(ov); };
    const go = ov.querySelector('#demo-go');
    if (go) go.onclick = () => {
      DS.UI.runeCast(ov);
      const g = q.type === 'number' ? Number(d.given[0]) : d.given[0];
      if (!DS.Quiz.grade(q, g)) { d.wrong = true; Snd().squish(); return demoChain(ov); }
      Snd().slash(); d.wrong = false; d.shown = false;
      if (wq) { d.says.push(wq.why.text); d.why = -1; }
      else { const it = d.items[d.stage]; d.says.push(it.say || ''); if (it.why) { if (d.attempt) d.why = d.stage; else d.says.push(it.why.text); } d.stage += 1; } // 학생과 같음: 첫 판 = 근거 완성 문장 · 숫자 바꾼 판 = 근거 빈칸
      d.given = [null]; demoChain(ov);
    };
  }
  // ⚡ 선생님 필살기 (2026-11-06 사용자 확정): 시연을 다 맞히면 선생님이 「⚔ 일반 공격」 · 「⚡ 필살기」 중 고름 (홍보용으로 가끔)
  //   필살기 = 선생님 스킬이 Ⅳ 전설(모든 갈래 · 용사 계열 상관없음) 또는 🪶 특별(황금 날개 · 심판의 빛)일 때만 · 아니면 버튼 잠김
  const tFx = () => DS.FX.usable(DS.Art.teacherFx(R), Object.fromEntries(DS.FX.KINDS.map((k) => [k, true])));
  const tCanUlt = () => { const t = DS.FX.tierOf(tFx()); return t === 3 || t === 's'; };
  function strikeHtml() {
    const can = tCanUlt(), nm = String(DS.FX.NAMES[tFx()] || '').replace(/[<>&]/g, '');
    return `<div class="row demo-strike"><button class="btn big" data-strike="0">⚔ 일반 공격</button><button class="btn big ult-go" data-strike="1"${can ? '' : ' disabled'}>⚡ 필살기${can ? ` · ${nm}` : ''}</button></div>${can ? '' : '<p class="muted small">⚙ 스킬 고르기에서 Ⅳ 전설이나 🪶 특별 스킬로 바꾸면 필살기를 쓸 수 있어요</p>'}`;
  }
  function bindStrike(ov, step) { ov.querySelectorAll('[data-strike]').forEach((b) => (b.onclick = () => { const ult = b.dataset.strike === '1' && tCanUlt(); demoClose(); teacherStrike(step, ult); })); }
  // 선생님 일격: 왼쪽에서 등장 → 몬스터로 돌진 → 팍! (이미 공략된 몬스터면 소멸)
  async function teacherStrike(step, ult) {
    if (ult && DS.Attack) await DS.Attack.cutin(DS.Art.teacherHero(R), tFx(), cutHost()); // ⚡ 선생님 필살기 (고른 때만)
    const arena = $('#raid'), m0 = $('#rm'); if (!arena || !m0 || Raid().stepOf(L, R) !== step) return;
    const kill = step.kind === 'boss' ? Raid().bossHp(L, R).won : Raid().cleared(L, R, step.id), ar = arena.getBoundingClientRect(), mr = m0.getBoundingClientRect();
    const t = document.createElement('div'); t.className = 'teach-strike'; t.innerHTML = DS.Art.hero(DS.Art.teacherHero(R), 'attack');
    arena.appendChild(t);
    t.style.setProperty('--tx', `${mr.left - ar.left + mr.width * 0.2 - ar.width * 0.08}px`); t.style.setProperty('--ty', `${mr.top - ar.top + mr.height * 0.45 - ar.height * 0.62}px`);
    requestAnimationFrame(() => t.classList.add('go'));
    setTimeout(() => {
      Snd().hit(); setTimeout(() => Snd().correct(), 140);
      if (ult && DS.Attack) DS.Attack.ultBlast(arena, m0, tFx()); else DS.FX.place(arena, tFx(), { body: DS.Attack.body(m0, arena), mode: DS.FX.modeOf(tFx()) === 'shot' ? 'body' : undefined, perfect: true }); // 🎯 보이는 몸통 · 발끝 기준 (2026-11-08) // 💥 필살기 = 광역
      arena.classList.remove('shake'); void arena.offsetWidth; arena.classList.add('shake');
      const tag = document.createElement('div'); tag.className = `perfect ${kill ? 'vanish-txt' : 'demo-txt'}`; tag.textContent = kill ? '💥 소멸!' : '시연 · 데미지 없음'; arena.appendChild(tag); setTimeout(() => tag.remove(), 1600);
      if (kill) {
        vanished = built; m0.classList.remove('flash'); void m0.offsetWidth; m0.classList.add('vanish');
        for (let k = 0; k < 14; k++) { const sh = document.createElement('i'); sh.className = 'shard'; sh.style.setProperty('--a', `${(k / 14) * 360}deg`); sh.style.left = `${mr.left - ar.left + mr.width / 2}px`; sh.style.top = `${mr.top - ar.top + mr.height / 2}px`; arena.appendChild(sh); setTimeout(() => sh.remove(), 1100); }
        setTimeout(() => { m0.classList.remove('vanish'); m0.classList.add('gone'); }, 900);
      } else { m0.classList.remove('flash'); void m0.offsetWidth; m0.classList.add('flash'); }
    }, 520);
    setTimeout(() => t.remove(), 1500);
  }

  function leave() { if (DS.Sound && DS.Sound.bgm) DS.Sound.bgm(null, 'tv'); embed = false; if (stop) stop(); stop = null; if (stopPrep) stopPrep(); stopPrep = null; clearInterval(atkT); atkT = 0; clearInterval(bubbleT); built = ''; } // 👩‍🏫 체험판 TV 창 닫기 (남은 연출 타이머가 R 을 읽어도 되게 R · L 은 그대로)
  return { enter, leave };
})();
