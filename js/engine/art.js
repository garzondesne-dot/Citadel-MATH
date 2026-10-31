// 에셋 배치표(DS.ASSETS)로 그림 칸을 HTML 로 그린다. 코드는 파일 이름을 직접 쓰지 않는다.
window.DS = window.DS || {};
DS.Art = (function () {
  const A = () => DS.ASSETS;
  const pos = (col, cols, row, rows) => `${cols > 1 ? (100 * col) / (cols - 1) : 0}% ${rows > 1 ? (100 * row) / (rows - 1) : 0}%`;
  function cell(sheet, col, row, cls = '') {
    const s = A()[sheet];
    return `<i class="art ${sheet} ${cls}" style="background-image:url('${A().base}${s.src}');background-size:${s.cols * 100}% ${s.rows * 100}%;background-position:${pos(col, s.cols, row, s.rows)}"></i>`;
  }
  const hero = (n, pose = 'idle', cls = '') => cell('heroes', A().heroes.poses[pose] || 0, ((n % A().heroes.count) + A().heroes.count) % A().heroes.count, `hero ${cls}`);
  const monster = (n, pose = 'idle', cls = '') => cell('monsters', A().monsters.poses[pose] || 0, n % A().monsters.rows, `monster ${cls}`);
  const card = (art, cls = '') => cell('cards', art % A().cards.cols, Math.floor(art / A().cards.cols) % A().cards.rows, `card-art ${cls}`);
  function css() { // 글꼴·프레임·배경을 배치표에서
    const a = A();
    return `@font-face{font-family:'Galmuri11';src:url('${a.fonts.pixel}') format('woff2');font-display:swap}
@font-face{font-family:'Galmuri11';font-weight:700;src:url('${a.fonts.pixelBold}') format('woff2');font-display:swap}
.framed{border:14px solid transparent;border-image:url('${a.base}${a.frame.src}') ${a.frame.slice} / 14px stretch}
.bg-dungeon{background-image:linear-gradient(#0a1424aa,#0a1424ee),url('${a.base}${a.background.src}');background-size:cover;background-position:center}`;
  }
  function install() { const s = document.createElement('style'); s.textContent = css(); document.head.appendChild(s); }
  return { cell, hero, monster, card, install, pos };
})();
