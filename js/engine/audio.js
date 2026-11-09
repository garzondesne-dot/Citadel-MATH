// 절차적 Web Audio 신디사이저: 효과음을 파일 없이 오실레이터와 노이즈로 합성한다.
// 2026-11-06: 녹음 효과음(assets/sfx · manifest sfx)을 먼저 쓰고, 아직 못 받았으면 합성음으로 대신한다 · 성채 · 허수아비 배경음(bgm)
window.DS = window.DS || {};

DS.Sound = (function () {
  // 🔇 2026-11-06: 효과음 · 배경음을 따로 끔 (이 기기에 기억) · 종합실은 교사 리모컨이 덮어씀(remote)
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k) === '1'; localStorage.setItem(k, v ? '1' : '0'); } catch (e) { /* 저장 못 하면 이번만 */ } return false; };
  let ctx = null, master = null, noiseBuf = null, sfxOff = typeof localStorage !== 'undefined' && LS('ds-sfx-off'), bgmOff = typeof localStorage !== 'undefined' && LS('ds-bgm-off');
  // 🔉 소리 크기 (2026-11-09 #24 1-4반: 시작하자마자 너무 큼) · 작게 / 보통 · 기본 = 보통(예전 0.45 → 0.28)
  const VOL = { low: 0.12, mid: 0.28 }; let vol = (() => { try { return localStorage.getItem('ds-vol') === 'low' ? 'low' : 'mid'; } catch (e) { return 'mid'; } })();
  const listeners = [];
  const changed = () => listeners.forEach((f) => { try { f({ sfx: !sfxOff, bgm: !bgmOff }); } catch (e) { /* 무시 */ } });

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = VOL[vol];
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
  const buf = {}, loading = {};
  const sfxCfg = () => (window.DS && DS.ASSETS && DS.ASSETS.sfx) || null;
  const sfxUrl = (k) => { const c = sfxCfg(); return c && (c.keys.includes(k) || c.bgm.includes(k)) ? `${c.dir}${k}-v${c.v}.mp3` : null; };
  function load(k) {
    const c = ensure(), u = sfxUrl(k);
    if (!c || !u || buf[k] || loading[k] || typeof fetch !== 'function') return;
    loading[k] = fetch(u).then((r) => r.arrayBuffer()).then((a) => new Promise((res, rej) => c.decodeAudioData(a, res, rej))).then((b) => { buf[k] = b; }).catch(() => {}).finally(() => { delete loading[k]; });
  }
  function sample(k, vol = 0.9, fb) {
    if (sfxOff) return true;
    const c = ensure(); if (!c) return false;
    if (buf[k]) { const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf[k]; g.gain.value = vol; s.connect(g).connect(master); s.start(); return true; }
    load(k); if (fb) fb(); return false;
  }
  const preload = () => { const c = sfxCfg(); if (c) c.keys.forEach(load); };
  // 🎵 배경음: 성채 · 허수아비에서만 · 작게 · 소리 끄기 · 화면 숨김이면 멈춤
  let bgmEl = null, bgmKey = null;
  // 🎵 배경음 없앰 (2026-11-09 선생님 「안 어울려 · 효과음은 놔두고 다 지워」): 부르는 곳은 그대로 두고 아무것도 틀지 않음 (틀던 것은 멈춤)
  function bgm(k) {
    if (bgmEl) { bgmEl.pause(); bgmEl = null; } bgmKey = null; return; // eslint-disable-line no-unreachable
    if (typeof Audio === 'undefined') return;
    if (bgmKey === k && bgmEl) { if (!bgmOff && bgmEl.paused && !document.hidden) bgmEl.play().catch(() => {}); return; }
    if (bgmEl) { bgmEl.pause(); bgmEl = null; } bgmKey = k || null;
    const u = k && sfxUrl(k); if (!u) return;
    bgmEl = new Audio(u); bgmEl.loop = true; bgmEl.volume = vol === 'low' ? 0.08 : 0.16;
    if (!bgmOff && !document.hidden) bgmEl.play().catch(() => {});
  }
  // 첫 터치 때 소리 장치를 깨우고 녹음 소리를 미리 받음 (0.5MB 안쪽 · 배경음은 성채 · 허수아비에서만)
  if (typeof document !== 'undefined') document.addEventListener('pointerdown', () => { ensure(); preload(); }, { once: true, capture: true });
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (!bgmEl) return; if (document.hidden) bgmEl.pause(); else if (!bgmOff) bgmEl.play().catch(() => {}); });
  // 공격 계열 → 맞는 소리
  const FAM_SFX = { cut: 'cut', smash: 'smash', sweep: 'sweep', wind: 'wind', fire: 'fire', spark: 'spark', frost: 'frost', star: 'star', magic: 'magic', math: 'magic' };

  return {
    unlock() { const c = ensure(); preload(); return c; },
    toggle() { const off = !(sfxOff && bgmOff); this.setSfx(!off); this.setBgm(!off); return off; },
    // 🔇 효과음 · 배경음 따로 (on = 켜기) · keep = false 면 이 기기에 저장 안 함 (교사 리모컨이 종합실을 바꿀 때)
    setSfx(on, keep = true) { sfxOff = !on; if (keep) LS('ds-sfx-off', sfxOff); changed(); },
    setBgm(on, keep = true) { bgmOff = !on; if (keep) LS('ds-bgm-off', bgmOff); if (bgmEl) { if (bgmOff) bgmEl.pause(); else if (!document.hidden) bgmEl.play().catch(() => {}); } changed(); },
    setVol(v, keep = true) { vol = v === 'low' ? 'low' : 'mid'; if (master) master.gain.value = VOL[vol]; if (bgmEl) bgmEl.volume = vol === 'low' ? 0.08 : 0.16; if (keep) { try { localStorage.setItem('ds-vol', vol); } catch (e) { /* 무시 */ } } changed(); },
    get vol() { return vol; },
    // 🔇 / 작게 / 보통 한 번에 (종합실 구석 · 리모컨)
    setLevel(l, keep = true) { if (l === 'off') { this.setSfx(false, keep); this.setBgm(false, keep); return; } this.setVol(l, keep); this.setSfx(true, keep); this.setBgm(true, keep); },
    get level() { return sfxOff ? 'off' : vol; }, // 🎵 배경음 없음 → 효과음만으로
    get sfxOn() { return !sfxOff; },
    get bgmOn() { return !bgmOff; },
    onChange(f) { listeners.push(f); },
    sample, preload, bgm,
    // ⚔ 공격 소리 (attack.js): 휘두름 · 발사 · 맞음(이펙트 계열) · 막힘 · 처치
    swing() { sample('swing', 0.6, () => noise({ dur: 0.25, vol: 0.25, freq: 600, sweepTo: 3500, q: 0.8 })); },
    launch() { sample('launch', 0.6, () => noise({ dur: 0.2, vol: 0.2, freq: 1500, sweepTo: 5000, q: 1 })); },
    fxHit(kind) { const f = window.DS && DS.FX && DS.FX.famOf ? DS.FX.famOf(kind) : null; const k = f ? FAM_SFX[f.id] : 'special'; sample(k, 0.85, () => { noise({ dur: 0.12, vol: 0.4, freq: 900, type: 'lowpass' }); tone({ type: 'square', f0: 170, f1: 60, dur: 0.12, vol: 0.18 }); }); },
    finish() { sample('finish', 0.95, () => { noise({ dur: 0.45, vol: 0.5, freq: 4500, sweepTo: 400 }); tone({ type: 'sine', f0: 75, f1: 30, dur: 0.45, vol: 0.6 }); }); },
    coin() { sample('coin', 0.7, () => tone({ type: 'square', f0: 1320, f1: 1980, dur: 0.12, vol: 0.08 })); },
    levelup() { sample('levelup', 0.85, () => [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.45, vol: 0.18, delay: i * 0.12 }))); },
    get muted() { return sfxOff; },

    card() { noise({ dur: 0.06, vol: 0.15, freq: 5000 }); },
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
    hurt() { tone({ type: 'square', f0: 300, f1: 90, dur: 0.2, vol: 0.15 }); },
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
