// Timeline for the toothpaste reel. Inlined into index.html by build.mjs.
// T.s[i] = start of scene i+1 (seconds), so everything follows timing.json.
(function () {
  const tl = gsap.timeline({ paused: true });
  const S = T.s;
  const has = (id) => document.getElementById(id);
  const face = (actor, name, t) => {
    tl.set("#" + actor + " .gf", { opacity: 0 }, t);
    tl.set("#" + actor + " .gf-" + name, { opacity: 1 }, t);
  };
  // gentle life so nothing sits still
  const bob = (sel, t0, t1, amt, per) => {
    const n = Math.max(1, Math.round((t1 - t0) / per));
    for (let i = 0; i < n; i++)
      tl.to(sel, { y: (i % 2 ? 0 : -amt), duration: (t1 - t0) / n, ease: "sine.inOut" }, t0 + i * (t1 - t0) / n);
  };

  // ---------- Scene 1: hook ----------
  if (has("s1")) {
    const a = S[0], d = S[1] - S[0];
    tl.fromTo("#s1hl", { scale: 1.22 }, { scale: 1, duration: 0.3, ease: "back.out(2.4)" }, a);
    tl.fromTo("#s1roman", { y: 90 }, { y: 0, duration: 0.35, ease: "back.out(1.8)" }, a);
    tl.fromTo("#s1arm", { rotation: -34 }, { rotation: -34, duration: 0.01 }, a);
    tl.to("#s1arm", { rotation: 0, duration: 0.28, ease: "power3.in" }, a + 0.55);
    tl.set("#wet", { opacity: 0 }, a);
    tl.set("#wet", { opacity: 1 }, a + 0.83);
    // splash
    [[-130, -210], [-60, -290], [10, -320], [80, -270], [150, -190]].forEach(([x, y], i) => {
      tl.fromTo("#s1drops i:nth-child(" + (i + 1) + ")", { x: 0, y: 0, opacity: 1, scale: 1 },
        { x: x, y: y, duration: 0.3, ease: "power2.out" }, a + 0.83);
      tl.to("#s1drops i:nth-child(" + (i + 1) + ")", { y: y + 330, opacity: 0, duration: 0.4, ease: "power2.in" }, a + 1.13);
    });
    // punch zoom on the jar
    tl.to("#s1cam", { scale: 1.42, duration: 0.22, ease: "power4.out" }, a + 0.85);
    tl.fromTo("#s1jar", { rotation: 0 }, { rotation: 4, duration: 0.08, yoyo: true, repeat: 3, ease: "sine.inOut" }, a + 0.85);
    tl.to("#s1cam", { scale: 1.5, duration: 0.6, ease: "none" }, a + 1.07);
    tl.to("#s1cam", { scale: 1, duration: 0.3, ease: "power3.inOut" }, a + 1.67);
    tl.to("#s1arm", { rotation: -22, duration: 0.3, ease: "back.out(2)" }, a + 1.5);
    tl.fromTo("#s1pee", { scale: 1 }, { scale: 1.18, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" }, a + 0.85);
    // Gigi pops in, horrified, then gags
    tl.fromTo("#s1gigi", { y: 900, rotation: 12 }, { y: 0, rotation: 0, duration: 0.3, ease: "back.out(2.2)" }, a + 1.75);
    face("s1gigi", "shock", a);
    face("s1gigi", "gag", a + 2.3);
    tl.fromTo("#s1gigi", { x: 0 }, { x: -12, duration: 0.07, yoyo: true, repeat: 7, ease: "sine.inOut" }, a + 2.3);
    tl.to("#s1gigi", { scaleY: 0.9, scaleX: 1.08, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" }, a + 2.3);
    bob("#s1roman", a + 0.4, a + d, 10, 0.5);
  }

  // ---------- Scene 5: pig hair brush (animated fully in the next pass) ----------
  if (has("s5")) {
    const a = S[4], d = S[5] - S[4];
    tl.fromTo("#s5hl", { scale: 1.2 }, { scale: 1, duration: 0.3, ease: "back.out(2.4)" }, a);
    tl.fromTo("#s5pig", { x: -700 }, { x: 0, duration: 0.4, ease: "back.out(1.4)" }, a);
    tl.fromTo("#s5brush", { y: -500 }, { y: 0, duration: 0.4, ease: "back.out(1.6)" }, a + 1.6);
    bob("#s5pig", a + 0.5, a + d, 8, 0.45);
  }

  // ---------- Scene 6: the twist ----------
  if (has("s6")) {
    const a = S[5], d = S[6] - S[5];
    tl.fromTo("#s6grey", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, a + 0.05);
    tl.fromTo("#s6dim", { opacity: 0 }, { opacity: 0.3, duration: 0.4, ease: "power2.out" }, a + 0.1);
    tl.fromTo("#s6cam", { scale: 1.06, rotation: -1.2 }, { scale: 1, rotation: 0, duration: 0.18, ease: "power4.out" }, a);
    tl.fromTo("#s6pause", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.15, ease: "back.out(3)" }, a + 0.05);
    tl.to("#s6pause", { opacity: 0, duration: 0.01 }, a + 0.55);
    tl.to("#s6pause", { opacity: 1, duration: 0.01 }, a + 0.8);
    tl.fromTo("#s6gigi", { y: 760, rotation: -20 }, { y: 0, rotation: 0, duration: 0.4, ease: "back.out(1.7)" }, a + 0.5);
    ["#s6a", "#s6b", "#s6c", "#s6d"].forEach((s, i) => {
      const t = a + [1.9, 2.5, 3.0, 3.4][i] * d / 5;
      tl.fromTo(s, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2.2)" }, t);
    });
    tl.fromTo("#s6gigi", { scale: 1 }, { scale: 1.12, duration: 0.2, ease: "back.out(3)" }, a + 3.4 * d / 5);
    tl.to("#s6cam", { scale: 1.09, duration: d - 0.6, ease: "none" }, a + 0.6);
    bob("#s6gigi", a + 1, a + 3.2 * d / 5, 12, 0.5);
  }

  // ---------- Scene 8: the villain ----------
  if (has("s8")) {
    const a = S[7], d = S[8] - S[7];
    const hit = a + d * 0.6; // "Sugar." lands here; re-timed to the real word later
    tl.fromTo("#s8light", { opacity: 0 }, { opacity: 0.25, duration: 0.3 }, a);
    tl.fromTo("#s8light", { rotation: -7, transformOrigin: "540px 0px" }, { rotation: 7, duration: hit - a - 0.5, ease: "sine.inOut" }, a);
    tl.to("#s8light", { rotation: 0, opacity: 1, duration: 0.12, ease: "power4.out" }, hit);
    tl.fromTo("#s8sugar", { y: 1000 }, { y: 880, duration: hit - a - 0.5, ease: "power1.out" }, a);
    tl.to("#s8sugar", { y: 0, duration: 0.2, ease: "back.out(2.6)" }, hit);
    tl.fromTo("#s8sugar", { scale: 1 }, { scale: 1.07, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, hit + 0.2);
    tl.fromTo("#s8t", { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)" }, hit);
    tl.fromTo("#s8flash", { opacity: 0 }, { opacity: 0.9, duration: 0.04 }, hit);
    tl.to("#s8flash", { opacity: 0, duration: 0.3, ease: "power2.out" }, hit + 0.04);
    tl.fromTo("#s8cam", { scale: 1 }, { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }, hit);
    tl.fromTo("#s8gigi", { y: 300 }, { y: 0, duration: 0.25, ease: "back.out(2)" }, a + 0.3);
    tl.fromTo("#s8gigi", { x: 0 }, { x: 8, duration: 0.06, yoyo: true, repeat: Math.floor((d - 0.6) / 0.06), ease: "sine.inOut" }, a + 0.6);
  }

  // ---------- year ticker ----------
  if (has("ticker")) {
    const ROW = 92, W = { "3000 BC": 400, "100 AD": 360, "1400s": 330, "1000 AD": 380, "1500s": 330, "1800s": 330, "TODAY": 330, "15,000 YEARS AGO": 640 };
    // when each label lands: scene 3,4,5,7,9,10(1800s),10(today),11,12
    const at = [S[2], S[3], S[4], S[6], S[8], S[9], S[9] + (S[10] - S[9]) * 0.45, S[10], S[11]];
    tl.fromTo("#tpill", { y: -320 }, { y: 0, duration: 0.3, ease: "back.out(1.8)" }, S[2]);
    T.years.forEach((yr, i) => {
      const w = W[yr];
      if (i === 0) { tl.set("#tstrip", { y: 0 }, 0); tl.set("#tpill", { width: w, marginLeft: -w / 2 }, 0); return; }
      tl.to("#tstrip", { y: -ROW * 3 * i, duration: 0.45, ease: "back.out(1.3)" }, at[i]);
      tl.to("#tpill", { width: w, marginLeft: -w / 2, duration: 0.3, ease: "power2.out" }, at[i] + 0.1);
      tl.fromTo("#tpill", { scale: 1 }, { scale: 1.12, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, at[i] + 0.38);
    });
    // dim for the dark villain scene
    tl.to("#ticker", { opacity: 0, duration: 0.2 }, S[7]);
    tl.to("#ticker", { opacity: 1, duration: 0.2 }, S[8]);
  }

  // ---------- subtitles ----------
  T.subs.forEach((chunk, i) => {
    const c = "#ck" + i, start = chunk[0][0], end = T.subs[i + 1] ? Math.min(T.subs[i + 1][0][0], chunk[chunk.length - 1][1] + 0.5) : chunk[chunk.length - 1][1] + 0.4;
    tl.set(c, { opacity: 1 }, start);
    tl.set(c, { opacity: 0 }, end);
    chunk.forEach(([s, e], j) => {
      const w = "#w" + i + "_" + j;
      tl.set(w, { color: T.mint, scale: 1.1 }, s);
      if (chunk[j + 1]) tl.set(w, { color: "#ffffff", scale: 1 }, chunk[j + 1][0]);
    });
  });

  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;
  tl.seek(0);
})();
