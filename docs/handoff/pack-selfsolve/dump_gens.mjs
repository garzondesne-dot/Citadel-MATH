// 베타 저장소 2~10차시 생성기를 돌려 모든 판 문항 글을 뽑음 (읽기만)
import fs from 'fs';
const B = process.argv[2]; const OUT = process.argv[3];
const off = `${B}/src/subjects/common-math2/gens/official`;
const BASE = (await import(`${off}/shim.js`)).default;
const rows = [];
const add = (src, id, pass, q) => { if (!q) return; rows.push({ src, id, pass, type: q.type, q: q.question || '', ch: q.choices || q.options || (q.items ? q.items.map(i => `${i.left} □ ${i.right}`) : []), a: q.answer ?? q.answerIndex, say: q.say || '', prob: q.problem || '' }); };
for (const f of ['02','03','04','05','06','08','09','10']) {
  const L = (await import(`${off}/set-${f}.js`)).default;
  const R = (s) => BASE.Rng(s);
  for (const [mid, m] of Object.entries(L.monsters || {})) {
    for (let v = 0; v < 4; v++) for (let s = 1; s <= (v ? 6 : 1); s++) { try { (m.make(v, R(`t${s}|${mid}|${v}`)) || []).forEach((q, k) => add(`set-${f}`, `${mid}.${k}`, v, q)); } catch (e) { rows.push({ src:`set-${f}`, id: mid, err: String(e) }); } }
  }
  for (const id of (L.chain || [])) for (let p = 0; p < 4; p++) for (let s = 1; s <= (p ? 6 : 1); s++) { try { (L.chainItems(id, `t${s}`, p) || []).forEach((q, k) => add(`set-${f}`, `${id}.chain${k}`, p, q)); } catch (e) {} }
  if (L.c7) {}
  const b = L.boss; if (b) { for (const [k, set] of Object.entries(b.sets || {})) (set || []).forEach((q, i) => add(`set-${f}`, `boss.set${k}.${i}`, 0, q)); if (b.make) for (let i = 0; i < 8; i++) for (let a = 1; a < 4; a++) for (let s = 1; s <= 4; s++) { try { add(`set-${f}`, `boss.${i}`, a, b.make(i, a, R(`b${s}|${i}|${a}`))); } catch (e) {} } }
  // 7차시 같은 덧붙은 등록(set-06 안 C7 등)
  for (const k of Object.keys(L)) if (L[k] && typeof L[k] === 'object' && L[k].monsters && k !== 'monsters') console.error('extra', f, k);
}
fs.writeFileSync(OUT, JSON.stringify(rows, null, 0));
console.log(rows.length, 'rows');
