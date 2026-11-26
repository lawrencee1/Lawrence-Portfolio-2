(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tiny isometric drawing kit ---------- */
  const U = 34, C = .866;
  const P = (x, y, z = 0) => [+((x - y) * C * U).toFixed(1), +(((x + y) * .5 - z) * U).toFixed(1)];
  const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16); return '#' + [n >> 16, n >> 8 & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))).toString(16).padStart(2, '0')).join(''); };
  const poly = (pts, fill, extra = '') => `<polygon points="${pts.map(p => P(...p).join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
  const box = (x, y, z, w, d, h, c) => poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], c)
    + poly([[x, y + d, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x, y + d, z]], sh(c, -.13))
    + poly([[x + w, y, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x + w, y, z]], sh(c, -.27));
  const fL = (x, z, w, h, y, fill, extra) => poly([[x, y, z + h], [x + w, y, z + h], [x + w, y, z], [x, y, z]], fill, extra); // on a wall running left to right
  const fR = (y, z, d, h, x, fill, extra) => poly([[x, y, z + h], [x, y + d, z + h], [x, y + d, z], [x, y, z]], fill, extra); // on a wall running right to left
  const txt = (p, axis, s, size, fill, extra = '') => { const [a, b] = P(...p); return `<text transform="matrix(.866 ${axis === 'x' ? .5 : -.5} 0 1 ${a} ${b})" font-size="${size}" font-weight="700" fill="${fill}" ${extra}>${s}</text>`; };
  const ln = (a, b, stroke, w) => { const [x1, y1] = P(...a), [x2, y2] = P(...b); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`; };
  const person = (x, y, o = {}) => {
    const [a, b] = P(x, y, o.z || 0), s = o.s || 1, legs = o.legs || '#22384a', sit = o.sit;
    return `<g transform="translate(${a} ${b}) scale(${s})"><g class="${o.walk ? 'walk' : ''}">
      ${o.z || o.noshadow ? '' : '<ellipse rx="10" ry="4.500" fill="#14302c" opacity=".16"/>'}
      ${sit ? `<rect x="-6" y="-9" width="13" height="6" rx="3" fill="${legs}"/><rect x="3" y="-8" width="4.500" height="9" rx="2" fill="${legs}"/>` : `<rect x="-5.500" y="-17" width="4.600" height="17" rx="2.300" fill="${legs}"/><rect x="1" y="-17" width="4.600" height="17" rx="2.300" fill="${legs}"/>`}
      <g transform="translate(0 ${sit ? 7 : 0})"><rect x="-7.500" y="-37" width="15" height="23" rx="6.500" fill="${o.shirt || '#e9785a'}"/>
      ${o.coat ? '<rect x="-1" y="-36" width="2" height="21" fill="#cfd8dc"/>' : ''}
      <circle cy="-44" r="6.800" fill="${o.skin || '#e8b48c'}"/>
      <path d="M-6.800-44.500a6.800 6.800 0 0 1 13.600 0c-2-3.200-4.600-4.300-6.800-4.300s-4.800 1.100-6.800 4.300z" fill="${o.hair || '#3a2a22'}"/>
      ${o.long ? `<path d="M-6.800-45v8c1.500 1 2.500 0 2.500-2v-5zM6.800-45v8c-1.500 1-2.500 0-2.500-2v-5z" fill="${o.hair || '#3a2a22'}"/>` : ''}
      ${o.mask ? '<rect x="-4.500" y="-43" width="9" height="5" rx="2" fill="#9fd3e6"/>' : '<path d="M-2.500-41.500q2.500 2.500 5 0" fill="none" stroke="#7a2e38" stroke-width="1.200" stroke-linecap="round"/>'}
      ${o.bag ? '<rect x="7" y="-24" width="8" height="9" rx="1.500" fill="#f6c95a"/><path d="M8.500-24v-3h5v3" fill="none" stroke="#f6c95a" stroke-width="1.500"/>' : ''}</g></g></g>`;
  };
  const plant = (x, y, z = 0, s = 1) => { const [a, b] = P(x + .2, y + .2, z + .45); return box(x, y, z, .4, .4, .45, '#e9785a') + `<g transform="translate(${a} ${b}) scale(${s})" fill="#2f8f6f"><ellipse cx="0" cy="-12" rx="5" ry="13"/><ellipse cx="-8" cy="-7" rx="4.500" ry="11" transform="rotate(-32 -8 -7)" fill="#3fa983"/><ellipse cx="8" cy="-7" rx="4.500" ry="11" transform="rotate(32 8 -7)" fill="#257a5d"/></g>`; };
  const hot = (x, y, z, id, label) => { const [a, b] = P(x, y, z); return `<g class="hot" data-tip="${id}" tabindex="0" role="button" aria-label="${label}" transform="translate(${a} ${b})"><circle r="24" fill="transparent"/><circle class="ring" r="13"/><circle class="core" r="11"/><text y="4.500">+</text></g>`; };
  const tooth = (p, size, fill, cls = '') => { const [a, b] = P(...p); return `<use href="#tooth" class="${cls}" x="${a - size / 2}" y="${b - size * 1.1}" width="${size}" height="${size * 1.1}" fill="${fill}"/>`; };
  const spark = (p, size, cls = 'twinkle', delay = 0) => { const [a, b] = P(...p); return `<use href="#spark" class="${cls}" style="animation-delay:${delay}s" x="${a - size / 2}" y="${b - size / 2}" width="${size}" height="${size}" fill="#f6c95a"/>`; };
  const svg = (vb, body, label) => `<svg viewBox="${vb}" role="img" aria-label="${label}">${body}</svg>`;
  const TEAL = '#17695f', CORAL = '#e9785a', NAVY = '#1c2f4a', MINT = '#bfe3d4', CREAM = '#fff6e6', SUN = '#f6c95a', SKY = '#cfe6ee';
  const room = (W, D, H, floor, wa, wb) => box(0, 0, -.35, W, D, .35, floor) + poly([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], wa) + poly([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], wb)
    + poly([[0, -.2, H], [W, -.2, H], [W, 0, H], [0, 0, H]], sh(wa, -.1)) + poly([[-.2, -.2, H], [0, -.2, H], [0, D, H], [-.2, D, H]], sh(wa, -.1))
    + fL(0, 0, W, .18, 0, sh(wa, -.16)) + fR(0, 0, D, .18, 0, sh(wb, -.16));

  const art = {};
  art.outside = svg('-310 -275 620 600', [
    `<g class="drift" fill="#fff" opacity=".9"><ellipse cx="-210" cy="-200" rx="44" ry="13"/><ellipse cx="-180" cy="-212" rx="26" ry="12"/><ellipse cx="190" cy="-150" rx="38" ry="11"/></g>`,
    poly([[-1, -1, 0], [9.500, -1, 0], [9.500, 9.500, 0], [-1, 9.500, 0]], '#dfeedd'),
    poly([[3.200, 5, 0], [4.600, 5, 0], [4.600, 9.500, 0], [3.200, 9.500, 0]], '#f6ead2'),
    box(1, 1, 0, 5.500, 4, 3, TEAL),
    // right face of the ground floor
    fR(1.500, .9, 1.200, 1.300, 6.500, MINT), fR(3.300, .9, 1.200, 1.300, 6.500, MINT), fR(1.500, .9, .12, 1.300, 6.500, '#ffffff', 'opacity=".5"'),
    txt([6.500, 4.850, 2.380], 'y', 'TEDUH DENTAL', 12.500, '#fff6e6', 'letter-spacing="1.400"'),
    // left face: windows, door, awning
    fL(1.400, .9, 1.300, 1.300, 5, MINT), fL(5, .9, 1.100, 1.300, 5, MINT),
    `<g class="door" data-go="1" tabindex="0" role="button" aria-label="Walk in through the front door">${fL(3.200, 0, 1.400, 2.050, 5, NAVY)}${fL(3.350, 0, 1.100, 1.900, 5, '#ffe9b8', 'class="glow"')}${ln([3.900, 5, 0], [3.900, 5, 1.900], NAVY, 2)}</g>`,
    box(3, 5, 2.150, 1.800, .75, .14, CORAL), box(3.100, 5, 0, 1.600, .45, .12, CREAM),
    // upper floor
    box(1, 1, 3, 3.200, 4, 2.400, CORAL),
    fL(1.350, 3.550, 2.500, 1.350, 5, SKY), fL(1.350, 3.550, .14, 1.350, 5, '#ffffff', 'opacity=".55"'), person(2.300, 5, { z: 3.550, s: .8, shirt: '#ffffff', coat: 1, mask: 1 }), person(3.200, 5, { z: 3.550, s: .8, shirt: SUN, long: 1, hair: '#5b3420' }),
    fL(1.350, 3.450, 2.500, .12, 5, CREAM), fR(1.600, 3.600, 2.700, 1.200, 4.200, SKY),
    // roof terrace
    box(4.200, 4.850, 3, 2.300, .15, .5, CREAM), box(6.350, 1, 3, .15, 4, .5, CREAM), plant(5.700, 1.300, 3), person(5.300, 3.300, { z: 3, shirt: TEAL, hair: '#22384a', bag: 1 }),
    // tower, toothpaste chimney, big tooth
    box(1, 1, 5.400, 1.700, 1.700, 1.700, NAVY), fL(1.300, 5.800, 1.100, .9, 2.700, SUN),
    box(3.100, 1.500, 5.400, .7, .7, 1.300, CREAM), fL(3.100, 5.700, .7, .3, 2.200, TEAL), box(3.250, 1.650, 6.700, .4, .4, .3, CORAL),
    `<g fill="#fff"><circle class="puff" cx="${P(3.450, 1.850, 7.300)[0]}" cy="${P(3.450, 1.850, 7.300)[1]}" r="9"/><circle class="puff" style="animation-delay:2s" cx="${P(3.450, 1.850, 7.300)[0]}" cy="${P(3.450, 1.850, 7.300)[1]}" r="7"/></g>`,
    tooth([1.850, 1.850, 7.250], 76, '#ffffff', 'bob').replace('<use', '<use stroke="#17695f" stroke-width="3.500" stroke-linejoin="round"'), spark([.6, 1.800, 9.300], 20), spark([3, 1.200, 8.700], 13, 'twinkle', 1.200),
    // street
    plant(1.300, 5.500), plant(5.900, 5.500), person(3.900, 6.300, { shirt: SUN, hair: '#5b3420', long: 1, walk: 1 }), person(5.200, 7.600, { shirt: '#6f9fb3', walk: 1 }), person(5.700, 8, { s: .68, shirt: CORAL, hair: '#22384a', walk: 1 }), person(1.900, 7.400, { shirt: '#ffffff', legs: TEAL, hair: '#22384a' }),
  ].join(''), 'The outside of the dental studio, drawn as a small 3D building with a giant tooth on the roof');

  art.reception = svg('-262 -160 524 420', [
    room(7, 7, 4, '#f1e3c8', CREAM, '#f6ead2'),
    poly([[2.300, 2.700, 0], [5.800, 2.700, 0], [5.800, 5.200, 0], [2.300, 5.200, 0]], MINT),
    // right wall: welcome sign and price board
    tooth([.6, 0, 2.550], 26, TEAL), txt([1, 0, 2.700], 'x', 'Welcome', 17, TEAL, 'font-family="Fraunces, serif" font-style="italic" font-weight="400"'),
    fL(4.100, 1.500, 2.400, 1.900, 0, NAVY), txt([4.300, 0, 3], 'x', 'PRICE LIST', 9.500, SUN, 'letter-spacing="1.500"'),
    ...[0, 1, 2, 3].map(i => fL(4.300, 2.600 - i * .28, 1.300, .09, 0, '#ffffff', 'opacity=".75"') + fL(5.850, 2.600 - i * .28, .45, .09, 0, SUN)),
    // left wall: window
    fR(1.200, 1.300, 2.600, 1.900, 0, SKY), fR(2.450, 1.300, .1, 1.900, 0, CREAM), fR(1.200, 2.200, 2.600, .1, 0, CREAM), fR(4.700, 1.500, 1.300, 1.500, 0, '#ffffff'), fR(4.850, 1.650, 1, 1.200, 0, MINT),
    // desk with receptionist behind it
    person(2.300, .85, { shirt: TEAL, hair: '#22384a', long: 1 }), box(1, 1.250, 0, 3, .9, 1.050, TEAL), box(.9, 1.150, 1.050, 3.200, 1.100, .1, CREAM), box(1.500, 1.500, 1.150, .7, .1, .5, NAVY), fL(1.550, 1.220, .6, .36, 1.600, '#9fd3e6'),
    box(5.300, .3, 0, .6, .6, 1.250, '#ffffff'), box(5.400, .4, 1.250, .4, .4, .55, '#9fd3e6'), plant(6.300, .5, 0, 1.200),
    // sofa and table
    box(.25, 3.900, 0, .3, 2.600, 1.150, sh(CORAL, -.1)), box(.55, 3.900, 0, 1, 2.600, .5, CORAL), person(1.150, 4.700, { z: .5, sit: 1, shirt: '#6f9fb3', hair: '#5b3420' }),
    box(2.300, 4.500, 0, .9, .9, .4, SUN), box(2.500, 4.700, .4, .35, .25, .05, '#ffffff'),
    // kids corner
    box(4.800, 5.300, 0, .5, .5, .5, '#6f9fb3'), box(5.400, 5.500, 0, .5, .5, .5, SUN), box(5.050, 5.350, .5, .5, .5, .5, CORAL), person(5.900, 6.100, { s: .66, shirt: MINT, hair: '#3a2a22' }),
    person(4.100, 3.300, { shirt: SUN, hair: '#5b3420', long: 1, walk: 1 }),
    hot(2.500, 1.700, 2.300, 'checkin', 'Checking in'), hot(5.300, 0, 3.750, 'prices', 'The price list'), hot(1.100, 5.300, 1.900, 'wait', 'The waiting area'), hot(5.300, 5.600, 1.600, 'kids', 'The kids corner'),
  ].join(''), 'The reception: a desk, a sofa, a price list on the wall and a play corner for children');

  art.room = svg('-262 -160 524 420', [
    room(7, 7, 4, '#dfe9ea', '#eef7f2', '#e3f1ea'),
    // screen on the right wall, window on the left wall
    fL(3.300, 1.700, 2.700, 1.700, 0, NAVY), fL(3.400, 1.800, 2.500, 1.500, 0, '#274266'), tooth([4.650, 0, 1.950], 38, '#ffffff'), spark([5.400, 0, 2.900], 12),
    fR(3.600, 1.300, 2.400, 1.900, 0, SKY), fR(4.750, 1.300, .1, 1.900, 0, '#ffffff'),
    // cabinet and steriliser
    box(.3, .2, 0, 2.500, .8, 1.150, '#ffffff'), fL(.45, .2, 1, .8, 1, '#e3eaec'), fL(1.650, .2, 1, .8, 1, '#e3eaec'),
    box(.6, .3, 1.150, 1, .6, .6, '#cfd8dc'), fL(.75, 1.300, .5, .32, .9, NAVY), `<circle cx="${P(1.450, .9, 1.600)[0]}" cy="${P(1.450, .9, 1.600)[1]}" r="3" fill="#2fb37f"/>`, box(2, .4, 1.150, .5, .4, .3, MINT),
    person(2.200, 3.700, { shirt: TEAL, hair: '#22384a', long: 1, mask: 1 }),
    // lamp
    ln([2.700, 2.300, 0], [2.700, 2.300, 3.100], '#9aa7ab', 4), ln([2.700, 2.300, 3.100], [3.500, 2.700, 2.700], '#9aa7ab', 4),
    poly([[3.500, 2.700, 2.650], [3.100, 2.100, 1.200], [3.900, 2.900, 1.200]], '#ffe9b8', 'opacity=".45"'), `<ellipse cx="${P(3.500, 2.700, 2.650)[0]}" cy="${P(3.500, 2.700, 2.650)[1]}" rx="13" ry="7" fill="${SUN}"/>`,
    // chair with patient
    box(3.100, 3.100, 0, .9, .9, .35, '#9aa7ab'), box(3.200, 1.500, .85, .6, .5, .25, sh(TEAL, -.2)), box(3, 2, .6, 1, 1.100, .35, TEAL), box(3, 3.100, .45, 1, 1.300, .3, TEAL), box(3, 4.400, .35, 1, 1.200, .2, TEAL),
    box(3.150, 2.200, .95, .7, 1.900, .28, '#6f9fb3'), box(3.150, 4.100, .65, .7, 1.400, .2, '#22384a'),
    `<g transform="translate(${P(3.500, 1.900, 1.350).join(' ')})"><circle r="7.500" fill="#e8b48c"/><path d="M-7.500-1a7.500 7.500 0 0 1 15 0c-3-4-12-4-15 0z" fill="#5b3420"/><path d="M-2.500 2.500q2.500 2.500 5 0" fill="none" stroke="#7a2e38" stroke-width="1.300" stroke-linecap="round"/></g>`,
    // tray and dentist
    ln([4.900, 4, 0], [4.900, 4, 1], '#9aa7ab', 4), box(4.500, 3.700, 1, .8, .6, .08, '#e3eaec'), box(4.600, 3.800, 1.080, .12, .4, .04, '#9fd3e6'), box(4.850, 3.800, 1.080, .12, .4, .04, SUN), box(5.100, 3.800, 1.080, .08, .4, .04, '#9aa7ab'),
    person(4.500, 2.700, { shirt: '#ffffff', coat: 1, mask: 1, hair: '#22384a', legs: TEAL }), plant(6.300, .5, 0, 1.200),
    hot(1.100, .9, 2.300, 'sterile', 'Sterilised tools'), hot(4.650, 0, 3.700, 'screen', 'The screen'), hot(4.900, 4, 1.700, 'numb', 'Numbing'), hot(3.500, 3.300, 1.900, 'stop', 'The stop signal'),
  ].join(''), 'The treatment room: a patient in the chair, a dentist and an assistant, a steriliser and a screen on the wall');

  /* ---------- smiles ---------- */
  let uid = 0;
  const smile = (o = {}) => {
    const id = 'm' + uid++, shade = o.shade || '#ffffff';
    const teeth = [0, 1, 2, 3, 4, 5].map(i => {
      if (o.gap === i) return '';
      const mid = Math.abs(i - 2.500), x = 24.500 + i * 12, y = 13 + mid * mid * 1.100, h = 19 - mid * 1.800;
      const rot = o.crooked ? [9, -7, 11, -12, 6, -8][i] : 0, dy = o.crooked ? [0, 2, -1.500, 2.500, 0, 1.500][i] : 0;
      return `<rect x="${x}" y="${y + dy}" width="11.300" height="${h}" rx="3.200" fill="${shade}" transform="rotate(${rot} ${x + 5.600} ${y + 8})"/>` + (o.chip === i ? `<path d="M${x + 5} ${y + h + .5}l6.500-7v7.500z" fill="#7a2e38"/>` : '') + (o.braces ? `<rect x="${x + 3.600}" y="${y + 7}" width="4" height="4" rx="1" fill="#9aa7ab"/>` : '');
    }).join('');
    return `<svg viewBox="0 0 120 70" aria-hidden="true"><defs><clipPath id="${id}"><path d="M12 22Q60 6 108 22Q100 60 60 62Q20 60 12 22z"/></clipPath></defs>
      <g clip-path="url(#${id})"><rect width="120" height="70" fill="#7a2e38"/><ellipse cx="60" cy="62" rx="30" ry="14" fill="#e9785a"/>${teeth}
      ${o.braces ? '<path d="M22 27Q60 14 98 27" fill="none" stroke="#9aa7ab" stroke-width="1.300"/>' : ''}
      ${o.aligner ? '<path d="M22 14Q60 4 98 14L96 36Q60 30 24 36z" fill="#9fd3e6" opacity=".4" stroke="#6fb6cf" stroke-width="1"/>' : ''}
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${31 + i * 12}" y="${50 - Math.abs(i - 2) * 2.500}" width="11" height="14" rx="3" fill="${o.shade ? sh(shade, .15) : '#f4f1ea'}"/>`).join('')}</g>
      <path d="M12 22Q60 6 108 22Q100 60 60 62Q20 60 12 22z" fill="none" stroke="#c5573a" stroke-width="5" stroke-linejoin="round"/>
      ${o.sparkle ? '<use href="#spark" x="92" y="2" width="18" height="18" fill="#f6c95a"/><use href="#spark" x="10" y="40" width="10" height="10" fill="#f6c95a"/>' : ''}</svg>`;
  };
  art.end = svg('-110 -150 220 190', tooth([0, 0, 0], 120, '#ffffff', 'bob').replace('<use', '<use style="filter:drop-shadow(0 14px 16px rgba(20,48,44,.25))"') + `<g transform="translate(-22 -62)"><circle r="5" fill="#14302c"/><circle cx="44" r="5" fill="#14302c"/><path d="M4 16q18 16 36 0" fill="none" stroke="#14302c" stroke-width="5" stroke-linecap="round"/></g>` + spark([1.600, -1.200, 2.500], 26) + spark([-2.300, .6, 2.200], 16, 'twinkle', 1) + spark([1.400, 1.200, -.6], 14, 'twinkle', 1.800), 'A happy tooth');
  $$('[data-art]').forEach(el => { el.innerHTML = art[el.dataset.art]; });

  /* ---------- hotspots ---------- */
  const tips = {
    checkin: ['Check in at the desk', 'Give your name, that is it. If you booked on WhatsApp we already have your details.'],
    prices: ['Prices on the wall', 'The full price list hangs in reception. You never have to ask what something costs.'],
    wait: ['A short wait', 'Cold water, tea and wifi. Most people sit for under ten minutes.'],
    kids: ['Kids corner', 'Children can play first. Their first visit is only a look around and a ride in the chair.'],
    sterile: ['Sealed, sterilised tools', 'Every tool comes out of the steriliser in a sealed pouch that is opened in front of you.'],
    screen: ['See what we see', 'Photos of your teeth go up on the screen, and your dentist explains them in plain words.'],
    numb: ['Numb first, then wait', 'Gel on the gum, then the anaesthetic, then we wait until it works. You feel pressure and nothing else.'],
    stop: ['Raise a hand, we stop', 'You are in charge of the pace. Lift your left hand at any time and everything pauses.'],
  };
  $$('.scene').forEach(scene => {
    const hots = $$('.hot', scene), boxEl = $('[data-tipbox]', scene), found = $('[data-found]', scene);
    if (!hots.length) return;
    const show = h => {
      const [t, d] = tips[h.dataset.tip];
      hots.forEach(x => x.classList.remove('on')); h.classList.add('seen', 'on');
      boxEl.innerHTML = `<b>${t}</b>${d}`;
      const n = hots.filter(x => x.classList.contains('seen')).length;
      found.textContent = n === hots.length ? 'You have seen all of this room. Swipe on →' : `${n} of ${hots.length} found`;
    };
    hots.forEach(h => { h.addEventListener('click', () => show(h)); h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(h); } }); });
  });

  /* ---------- smile menu ---------- */
  const items = [
    ['Clean and polish', '45 min', 'Rp 450k', 'Nothing to numb', { sparkle: 1 }, ['We check every tooth and take photos', 'Scaling lifts the tartar a brush cannot', 'Polish, then tips for the spots you miss']],
    ['Whitening', '60 min', 'Rp 2.8m', 'Mild tingle at most', { sparkle: 1, shade: '#ffffff' }, ['We note your shade today', 'Gel and light, three short rounds', 'You compare the shade and take a home kit']],
    ['Filling', '30 min', 'Rp 550k', 'Fully numbed', { shade: '#fbf7ee' }, ['Numbing gel, then anaesthetic', 'The decay is cleaned out', 'A tooth-coloured filling is shaped and set']],
    ['Clear aligners', '6 to 12 months', 'from Rp 28m', 'No needles', { aligner: 1 }, ['A 3D scan, no putty', 'You see the end result before paying', 'New trays every two weeks, check-ups every eight']],
    ['Veneers', '2 visits', 'Rp 5.5m per tooth', 'Numbed, gentle', { sparkle: 1, shade: '#ffffff' }, ['We design the shape with you first', 'A thin layer is prepared and scanned', 'Porcelain is bonded on the second visit']],
    ['Crown', '2 visits', 'Rp 4.5m', 'Fully numbed', { shade: '#fbf7ee' }, ['The tooth is shaped and scanned', 'You wear a temporary cap for a week', 'The porcelain crown is fitted and checked']],
    ['Implant', '3 to 4 months', 'from Rp 18m', 'Numbed, with a specialist', {}, ['Scan and plan with the specialist', 'The implant is placed and left to heal', 'A crown is fixed on top']],
    ["Kids' check-up", '20 min', 'Rp 350k', 'No drills', { shade: '#ffffff', sparkle: 1 }, ['A ride in the chair', 'We count teeth together', 'A sticker, and tips for parents']],
  ];
  const menu = $('#menu'), detail = $('#detail');
  menu.innerHTML = items.map((m, i) => `<button class="pick" type="button" role="listitem" data-i="${i}" aria-pressed="false">${smile(m[4])}<b>${m[0]}</b><small>${m[2]}</small></button>`).join('');
  const pick = (i, scroll) => {
    const m = items[i];
    $$('.pick', menu).forEach((b, k) => b.setAttribute('aria-pressed', k === i));
    detail.innerHTML = `${smile(m[4])}<h3>${m[0]}</h3><div class="facts"><div><b>${m[1]}</b>time</div><div><b>${m[2]}</b>sample price</div><div><b>${m[3]}</b>comfort</div></div><ol>${m[5].map(s => `<li>${s}</li>`).join('')}</ol><a class="btn btn-solid" href="index.html#book">Book this</a>`;
    if (scroll && innerWidth <= 860) detail.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  };
  menu.addEventListener('click', e => { const b = e.target.closest('.pick'); if (b) pick(+b.dataset.i, true); });
  pick(1);

  /* ---------- results wall ---------- */
  const cases = [
    ['Whitening', 'Three shades brighter in one visit.', ['60 min', 'Rp 2.8m'], { shade: '#ead08a' }, { sparkle: 1 }],
    ['Clear aligners', 'Crowded front teeth, straightened without braces.', ['9 months', 'No needles'], { crooked: 1 }, { sparkle: 1 }],
    ['Implant and crown', 'A missing tooth replaced, matched to its neighbours.', ['4 months', 'With a specialist'], { gap: 3, shade: '#fbf7ee' }, { shade: '#fbf7ee' }],
    ['Chipped tooth', 'A chipped edge rebuilt with bonding.', ['40 min', 'Rp 750k'], { chip: 2 }, {}],
    ['Braces', 'A full bite correction for a teenager.', ['18 months', 'Check-ups every 6 weeks'], { crooked: 1, braces: 1 }, { sparkle: 1 }],
    ['Deep clean', 'Years of coffee and tea stains lifted.', ['45 min', 'Rp 450k'], { shade: '#e6d6a8' }, { shade: '#fbf7ee' }],
  ];
  $('#results').innerHTML = cases.map(c => `<article class="res"><div class="cmp">${smile(c[3])}<div class="after">${smile(c[4])}</div><i class="b">Before</i><i class="a">After</i><span class="knob">↔</span><input type="range" min="0" max="100" value="50" aria-label="${c[0]}: drag to compare before and after"></div><h3>${c[0]}</h3><p>${c[1]}</p><div class="meta">${c[2].map(t => `<span>${t}</span>`).join('')}</div></article>`).join('');
  $('#results').addEventListener('input', e => { if (e.target.matches('input')) e.target.closest('.cmp').style.setProperty('--p', e.target.value + '%'); });
  $$('.cmp .after svg').forEach(s => { s.style.width = '100%'; });

  /* ---------- walking between rooms ---------- */
  const stage = $('#stage'), scenes = $$('.scene'), N = scenes.length, dots = $('#dots'), prev = $('#prev'), next = $('#next'), hint = $('#hint');
  dots.innerHTML = scenes.map((s, i) => `<li><button type="button" data-go="${i}" aria-label="${s.dataset.name}"><span>${s.dataset.name}</span></button></li>`).join('');
  let t = 0, cur = 0, raf = 0;
  const render = () => {
    scenes.forEach((s, i) => {
      const d = t - i, a = Math.abs(d), on = a < 1;
      s.style.visibility = on ? 'visible' : 'hidden';
      if (!on) return;
      s.style.opacity = (1 - a * a).toFixed(3);
      s.style.pointerEvents = a < .5 ? 'auto' : 'none';
      s.style.zIndex = a < .5 ? 2 : 1;
      // leaving: we walk into the picture. arriving: the next room comes closer.
      s.style.transform = reduce ? '' : `translate3d(${(-d * 6).toFixed(2)}%,0,0) scale(${(d > 0 ? 1 + d * 1.300 : 1 + d * .32).toFixed(3)})`;
      s.style.transformOrigin = d > 0 && i === 0 ? '36% 62%' : '50% 55%';
    });
  };
  const settle = () => {
    cur = Math.round(t);
    scenes.forEach((s, i) => { s.inert = i !== cur; });
    $$('button', dots).forEach((b, i) => b.setAttribute('aria-current', i === cur ? 'step' : 'false'));
    prev.disabled = cur === 0; next.disabled = cur === N - 1;
    if (cur > 0) hint.classList.add('gone');
  };
  const go = i => {
    i = Math.max(0, Math.min(N - 1, i));
    cancelAnimationFrame(raf);
    const from = t, t0 = performance.now(), dur = reduce ? 0 : 520 + Math.abs(i - from) * 180;
    const step = now => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
      t = from + (i - from) * e; render();
      if (k < 1) raf = requestAnimationFrame(step); else { t = i; render(); settle(); }
    };
    cur = i; settle(); raf = requestAnimationFrame(step);
  };
  document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) go(+g.dataset.go); });
  document.addEventListener('keydown', e => {
    if (e.target.matches('input')) return;
    if (e.key === 'ArrowRight') go(cur + 1); else if (e.key === 'ArrowLeft') go(cur - 1);
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.door')) { e.preventDefault(); go(1); }
  });
  prev.addEventListener('click', () => go(cur - 1)); next.addEventListener('click', () => go(cur + 1));

  // swipe
  let sx = 0, sy = 0, st = 0, drag = 0, pid = null;
  stage.addEventListener('pointerdown', e => { if (e.target.closest('input, .hot') || (e.pointerType === 'mouse' && e.button)) return; cancelAnimationFrame(raf); sx = e.clientX; sy = e.clientY; st = t; drag = 1; pid = e.pointerId; });
  stage.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== pid) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (drag === 1) { if (Math.abs(dx) < 10) return; if (Math.abs(dy) > Math.abs(dx)) { drag = 0; return; } drag = 2; stage.setPointerCapture(pid); }
    t = Math.max(-.12, Math.min(N - .88, st - dx / (innerWidth * .8))); render();
  });
  const end = e => {
    if (!drag || e.pointerId !== pid) return;
    if (drag === 2) { const d = t - st; go(Math.abs(d) > .14 ? Math.round(st) + Math.sign(d) : Math.round(st)); }
    drag = 0;
  };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  stage.addEventListener('click', e => { if (Math.abs(t - Math.round(t)) > .02) e.stopPropagation(); }, true);

  // wheel and trackpad
  let cool = 0;
  stage.addEventListener('wheel', e => {
    const sc = scenes[cur], horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!horiz && sc.scrollHeight > sc.clientHeight + 4) return;
    const dlt = horiz ? e.deltaX : e.deltaY, now = Date.now();
    if (Math.abs(dlt) < 18 || now < cool) return;
    cool = now + 900; go(cur + Math.sign(dlt));
  }, { passive: true });

  // a little 3D tilt on the drawings when the mouse moves
  if (!reduce && matchMedia('(hover: hover)').matches) stage.addEventListener('pointermove', e => {
    if (drag === 2) return;
    const a = $('.art svg', scenes[cur]); if (!a) return;
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    a.style.transform = `rotateY(${(x * 9).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg) translate3d(${(x * -14).toFixed(1)}px,${(y * -10).toFixed(1)}px,0)`;
  });

  render(); settle();
})();
