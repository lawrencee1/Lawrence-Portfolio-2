// Draws the movement clips. One hidden WebGL canvas renders the figure doing a move,
// then the frame is copied into each visible clip, so a page full of clips needs one GPU context.
import * as THREE from 'three';
import { createFigure, bodyMaterial } from './rig.js';
import { MOVES, poseAt } from './moves.js';

const D2R = Math.PI / 180;

function glowTexture(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export class DemoStage {
  constructor(w = 800, h = 600) {
    this.w = w; this.h = h;
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    r.setPixelRatio(1); r.setSize(w, h, false);
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = this.scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101827);
    scene.fog = new THREE.Fog(0x101827, 5, 11);
    this.camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 30);

    scene.add(new THREE.HemisphereLight(0xcfdcff, 0x1b2233, 1.15));
    const key = this.key = new THREE.DirectionalLight(0xfff1e0, 2.3);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -1.7, right: 1.7, top: 2.2, bottom: -0.6, near: 0.5, far: 9 });
    key.shadow.radius = 5; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
    scene.add(key, key.target);
    const rim = this.rim = new THREE.DirectionalLight(0x8fb0ff, 1.5); scene.add(rim, rim.target);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.MeshBasicMaterial({ map: glowTexture('#273350', '#101827') }));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.42 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.001; shadow.receiveShadow = true; scene.add(shadow);

    this.figure = createFigure({ material: bodyMaterial({ rimK: 0.22 }) });
    scene.add(this.figure.group);

    // props: plain furniture drawn from boxes
    const pm = new THREE.MeshStandardMaterial({ color: 0x33415f, roughness: 0.85 });
    const pm2 = new THREE.MeshStandardMaterial({ color: 0x27324b, roughness: 0.9 });
    const box = (w2, h2, d2, x, y, z, m = pm) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, d2), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; return b; };
    const P = this.props = {};
    const chair = P.chair = new THREE.Group();
    chair.add(box(0.46, 0.05, 0.44, 0, 0.425, 0), box(0.46, 0.5, 0.04, 0, 0.72, -0.22, pm2));
    for (const [x, z] of [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]]) chair.add(box(0.04, 0.4, 0.04, x, 0.2, z, pm2));
    const table = P.table = new THREE.Group();
    table.add(box(0.9, 0.05, 0.55, 0, 0.72, 0));
    for (const [x, z] of [[-0.41, -0.23], [0.41, -0.23], [-0.41, 0.23], [0.41, 0.23]]) table.add(box(0.05, 0.7, 0.05, x, 0.35, z, pm2));
    const wall = P.wall = new THREE.Group();
    wall.add(box(7, 3, 0.06, 0, 1.5, -0.03, new THREE.MeshStandardMaterial({ color: 0x2c3856, roughness: 0.95, emissive: 0x18213a })));
    wall.add(box(7, 0.09, 0.02, 0, 0.045, 0.01, new THREE.MeshStandardMaterial({ color: 0x4a5a86, roughness: 0.9, emissive: 0x222c4a })));
    const mat = P.mat = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.012, 1.95), new THREE.MeshStandardMaterial({ color: 0x3b4d75, roughness: 0.95 }));
    m.position.y = 0.006; m.receiveShadow = true; mat.add(m);
    for (const k in P) { P[k].visible = false; scene.add(P[k]); }
    this.ok = true;
  }

  // draw move `id` at time t (seconds) into a 2D canvas
  draw(id, t, canvas) {
    const mv = MOVES[id]; if (!mv) return;
    const fig = this.figure;
    fig.applyPose(poseAt(mv, t));
    for (const k in this.props) this.props[k].visible = false;
    for (const [name, x = 0, z = 0, ry = 0] of mv.props || []) { const p = this.props[name]; p.visible = true; p.position.set(x, 0, z); p.rotation.y = ry * D2R; }
    const c = mv.cam, yaw = c.yaw * D2R, pitch = (c.pitch || 0) * D2R, tg = c.target;
    this.camera.position.set(tg[0] + c.dist * Math.sin(yaw) * Math.cos(pitch), tg[1] + c.dist * Math.sin(pitch), tg[2] + c.dist * Math.cos(yaw) * Math.cos(pitch));
    this.camera.lookAt(tg[0], tg[1], tg[2]);
    // lights follow the camera so every clip is lit from the front left with a rim from behind
    const kx = Math.sin(yaw - 0.7), kz = Math.cos(yaw - 0.7);
    this.key.position.set(tg[0] + kx * 3, 4.2, tg[2] + kz * 3); this.key.target.position.set(tg[0], 0.6, tg[2]);
    this.rim.position.set(tg[0] - Math.sin(yaw + 0.5) * 3, 2.4, tg[2] - Math.cos(yaw + 0.5) * 3); this.rim.target.position.set(tg[0], 1, tg[2]);
    const u = fig.uniforms;
    if (mv.focus) {
      fig.updateAnchors();
      const a = fig.anchorFor(mv.focus[0], mv.focus[1] || 'left');
      u.uSel.value.set(a.world.x, a.world.y, a.world.z, a.r * 1.25); u.uSelK.value = 0.55 + 0.12 * Math.sin(t * 2.4);
    } else u.uSelK.value = 0;
    this.renderer.render(this.scene, this.camera);
    const x = canvas.getContext('2d');
    x.drawImage(this.renderer.domElement, 0, 0, canvas.width, canvas.height);
  }
}
