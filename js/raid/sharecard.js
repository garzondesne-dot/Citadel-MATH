// 📤 공유 카드 (v0.9.0): 이미지 1장(1080×1350)으로 그려 폰 공유 창 → 카카오톡(「나와의 채팅」 포함) · 저장
//  ⚔ 오늘의 전투 기록  — 학생 본인 · 게임 결과 그대로 (용사 · Lv · EXP · 몬스터 · PERFECT · 보스에 준 힘 · 끈기 · 획득 · 한마디)
//  📘 오늘의 수학 노트  — 학생 본인 · 수학 내용만 (개념 정의 · 나의 이해 · 고친 문제 · 복습할 것 · 다음 수업) — 게임 낱말 없음
//  🏫 우리 반 수업 소식 — 교사 · 반 전체 공유용 (참여 · 협동 결과 · 반 이해도 · 끈기 합계 · 다 함께 할 일 · 칭찬 · 익명 한마디) — 이름 · 순위 · 개인 점수 없음
window.DS = window.DS || {};

DS.ShareCard = (function () {
  const W = 1080, H = 1350;
  const A = () => DS.ASSETS;
  const imgs = {};
  const load = (src) => imgs[src] || (imgs[src] = new Promise((res) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }));
  const art = (f) => `${A().base}${f}`;
  const PIX = "'Galmuri11', 'Noto Sans KR', sans-serif", SANS = "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  async function fonts() { try { await Promise.all([document.fonts.load(`700 40px ${PIX}`), document.fonts.load(`40px ${PIX}`)]); } catch (e) { /* 무시 */ } }
  function canvas() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  // 시트 칸 그리기 (배치표 cols · rows)
  async function cell(g, sheetKey, col, row, x, y, w, h, flip) {
    const s = A()[sheetKey]; if (!s) return;
    const im = await load(art(s.src)); if (!im) return;
    const cw = im.width / s.cols, ch = im.height / (s.rows || 1);
    g.save(); g.imageSmoothingEnabled = false;
    if (flip) { g.translate(x + w, y); g.scale(-1, 1); g.drawImage(im, col * cw, row * ch, cw, ch, 0, 0, w, h); } else g.drawImage(im, col * cw, row * ch, cw, ch, x, y, w, h);
    g.restore();
  }
  const hero = (g, n, pose, x, y, s) => { n = Number(n) || 0; if (n >= 8 && A().heroesExtra) return cell(g, 'heroesExtra', A().heroesExtra.poses[pose] || 0, n - 8, x, y, s, s); return cell(g, 'heroes', A().heroes.poses[pose] || 0, n % A().heroes.count, x, y, s, s); };
  const SHEETS = { extra: 'monstersExtra', new: 'monstersNew', crown: 'monstersCrown' };
  function monster(g, n, pose, x, y, s) {
    const [k, i] = typeof n === 'string' && n.includes(':') ? n.split(':') : [null, n];
    const key = SHEETS[k] || 'monsters', sh = A()[key], row = Number(i) % sh.rows;
    return cell(g, key, sh.poses[pose] || 0, row, x, y, s, s, (sh.flip || []).includes(row));
  }
  // 글자 줄바꿈 (낱말 단위 · 한국어는 글자 단위로 넘침 방지)
  function wrap(g, text, x, y, maxW, lh, maxLines = 9) {
    const words = String(text || '').split(/(\s+)/); let line = '', n = 0;
    const flush = () => { g.fillText(line.trim(), x, y + n * lh); n++; line = ''; };
    for (const w of words) {
      if (g.measureText(line + w).width > maxW && line.trim()) { flush(); if (n >= maxLines) return n * lh; }
      if (g.measureText(w).width > maxW) { for (const ch of w) { if (g.measureText(line + ch).width > maxW) { flush(); if (n >= maxLines) return n * lh; } line += ch; } } else line += w;
    }
    if (line.trim()) flush();
    return n * lh;
  }
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const today = () => { const d = new Date(); return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`; };
  const conceptLines = (L) => L.steps.filter((s) => s.kind === 'concept').map((s) => ({ id: s.id, name: s.title.replace(/^개념 \d+ · /, ''), say: s.say || '' }));
  const level3 = (v) => (!v || !v.total ? 'none' : v.ok / v.total >= 0.8 ? 'good' : v.ok / v.total >= 0.5 ? 'mid' : 'again');

  // ── ⚔ 오늘의 전투 기록 ─────────────────────────────────
  async function battle(o) { // o = { L, r, me, lv, gained, up, first, raids }
    await fonts();
    const c = canvas(), g = c.getContext('2d'), { L, r, me } = o;
    g.fillStyle = '#070c1c'; g.fillRect(0, 0, W, H);
    const bg = await load(art(A().dungeons.bg(L.theme || A().dungeons.ids[0])));
    if (bg) { const k = Math.max(W / bg.width, 760 / bg.height); g.drawImage(bg, (W - bg.width * k) / 2, 0, bg.width * k, bg.height * k); }
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#070c1c55'); gr.addColorStop(0.45, '#070c1caa'); gr.addColorStop(0.62, '#070c1cf5'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = '#ffcf5a'; g.font = `700 64px ${PIX}`; g.textAlign = 'center'; g.fillText('⚔ 오늘의 전투 기록', W / 2, 96);
    g.fillStyle = '#cfe0ff'; g.font = `30px ${PIX}`; g.fillText(`모두의 던전 · ${L.no ? `${L.no}차시 ` : ''}${L.title} · ${today()}`, W / 2, 146);
    // 용사 + 성장
    g.fillStyle = '#ffcf5a33'; g.beginPath(); g.ellipse(270, 560, 170, 34, 0, 0, Math.PI * 2); g.fill();
    await hero(g, me.hero, 'attack', 90, 210, 360);
    g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = `700 50px ${PIX}`; g.fillText(me.name || '용사', 500, 280);
    if (o.lv) {
      g.fillStyle = '#ffcf5a'; g.font = `700 46px ${PIX}`; g.fillText(`Lv.${o.lv.lv} ${o.lv.title}`, 500, 350);
      rr(g, 500, 380, 500, 38, 10); g.fillStyle = '#1d2640'; g.fill();
      rr(g, 500, 380, Math.max(20, (500 * o.lv.into) / o.lv.next), 38, 10); const eg = g.createLinearGradient(500, 0, 1000, 0); eg.addColorStop(0, '#ffb000'); eg.addColorStop(1, '#ffe48a'); g.fillStyle = eg; g.fill();
      g.fillStyle = '#fff'; g.font = `26px ${PIX}`; g.textAlign = 'center'; g.fillText(`${o.lv.into} / ${o.lv.next} EXP`, 750, 408); g.textAlign = 'left';
      if (o.gained) { g.fillStyle = '#9fffcf'; g.font = `700 40px ${PIX}`; g.fillText(`+${o.gained} EXP`, 500, 470); }
      if (o.up) { rr(g, 760, 436, 240, 50, 12); g.fillStyle = '#ff5a8a'; g.fill(); g.fillStyle = '#fff'; g.font = `700 32px ${PIX}`; g.textAlign = 'center'; g.fillText('LEVEL UP!', 880, 472); g.textAlign = 'left'; }
    }
    // 몬스터
    g.fillStyle = '#ffcf5a'; g.font = `700 34px ${PIX}`; g.fillText('무찌른 몬스터', 70, 650);
    const mons = r.mons.filter((m) => m.tried).slice(0, 5), n = mons.length + (r.boss.tried ? 1 : 0), ms = Math.min(200, Math.floor((W - 100) / Math.max(1, n)));
    let mx = 50;
    for (const m of mons) { await monster(g, L.monsters[m.id].sprite, 'down', mx, 640, ms); mx += ms; }
    if (r.boss.tried) { await monster(g, L.boss.sprite, r.boss.won ? 'down' : 'idle', mx, 630, ms); g.fillStyle = '#ffcf5a'; g.font = `700 26px ${PIX}`; g.textAlign = 'center'; g.fillText(r.boss.won ? '★ 보스 격파' : '보스', mx + ms / 2, 845); g.textAlign = 'left'; }
    // 기록 4칸
    const stat = (x, y, big, small, color) => { rr(g, x, y, 450, 130, 18); g.fillStyle = '#111a33'; g.fill(); g.strokeStyle = color; g.lineWidth = 3; g.stroke(); g.fillStyle = color; g.font = `700 52px ${PIX}`; g.fillText(big, x + 28, y + 66); g.fillStyle = '#cfd9ee'; g.font = `28px ${PIX}`; g.fillText(small, x + 28, y + 108); };
    stat(70, 870, `⚡ ${r.perfects}번`, 'PERFECT (한 번에 모두 맞힘)', '#ffe15a');
    stat(560, 870, `🔁 ${r.fixed}문제`, '끝까지 고친 문제 (끈기)', '#6fe0b0');
    stat(70, 1020, `👑 ${r.boss.share}%`, `${L.boss.title.replace(/^.*· /, '')} 체력을 내가 깎음`, '#ff8a6a');
    stat(560, 1020, `🔥 ${o.raids || 1}번째`, '출전 (모두의 던전 레이드)', '#8fb8ff');
    // 획득 · 한마디
    let y = 1210;
    if (o.first) { await hero(g, 9, 'attack', 70, y - 62, 110); g.fillStyle = '#ffcf5a'; g.font = `700 34px ${PIX}`; g.fillText('🎁 첫 출정 특전 — 새 용사 합류!', 190, y); y += 56; }
    if (r.words) { rr(g, 70, y - 10, 940, 80, 20); g.fillStyle = '#ffffff18'; g.fill(); g.fillStyle = '#ffffff'; g.font = `30px ${PIX}`; wrap(g, `💬 "${r.words}"`, 96, y + 40, 880, 36, 1); }
    g.fillStyle = '#ffffff66'; g.font = `24px ${PIX}`; g.textAlign = 'center'; g.fillText('모두의 던전 : 공통수학2', W / 2, H - 28);
    return c;
  }

  // ── 📘 오늘의 수학 노트 (게임 요소 없음) ─────────────────────
  const LV = { good: ['처음부터 이해함', '#1f8a5b', '#e3f6ec'], mid: ['고쳐서 이해함', '#b8860b', '#fff4d6'], again: ['한 번 더 보기', '#c0392b', '#fde8e6'], none: ['아직 안 풀어 봄', '#7a7f8c', '#eef0f4'] };
  async function math(o) { // o = { L, r, me }
    await fonts();
    const c = canvas(), g = c.getContext('2d'), { L, r } = o;
    g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#2d4a8a'; g.fillRect(0, 0, W, 170);
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = `700 60px ${SANS}`; g.fillText('오늘의 수학 노트', 64, 92);
    g.font = `30px ${SANS}`; g.fillStyle = '#dbe6ff'; g.fillText(`공통수학2 · ${L.no ? `${L.no}차시 ` : ''}${L.title} · ${today()}`, 64, 140);
    let y = 230;
    const head = (t) => { g.fillStyle = '#2d4a8a'; g.font = `700 36px ${SANS}`; g.fillText(t, 64, y); g.fillStyle = '#2d4a8a33'; g.fillRect(64, y + 14, W - 128, 3); y += 60; };
    // 오늘 배운 것 + 나의 이해
    head('오늘 배운 것');
    for (const cp of conceptLines(L)) {
      const v = LV[level3(r.conc[cp.id])];
      g.fillStyle = '#1b2236'; g.font = `700 32px ${SANS}`; g.fillText(`■ ${cp.name}`, 64, y);
      g.font = `26px ${SANS}`; const tw = g.measureText(v[0]).width + 36; rr(g, W - 64 - tw, y - 32, tw, 44, 22); g.fillStyle = v[2]; g.fill(); g.fillStyle = v[1]; g.textAlign = 'center'; g.fillText(v[0], W - 64 - tw / 2, y - 2); g.textAlign = 'left';
      g.fillStyle = '#3d4458'; g.font = `27px ${SANS}`; y += 12 + wrap(g, cp.say, 92, y + 36, W - 170, 38, 3) + 40;
    }
    // 내가 고친 문제
    if (r.fixEx && y < 880) {
      head('내가 고친 문제');
      const q = r.fixEx.q, qt = q.type === 'blanks' ? `${q.question} ${q.items.map((i) => `${i.left} □ ${i.right}`).join(', ')}` : q.question;
      g.fillStyle = '#1b2236'; g.font = `28px ${SANS}`; y += wrap(g, qt, 64, y, W - 128, 38, 3);
      g.fillStyle = '#1f8a5b'; g.font = `700 27px ${SANS}`; y += 6 + wrap(g, `바른 풀이: ${q.solution || ''}`, 64, y + 6, W - 128, 36, 3) + 26;
    }
    // 복습할 것
    if (y < 1010) {
      head('복습할 것');
      g.fillStyle = '#1b2236'; g.font = `28px ${SANS}`;
      const rv = r.weak.length ? r.weak.map((cid) => `· ${String(r.titles[cid] || cid).replace(/^개념 \d+ · /, '')} — 학습지 개념 정리 다시 보기${DS.Video && DS.Video.pick(L, {}, cid) ? ' · 설명 영상' : ''}`) : ['· 오늘 개념을 고르게 이해했어요. 보강 문제로 한 번 더 다져 봐요.'];
      for (const t of rv) y += wrap(g, t, 64, y, W - 128, 38, 2);
      y += 24;
    }
    // 다음 수업
    if (L.next) {
      const top = Math.max(y, 1040); rr(g, 48, top - 44, W - 96, H - top - 30, 22); g.fillStyle = '#eaf0ff'; g.fill();
      g.fillStyle = '#2d4a8a'; g.font = `700 34px ${SANS}`; g.fillText(`다음 수업 · ${L.next.title}`, 76, top + 4);
      g.fillStyle = '#1b2236'; g.font = `27px ${SANS}`; let yy = top + 50 + wrap(g, `생각해 보기: ${L.next.ask}`, 76, top + 50, W - 152, 36, 2);
      g.fillStyle = '#4a5578'; wrap(g, L.next.link, 76, yy + 8, W - 152, 34, 2);
    }
    return c;
  }

  // ── 🏫 우리 반 수업 소식 (반 전체 공유용 · 이름 없음) ──────────────
  function classStats(L, R) {
    const X = DS.Raid, ids = X.activeIds(R), conc = {}, byFix = {};
    let fixed = 0, tried = 0;
    ids.forEach((u) => {
      const r = DS.Result.compute(L, R, u); if (r.mons.some((m) => m.tried) || r.boss.tried) tried++;
      fixed += r.fixed;
      Object.entries(r.conc).forEach(([cid, v]) => { const lv = level3(v); conc[cid] = conc[cid] || { good: 0, mid: 0, again: 0, n: 0 }; if (lv !== 'none') { conc[cid][lv]++; conc[cid].n++; } });
      r.mons.forEach((m) => { byFix[m.concept] = (byFix[m.concept] || 0) + m.fixed; });
    });
    const grow = Object.entries(byFix).filter(([c]) => c !== 'review').sort((a, b) => b[1] - a[1])[0];
    const words = Object.entries(R.words || {}).filter(([u, w]) => w && w.t && !w.bad && !(R.hide || {})[u]).map(([, w]) => w.t).slice(0, 5);
    const st = R.state || {}, secs = st.bossWonAt && st.bossFrom ? Math.max(0, Math.round((st.bossWonAt - st.bossFrom) / 1000)) : 0;
    return { n: ids.length, tried, fixed, conc, grow: grow && grow[1] ? grow[0] : null, words, won: X.bossHp(L, R).won, secs, headcount: X.headcount(R) };
  }
  async function klass(o) { // o = { L, R, cls, praise }
    await fonts();
    const c = canvas(), g = c.getContext('2d'), { L, R } = o, s = classStats(L, R), { titles } = DS.Result.conceptMap(L);
    g.fillStyle = '#f6f9ff'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1f6f5c'; g.fillRect(0, 0, W, 180);
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = `700 60px ${SANS}`; g.fillText('우리 반 수업 소식', 64, 96);
    g.font = `30px ${SANS}`; g.fillStyle = '#d9fff3'; g.fillText(`${o.cls ? `${o.cls}반 · ` : ''}공통수학2 ${L.no ? `${L.no}차시 ` : ''}${L.title} · ${today()}`, 64, 146);
    let y = 250;
    const head = (t) => { g.fillStyle = '#1f6f5c'; g.font = `700 36px ${SANS}`; g.fillText(t, 64, y); g.fillStyle = '#1f6f5c33'; g.fillRect(64, y + 14, W - 128, 3); y += 58; };
    head('함께한 결과');
    const box = (x, big, small) => { rr(g, x, y - 10, 300, 130, 18); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#cfe3dc'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#1b2236'; g.font = `700 46px ${SANS}`; g.textAlign = 'center'; g.fillText(big, x + 150, y + 52); g.font = `24px ${SANS}`; g.fillStyle = '#5a6478'; g.fillText(small, x + 150, y + 94); g.textAlign = 'left'; };
    box(64, s.tried >= s.headcount ? '전원 출전' : `${s.tried}명`, `참여 ${s.tried} / ${s.headcount}명`);
    box(390, s.won ? '보스 격파!' : '도전 완료', L.boss.title.replace(/^.*· /, ''));
    box(716, s.secs ? `${Math.floor(s.secs / 60)}분 ${s.secs % 60}초` : '—', '보스까지 걸린 시간');
    y += 170;
    head('우리 반 이해도');
    const cols = { good: '#2fa37a', mid: '#e8b33a', again: '#e2725b' };
    for (const cid of Object.keys(s.conc).filter((k) => k !== 'review' && k !== 'boss')) {
      const v = s.conc[cid]; if (!v.n) continue;
      g.fillStyle = '#1b2236'; g.font = `28px ${SANS}`; let nm = String(titles[cid] || cid).replace(/^개념 \d+ · /, '').replace(/ · 이런 표현도$/, ''); while (g.measureText(nm).width > 340 && nm.length > 2) nm = nm.slice(0, -1); g.fillText(nm, 64, y);
      let x = 420; const bw = W - 64 - 420;
      ['good', 'mid', 'again'].forEach((k) => { const w = (bw * v[k]) / v.n; if (w > 0) { g.fillStyle = cols[k]; g.fillRect(x, y - 26, w, 34); x += w; } });
      y += 54;
    }
    g.font = `22px ${SANS}`; [['good', '잘 이해함'], ['mid', '고치며 이해 중'], ['again', '다 함께 복습']].forEach(([k, t], i) => { g.fillStyle = cols[k]; g.fillRect(420 + i * 210, y - 18, 22, 22); g.fillStyle = '#5a6478'; g.fillText(t, 450 + i * 210, y); });
    y += 60;
    head('우리 반 끈기');
    g.fillStyle = '#1b2236'; g.font = `30px ${SANS}`;
    g.fillText(`오늘 끝까지 고친 문제 ${s.fixed}개${s.grow ? ` · 가장 많이 성장한 개념: ${String(titles[s.grow] || s.grow).replace(/^개념 \d+ · /, '')}` : ''}`, 64, y); y += 70;
    head('다 함께 할 일');
    g.font = `28px ${SANS}`; g.fillStyle = '#1b2236';
    if (L.next) y += wrap(g, `· 다음 수업 ${L.next.title} — ${L.next.ask}`, 64, y, W - 128, 38, 2);
    y += wrap(g, `· 복습: ${(L.bonus || []).length ? '보강 문제 (각자 모닥불에서)' : '학습지 개념 정리'} · 설명 영상 다시 보기`, 64, y, W - 128, 38, 2) + 20;
    const praise = o.praise || (s.tried >= s.headcount && s.won ? '전원 출전에 보스 격파까지 — 멋진 협동이었어요!' : s.won ? '힘을 모아 보스를 격파했어요. 다음 시간에도 함께해요!' : '끝까지 함께 도전한 우리 반, 다음 시간에 꼭 격파해요!');
    rr(g, 48, y - 10, W - 96, 90, 22); g.fillStyle = '#e7f6f0'; g.fill(); g.fillStyle = '#1f6f5c'; g.font = `700 30px ${SANS}`; wrap(g, `👏 ${praise}`, 76, y + 44, W - 152, 36, 1); y += 120;
    if (s.words.length && y < H - 120) {
      g.fillStyle = '#5a6478'; g.font = `24px ${SANS}`; g.fillText('친구들의 한마디 (익명)', 64, y); y += 46;
      g.font = `26px ${SANS}`;
      for (const w of s.words) { if (y > H - 60) break; g.fillStyle = '#1b2236'; wrap(g, `“${w}”`, 80, y, W - 160, 32, 1); y += 44; }
    }
    return c;
  }

  // ── 보여 주기 · 공유 ───────────────────────────────────────
  async function share(c, name, text) {
    const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
    const file = new File([blob], `${name}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text, title: name }); return 'shared'; } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${name}.png`; document.body.appendChild(a); a.click(); a.remove();
    DS.UI.toast('이미지를 저장했어요. 카카오톡에서 「나와의 채팅」으로 보내 보세요.', 3600);
    return 'saved';
  }
  // 미리보기 창: [카카오톡 · 공유] [이미지 저장]
  async function preview(make, name, text, opt = {}) {
    const el = document.createElement('div'); el.className = 'modal sc-modal';
    el.innerHTML = `<div class="quiz-box framed sc-box"><div class="quiz-head"><b>${DS.UI.esc(name)}</b><button class="btn small" data-x>✕</button></div>
      ${opt.praise ? `<label class="small">칭찬 한 줄 (고쳐 쓸 수 있어요) <input id="sc-praise" maxlength="40" placeholder="비워 두면 자동 문구"></label>` : ''}
      <div class="sc-img"><p class="muted">카드를 만드는 중…</p></div>
      <div class="row"><button class="btn primary" id="sc-share">💬 카카오톡으로 보내기</button><button class="btn" id="sc-save">💾 이미지 저장</button></div>
      <p class="muted small">공유 창에서 <b>카카오톡 → 나와의 채팅</b>을 고르면 나에게 보낼 수 있어요. 친구·가족에게 보내도 돼요.</p></div>`;
    document.body.appendChild(el);
    let c = null;
    const draw = async () => { c = await make((el.querySelector('#sc-praise') || {}).value || ''); const box = el.querySelector('.sc-img'); box.innerHTML = ''; const im = new Image(); im.src = c.toDataURL('image/png'); im.alt = name; box.appendChild(im); };
    await draw();
    const pr = el.querySelector('#sc-praise'); if (pr) pr.onchange = draw;
    el.querySelector('[data-x]').onclick = () => el.remove();
    el.querySelector('#sc-share').onclick = () => DS.Control.run(() => share(c, name, text));
    el.querySelector('#sc-save').onclick = () => DS.Control.run(async () => { const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `${name}.png`; document.body.appendChild(a); a.click(); a.remove(); });
    return el;
  }
  return { battle, math, klass, classStats, share, preview, W, H };
})();
