/* Lawrence Nathan — batik site interactions */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const body = document.body;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);

  $('#yr').textContent = new Date().getFullYear();

  /* ---------- split the name into letters ---------- */
  $$('[data-split]').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch'; s.style.setProperty('--i', i + (el.classList.contains('n2') ? 6 : 0));
      s.textContent = c; s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    });
  });

  /* ---------- split the headline into words ---------- */
  $$('[data-words]').forEach(el => {
    el.setAttribute('aria-label', el.textContent.trim());
    let i = 0;
    const wrap = (text, parent) => {
      text.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
        const c = document.createElement('span'); c.className = 'ch'; c.style.setProperty('--i', i++ * 1.6);
        c.textContent = part; w.appendChild(c); parent.appendChild(w);
      });
    };
    [...el.childNodes].forEach(node => {
      if (node.nodeType === 3) { const frag = document.createDocumentFragment(); wrap(node.textContent, frag); node.replaceWith(frag); }
      else if (node.nodeType === 1) { const text = node.textContent; node.textContent = ''; wrap(text, node); }
    });
  });

  /* ---------- opening curtain ---------- */
  let opened = false;
  function openCurtain() {
    if (opened) return; opened = true;
    body.classList.add('open');
    setTimeout(() => body.classList.add('opened'), 1400);
  }
  // the curtain plays once per visit; later page loads in the same tab skip it
  let seen = false;
  try { seen = sessionStorage.getItem('curtain') === '1'; sessionStorage.setItem('curtain', '1'); } catch {}
  const small = matchMedia('(max-width: 760px)').matches; // phones skip the curtain
  if (reduce || seen || small) { opened = true; body.classList.add('seen', 'open', 'opened'); }
  else {
    setTimeout(openCurtain, 1150);
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(e => addEventListener(e, openCurtain, { once: true, passive: true }));
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.rv, .scene').forEach(el => io.observe(el));

  /* ---------- map ---------- */
  const map = $('#map');
  const routeBg = $('#route');
  const route = $('.route', map);
  const marker = $('#marker');
  const pins = $$('.pin', map);
  const km = $('#map-km'), stop = $('#map-stop');
  const routeLen = routeBg.getTotalLength();
  const TOTAL_KM = 38.4; // rough driving distance, for the demo label
  // place each pin at its true position along the route
  pins.forEach(p => {
    const m = p.transform.baseVal.consolidate().matrix;
    let best = 0, bd = 1e9;
    for (let i = 0; i <= 240; i++) {
      const pt = routeBg.getPointAtLength(routeLen * i / 240);
      const d = (pt.x - m.e) ** 2 + (pt.y - m.f) ** 2;
      if (d < bd) { bd = d; best = i / 240; }
    }
    p.dataset.at = Math.max(0, best - 0.02);
  });
  function drawMap(m) {
    route.style.strokeDashoffset = 1 - m;
    const pt = routeBg.getPointAtLength(routeLen * m);
    marker.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    let cur = pins[0];
    pins.forEach(p => { const on = m >= +p.dataset.at; p.classList.toggle('on', on); if (on) cur = p; });
    stop.textContent = cur.querySelector('text').textContent;
    km.textContent = (TOTAL_KM * m).toFixed(1);
    map.style.setProperty('--m', m.toFixed(3));
  }

  /* ---------- process (pinned) ---------- */
  const proc = $('.process');
  const pinBox = $('.pin-box');
  const steps = $$('.step'), sdots = $$('.step-dots i');
  let stepNow = -1;
  function drawProcess(p) {
    pinBox.style.setProperty('--p', p.toFixed(4));
    pinBox.style.setProperty('--draw', clamp(p / 0.36).toFixed(4));
    pinBox.style.setProperty('--fill', clamp((p - 0.38) / 0.28).toFixed(4));
    pinBox.style.setProperty('--rev', clamp((p - 0.72) / 0.22).toFixed(4));
    const s = p < 0.36 ? 0 : p < 0.7 ? 1 : 2;
    if (s !== stepNow) {
      stepNow = s;
      steps.forEach((el, i) => { el.classList.toggle('is-on', i === s); el.classList.toggle('was-on', i < s); });
      sdots.forEach((el, i) => el.classList.toggle('is-on', i <= s));
    }
  }

  /* ---------- scroll engine ---------- */
  const pars = $$('[data-par]').map(el => ({ el, f: +el.dataset.par, host: el.closest('section, .scene') || el }));
  const grows = $$('[data-grow]');
  const nav = $('.nav'), fab = $('.fab'), contact = $('.quote-wrap');
  const ribbon = $('.ribbon-track');
  let last = scrollY, sway = 0, swayV = 0, rx = 0, dirty = true, lastT = performance.now();
  const vis = el => { const r = el.getBoundingClientRect(); return r.bottom > -200 && r.top < innerHeight + 200 ? r : null; };

  function frame(now) {
    const dt = Math.min(now - lastT, 50); lastT = now;
    const y = scrollY, d = y - last; last = y;
    if (d !== 0) dirty = true;

    // cloth sway: a damped spring pushed by scroll speed
    if (!reduce) {
      swayV += (-sway * 0.06) + clamp(d, -60, 60) * -0.012;
      swayV *= 0.9; sway += swayV;
      if (Math.abs(sway) > 0.002 || Math.abs(swayV) > 0.002) root.style.setProperty('--sway', sway.toFixed(3));
      // ribbon keeps moving, faster while scrolling
      rx -= (0.035 + Math.min(Math.abs(d), 40) * 0.008) * dt * (d < 0 ? -1 : 1);
      const half = ribbon.scrollWidth / 2;
      if (rx < -half) rx += half; if (rx > 0) rx -= half;
      ribbon.style.transform = `translate3d(${rx.toFixed(1)}px,0,0)`;
    }

    if (dirty) {
      dirty = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty('--prog', clamp(y / max).toFixed(4));
      nav.classList.toggle('solid', y > 40);
      if (fab) { const cr = contact.getBoundingClientRect(); fab.classList.toggle('show', y > innerHeight * 0.7 && cr.top > innerHeight * 0.6); }

      if (!reduce) pars.forEach(p => {
        const r = vis(p.host); if (!r) return;
        const off = (r.top + r.height / 2 - innerHeight / 2) * p.f;
        p.el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
      });

      grows.forEach(g => {
        const r = vis(g); if (!r) return;
        g.style.setProperty('--g', reduce ? 1 : clamp((innerHeight * 0.95 - r.top) / (innerHeight * 0.8)).toFixed(3));
      });

      const mr = vis(map);
      if (mr) drawMap(reduce ? 1 : clamp((innerHeight * 0.82 - mr.top) / (mr.height + innerHeight * 0.12)));

      const pr = proc.getBoundingClientRect();
      if (pr.bottom > 0 && pr.top < innerHeight) drawProcess(reduce ? 1 : clamp(-pr.top / (pr.height - innerHeight)));
    }
    requestAnimationFrame(frame);
  }
  addEventListener('resize', () => { dirty = true; });
  requestAnimationFrame(frame);

  /* ---------- hero: pointer parallax ---------- */
  const hero = $('.hero');
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  }

  /* ---------- hero: gold dust and wax-dot trail ---------- */
  const cv = $('.dust');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, running = false, motes = [], drops = [];
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, W / 16));
      motes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.4, v: Math.random() * 0.25 + 0.06, p: Math.random() * 6.28, w: Math.random() * 0.5 + 0.2 }));
    };
    size(); addEventListener('resize', size);
    let px = null, py = null;
    hero.addEventListener('pointermove', e => {
      const r = cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      if (px === null || (x - px) ** 2 + (y - py) ** 2 > 420) { drops.push({ x, y, t: 1, r: Math.random() * 2.2 + 1.6 }); px = x; py = y; if (drops.length > 90) drops.shift(); }
    });
    const tick = t => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (const m of motes) {
        m.y -= m.v; m.x += Math.sin(t / 1400 + m.p) * m.w * 0.3;
        if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
        ctx.globalAlpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t / 700 + m.p));
        ctx.fillStyle = '#e7cf94'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.28); ctx.fill();
      }
      for (const d of drops) {
        d.t -= 0.012; if (d.t <= 0) continue;
        ctx.globalAlpha = d.t * 0.8; ctx.strokeStyle = '#e7cf94'; ctx.fillStyle = '#c9a04e'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (2 - d.t), 0, 6.28); ctx.fill();
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (2 - d.t) + 4 * (1 - d.t) + 2, 0, 6.28); ctx.stroke();
      }
      drops = drops.filter(d => d.t > 0);
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    };
    new IntersectionObserver(es => {
      const on = es[0].isIntersecting;
      if (on && !running) { running = true; requestAnimationFrame(tick); } else if (!on) running = false;
    }).observe(hero);
  }

  /* ---------- work tiles: silent preview loops that play only while visible ---------- */
  const saveData = navigator.connection && navigator.connection.saveData;
  const tiles = $$('.vid video[data-src]');
  if (!reduce && !saveData && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target, tile = v.closest('.vid');
      if (e.isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        const p = v.play();
        if (p) p.then(() => tile.classList.add('playing')).catch(() => {});
      } else if (!v.paused) v.pause();
    }), { threshold: 0.35 });
    tiles.forEach(v => vio.observe(v));
  }

  /* ---------- work tabs ---------- */
  const tabs = $$('.tab'), rods = $$('[data-rod]');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { const on = x === t; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    rods.forEach(r => r.classList.toggle('on', r.dataset.rod === t.dataset.tab));
    dirty = true;
  }));

  /* ---------- viewer: full video with sound, or an image gallery ---------- */
  const viewer = $('#viewer'), stage = $('.viewer-stage', viewer);
  const closeViewer = () => { if (viewer.open) viewer.close(); };
  viewer.addEventListener('close', () => { stage.querySelectorAll('video').forEach(v => v.pause()); stage.textContent = ''; stage.classList.remove('gal'); });
  viewer.addEventListener('click', e => { if (e.target === viewer || e.target === stage) closeViewer(); });
  $('.viewer-close', viewer).addEventListener('click', closeViewer);
  $$('.vid').forEach(tile => tile.addEventListener('click', () => {
    stage.textContent = '';
    if (tile.dataset.full) {
      const v = document.createElement('video');
      const cover = tile.querySelector('img'); if (cover) v.poster = cover.currentSrc || cover.src;
      v.src = tile.dataset.full; v.controls = true; v.autoplay = true; v.playsInline = true; v.loop = true;
      stage.appendChild(v);
    } else if (tile.dataset.gallery) {
      stage.classList.add('gal');
      tile.dataset.gallery.split(',').forEach(src => {
        const im = document.createElement('img'); im.src = src + '.jpg'; im.alt = tile.getAttribute('aria-label') || ''; stage.appendChild(im);
      });
    }
    if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', '');
  }));

  /* ---------- quote brief ---------- */
  const form = $('#quote'), preview = $('#q-preview'), copyBtn = $('#q-copy span'), mail = $('#q-mail'), wa = $('#q-wa');
  const mailBase = mail.getAttribute('href'), waBase = wa.getAttribute('href');
  const brief = () => {
    const f = new FormData(form); const place = (f.get('place') || '').trim();
    return `Hi Lawrence! We're ${f.get('type')}${place ? ' in ' + place : ''}. We need ${f.get('need')}, ${f.get('when')}. Could you send us a quote?`;
  };
  const updateBrief = () => {
    const msg = brief();
    preview.textContent = '\u201C' + msg + '\u201D';
    wa.setAttribute('href', `${waBase}?text=${encodeURIComponent(msg)}`);
    mail.setAttribute('href', `${mailBase}?subject=${encodeURIComponent('Quote request')}&body=${encodeURIComponent(msg)}`);
  };
  form.addEventListener('input', updateBrief);
  form.addEventListener('submit', e => e.preventDefault());
  updateBrief();
  $('#q-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(brief()); copyBtn.textContent = 'Copied'; }
    catch { copyBtn.textContent = 'Select the text above to copy'; }
    setTimeout(() => (copyBtn.textContent = 'Copy my brief'), 3000);
  });
})();
