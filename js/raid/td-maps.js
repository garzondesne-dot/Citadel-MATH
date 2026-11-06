// 🏰 5분 타워 디펜스 지도 5종 (2026-11-07 사용자 「여러 번 할 테니 다른 컨셉 맵 5개」 · 시안 단계)
//   좌표 = 16 × 9 칸 (교실 TV 1920×1080 → 1칸 120px) · paths = 몬스터가 걷는 길(여러 개면 입구 여러 개) · 끝 = 성
//   자리 24칸은 길 옆에서 저절로 뽑고, 사거리 2칸 안에 길이 가장 많이 들어오는 6칸 = ★ 명당 (꺾인 곳 · 갈림길)
//   tile = 그 지도에서 특기가 +20% 되는 계열 (지형 보너스 · 전략용)
window.DS = window.DS || {};

DS.TDMaps = (function () {
  const MAPS = [
    { id: 'forest', name: '🌲 초록 숲길', desc: '기본 S자 길 · 꺾인 곳 명당이 고르게', theme: { bg: ['#1f4a2a', '#2f6b3a'], path: '#b08a52', edge: '#6b4f2a', deco: '🌲', deco2: '🍄' }, tile: 'wind',
      paths: [[[0, 1.5], [12.43, 1.5], [12.43, 4.41], [3.26, 4.41], [3.26, 7.37], [15.2, 7.37]]] }, // 2026-11-06 그림(td-forest-v1)의 길 가운데에 맞춤
    { id: 'volcano', name: '🌋 용암 두 갈래', desc: '가운데서 길이 둘로 갈라졌다 다시 만남 · 나눠 지켜야 함', theme: { bg: ['#3a1410', '#5a2014'], path: '#3a2a26', edge: '#ff6a1a', deco: '🔥', deco2: '🪨' }, tile: 'fire',
      paths: [[[0, 4.5], [4, 4.5], [5.5, 1.6], [10.5, 1.6], [12, 4.5], [15.2, 4.5]], [[0, 4.5], [4, 4.5], [5.5, 7.4], [10.5, 7.4], [12, 4.5], [15.2, 4.5]]] },
    { id: 'ice', name: '❄ 얼음 소용돌이', desc: '나선을 따라 가운데 성으로 · 가운데 칸은 여러 바퀴를 때림', theme: { bg: ['#14304a', '#1f4a6b'], path: '#cfe8f7', edge: '#7fb8e0', deco: '❄', deco2: '🧊' }, tile: 'frost',
      paths: [[[0, 0.8], [15, 0.8], [15, 8.2], [1, 8.2], [1, 2.6], [13, 2.6], [13, 6.4], [3, 6.4], [3, 4.5], [8, 4.5]]] },
    { id: 'desert', name: '🏜 사막 지그재그', desc: '긴 직선이 위아래로 · 원거리가 유리', theme: { bg: ['#6b5320', '#8a6f2e'], path: '#e8cf8a', edge: '#a8843c', deco: '🌵', deco2: '🦴' }, tile: 'spark',
      paths: [[[0.8, 0], [0.8, 7.8], [4.6, 7.8], [4.6, 1.2], [8.4, 1.2], [8.4, 7.8], [12.2, 7.8], [12.2, 1.2], [15.2, 1.2]]] },
    { id: 'crypt', name: '🌙 묘지 두 입구', desc: '왼쪽 · 위쪽 두 입구 → 가운데 십자로에서 만남 · 입구 나눠 맡기', theme: { bg: ['#1c1530', '#2a2048'], path: '#6b6680', edge: '#a89cff', deco: '🪦', deco2: '🕯' }, tile: 'magic',
      paths: [[[0, 2], [6, 2], [8, 4.5], [8, 6], [15.2, 6]], [[11, 0], [11, 3], [8, 4.5], [8, 6], [15.2, 6]]] },
  ];
  const W = 16, H = 9, SLOTS = 24, STARS = 6, RANGE = 2;
  const segs = (m) => m.paths.flatMap((p) => p.slice(1).map((b, i) => [p[i], b]));
  function dSeg(px, py, [a, b]) { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / L2)); return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy)); }
  const dPath = (m, x, y) => Math.min(...segs(m).map((s) => dSeg(x, y, s)));
  // 사거리 안에 들어오는 길 길이 (0.1칸 단위로 샘)
  function cover(m, x, y, r = RANGE) { let n = 0; segs(m).forEach(([a, b]) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.round(L / 0.1)); for (let i = 0; i <= k; i++) { const t = i / k; if (Math.hypot(x - (a[0] + t * (b[0] - a[0])), y - (a[1] + t * (b[1] - a[1]))) <= r) n++; } }); return n / 10; }
  // 자리로 못 쓰는 곳 (2026-11-06 지도 그림): 가운데 위 글자 상자(HUD · 가로 3.6~12.4칸 · 세로 1.1칸 위) · 성 그림 둘레 · 입구(🌀) 그림 둘레
  const HUD = [3.6, 12.4, 1.1];
  const blocked = (x, y, ex, ey, st) => (x > HUD[0] && x < HUD[1] && y < HUD[2]) || (Math.abs(x - ex) < 1.1 && y > ey - 1.6 && y < ey + 0.9)
    || st.some(([sx, sy]) => Math.abs(x - Math.max(0.5, Math.min(W - 0.5, sx))) < 1.0 && Math.abs(y - Math.max(0.5, Math.min(H - 0.5, sy))) < 1.15);
  // 자리 뽑기: 0.5칸 격자 중 길에서 0.75~1.25칸 · 서로 1칸 이상 · 길을 많이 덮는 곳부터
  function slots(m) {
    if (m._slots) return m._slots;
    const cand = [];
    const [ex, ey] = end(m), st = starts(m);
    for (let x = 0.5; x <= W - 0.5; x += 0.5) for (let y = 0.5; y <= H - 0.5; y += 0.5) { const d = dPath(m, x, y); if (d >= 0.75 && d <= 1.25 && !blocked(x, y, ex, ey, st)) cand.push({ x, y, c: cover(m, x, y) }); }
    cand.sort((a, b) => b.c - a.c || a.x - b.x || a.y - b.y);
    const out = [];
    // 고르게 퍼지도록: 먼저 덮는 양이 많은 순으로 뽑되 서로 1.1칸 이상
    for (const p of cand) { if (out.length >= SLOTS) break; if (out.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= 1.0)) out.push(p); }
    out.sort((a, b) => b.c - a.c); out.forEach((p, i) => { p.star = i < STARS; });
    out.sort((a, b) => a.y - b.y || a.x - b.x); out.forEach((p, i) => { p.no = i + 1; });
    m._slots = out; return out;
  }
  const end = (m) => { const p = m.paths[0]; return p[p.length - 1]; };
  const starts = (m) => m.paths.map((p) => p[0]).filter((s, i, a) => a.findIndex((t) => t[0] === s[0] && t[1] === s[1]) === i);
  const pathLen = (p) => p.slice(1).reduce((a, b, i) => a + Math.hypot(b[0] - p[i][0], b[1] - p[i][1]), 0);
  return { MAPS, W, H, SLOTS, STARS, RANGE, slots, cover, dPath, end, starts, pathLen, get: (id) => MAPS.find((m) => m.id === id) };
})();
