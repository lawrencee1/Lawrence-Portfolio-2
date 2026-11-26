// Builds index.html for the toothpaste reel.
// Edit timing.json (scene starts, synced to the voiceover) or the art below,
// then run:  node build.mjs
import { readFileSync, writeFileSync } from "node:fs";

const T = JSON.parse(readFileSync(new URL("./timing.json", import.meta.url)));
try { T.words = JSON.parse(readFileSync(new URL("./words.json", import.meta.url))); } catch {}

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
    sword: arm(-86, -110, -120, -90, -128, -58) + arm(86, -120, 130, -150, 150, -190),
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
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${318 + i * 20}" y="${i % 2 ? 4 : 0}" class="tuft" width="15" height="60" rx="6" fill="${i % 2 ? "#6B3A22" : C.hair}"/>`).join("")}
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
const smallGigi = (id, x, states, w = 220) => act(id, x, 1380 - Math.round(w * 310 / 380 * 0.955), w, GIGI_VB, gigi(id, states), "transform-origin:50% 100%");
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
  <div class="cam" id="s5cam">${pigStage("s5")}<div id="s5fly"><i></i><i></i><i></i></div>${smallGigi("s5gigi", 830, { shock: { eyes: "wide", mouth: "shock", brows: "up", arms: "up", look: [-8, -4] } }, 210)}</div>
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

// ---------- more props ----------
const ledgeFront = (top = C.cream, face = C.parch, edge = C.parchD) => `<svg class="bg front" viewBox="0 0 1080 1920"><rect y="1368" width="1080" height="46" fill="${top}"/><rect y="1414" width="1080" height="14" fill="${edge}"/><rect y="1428" width="1080" height="500" fill="${face}"/></svg>`;
const shipSvg = `
  <path d="M100,150 V20" stroke="${C.hair}" stroke-width="10"/>
  <path d="M106,24 L190,120 L106,120 Z" fill="#fff"/><path d="M96,40 L40,120 L96,120 Z" fill="${C.shade}"/>
  <path d="M106,24 l40,10 l-40,12z" fill="${C.red}"/>
  <rect x="120" y="112" width="44" height="46" rx="14" fill="${C.clay}"/><rect x="126" y="104" width="32" height="12" rx="5" fill="${C.clayD}"/>
  <path d="M10,150 H230 L196,206 H44 Z" fill="${C.navy}"/><path d="M10,150 H230 L222,164 H18 Z" fill="${C.red}"/>
  <path d="M0,212 q20,-16 40,0 t40,0 t40,0 t40,0 t40,0 t40,0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
const mapBg = `<svg class="bg" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="${C.blue}"/>
  ${[[150, 1250], [520, 1290], [880, 1220], [560, 990], [300, 1190]].map(([x, y]) => `<path d="M${x},${y} q14,-12 28,0 t28,0" fill="none" stroke="${C.blueD}" stroke-width="7" stroke-linecap="round"/>`).join("")}
  <path d="M330,724 L1080,560 L1080,650 L660,706 L560,770 L420,800 Z" fill="${C.parchD}"/>
  <path d="M40,760 L330,720 L420,800 L400,960 L300,1080 L120,1100 L60,980 Z" fill="${C.parch}"/>
  <path d="M40,760 L112,750 L136,1096 L120,1100 L60,980 Z" fill="${C.red}"/>
  <path d="M640,706 L770,684 L900,900 L1010,1010 L966,1056 L900,1004 L884,1096 L832,1096 L820,960 L700,806 Z" fill="${C.parch}"/>
  <path d="M90,1010 Q200,1280 480,1190 T800,930" fill="none" stroke="#fff" stroke-width="9" stroke-dasharray="4 26" stroke-linecap="round"/>
  <circle cx="812" cy="910" r="20" fill="${C.red}"/><circle cx="812" cy="910" r="8" fill="#fff"/>
  <text x="860" y="870" font-family="Anton" font-size="46" fill="${C.navy}">ROME</text>
  <text x="150" y="900" font-family="Anton" font-size="40" fill="${C.navy}">PORTUGAL</text>
  <rect y="1368" width="1080" height="560" fill="${C.parch}"/><rect y="1368" width="1080" height="46" fill="${C.cream}"/><rect y="1414" width="1080" height="14" fill="${C.parchD}"/></svg>`;
const egyptBack = `<circle cx="850" cy="760" r="110" fill="${C.yellow}"/>${cloud(40, 720, 1.1)}
  <path d="M560,1368 L850,960 L1140,1368 Z" fill="#E0A024"/><path d="M850,960 L1140,1368 L940,1368 Z" fill="#B97D12"/>
  <path d="M40,1368 L440,800 L840,1368 Z" fill="${C.yellow}"/><path d="M440,800 L840,1368 L580,1368 Z" fill="#D9931A"/>`;
const mortarSvg = `
  <path d="M30,70 h340 q-6,210 -170,210 q-164,0 -170,-210z" fill="#6F84BD"/>
  <path d="M30,70 h250 q-6,190 -130,206 q-112,-20 -120,-206z" fill="#8FA3D6"/>
  <rect x="120" y="270" width="160" height="26" rx="10" fill="#6F84BD"/>
  <rect x="14" y="50" width="372" height="40" rx="20" fill="#A9B9E6"/><rect x="14" y="74" width="372" height="16" rx="8" fill="#6F84BD"/>`;
const pestleSvg = `<rect x="30" y="0" width="50" height="330" rx="25" fill="${C.parchD}"/><rect x="30" y="0" width="30" height="330" rx="15" fill="${C.cream}"/><ellipse cx="55" cy="330" rx="48" ry="38" fill="${C.parchD}"/>`;
const hoofSvg = `<path d="M40,0 h70 l10,90 h-90z" fill="#B98A5A"/><path d="M20,90 h110 l14,60 q-70,20 -138,0z" fill="${C.hair}"/><path d="M76,96 v58" stroke="#2A150C" stroke-width="7"/>`;
const ashSvg = `<path d="M0,110 q30,-90 80,-80 q30,-50 70,0 q40,-10 60,80z" fill="#8C8FA3"/><path d="M0,110 q30,-90 80,-80 q10,40 -20,80z" fill="#B5B8C8"/><circle cx="60" cy="14" r="7" fill="#B5B8C8"/><circle cx="170" cy="20" r="5" fill="#8C8FA3"/>`;
const eggSvg = `<path d="M0,40 l18,-22 l16,20 l18,-24 l18,24 l18,-20 l16,22 q-4,70 -52,70 q-48,0 -52,-70z" fill="#fff"/><path d="M70,40 l14,-18 l20,18 q-4,70 -52,70 q40,-14 18,-70z" fill="${C.shade}"/>
  <path d="M130,70 l14,-18 l14,16 l16,-18 l14,20 q-4,50 -30,50 q-26,0 -28,-50z" fill="#fff" transform="rotate(24 160 90)"/>`;
const bonesSvg = [35, -35].map(r => `<g transform="rotate(${r} 180 110)"><rect x="40" y="94" width="280" height="36" rx="16" fill="${C.shade}"/><rect x="40" y="90" width="280" height="26" rx="13" fill="#fff"/>
  ${[[40, 86], [40, 130], [320, 86], [320, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="28" fill="${y > 100 ? C.shade : "#fff"}"/>`).join("")}</g>`).join("");
const oysterSvg = [[0, 0, 1], [150, 40, .8]].map(([x, y, s]) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M10,120 Q0,10 110,6 Q220,10 210,120 Q110,170 10,120z" fill="#8C7FB8"/><path d="M10,120 Q0,10 110,6 Q150,10 170,40 Q90,60 60,140 Q30,134 10,120z" fill="#B4A8DC"/>
  <path d="M110,140 L60,30 M110,140 L110,14 M110,140 L160,30" stroke="#6A5D99" stroke-width="7" stroke-linecap="round"/></g>`).join("");
const gritSvg = `<path d="M0,90 q40,-70 110,-60 q50,-40 110,0 q60,-10 100,60z" fill="${C.shade}"/><path d="M0,90 q40,-70 110,-60 q10,30 -30,60z" fill="#fff"/>${[[60, 20], [150, 0], [240, 24], [290, 50], [20, 60]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="12" rx="3" fill="#fff"/>`).join("")}`;
const hammerSvg = `<rect x="150" y="60" width="330" height="34" rx="14" fill="#7A4A22"/><rect x="150" y="60" width="330" height="18" rx="9" fill="#A66A34"/>
  <rect x="20" y="0" width="150" height="160" rx="18" fill="${C.navy}"/><rect x="20" y="0" width="150" height="60" rx="18" fill="#3A4A8C"/><rect x="0" y="20" width="40" height="120" rx="10" fill="#5B6BB0"/>`;
const norwayBack = `${cloud(680, 700, 1.2)}
  <path d="M-60,1368 L220,880 L460,1368 Z" fill="${C.blueD}"/><path d="M220,880 L290,1024 L226,990 L190,1040 L150,1002 Z" fill="#fff"/>
  <path d="M520,1368 L860,820 L1200,1368 Z" fill="${C.blueD}"/><path d="M860,820 L950,964 L880,930 L840,990 L780,948 Z" fill="#fff"/>
  <path d="M260,1368 L520,1060 L760,1368 Z" fill="#123A9A"/>`;
const skullSvg = `
  <clipPath id="skc"><ellipse cx="250" cy="200" rx="196" ry="184"/></clipPath>
  <rect x="124" y="290" width="252" height="120" rx="34" fill="#E3D3A6"/><rect x="124" y="290" width="200" height="120" rx="34" fill="#FFF6DD"/>
  <ellipse cx="250" cy="200" rx="196" ry="184" fill="#E3D3A6"/><g clip-path="url(#skc)"><ellipse cx="220" cy="190" rx="196" ry="186" fill="#FFF6DD"/></g>
  <ellipse cx="176" cy="226" rx="52" ry="58" fill="${C.navy}"/><ellipse cx="324" cy="226" rx="52" ry="58" fill="${C.navy}"/>
  <path d="M250,280 l-22,48 h44z" fill="${C.navy}"/>
  <rect x="134" y="392" width="232" height="44" rx="8" fill="${C.navy}"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${142 + i * 37}" y="396" width="32" height="30" rx="5" fill="#fff"/>`).join("")}
  <g id="jaw"><path d="M120,440 h260 q0,100 -70,104 h-120 q-70,-4 -70,-104z" fill="#E3D3A6"/><path d="M120,440 h200 q0,100 -70,104 h-60 q-70,-4 -70,-104z" fill="#FFF6DD"/>
  <rect x="134" y="436" width="232" height="40" rx="8" fill="${C.navy}"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${142 + i * 37}" y="444" width="32" height="28" rx="5" fill="#fff"/>`).join("")}</g>`;
const castleBack = `${cloud(60, 690, 1.2)}${cloud(760, 980, .9)}
  <g fill="${C.blueD}"><rect x="-20" y="1040" width="240" height="340"/><path d="M-20,1040 v-50 h40 v50 h40 v-50 h40 v50 h40 v-50 h40 v50 h40 v-50 h40 v50z"/>
  <rect x="860" y="900" width="240" height="480"/><path d="M860,900 v-50 h40 v50 h40 v-50 h40 v50 h40 v-50 h40 v50 h40 v-50 h40 v50z"/></g>`;
const queenSvg = `
  ${Array.from({ length: 16 }, (_, i) => { const a = i / 16 * 6.283, x = 350 + Math.cos(a) * 250, y = 430 + Math.sin(a) * 250; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="62" fill="${i % 2 ? "#fff" : C.shade}"/>`; }).join("")}
  <circle cx="350" cy="430" r="246" fill="#fff"/><circle cx="350" cy="430" r="190" fill="${C.shade}"/>
  <path d="M40,800 L110,610 Q350,500 590,610 L660,800Z" fill="${C.red}"/><path d="M470,560 Q560,580 590,610 L660,800 L520,800Z" fill="${C.redD}"/>
  <path d="M250,560 L350,800 L450,560 Q350,530 250,560z" fill="${C.yellow}"/>
  ${[600, 650, 700, 750].map(y => `<circle cx="350" cy="${y}" r="13" fill="#fff"/>`).join("")}
  <rect x="312" y="440" width="76" height="110" fill="#E8C4AC"/>
  ${[[214, 250], [200, 320], [226, 190], [486, 250], [500, 320], [474, 190], [280, 150], [350, 132], [420, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="54" fill="#E2571E"/>`).join("")}
  ${[[214, 250], [200, 320], [280, 150]].map(([x, y]) => `<circle cx="${x - 8}" cy="${y - 8}" r="30" fill="#F47A3A"/>`).join("")}
  <clipPath id="qf"><ellipse cx="350" cy="330" rx="128" ry="150"/></clipPath>
  <ellipse cx="350" cy="330" rx="128" ry="150" fill="#E8C4AC"/><g clip-path="url(#qf)"><ellipse cx="326" cy="322" rx="128" ry="152" fill="#FBE6D4"/></g>
  <circle cx="272" cy="366" r="26" fill="${C.red}" opacity=".55"/><circle cx="428" cy="366" r="26" fill="${C.red}" opacity=".55"/>
  <ellipse cx="300" cy="300" rx="12" ry="16" fill="${C.navy}"/><ellipse cx="400" cy="300" rx="12" ry="16" fill="${C.navy}"/>
  <path d="M276,262 q24,-16 48,-2 M376,260 q24,-14 48,2" fill="none" stroke="#B8431A" stroke-width="8" stroke-linecap="round"/>
  <path d="M350,310 q-14,34 6,40" fill="none" stroke="#E8C4AC" stroke-width="9" stroke-linecap="round"/>
  <path d="M272,388 h156 q0,66 -78,66 q-78,0 -78,-66z" fill="${C.navy}"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${278 + i * 24.5}" y="388" width="22" height="26" rx="4" fill="#fff"/><rect class="rot" x="${278 + i * 24.5}" y="388" width="22" height="26" rx="4" fill="#5A3A1E" style="opacity:0"/>`).join("")}
  <path d="M250,150 L250,40 L300,100 L350,20 L400,100 L450,40 L450,150 Z" fill="${C.yellow}"/><path d="M400,100 L450,40 L450,150 L390,150 Z" fill="#D9931A"/>
  <rect x="244" y="136" width="212" height="30" rx="8" fill="#D9931A"/>
  <circle cx="350" cy="92" r="16" fill="${C.red}"/><circle cx="278" cy="150" r="9" fill="${C.red}"/><circle cx="422" cy="150" r="9" fill="${C.red}"/><circle cx="350" cy="150" r="9" fill="${C.blue}"/>`;
const SWEETS = ["#FF9DB0", "#FFE01F", "#9BE8B8", "#FFB36B", "#C9A8FF"];
const traySvg = `<ellipse cx="240" cy="110" rx="240" ry="46" fill="#B97D12"/><ellipse cx="240" cy="100" rx="240" ry="46" fill="${C.yellow}"/><ellipse cx="240" cy="98" rx="200" ry="32" fill="#D9931A"/>
  ${[[90, 80], [150, 62], [210, 84], [270, 60], [330, 82], [390, 70], [180, 40], [300, 36], [240, 20]].map(([x, y], i) => `<circle cx="${x}" cy="${y + 4}" r="30" fill="${C.navy}" opacity=".18"/><circle cx="${x}" cy="${y}" r="30" fill="${SWEETS[i % 5]}"/><circle cx="${x - 8}" cy="${y - 9}" r="9" fill="#fff" opacity=".7"/><path d="M${x},${y - 30} q10,-12 16,-4" fill="none" stroke="#2E9E62" stroke-width="6" stroke-linecap="round"/>`).join("")}`;
const factorySvg = `
  <rect x="330" y="20" width="60" height="260" fill="${C.navy}"/><rect x="440" y="70" width="60" height="210" fill="${C.navy}"/>
  <rect x="320" y="20" width="80" height="24" fill="${C.yellow}"/><rect x="430" y="70" width="80" height="24" fill="${C.yellow}"/>
  <path d="M40,500 V260 L160,190 V260 L280,190 V260 L400,190 V260 H560 V500 Z" fill="${C.red}"/>
  <path d="M400,260 H560 V500 H440 Z" fill="${C.redD}"/>
  ${[80, 200, 320].map(x => `<rect x="${x}" y="320" width="70" height="70" rx="6" fill="${C.pee}"/>`).join("")}
  <rect x="440" y="400" width="160" height="100" fill="${C.navy}"/>
  <text x="300" y="470" text-anchor="middle" font-family="Anton" font-size="54" fill="#fff" letter-spacing="3">SUGAR CO.</text>`;
const cubeSvg = `<path d="M0,20 L20,0 H100 L80,20Z" fill="#fff"/><path d="M80,20 L100,0 V80 L80,100Z" fill="${C.shadeD}"/><rect y="20" width="80" height="80" rx="6" fill="#EEF3FF"/>`;
const candy = (i) => [
  `<circle cx="50" cy="50" r="46" fill="${C.pink}"/><path d="M50,50 m-30,0 a30,30 0 1 1 30,30 a18,18 0 1 1 -18,-18" fill="none" stroke="#fff" stroke-width="10"/><rect x="44" y="92" width="12" height="100" rx="6" fill="#fff"/>`,
  `<rect x="14" y="10" width="72" height="150" rx="14" fill="${C.red}"/><rect x="14" y="10" width="26" height="150" rx="12" fill="#FF6A70"/><rect x="14" y="60" width="72" height="44" fill="#fff"/><rect x="24" y="0" width="52" height="14" rx="6" fill="${C.shadeD}"/>`,
  `<g transform="translate(10,40)">${cubeSvg}</g>`,
  `<circle cx="50" cy="60" r="48" fill="#C98A4B"/><circle cx="50" cy="56" r="46" fill="${C.pink}"/><circle cx="50" cy="58" r="16" fill="${C.night}" opacity=".0"/><circle cx="50" cy="58" r="15" fill="#fff" opacity=".0"/><circle cx="50" cy="58" r="15" fill="${C.cream}"/><path d="M26,40 l8,4 M66,34 l6,8 M74,66 l-8,2 M30,74 l8,-4" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
  `<path d="M0,50 L30,26 V74Z M130,50 L100,26 V74Z" fill="${C.yellow}"/><ellipse cx="65" cy="50" rx="42" ry="32" fill="${C.yellow}"/><path d="M50,22 q-14,28 0,56 M76,22 q-14,28 0,56" stroke="${C.red}" stroke-width="9" fill="none"/>`,
][i % 5];
const graphSvg = `<rect x="8" y="8" width="800" height="520" rx="26" fill="${C.navy}"/><rect width="800" height="520" rx="26" fill="#fff"/>
  <path d="M90,60 V430 H740" fill="none" stroke="${C.navy}" stroke-width="10" stroke-linecap="round"/>
  ${[150, 240, 330].map(y => `<path d="M90,${y} H740" stroke="${C.shade}" stroke-width="5" stroke-dasharray="10 14"/>`).join("")}`;
const graphLine = `<path d="M96,410 L220,400 L330,380 L430,330 L520,250 L610,150 L720,40" fill="none" stroke="${C.red}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path d="M720,40 l-70,6 l52,56z" fill="${C.red}"/>`;
const caveFrame = `<svg class="bg" viewBox="0 0 1080 1920"><path fill-rule="evenodd" fill="#2B2350" d="M0,0 H1080 V1380 H0Z M150,1380 Q90,900 300,720 Q540,560 800,730 Q1000,900 930,1380Z"/>
  <path fill="#3D3470" d="M150,1380 Q90,900 300,720 Q200,900 230,1380Z"/>
  <path fill="#1D1740" d="M360,0 L400,150 L440,0Z M620,0 L670,210 L720,0Z M860,0 L890,120 L920,0Z M120,0 L150,130 L180,0Z"/></svg>`;
const cavemanSvg = `
  <path d="M60,800 L110,560 Q300,470 490,560 L540,800Z" fill="${C.yellow}"/><path d="M400,520 Q470,540 490,560 L540,800 L420,800Z" fill="#D9931A"/>
  ${[[170, 640], [260, 720], [340, 610], [440, 700], [150, 760], [380, 780]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="16" fill="${C.hair}"/>`).join("")}
  <path d="M110,560 Q200,520 260,520 L200,800 H60Z" fill="${C.skin}"/>
  ${[[150, 250], [140, 340], [180, 170], [450, 250], [460, 340], [420, 170], [250, 120], [350, 120], [300, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="70" fill="${C.hair}"/>`).join("")}
  <clipPath id="cmf"><ellipse cx="300" cy="300" rx="140" ry="160"/></clipPath>
  <ellipse cx="300" cy="300" rx="140" ry="160" fill="${C.skinD}"/><g clip-path="url(#cmf)"><ellipse cx="274" cy="292" rx="140" ry="162" fill="${C.skin}"/></g>
  <path d="M160,330 Q170,520 300,530 Q430,520 440,330 Q400,400 300,400 Q200,400 160,330z" fill="${C.hair}"/>
  <rect x="190" y="212" width="220" height="30" rx="15" fill="${C.hair}"/>
  <path d="M222,276 q22,-26 44,0 M334,276 q22,-26 44,0" fill="none" stroke="${C.navy}" stroke-width="11" stroke-linecap="round"/>
  <ellipse cx="300" cy="320" rx="30" ry="24" fill="${C.skinD}"/>
  <path d="M218,392 h164 q0,74 -82,74 q-82,0 -82,-74z" fill="${C.navy}"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${224 + i * 25.6}" y="392" width="23" height="28" rx="4" fill="#fff"/><rect class="rot" x="${224 + i * 25.6}" y="392" width="23" height="28" rx="4" fill="#5A3A1E" style="opacity:0"/>`).join("")}`;
const acornSvg = `<ellipse cx="40" cy="62" rx="32" ry="38" fill="#C98A4B"/><ellipse cx="30" cy="56" rx="14" ry="22" fill="#E2A868"/><path d="M4,44 q36,-44 72,0 q-36,16 -72,0z" fill="${C.hair}"/><rect x="36" y="4" width="8" height="20" rx="4" fill="${C.hair}"/>`;
const todayBg = `<svg class="bg" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="#DDF8EC"/><circle cx="540" cy="1040" r="430" fill="${C.mint}" opacity=".45"/><circle cx="540" cy="1040" r="300" fill="${C.mint}" opacity=".5"/>
  ${[[140, 760], [930, 820], [860, 1180], [200, 1120]].map(([x, y]) => `<path d="M${x},${y - 30} l8,22 l22,8 l-22,8 l-8,22 l-8,-22 l-22,-8 l22,-8z" fill="#fff"/>`).join("")}
  <rect y="1368" width="1080" height="560" fill="#fff"/><rect y="1368" width="1080" height="46" fill="#fff"/><rect y="1414" width="1080" height="14" fill="#BFE6D4"/><rect y="1428" width="1080" height="500" fill="#F4FCF8"/></svg>`;
const toothbrushSvg = `<rect x="44" y="150" width="34" height="320" rx="17" fill="${C.blueD}"/><rect x="44" y="150" width="20" height="320" rx="10" fill="${C.blue}"/>
  <rect x="36" y="20" width="50" height="150" rx="20" fill="${C.blueD}"/><rect x="36" y="20" width="30" height="150" rx="15" fill="${C.blue}"/>
  ${[0, 1, 2, 3, 4].map(i => `<rect x="-6" y="${34 + i * 24}" width="46" height="18" rx="8" fill="${i % 2 ? C.shade : "#fff"}"/>`).join("")}
  <path d="M-34,30 q-22,30 0,60 q-22,30 0,56 q22,-28 0,-56 q22,-30 0,-60z" fill="#fff"/><path d="M-34,42 q-12,18 0,36 M-34,98 q-12,18 0,36" stroke="${C.mint}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
const tubeSvg = `<path d="M10,0 H110 L96,200 H24Z" fill="#fff"/><path d="M70,0 H110 L96,200 H70Z" fill="${C.shade}"/><rect x="6" y="-12" width="108" height="18" rx="5" fill="${C.shadeD}"/>
  <rect x="24" y="60" width="72" height="80" rx="8" fill="${C.mint}"/><text x="60" y="112" text-anchor="middle" font-family="Anton" font-size="34" fill="#fff">F</text>
  <rect x="34" y="200" width="52" height="40" rx="6" fill="${C.red}"/>`;

// ---------- remaining scenes ----------

const scene2 = clip("s2", 1, `
  <div class="cam" id="s2cam">${mapBg}
    ${act("s2ship", 0, 0, 230, "0 0 240 230", shipSvg, "transform-origin:50% 90%")}
    ${ledgeFront()}
    ${act("s2jar", 370, 946, 340, "0 0 360 460", jarSvg, "transform-origin:50% 100%")}
    <div id="s2stamp">PREMIUM</div>
    <div class="tag sm" id="s2lab" style="position:absolute;left:640px;top:1240px;transform:rotate(-6deg)">stronger ammonia</div>
    ${smallGigi("s2gigi", 60, { yuck: { eyes: "squint", mouth: "gag", brows: "worried", arms: "cheeks" }, shock: { eyes: "wide", mouth: "shock", brows: "up", arms: "up" } })}
  </div>
  <div class="hl" id="s2hl" style="top:262px"><div class="tag" id="s2a">Imported from</div><div class="l2 pee" id="s2b" style="font-size:220px">PORTUGAL</div></div>`);

const scene3 = clip("s3", 2, `
  <div class="cam" id="s3cam">${skyBg(egyptBack)}
    ${act("s3pestle", 520, 880, 110, "0 0 110 370", pestleSvg, "transform-origin:50% 90%;transform:rotate(16deg)")}
    ${act("s3hoof", 400, 1090, 150, "0 0 150 160", hoofSvg)}
    ${act("s3ash", 430, 1100, 210, "0 0 210 110", ashSvg)}
    ${act("s3egg", 470, 1090, 200, "0 0 200 130", eggSvg)}
    ${act("s3mortar", 340, 1100, 400, "0 0 400 300", mortarSvg, "transform-origin:50% 100%")}
    <div id="s3puff">${[0, 1, 2, 3, 4, 5].map(() => `<i class="puff"></i>`).join("")}</div>
    ${ledgeFront()}
    ${smallGigi("s3gigi", 810, { look: { eyes: "wide", mouth: "flat", brows: "up", arms: "down", look: [-8, 0] }, cough: { eyes: "squint", mouth: "shock", brows: "worried", arms: "cheeks" } })}
  </div>
  <div class="hl" id="s3hl" style="top:262px"><div class="tag" id="s3a">EGYPT:</div><div class="l4 white" id="s3b">OX HOOF ASHES</div><div class="l4 yellow" id="s3c">+ EGGSHELLS</div></div>`);

const scene4 = clip("s4", 3, `
  <div class="cam" id="s4cam">${skyBg(romeBack)}
    ${act("s4bones", 150, 1150, 360, "0 0 360 220", bonesSvg, "transform-origin:50% 100%")}
    ${act("s4grit1", 150, 1270, 340, "0 0 320 95", gritSvg, "transform-origin:50% 100%")}
    ${act("s4oyster", 560, 1210, 330, "0 0 330 170", oysterSvg, "transform-origin:50% 100%")}
    ${act("s4grit2", 560, 1270, 340, "0 0 320 95", gritSvg, "transform-origin:50% 100%")}
    <div id="s4chips">${Array.from({ length: 10 }, () => `<i class="chip"></i>`).join("")}</div>
    ${act("s4hammer", 380, 760, 520, "0 0 480 160", hammerSvg, "transform-origin:96% 50%")}
    ${ledgeFront()}
    ${smallGigi("s4gigi", 20, { wince: { eyes: "squint", mouth: "wobble", brows: "worried", arms: "cheeks" } }, 200)}
  </div>
  <div class="hl" id="s4hl" style="top:262px"><div class="tag" id="s4a">Crushed</div><div class="xl yellow" id="s4b">BONES</div><div class="l3 white" id="s4c">+ oyster shells</div></div>`);

const scene7 = clip("s7", 6, `
  <div class="cam" id="s7cam">${skyBg(norwayBack)}
    ${act("s7skull", 290, 810, 500, "0 0 500 560", skullSvg, "transform-origin:50% 100%")}
    <div id="s7scan"></div>
    <div id="s7badge"><b>0</b><span>CAVITIES</span></div>
    ${ledgeFront()}
    ${smallGigi("s7gigi", 40, { wow: { eyes: "wide", mouth: "smile", brows: "up", arms: "down", look: [8, -4] }, proud: { eyes: "smug", mouth: "smile", brows: "smug", arms: "hip" } })}
  </div>
  <div class="hl" id="s7hl" style="top:262px"><div class="tag" id="s7a">Medieval Norway:</div><div class="l4 white" id="s7b">WORN DOWN,</div><div class="l5 yellow" id="s7c">ALMOST NO CAVITIES</div></div>`);

const scene9 = clip("s9", 8, `
  <div class="cam" id="s9cam">${skyBg(castleBack)}
    ${act("s9queen", 190, 650, 700, "0 0 700 800", queenSvg, "transform-origin:50% 100%")}
    ${ledgeFront()}
    ${smallGigi("s9gigi", 700, { hide: { eyes: "wide", mouth: "wobble", brows: "worried", arms: "none", look: [-8, -6], extra: sweat } }, 210)}
    ${act("s9tray", 300, 1262, 480, "0 0 480 160", traySvg)}
    <div id="s9bites">${SWEETS.map(c => `<i class="sweet" style="background:${c}"></i>`).join("")}</div>
    <div class="tag sm" id="s9lab" style="position:absolute;left:30px;top:1180px;transform:rotate(-7deg)">the Queen loved marzipan</div>
  </div>
  <div class="hl" id="s9hl" style="top:262px"><div class="tag" id="s9a">Cavities started with the</div><div class="xl yellow" id="s9b" style="font-size:290px">RICH</div></div>`);

const scene10 = clip("s10", 9, `
  <div class="cam" id="s10cam">${skyBg(cloud(700, 700, 1.2))}
    <div id="s10smoke">${[0, 1, 2, 3].map(() => `<i class="smoke"></i>`).join("")}</div>
    ${act("s10fac", 200, 860, 620, "0 0 600 500", factorySvg, "transform-origin:50% 100%")}
    <div id="s10cubes">${[0, 1, 2, 3].map(i => act("s10c" + i, 760, 1280, 80, "0 0 100 100", cubeSvg)).join("")}</div>
    ${act("s10graph", 140, 800, 800, "0 0 810 530", graphSvg, "transform-origin:50% 100%")}
    <div id="s10line"><svg viewBox="0 0 810 530" width="800" height="523">${graphLine}</svg></div>
    <div class="tag sm" id="s10lab" style="position:absolute;left:250px;top:830px;color:${C.red}">cavities</div>
    ${ledgeFront()}
    <div id="s10rain">${Array.from({ length: 14 }, (_, i) => `<div class="candy" style="left:${[40, 880, 300, 620, 150, 760, 460, 960, 230, 540, 60, 840, 380, 690][i]}px"><svg viewBox="0 0 130 200" width="${110 + (i % 3) * 20}">${candy(i)}</svg></div>`).join("")}</div>
    ${smallGigi("s10gigi", 30, { panic: { eyes: "wide", mouth: "shock", brows: "worried", arms: "up", extra: sweat } }, 200)}
  </div>
  <div class="hl" id="s10hl" style="top:262px"><div class="l4 yellow" id="s10a" style="font-size:180px">CHEAP SUGAR</div><div class="tag sm" id="s10b" style="margin-top:16px">= everyone's teeth went downhill</div></div>`);

const scene11 = clip("s11", 10, `
  <div class="cam" id="s11cam">${skyBg(cloud(420, 800, 1.1))}${caveFrame}
    ${act("s11man", 340, 690, 600, "0 0 600 800", cavemanSvg, "transform-origin:50% 100%")}
    ${ledgeFront()}
    <div id="s11acorns">${[[90, 1300], [170, 1304], [250, 1300], [130, 1244], [210, 1246], [170, 1190]].map(([x, y], i) => act("s11a" + i, x, y, 80, "0 0 80 104", acornSvg, `transform:rotate(${[-12, 8, 14, -6, 10, 0][i]}deg)`)).join("")}</div>
    <div class="tag sm" id="s11lab" style="position:absolute;left:70px;top:1110px;transform:rotate(-6deg)">too many acorns</div>
    ${smallGigi("s11gigi", 840, { meh: { eyes: "smug", mouth: "flat", brows: "smug", arms: "hip" }, shock: { eyes: "wide", mouth: "shock", brows: "up", arms: "cheeks" } }, 200)}
  </div>
  <div class="hl" id="s11hl" style="top:262px"><div class="tag" id="s11a">Plot twist:</div><div class="l6 white" id="s11b">NOT EVERY ANCIENT</div><div class="l6 white" id="s11c">SMILE WAS PERFECT</div></div>`, "dark");

const scene12 = clip("s12", 11, `
  <div class="cam" id="s12cam">${todayBg}
    ${act("s12sugar", 620, 930, 400, "0 0 600 700", sugarSvg, "transform-origin:50% 100%")}
    <div id="s12hero" style="position:absolute;left:0;top:0;width:1080px;height:1920px">
      ${act("s12tube", 40, 1170, 90, "0 -14 120 256", tubeSvg, "transform:rotate(-16deg)")}
      ${act("s12gigi", 90, 1040, 420, GIGI_VB, gigi("g12", { brave: { eyes: "normal", mouth: "smile", brows: "angry", arms: "sword", look: [6, 0] } }), "transform-origin:50% 100%")}
      ${act("s12brush", 405, 850, 110, "-60 0 180 480", toothbrushSvg, "transform-origin:60% 92%;transform:rotate(24deg)")}
    </div>
  </div>
  <div class="hl" id="s12hl" style="top:262px"><div class="tag" id="s12a">Toothpaste helps.</div><div class="xl" id="s12b" style="color:${C.red};text-shadow:12px 12px 0 ${C.navy}">SUGAR</div><div class="l3" id="s12c" style="color:${C.navy}">is the real villain.</div></div>`);

const scene13 = clip("s13", 12, `
  <div class="cam" id="s13cam">
    ${skyBg(romeBack)}
    ${act("s13roman", -30, 560, 600, "0 0 600 900", romanSvg, "transform-origin:50% 100%")}
    ${act("s13arm", 415, 800, 400, "0 0 400 400", romanArmSvg.replace('id="wet"', 'id="wet13"'), "transform-origin:10% 57.5%;transform:rotate(-22deg)")}
    ${ledgeFront()}
    ${act("s13gigi", 850, 1150, 250, GIGI_VB, gigi("g13", { nope: { eyes: "squint", mouth: "flat", brows: "angry", arms: "hip" } }), "transform-origin:50% 100%")}
    ${act("s13jar", 580, 946, 330, "0 0 360 460", jarSvg.replace(/id="jc"/, 'id="jc13"').replace("url(#jc)", "url(#jc13)"), "transform-origin:50% 100%")}
  </div>
  <div class="hl" id="s13hl" style="top:262px"><div class="l6 pee" id="s13a">WOULD YOU SURVIVE</div><div class="l6 pee" id="s13b" style="font-size:112px">ROMAN DENTISTRY? <span class="emo">😂</span></div></div>
  <div id="logo21"><span>21</span></div>`);

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
const chunks = []; let sent = [];
const flush = () => {
  const g = []; for (let i = 0; i < sent.length; i += 3) g.push(sent.slice(i, i + 3));
  if (g.length > 1 && g[g.length - 1].length === 1) { const last = g.pop(); const prev = g[g.length - 1]; if (prev.length === 3 && g.length > 1) { last.unshift(prev.pop()); g.push(last); } else prev.push(...last); }
  chunks.push(...g); sent = [];
};
words.forEach((w) => { sent.push(w); if (/[.?!]$/.test(w.w)) flush(); });
if (sent.length) flush();
const subs = `<div id="subs" class="clip" data-start="0" data-duration="${T.end}" data-track-index="4">${chunks.map((c, i) =>
  `<div class="chunk" id="ck${i}">${c.map((w, j) => `<span id="w${i}_${j}">${w.w}</span>`).join(" ")}</div>`).join("")}</div>`;
const subData = chunks.map(c => c.map(w => [w.s, w.e]));

// ---------- audio ----------
const cue = (str, n = 0) => { const m = words.filter(w => w.w.toLowerCase().replace(/[^a-z0-9']/g, "").startsWith(str)); return (m[n] || m[0] || { s: 0 }).s; };
const S = T.scenes;
const SFX = [
  ["squish", 0.83, .8], ["whoosh", S[1], .5], ["register", cue("stronger") - 0.02, .7],
  ["whoosh", S[2], .6], ["squish", cue("hoof"), .6], ["whoosh", S[3], .6], ["boom", cue("bones"), .5], ["boom", cue("oyster"), .4],
  ["whoosh", S[4], .6], ["squish", cue("hair"), .5], ["scratch", S[5], .9], ["whoosh", cue("thousand"), .6],
  ["boom", cue("sugar"), 1], ["whoosh", S[8], .6], ["whoosh", S[9], .6], ["whoosh", cue("everyone"), .5],
  ["whoosh", S[10], .6], ["trombone", cue("rotten"), .7], ["whoosh", S[11], .6], ["whoosh", S[12], .5],
];
const DUR = { whoosh: 0.5, squish: 0.9, register: 1.2, scratch: 0.9, trombone: 1.9, boom: 1.04 };
const audio = `<audio id="vo" data-start="0" data-duration="${Math.min(T.end, 59.4)}" data-track-index="10" data-volume="1" src="assets/audio/vo_final.wav"></audio>
${SFX.map(([n, t, v], i) => `<audio id="sfx${i}" data-start="${Math.max(0, t).toFixed(3)}" data-duration="${Math.min(DUR[n], T.end - t).toFixed(3)}" data-track-index="${11 + i % 3}" data-volume="${v}" src="assets/audio/sfx_${n}.wav"></audio>`).join("\n")}`;

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
.tag.sm{font-size:46px;padding:4px 24px 0;box-shadow:6px 6px 0 ${C.navy};margin:0}
.l4{font-size:150px}.l5{font-size:118px;margin-top:8px}.l6{font-size:118px}
#s2stamp{position:absolute;left:330px;top:1040px;font-size:120px;color:${C.red};border:14px solid ${C.red};border-radius:18px;padding:0 26px;background:rgba(251,240,210,.92);letter-spacing:4px;opacity:0}
.puff{position:absolute;left:500px;top:1090px;width:90px;height:90px;border-radius:50%;background:${C.cream};opacity:0}
.chip{position:absolute;left:520px;top:1300px;width:22px;height:18px;border-radius:5px;background:#fff;opacity:0}
#s5fly i{position:absolute;left:372px;top:1016px;width:10px;height:46px;border-radius:5px;background:${C.hair};opacity:0}
#s7scan{position:absolute;left:230px;top:800px;width:620px;height:16px;background:${C.mint};box-shadow:0 0 0 6px rgba(61,220,151,.35),0 -60px 0 0 rgba(61,220,151,.18);opacity:0}
#s7badge{position:absolute;left:700px;top:800px;width:300px;height:300px;border-radius:50%;background:${C.mint};border:12px solid #fff;box-shadow:10px 10px 0 ${C.navy};text-align:center;color:${C.navy};opacity:0}
#s7badge b{display:block;font-size:170px;line-height:170px;font-weight:400;margin-top:14px}#s7badge span{display:block;font-size:54px;line-height:54px}
.sweet{position:absolute;left:510px;top:1290px;width:56px;height:56px;border-radius:50%;opacity:0}
.smoke{position:absolute;left:520px;top:860px;width:120px;height:120px;border-radius:50%;background:#fff;opacity:0}
#s10line{position:absolute;left:140px;top:800px;width:0;height:523px;overflow:hidden}
.candy{position:absolute;top:-260px}
#logo21{position:absolute;left:0;width:1080px;top:1590px;text-align:center;z-index:35}
#logo21 span{display:inline-block;width:200px;height:200px;line-height:204px;border-radius:50%;background:#fff;color:${C.navy};font-size:120px;border:12px solid ${C.mint};box-shadow:10px 10px 0 ${C.navy}}
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
${scene2}
${scene3}
${scene4}
${scene5}
${scene6}
${scene7}
${scene8}
${scene9}
${scene10}
${scene11}
${scene12}
${scene13}
${audio}
${ticker}
${subs}
<svg id="grain" class="clip" data-start="0" data-duration="${T.end}" data-track-index="5" viewBox="0 0 1080 1920"><filter id="gn"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .2  0 0 0 1.4 -.35"/></filter><rect width="1080" height="1920" filter="url(#gn)"/></svg>
</div>
<script>window.T=${JSON.stringify({ s: T.scenes, end: T.end, subs: subData, years: YEARS, mint: C.mint, words: words.map(w => [w.w, w.s]) })};</script>
<script>${readFileSync(new URL("./anim.js", import.meta.url), "utf8")}</script>
</body>
</html>
`;
writeFileSync(new URL("./index.html", import.meta.url), html);
console.log("index.html written,", chunks.length, "subtitle chunks,", T.words ? "real" : "estimated", "word timing");
