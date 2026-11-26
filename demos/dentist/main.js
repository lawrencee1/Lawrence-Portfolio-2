(() => {
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // sticky nav border + phone booking bar
  const nav = $('#nav'), bar = $('#bar'), book = $('#book');
  const onScroll = () => {
    nav.classList.toggle('stuck', scrollY > 40);
    const r = book.getBoundingClientRect();
    bar.classList.toggle('show', scrollY > 500 && (r.top > innerHeight || r.bottom < 0));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // reveal on scroll
  const items = $$('.sec-head, .card, .steps li, table, .team article, .quotes figure, .booker, .visit-card, .map, .band div');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach((el, i) => { el.classList.add('rv'); el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  }

  // booking: next 7 days, opening hours 9 to 20
  const days = $('#b-days'), times = $('#b-times'), note = $('#b-note');
  const now = new Date();
  const lateToday = now.getHours() >= 19;
  const fmtDay = d => d.toLocaleDateString('en-GB', { weekday: 'short' });
  const list = [...Array(7)].map((_, i) => { const d = new Date(now); d.setDate(d.getDate() + i + (lateToday ? 1 : 0)); return d; });
  const label = (d, i) => (!lateToday && i === 0 ? 'Today' : (i === 0 && lateToday) || (i === 1 && !lateToday) ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));
  days.innerHTML = list.map((d, i) => `<label><input type="radio" name="day" value="${label(d, i)}" data-i="${i}"${i === 0 ? ' checked' : ''}><span><small>${!lateToday && i === 0 ? 'Today' : fmtDay(d)}</small>${d.getDate()}</span></label>`).join('');
  const slots = ['9:00 am', '10:30 am', '12:00 pm', '1:30 pm', '3:30 pm', '5:00 pm', '6:30 pm'];
  const hours = [9, 10.5, 12, 13.5, 15.5, 17, 18.5];
  const drawTimes = () => {
    const i = +$('input[name=day]:checked', days).dataset.i;
    const h = now.getHours() + now.getMinutes() / 60;
    let picked = false;
    times.innerHTML = slots.map((s, k) => {
      // sample availability: past times today are closed, and a few slots look taken
      const off = (!lateToday && i === 0 && hours[k] < h + .5) || (i * 3 + k * 5) % 7 === 0;
      const sel = !off && !picked; if (sel) picked = true;
      return `<label><input type="radio" name="time" value="${s}"${off ? ' disabled' : ''}${sel ? ' checked' : ''}><span>${s}</span></label>`;
    }).join('');
  };
  days.addEventListener('change', drawTimes); drawTimes();
  const first = $('input[name=time]:checked', times);
  if (first) $('#next-slot').textContent = `${$('input[name=day]:checked', days).value.split(',')[0]}, ${first.value}`;

  const done = $('#done');
  $('#booker').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target), name = (f.get('name') || '').trim();
    if (!name) { note.textContent = 'Please add your name so we know who is coming.'; note.classList.add('err'); e.target.elements.name.focus(); return; }
    if (!f.get('time')) { note.textContent = 'Please pick a time.'; note.classList.add('err'); return; }
    note.classList.remove('err'); note.textContent = "You'll get a WhatsApp message to confirm.";
    $('#done-text').textContent = `Thanks, ${name}. ${f.get('treat')}, ${f.get('day')} at ${f.get('time')}.`;
    done.showModal ? done.showModal() : done.setAttribute('open', '');
  });
  $('#done-close').addEventListener('click', () => done.close());
  done.addEventListener('click', e => { if (e.target === done) done.close(); });
})();
