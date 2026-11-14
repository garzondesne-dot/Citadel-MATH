// 절차적 Web Audio 신디사이저: 효과음을 파일 없이 오실레이터와 노이즈로 합성한다.
// 2026-11-06: 녹음 효과음(assets/sfx · manifest sfx)을 먼저 쓰고, 아직 못 받았으면 합성음으로 대신한다 · 성채 · 허수아비 배경음(bgm)
window.DS = window.DS || {};

DS.Sound = (function () {
  // 🔇 2026-11-06: 효과음 · 배경음을 따로 끔 (이 기기에 기억) · 종합실은 교사 리모컨이 덮어씀(remote)
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k) === '1'; localStorage.setItem(k, v ? '1' : '0'); } catch (e) { /* 저장 못 하면 이번만 */ } return false; };
  let ctx = null, master = null, noiseBuf = null, sfxOff = typeof localStorage !== 'undefined' && LS('ds-sfx-off'), bgmOff = typeof localStorage !== 'undefined' && LS('ds-bgm-off');
  // 🔉 소리 크기 (2026-11-09 #24 1-4반: 시작하자마자 너무 큼) · 작게 / 보통 · 기본 = 보통(예전 0.45 → 0.28)
  // 🔉 2026-11-13 선생님 「전투 중에 시연 누르거나 문제 누르면 소리 음소거나 10%로」: duck(이유, 켬) = 효과음 · 배경음 모두 10% (이유가 하나라도 있으면)
  const DUCK = {}, duckK = () => (Object.keys(DUCK).length ? 0.1 : 1);
  const VOL = { low: 0.12, mid: 0.28 }; let vol = (() => { try { return localStorage.getItem('ds-vol') === 'low' ? 'low' : 'mid'; } catch (e) { return 'mid'; } })();
  const listeners = [];
  const changed = () => listeners.forEach((f) => { try { f({ sfx: !sfxOff, bgm: !bgmOff }); } catch (e) { /* 무시 */ } });

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = VOL[vol] * duckK();
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ type = 'sine', f0, f1 = f0, dur = 0.2, vol = 0.3, delay = 0 }) {
    const c = ensure();
    if (!c || sfxOff) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise({ dur = 0.2, vol = 0.3, freq = 2000, sweepTo, q = 1, type = 'bandpass', delay = 0 }) {
    const c = ensure();
    if (!c || sfxOff) return;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = c.currentTime + delay;
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(master);
    s.start(t);
    s.stop(t + dur + 0.02);
  }

  // 🔊 녹음 소리: 받아서 해독해 두고(buf) 바로 재생 · 아직이면 받기 시작하고 합성음(fb)으로
  const buf = {}, loading = {}, turn = {}; // buf · loading = 파일마다 · turn = 🔁 번갈아 차례
  const sfxCfg = () => (window.DS && DS.ASSETS && DS.ASSETS.sfx) || null;
  // 🔊 #86 (2026-11-11): 자리마다 파일 여러 개(순위 순 · manifest sfx.files) · rotate = 칠 때마다 번갈아 · rank = 나눠 쓰기(finish 2 = 진필살기 마무리)
  const filesOf = (k) => { const c = sfxCfg(); if (!c) return []; if (c.files && c.files[k]) return c.files[k]; return (c.keys || []).includes(k) || (c.bgm || []).includes(k) ? [`${k}-v${c.v || 1}.mp3`] : []; };
  const sfxUrl = (k) => { const f = filesOf(k)[0]; return f ? `${sfxCfg().dir}${f}` : null; };
  function load(k) {
    const c = ensure(), cf = sfxCfg(); if (!c || !cf || typeof fetch !== 'function') return;
    filesOf(k).forEach((f) => { if (buf[f] || loading[f]) return; loading[f] = fetch(`${cf.dir}${f}`).then((r) => r.arrayBuffer()).then((a) => new Promise((res, rej) => c.decodeAudioData(a, res, rej))).then((b) => { buf[f] = b; }).catch(() => {}).finally(() => { delete loading[f]; }); });
  }
  const pick = (k, rank) => { const fs = filesOf(k); if (!fs.length) return null; if (rank) return fs[Math.min(fs.length, rank) - 1]; const c = sfxCfg(); if (c && (c.rotate || []).includes(k) && fs.length > 1) { const i = (turn[k] = ((turn[k] ?? -1) + 1) % fs.length); return fs[i]; } return fs[0]; };
  function sample(k, vol = 0.9, fb, rank) {
    if (sfxOff) return true;
    const c = ensure(); if (!c) return false;
    const f = pick(k, rank);
    if (f && buf[f]) { const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf[f]; g.gain.value = vol; s.connect(g).connect(master); s.start(); return true; }
    load(k); if (fb) fb(); return false;
  }
  const preload = () => { const c = sfxCfg(); if (c) c.keys.forEach(load); };
  // 🎵 #91 배경음 다시 (2026-11-11 DECISIONS 「🎵 배경음 다시 넣기」): 학생 폰 = 첫 화면 · 캠프만 · 종합실 TV = 장면별 · 체험판(TV + 폰 한 화면)은 TV 쪽만
  //   두 자리(phone · tv) 중 tv 가 있으면 tv · 장면이 바뀌면 0.8초 엇갈려 바뀜 · 반복 = 끝나기 0.3초 전 새 재생으로 엇갈림(파일도 이음매를 녹여 둠) · 🎚 전투 음량 = scale(0.1 ~ 0.7)
  //   🔇 배경음 끄기 · 화면 숨김 · 🎬 영상 · 📄 학습지 창(hold) = 멈춤 · 파일 = 필요할 때 불러오기 (manifest bgm)
  const BGM = { phone: null, tv: null, hold: {} }; let bgmCur = null, bgmScale = 1, bgmScaleT = 1, bgmTick = 0, bgmWinDone = '';
  const bgmCfg = () => (window.DS && DS.ASSETS && DS.ASSETS.bgm) || null;
  const bgmMax = () => (vol === 'low' ? 0.08 : 0.16);
  const bgmWant = () => { const k = BGM.tv !== null ? BGM.tv : BGM.phone; return bgmOff || (typeof document !== 'undefined' && document.hidden) || Object.keys(BGM.hold).length ? null : k; };
  function bgmEl2(k) { const c = bgmCfg(), f = c && c.files && c.files[k]; if (!f || typeof Audio === 'undefined') return null; const a = new Audio(`${c.dir}${f}`); a.preload = 'auto'; a.volume = 0; a._k = k; return a; }
  function bgmFade(a, to, ms, done) { if (!a) return; const from = a.volume, t0 = Date.now(); const st = () => { const k = Math.min(1, (Date.now() - t0) / ms); try { a.volume = Math.max(0, Math.min(1, from + (to - from) * k)); } catch (e) { /* 무시 */ } if (k < 1) a._fade = setTimeout(st, 40); else if (done) done(); }; clearTimeout(a._fade); st(); }
  const bgmVol = () => bgmMax() * bgmScale * duckK();
  function bgmStart(k) {
    const a = bgmEl2(k); if (!a) return null; const once = (bgmCfg().once || []).includes(k);
    a.addEventListener('timeupdate', () => { if (once || bgmCur !== a || a._x || !a.duration) return; if (a.duration - a.currentTime < 0.3) { a._x = true; const b = bgmStart(k); if (b) { bgmCur = b; bgmFade(b, bgmVol(), 300); } bgmFade(a, 0, 300, () => a.pause()); } });
    a.addEventListener('ended', () => { if (bgmCur === a && once) { bgmCur = null; bgmWinDone = k; } });
    a.play().catch(() => {}); return a;
  }
  function bgmApply() {
    const k = bgmWant(); if (k && (bgmCfg() || {}).once && bgmCfg().once.includes(k) && bgmWinDone === k && !bgmCur) return; // 🎉 승리 = 한 번만
    if (bgmCur && bgmCur._k === k) { bgmFade(bgmCur, bgmVol(), 400); return; }
    const old = bgmCur; bgmCur = null; if (old) bgmFade(old, 0, 800, () => old.pause());
    if (!k) return; bgmWinDone = ''; bgmCur = bgmStart(k); if (bgmCur) bgmFade(bgmCur, bgmVol(), 800);
  }
  // where = 'phone' | 'tv' · k = 곡 자리(null = 없음) · opt.scale = 🎚 전투 음량(0.1 ~ 0.7 · 없으면 1)
  function bgm(k, where = 'phone', opt = {}) {
    if (where !== 'tv') where = 'phone';
    const want = k || null, sc = opt.scale != null ? Math.max(0, Math.min(1, opt.scale)) : 1;
    if (BGM[where] !== want) { BGM[where] = want; if (sc !== bgmScaleT) { bgmScaleT = sc; bgmScale = sc; } bgmApply(); }
    if (sc !== bgmScaleT) { bgmScaleT = sc; clearInterval(bgmTick); bgmTick = setInterval(() => { bgmScale += (bgmScaleT - bgmScale) * 0.15; if (Math.abs(bgmScaleT - bgmScale) < 0.01) { bgmScale = bgmScaleT; clearInterval(bgmTick); } if (bgmCur && !bgmCur._fade) try { bgmCur.volume = bgmVol(); } catch (e) { /* 무시 */ } }, 80); } // 체력이 바뀌면 부드럽게
  }
  const duck = (why, on) => { const was = duckK(); if (on) DUCK[why] = 1; else delete DUCK[why]; if (was === duckK()) return; if (master && ctx) { try { master.gain.setTargetAtTime(VOL[vol] * duckK(), ctx.currentTime, 0.08); } catch (e) { master.gain.value = VOL[vol] * duckK(); } } if (bgmCur) bgmFade(bgmCur, bgmVol(), 250); };
  const bgmHold = (why, on) => { if (on) BGM.hold[why] = 1; else delete BGM.hold[why]; bgmApply(); }; // 🎬 영상 · 📄 학습지 창
  const bgmNow = () => ({ phone: BGM.phone, tv: BGM.tv, playing: bgmCur ? bgmCur._k : null, hold: Object.keys(BGM.hold), scale: +bgmScale.toFixed(2) });
  // 첫 터치 때 소리 장치를 깨우고 녹음 소리를 미리 받음 (0.5MB 안쪽 · 배경음은 성채 · 허수아비에서만)
  if (typeof document !== 'undefined') document.addEventListener('pointerdown', () => { ensure(); preload(); }, { once: true, capture: true });
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => bgmApply()); // 🎵 화면 숨김이면 멈춤 · 돌아오면 다시
  // 🔘 #87a 단추 딸깍 (2026-11-11 선생님 「추천대로」 = A): 화면이 바뀌는 큰 단추만 — 메뉴 · 뒤로 · 탭 · 나무 · 입장 · 저장 · 다음 ▶ / ◀ · 캠프 물건(모루 · 허수아비 · 설정)
  //   답 고르기 · 원소 칩 · ⚔ 공격(공격 소리) · 차원문 · 성채 문(door 소리) 처럼 이미 소리가 나는 단추는 안 붙임 · 한 곳에서(테스트 모드 · 체험판 같은 길)
  const CLICK_SEL = '.nav-back, [data-tab], [data-tree], .role, #s-go, #set-ok, #tb-next, #tb-back, #t-fwd, #t-back, #h-fwd, #h-back, #h-menu, #tut-next, #qs-next, #tc-next, #bn-back, #st-back, #st-lobby, [data-go], #camp-anvil, #camp-dummy, #camp-set';
  if (typeof document !== 'undefined') document.addEventListener('click', (e) => { const b = e.target && e.target.closest && e.target.closest(CLICK_SEL); if (b && !b.disabled && window.DS && DS.Sound && DS.Sound.click) DS.Sound.click(); }, true);
  // 🎵 #91 🎬 영상 · 📄 학습지 창이 열려 있으면 배경음 멈춤 (창 종류마다 따로 고치지 않고 한 곳에서 · 닫히면 다시)
  if (typeof document !== 'undefined' && typeof MutationObserver === 'function') { let was = false; const chk = () => { const on = !!document.querySelector('.video-modal, .sheet-modal, .t-sheet-modal'); if (on !== was) { was = on; bgmHold('modal', on); } }; const go = () => new MutationObserver(chk).observe(document.body, { childList: true }); if (document.body) go(); else document.addEventListener('DOMContentLoaded', go); }
  // 공격 계열 → 맞는 소리
  const FAM_SFX = { cut: 'cut', smash: 'smash', sweep: 'sweep', wind: 'wind', fire: 'fire', spark: 'spark', frost: 'frost', star: 'star', magic: 'magic', math: 'magic', sun: 'star', dark: 'cut', gear: 'smash', water: 'wind' }; // 🌈 #74-3 새 속성 = 새 효과음이 오기 전까지 비슷한 소리

  return {
    filesOf, pick,
    unlock() { const c = ensure(); preload(); return c; },
    toggle() { const off = !(sfxOff && bgmOff); this.setSfx(!off); this.setBgm(!off); return off; },
    // 🔇 효과음 · 배경음 따로 (on = 켜기) · keep = false 면 이 기기에 저장 안 함 (교사 리모컨이 종합실을 바꿀 때)
    setSfx(on, keep = true) { sfxOff = !on; if (keep) LS('ds-sfx-off', sfxOff); changed(); },
    setBgm(on, keep = true) { bgmOff = !on; if (keep) LS('ds-bgm-off', bgmOff); bgmApply(); changed(); },
    setVol(v, keep = true) { vol = v === 'low' ? 'low' : 'mid'; if (master) master.gain.value = VOL[vol] * duckK(); if (bgmCur) bgmFade(bgmCur, bgmVol(), 200); if (keep) { try { localStorage.setItem('ds-vol', vol); } catch (e) { /* 무시 */ } } changed(); },
    get vol() { return vol; },
    // 🔇 / 작게 / 보통 한 번에 (종합실 구석 · 리모컨)
    setLevel(l, keep = true) { if (l === 'off') { this.setSfx(false, keep); this.setBgm(false, keep); return; } this.setVol(l, keep); this.setSfx(true, keep); this.setBgm(true, keep); },
    get level() { return sfxOff && bgmOff ? 'off' : vol; }, // 🎵 #91 배경음 다시
    get sfxOn() { return !sfxOff; },
    get bgmOn() { return !bgmOff; },
    onChange(f) { listeners.push(f); },
    sample, preload, bgm, bgmHold, bgmNow, duck, get ducked() { return duckK() < 1; },
    // ⚔ 공격 소리 (attack.js): 휘두름 · 발사 · 맞음(이펙트 계열) · 막힘 · 처치
    swing() { sample('swing', 0.6, () => noise({ dur: 0.25, vol: 0.25, freq: 600, sweepTo: 3500, q: 0.8 })); },
    launch() { sample('launch', 0.6, () => noise({ dur: 0.2, vol: 0.2, freq: 1500, sweepTo: 5000, q: 1 })); },
    fxHit(kind) { const f = window.DS && DS.FX && DS.FX.famOf ? DS.FX.famOf(kind) : null; const k = f ? FAM_SFX[f.id] : 'special'; sample(k, 0.85, () => { noise({ dur: 0.12, vol: 0.4, freq: 900, type: 'lowpass' }); tone({ type: 'square', f0: 170, f1: 60, dur: 0.12, vol: 0.18 }); }); },
    finish(rank) { sample('finish', 0.95, () => { noise({ dur: 0.45, vol: 0.5, freq: 4500, sweepTo: 400 }); tone({ type: 'sine', f0: 75, f1: 30, dur: 0.45, vol: 0.6 }); }, rank); }, // 🎯 #86 finish 1 = 몬스터 쓰러짐 · 2 = 진필살기 1초 뒤 마무리
    coin() { sample('coin', 0.7, () => tone({ type: 'square', f0: 1320, f1: 1980, dur: 0.12, vol: 0.08 })); },
    levelup() { sample('levelup', 0.85, () => [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.45, vol: 0.18, delay: i * 0.12 }))); },
    get muted() { return sfxOff; },

    card() { noise({ dur: 0.06, vol: 0.15, freq: 5000 }); },
    // 🔊 #87 (2026-11-11) 🆕 소리 틀 곳: boss 1 = 수업 형성평가 보스 · 2 = 🏰 성채 보스 방 · 3 = 🎯 허수아비 형성평가 / die = 번갈아 / 나머지 1개 · 1위만 (파일이 없으면 예전 소리 · 합성음)
    boss(rank = 1) { sample('boss', 0.8, () => tone({ type: 'sawtooth', f0: 110, f1: 55, dur: 0.8, vol: 0.18 }), rank); },
    hurt() { sample('hurt', 0.55, () => tone({ type: 'square', f0: 300, f1: 90, dur: 0.2, vol: 0.15 })); }, // #90: 옛 합성음(같은 이름이 뒤에 또 있어 새 소리를 덮던 것)은 파일을 못 받았을 때 대신 소리로
    die() { sample('die', 0.7); },
    anvil() { sample('anvil', 0.85, () => this.hit()); },
    cardMade() { sample('card', 0.85, () => this.correct()); },
    hint() { sample('hint', 0.7, () => tone({ type: 'triangle', f0: 880, f1: 1320, dur: 0.15, vol: 0.12 })); },
    door() { sample('door', 0.75); },
    holy() { sample('holy', 0.8, () => this.clank()); },
    awaken() { sample('awaken', 0.9, () => this.levelup()); },
    click() { sample('click', 0.5); },
    // 🔊 효과음 2차 (2026-11-14 선생님 「효과음 평가 끝」 · hero-v2 docs/handoff/sfx/round2 1위 · manifest sfx.files 의 id) · 파일이 아직 안 받아졌으면 fb (옛 소리)
    fx(id, v = 0.8, fb) { return sample(id, v, fb); },
    sand() { noise({ dur: 0.55, vol: 0.07, freq: 7000, sweepTo: 2200, q: 0.9 }); }, // ✨ 모래 글씨 「사르륵」 (#46)
    tick() { tone({ type: 'square', f0: 1300, f1: 1250, dur: 0.025, vol: 0.05 }); }, // 🥊 펀치 기계 숫자 돌기 (v0.9.11)
    // ⚖ 쉼터 놀이 (v0.9.8.0): 탈락 버저 · 스프링 띠용
    buzz() { tone({ type: 'square', f0: 150, f1: 140, dur: 0.55, vol: 0.16 }); },
    boing() { tone({ type: 'sine', f0: 140, f1: 620, dur: 0.18, vol: 0.32 }); tone({ type: 'sine', f0: 620, f1: 260, dur: 0.35, vol: 0.22, delay: 0.18 }); },
    // 검기 베기 + 서브베이스
    slash() {
      noise({ dur: 0.2, vol: 0.5, freq: 7000, sweepTo: 700, q: 0.7 });
      tone({ type: 'sine', f0: 95, f1: 38, dur: 0.3, vol: 0.55 });
    },
    hit() {
      noise({ dur: 0.12, vol: 0.4, freq: 900, type: 'lowpass' });
      tone({ type: 'square', f0: 170, f1: 60, dur: 0.12, vol: 0.18 });
    },
    // 수식 발동 마법 공명음
    magic() {
      tone({ type: 'sine', f0: 440, f1: 880, dur: 0.4, vol: 0.15 });
      tone({ type: 'sine', f0: 443, f1: 1320, dur: 0.45, vol: 0.1, delay: 0.03 });
    },
    block() { sample('block', 0.75, () => { tone({ type: 'triangle', f0: 520, f1: 470, dur: 0.18, vol: 0.2 }); noise({ dur: 0.08, vol: 0.18, freq: 3200 }); }); },
    // 금속 철갑 파쇄음
    armorBreak() {
      for (let i = 0; i < 6; i++) {
        tone({ type: 'square', f0: 1300 + Math.random() * 1800, f1: 250, dur: 0.28, vol: 0.07, delay: i * 0.035 });
      }
      noise({ dur: 0.45, vol: 0.5, freq: 4500, sweepTo: 400 });
      tone({ type: 'sine', f0: 75, f1: 30, dur: 0.45, vol: 0.6 });
    },
    shieldBreak() {
      for (let i = 0; i < 4; i++) tone({ type: 'triangle', f0: 2200 - i * 300, f1: 600, dur: 0.3, vol: 0.09, delay: i * 0.05 });
      noise({ dur: 0.5, vol: 0.45, freq: 6000, sweepTo: 600, q: 2 });
    },
    correct() { sample('correct', 0.75, () => [660, 880, 1320].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.25, vol: 0.18, delay: i * 0.07 }))); },
    wrong() { sample('wrong', 0.6, () => tone({ type: 'sawtooth', f0: 220, f1: 110, dur: 0.35, vol: 0.13 })); },
    // 공격 실패: 물렁한 소리 (아무 일도 일어나지 않음)
    squish() {
      tone({ type: 'sine', f0: 210, f1: 120, dur: 0.22, vol: 0.2 });
      noise({ dur: 0.12, vol: 0.12, freq: 400, type: 'lowpass' });
    },
    // 집중모드: 경고음 두 번
    warn() {
      [0, 0.28].forEach((d) => tone({ type: 'square', f0: 880, f1: 660, dur: 0.2, vol: 0.14, delay: d }));
    },
    // 보스 등장: 땅울림
    rumble() {
      tone({ type: 'sine', f0: 55, f1: 38, dur: 1.4, vol: 0.5 });
      noise({ dur: 1.2, vol: 0.3, freq: 220, type: 'lowpass' });
    },
    // 대장간 망치질 + 반짝임
    forge() {
      tone({ type: 'square', f0: 1800, f1: 900, dur: 0.12, vol: 0.12 });
      noise({ dur: 0.15, vol: 0.35, freq: 3000, q: 3 });
      [988, 1319, 1976].forEach((f, i) => tone({ type: 'sine', f0: f, dur: 0.4, vol: 0.1, delay: 0.15 + i * 0.08 }));
    },
    clank() { tone({ type: 'square', f0: 900, f1: 500, dur: 0.08, vol: 0.08 }); },
    enemyAtk() {
      tone({ type: 'sawtooth', f0: 130, f1: 45, dur: 0.32, vol: 0.28 });
      noise({ dur: 0.25, vol: 0.35, freq: 500, type: 'lowpass' });
    },
    // 테이프 되감기
    rewind() {
      tone({ type: 'sawtooth', f0: 900, f1: 80, dur: 1.2, vol: 0.1 });
      for (let i = 0; i < 10; i++) noise({ dur: 0.08, vol: 0.15, freq: 1500 + i * 300, delay: i * 0.11 });
    },
    scan() {
      tone({ type: 'sine', f0: 1200, f1: 2400, dur: 0.18, vol: 0.12 });
      tone({ type: 'sine', f0: 1800, f1: 3600, dur: 0.18, vol: 0.08, delay: 0.1 });
    },
    whoosh() { noise({ dur: 0.35, vol: 0.3, freq: 500, sweepTo: 4000, q: 0.8 }); },
    heartbeat() {
      tone({ type: 'sine', f0: 70, f1: 40, dur: 0.14, vol: 0.6 });
      tone({ type: 'sine', f0: 65, f1: 38, dur: 0.16, vol: 0.45, delay: 0.18 });
    },
    crit() {
      tone({ type: 'square', f0: 1600, f1: 3200, dur: 0.12, vol: 0.12 });
      noise({ dur: 0.3, vol: 0.4, freq: 8000, sweepTo: 1500, q: 1.5 });
    },
    victory() { sample('victory', 0.85, () => [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.45, vol: 0.18, delay: i * 0.12 }))); },
  };
})();
