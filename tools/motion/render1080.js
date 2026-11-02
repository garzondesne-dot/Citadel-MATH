// 전체 렌더: node render.js 11 "(05차시) 11_....mp4"
const { chromium } = require('playwright'); const { spawn } = require('child_process');
require('fs').mkdirSync(__dirname + '/out', { recursive: true });
(async () => { const [v, name] = [process.argv[2], process.argv[3]]; const FPS = 30;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(`file://${__dirname}/index.html?v=${v}`); await p.waitForTimeout(500);
  const D = await p.evaluate(() => window.SCENE.D); const N = Math.round(D * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', `${__dirname}/out/${name}`]);
  ff.stderr.on('data', (d) => process.stderr.write(d));
  for (let i = 0; i < N; i++) { await p.evaluate((t) => window.render(t), i / FPS); const buf = await p.screenshot({ type: 'jpeg', quality: 93 }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close(); console.log('done', name, N, 'frames');
})();
