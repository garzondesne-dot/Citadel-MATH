// 테스트용: 브라우저 스크립트를 순서대로 불러 DS 를 돌려준다 (ES 모듈이 아니므로 vm 으로)
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function load(files) {
  const store = {};
  const ctx = vm.createContext({ console, localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } } });
  ctx.window = ctx;
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
  return ctx.DS;
};
