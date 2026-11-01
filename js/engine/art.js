// 에셋 배치표(DS.ASSETS)로 그림 칸을 HTML 로 그린다. 코드는 파일 이름을 직접 쓰지 않는다.
window.DS = window.DS || {};
DS.Art = (function () {
  const A = () => DS.ASSETS;
  const pos = (col, cols, row, rows) => `${cols > 1 ? (100 * col) / (cols - 1) : 0}% ${rows > 1 ? (100 * row) / (rows - 1) : 0}%`;
  function cell(sheet, col, row, cls = '') {
    const s = A()[sheet];
    return `<i class="art ${sheet} ${cls}" style="background-image:url('${A().base}${s.src}');background-size:${s.cols * 100}% ${s.rows * 100}%;background-position:${pos(col, s.cols, row, s.rows)}"></i>`;
  }
  // 용사 번호: 0~7 기본 시트(7 = 선생님) · 8~15 추가 용사(heroesExtra, 잠금 해제 특전)
  const hero = (n, pose = 'idle', cls = '') => {
    n = Number(n) || 0;
    if (n >= 8 && n < 16 && A().heroesExtra) return cell('heroesExtra', A().heroesExtra.poses[pose] || 0, n - 8, `hero ${cls}`);
    return cell('heroes', A().heroes.poses[pose] || 0, ((n % A().heroes.count) + A().heroes.count) % A().heroes.count, `hero ${cls}`);
  };
  // n = 숫자(기본 시트) 또는 'extra:3' · 'new:5' · 'crown:7' (추가 시트)
  const SHEETS = { extra: 'monstersExtra', new: 'monstersNew', crown: 'monstersCrown' };
  function monster(n, pose = 'idle', cls = '') {
    const [k, i] = typeof n === 'string' && n.includes(':') ? n.split(':') : [null, n];
    const sheet = SHEETS[k] || 'monsters', s = A()[sheet];
    const row = Number(i) % s.rows;
    // 오른쪽을 보고 그려진 몬스터는 좌우를 뒤집어 왼쪽(용사 쪽)을 보게 한다 (배치표 flip)
    return cell(sheet, s.poses[pose] || 0, row, `monster${(s.flip || []).includes(row) ? ' flip' : ''} ${cls}`);
  }
  const card = (art, cls = '') => cell('cards', art % A().cards.cols, Math.floor(art / A().cards.cols) % A().cards.rows, `card-art ${cls}`);
  function css() { // 글꼴·프레임·배경을 배치표에서
    const a = A();
    return `@font-face{font-family:'Galmuri11';src:url('${a.fonts.pixel}') format('woff2');font-display:swap}
@font-face{font-family:'Galmuri11';font-weight:700;src:url('${a.fonts.pixelBold}') format('woff2');font-display:swap}
.framed{border:14px solid transparent;border-image:url('${a.base}${a.frame.src}') ${a.frame.slice} / 14px stretch}
.bg-dungeon{background-image:linear-gradient(#0a1424aa,#0a1424ee),url('${a.base}${a.background.src}');background-size:cover;background-position:center}
.bg-scene{background-image:linear-gradient(#0a142466,#0a142411 40%,#0a1424dd),url('${a.base}${(a.scene || a.background).src}');background-size:cover;background-position:center 65%}
${a.brand ? `.brand-head{background:url('${a.base}${a.brand.header}') center/contain no-repeat;aspect-ratio:3/1}
.splash{background-image:url('${a.base}${a.brand.title}')}
.menu-ic{background-image:url('${a.base}${a.brand.menu.src}');background-size:${a.brand.menu.cols * 100}% 100%}
${Object.entries(a.brand.menu.kinds).map(([k, i]) => `.menu-ic[data-ic="${k}"]{background-position:${(i / (a.brand.menu.cols - 1)) * 100}% 0}`).join('')}` : ''}
${(a.dungeons ? a.dungeons.ids : []).map((id) => `.bg-scene.th-${id}{background-image:linear-gradient(#0a142455,#0a142400 40%,#0a1424cc),url('${a.base}${a.dungeons.bg(id)}')}`).join('\n')}`;
  }
  function install() { const s = document.createElement('style'); s.textContent = css(); document.head.appendChild(s); }
  return { cell, hero, monster, card, install, pos };
})();
