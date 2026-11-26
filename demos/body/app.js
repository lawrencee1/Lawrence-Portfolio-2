// Sore Spot: spin the body, tap where it hurts, read the tips, copy the movement clips.
import * as THREE from 'three';
import { createFigure, fullPose } from './rig.js';
import { REGIONS, ORDER, MOVE_INFO } from './content.js';
import { MOVES } from './moves.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = matchMedia('(max-width: 899px)');
const app = $('#app'), stage = $('#stage'), canvas = $('#body'), panel = $('#panel'), scroll = $('#scroll');
const homeEl = $('#home'), regionEl = $('#region'), hero = $('#hero'), spot = $('#spot'), hoverEl = $('#hover'), hint = $('#hint');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const titleOf = (key, side) => (REGIONS[key].sided ? `${cap(side)} ${REGIONS[key].name.toLowerCase()}` : REGIONS[key].name);
const PER_MOVE = 36; // seconds per movement in follow-along

let sel = null;          // { region, side, anchor }
let demo = null;         // movement clip renderer, made the first time it is needed
let clips = [];          // clips in the open panel
const view = { yaw: 0, pitch: 0.1, zoom: 1, dist: 5, ox: 0, oy: 0, tx: 0, ty: 0.93, vyaw: 0, goalYaw: null, touched: false };

/* ================= the body ================= */
let T = null;
function initBody() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xd6e2ff, 0x1a2238, 1.25));
  const key = new THREE.DirectionalLight(0xfff0de, 2.2); key.position.set(-2.2, 2.6, 1.5); key.target.position.set(0, 0, -4);
  const rim = new THREE.DirectionalLight(0x86a9ff, 2.4); rim.position.set(2.5, 1.5, -7); rim.target.position.set(0, 0, -4);
  camera.add(key, key.target, rim, rim.target);

  // the floor: a soft pool of light, a turntable ring and a contact shadow, painted once
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  let g = x.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, 'rgba(120,150,230,.42)'); g.addColorStop(.45, 'rgba(90,120,210,.16)'); g.addColorStop(1, 'rgba(90,120,210,0)');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  x.strokeStyle = 'rgba(200,215,255,.34)'; x.lineWidth = 1.5; x.beginPath(); x.arc(256, 256, 150, 0, 7); x.stroke();
  x.strokeStyle = 'rgba(200,215,255,.16)'; x.beginPath(); x.arc(256, 256, 200, 0, 7); x.stroke();
  for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, r0 = i % 4 ? 153 : 150, r1 = i % 4 ? 158 : 164; x.strokeStyle = 'rgba(200,215,255,.3)'; x.beginPath(); x.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0); x.lineTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1); x.stroke(); }
  g = x.createRadialGradient(256, 256, 0, 256, 256, 92);
  g.addColorStop(0, 'rgba(4,7,16,.75)'); g.addColorStop(1, 'rgba(4,7,16,0)');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);

  const figure = createFigure({});
  scene.add(figure.group);
  const pose = fullPose({ armL: [2, 0, 13], armR: [2, 0, -13], foreL: [-10, 0, 0], foreR: [-10, 0, 0] });
  T = { renderer, scene, camera, figure, pose, floor, ray: new THREE.Raycaster(), ndc: new THREE.Vector2(), W: 0, H: 0 };
  resize();
}

function resize() {
  if (!T) return;
  const W = stage.clientWidth, H = stage.clientHeight;
  if (W === T.W && H === T.H) return;
  T.W = W; T.H = H;
  T.renderer.setSize(W, H, false);
  T.camera.aspect = W / H;
}

// where on the stage the body should sit, so it is never under the headline or the sheet
function safeRect() {
  const W = T.W, H = T.H, home = !sel;
  if (phone.matches) {
    const top = home ? hero.getBoundingClientRect().bottom + 6 : 104;
    const bottom = Math.max(top + 120, panel.getBoundingClientRect().top - (home ? 62 : 14));
    return [0, top, W, bottom];
  }
  return home ? [Math.min(W * 0.36, 400), 76, W - 10, H - 84] : [0, 110, W, H - 84];
}

function updateCamera(dt) {
  const { camera, W, H } = T;
  const [x0, y0, x1, y1] = safeRect();
  const tanH = Math.tan(camera.fov * Math.PI / 360);
  const spanY = sel ? (phone.matches ? 1.25 : 1.5) : 2.02, spanX = sel ? 0.95 : 0.98;
  let dist = Math.max(spanY * H / ((y1 - y0) * 2 * tanH), spanX * H / ((x1 - x0) * 2 * tanH)) * view.zoom;
  let tx = 0, ty = 0.92;
  if (sel) { const a = sel.anchor.world; ty = clamp(a.y, 0.48, 1.42); tx = a.x * 0.5; }
  const k = reduce ? 1 : 1 - Math.exp(-dt * 5.5);
  view.dist += (dist - view.dist) * k;
  view.ox += ((W / 2 - (x0 + x1) / 2) - view.ox) * k;
  view.oy += ((H / 2 - (y0 + y1) / 2) - view.oy) * k;
  view.tx += (tx - view.tx) * k; view.ty += (ty - view.ty) * k;
  if (view.goalYaw !== null) {
    let d = view.goalYaw - view.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    view.yaw += d * (reduce ? 1 : 1 - Math.exp(-dt * 6));
    if (Math.abs(d) < 0.004) view.goalYaw = null;
  } else if (!drag) { view.yaw += view.vyaw * dt; view.vyaw *= Math.exp(-dt * 3.2); }
  const cp = Math.cos(view.pitch);
  camera.position.set(view.tx + view.dist * Math.sin(view.yaw) * cp, view.ty + view.dist * Math.sin(view.pitch), view.dist * Math.cos(view.yaw) * cp);
  camera.lookAt(view.tx, view.ty, 0);
  camera.setViewOffset(W, H, view.ox, view.oy, W, H);
  camera.updateMatrixWorld();
}

let selK = 0, hovK = 0, hov = null, hovOn = false, clock = 0;
function drawBody(dt) {
  const { figure, pose } = T, u = figure.uniforms;
  if (!reduce) {
    const b = Math.sin(clock * 1.5);
    pose.chest[0] = b * 0.9; pose.spine[0] = -b * 0.4; pose.shLp[1] = pose.shRp[1] = 0.003 + b * 0.003;
    pose.head[1] = Math.sin(clock * 0.37) * 3; pose.neck[0] = Math.sin(clock * 0.5) * 1.2;
    if (!view.touched) view.yaw = Math.sin(clock * 0.5) * 0.55 + 0.1;
  }
  figure.applyPose(pose);
  figure.updateAnchors();
  updateCamera(dt);
  selK += ((sel ? 1 : 0) - selK) * Math.min(1, dt * 6);
  hovK += ((hovOn && !(sel && hov === sel.anchor) ? 1 : 0) - hovK) * Math.min(1, dt * 12);
  if (sel) { const a = sel.anchor; u.uSel.value.set(a.world.x, a.world.y, a.world.z, a.r * 1.35); }
  if (hov) u.uHov.value.set(hov.world.x, hov.world.y, hov.world.z, hov.r * 1.2);
  u.uSelK.value = selK * (reduce ? 0.9 : 0.8 + 0.2 * Math.sin(clock * 3.2));
  u.uHovK.value = hovK;
  T.floor.rotation.z = -view.yaw * 0.5;
  T.renderer.render(T.scene, T.camera);
  const front = Math.cos(view.yaw) >= 0;
  if (front !== lastFront) { lastFront = front; $$('.views button').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.view === 'front') === front))); }
}
let lastFront = true;

function pick(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  T.ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  T.ray.setFromCamera(T.ndc, T.camera);
  const hit = T.ray.intersectObjects(T.figure.meshes, false)[0];
  return hit ? T.figure.regionAt(hit.point) : null;
}

/* ----- pointer: drag to spin, pinch or wheel to zoom, tap to choose ----- */
let drag = null; const pts = new Map(); let pinch = 0;
function touched() { if (!view.touched) { view.touched = true; hint.classList.add('gone'); } }
function bindPointer() {
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 1) { drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, t: performance.now() }; view.goalYaw = null; view.vyaw = 0; }
    else if (drag) { drag.moved = true; const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); }
    setHover(null);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) { if (e.pointerType === 'mouse') hoverAt(e); return; }
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (!drag) return;
    if (pts.size >= 2) {
      const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) view.zoom = clamp(view.zoom * pinch / d, 0.5, 1.5); pinch = d; return;
    }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 7) { drag.moved = true; canvas.classList.add('grabbing'); touched(); }
    if (drag.moved) {
      view.yaw -= dx * 0.0085; view.pitch = clamp(view.pitch + dy * 0.004, -0.2, 0.55);
      view.vyaw = -dx * 0.0085 / Math.max(0.008, (performance.now() - drag.t) / 1000); drag.t = performance.now();
    }
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const end = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId); pinch = 0;
    if (pts.size) return;
    canvas.classList.remove('grabbing');
    const d = drag; drag = null;
    if (!d) return;
    if (performance.now() - d.t > 120) view.vyaw = 0;
    view.vyaw = clamp(view.vyaw, -7, 7);
    if (!d.moved && e.type === 'pointerup') { const a = pick(e.clientX, e.clientY); if (a) { touched(); select(a.region, a.side, a); } }
  };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', () => setHover(null));
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); view.zoom = clamp(view.zoom * Math.exp(e.deltaY * 0.0012), 0.5, 1.5); touched(); }, { passive: false });
  $$('.views button').forEach((b) => b.addEventListener('click', () => { touched(); view.vyaw = 0; view.goalYaw = b.dataset.view === 'front' ? 0 : Math.PI; }));
}
function setHover(a, e) {
  if (!a) { hovOn = false; hoverEl.classList.remove('on'); canvas.classList.remove('point'); return; }
  hov = a; hovOn = true; canvas.classList.add('point');
  hoverEl.textContent = titleOf(a.region, a.side || 'left');
  const r = stage.getBoundingClientRect();
  hoverEl.style.transform = `translate(${clamp(e.clientX - r.left + 16, 8, r.width - 170)}px, ${clamp(e.clientY - r.top + 18, 8, r.height - 40)}px)`;
  hoverEl.classList.add('on');
}
let hoverTick = 0;
function hoverAt(e) {
  const now = performance.now(); if (now - hoverTick < 40) return; hoverTick = now;
  setHover(pick(e.clientX, e.clientY), e);
}

/* ================= panel ================= */
const ICON = {
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  play: '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.500v13l11-6.500z" fill="currentColor"/></svg>',
  pause: '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.500v14H7zM13.500 5H17v14h-3.500z" fill="currentColor"/></svg>',
  warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.500l9.500 16.500h-19z" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linejoin="round"/><path d="M12 10v4.500M12 17.200v.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function buildChips() {
  $('#chips').innerHTML = ORDER.map((k) => `<button class="chip" type="button" data-region="${k}">${esc(REGIONS[k].name)}</button>`).join('');
  $('#chips').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) { touched(); select(b.dataset.region, 'left', null, true); } });
}

function regionHTML(key, side) {
  const r = REGIONS[key];
  const flags = `<ul>${r.flags.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`;
  const mins = r.moves ? Math.max(1, Math.round(r.moves.length * PER_MOVE / 60)) : 0;
  return `
  <button class="back" type="button" data-act="back">${ICON.back}All areas</button>
  <header class="r-head">
    <p class="eyebrow">${r.noMoves ? 'Get this checked first' : 'Sore spot'}</p>
    <h2 tabindex="-1" id="rTitle">${esc(titleOf(key, side))}</h2>
    ${r.sided ? `<div class="sides" role="group" aria-label="Which side hurts"><button type="button" data-side="left" aria-pressed="${side === 'left'}">Left</button><button type="button" data-side="right" aria-pressed="${side === 'right'}">Right</button></div>` : ''}
    <p class="blurb">${esc(r.blurb)}</p>
    ${r.noMoves ? '' : `<button class="go follow" type="button" data-act="follow"><i class="ico">${ICON.play}</i><span>Follow along<small>${r.moves.length} movements, about ${mins} min</small></span></button>`}
  </header>
  ${r.noMoves ? `<div class="flags urgent"><h3>${ICON.warn}${esc(r.urgentTitle)}</h3>${flags}</div>` : ''}
  <h3>${esc(r.tipsTitle || 'Try this first')}</h3>
  <ol class="tips">${r.tips.map(([a, b]) => `<li><b>${esc(a)}</b>${esc(b)}</li>`).join('')}</ol>
  ${r.noMoves ? '' : `<h3>Movements that help</h3>
  <p class="sub">Short loops. Copy the figure, slow and easy.${r.sided ? ' Shown on one side, so do your sore side.' : ''}</p>
  <div class="moves">${r.moves.map((id, i) => { const m = MOVE_INFO[id]; return `
    <article class="move">
      <div class="clip"><canvas width="640" height="480" data-move="${id}" aria-label="Animated clip: ${esc(m.name)}" role="img"></canvas>
        <button class="pp" type="button" aria-pressed="${!reduce}" aria-label="Play or pause ${esc(m.name)}"><i>${ICON.play}${ICON.pause}</i></button>
        <span class="tag">Loop, ${Math.round(MOVES[id].dur)} sec</span><span class="num">${i + 1}</span></div>
      <div class="mv"><h4>${esc(m.name)}</h4><span class="dose">${esc(m.dose)}</span>
        <ol class="cues">${m.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>
        <p class="feel"><b>You should feel:</b> ${esc(m.feel)}</p></div>
    </article>`; }).join('')}</div>
  <div class="flags"><h3>${ICON.warn}Get it checked if</h3>${flags}</div>`}
  <p class="fine">General information, not medical advice. If you are unsure, pregnant, recovering from surgery or the pain is not easing, see a doctor or physiotherapist.</p>`;
}

function ensureDemo() {
  if (demo !== null) return demo;
  demo = false;
  import('./demo.js').then(({ DemoStage }) => { try { demo = new DemoStage(800, 600); } catch (e) { demo = false; app.classList.add('no-clips'); } })
    .catch(() => { app.classList.add('no-clips'); });
  return demo;
}

const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { const c = clips.find((k) => k.canvas === e.target); if (c) c.vis = e.isIntersecting; }), { threshold: 0.05 }) : null;
function bindClips() {
  clips.forEach((c) => io && io.unobserve(c.canvas));
  clips = $$('.clip canvas', regionEl).map((cv) => ({ canvas: cv, id: cv.dataset.move, t: 0, playing: !reduce, vis: !io, dirty: true, btn: cv.parentElement.querySelector('.pp') }));
  clips.forEach((c) => { if (io) io.observe(c.canvas); c.btn.addEventListener('click', () => { c.playing = !c.playing; c.btn.setAttribute('aria-pressed', String(c.playing)); }); });
}

function select(region, side, anchor, fromList) {
  if (!REGIONS[region]) return;
  side = REGIONS[region].sided ? (side || 'left') : '';
  const a = (anchor && anchor.region === region && (!side || anchor.side === side) ? anchor : null) || (T ? T.figure.anchorFor(region, side) : null);
  const same = sel && sel.region === region;
  sel = { region, side, anchor: a };
  app.dataset.state = 'region';
  spot.textContent = titleOf(region, side || 'left');
  if (T) {
    // turn the body so the chosen spot faces you
    const facing = Math.cos(view.yaw) >= 0;
    if (region === 'upper-back' || region === 'lower-back') { if (facing) view.goalYaw = Math.PI; }
    else if (region === 'chest' || region === 'abdomen') { if (!facing) view.goalYaw = 0; }
    else if (fromList) view.goalYaw = side === 'left' ? 0.5 : side === 'right' ? -0.5 : 0.25;
    view.vyaw = 0; view.zoom = 1;
  }
  if (!same) {
    regionEl.innerHTML = regionHTML(region, side);
    homeEl.hidden = true; regionEl.hidden = false; scroll.scrollTop = 0;
    if (!REGIONS[region].noMoves) { ensureDemo(); bindClips(); } else clips = [];
    if (fromList) $('#rTitle').focus({ preventScroll: true });
  } else {
    $('#rTitle').textContent = titleOf(region, side);
    $$('.sides button', regionEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.side === side)));
  }
  if (phone.matches && (app.dataset.sheet === 'peek' || !same)) setSheet('half');
  const h = '#' + region + (side ? '-' + side : '');
  if (location.hash !== h) history.replaceState(null, '', h);
}

function goHome() {
  sel = null; app.dataset.state = 'home'; clips = [];
  regionEl.hidden = true; homeEl.hidden = false; scroll.scrollTop = 0; view.zoom = 1;
  if (phone.matches) setSheet('peek');
  history.replaceState(null, '', location.pathname + location.search);
}

regionEl.addEventListener('click', (e) => {
  const act = e.target.closest('[data-act]'), sd = e.target.closest('[data-side]');
  if (sd && sel) { select(sel.region, sd.dataset.side); if (T) view.goalYaw = sd.dataset.side === 'left' ? 0.5 : -0.5; }
  else if (act && act.dataset.act === 'back') goHome();
  else if (act && act.dataset.act === 'follow') openPlayer(sel.region);
});

/* ----- bottom sheet on phones ----- */
const sheetH = (name) => { const H = innerHeight; return name === 'peek' ? 138 : name === 'half' ? Math.round(H * 0.56) : H - 58; };
function setSheet(name) {
  app.dataset.sheet = name;
  panel.style.setProperty('--h', sheetH(name) + 'px'); app.style.setProperty('--h', sheetH(name) + 'px');
}
function bindSheet() {
  const grab = $('#grab'); let g = null;
  grab.addEventListener('pointerdown', (e) => { grab.setPointerCapture(e.pointerId); g = { y: e.clientY, h: panel.getBoundingClientRect().height, moved: false }; });
  grab.addEventListener('pointermove', (e) => {
    if (!g) return; const dy = e.clientY - g.y; if (Math.abs(dy) > 5) g.moved = true;
    if (g.moved) { panel.classList.add('dragging'); const h = clamp(g.h - dy, 110, innerHeight - 58); panel.style.setProperty('--h', h + 'px'); app.style.setProperty('--h', h + 'px'); }
  });
  const up = () => {
    if (!g) return; panel.classList.remove('dragging');
    const cur = app.dataset.sheet;
    if (!g.moved) setSheet(cur === 'full' ? 'half' : cur === 'half' ? (sel ? 'full' : 'peek') : 'half');
    else { const h = panel.getBoundingClientRect().height, opts = sel ? ['half', 'full'] : ['peek', 'half', 'full']; setSheet(opts.reduce((a, b) => (Math.abs(sheetH(b) - h) < Math.abs(sheetH(a) - h) ? b : a))); }
    g = null;
  };
  grab.addEventListener('pointerup', up); grab.addEventListener('pointercancel', up);
  grab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g = { moved: false }; up(); } });
  $('#aboutBtn').addEventListener('click', () => {
    if (sel) goHome();
    if (phone.matches) setSheet('full');
    setTimeout(() => $('#how').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), phone.matches ? 380 : 0);
  });
  const onMode = () => { if (phone.matches) setSheet(sel ? 'half' : 'peek'); else app.dataset.sheet = 'open'; };
  phone.addEventListener('change', onMode); onMode();
  addEventListener('resize', () => { resize(); if (phone.matches) setSheet(app.dataset.sheet); });
}

/* ================= follow along ================= */
const player = $('#player'), pl = { list: [], i: 0, t: 0, playing: true, open: false, cue: -1 };
function openPlayer(region) {
  pl.list = REGIONS[region].moves; pl.open = true;
  $('#plBars').innerHTML = pl.list.map(() => '<i><b></b></i>').join('');
  $('#plDone').hidden = true; startMove(0); setPlaying(true);
  if (player.showModal) player.showModal(); else player.setAttribute('open', '');
}
function startMove(i) {
  pl.i = i; pl.t = 0; pl.cue = -1;
  const m = MOVE_INFO[pl.list[i]];
  $('#plCount').textContent = `Movement ${i + 1} of ${pl.list.length}`;
  $('#plName').textContent = m.name; $('#plDose').textContent = m.dose;
  $$('#plBars b').forEach((b, k) => { b.style.width = k < i ? '100%' : '0%'; });
}
function setPlaying(v) { pl.playing = v; $('#plPlay').textContent = v ? 'Pause' : 'Play'; }
function closePlayer() { pl.open = false; if (player.open && player.close) player.close(); else player.removeAttribute('open'); }
function tickPlayer(dt) {
  if (!pl.open || !$('#plDone').hidden) return;
  if (pl.playing) pl.t += dt;
  const id = pl.list[pl.i], m = MOVE_INFO[id];
  if (demo) demo.draw(id, pl.t, $('#plCanvas'));
  const cue = Math.min(m.cues.length - 1, Math.floor(pl.t / (PER_MOVE / m.cues.length)));
  if (cue !== pl.cue) { pl.cue = cue; $('#plCue').textContent = m.cues[cue]; }
  const bar = $$('#plBars b')[pl.i]; if (bar) bar.style.width = clamp(pl.t / PER_MOVE * 100, 0, 100) + '%';
  if (pl.t >= PER_MOVE) { if (pl.i < pl.list.length - 1) startMove(pl.i + 1); else { $('#plDone').hidden = false; $('#plAgain').focus(); } }
}
$('#plClose').addEventListener('click', closePlayer);
$('#plFinish').addEventListener('click', closePlayer);
$('#plAgain').addEventListener('click', () => { $('#plDone').hidden = true; startMove(0); setPlaying(true); });
$('#plPlay').addEventListener('click', () => setPlaying(!pl.playing));
$('#plPrev').addEventListener('click', () => startMove(Math.max(0, pl.i - (pl.t < 3 ? 1 : 0))));
$('#plNext').addEventListener('click', () => { if (pl.i < pl.list.length - 1) startMove(pl.i + 1); else { $('#plDone').hidden = false; $('#plAgain').focus(); } });
player.addEventListener('close', () => { pl.open = false; });

/* ================= loop ================= */
let last = performance.now(), frame = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt; frame++;
  if (document.hidden) return;
  const covered = pl.open || (phone.matches && app.dataset.sheet === 'full');
  if (T && !covered) { resize(); drawBody(dt); }
  if (pl.open) { if (frame % 2 === 0) tickPlayer(dt * 2); return; }
  if (demo && clips.length && frame % 2 === 0) {
    for (const c of clips) {
      if (c.playing) c.t += dt * 2;
      if (c.vis && (c.playing || c.dirty)) { demo.draw(c.id, c.playing ? c.t : MOVES[c.id].dur * 0.3, c.canvas); c.dirty = false; }
    }
  }
}

/* ================= start ================= */
function fromHash() {
  const h = location.hash.slice(1); if (!h) return;
  const m = h.match(/^(.*?)(?:-(left|right))?$/);
  const key = REGIONS[h] ? h : (m && REGIONS[m[1]] ? m[1] : null);
  if (key) { view.touched = true; hint.classList.add('gone'); select(key, REGIONS[h] ? 'left' : (m[2] || 'left'), null, true); }
}
buildChips();
try { initBody(); bindPointer(); } catch (e) { T = null; app.classList.add('no3d'); $('#no3d').hidden = false; $('#hud').hidden = true; }
bindSheet();
if (reduce) { view.touched = true; view.yaw = 0.35; }
fromHash();
addEventListener('hashchange', fromHash);
requestAnimationFrame(loop);
