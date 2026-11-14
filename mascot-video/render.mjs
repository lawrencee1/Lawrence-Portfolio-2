// Renders scene.html frame by frame with headless Chromium, then encodes an MP4 with ffmpeg.
//   node render.mjs                 full render, 1920x1080 -> out/mascot-video.mp4
//   node render.mjs --stills 1,5,12 quick half-size stills -> out/stills/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const dir = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const stills = arg('stills', null);
let FPS = 24; const WORKERS = Number(arg('workers', 4));
const scale = Number(arg('scale', stills ? 0.5 : 2 / 3));   // rendered size relative to 1920x1080; the MP4 is always 1920x1080
const [W, H] = [Math.round(1920 * scale), Math.round(1080 * scale)];

const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const url = `http://localhost:${server.address().port}/scene.html`;

async function open() {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  page.on('console', m => m.type() === 'error' && console.error('console:', m.text()));
  await page.goto(url);
  await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
  return { browser, page };
}
const shoot = async (page, t, file) => {
  await page.evaluate(t => window.renderFrame(t), t);
  await page.screenshot({ path: file, type: file.endsWith('.png') ? 'png' : 'jpeg', timeout: 0, ...(file.endsWith('.png') ? {} : { quality: 97 }) });
};

if (stills) {
  const out = path.join(dir, 'out', arg('dir', 'stills')); fs.mkdirSync(out, { recursive: true });
  const { browser, page } = await open();
  for (const t of stills.split(',').map(Number)) await shoot(page, t, path.join(out, `t${t.toFixed(2).padStart(5, '0')}.jpg`));
  await browser.close();
} else {
  const out = path.join(dir, 'out/frames'); fs.mkdirSync(out, { recursive: true });   // existing frames are kept, so a render can resume
  const probe = await open(); const dur = await probe.page.evaluate('window.DUR'); FPS = await probe.page.evaluate('window.FPS'); await probe.browser.close();
  const total = Math.round(dur * FPS); let done = 0;
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const { browser, page } = await open();
    for (let i = w; i < total; i += WORKERS) {
      const file = path.join(out, `f${String(i).padStart(5, '0')}.jpg`);
      if (!fs.existsSync(file)) await shoot(page, i / FPS, file);
      if (++done % 60 === 0) console.log(`${done}/${total}`);
    }
    await browser.close();
  }));
  const mp4 = path.join(dir, 'out/mascot-video.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(out, 'f%05d.jpg'),
    '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
  console.log('wrote', mp4);
}
server.close();
