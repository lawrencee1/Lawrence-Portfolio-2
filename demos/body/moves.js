// The movement library. Each move is a short loop of key poses for the figure in rig.js.
// Angles are degrees. Conventions (figure faces +Z, its left side is +X):
//   spine/chest/neck/head  x+ bends forward, y+ turns to its left, z+ leans to its right
//   arm/leg                x- swings forward, z+ swings toward +X
//   fore x- bends the elbow, shin x+ bends the knee, foot x+ points the toes
// `ik` pins a wrist or ankle to a point in space (metres) and the limb solves itself.
import { fullPose, mergePose, lerpPose, HIP_Y } from './rig.js';

const FEET = { footL: [0.09, 0.08, 0], footR: [-0.09, 0.08, 0] };
const SUP = { p: [0, 0.12, 0], r: [-90, 0, 0] };            // lying on the back, head toward -Z
const SUP_ARMS = { handL: [0.3, 0.05, -0.02], handR: [-0.3, 0.05, -0.02] };
const SEAT = { p: [0, 0.55, 0], r: [0, 0, 0] };              // sitting on the chair prop
const SIT_LEGS = { legL: [-85, 0, 2], shinL: [85, 0, 0], legR: [-85, 0, -2], shinR: [85, 0, 0] };
const LAP = { armL: [-22, 0, 4], foreL: [-62, 0, -14], armR: [-22, 0, -4], foreR: [-62, 0, 14] };
const ALL4 = { handL: [0.18, 0.035, 0.5], handR: [-0.18, 0.035, 0.5], footL: [0.1, 0.05, -0.47], footR: [-0.1, 0.05, -0.47] };
const HIPS = { armL: [12, 0, 28], foreL: [-20, 0, -70], armR: [12, 0, -28], foreR: [-20, 0, 70] };   // hands on hips
const CROSS = { armL: [-30, 0, -8], foreL: [-142, 0, -42], armR: [-22, 0, 8], foreR: [-138, 0, 42] }; // arms folded on the chest
const SIDE = { yaw: 72, pitch: 12, dist: 3.2, target: [0, 0.32, 0.05] };

export const MOVES = {
  chinTuck: {
    cam: { yaw: 78, pitch: 4, dist: 1.75, target: [0, 1.5, 0.02] }, focus: ['neck'],
    keys: [[0, { neck: [11, 0, 0], head: [-7, 0, 0] }], [1.1, { neck: [-9, 0, 0], head: [11, 0, 0] }], [2.9, { neck: [-9, 0, 0], head: [11, 0, 0] }], [3.9, { neck: [11, 0, 0], head: [-7, 0, 0] }], [4.6, {}]],
    base: { neck: [11, 0, 0], head: [-7, 0, 0] },
  },
  neckTilt: {
    cam: { yaw: 0, pitch: 4, dist: 1.9, target: [0, 1.48, 0] }, focus: ['neck'],
    keys: [[0, {}], [1.2, { neck: [0, 0, 14], head: [0, 0, 21] }], [2.9, { neck: [0, 0, 14], head: [0, 0, 21] }], [3.9, {}],
      [5.1, { neck: [0, 0, -14], head: [0, 0, -21] }], [6.8, { neck: [0, 0, -14], head: [0, 0, -21] }], [7.8, {}]],
  },
  neckTurn: {
    cam: { yaw: 14, pitch: 6, dist: 1.8, target: [0, 1.5, 0] }, focus: ['neck'],
    keys: [[0, {}], [1.3, { neck: [0, 26, 0], head: [0, 36, 0] }], [2.4, { neck: [0, 26, 0], head: [0, 36, 0] }], [3.5, {}],
      [4.8, { neck: [0, -26, 0], head: [0, -36, 0] }], [5.9, { neck: [0, -26, 0], head: [0, -36, 0] }], [7, {}]],
  },
  shoulderRolls: {
    cam: { yaw: 40, pitch: 6, dist: 2.1, target: [0, 1.4, 0] }, focus: ['upper-back'], linear: true,
    keys: [[0, { shLp: [0, 0.04, 0], shRp: [0, 0.04, 0] }], [0.9, { shLp: [-0.008, 0.012, -0.04], shRp: [0.008, 0.012, -0.04] }],
      [1.8, { shLp: [0, -0.018, 0], shRp: [0, -0.018, 0] }], [2.7, { shLp: [0, 0.01, 0.034], shRp: [0, 0.01, 0.034] }], [3.6, {}]],
    base: { shLp: [0, 0.04, 0], shRp: [0, 0.04, 0] },
  },
  pendulum: {
    cam: { yaw: 62, pitch: 10, dist: 3.5, target: [0, 0.82, 0.22] }, focus: ['shoulder'], linear: true, props: [['table', -0.28, 0.72]],
    base: { root: { p: [0, 0.9, -0.1], r: [40, 0, 0] }, spine: [8, 0, 0], chest: [6, 0, 0], neck: [-22, 0, 0], head: [-8, 0, 0],
      foreL: [-3, 0, 0], ik: { footL: [0.1, 0.08, -0.16], footR: [-0.1, 0.08, 0.16], handR: [-0.22, 0.775, 0.5] }, flat: { footL: 0, footR: 0, handR: 0 } },
    keys: [[0, { armL: [-42, 0, 0] }], [0.7, { armL: [-54, 0, 12] }], [1.4, { armL: [-66, 0, 0] }], [2.1, { armL: [-54, 0, -12] }], [2.8, {}]],
  },
  wallSlide: {
    cam: { yaw: 24, pitch: 6, dist: 3.5, target: [0, 1.15, 0] }, focus: ['shoulder'], props: [['wall', 0, -0.17]],
    base: { armL: [0, 0, 78], foreL: [0, 0, 96], armR: [0, 0, -78], foreR: [0, 0, -96] },
    keys: [[0, {}], [1.6, { armL: [0, 0, 152], foreL: [0, 0, 22], armR: [0, 0, -152], foreR: [0, 0, -22] }], [2.3, { armL: [0, 0, 152], foreL: [0, 0, 22], armR: [0, 0, -152], foreR: [0, 0, -22] }], [3.9, {}], [4.5, {}]],
  },
  crossBody: {
    cam: { yaw: 18, pitch: 6, dist: 2.3, target: [0, 1.38, 0.05] }, focus: ['shoulder'],
    base: {},
    keys: [[0, {}], [1.3, { armL: [-88, 0, -62], foreL: [-6, 0, 0], armR: [-58, 0, 18], foreR: [-118, 0, 0] }],
      [1.9, { armL: [-88, 0, -76], foreL: [-6, 0, 0], armR: [-62, 0, 24], foreR: [-122, 0, 0], chest: [0, 4, 0] }],
      [4.3, { armL: [-88, 0, -76], foreL: [-6, 0, 0], armR: [-62, 0, 24], foreR: [-122, 0, 0], chest: [0, 4, 0] }], [5.6, {}], [6, {}]],
  },
  catCow: {
    cam: { yaw: 74, pitch: 10, dist: 2.9, target: [0, 0.36, 0.1] }, focus: ['lower-back'], props: [['mat', 0, 0.05]],
    base: { root: { p: [0, 0.5, 0], r: [78, 0, 0] }, footL: [84, 0, 0], footR: [84, 0, 0], ik: ALL4, flat: { handL: 0, handR: 0 }, pole: { handL: [0.4, 0.05, -1], handR: [-0.4, 0.05, -1] } },
    keys: [[0, {}], [1.5, { root: { r: [56, 0, 0] }, spine: [22, 0, 0], chest: [14, 0, 0], neck: [26, 0, 0], head: [14, 0, 0] }],
      [2.5, { root: { r: [56, 0, 0] }, spine: [22, 0, 0], chest: [14, 0, 0], neck: [26, 0, 0], head: [14, 0, 0] }],
      [4.2, { root: { r: [92, 0, 0] }, spine: [-12, 0, 0], chest: [-10, 0, 0], neck: [-22, 0, 0], head: [-10, 0, 0] }],
      [5.2, { root: { r: [92, 0, 0] }, spine: [-12, 0, 0], chest: [-10, 0, 0], neck: [-22, 0, 0], head: [-10, 0, 0] }], [6.4, {}]],
  },
  childPose: {
    cam: { yaw: 74, pitch: 12, dist: 2.9, target: [0, 0.3, 0.05] }, focus: ['lower-back'], props: [['mat', 0, 0.05]],
    base: { root: { p: [0, 0.5, 0], r: [78, 0, 0] }, footL: [84, 0, 0], footR: [84, 0, 0], ik: { ...ALL4, footL: [0.12, 0.05, -0.44], footR: [-0.12, 0.05, -0.44] }, flat: { handL: 0, handR: 0 }, pole: { handL: [0.4, 0.05, -1], handR: [-0.4, 0.05, -1] } },
    keys: [[0, {}], [1.8, { root: { p: [0, 0.27, -0.37], r: [78, 0, 0] }, spine: [18, 0, 0], chest: [14, 0, 0], neck: [-12, 0, 0], ik: { handL: [0.17, 0.035, 0.66], handR: [-0.17, 0.035, 0.66] } }],
      [4.6, { root: { p: [0, 0.26, -0.38], r: [79, 0, 0] }, spine: [19, 0, 0], chest: [15, 0, 0], neck: [-12, 0, 0], ik: { handL: [0.17, 0.035, 0.68], handR: [-0.17, 0.035, 0.68] } }], [6.2, {}], [6.6, {}]],
  },
  seatedRotation: {
    cam: { yaw: 0, pitch: 10, dist: 3, target: [0, 0.9, 0.1] }, focus: ['upper-back'], props: [['chair', 0, -0.04]],
    base: { root: SEAT, ...SIT_LEGS, ...CROSS },
    keys: [[0, {}], [1.4, { spine: [0, 24, 0], chest: [0, 30, 0], neck: [0, 14, 0] }], [2.6, { spine: [0, 24, 0], chest: [0, 30, 0], neck: [0, 14, 0] }], [3.8, {}],
      [5.2, { spine: [0, -24, 0], chest: [0, -30, 0], neck: [0, -14, 0] }], [6.4, { spine: [0, -24, 0], chest: [0, -30, 0], neck: [0, -14, 0] }], [7.6, {}]],
  },
  bladeSqueeze: {
    cam: { yaw: 148, pitch: 8, dist: 2.3, target: [0, 1.32, 0] }, focus: ['upper-back'],
    base: { armL: [-6, 0, 8], foreL: [-90, 0, 0], armR: [-6, 0, -8], foreR: [-90, 0, 0] },
    keys: [[0, {}], [1.2, { armL: [24, 0, 16], armR: [24, 0, -16], foreL: [-100, 0, 0], foreR: [-100, 0, 0], shLp: [-0.022, 0, -0.035], shRp: [0.022, 0, -0.035], chest: [-4, 0, 0] }],
      [3, { armL: [24, 0, 16], armR: [24, 0, -16], foreL: [-100, 0, 0], foreR: [-100, 0, 0], shLp: [-0.022, 0, -0.035], shRp: [0.022, 0, -0.035], chest: [-4, 0, 0] }], [4.1, {}], [4.7, {}]],
  },
  kneeToChest: {
    cam: SIDE, focus: ['lower-back'], props: [['mat', 0, 0.05]],
    base: { root: SUP, legL: [5, 0, 2], legR: [5, 0, -2], footL: [-12, 0, 0], footR: [-12, 0, 0], ik: SUP_ARMS, pole: { handL: [1, -0.4, 0.2], handR: [-1, -0.4, 0.2] } },
    keys: [[0, {}], [1.5, { legL: [-118, 0, 0], shinL: [122, 0, 0], ik: { handL: [0.16, 0.46, -0.17], handR: [0.02, 0.47, -0.17] } }],
      [2.2, { legL: [-130, 0, 0], shinL: [128, 0, 0], ik: { handL: [0.16, 0.44, -0.24], handR: [0.02, 0.45, -0.24] } }],
      [4.4, { legL: [-130, 0, 0], shinL: [128, 0, 0], ik: { handL: [0.16, 0.44, -0.24], handR: [0.02, 0.45, -0.24] } }], [6, {}], [6.5, {}]],
  },
  bridge: {
    cam: SIDE, focus: ['hip'], props: [['mat', 0, 0.05]],
    base: { root: SUP, ik: { ...SUP_ARMS, footL: [0.1, 0.08, 0.5], footR: [-0.1, 0.08, 0.5] }, flat: { footL: 0, footR: 0, handL: 0, handR: 0 }, pole: { handL: [1, -0.4, 0.2], handR: [-1, -0.4, 0.2] } },
    keys: [[0, {}], [1.3, { root: { p: [0, 0.325, -0.045], r: [-115, 0, 0] }, neck: [14, 0, 0], head: [11, 0, 0] }],
      [2.9, { root: { p: [0, 0.325, -0.045], r: [-115, 0, 0] }, neck: [14, 0, 0], head: [11, 0, 0] }], [4.3, {}], [5, {}]],
  },
  figure4: {
    cam: { yaw: 46, pitch: 30, dist: 3.1, target: [0, 0.28, 0.02] }, focus: ['hip'], props: [['mat', 0, 0.05]],
    base: { root: SUP, footL: [-8, 0, 0], ik: { ...SUP_ARMS, footR: [-0.1, 0.08, 0.48], footL: [0.09, 0.08, 0.5] }, flat: { footR: 0, handL: 0, handR: 0 },
      pole: { handL: [1, -0.4, 0.2], handR: [-1, -0.4, 0.2], footL: [0, 1, 0] } },
    keys: [[0, {}], [1.4, { ik: { footL: [-0.085, 0.49, 0.2] }, pole: { footL: [1, 0.25, 0.25] } }],
      [2.4, { ik: { footL: [-0.085, 0.49, 0.2] }, pole: { footL: [1, 0.05, 0.5] } }], [4.4, { ik: { footL: [-0.085, 0.49, 0.2] }, pole: { footL: [1, 0.05, 0.5] } }], [6, {}], [6.5, {}]],
  },
  hipFlexor: {
    cam: { yaw: 68, pitch: 8, dist: 3.3, target: [0, 0.62, -0.05] }, focus: ['hip'], props: [['mat', 0, -0.1]],
    base: { root: { p: [0, 0.44, 0], r: [0, 0, 0] }, footL: [80, 0, 0], ...HIPS,
      ik: { footR: [-0.1, 0.08, 0.44], footL: [0.1, 0.05, -0.66] }, flat: { footR: 0 }, pole: { footL: [0, -1, 0.3] } },
    keys: [[0, {}], [1.5, { root: { p: [0, 0.35, 0.1], r: [-4, 0, 0] }, spine: [-4, 0, 0] }], [3.6, { root: { p: [0, 0.34, 0.11], r: [-5, 0, 0] }, spine: [-5, 0, 0] }], [5, {}], [5.5, {}]],
  },
  hamstring: {
    cam: SIDE, focus: ['thigh'], props: [['mat', 0, 0.05]],
    base: { root: SUP, legL: [-98, 0, 0], shinL: [92, 0, 0], footL: [-6, 0, 0],
      ik: { handL: [0.17, 0.36, -0.06], handR: [0.01, 0.37, -0.06], footR: [-0.1, 0.08, 0.5] }, flat: { footR: 0 }, pole: { handL: [1, -0.5, 0.2], handR: [-1, -0.5, 0.2] } },
    keys: [[0, {}], [1.6, { shinL: [16, 0, 0], footL: [-16, 0, 0] }], [3.2, { shinL: [12, 0, 0], footL: [-18, 0, 0] }], [4.6, {}], [5.2, {}]],
  },
  quadStretch: {
    cam: { yaw: 66, pitch: 6, dist: 3.9, target: [0, 0.92, -0.05] }, focus: ['thigh'], props: [['chair', -0.64, 0.1, -90]],
    base: { ik: { handR: [-0.41, 1.0, 0.1] } },
    keys: [[0, { ik: { handL: [0.26, 0.9, 0.02] } }], [1.6, { legL: [8, 0, 0], shinL: [132, 0, 0], footL: [20, 0, 0], shLp: [0, -0.03, -0.02], ik: { handL: [0.13, 0.9, -0.3] } }],
      [2.2, { legL: [14, 0, 0], shinL: [138, 0, 0], footL: [20, 0, 0], shLp: [0, -0.03, -0.02], ik: { handL: [0.13, 0.93, -0.33] } }],
      [4.4, { legL: [14, 0, 0], shinL: [138, 0, 0], footL: [20, 0, 0], shLp: [0, -0.03, -0.02], ik: { handL: [0.13, 0.93, -0.33] } }], [5.8, { ik: { handL: [0.26, 0.9, 0.02] } }], [6.3, { ik: { handL: [0.26, 0.9, 0.02] } }]],
  },
  sitToStand: {
    cam: { yaw: 64, pitch: 8, dist: 3.9, target: [0, 0.88, -0.1] }, focus: ['knee'], props: [['chair', 0, -0.36]],
    base: { root: { p: [0, 0.55, -0.34], r: [0, 0, 0] }, ...CROSS, ik: { footL: [0.11, 0.08, 0.04], footR: [-0.11, 0.08, 0.04] }, flat: { footL: 0, footR: 0 } },
    keys: [[0, {}], [0.7, { root: { p: [0, 0.56, -0.3], r: [26, 0, 0] }, neck: [-14, 0, 0] }], [1.4, { root: { p: [0, 0.72, -0.14], r: [30, 0, 0] }, neck: [-16, 0, 0] }],
      [2.2, { root: { p: [0, HIP_Y - 0.005, 0.03], r: [0, 0, 0] } }], [2.9, { root: { p: [0, HIP_Y - 0.005, 0.03], r: [0, 0, 0] } }],
      [3.8, { root: { p: [0, 0.72, -0.16], r: [30, 0, 0] }, neck: [-16, 0, 0] }], [4.6, { root: { p: [0, 0.56, -0.31], r: [20, 0, 0] }, neck: [-10, 0, 0] }], [5.2, {}], [5.7, {}]],
  },
  kneeExtension: {
    cam: { yaw: 58, pitch: 8, dist: 3.2, target: [0, 0.68, 0.22] }, focus: ['knee'], props: [['chair', 0, -0.04]],
    base: { root: SEAT, ...SIT_LEGS, armL: [8, 0, 10], foreL: [-12, 0, 0], armR: [8, 0, -10], foreR: [-12, 0, 0] },
    keys: [[0, {}], [1.4, { shinL: [6, 0, 0], footL: [-14, 0, 0] }], [2.6, { shinL: [6, 0, 0], footL: [-14, 0, 0] }], [4.2, {}], [4.8, {}]],
  },
  heelSlide: {
    cam: SIDE, focus: ['knee'], props: [['mat', 0, 0.05]],
    base: { root: SUP, legR: [5, 0, -2], footR: [-12, 0, 0], footL: [-8, 0, 0], ik: { ...SUP_ARMS, footL: [0.09, 0.055, 0.86] }, flat: { handL: 0, handR: 0 }, pole: { handL: [1, -0.4, 0.2], handR: [-1, -0.4, 0.2] } },
    keys: [[0, {}], [1.8, { ik: { footL: [0.09, 0.075, 0.36] } }], [2.6, { ik: { footL: [0.09, 0.075, 0.36] } }], [4.4, {}], [5, {}]],
  },
  calfStretch: {
    cam: { yaw: 127, pitch: 9, dist: 3.9, target: [0, 0.9, 0.1] }, focus: ['calf', 'right'], props: [['wall', 0, 0.74, 180]],
    base: { root: { p: [0, 0.83, -0.02], r: [10, 0, 0] }, neck: [-8, 0, 0], handL: [0, 0, 0], handR: [0, 0, 0],
      ik: { footL: [0.1, 0.08, 0.3], footR: [-0.1, 0.08, -0.36], handL: [0.2, 1.3, 0.65], handR: [-0.2, 1.3, 0.65] }, flat: { footL: 0, footR: 0 } },
    keys: [[0, {}], [1.5, { root: { p: [0, 0.81, 0.08], r: [14, 0, 0] } }], [3.8, { root: { p: [0, 0.808, 0.085], r: [14, 0, 0] } }], [5.1, {}], [5.6, {}]],
  },
  calfRaise: {
    cam: { yaw: 66, pitch: 6, dist: 3.9, target: [0, 0.93, 0.15] }, focus: ['calf'], props: [['chair', 0, 0.62, 0]],
    base: { ik: { ...FEET, handL: [0.16, 0.99, 0.4], handR: [-0.16, 0.99, 0.4] } },
    keys: [[0, {}], [1, { root: { p: [0, HIP_Y + 0.052, 0.05], r: [0, 0, 0] }, footL: [32, 0, 0], footR: [32, 0, 0], ik: { footL: [0.09, 0.134, 0.05], footR: [-0.09, 0.134, 0.05] } }],
      [1.9, { root: { p: [0, HIP_Y + 0.052, 0.05], r: [0, 0, 0] }, footL: [32, 0, 0], footR: [32, 0, 0], ik: { footL: [0.09, 0.134, 0.05], footR: [-0.09, 0.134, 0.05] } }], [3.4, {}], [3.9, {}]],
  },
  anklePumps: {
    cam: { yaw: 64, pitch: 8, dist: 2.2, target: [0.05, 0.36, 0.42] }, focus: ['ankle'], props: [['chair', 0, -0.04]],
    base: { root: SEAT, ...SIT_LEGS, legL: [-80, 0, 2], shinL: [28, 0, 0], armL: [8, 0, 10], foreL: [-12, 0, 0], armR: [8, 0, -10], foreR: [-12, 0, 0] },
    keys: [[0, { footL: [-22, 0, 0] }], [1, { footL: [38, 0, 0] }], [1.5, { footL: [38, 0, 0] }], [2.5, { footL: [-22, 0, 0] }], [3, { footL: [-22, 0, 0] }]],
  },
  ankleCircles: {
    cam: { yaw: 40, pitch: 10, dist: 2.2, target: [0.05, 0.36, 0.42] }, focus: ['ankle'], linear: true, props: [['chair', 0, -0.04]],
    base: { root: SEAT, ...SIT_LEGS, legL: [-80, 0, 2], shinL: [28, 0, 0], armL: [8, 0, 10], foreL: [-12, 0, 0], armR: [8, 0, -10], foreR: [-12, 0, 0] },
    keys: [[0, { footL: [-18, 0, 0] }], [0.8, { footL: [8, 24, 0] }], [1.6, { footL: [34, 0, 0] }], [2.4, { footL: [8, -24, 0] }], [3.2, { footL: [-18, 0, 0] }]],
  },
  wristExt: {
    cam: { yaw: 56, pitch: 6, dist: 2.2, target: [0.02, 1.32, 0.25] }, focus: ['elbow'],
    base: {},
    keys: [[0, { ik: { handR: [-0.34, 0.93, 0.16] } }], [1.3, { armL: [-84, 0, -18], foreL: [0, -90, 0], handL: [0, 0, -30], ik: { handR: [-0.06, 1.33, 0.5] } }],
      [2, { armL: [-84, 0, -18], foreL: [0, -90, 0], handL: [0, 0, -72], ik: { handR: [-0.05, 1.3, 0.5] } }], [4.4, { armL: [-84, 0, -18], foreL: [0, -90, 0], handL: [0, 0, -72], ik: { handR: [-0.05, 1.3, 0.5] } }],
      [5.6, { ik: { handR: [-0.34, 0.93, 0.16] } }], [6.1, { ik: { handR: [-0.34, 0.93, 0.16] } }]],
  },
  wristFlex: {
    cam: { yaw: 56, pitch: 6, dist: 2.2, target: [0.02, 1.32, 0.25] }, focus: ['wrist'],
    base: {},
    keys: [[0, { ik: { handR: [-0.34, 0.93, 0.16] } }], [1.3, { armL: [-84, 0, -18], foreL: [0, 90, 0], handL: [0, 0, 30], ik: { handR: [-0.06, 1.33, 0.5] } }],
      [2, { armL: [-84, 0, -18], foreL: [0, 90, 0], handL: [0, 0, 72], ik: { handR: [-0.05, 1.3, 0.5] } }], [4.4, { armL: [-84, 0, -18], foreL: [0, 90, 0], handL: [0, 0, 72], ik: { handR: [-0.05, 1.3, 0.5] } }],
      [5.6, { ik: { handR: [-0.34, 0.93, 0.16] } }], [6.1, { ik: { handR: [-0.34, 0.93, 0.16] } }]],
  },
  forearmRotation: {
    cam: { yaw: 46, pitch: 10, dist: 2.1, target: [0.08, 1.27, 0.14] }, focus: ['elbow'],
    base: { armL: [0, 0, 5], foreL: [-90, 0, 0] },
    keys: [[0, {}], [1.2, { foreL: [-90, 85, 0] }], [2, { foreL: [-90, 85, 0] }], [3.2, {}], [4.4, { foreL: [-90, -85, 0] }], [5.2, { foreL: [-90, -85, 0] }], [6.4, {}]],
  },
  wristBends: {
    cam: { yaw: 50, pitch: 8, dist: 2.45, target: [0, 1.28, 0.18] }, focus: ['wrist'],
    base: { armL: [0, 0, 5], foreL: [-90, -90, 0], armR: [0, 0, -5], foreR: [-90, 90, 0] },
    keys: [[0, {}], [1, { handL: [0, 0, 55], handR: [0, 0, -55] }], [1.6, { handL: [0, 0, 55], handR: [0, 0, -55] }], [2.8, { handL: [0, 0, -60], handR: [0, 0, 60] }], [3.4, { handL: [0, 0, -60], handR: [0, 0, 60] }], [4.4, {}]],
  },
};

// compile: fill in every joint, merge the base pose into each key, close the loop
for (const id in MOVES) {
  const m = MOVES[id]; m.id = id;
  const base = fullPose(m.base || {});
  // a key that pins a limb must pin it in every key, so collect the pinned limbs first
  const firstIk = {};
  for (const [, p] of m.keys) if (p.ik) for (const k in p.ik) if (!firstIk[k]) firstIk[k] = p.ik[k];
  if (Object.keys(firstIk).length) base.ik = { ...firstIk, ...(base.ik || {}) };
  m.k = m.keys.map(([t, p]) => [t, mergePose(base, p)]);
  m.dur = m.k[m.k.length - 1][0];
}

const ease = (t) => t * t * (3 - 2 * t);
const scratch = {};
export function poseAt(m, time) {
  const t = ((time % m.dur) + m.dur) % m.dur, k = m.k;
  let i = 0; while (i < k.length - 2 && t >= k[i + 1][0]) i++;
  const a = k[i], b = k[i + 1], f = Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0] || 1)));
  return lerpPose(a[1], b[1], m.linear ? f : ease(f), scratch[m.id] || (scratch[m.id] = {}));
}
