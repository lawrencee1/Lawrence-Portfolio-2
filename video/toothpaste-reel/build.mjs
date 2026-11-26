// Builds index.html for the toothpaste reel.
// Edit timing.json (scene starts, synced to the voiceover) or the art below,
// then run:  node build.mjs
import { readFileSync, writeFileSync } from "node:fs";

const T = JSON.parse(readFileSync(new URL("./timing.json", import.meta.url)));

// ---------- palette (from the style reference: flat cobalt, red, yellow, white) ----------
const C = {
  blue: "#1F5FE0", blueD: "#1747B8", navy: "#121B45", night: "#0A0E2A",
  red: "#E5303C", redD: "#B01E2E", yellow: "#F8B62B", pee: "#FFE01F",
  white: "#FFFFFF", shade: "#C9D8F5", shadeD: "#9FB4E8",
  cream: "#FBF0D2", parch: "#F1DFB0", parchD: "#DCC386",
  skin: "#EDA06A", skinD: "#CC7B48", hair: "#4A2A1A",
  clay: "#DD5A2C", clayD: "#A93C1F", mint: "#3DDC97", pink: "#FF4FA3",
  pig: "#F78FA9", pigD: "#DB6584",
};

// ---------- helpers ----------
const act = (id, x, y, w, vb, inner, style = "") =>
  `<div id="${id}" class="act" style="left:${x}px;top:${y}px;width:${w}px;${style}"><svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg></div>`;

const cloud = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">
  <path d="M0,60 a45,45 0 0 1 60,-42 a62,62 0 0 1 118,-6 a50,50 0 0 1 82,48 z" fill="${C.shade}"/>
  <path d="M0,60 a45,45 0 0 1 60,-42 a62,62 0 0 1 118,-6 a50,50 0 0 1 60,20 a70,40 0 0 0 -90,6 a60,40 0 0 0 -100,10 a50,30 0 0 0 -48,14 z" fill="${C.white}"/>
</g>`;

// ---------- GIGI THE TOOTH (one design, many faces) ----------
const GIGI_BODY = "M-92,-120 C-104,-205 -52,-240 0,-218 C52,-240 104,-205 92,-120 C88,-72 82,-40 72,-6 C63,24 35,24 28,-10 C22,-40 10,-56 0,-56 C-10,-56 -22,-40 -28,-10 C-35,24 -63,24 -72,-6 C-82,-40 -88,-72 -92,-120 Z";
let gigiN = 0;
function gigiFace({ eyes = "normal", mouth = "smile", brows = "", arms = "down", look = [0, 0], extra = "" }) {
  const [lx, ly] = look;
  const eye = (cx) => {
    const cy = -142;
    if (eyes === "wide") return `<circle cx="${cx}" cy="${cy}" r="28" fill="${C.navy}"/><circle cx="${cx}" cy="${cy}" r="21" fill="#fff"/><circle cx="${cx + lx}" cy="${cy + ly}" r="9" fill="${C.navy}"/>`;
    if (eyes === "squint") { const d = cx < 0 ? 1 : -1; return `<path d="M${cx - 16 * d},${cy - 15} L${cx + 14 * d},${cy} L${cx - 16 * d},${cy + 15}" fill="none" stroke="${C.navy}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`; }
    if (eyes === "smug") return `<ellipse cx="${cx}" cy="${cy}" rx="16" ry="20" fill="${C.navy}"/><rect x="${cx - 22}" y="${cy - 26}" width="44" height="24" fill="#fff"/><path d="M${cx - 22},${cy - 2} h44" stroke="${C.navy}" stroke-width="8" stroke-linecap="round"/><circle cx="${cx + 5}" cy="${cy + 7}" r="5" fill="#fff"/>`;
    return `<ellipse cx="${cx + lx}" cy="${cy + ly}" rx="16" ry="21" fill="${C.navy}"/><circle cx="${cx + lx + 6}" cy="${cy + ly - 8}" r="6.5" fill="#fff"/>`;
  };
  const M = {
    smile: `<path d="M-24,-102 Q0,-74 24,-102" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>`,
    smirk: `<path d="M-16,-96 Q10,-84 28,-106" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>`,
    shock: `<ellipse cx="0" cy="-90" rx="21" ry="28" fill="${C.navy}"/><ellipse cx="0" cy="-74" rx="12" ry="9" fill="${C.red}"/>`,
    gag: `<path d="M-30,-98 q10,-12 20,0 t20,0 t20,0" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/><path d="M-11,-96 v24 a13,13 0 0 0 26,0 v-24 z" fill="#FF6F91"/><path d="M2,-94 v20" stroke="${C.redD}" stroke-width="4" stroke-linecap="round"/>`,
    wobble: `<path d="M-30,-92 l10,-9 l10,9 l10,-9 l10,9 l10,-9 l10,9" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
    flat: `<path d="M-22,-94 h44" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>`,
  };
  const B = {
    "": "",
    up: `<path d="M-56,-192 q20,-16 40,-4 M16,-196 q20,-12 40,4" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>`,
    worried: `<path d="M-60,-178 L-20,-192 M20,-192 L60,-178" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>`,
    angry: `<path d="M-62,-190 L-18,-174 M18,-174 L62,-190" stroke="${C.navy}" stroke-width="10" stroke-linecap="round"/>`,
    smug: `<path d="M-58,-180 h38 M18,-190 q20,-10 40,2" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>`,
  };
  const arm = (sx, sy, mx, my, hx, hy) =>
    `<path d="M${sx},${sy + 5} Q${mx},${my + 5} ${hx},${hy + 5}" fill="none" stroke="${C.shadeD}" stroke-width="22" stroke-linecap="round"/>
     <path d="M${sx},${sy} Q${mx},${my} ${hx},${hy}" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round"/>
     <circle cx="${hx + 2}" cy="${hy + 4}" r="19" fill="${C.shadeD}"/><circle cx="${hx - 1}" cy="${hy - 1}" r="17" fill="#fff"/>`;
  const A = {
    down: arm(-86, -110, -120, -90, -128, -58) + arm(86, -110, 120, -90, 128, -58),
    up: arm(-86, -120, -130, -150, -138, -206) + arm(86, -120, 130, -150, 138, -206),
    cheeks: arm(-86, -100, -120, -60, -66, -84) + arm(86, -100, 120, -60, 66, -84),
    hip: arm(-84, -112, -134, -92, -92, -62) + arm(84, -112, 134, -92, 92, -62),
    // right arm (screen left) points straight at the camera
    point: arm(86, -112, 134, -92, 92, -62) +
      `<path d="M-84,-106 L-150,-52" stroke="${C.shadeD}" stroke-width="30" stroke-linecap="round"/>
       <path d="M-84,-112 L-150,-60" stroke="#fff" stroke-width="28" stroke-linecap="round"/>
       <path d="M-150,-40 L-214,22" stroke="${C.shadeD}" stroke-width="40" stroke-linecap="round"/>
       <circle cx="-150" cy="-46" r="50" fill="${C.shadeD}"/><circle cx="-155" cy="-54" r="46" fill="#fff"/>
       <path d="M-158,-52 L-218,10" stroke="#fff" stroke-width="38" stroke-linecap="round"/>
       <path d="M-128,-30 q-4,20 -24,22 M-112,-50 q2,10 -6,18" fill="none" stroke="${C.shade}" stroke-width="8" stroke-linecap="round"/>`,
    none: "",
  };
  return `${eye(-36)}${eye(36)}${B[brows] || ""}${M[mouth]}
    <ellipse cx="-62" cy="-112" rx="15" ry="9" fill="#FF9DB0" opacity=".85"/><ellipse cx="62" cy="-112" rx="15" ry="9" fill="#FF9DB0" opacity=".85"/>
    ${extra}${A[arms]}`;
}
// states: { name: faceOptions }. First state shows; others are switched on by the timeline.
function gigi(id, states) {
  const n = ++gigiN;
  const faces = Object.entries(states).map(([name, o], i) =>
    `<g class="gf gf-${name}" ${i ? 'style="opacity:0"' : ""}>${gigiFace(o)}</g>`).join("");
  return `<defs><clipPath id="gc${n}"><path d="${GIGI_BODY}"/></clipPath></defs>
    <ellipse cx="6" cy="14" rx="96" ry="14" fill="${C.navy}" opacity=".22"/>
    <path d="${GIGI_BODY}" fill="${C.shade}"/>
    <g clip-path="url(#gc${n})"><path d="${GIGI_BODY}" fill="#fff" transform="translate(-20,-8)"/>
      <path d="M-70,-190 q14,-22 40,-24" fill="none" stroke="${C.shade}" stroke-width="0"/></g>
    ${faces}`;
}
const GIGI_VB = "-190 -280 380 310";
const sweat = `<path d="M96,-214 q14,22 0,34 q-14,-12 0,-34z" fill="#7FD3FF"/>`;

// ---------- props and characters ----------
const romanSvg = `
  <path d="M70,900 L96,540 C104,440 200,396 300,396 C400,396 496,440 504,540 L530,900 Z" fill="#fff"/>
  <path d="M392,408 C460,430 498,480 504,540 L530,900 L410,900 C432,720 424,540 392,408 Z" fill="${C.shade}"/>
  <path d="M130,440 L236,400 L470,900 L310,900 Z" fill="${C.red}"/>
  <path d="M236,400 L470,900 L420,900 L196,416 Z" fill="${C.redD}"/>
  <path d="M96,540 C104,480 150,430 210,410 L180,900 L70,900 Z" fill="${C.shade}" opacity=".0"/>
  <rect x="262" y="330" width="78" height="92" fill="${C.skinD}"/>
  <path d="M262,330 h46 v92 h-46 z" fill="${C.skin}"/>
  <ellipse cx="408" cy="262" rx="20" ry="30" fill="${C.skinD}"/>
  <ellipse cx="192" cy="262" rx="20" ry="30" fill="${C.skin}"/>
  <clipPath id="rh"><ellipse cx="300" cy="250" rx="108" ry="124"/></clipPath>
  <ellipse cx="300" cy="250" rx="108" ry="124" fill="${C.skinD}"/>
  <g clip-path="url(#rh)"><ellipse cx="276" cy="244" rx="108" ry="126" fill="${C.skin}"/>
    <path d="M180,200 C190,110 410,110 420,200 C400,150 340,150 300,170 C260,150 200,150 180,200 Z" fill="${C.hair}"/></g>
  <path d="M300,232 C282,270 276,292 300,298 C320,300 326,290 318,276 Z" fill="${C.skinD}"/>
  <ellipse cx="252" cy="232" rx="11" ry="14" fill="${C.navy}"/><ellipse cx="346" cy="232" rx="11" ry="14" fill="${C.navy}"/>
  <path d="M228,204 q24,-18 48,-4 M324,200 q24,-14 48,4" fill="none" stroke="${C.hair}" stroke-width="11" stroke-linecap="round"/>
  <path d="M238,312 Q300,372 366,312 Q300,330 238,312 Z" fill="${C.navy}"/>
  <path d="M250,316 Q300,334 354,316 L348,326 Q300,346 256,326 Z" fill="#fff"/>
  ${[[-1, 196, 196, -62], [-1, 206, 160, -42], [-1, 228, 130, -22], [-1, 258, 112, -4], [1, 404, 196, 62], [1, 394, 160, 42], [1, 372, 130, 22], [1, 342, 112, 4]]
    .map(([, x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="34" fill="${C.yellow}" transform="rotate(${r} ${x} ${y})"/><ellipse cx="${x + 4}" cy="${y + 4}" rx="6" ry="24" fill="#D9931A" transform="rotate(${r} ${x} ${y})"/>`).join("")}
`;
// arm with the chew-stick "toothbrush"; pivot at the shoulder (40,230)
const romanArmSvg = `
  <path d="M40,236 Q110,300 240,132" fill="none" stroke="${C.skinD}" stroke-width="64" stroke-linecap="round"/>
  <path d="M36,226 Q104,286 236,122" fill="none" stroke="${C.skin}" stroke-width="54" stroke-linecap="round"/>
  <path d="M214,92 L330,206" stroke="#7A4A22" stroke-width="16" stroke-linecap="round"/>
  <path d="M322,198 l26,8 M324,200 l18,22 M320,202 l4,28 M326,196 l28,-6" stroke="#C99A4A" stroke-width="7" stroke-linecap="round"/>
  <g id="wet"><path d="M322,198 l26,8 M324,200 l18,22 M320,202 l4,28 M326,196 l28,-6" stroke="${C.pee}" stroke-width="8" stroke-linecap="round"/>
    <path d="M336,236 q10,18 0,26 q-10,-8 0,-26z" fill="${C.pee}"/></g>
  <circle cx="240" cy="124" r="44" fill="${C.skinD}"/><circle cx="234" cy="118" r="40" fill="${C.skin}"/>
  <path d="M212,112 q20,-16 44,-2 M214,132 q20,-12 42,0" fill="none" stroke="${C.skinD}" stroke-width="6" stroke-linecap="round"/>
`;
const jarSvg = `
  <clipPath id="jc"><path d="M96,96 C10,170 6,340 96,430 L264,430 C354,340 350,170 264,96 Z"/></clipPath>
  <path d="M70,150 C10,150 10,260 62,270" fill="none" stroke="${C.clayD}" stroke-width="22" stroke-linecap="round"/>
  <path d="M290,150 C350,150 350,260 298,270" fill="none" stroke="${C.clayD}" stroke-width="22" stroke-linecap="round"/>
  <path d="M96,96 C10,170 6,340 96,430 L264,430 C354,340 350,170 264,96 Z" fill="${C.clayD}"/>
  <g clip-path="url(#jc)"><path d="M96,96 C10,170 6,340 96,430 L264,430 C354,340 350,170 264,96 Z" fill="${C.clay}" transform="translate(-34,-6)"/>
    <path d="M0,150 h360 v16 h-360z M0,372 h360 v14 h-360z" fill="${C.clayD}" opacity=".55"/></g>
  <path d="M84,60 h192 l-10,50 h-172 z" fill="${C.clayD}"/><path d="M84,60 h130 l-6,50 h-114 z" fill="${C.clay}"/>
  <ellipse cx="180" cy="60" rx="100" ry="26" fill="${C.clayD}"/>
  <ellipse cx="180" cy="62" rx="82" ry="17" fill="${C.pee}"/><ellipse cx="160" cy="58" rx="30" ry="5" fill="#FFF3A0"/>
  <path d="M258,74 q16,40 4,70 q-14,-22 -4,-70z" fill="${C.pee}"/>
  <g transform="rotate(-5 180 270)"><rect x="82" y="212" width="196" height="112" rx="8" fill="${C.cream}"/>
    <rect x="82" y="212" width="196" height="112" rx="8" fill="none" stroke="${C.navy}" stroke-width="6"/>
    <text x="180" y="302" text-anchor="middle" font-family="Anton" font-size="92" fill="${C.navy}" letter-spacing="6">XXX</text></g>
`;
const pigSvg = `
  <path d="M588,250 q54,-30 44,-70 q-34,-14 -40,18 q-4,26 24,24" fill="none" stroke="${C.pigD}" stroke-width="14" stroke-linecap="round"/>
  ${[210, 290, 440, 520].map((x, i) => `<rect x="${x}" y="380" width="56" height="120" rx="20" fill="${i % 2 ? C.pig : C.pigD}"/><rect x="${x}" y="472" width="56" height="30" rx="10" fill="${C.navy}"/>`).join("")}
  <clipPath id="pb"><ellipse cx="380" cy="290" rx="232" ry="150"/></clipPath>
  <ellipse cx="380" cy="290" rx="232" ry="150" fill="${C.pigD}"/>
  <g clip-path="url(#pb)"><ellipse cx="366" cy="262" rx="236" ry="150" fill="${C.pig}"/></g>
  <ellipse cx="318" cy="158" rx="46" ry="16" fill="#FFC2D2"/>
  <path d="M282,150 v-30 M300,146 v-36 M320,144 v-40 M340,146 v-34 M358,150 v-28" stroke="${C.hair}" stroke-width="8" stroke-linecap="round"/>
  <path d="M96,150 L70,50 L170,110 Z" fill="${C.pigD}"/><path d="M190,110 L250,36 L280,140 Z" fill="${C.pig}"/>
  <clipPath id="ph"><circle cx="180" cy="220" r="122"/></clipPath>
  <circle cx="180" cy="220" r="122" fill="${C.pigD}"/><g clip-path="url(#ph)"><circle cx="168" cy="206" r="124" fill="${C.pig}"/></g>
  <ellipse cx="236" cy="258" rx="58" ry="44" fill="${C.pigD}"/><ellipse cx="216" cy="256" rx="9" ry="14" fill="${C.navy}"/><ellipse cx="256" cy="254" rx="9" ry="14" fill="${C.navy}"/>
  <circle cx="150" cy="190" r="22" fill="#fff"/><circle cx="234" cy="176" r="22" fill="#fff"/>
  <circle cx="160" cy="188" r="11" fill="${C.navy}"/><circle cx="244" cy="174" r="11" fill="${C.navy}"/>
  <path d="M118,158 L176,170 M204,154 L262,140" stroke="${C.navy}" stroke-width="12" stroke-linecap="round"/>
  <path d="M150,306 q26,-18 52,0" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>
`;
const brushSvg = `
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${318 + i * 20}" y="${i % 2 ? 4 : 0}" width="15" height="60" rx="6" fill="${i % 2 ? "#6B3A22" : C.hair}"/>`).join("")}
  <rect x="0" y="52" width="460" height="48" rx="24" fill="#B8862E"/><rect x="0" y="52" width="460" height="34" rx="17" fill="#E8BC5E"/>
  <path d="M120,52 v48 M250,52 v48" stroke="#B8862E" stroke-width="7"/>
  <path d="M300,62 h150" stroke="${C.red}" stroke-width="12" stroke-linecap="round"/>
`;
const sugarSvg = `
  <path d="M300,96 L96,0 L140,210 L20,700 L580,700 L460,210 L504,0 Z" fill="${C.red}"/>
  <path d="M300,96 L190,60 L210,240 L150,700 L450,700 L390,240 L410,60 Z" fill="${C.redD}"/>
  <rect x="196" y="590" width="80" height="60" rx="18" fill="${C.navy}"/><rect x="324" y="590" width="80" height="60" rx="18" fill="${C.navy}"/>
  <path d="M150,250 L210,180 L500,180 L440,250 Z" fill="#fff"/>
  <path d="M440,250 L500,180 L500,500 L440,570 Z" fill="${C.shadeD}"/>
  <rect x="150" y="250" width="290" height="320" rx="14" fill="#EEF3FF"/>
  <path d="M150,470 h290 v86 a14,14 0 0 1 -14,14 h-262 a14,14 0 0 1 -14,-14 z" fill="${C.shade}"/>
  ${[[190, 290], [404, 300], [180, 430], [410, 446], [300, 268], [250, 214], [400, 206], [472, 300], [468, 420]].map(([x, y]) => `<path d="M${x},${y - 9} l3,6 l6,3 l-6,3 l-3,6 l-3,-6 l-6,-3 l6,-3z" fill="#fff" stroke="${C.shadeD}" stroke-width="1.5"/>`).join("")}
  <ellipse cx="236" cy="392" rx="32" ry="30" fill="${C.navy}"/><ellipse cx="354" cy="392" rx="32" ry="30" fill="${C.navy}"/>
  <circle cx="244" cy="398" r="11" fill="${C.pink}"/><circle cx="346" cy="398" r="11" fill="${C.pink}"/>
  <path d="M178,318 L286,366 L282,398 L174,352 Z" fill="${C.navy}"/><path d="M412,318 L304,366 L308,398 L416,352 Z" fill="${C.navy}"/>
  <path d="M206,452 Q295,548 384,452 Q295,486 206,452 Z" fill="${C.navy}"/>
  <path d="M236,466 l14,20 l14,-14 M326,472 l14,14 l14,-20" fill="#fff"/>
  <circle cx="300" cy="226" r="0" fill="${C.yellow}"/>
  <path d="M150,300 q-70,30 -60,110" fill="none" stroke="${C.shade}" stroke-width="26" stroke-linecap="round"/><circle cx="92" cy="416" r="26" fill="#fff"/>
  <path d="M440,300 q70,30 60,110" fill="none" stroke="${C.shadeD}" stroke-width="26" stroke-linecap="round"/><circle cx="498" cy="416" r="26" fill="${C.shade}"/>
`;

// ---------- shared backdrops ----------
const skyBg = (extra = "") => `<svg class="bg" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1920" fill="${C.blue}"/>
  <path d="M0,1060 h1080 v400 h-1080z" fill="${C.blueD}" opacity=".0"/>
  ${extra}
  <rect y="1368" width="1080" height="560" fill="${C.parch}"/>
  <rect y="1368" width="1080" height="46" fill="${C.cream}"/>
  <rect y="1414" width="1080" height="14" fill="${C.parchD}"/>
</svg>`;
const romeBack = `${cloud(700, 660, 1.5)}${cloud(620, 1000, .9)}
  <g fill="${C.blueD}"><path d="M560,1130 L820,1010 L1080,1130 Z"/><rect x="560" y="1130" width="520" height="30"/>
  ${[590, 680, 770, 860, 950, 1040].map(x => `<rect x="${x}" y="1160" width="44" height="220"/>`).join("")}</g>`;
const eastBack = `${cloud(60, 700, 1.3)}${cloud(720, 1040, 1.1)}
  <g fill="${C.blueD}"><path d="M-40,1380 L160,1120 L300,1260 L420,1160 L600,1380 Z"/></g>`;

// ---------- scenes ----------
const sc = (i) => ({ start: T.scenes[i], dur: +(T.scenes[i + 1] - T.scenes[i]).toFixed(3) });
const clip = (id, i, inner, cls = "") => {
  const { start, dur } = sc(i);
  return `<div id="${id}" class="clip scene ${cls}" data-start="${start}" data-duration="${dur}" data-track-index="1">${inner}</div>`;
};

const scene1 = clip("s1", 0, `
  <div class="cam" id="s1cam" style="transform-origin:760px 1010px">
    ${skyBg(romeBack)}
    ${act("s1roman", -30, 560, 600, "0 0 600 900", romanSvg, "transform-origin:50% 100%")}
    ${act("s1jar", 580, 946, 330, "0 0 360 460", jarSvg, "transform-origin:50% 100%")}
    ${act("s1arm", 415, 800, 400, "0 0 400 400", romanArmSvg, "transform-origin:10% 57.5%")}
    <div id="s1drops">${[0, 1, 2, 3, 4].map(i => `<i class="drop" style="left:${742 + i * 8}px;top:1000px"></i>`).join("")}</div>
    <svg class="bg front" viewBox="0 0 1080 1920"><rect y="1368" width="1080" height="46" fill="${C.cream}"/><rect y="1414" width="1080" height="14" fill="${C.parchD}"/><rect y="1428" width="1080" height="500" fill="${C.parch}"/></svg>
    ${act("s1gigi", 850, 1150, 250, GIGI_VB, gigi("g1", {
      shock: { eyes: "wide", mouth: "shock", brows: "up", arms: "up", look: [-6, 2] },
      gag: { eyes: "squint", mouth: "gag", brows: "worried", arms: "cheeks" },
    }), "transform-origin:50% 100%")}
  </div>
  <div class="hl" id="s1hl" style="top:262px">
    <div class="l1 pee">ROMANS BRUSHED</div>
    <div class="l2 pee">WITH <span id="s1pee">PEE</span></div>
  </div>`);

// scene 5 art is reused, frozen and grey, behind the twist
const pigStage = (p) => `
  ${skyBg(eastBack)}
  ${act(p + "pig", 60, 900, 640, "0 0 700 520", pigSvg, "transform-origin:50% 100%")}
  ${act(p + "brush", 520, 700, 500, "0 0 460 110", brushSvg, "transform:rotate(-14deg)")}`;

const scene5 = clip("s5", 4, `
  <div class="cam" id="s5cam">${pigStage("s5")}</div>
  <div class="hl" id="s5hl" style="top:300px">
    <div class="tag">First toothbrush:</div>
    <div class="l2 white">PIG NECK HAIR <span class="emo">🐷</span></div>
  </div>`);

const scene6 = clip("s6", 5, `
  <div class="cam" id="s6cam" style="transform-origin:540px 800px">
    <div id="s6frozen">${pigStage("s6")}</div>
    <div id="s6grey"></div><div id="s6dim"></div>
    <div id="s6pause"><i></i><i></i></div>
    <div class="hl" id="s6hl" style="top:286px">
      <div class="tag" id="s6a">But many of them had</div>
      <div class="xl yellow" id="s6b">BETTER</div>
      <div class="l3 white" id="s6c">teeth than</div>
      <div class="xl2" id="s6d"><span>YOU</span></div>
    </div>
    ${act("s6gigi", 440, 1050, 420, GIGI_VB, gigi("g6", {
      smug: { eyes: "smug", mouth: "smirk", brows: "smug", arms: "point" },
    }), "transform-origin:50% 100%")}
  </div>`);

const scene8 = clip("s8", 7, `
  <div class="cam" id="s8cam" style="transform-origin:540px 1000px">
    <svg class="bg" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="${C.night}"/>
      <g id="s8light"><path d="M420,-40 L660,-40 L1010,1400 L70,1400 Z" fill="#3B4CC0" opacity=".42"/>
      <path d="M470,-40 L610,-40 L860,1400 L220,1400 Z" fill="#6C7BFF" opacity=".28"/>
      <ellipse cx="540" cy="1400" rx="470" ry="74" fill="#5767E8"/><ellipse cx="540" cy="1400" rx="320" ry="46" fill="#8C98FF"/></g>
    </svg>
    ${act("s8sugar", 200, 640, 680, "0 0 600 700", sugarSvg, "transform-origin:50% 100%")}
    ${act("s8gigi", 40, 1200, 210, GIGI_VB, gigi("g8", {
      scared: { eyes: "wide", mouth: "wobble", brows: "worried", arms: "cheeks", look: [8, -6], extra: sweat },
    }), "transform-origin:50% 100%")}
  </div>
  <div id="s8flash"></div>
  <div class="hl" id="s8hl" style="top:250px"><div class="xxl" id="s8t">SUGAR</div></div>`, "dark");

// ---------- year ticker ----------
const YEARS = ["3000 BC", "100 AD", "1400s", "1000 AD", "1500s", "1800s", "TODAY", "15,000 YEARS AGO", "TODAY"];
const FILL = ["2600 BC", "900 BC", "50 BC", "640 AD", "1200s", "1100 AD", "1300s", "1650s", "1900s", "30,000 BC", "8000 BC", "1700s"];
const rows = []; YEARS.forEach((y, i) => { if (i) rows.push(FILL[(i * 2) % FILL.length], FILL[(i * 2 + 1) % FILL.length]); rows.push(y); });
const ticker = `<div id="ticker" class="clip" data-start="${T.scenes[2]}" data-duration="${(T.end - T.scenes[2]).toFixed(3)}" data-track-index="3">
  <div id="tpill"><b class="tri l"></b><div id="twin"><div id="tstrip">${rows.map(r => `<div class="trow">${r}</div>`).join("")}</div></div><b class="tri r"></b></div></div>`;

// ---------- subtitles (word by word) ----------
let words = T.words;
if (!words) { // estimate until the real voiceover is transcribed
  words = [];
  T.vo.forEach((line, i) => {
    const ws = line.split(/\s+/), a = T.scenes[i] + 0.12, b = T.scenes[i + 1] - 0.25;
    const tot = ws.reduce((s, w) => s + w.length + 2, 0); let t = a;
    ws.forEach(w => { const d = (b - a) * (w.length + 2) / tot; words.push({ w, s: +t.toFixed(3), e: +(t + d).toFixed(3) }); t += d; });
  });
}
const chunks = []; let cur = [];
words.forEach((w, i) => {
  cur.push(w);
  const gap = words[i + 1] ? words[i + 1].s - w.e : 9;
  if (cur.length >= 3 || /[.?!,]$/.test(w.w) && cur.length >= 2 || gap > 0.45 || !words[i + 1]) { chunks.push(cur); cur = []; }
});
const subs = `<div id="subs" class="clip" data-start="0" data-duration="${T.end}" data-track-index="4">${chunks.map((c, i) =>
  `<div class="chunk" id="ck${i}">${c.map((w, j) => `<span id="w${i}_${j}">${w.w}</span>`).join(" ")}</div>`).join("")}</div>`;
const subData = chunks.map(c => c.map(w => [w.s, w.e]));

// ---------- page ----------
const css = `
@font-face{font-family:Anton;src:url(assets/fonts/anton.woff2) format("woff2")}
@font-face{font-family:Baloo;src:url(assets/fonts/baloo2-800.woff2) format("woff2");font-weight:800}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:${C.blue}}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:Anton,sans-serif}
.clip{position:absolute;inset:0}
.scene{overflow:hidden;background:${C.blue}}
.scene.dark{background:${C.night}}
.cam{position:absolute;inset:0}
.bg{position:absolute;inset:0;width:1080px;height:1920px}
.act{position:absolute}.act svg{display:block;width:100%;height:auto;overflow:visible}
.hl{position:absolute;left:0;width:1080px;text-align:center;line-height:1;text-transform:none;z-index:5}
.hl>div{white-space:nowrap}
.l1{font-size:140px;letter-spacing:1px}
.l2{font-size:236px;margin-top:6px}
.l3{font-size:108px}
.xl{font-size:250px;margin:4px 0 2px}
.xl2{font-size:196px;margin-top:20px}
.xl2 span{display:inline-block;background:${C.red};color:#fff;padding:0 44px 6px;transform:rotate(-4deg);box-shadow:14px 14px 0 ${C.navy}}
.xxl{font-size:400px;color:#fff;text-shadow:12px 12px 0 ${C.pink}}
.tag{display:inline-block;font-family:Baloo;font-weight:800;font-size:62px;color:${C.navy};background:${C.cream};padding:6px 34px 2px;border-radius:14px;box-shadow:8px 8px 0 ${C.navy};margin-bottom:22px}
.pee{color:${C.pee};text-shadow:9px 9px 0 ${C.navy}}
.white{color:#fff;text-shadow:9px 9px 0 ${C.navy}}
.yellow{color:${C.yellow};text-shadow:12px 12px 0 ${C.navy}}
#s5hl .l2{font-size:150px}
.emo{font-family:"Noto Color Emoji";font-size:.8em;text-shadow:none}
.drop{position:absolute;width:26px;height:34px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:${C.pee};opacity:0}
.front{pointer-events:none}
#s6grey{position:absolute;inset:0;background:#808080;mix-blend-mode:saturation;opacity:0}
#s6dim{position:absolute;inset:0;background:${C.navy};opacity:0}
#s6pause{position:absolute;left:70px;top:150px;display:flex;gap:22px;opacity:0}
#s6pause i{width:30px;height:96px;background:#fff;box-shadow:6px 6px 0 ${C.navy}}
#s8flash{position:absolute;inset:0;background:${C.pink};opacity:0;z-index:6}
#ticker{z-index:20;pointer-events:none}
#tpill{position:absolute;left:50%;top:128px;height:108px;width:400px;margin-left:-200px;background:${C.navy};border:8px solid ${C.cream};border-radius:60px;box-shadow:0 10px 0 rgba(10,14,42,.35);overflow:hidden}
#twin{position:absolute;inset:0;overflow:hidden}
.trow{height:92px;line-height:96px;text-align:center;font-size:60px;color:${C.cream};letter-spacing:2px;white-space:nowrap}
.tri{position:absolute;top:50%;width:0;height:0;border:13px solid transparent;margin-top:-13px;z-index:2}
.tri.l{left:14px;border-left-color:${C.red}}.tri.r{right:14px;border-right-color:${C.red}}
#subs{z-index:30;pointer-events:none}
.chunk{position:absolute;left:90px;width:900px;top:1470px;text-align:center;font-family:Baloo;font-weight:800;font-size:66px;line-height:1.1;color:#fff;-webkit-text-stroke:14px ${C.navy};paint-order:stroke fill;opacity:0}
.chunk span{display:inline-block;margin:0 6px}
#grain{position:absolute;inset:0;z-index:40;opacity:.16;mix-blend-mode:multiply;pointer-events:none}
`;

const html = `<!doctype html>
<html lang="en" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>${css}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${T.end}" data-width="1080" data-height="1920" data-fps="30">
${scene1}
${scene5}
${scene6}
${scene8}
${ticker}
${subs}
<svg id="grain" class="clip" data-start="0" data-duration="${T.end}" data-track-index="5" viewBox="0 0 1080 1920"><filter id="gn"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .2  0 0 0 1.4 -.35"/></filter><rect width="1080" height="1920" filter="url(#gn)"/></svg>
</div>
<script>window.T=${JSON.stringify({ s: T.scenes, end: T.end, subs: subData, years: YEARS, mint: C.mint })};</script>
<script>${readFileSync(new URL("./anim.js", import.meta.url), "utf8")}</script>
</body>
</html>
`;
writeFileSync(new URL("./index.html", import.meta.url), html);
console.log("index.html written,", chunks.length, "subtitle chunks,", T.words ? "real" : "estimated", "word timing");
