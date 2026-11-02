const fs = require('fs'), { PNG } = require('pngjs'), jsQR = require('jsqr');
const png = PNG.sync.read(fs.readFileSync(process.argv[2]));
const r = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
console.log('decoded:', r ? r.data : 'FAILED');
