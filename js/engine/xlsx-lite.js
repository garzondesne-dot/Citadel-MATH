// 아주 작은 엑셀(.xlsx) 읽기 도구 — 외부 라이브러리 없이 브라우저 기능(DecompressionStream · DOMParser)만 쓴다.
// read(ArrayBuffer) → { 시트이름: [[칸, 칸, …], …] } (글자 · 숫자를 모두 문자열로). 수식은 계산된 값만 읽는다.
window.DS = window.DS || {};

DS.Xlsx = (function () {
  const td = new TextDecoder('utf-8');
  // zip 목록 읽기 (중앙 디렉터리)
  function entries(buf) {
    const v = new DataView(buf), u8 = new Uint8Array(buf);
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('엑셀(.xlsx) 파일이 아니거나 손상됐어요.');
    const n = v.getUint16(eocd + 10, true); let p = v.getUint32(eocd + 16, true);
    const out = {};
    for (let k = 0; k < n; k++) {
      const method = v.getUint16(p + 10, true), size = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), off = v.getUint32(p + 42, true);
      const name = td.decode(u8.subarray(p + 46, p + 46 + nl));
      out[name] = { method, size, off };
      p += 46 + nl + xl + cl;
    }
    return { out, v, u8 };
  }
  async function file(z, name) {
    const e = z.out[name]; if (!e) return null;
    const ln = z.v.getUint16(e.off + 26, true), lx = z.v.getUint16(e.off + 28, true), start = e.off + 30 + ln + lx;
    const raw = z.u8.subarray(start, start + e.size);
    if (e.method === 0) return td.decode(raw);
    const ds = new DecompressionStream('deflate-raw');
    const res = new Response(new Blob([raw]).stream().pipeThrough(ds));
    return td.decode(await res.arrayBuffer());
  }
  const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
  const col = (ref) => { const m = /^([A-Z]+)/.exec(ref); let n = 0; for (const ch of m[1]) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
  async function read(buf) {
    if (typeof DecompressionStream === 'undefined') throw new Error('이 브라우저는 엑셀 읽기를 지원하지 않아요. PC 크롬에서 열어 주세요.');
    const z = entries(buf);
    const ss = await file(z, 'xl/sharedStrings.xml');
    const strings = ss ? [...xml(ss).getElementsByTagName('si')].map((si) => [...si.getElementsByTagName('t')].map((t) => t.textContent).join('')) : [];
    const wb = xml(await file(z, 'xl/workbook.xml')), rels = xml(await file(z, 'xl/_rels/workbook.xml.rels'));
    const target = {};
    [...rels.getElementsByTagName('Relationship')].forEach((r) => { target[r.getAttribute('Id')] = r.getAttribute('Target').replace(/^\/?xl\//, '').replace(/^\//, ''); });
    const result = {};
    for (const sh of wb.getElementsByTagName('sheet')) {
      const rid = sh.getAttribute('r:id') || sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      const doc = await file(z, 'xl/' + target[rid]); if (!doc) continue;
      const rows = [];
      for (const r of xml(doc).getElementsByTagName('row')) {
        const ri = Number(r.getAttribute('r')) - 1, row = [];
        for (const c of r.getElementsByTagName('c')) {
          const t = c.getAttribute('t'), vEl = c.getElementsByTagName('v')[0];
          let val = '';
          if (t === 's') val = strings[Number(vEl ? vEl.textContent : -1)] || '';
          else if (t === 'inlineStr') val = [...c.getElementsByTagName('t')].map((x) => x.textContent).join('');
          else if (vEl) val = vEl.textContent;
          row[col(c.getAttribute('r'))] = val;
        }
        rows[ri] = Array.from(row, (x) => (x == null ? '' : String(x)));
      }
      result[sh.getAttribute('name')] = Array.from(rows, (x) => x || []);
    }
    return result;
  }
  return { read };
})();
