// Timeline for the toothpaste reel. Inlined into index.html by build.mjs.
// T.s[i] = start of scene i+1 (seconds). cue("word") = when the voice says it.
(function () {
  const tl = gsap.timeline({ paused: true });
  const S = T.s, END = T.end;
  const has = (id) => document.getElementById(id);
  const cue = (str, n) => {
    const exact = str[0] === "=", key = exact ? str.slice(1) : str;
    const m = T.words.filter((w) => { const x = w[0].toLowerCase().replace(/[^a-z0-9']/g, ""); return exact ? x === key : x.indexOf(key) === 0; });
    return (m[n || 0] || m[0] || ["", 0])[1];
  };
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
  const slam = (sel, t, from) => tl.fromTo(sel, { opacity: 0, scale: from || 1.7 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2.2)" }, t);
  const rise = (sel, t, dy) => tl.fromTo(sel, { y: dy || 700 }, { y: 0, duration: 0.32, ease: "back.out(1.8)" }, t);
  const shake = (sel, t, amt) => tl.fromTo(sel, { x: 0 }, { x: amt || 14, duration: 0.04, yoyo: true, repeat: 5, ease: "sine.inOut" }, t);
  const jitter = (sel, t0, t1, amt) => tl.fromTo(sel, { rotation: -(amt || 3) }, { rotation: amt || 3, duration: 0.09, yoyo: true, repeat: Math.max(1, Math.floor((t1 - t0) / 0.09)), ease: "sine.inOut" }, t0);
  const squash = (sel, t) => tl.fromTo(sel, { scaleY: 1, scaleX: 1 }, { scaleY: 0.82, scaleX: 1.1, duration: 0.09, yoyo: true, repeat: 1, ease: "power2.out" }, t);

  // ---------- Scene 1: hook ----------
  {
    const a = S[0], d = S[1] - S[0];
    tl.fromTo("#s1hl", { scale: 1.22 }, { scale: 1, duration: 0.3, ease: "back.out(2.4)" }, a);
    tl.fromTo("#s1roman", { y: 90 }, { y: 0, duration: 0.35, ease: "back.out(1.8)" }, a);
    tl.fromTo("#s1arm", { rotation: -34 }, { rotation: -34, duration: 0.01 }, a);
    tl.to("#s1arm", { rotation: 0, duration: 0.28, ease: "power3.in" }, a + 0.55);
    tl.set("#wet", { opacity: 0 }, a);
    tl.set("#wet", { opacity: 1 }, a + 0.83);
    [[-130, -210], [-60, -290], [10, -320], [80, -270], [150, -190]].forEach(([x, y], i) => {
      const s = "#s1drops i:nth-child(" + (i + 1) + ")";
      tl.fromTo(s, { x: 0, y: 0, opacity: 0 }, { x: x, y: y, opacity: 1, duration: 0.3, ease: "power2.out" }, a + 0.83);
      tl.to(s, { y: y + 330, opacity: 0, duration: 0.4, ease: "power2.in" }, a + 1.13);
    });
    tl.to("#s1cam", { scale: 1.42, duration: 0.22, ease: "power4.out" }, a + 0.85);
    tl.fromTo("#s1jar", { rotation: 0 }, { rotation: 4, duration: 0.08, yoyo: true, repeat: 3, ease: "sine.inOut" }, a + 0.85);
    tl.to("#s1cam", { scale: 1.5, duration: 0.5, ease: "none" }, a + 1.07);
    tl.to("#s1cam", { scale: 1, duration: 0.28, ease: "power3.inOut" }, a + 1.57);
    tl.to("#s1arm", { rotation: -22, duration: 0.3, ease: "back.out(2)" }, a + 1.45);
    tl.fromTo("#s1pee", { scale: 1 }, { scale: 1.18, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" }, cue("pee"));
    tl.fromTo("#s1gigi", { y: 900, rotation: 12 }, { y: 0, rotation: 0, duration: 0.3, ease: "back.out(2.2)" }, a + 1.6);
    face("s1gigi", "shock", a);
    face("s1gigi", "gag", a + 2.1);
    tl.fromTo("#s1gigi", { x: 0 }, { x: -12, duration: 0.07, yoyo: true, repeat: 7, ease: "sine.inOut" }, a + 2.1);
    bob("#s1roman", a + 0.4, a + d, 10, 0.5);
  }

  // ---------- Scene 2: imported ----------
  {
    const a = S[1], b = S[2], imp = cue("imported"), str = cue("because");
    tl.fromTo("#s2jar", { y: 0, scale: 1 }, { y: 0, scale: 1.08, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, a);
    face("s2gigi", "yuck", a);
    rise("#s2gigi", a, 500);
    jitter("#s2gigi", a + 0.4, imp, 3);
    // jar drops away, the map takes over, ship sails Portugal to Rome
    tl.to("#s2jar", { y: 1100, duration: 0.25, ease: "power2.in" }, imp - 0.3);
    tl.fromTo("#s2ship", { x: 10, y: 880, rotation: -6 }, { x: 10, y: 880, rotation: -6, duration: 0.01 }, a);
    tl.to("#s2ship", { x: 230, y: 1040, rotation: 6, duration: (str - imp) * 0.4, ease: "sine.in" }, imp);
    tl.to("#s2ship", { x: 520, y: 950, rotation: -8, duration: (str - imp) * 0.35, ease: "none" }, imp + (str - imp) * 0.4);
    tl.to("#s2ship", { x: 690, y: 720, rotation: -4, duration: (str - imp) * 0.25, ease: "sine.out" }, imp + (str - imp) * 0.75);
    slam("#s2a", a + 0.1); slam("#s2b", cue("portugal"));
    // jar comes back up, stamped PREMIUM
    tl.to("#s2jar", { y: 0, duration: 0.25, ease: "back.out(1.8)" }, str);
    tl.fromTo("#s2lab", { opacity: 0, x: 200 }, { opacity: 1, x: 0, duration: 0.2, ease: "back.out(2)" }, str + 0.2);
    const st = cue("stronger");
    tl.fromTo("#s2stamp", { opacity: 0, scale: 3.2, rotation: -30 }, { opacity: 1, scale: 1, rotation: -12, duration: 0.14, ease: "power4.in" }, st - 0.14);
    shake("#s2cam", st, 16);
    squash("#s2jar", st);
    face("s2gigi", "shock", st);
    tl.fromTo("#s2gigi", { scale: 1 }, { scale: 1.15, duration: 0.12, yoyo: true, repeat: 1 }, st);
    tl.to("#s2stamp", { scale: 1.06, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" }, st + 0.15);
  }

  // ---------- Scene 3: Egypt ----------
  {
    const a = S[2], b = S[3];
    slam("#s3a", a + 0.05); slam("#s3b", cue("ox")); slam("#s3c", cue("eggshells") - 0.15);
    rise("#s3mortar", a, 600); rise("#s3gigi", a + 0.15, 500);
    const drop = (sel, t) => { tl.fromTo(sel, { y: -1800, rotation: -40 }, { y: 30, rotation: 10, duration: 0.3, ease: "power2.in" }, t - 0.3); squash("#s3mortar", t); };
    drop("#s3hoof", cue("hoof")); drop("#s3ash", cue("ashes")); drop("#s3egg", cue("eggshells") + 0.1);
    // grinding loop
    tl.fromTo("#s3pestle", { y: -900 }, { y: 0, duration: 0.25, ease: "power2.out" }, a + 0.3);
    tl.fromTo("#s3pestle", { rotation: 16 }, { rotation: -16, duration: 0.2, yoyo: true, repeat: Math.floor((b - a - 0.7) / 0.2), ease: "sine.inOut" }, a + 0.6);
    // powder puffs
    const puff = (t) => [[-170, -150], [-60, -230], [40, -250], [150, -170], [250, -90], [-250, -70]].forEach(([x, y], i) => {
      const s = "#s3puff i:nth-child(" + (i + 1) + ")";
      tl.fromTo(s, { x: 0, y: 0, scale: 0.3, opacity: 0.95 }, { x: x, y: y, scale: 1.6, opacity: 0, duration: 0.55, ease: "power2.out" }, t + i * 0.02);
    });
    puff(cue("ashes")); puff(cue("eggshells") + 0.1);
    face("s3gigi", "look", a); face("s3gigi", "cough", cue("ashes") + 0.1);
    tl.fromTo("#s3gigi", { scaleY: 1 }, { scaleY: 0.88, duration: 0.12, yoyo: true, repeat: 7, ease: "power2.out" }, cue("ashes") + 0.1);
  }

  // ---------- Scene 4: bones and oysters ----------
  {
    const a = S[3], b = S[4];
    slam("#s4a", cue("crushed", 1) - 0.1); slam("#s4b", cue("bones")); slam("#s4c", cue("oyster"));
    rise("#s4bones", a, 500); rise("#s4oyster", a + 0.08, 500); rise("#s4gigi", a + 0.1, 500);
    tl.set(["#s4grit1", "#s4grit2"], { opacity: 0 }, a);
    tl.fromTo("#s4hammer", { rotation: 50, x: -260, y: 0 }, { rotation: 50, x: -260, duration: 0.01 }, a);
    jitter("#s4bones", a + 0.4, cue("bones") - 0.2, 2);
    const hit = (t, x, target, grit, n0) => {
      tl.to("#s4hammer", { rotation: 55, x: x, duration: 0.14, ease: "power2.out" }, t - 0.26);
      tl.to("#s4hammer", { rotation: -8, duration: 0.1, ease: "power4.in" }, t - 0.1);
      tl.to("#s4hammer", { rotation: 30, duration: 0.2, ease: "power2.out" }, t + 0.03);
      shake("#s4cam", t, 18);
      if (target) { tl.set(target, { opacity: 0 }, t); tl.set(grit, { opacity: 1 }, t); }
      squash(grit, t);
      for (let i = 0; i < 5; i++) {
        const s = "#s4chips i:nth-child(" + (n0 + i + 1) + ")";
        tl.fromTo(s, { x: x + 150, y: 0, opacity: 1, rotation: 0 }, { x: x + 150 + (i - 2) * 110, y: -260 - (i % 2) * 120, rotation: 200, duration: 0.3, ease: "power2.out" }, t);
        tl.to(s, { y: 120, opacity: 0, duration: 0.3, ease: "power2.in" }, t + 0.3);
      }
      squash("#s4gigi", t);
    };
    hit(cue("bones"), -260, "#s4bones", "#s4grit1", 0);
    hit(cue("oyster"), 150, "#s4oyster", "#s4grit2", 5);
    hit(cue("shells"), 150, null, "#s4grit2", 5);
    hit(Math.min(b - 0.25, cue("shells") + 0.45), -260, null, "#s4grit1", 0);
  }

  // ---------- Scene 5: pig hair brush ----------
  {
    const a = S[4], b = S[5];
    slam("#s5hl .tag", cue("first")); slam("#s5hl .l2", cue("hair"));
    tl.fromTo("#s5pig", { x: -800 }, { x: 0, duration: 0.4, ease: "back.out(1.4)" }, a);
    tl.fromTo("#s5brush", { y: -700 }, { y: 0, duration: 0.35, ease: "back.out(1.6)" }, cue("toothbrush") - 0.1);
    tl.set("#s5brush .tuft", { opacity: 0 }, a);
    rise("#s5gigi", a + 0.2, 500);
    [cue("hair"), cue("pig's"), cue("neck")].forEach((t, i) => {
      const s = "#s5fly i:nth-child(" + (i + 1) + ")";
      tl.fromTo(s, { x: 0, y: 0, opacity: 1, rotation: 0 }, { x: 510 + i * 40, y: -300, rotation: -200, duration: 0.24, ease: "power2.out" }, t);
      tl.set(s, { opacity: 0 }, t + 0.24);
      tl.set("#s5brush .tuft:nth-child(" + (i * 2 + 1) + ")", { opacity: 1 }, t + 0.24);
      tl.set("#s5brush .tuft:nth-child(" + (i * 2 + 2) + ")", { opacity: 1 }, t + 0.24);
      squash("#s5pig", t);
      tl.fromTo("#s5pig", { rotation: 0 }, { rotation: -4, duration: 0.08, yoyo: true, repeat: 1 }, t);
      squash("#s5brush", t + 0.24);
    });
    bob("#s5pig", a + 0.5, cue("hair") - 0.05, 8, 0.4);
    jitter("#s5gigi", a + 0.6, b, 2);
  }

  // ---------- Scene 6: the twist ----------
  {
    const a = S[5], d = S[6] - S[5];
    tl.fromTo("#s6grey", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, a + 0.05);
    tl.fromTo("#s6dim", { opacity: 0 }, { opacity: 0.3, duration: 0.4, ease: "power2.out" }, a + 0.1);
    tl.fromTo("#s6cam", { scale: 1.06, rotation: -1.2 }, { scale: 1, rotation: 0, duration: 0.18, ease: "power4.out" }, a);
    tl.fromTo("#s6pause", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.15, ease: "back.out(3)" }, a + 0.05);
    tl.to("#s6pause", { opacity: 0, duration: 0.01 }, a + 0.55);
    tl.to("#s6pause", { opacity: 1, duration: 0.01 }, a + 0.8);
    tl.to("#s6pause", { opacity: 0, duration: 0.01 }, a + 1.3);
    tl.to("#s6pause", { opacity: 1, duration: 0.01 }, a + 1.55);
    tl.fromTo("#s6gigi", { y: 760, rotation: -20 }, { y: 0, rotation: 0, duration: 0.4, ease: "back.out(1.7)" }, a + 0.5);
    slam("#s6a", cue("lot") - 0.1); slam("#s6b", cue("better") - 0.05); slam("#s6c", cue("teeth", 1)); slam("#s6d", cue("=you"));
    tl.fromTo("#s6gigi", { scale: 1 }, { scale: 1.12, duration: 0.2, ease: "back.out(3)" }, cue("=you"));
    tl.to("#s6cam", { scale: 1.09, duration: d - 0.6, ease: "none" }, a + 0.6);
    bob("#s6gigi", a + 1, cue("=you") - 0.05, 12, 0.45);
    jitter("#s6d", cue("=you") + 0.25, a + d, 2);
  }

  // ---------- Scene 7: medieval proof ----------
  {
    const a = S[6], b = S[7];
    slam("#s7a", a + 0.1); slam("#s7b", cue("worn")); slam("#s7c", cue("almost") - 0.1);
    rise("#s7skull", a, 800); rise("#s7gigi", a + 0.2, 500);
    bob("#s7skull", a + 0.4, cue("worn"), 10, 0.5);
    tl.fromTo("#jaw", { y: 0 }, { y: 26, duration: 0.16, yoyo: true, repeat: 9, ease: "sine.inOut" }, a + 0.5);
    // scanner sweep
    const sc0 = cue("worn"), sc1 = cue("=no");
    tl.fromTo("#s7scan", { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 0.1 }, sc0);
    tl.to("#s7scan", { y: 540, duration: (sc1 - sc0) * 0.55, ease: "sine.inOut" }, sc0 + 0.1);
    tl.to("#s7scan", { y: 300, duration: (sc1 - sc0) * 0.35, ease: "sine.inOut" }, sc0 + 0.1 + (sc1 - sc0) * 0.55);
    tl.to("#s7scan", { opacity: 0, duration: 0.15 }, sc1);
    tl.fromTo("#s7badge", { opacity: 0, scale: 0, rotation: -40 }, { opacity: 1, scale: 1, rotation: 10, duration: 0.3, ease: "back.out(2.4)" }, sc1);
    tl.to("#s7badge", { rotation: 4, scale: 1.06, duration: 0.3, yoyo: true, repeat: 2, ease: "sine.inOut" }, sc1 + 0.3);
    face("s7gigi", "wow", a); face("s7gigi", "proud", sc1);
    squash("#s7gigi", sc1);
    bob("#s7gigi", a + 0.6, sc1, 8, 0.45);
  }

  // ---------- Scene 8: the villain ----------
  {
    const a = S[7], d = S[8] - S[7], hit = cue("sugar");
    tl.fromTo("#s8light", { opacity: 0 }, { opacity: 0.25, duration: 0.3 }, a);
    tl.fromTo("#s8light", { rotation: -7, transformOrigin: "540px 0px" }, { rotation: 7, duration: hit - a - 0.3, ease: "sine.inOut" }, a);
    tl.to("#s8light", { rotation: 0, opacity: 1, duration: 0.12, ease: "power4.out" }, hit);
    tl.fromTo("#s8sugar", { y: 1000 }, { y: 880, duration: hit - a - 0.3, ease: "power1.out" }, a);
    tl.to("#s8sugar", { y: 0, duration: 0.2, ease: "back.out(2.6)" }, hit);
    tl.fromTo("#s8sugar", { scale: 1 }, { scale: 1.07, duration: 0.22, yoyo: true, repeat: 5, ease: "sine.inOut" }, hit + 0.2);
    tl.fromTo("#s8t", { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)" }, hit);
    tl.fromTo("#s8flash", { opacity: 0 }, { opacity: 0.9, duration: 0.04 }, hit);
    tl.to("#s8flash", { opacity: 0, duration: 0.3, ease: "power2.out" }, hit + 0.04);
    tl.fromTo("#s8cam", { scale: 1 }, { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }, hit);
    tl.fromTo("#s8gigi", { y: 300 }, { y: 0, duration: 0.25, ease: "back.out(2)" }, a + 0.3);
    tl.fromTo("#s8gigi", { x: 0 }, { x: 8, duration: 0.06, yoyo: true, repeat: Math.floor((d - 0.6) / 0.06), ease: "sine.inOut" }, a + 0.6);
  }

  // ---------- Scene 9: the Queen ----------
  {
    const a = S[8], b = S[9];
    slam("#s9a", a + 0.1); slam("#s9b", cue("rich"));
    rise("#s9queen", a, 900); rise("#s9tray", a + 0.1, 500); rise("#s9gigi", a + 0.5, 400);
    tl.fromTo("#s9lab", { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: 0.22, ease: "back.out(2)" }, cue("marzipan") - 0.1);
    const t0 = cue("queen"), t1 = cue("price");
    for (let i = 0; i < 6; i++) {
      const t = t0 + (t1 - t0) * i / 5;
      if (i < 5) {
        const s = "#s9bites i:nth-child(" + (i + 1) + ")";
        tl.fromTo(s, { x: (i - 2) * 60, y: 0, opacity: 1, scale: 1 }, { x: 0, y: -235, scale: 0.7, duration: 0.22, ease: "power2.out" }, t - 0.22);
        tl.set(s, { opacity: 0 }, t);
      }
      tl.set(gsap.utils.toArray("#s9queen .rot")[i], { opacity: 1 }, t + 0.08);
      squash("#s9queen", t);
    }
    bob("#s9queen", a + 0.5, t0 - 0.1, 8, 0.45);
    jitter("#s9gigi", a + 0.9, b, 2);
    tl.fromTo("#s9cam", { scale: 1, transformOrigin: "540px 1050px" }, { scale: 1.12, duration: 1.2, ease: "power1.inOut" }, cue("teeth", 2) - 0.2);
  }

  // ---------- Scene 10: sugar for everyone ----------
  {
    const a = S[9], b = S[10], ev = cue("everyone");
    slam("#s10a", cue("sugar", 1) - 0.25); slam("#s10b", ev);
    rise("#s10fac", a, 900); rise("#s10gigi", a + 0.2, 500);
    squash("#s10fac", a + 0.5); squash("#s10fac", a + 0.9); squash("#s10fac", a + 1.3);
    for (let i = 0; i < 4; i++) {
      tl.fromTo("#s10smoke i:nth-child(" + (i + 1) + ")", { x: (i % 2) * 110, y: 0, scale: 0.4, opacity: 0.95 }, { x: (i % 2) * 110 + 60, y: -330, scale: 1.5, opacity: 0, duration: 0.9, ease: "power1.out" }, a + 0.25 + i * 0.3);
      tl.fromTo("#s10c" + i, { x: 0, opacity: 1 }, { x: 420, duration: 0.7, ease: "none" }, a + 0.3 + i * 0.3);
    }
    tl.fromTo("#s10graph", { y: 1200 }, { y: 1200, duration: 0.01 }, a);
    tl.set("#s10lab", { opacity: 0 }, a);
    // today: factory out, candy rain, graph climbs
    tl.to(["#s10fac", "#s10cubes", "#s10smoke"], { x: -1100, duration: 0.25, ease: "power2.in" }, ev - 0.25);
    tl.to("#s10graph", { y: 0, duration: 0.28, ease: "back.out(1.5)" }, ev - 0.05);
    tl.set("#s10lab", { opacity: 1 }, ev + 0.2);
    tl.fromTo("#s10line", { width: 0 }, { width: 800, duration: b - ev - 0.85, ease: "power1.in" }, ev + 0.25);
    for (let i = 0; i < 14; i++)
      tl.fromTo("#s10rain .candy:nth-child(" + (i + 1) + ")", { y: 0, rotation: (i % 2 ? -30 : 30) }, { y: 2300, rotation: (i % 2 ? 60 : -60), duration: 1.0 + (i % 4) * 0.12, ease: "power1.in" }, ev - 0.15 + i * 0.09);
    jitter("#s10gigi", a + 0.5, b, 4);
    tl.fromTo("#s10gigi", { x: 0 }, { x: 60, duration: 0.2, yoyo: true, repeat: 5, ease: "sine.inOut" }, ev);
  }

  // ---------- Scene 11: honest twist ----------
  {
    const a = S[10], b = S[11], rot = cue("rotten");
    slam("#s11a", a + 0.05); slam("#s11b", cue("not", 1)); slam("#s11c", cue("smile"));
    rise("#s11man", cue("one") - 0.2, 1000); rise("#s11gigi", a + 0.2, 500);
    const t0 = cue("ate"), t1 = cue("acorns") + 0.5;
    for (let i = 0; i < 6; i++) {
      const t = t0 + (t1 - t0) * i / 5;
      tl.fromTo("#s11a" + i, { y: -1500 }, { y: 0, duration: 0.4, ease: "bounce.out" }, t - 0.1);
      squash("#s11man", t + 0.2);
    }
    tl.fromTo("#s11lab", { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: 0.22, ease: "back.out(2)" }, cue("acorns"));
    bob("#s11man", cue("one") + 0.2, rot, 10, 0.4);
    for (let i = 0; i < 6; i++) tl.set(gsap.utils.toArray("#s11man .rot")[i], { opacity: 1 }, rot + i * 0.13);
    tl.fromTo("#s11cam", { scale: 1, transformOrigin: "540px 1090px" }, { scale: 1.2, duration: 0.9, ease: "power2.out" }, rot);
    face("s11gigi", "meh", a); face("s11gigi", "shock", rot + 0.2);
    squash("#s11gigi", rot + 0.2);
    bob("#s11gigi", a + 0.6, rot, 6, 0.5);
    jitter("#s11man", rot + 0.3, b, 1.5);
  }

  // ---------- Scene 12: the lesson ----------
  {
    const a = S[11], b = S[12], vil = cue("villain", 0), sug = cue("sugar", 2);
    slam("#s12a", cue("yes")); slam("#s12b", sug - 0.05); slam("#s12c", cue("real") - 0.1);
    tl.fromTo("#s12hero", { x: -700 }, { x: 0, duration: 0.35, ease: "back.out(1.5)" }, a);
    tl.fromTo("#s12sugar", { x: 500, scale: 1, rotation: 0 }, { x: 0, duration: 0.35, ease: "back.out(1.5)" }, a + 0.1);
    bob("#s12sugar", a + 0.5, cue("brushing"), 10, 0.4);
    // Gigi steps forward on "keep brushing"
    const st = cue("keep");
    tl.to("#s12hero", { x: 110, duration: 0.3, ease: "back.out(2)" }, st);
    tl.fromTo("#s12brush", { rotation: 24 }, { rotation: 62, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.in" }, st + 0.25);
    tl.to("#s12sugar", { scale: 0.8, x: 60, duration: 0.25, ease: "power2.out" }, st + 0.3);
    tl.to("#s12hero", { x: 190, duration: 0.3, ease: "back.out(2)" }, cue("toothpaste"));
    tl.to("#s12brush", { rotation: 62, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.in" }, cue("toothpaste") + 0.25);
    tl.to("#s12sugar", { scale: 0.6, x: 110, duration: 0.25, ease: "power2.out" }, cue("toothpaste") + 0.3);
    jitter("#s12sugar", cue("but", 3), sug, 4);
    bob("#s12hero", cue("but", 3), sug, 10, 0.4);
    // villain shrinks and runs
    tl.to("#s12sugar", { scale: 0.38, duration: 0.25, ease: "power2.in" }, sug);
    tl.to("#s12sugar", { x: 700, duration: 0.4, ease: "power2.in" }, sug + 0.3);
    tl.to("#s12hero", { x: 260, duration: 0.3, ease: "back.out(2)" }, sug + 0.3);
    squash("#s12gigi", sug + 0.6);
  }

  // ---------- Scene 13: CTA, loops back to scene 1 ----------
  {
    const a = S[12];
    slam("#s13a", a + 0.02, 1.3); slam("#s13b", cue("roman", 2) - 0.1, 1.3);
    bob("#s13roman", a, END, 10, 0.5);
    tl.fromTo("#s13jar", { scale: 1, x: 0, y: 0 }, { scale: 1.5, x: -130, y: 90, duration: 0.5, ease: "back.out(1.4)" }, a + 0.25);
    tl.to("#s13arm", { rotation: 4, x: -40, duration: 0.5, ease: "back.out(1.4)" }, a + 0.25);
    tl.to("#s13jar", { rotation: 5, duration: 0.3, yoyo: true, repeat: 9, ease: "sine.inOut" }, a + 0.8);
    tl.fromTo("#s13gigi", { rotation: -14 }, { rotation: 14, duration: 0.13, yoyo: true, repeat: Math.floor((END - a) / 0.13), ease: "sine.inOut" }, a + 0.1);
    tl.fromTo("#logo21", { y: 500 }, { y: 0, duration: 0.35, ease: "back.out(1.8)" }, cue("tell") - 0.1);
    tl.fromTo("#logo21 span", { scale: 1 }, { scale: 1.08, duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut" }, cue("tell") + 0.3);
  }

  // ---------- year ticker ----------
  {
    const ROW = 92, W = { "3000 BC": 400, "100 AD": 360, "1400s": 330, "1000 AD": 380, "1500s": 330, "1800s": 330, "TODAY": 330, "15,000 YEARS AGO": 640 };
    const at = [S[2], S[3], S[4], cue("thousand") - 0.1, S[8], S[9], cue("everyone") - 0.1, S[10], S[11]];
    tl.fromTo("#tpill", { y: -320 }, { y: 0, duration: 0.3, ease: "back.out(1.8)" }, S[2]);
    T.years.forEach((yr, i) => {
      const w = W[yr];
      if (i === 0) { tl.set("#tstrip", { y: 0 }, 0); tl.set("#tpill", { width: w, marginLeft: -w / 2 }, 0); return; }
      tl.to("#tstrip", { y: -ROW * 3 * i, duration: 0.45, ease: "back.out(1.3)" }, at[i]);
      tl.to("#tpill", { width: w, marginLeft: -w / 2, duration: 0.3, ease: "power2.out" }, at[i] + 0.1);
      tl.fromTo("#tpill", { scale: 1 }, { scale: 1.12, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, at[i] + 0.38);
    });
    tl.to("#ticker", { opacity: 0, duration: 0.2 }, S[7]);      // dark villain scene
    tl.to("#ticker", { opacity: 1, duration: 0.2 }, S[8]);
    tl.to("#ticker", { opacity: 0, duration: 0.15 }, S[12]);    // CTA
  }

  // ---------- subtitles ----------
  T.subs.forEach((chunk, i) => {
    const c = "#ck" + i, start = chunk[0][0], last = chunk[chunk.length - 1][1];
    const end = T.subs[i + 1] ? Math.min(T.subs[i + 1][0][0], last + 0.5) : last + 0.4;
    tl.set(c, { opacity: 1 }, start);
    tl.set(c, { opacity: 0 }, end);
    chunk.forEach(([s], j) => {
      const w = "#w" + i + "_" + j;
      tl.set(w, { color: T.mint, scale: 1.1 }, s);
      if (chunk[j + 1]) tl.set(w, { color: "#ffffff", scale: 1 }, chunk[j + 1][0]);
    });
  });

  tl.set({}, {}, END);
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;
  tl.seek(0);
})();
