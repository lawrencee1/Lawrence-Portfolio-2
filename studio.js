/* Lawrence Nathan, version 2 (/studio) */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement, body = document.body;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);

  $('#yr').textContent = new Date().getFullYear();
  body.classList.add('open', 'opened');

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* scroll: progress thread, nav, parallax, WhatsApp button */
  const nav = $('.nav'), fab = $('.fab'), contact = $('#contact');
  const pars = $$('[data-par]').map(el => ({ el, f: +el.dataset.par, host: el.closest('section') || el }));
  let last = -1;
  (function frame() {
    const y = scrollY;
    if (y !== last) {
      last = y;
      root.style.setProperty('--prog', clamp(y / (document.documentElement.scrollHeight - innerHeight)).toFixed(4));
      nav.classList.toggle('solid', y > innerHeight * 0.85 || (y > 40 && innerWidth <= 760));
      if (fab) fab.classList.toggle('show', y > innerHeight * 0.7 && contact.getBoundingClientRect().top > innerHeight * 0.6);
      if (!reduce) pars.forEach(p => {
        const r = p.host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        p.el.style.transform = `translate3d(0,${((r.top + r.height / 2 - innerHeight / 2) * p.f).toFixed(1)}px,0)`;
      });
    }
    requestAnimationFrame(frame);
  })();

  /* silent preview loops, only while on screen */
  const saveData = navigator.connection && navigator.connection.saveData;
  if (!reduce && !saveData) {
    const vio = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target, tile = v.closest('.vid');
      if (e.isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        const p = v.play();
        if (p) p.then(() => tile.classList.add('playing')).catch(() => {});
      } else if (!v.paused) v.pause();
    }), { threshold: 0.35 });
    $$('.vid video[data-src]').forEach(v => vio.observe(v));
  }

  /* viewer */
  const viewer = $('#viewer'), stage = $('.viewer-stage', viewer);
  viewer.addEventListener('close', () => { stage.querySelectorAll('video').forEach(v => v.pause()); stage.textContent = ''; });
  viewer.addEventListener('click', e => { if (e.target === viewer || e.target === stage) viewer.close(); });
  $('.viewer-close', viewer).addEventListener('click', () => viewer.close());
  $$('.vid[data-full]').forEach(tile => tile.addEventListener('click', () => {
    stage.textContent = '';
    const v = document.createElement('video');
    const cover = tile.querySelector('img'); if (cover) v.poster = cover.currentSrc || cover.src;
    v.src = tile.dataset.full; v.controls = true; v.autoplay = true; v.playsInline = true; v.loop = true;
    stage.appendChild(v);
    viewer.showModal();
  }));

  /* editor demo */
  const ed = $('#ed'), on = $('#ed-on'), status = $('#ed-status'), foot = $('.ed-foot', ed), offers = $('#ed-offers');
  const setEditing = () => {
    ed.classList.toggle('editing', on.checked);
    $$('[data-ed]', ed).forEach(el => { el.contentEditable = on.checked ? 'true' : 'false'; el.spellcheck = false; });
    foot.classList.remove('saved');
    status.textContent = on.checked ? 'Try it. Click any text to change it.' : 'This is what your visitors see.';
  };
  on.addEventListener('change', setEditing);
  setEditing();
  ed.addEventListener('input', () => { foot.classList.remove('saved'); status.textContent = 'Unsaved changes.'; });
  ed.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-ed]')) { e.preventDefault(); e.target.blur(); } });
  $('#ed-add').addEventListener('click', () => {
    const li = document.createElement('li');
    li.dataset.ed = ''; li.textContent = 'New offer'; offers.appendChild(li);
    setEditing(); status.textContent = 'Unsaved changes.';
    li.focus(); const r = document.createRange(); r.selectNodeContents(li); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  });
  $('#ed-save').addEventListener('click', () => { foot.classList.add('saved'); status.textContent = 'Saved. Your site is updated.'; });

  /* quote brief */
  const form = $('#quote'), preview = $('#q-preview'), mail = $('#q-mail'), wa = $('#q-wa');
  const mailBase = mail.getAttribute('href'), waBase = wa.getAttribute('href');
  const update = () => {
    const f = new FormData(form); const place = (f.get('place') || '').trim();
    const msg = `Hi Lawrence! We're ${f.get('type')}${place ? ' in ' + place : ''}. We'd like ${f.get('need')}, ${f.get('when')}. Could we talk?`;
    preview.textContent = '“' + msg + '”';
    wa.setAttribute('href', `${waBase}?text=${encodeURIComponent(msg)}`);
    mail.setAttribute('href', `${mailBase}?subject=${encodeURIComponent('Content and website enquiry')}&body=${encodeURIComponent(msg)}`);
  };
  form.addEventListener('input', update);
  form.addEventListener('submit', e => e.preventDefault());
  update();
})();
