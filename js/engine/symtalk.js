// 📖 기호 톡 (2026-11-10 #54 · 문구 원본 = docs/SYMBOL-TALK.md · 문구는 그 파일 그대로)
//   학생 폰 문제 화면의 연산 기호를 톡 → 기호 바로 위 말풍선: ① 정확한 뜻(굵게) ② 💬 쉽게 말하면(기울임 · 옅은 다른 색) ③ 더 보기 = 기억 고리(작게)
//   바깥을 누르거나 4초 뒤 닫힘 (더 보기를 펼치면 닫을 때까지) · 누를 수 있는 기호 = 옅은 점선 밑줄
//   어디서: #st-body(수업 몬스터 · 소레이드 · 한 판 더 · 형성평가 · ✍ 쓰기) · #quiz(성채 · 허수아비 문제 창) · .bn-fight(성채 나의 풀이) — 화면을 다시 그려도 저절로 다시 표시 (MutationObserver · 화면 코드는 손대지 않음 · paint() 스크롤 · 입력 그대로)
//   기록: xp/{반}/{번호}/st/{차시}/{기호} = 누른 횟수 (자기 칸 · 규칙 변경 없음 · 테스트 계정은 안 셈) → 대시보드 「📖 기호 톡」
window.DS = window.DS || {};

DS.SymTalk = (function () {
  // 기호 · ① 쉬운 한 줄 · ② 읽는 법 · 교과서 정의 · ③ 기억 고리 (SYMBOL-TALK.md 집합 단원 16줄 그대로 · ③ 「—」 = 없음)
  const ROWS = [
    { id: 'in', sym: 'a ∈ A', easy: 'a 는 A 팀 소속!', def: '「a 는 집합 A 에 속한다」 · a 가 집합 A 의 원소일 때', memo: '∈ = 원소(element)의 e 를 바꾼 기호 · 왼쪽 = 원소, 오른쪽 = 집합' },
    { id: 'notin', sym: 'b ∉ A', easy: 'b 는 A 팀 소속이 아니다', def: '「b 는 집합 A 에 속하지 않는다」 · b 가 A 의 원소가 아닐 때', memo: '' },
    { id: 'list', sym: '{1, 2, 4, 8}', easy: '원소를 하나하나 다 적기 (원소나열법)', def: '집합에 속하는 모든 원소를 { } 안에 나열', memo: '순서는 상관없음 · 같은 원소는 한 번만' },
    { id: 'build', sym: '{x | 조건}', easy: '{ 누구 | 어떤 애들 } · 조건에 맞는 x 를 다 모은 것 (조건제시법)', def: '원소들이 갖는 공통된 성질을 조건으로 제시 · x = 원소를 대표하는 문자', memo: '| 는 「그중에서 이런 것」이라고 읽으면 쉬움' },
    { id: 'n', sym: 'n(A)', easy: 'A 안에 원소가 몇 개?', def: '유한집합 A 의 원소의 개수', memo: 'n = 개수(number)의 첫 글자 · 예 n({1, 2, 4, 8}) = 4' },
    { id: 'empty', sym: '∅', easy: '텅 빈 집합 (원소 0개)', def: '원소가 하나도 없는 집합 = 공집합', memo: 'n(∅) = 0 · {0} 은 0 이 들어 있으니 공집합 아님' },
    { id: 'sub', sym: 'A ⊂ B', easy: 'A 가 B 안에 쏙 들어간다 (A 의 원소는 모두 B 에도 있다)', def: 'A 의 모든 원소가 B 에 속할 때 A 는 B 의 부분집합 · 「A 는 B 에 포함된다」', memo: '자기 자신도 부분집합(A ⊂ A) · ∅ 은 모든 집합의 부분집합 · 원소 n 개 → 부분집합 2ⁿ 개' },
    { id: 'nsub', sym: 'A ⊄ B', easy: 'A 에 B 밖으로 삐져나온 원소가 있다', def: 'A 가 B 의 부분집합이 아닐 때', memo: '하나만 삐져나와도 ⊄' },
    { id: 'eq', sym: 'A = B', easy: '원소가 똑같은 두 집합', def: 'A ⊂ B 이고 B ⊂ A 일 때 서로 같다', memo: '순서가 달라도 같은 집합' },
    { id: 'cap', sym: 'A ∩ B', easy: 'A 와 B 가 겹친 곳 (둘 다 있는 원소)', def: 'A 에도 속하고 B 에도 속하는 모든 원소로 이루어진 집합 = 교집합', memo: '「그리고」 · 모양이 아래로 열린 ∩ = 좁아진다' },
    { id: 'cup', sym: 'A ∪ B', easy: 'A 와 B 를 합친 것 (겹친 건 한 번만)', def: 'A 에 속하거나 B 에 속하는 모든 원소로 이루어진 집합 = 합집합', memo: '「또는」 · 위로 열린 ∪ = 담는 그릇' },
    { id: 'disj', sym: 'A ∩ B = ∅', easy: 'A 와 B 는 하나도 안 겹친다 (서로소)', def: '공통인 원소가 하나도 없을 때 A 와 B 는 서로소', memo: '서로소면 n(A ∪ B) = n(A) + n(B)' },
    { id: 'ncup', sym: 'n(A ∪ B)', easy: '합친 개수 = 더하고, 겹친 만큼 한 번 빼기', def: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)', memo: '겹친 곳을 두 번 세지 않게' },
    { id: 'U', sym: 'U', easy: '지금 다루는 원소 전부 (전체집합)', def: '부분집합을 생각할 때 처음의 집합', memo: 'U = universal set 의 첫 글자' },
    { id: 'compl', sym: 'Aᶜ', easy: 'U 안에서 A 밖에 있는 것 전부 (여집합)', def: 'U 의 원소 중 A 에 속하지 않는 모든 원소로 이루어진 집합', memo: 'C = complement 의 첫 글자 · Aᶜ = U − A · 「A 가 아니다」' },
    { id: 'diff', sym: 'A − B', easy: 'A 에서 B 를 빼고 남은 것 (A 쪽만)', def: 'A 에 속하지만 B 에는 속하지 않는 모든 원소로 이루어진 집합 = A 에 대한 B 의 차집합', memo: 'A − B ≠ B − A · A − B = A ∩ Bᶜ' },
  ];
  const BY = Object.fromEntries(ROWS.map((r) => [r.id, r]));
  const esc = (s) => (DS.UI ? DS.UI.esc(s) : String(s));
  const pretty = (s) => (DS.UI ? DS.UI.pretty(s) : esc(s));

  // ── 문맥으로 기호 고르기 (#54 「A ∩ B = ∅ → 서로소 · n(A ∪ B) → 개수 공식 · Aᶜ → 여집합 · A − B → 차집합 · a ∈ A → 속한다」) ──
  //   text = 그 기호가 들어 있는 줄 전체(보이는 글자) · i = 기호 자리 → 기호 id (null = 누를 수 없음)
  const SETR = /[A-ZU)ᶜ}∅]$/; // 집합 쪽 끝 (대문자 · 괄호 · ᶜ · } · ∅)
  const before = (t, i) => t.slice(0, i).replace(/\s+$/, ''), after = (t, i, n = 1) => t.slice(i + n).replace(/^\s+/, '');
  const inNum = (t, i) => /n\(\s*[^()]*$/.test(t.slice(0, i)); // n( … 안
  const isDisj = (t, i) => { // A ∩ B = ∅ 한 덩어리 안
    const m = /[A-Z](?:ᶜ)?\s*∩\s*[A-Z](?:ᶜ)?\s*=\s*∅/g; let x;
    while ((x = m.exec(t))) { if (i >= x.index && i < x.index + x[0].length) return true; }
    return false;
  };
  const setLeft = (t, i) => { const b = before(t, i); if (!SETR.test(b)) return false; if (/\)$/.test(b)) { const k = b.lastIndexOf('('); if (k > 0 && /n$/.test(b.slice(0, k).replace(/\s+$/, ''))) return false; } return true; }; // 왼쪽이 집합 (n(…) 은 수)
  const setRight = (t, i, n = 1) => /^[A-Z(∅{]/.test(after(t, i, n)) && !/^n\(/.test(after(t, i, n));
  function pick(t, i) {
    const c = t[i];
    if (c === '∈') return 'in';
    if (c === '∉') return 'notin';
    if (c === '⊂') return 'sub';
    if (c === '⊄') return 'nsub';
    if (c === '∅') return isDisj(t, i) ? 'disj' : 'empty';
    if (c === '∩') return isDisj(t, i) ? 'disj' : 'cap';
    if (c === '∪') return inNum(t, i) ? 'ncup' : 'cup';
    if (c === 'ᶜ') return 'compl';
    if (c === '=') { if (isDisj(t, i)) return 'disj'; return setLeft(t, i) && !inNum(t, i) && setRight(t, i) && !/^\{[^}]*\|/.test(after(t, i)) ? 'eq' : null; }
    if (c === '−') return setLeft(t, i) && setRight(t, i) && !inNum(t, i) ? 'diff' : null;
    if (c === 'U') return /[A-Za-z가-힣]/.test(t[i - 1] || '') || /[A-Za-z]/.test(t[i + 1] || '') ? null : 'U';
    if (c === 'n' && t[i + 1] === '(' && !/[A-Za-z]/.test(t[i - 1] || '')) { const close = t.indexOf(')', i); return /∪/.test(t.slice(i, close < 0 ? undefined : close)) ? 'ncup' : 'n'; }
    if (c === '{') { const close = t.indexOf('}', i), inner = t.slice(i + 1, close < 0 ? undefined : close); if (/\|/.test(inner)) return 'build'; return /,/.test(inner) || /^\s*[0-9a-z]/.test(inner) ? 'list' : null; }
    if (c === '|') { const o = t.lastIndexOf('{', i), cl = t.lastIndexOf('}', i); return o > cl ? 'build' : null; }
    return null;
  }
  const CH = /[∈∉⊂⊄∅∩∪=−U{|]|n(?=\()/g;

  // ── 표시 (화면에 그린 뒤 텍스트에 점선 밑줄 칸을 씌움) ──
  const ROOTS = '#st-body .paper, #st-body .cr-story, #st-body .cr-prob, #st-body .cr-why, #st-body .items, #st-body .st-res, #quiz-q, #quiz-choices, .bn-fight .cr-story, .bn-fight .bf-body > p';
  const SKIP = 'button.btn, .sym-t, svg, input, textarea, .sheet-tag, .q-no, .item-no, small, .muted';
  const lineOf = (el) => { const blk = el.closest('li, p, .item-q, .choice, .why-q, .bl-q, .mark, summary, div') || el.parentElement; return blk; };
  function textOf(blk) { // 보이는 글자 · ᶜ 위첨자(<sup class="cpl">C</sup>)는 ᶜ 한 글자로
    let s = ''; const map = []; // map[k] = { node, off } (ᶜ 는 { sup })
    const walk = (n) => {
      if (n.nodeType === 3) { for (let k = 0; k < n.data.length; k++) { map.push({ node: n, off: k }); } s += n.data; return; }
      if (n.nodeType !== 1) return;
      if (n.matches && n.matches('sup.cpl')) { map.push({ sup: n }); s += 'ᶜ'; return; }
      n.childNodes.forEach(walk);
    };
    walk(blk); return { s, map };
  }
  function markEl(root) {
    if (!root || root.dataset.stDone === root.innerHTML.length + '') return;
    const blocks = new Set();
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (/[∈∉⊂⊄∅∩∪=−U{|]|n\(/.test(n.data) && !(n.parentElement && n.parentElement.closest(SKIP)) ? 1 : 3) });
    let n; while ((n = tw.nextNode())) blocks.add(lineOf(n.parentElement));
    root.querySelectorAll('sup.cpl').forEach((sp) => { if (!sp.closest('.sym-t')) blocks.add(lineOf(sp)); });
    blocks.forEach((blk) => {
      if (!blk || !root.contains(blk)) return;
      const { s, map } = textOf(blk), hits = [];
      CH.lastIndex = 0; let m; while ((m = CH.exec(s))) { const id = pick(s, m.index); if (id) hits.push({ i: m.index, len: m[0] === 'n' ? 1 : 1, id }); }
      for (let k = 0; k < s.length; k++) if (s[k] === 'ᶜ' && map[k] && map[k].sup) hits.push({ i: k, id: 'compl' });
      hits.sort((a, b) => b.i - a.i).forEach((h) => { // 뒤에서부터 (앞 자리 그대로)
        const at = map[h.i]; if (!at) return;
        if (at.sup) { if (at.sup.closest('.sym-t') || at.sup.closest(SKIP)) return; const w = document.createElement('span'); w.className = 'sym-t'; w.dataset.st = h.id; at.sup.replaceWith(w); w.appendChild(at.sup); return; }
        if (!at.node.parentNode || (at.node.parentElement && at.node.parentElement.closest(SKIP))) return;
        const tail = at.node.splitText(at.off), rest = tail.splitText(1), w = document.createElement('span'); w.className = 'sym-t'; w.dataset.st = h.id;
        tail.replaceWith(w); w.appendChild(tail); void rest;
      });
    });
    root.dataset.stDone = root.innerHTML.length + '';
  }
  let busy = false;
  function scan() { if (busy || !on()) return; busy = true; try { document.querySelectorAll(ROOTS).forEach(markEl); } finally { busy = false; } }
  const on = () => !document.body.classList.contains('st-off');

  // ── 말풍선 ──
  let bub = null, timer = 0;
  function close() { if (bub) { bub.remove(); bub = null; } clearTimeout(timer); }
  function open(el) {
    close(); const r = BY[el.dataset.st]; if (!r) return;
    bub = document.createElement('div'); bub.className = 'st-bub'; bub.setAttribute('role', 'tooltip');
    bub.innerHTML = `<b class="st-def"><span class="st-sym">${pretty(r.sym)}</span> ${pretty(r.def)}</b><i class="st-easy">💬 쉽게 말하면 ${pretty(r.easy)}</i>${r.memo ? `<button class="st-more" type="button">더 보기 ▾</button><small class="st-memo" hidden>${pretty(r.memo)}</small>` : ''}`;
    document.body.appendChild(bub);
    const a = el.getBoundingClientRect(), bw = Math.min(320, window.innerWidth - 16);
    bub.style.width = `${bw}px`;
    const x = Math.max(8, Math.min(window.innerWidth - bw - 8, a.left + a.width / 2 - bw / 2)), h = bub.offsetHeight;
    const up = a.top - h - 10 >= 4; bub.style.left = `${x}px`; bub.style.top = `${up ? a.top - h - 10 : a.bottom + 10}px`; bub.classList.add(up ? 'up' : 'down');
    bub.style.setProperty('--ax', `${Math.round(a.left + a.width / 2 - x)}px`);
    const mb = bub.querySelector('.st-more'); if (mb) mb.onclick = (e) => { e.stopPropagation(); const mm = bub.querySelector('.st-memo'); mm.hidden = false; mb.remove(); clearTimeout(timer); }; // 펼치면 닫을 때까지
    timer = setTimeout(close, 4000);
    count(r.id);
  }
  // 눌렀을 때: 기호 칸이면 말풍선 (보기 단추 안이어도 고르기는 안 함) · 말풍선 안은 그대로 · 바깥 = 닫기
  function onTap(e) {
    const t = e.target, s = t && t.closest && t.closest('.sym-t');
    if (bub && t && bub.contains(t)) return;
    if (s && on()) { e.preventDefault(); e.stopPropagation(); open(s); return; }
    if (bub) close();
  }

  // ── 기록 ──
  let ctx = null; // { m: 계정 { c, n, test }, lesson }
  const setCtx = (m, lesson) => { ctx = m && lesson ? { m, lesson } : null; };
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const pend = {}; let ptimer = 0;
  function count(id) {
    const c = ctx; if (!c || !c.m || c.m.c == null || !c.m.n || c.m.test || c.m.teacher || !DS.Net) return;
    const p = `xp/${ck(c.m.c)}/${c.m.n}/st/${ck(c.lesson)}/${id}`; pend[p] = (pend[p] || 0) + 1;
    clearTimeout(ptimer); ptimer = setTimeout(flush, 1500); // 모아서 한 번에 (가벼움)
  }
  async function flush() {
    const ps = Object.keys(pend); for (const p of ps) { const add = pend[p]; delete pend[p]; try { const cur = Number(await DS.Net.get(p)) || 0; await DS.Net.set(p, cur + add); } catch (e) { /* 기록은 덤 */ } }
  }

  // 대시보드: xp/{반} → [{ id, sym, n, who }] 많이 누른 순 (lesson = 차시 거르기 · 없으면 모두)
  function rank(xpByNum, lesson) {
    const agg = {};
    Object.values(xpByNum || {}).forEach((x) => { const st = (x || {}).st || {}; Object.entries(st).forEach(([lid, bySym]) => { if (lesson && lid !== lesson) return; Object.entries(bySym || {}).forEach(([id, n]) => { const a = (agg[id] = agg[id] || { n: 0, who: 0 }); a.n += Number(n) || 0; a.who += 1; }); }); });
    return Object.entries(agg).filter(([id]) => BY[id]).map(([id, a]) => ({ id, sym: BY[id].sym, easy: BY[id].easy, n: a.n, who: a.who })).sort((a, b) => b.n - a.n);
  }

  function start() {
    if (typeof document === 'undefined' || start.done) return; start.done = true;
    document.addEventListener('click', onTap, true);
    window.addEventListener('scroll', () => { if (bub) close(); }, true);
    let raf = 0; const mo = new MutationObserver(() => { if (busy || raf) return; raf = requestAnimationFrame(() => { raf = 0; scan(); }); });
    mo.observe(document.body, { childList: true, subtree: true });
    scan();
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start(); }
  return { ROWS, BY, pick, setCtx, rank, scan, close, flush, _markEl: markEl };
})();
