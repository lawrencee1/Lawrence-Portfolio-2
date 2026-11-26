// The figure: one jointed body used twice. On the main stage people spin it and tap the
// sore spot; in the movement clips the same body performs each exercise.
// Everything here is drawn from simple shapes in code. No external model is loaded.
import * as THREE from 'three';

const D2R = Math.PI / 180;
export const HIP_Y = 0.95;          // height of the hip centre when standing
export const ARM = [0.31, 0.265];    // upper arm, forearm
export const LEG = [0.43, 0.41];    // thigh, shin
export const ANKLE_Y = 0.08;        // ankle height when the foot is flat on the floor

const FK = ['spine', 'chest', 'neck', 'head', 'armL', 'foreL', 'handL', 'armR', 'foreR', 'handR',
  'legL', 'shinL', 'footL', 'legR', 'shinR', 'footR'];

export const REST = {
  root: { p: [0, HIP_Y, 0], r: [0, 0, 0] },
  spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0],
  armL: [2, 0, 9], foreL: [-8, 0, 0], handL: [0, 0, 0],
  armR: [2, 0, -9], foreR: [-8, 0, 0], handR: [0, 0, 0],
  legL: [0, 0, 1.5], shinL: [0, 0, 0], footL: [0, 0, 0],
  legR: [0, 0, -1.5], shinR: [0, 0, 0], footR: [0, 0, 0],
  shLp: [0, 0, 0], shRp: [0, 0, 0],
};

/* ---------- pose helpers ---------- */
export function mergePose(a, b) {
  const out = {};
  for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const x = a ? a[k] : undefined, y = b ? b[k] : undefined;
    if (y === undefined) out[k] = Array.isArray(x) ? x.slice() : (x && typeof x === 'object' ? mergePose(x, {}) : x);
    else if (Array.isArray(y) || typeof y !== 'object') out[k] = Array.isArray(y) ? y.slice() : y;
    else out[k] = mergePose(x && !Array.isArray(x) && typeof x === 'object' ? x : {}, y);
  }
  return out;
}
export const fullPose = (p) => mergePose(REST, p || {});
export function lerpPose(a, b, t, out = {}) {
  for (const k in a) {
    const x = a[k], y = b[k] === undefined ? x : b[k];
    if (Array.isArray(x)) { const o = out[k] || (out[k] = []); for (let i = 0; i < x.length; i++) o[i] = x[i] + (y[i] - x[i]) * t; o.length = x.length; }
    else if (typeof x === 'number') out[k] = x + (y - x) * t;
    else if (x && typeof x === 'object') out[k] = lerpPose(x, y, t, out[k] && !Array.isArray(out[k]) ? out[k] : {});
    else out[k] = x;
  }
  return out;
}

/* ---------- material: clay body, cool rim light, warm glow where it hurts ---------- */
export function bodyMaterial(opts = {}) {
  const m = new THREE.MeshStandardMaterial({ color: opts.color || 0xd3d9e6, roughness: 0.6, metalness: 0 });
  const u = m.userData.u = {
    uSel: { value: new THREE.Vector4(0, -99, 0, 0.16) },
    uHov: { value: new THREE.Vector4(0, -99, 0, 0.13) },
    uSelK: { value: 0 }, uHovK: { value: 0 },
    uHot: { value: new THREE.Color(opts.hot || 0xff5533) },
    uRim: { value: new THREE.Color(opts.rim || 0x86a9ff) },
    uRimK: { value: opts.rimK === undefined ? 0.34 : opts.rimK },
  };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vWPos; uniform vec4 uSel; uniform vec4 uHov; uniform float uSelK; uniform float uHovK; uniform vec3 uHot; uniform vec3 uRim; uniform float uRimK;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
float kS = smoothstep(uSel.w, uSel.w * 0.2, distance(vWPos, uSel.xyz)) * uSelK;
float kH = smoothstep(uHov.w, uHov.w * 0.2, distance(vWPos, uHov.xyz)) * uHovK;
diffuseColor.rgb = mix(diffuseColor.rgb, uHot, clamp(kS * 0.9 + kH * 0.38, 0.0, 1.0));`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += uHot * (kS * 0.5 + kH * 0.14);
float fr = pow(1.0 - saturate(dot(normalize(vNormal), normalize(vViewPosition))), 2.4);
totalEmissiveRadiance += uRim * fr * uRimK;`);
  };
  return m;
}

/* ---------- shapes ---------- */
function lathe(profile, sx = 1, sz = 1, seg = 30) {
  const curve = new THREE.SplineCurve(profile.map(([y, r]) => new THREE.Vector2(r, y)));
  const pts = curve.getPoints(profile.length * 5).map((p) => new THREE.Vector2(Math.max(0.0005, p.x), p.y));
  const g = new THREE.LatheGeometry(pts, seg);
  g.scale(sx, 1, sz);
  return g;
}
function ball(r, sx = 1, sy = 1, sz = 1) {
  const g = new THREE.SphereGeometry(r, 26, 18);
  g.scale(sx, sy, sz);
  return g;
}

/* ---------- the figure ---------- */
export function createFigure(opts = {}) {
  const mat = opts.material || bodyMaterial(opts);
  const group = new THREE.Group();
  const J = {}, meshes = [], anchors = [];
  const joint = (name, parent, x, y, z) => {
    const o = new THREE.Group(); o.name = name; o.position.set(x, y, z); o.userData.rest = [x, y, z];
    parent.add(o); J[name] = o; return o;
  };
  const add = (geo, parent, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    m.castShadow = true; parent.add(m); meshes.push(m); return m;
  };
  const anchor = (region, parent, x, y, z, r, side) => {
    const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o);
    anchors.push({ region, side: side || '', node: o, r, world: new THREE.Vector3() });
  };

  const root = joint('root', group, 0, HIP_Y, 0);
  // pelvis
  add(lathe([[-0.135, 0], [-0.125, 0.07], [-0.09, 0.122], [-0.03, 0.146], [0.04, 0.143], [0.1, 0.132], [0.135, 0.12]], 1, 0.72), root);
  add(ball(0.088, 1, 1, 0.95), root, 0.066, -0.05, -0.05);
  add(ball(0.088, 1, 1, 0.95), root, -0.066, -0.05, -0.05);

  const spine = joint('spine', root, 0, 0.1, 0);
  add(lathe([[-0.06, 0.124], [0, 0.126], [0.07, 0.121], [0.14, 0.13], [0.21, 0.142]], 1, 0.7), spine);

  const chest = joint('chest', spine, 0, 0.17, 0);
  add(lathe([[-0.06, 0.128], [0.02, 0.15], [0.1, 0.167], [0.17, 0.17], [0.22, 0.152], [0.252, 0.108], [0.272, 0.06], [0.284, 0]], 1, 0.66), chest);
  add(ball(0.06, 1.1, 1.2, 0.42), chest, 0.075, 0.13, -0.075);  // shoulder blades
  add(ball(0.06, 1.1, 1.2, 0.42), chest, -0.075, 0.13, -0.075);

  const neck = joint('neck', chest, 0, 0.265, 0);
  add(lathe([[-0.03, 0.056], [0.02, 0.049], [0.07, 0.047], [0.11, 0.05]]), neck);
  const head = joint('head', neck, 0, 0.085, 0);
  add(lathe([[-0.012, 0], [0, 0.044], [0.03, 0.07], [0.08, 0.091], [0.13, 0.099], [0.172, 0.092], [0.207, 0.066], [0.226, 0.03], [0.231, 0]], 0.9, 1.04), head, 0, 0, 0.006);
  add(ball(0.016, 0.75, 1.15, 0.9), head, 0, 0.092, 0.104);     // nose
  add(ball(0.022, 0.4, 1, 0.75), head, 0.088, 0.1, 0.0);        // ears
  add(ball(0.022, 0.4, 1, 0.75), head, -0.088, 0.1, 0.0);
  // a plain cap of hair so it is obvious which way the head faces
  const hair = add(ball(0.104, 0.9, 1, 1.05), head, 0, 0.137, -0.013);
  hair.material = opts.hairMaterial || new THREE.MeshStandardMaterial({ color: opts.hair || 0x414d78, roughness: 0.7 });

  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    const sh = joint('sh' + S, chest, s * 0.165, 0.215, 0);
    add(ball(0.06, 1.5, 0.7, 0.85), chest, s * 0.115, 0.232, -0.005, 0, 0, s * -0.3); // slope from neck to shoulder
    const arm = joint('arm' + S, sh, s * 0.03, 0, 0);
    add(ball(0.064), arm);
    add(lathe([[-0.32, 0.04], [-0.22, 0.046], [-0.1, 0.052], [-0.02, 0.056], [0.02, 0.05]]), arm);
    const fore = joint('fore' + S, arm, 0, -ARM[0], 0);
    add(ball(0.044), fore);
    add(lathe([[-0.27, 0.028], [-0.21, 0.033], [-0.1, 0.045], [-0.03, 0.046], [0.01, 0.04]]), fore);
    const hand = joint('hand' + S, fore, 0, -ARM[1], 0);
    add(ball(0.03, 0.85, 1, 1.1), hand);
    add(ball(0.05, 0.36, 1.8, 0.86), hand, 0, -0.092, 0.004);
    add(ball(0.017, 0.8, 2.3, 0.85), hand, s * -0.004, -0.058, 0.044, 0.5, 0, 0); // thumb

    const leg = joint('leg' + S, root, s * 0.09, -0.03, 0);
    add(ball(0.088), leg);
    add(lathe([[-0.44, 0.05], [-0.36, 0.058], [-0.24, 0.072], [-0.1, 0.084], [-0.02, 0.086], [0.02, 0.08]]), leg);
    const shin = joint('shin' + S, leg, 0, -LEG[0], 0);
    add(ball(0.056), shin);
    add(lathe([[-0.415, 0.034], [-0.36, 0.037], [-0.26, 0.05], [-0.16, 0.06], [-0.08, 0.056], [0, 0.05]]), shin, 0, 0, -0.008);
    const foot = joint('foot' + S, shin, 0, -LEG[1], 0);
    add(ball(0.038), foot);
    add(ball(0.05, 0.92, 0.62, 2.3), foot, 0, -0.049, 0.06);

    const side = S === 'L' ? 'left' : 'right';
    anchor('shoulder', arm, 0, 0, 0, 0.13, side);
    anchor('elbow', fore, 0, 0, 0, 0.1, side);
    anchor('wrist', hand, 0, -0.05, 0, 0.115, side);
    anchor('hip', leg, s * 0.035, 0, 0.02, 0.13, side);
    anchor('hip', root, s * 0.075, -0.05, -0.1, 0.13, side);
    anchor('thigh', leg, 0, -0.22, 0, 0.14, side);
    anchor('knee', shin, 0, 0, 0.01, 0.105, side);
    anchor('calf', shin, 0, -0.2, -0.01, 0.13, side);
    anchor('ankle', foot, 0, -0.025, 0.045, 0.125, side);
  }
  anchor('head', head, 0, 0.115, 0, 0.15);
  anchor('neck', neck, 0, 0.035, 0, 0.085);
  anchor('chest', chest, 0, 0.12, 0.115, 0.17);
  anchor('upper-back', chest, 0, 0.13, -0.115, 0.19);
  anchor('abdomen', spine, 0, 0.04, 0.095, 0.15);
  anchor('lower-back', spine, 0, 0.03, -0.095, 0.16);

  /* ----- two-bone IK so hands and feet stay planted on the floor, a wall or a chair ----- */
  const vS = new THREE.Vector3(), vT = new THREE.Vector3(), vD = new THREE.Vector3(), vP = new THREE.Vector3(), vE = new THREE.Vector3();
  const bx = new THREE.Vector3(), by = new THREE.Vector3(), bz = new THREE.Vector3();
  const mB = new THREE.Matrix4(), qW = new THREE.Quaternion(), qP = new THREE.Quaternion(), qU = new THREE.Quaternion();
  const basis = (yAxis, zRef, out) => {
    by.copy(yAxis).normalize();
    bz.copy(zRef).addScaledVector(by, -zRef.dot(by));
    if (bz.lengthSq() < 1e-8) bz.set(0, 0, 1).addScaledVector(by, -by.z);
    bz.normalize(); bx.crossVectors(by, bz);
    mB.makeBasis(bx, by, bz); return out.setFromRotationMatrix(mB);
  };
  function solve(upper, lower, a, b, target, pole, isLeg) {
    upper.getWorldPosition(vS);
    vD.subVectors(target, vS);
    const d = Math.min(Math.max(vD.length(), Math.abs(a - b) + 1e-3), a + b - 1e-4);
    vD.normalize();
    const cosA = (a * a + d * d - b * b) / (2 * a * d), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
    vP.copy(pole).addScaledVector(vD, -pole.dot(vD));
    if (vP.lengthSq() < 1e-8) vP.set(0, 0, 1);
    vP.normalize();
    vE.copy(vS).addScaledVector(vD, a * cosA).addScaledVector(vP, a * sinA);
    vT.copy(vS).addScaledVector(vD, d);
    const zRef = isLeg ? vP : vP.clone().negate();
    basis(vS.clone().sub(vE), zRef, qU);
    upper.parent.getWorldQuaternion(qP);
    upper.quaternion.copy(qP.invert()).multiply(qU);
    basis(vE.clone().sub(vT), zRef, qW);
    lower.quaternion.copy(qU.clone().invert()).multiply(qW);
    return qW;
  }
  const tmpV = new THREE.Vector3(), tmpP = new THREE.Vector3(), qF = new THREE.Quaternion(), fw = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const LIMBS = {
    handL: ['armL', 'foreL', ARM, false], handR: ['armR', 'foreR', ARM, false],
    footL: ['legL', 'shinL', LEG, true], footR: ['legR', 'shinR', LEG, true],
  };

  function applyPose(p) {
    root.position.fromArray(p.root.p);
    root.rotation.set(p.root.r[0] * D2R, p.root.r[1] * D2R, p.root.r[2] * D2R);
    for (const k of FK) { const r = p[k]; J[k].rotation.set(r[0] * D2R, r[1] * D2R, r[2] * D2R); }
    for (const S of ['L', 'R']) {
      const o = p['sh' + S + 'p'], sh = J['sh' + S], rest = sh.userData.rest;
      sh.position.set(rest[0] + o[0], rest[1] + o[1], rest[2] + o[2]);
    }
    if (p.ik) {
      group.updateMatrixWorld(true);
      for (const k in p.ik) {
        const [un, ln, len, isLeg] = LIMBS[k];
        tmpV.fromArray(p.ik[k]); group.localToWorld(tmpV);
        if (p.pole && p.pole[k]) tmpP.fromArray(p.pole[k]).transformDirection(group.matrixWorld);
        else if (isLeg) tmpP.set(0, 0, 1).transformDirection(root.matrixWorld);
        else tmpP.set(k === 'handL' ? 0.25 : -0.25, -0.2, -1).transformDirection(J.chest.matrixWorld);
        const qLower = solve(J[un], J[ln], len[0], len[1], tmpV, tmpP, isLeg);
        const end = J[k];
        if (p.flat && p.flat[k] !== undefined) {
          const yaw = p.flat[k] * D2R;
          fw.set(Math.sin(yaw), 0, Math.cos(yaw)).transformDirection(group.matrixWorld);
          if (isLeg) { bx.crossVectors(up, fw).normalize(); mB.makeBasis(bx, up, fw); }
          else { by.copy(fw).negate(); bz.crossVectors(up, by).normalize(); mB.makeBasis(up, by, bz); }
          qF.setFromRotationMatrix(mB);
          end.quaternion.copy(qLower.clone().invert()).multiply(qF);
        }
        J[un].updateMatrixWorld(true);
      }
    }
    group.updateMatrixWorld(true);
  }

  function updateAnchors() { for (const a of anchors) a.node.getWorldPosition(a.world); }
  // which sore spot is closest to a point on the body
  function regionAt(point) {
    let best = null, bd = Infinity;
    for (const a of anchors) { const d = a.world.distanceTo(point) / (0.6 + a.r * 3); if (d < bd) { bd = d; best = a; } }
    return best;
  }
  function anchorFor(region, side) {
    return anchors.find((a) => a.region === region && (!side || !a.side || a.side === side)) || null;
  }

  applyPose(fullPose({}));
  updateAnchors();
  return { group, joints: J, meshes, anchors, material: mat, uniforms: mat.userData.u, applyPose, updateAnchors, regionAt, anchorFor };
}
