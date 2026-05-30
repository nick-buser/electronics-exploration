/**
 * Modified Nodal Analysis for RLC + V-sources + ideal op-amps + diodes.
 *
 * Unknowns:
 *   [V(node 1) ... V(node N-1),
 *    I(Vsource_1) ... I(Vsource_M),
 *    I(L_1) ... I(L_K),
 *    I(OP_1) ... I(OP_P)]
 *
 * Ground is node 0; its row/col is dropped from the matrix.
 *
 * Companion models:
 *   - Capacitor (implicit-Euler, Norton form): G_eq = C/dt in parallel with
 *     I_eq = G_eq · V_C(t-dt) flowing b → a.
 *   - Inductor (implicit-Euler, branch-current form):
 *     V_a - V_b - (L/dt) · I_L = -(L/dt) · I_L(t-dt). At dt = Infinity this
 *     collapses to V_a = V_b (short), with I_L determined externally.
 *   - Diode (Newton-Raphson companion): at each Newton iteration, replace
 *     the nonlinear I_D = Is·(exp(V_D/(N·Vt)) − 1) with its tangent line at
 *     the current iterate V_D_k: I_D ≈ G_eq · V_D + I_eq where
 *     G_eq = ∂I_D/∂V_D and I_eq = I_D(V_D_k) − G_eq · V_D_k. Stamp G_eq as
 *     a conductance and I_eq as a current source flowing a → b.
 *
 * If any diodes are present, solveStep loops the linear solve, refreshing
 * the diode companion stamps with the new iterate's V_D each pass, until
 * V_D stops changing within tolerance. Pure-linear circuits converge after
 * a single iteration (the tangent line is exact).
 */
import { evalWave, type Circuit, type Element, type NodeMap, buildNodeMap } from "./circuit";
import { solveLinear, zeros } from "./linalg";

export interface StepResult {
  /** Voltage at each node, indexed by name. Ground is always 0. */
  v: Record<string, number>;
  /** Current through each independent V-source (positive = a → b internally). */
  i: Record<string, number>;
  /** Voltage across each capacitor at this step (V_a − V_b). */
  vc: Record<string, number>;
  /** Current through each inductor (positive = a → b internally). */
  il: Record<string, number>;
  /** Current at each op-amp's output pin. Follows the V-source convention:
   *  positive = current flowing INTO the output externally (op-amp sinking).
   *  An op-amp sourcing current to a load reports a negative value. */
  iop: Record<string, number>;
  /** Voltage across each diode at this step (V_anode − V_cathode). */
  vd: Record<string, number>;
  /** Current through each diode (positive = forward, a → b). */
  id: Record<string, number>;
  /** Per-BJT junction voltages V_BE and V_BC (signed, NPN convention). */
  vbe: Record<string, number>;
  vbc: Record<string, number>;
  /** Per-BJT terminal currents into the device (NPN: I_C > 0 in active). */
  ic: Record<string, number>;
  ib: Record<string, number>;
  ie: Record<string, number>;
  /** Per-MOSFET control voltages and drain current (signed, NMOS convention). */
  vgs: Record<string, number>;
  vds: Record<string, number>;
  idmos: Record<string, number>;
  /** Per-op-amp output node voltage. Used by the next transient step's
   *  finite-GBW integrator and exposed to callers for convenience. */
  vop: Record<string, number>;
  /** Time of this sample. */
  t: number;
}

interface SolverState {
  nodes: NodeMap;
  capV: Map<string, number>;
  indI: Map<string, number>;
  /** Last converged V_D for each diode — Newton starting iterate next step. */
  diodeV: Map<string, number>;
  /** Last converged V_BE / V_BC for each BJT (effective NPN convention). */
  bjtVbe: Map<string, number>;
  bjtVbc: Map<string, number>;
  /** Last converged V_GS / V_DS for each MOSFET (effective NMOS convention). */
  mosVgs: Map<string, number>;
  mosVds: Map<string, number>;
  /** Last V_out for each op-amp (only used by finite-GBW op-amps for the
   *  implicit-Euler integrator on the dominant-pole transfer function). */
  opVout: Map<string, number>;
}

export interface NewtonOptions {
  /** Hard cap on Newton iterations per timestep. */
  maxIter?: number;
  /** Relative tolerance for V_D convergence (default 1e-3). */
  tolRel?: number;
  /** Absolute tolerance (volts) for V_D convergence (default 1e-6). */
  tolAbs?: number;
}

/* ── Diode model (Shockley) ─────────────────────────────── */

const DIODE_DEFAULTS = {
  /** Saturation current (A). 1N4148-ish. */
  Is: 4e-9,
  /** Thermal voltage (V) at ~300 K. */
  Vt: 0.025852,
  /** Emission coefficient. */
  N: 1.906,
};

function diodeParams(e: Extract<Element, { kind: "D" }>) {
  const Is = e.Is ?? DIODE_DEFAULTS.Is;
  const Vt = e.Vt ?? DIODE_DEFAULTS.Vt;
  const N = e.N ?? DIODE_DEFAULTS.N;
  return { Is, Vt, N, vtN: N * Vt };
}

/** Tangent-line companion: I_D ≈ G_eq · V_D + I_eq. */
function diodeCompanion(vd: number, Is: number, vtN: number) {
  // Clamp the exponential argument so a divergent Newton step can't blow up
  // before the limiter kicks in. 30 → e^30 ≈ 1e13 — well within double range,
  // well past any operating point we actually care about.
  const arg = Math.min(vd / vtN, 30);
  const e = Math.exp(arg);
  const Id = Is * (e - 1);
  const Geq = (Is / vtN) * e;
  const Ieq = Id - Geq * vd;
  return { Geq, Ieq, Id };
}

/** SPICE-style PN-junction step limiter — prevents Newton from launching
 *  V_D into the exponential's overflow region on a runaway iteration. */
function pnLimit(vNew: number, vOld: number, vtN: number, vcrit: number): number {
  if (vNew > vcrit && Math.abs(vNew - vOld) > 2 * vtN) {
    if (vOld > 0) {
      const arg = 1 + (vNew - vOld) / vtN;
      if (arg > 0) return vOld + vtN * Math.log(arg);
    }
    return vcrit;
  }
  return vNew;
}

/* ── BJT model (Ebers–Moll injection form) ─────────────── */

const BJT_DEFAULTS = {
  Is: 1e-14, // 2N3904-ish
  Vt: 0.025852,
  betaF: 200,
  betaR: 4,
};

function bjtParams(e: Extract<Element, { kind: "Q" }>) {
  const Is = e.Is ?? BJT_DEFAULTS.Is;
  const Vt = e.Vt ?? BJT_DEFAULTS.Vt;
  const betaF = e.betaF ?? BJT_DEFAULTS.betaF;
  const betaR = e.betaR ?? BJT_DEFAULTS.betaR;
  const alphaF = betaF / (betaF + 1);
  const alphaR = betaR / (betaR + 1);
  return { Is, Vt, betaF, betaR, alphaF, alphaR };
}

/** Companion of an NPN-form BJT at the iterate (vbe, vbc). Returns the
 *  terminal currents (NPN convention: positive INTO terminal) and the
 *  partial derivatives w.r.t. V_BE and V_BC. PNP devices wrap this with
 *  a sign flip on both the iterate and the resulting currents. */
function bjtCompanion(
  vbe: number,
  vbc: number,
  p: ReturnType<typeof bjtParams>,
) {
  const eBE = Math.exp(Math.min(vbe / p.Vt, 30));
  const eBC = Math.exp(Math.min(vbc / p.Vt, 30));
  const IF = (p.Is / p.alphaF) * (eBE - 1);
  const IR = (p.Is / p.alphaR) * (eBC - 1);
  const G_F = (p.Is / p.alphaF / p.Vt) * eBE;
  const G_R = (p.Is / p.alphaR / p.Vt) * eBC;

  // Terminal currents (NPN, into device)
  const I_C = p.alphaF * IF - IR;
  const I_B = (1 - p.alphaF) * IF + (1 - p.alphaR) * IR;
  const I_E = -IF + p.alphaR * IR;

  // Partials w.r.t. V_BE and V_BC (NPN form)
  const dIC_dVBE = p.alphaF * G_F;
  const dIC_dVBC = -G_R;
  const dIB_dVBE = (1 - p.alphaF) * G_F;
  const dIB_dVBC = (1 - p.alphaR) * G_R;
  const dIE_dVBE = -G_F;
  const dIE_dVBC = p.alphaR * G_R;

  return {
    I_C,
    I_B,
    I_E,
    dIC_dVBE,
    dIC_dVBC,
    dIB_dVBE,
    dIB_dVBC,
    dIE_dVBE,
    dIE_dVBC,
  };
}

/* ── MOSFET model (Shichman–Hodges, Level 1) ───────────── */

const MOS_DEFAULTS = {
  /** Transconductance K = µ·Cox·(W/L). 2N7000-ish. */
  K: 0.05, // A/V²
  Vth: 1.5,
};

/** Small fixed drain–source conductance (SPICE's GMIN). Keeps the matrix
 *  non-singular when the channel is fully cut off. */
const MOS_GMIN = 1e-12;

function mosParams(e: Extract<Element, { kind: "M" }>) {
  const K = e.K ?? MOS_DEFAULTS.K;
  const Vth = e.Vth ?? MOS_DEFAULTS.Vth;
  return { K, Vth };
}

/** NMOS-form companion at (vgs, vds). Returns I_D (into drain) and the
 *  partials w.r.t. V_GS and V_DS. */
function mosCompanion(vgs: number, vds: number, p: ReturnType<typeof mosParams>) {
  const vov = vgs - p.Vth; // overdrive
  let I_D: number;
  let gm: number;
  let gds: number;
  if (vov <= 0) {
    // Cutoff
    I_D = 0;
    gm = 0;
    gds = 0;
  } else if (vds < vov) {
    // Triode
    I_D = p.K * (vov * vds - 0.5 * vds * vds);
    gm = p.K * vds;
    gds = p.K * (vov - vds);
  } else {
    // Saturation
    I_D = 0.5 * p.K * vov * vov;
    gm = p.K * vov;
    gds = 0;
  }
  return { I_D, gm, gds };
}

/* ── State management ──────────────────────────────────── */

export function initState(circuit: Circuit): SolverState {
  const nodes = buildNodeMap(circuit);
  const capV = new Map<string, number>();
  const indI = new Map<string, number>();
  const diodeV = new Map<string, number>();
  const bjtVbe = new Map<string, number>();
  const bjtVbc = new Map<string, number>();
  const mosVgs = new Map<string, number>();
  const mosVds = new Map<string, number>();
  const opVout = new Map<string, number>();
  for (const e of circuit.elements) {
    if (e.kind === "C") capV.set(e.id, e.ic ?? 0);
    if (e.kind === "L") indI.set(e.id, e.ic ?? 0);
    if (e.kind === "D") diodeV.set(e.id, e.ic ?? 0);
    if (e.kind === "Q") {
      bjtVbe.set(e.id, 0);
      bjtVbc.set(e.id, 0);
    }
    if (e.kind === "M") {
      mosVgs.set(e.id, 0);
      mosVds.set(e.id, 0);
    }
    if (e.kind === "OP") opVout.set(e.id, 0);
  }
  return { nodes, capV, indI, diodeV, bjtVbe, bjtVbc, mosVgs, mosVds, opVout };
}

/** Copy this step's reactive + nonlinear state forward as next-step ICs. */
export function advance(state: SolverState, step: StepResult): void {
  for (const [id, vc] of Object.entries(step.vc)) state.capV.set(id, vc);
  for (const [id, il] of Object.entries(step.il)) state.indI.set(id, il);
  for (const [id, vd] of Object.entries(step.vd)) state.diodeV.set(id, vd);
  for (const [id, vbe] of Object.entries(step.vbe)) state.bjtVbe.set(id, vbe);
  for (const [id, vbc] of Object.entries(step.vbc)) state.bjtVbc.set(id, vbc);
  for (const [id, vgs] of Object.entries(step.vgs)) state.mosVgs.set(id, vgs);
  for (const [id, vds] of Object.entries(step.vds)) state.mosVds.set(id, vds);
  // Op-amp V_out — only matters for finite-GBW ops (the integrator pole),
  // but cheap to copy unconditionally.
  for (const [id, vop] of Object.entries(step.vop)) state.opVout.set(id, vop);
}

/* ── Solve ─────────────────────────────────────────────── */

/** Solve one timestep. Pass dt = Infinity (or omit) for the pure-DC operating point. */
export function solveStep(
  circuit: Circuit,
  state: SolverState,
  t: number,
  dt: number = Infinity,
  newton?: NewtonOptions,
): StepResult {
  const diodes = circuit.elements.filter(
    (e): e is Extract<Element, { kind: "D" }> => e.kind === "D",
  );
  const bjts = circuit.elements.filter(
    (e): e is Extract<Element, { kind: "Q" }> => e.kind === "Q",
  );
  const mosfets = circuit.elements.filter(
    (e): e is Extract<Element, { kind: "M" }> => e.kind === "M",
  );
  const nonlinear = diodes.length + bjts.length + mosfets.length;
  const maxIter = newton?.maxIter ?? 50;
  const tolRel = newton?.tolRel ?? 1e-3;
  const tolAbs = newton?.tolAbs ?? 1e-6;

  // Per-element Newton iterates. Seeded from state (warm-start from last step).
  const diodeIter = new Map<string, number>();
  for (const d of diodes) diodeIter.set(d.id, state.diodeV.get(d.id) ?? 0);
  const bjtVbeIter = new Map<string, number>();
  const bjtVbcIter = new Map<string, number>();
  for (const q of bjts) {
    bjtVbeIter.set(q.id, state.bjtVbe.get(q.id) ?? 0);
    bjtVbcIter.set(q.id, state.bjtVbc.get(q.id) ?? 0);
  }
  const mosVgsIter = new Map<string, number>();
  const mosVdsIter = new Map<string, number>();
  for (const m of mosfets) {
    mosVgsIter.set(m.id, state.mosVgs.get(m.id) ?? 0);
    mosVdsIter.set(m.id, state.mosVds.get(m.id) ?? 0);
  }

  let result: StepResult | null = null;
  let iters = 0;
  while (iters < maxIter) {
    result = solveOneIteration(circuit, state, t, dt, diodeIter, bjtVbeIter, bjtVbcIter, mosVgsIter, mosVdsIter);
    iters++;

    if (nonlinear === 0) break;

    let converged = true;

    // Diodes
    for (const d of diodes) {
      const { Is, vtN } = diodeParams(d);
      const vcrit = vtN * Math.log(vtN / (Math.SQRT2 * Is));
      const vOld = diodeIter.get(d.id) ?? 0;
      const vRaw = result.vd[d.id] ?? 0;
      const vNew = pnLimit(vRaw, vOld, vtN, vcrit);
      const tol = tolRel * Math.max(Math.abs(vOld), Math.abs(vNew)) + tolAbs;
      if (Math.abs(vNew - vOld) > tol) converged = false;
      diodeIter.set(d.id, vNew);
    }

    // BJTs — limit both junctions
    for (const q of bjts) {
      const p = bjtParams(q);
      const vcrit = p.Vt * Math.log(p.Vt / (Math.SQRT2 * p.Is));
      const s = q.polarity === "npn" ? 1 : -1;
      const vbeOld = bjtVbeIter.get(q.id) ?? 0;
      const vbcOld = bjtVbcIter.get(q.id) ?? 0;
      // The solver reports vbe / vbc in *effective NPN convention* — see
      // solveOneIteration. We limit there too.
      const vbeRaw = result.vbe[q.id] ?? 0;
      const vbcRaw = result.vbc[q.id] ?? 0;
      const vbeNew = pnLimit(vbeRaw, vbeOld, p.Vt, vcrit);
      const vbcNew = pnLimit(vbcRaw, vbcOld, p.Vt, vcrit);
      const tolBe = tolRel * Math.max(Math.abs(vbeOld), Math.abs(vbeNew)) + tolAbs;
      const tolBc = tolRel * Math.max(Math.abs(vbcOld), Math.abs(vbcNew)) + tolAbs;
      if (Math.abs(vbeNew - vbeOld) > tolBe) converged = false;
      if (Math.abs(vbcNew - vbcOld) > tolBc) converged = false;
      bjtVbeIter.set(q.id, vbeNew);
      bjtVbcIter.set(q.id, vbcNew);
      void s; // polarity flip happens inside solveOneIteration via the stored iterate
    }

    // MOSFETs — no exponentials, no pnLimit needed
    for (const m of mosfets) {
      const vgsOld = mosVgsIter.get(m.id) ?? 0;
      const vdsOld = mosVdsIter.get(m.id) ?? 0;
      const vgsNew = result.vgs[m.id] ?? 0;
      const vdsNew = result.vds[m.id] ?? 0;
      const tolGs = tolRel * Math.max(Math.abs(vgsOld), Math.abs(vgsNew)) + tolAbs;
      const tolDs = tolRel * Math.max(Math.abs(vdsOld), Math.abs(vdsNew)) + tolAbs;
      if (Math.abs(vgsNew - vgsOld) > tolGs) converged = false;
      if (Math.abs(vdsNew - vdsOld) > tolDs) converged = false;
      mosVgsIter.set(m.id, vgsNew);
      mosVdsIter.set(m.id, vdsNew);
    }

    if (converged) break;
  }
  if (!result) throw new Error("solveStep: empty solve loop at t=" + t);
  if (iters >= maxIter && nonlinear > 0) {
    throw new Error(`solveStep: Newton did not converge within ${maxIter} iters at t=${t}`);
  }

  // Recompute final element currents from the converged iterates so they
  // match what the companion stamp used on the last successful pass.
  for (const d of diodes) {
    const { Is, vtN } = diodeParams(d);
    const vd = diodeIter.get(d.id) ?? 0;
    const { Id } = diodeCompanion(vd, Is, vtN);
    result.vd[d.id] = vd;
    result.id[d.id] = Id;
  }
  for (const q of bjts) {
    const p = bjtParams(q);
    const s = q.polarity === "npn" ? 1 : -1;
    const vbeEff = bjtVbeIter.get(q.id) ?? 0;
    const vbcEff = bjtVbcIter.get(q.id) ?? 0;
    const { I_C, I_B, I_E } = bjtCompanion(vbeEff, vbcEff, p);
    // Report in *actual device* convention: flip back for PNP.
    result.vbe[q.id] = s * vbeEff;
    result.vbc[q.id] = s * vbcEff;
    result.ic[q.id] = s * I_C;
    result.ib[q.id] = s * I_B;
    result.ie[q.id] = s * I_E;
  }
  for (const m of mosfets) {
    const p = mosParams(m);
    const s = m.polarity === "nmos" ? 1 : -1;
    const vgsEff = mosVgsIter.get(m.id) ?? 0;
    const vdsEff = mosVdsIter.get(m.id) ?? 0;
    const { I_D } = mosCompanion(vgsEff, vdsEff, p);
    result.vgs[m.id] = s * vgsEff;
    result.vds[m.id] = s * vdsEff;
    result.idmos[m.id] = s * I_D;
  }

  return result;
}

function solveOneIteration(
  circuit: Circuit,
  state: SolverState,
  t: number,
  dt: number,
  diodeIter: Map<string, number>,
  bjtVbeIter: Map<string, number>,
  bjtVbcIter: Map<string, number>,
  mosVgsIter: Map<string, number>,
  mosVdsIter: Map<string, number>,
): StepResult {
  const nNodes = state.nodes.names.length;
  const internalN = nNodes - 1;

  const sources: Element[] = circuit.elements.filter((e) => e.kind === "V");
  const inductors: Element[] = circuit.elements.filter((e) => e.kind === "L");
  const opamps: Element[] = circuit.elements.filter((e) => e.kind === "OP");
  const nSrc = sources.length;
  const nInd = inductors.length;
  const dim = internalN + nSrc + nInd + opamps.length;

  const A = zeros(dim, dim);
  const z = new Array<number>(dim).fill(0);

  // R + C companions
  for (const e of circuit.elements) {
    if (e.kind === "R" || e.kind === "C") {
      let G: number;
      if (e.kind === "R") {
        G = 1 / e.value;
      } else {
        if (!isFinite(dt)) continue; // open cap at DC
        G = e.value / dt;
      }
      stampConductance(A, state.nodes, e.a, e.b, G);
      if (e.kind === "C" && isFinite(dt)) {
        const vcPrev = state.capV.get(e.id) ?? 0;
        const Ieq = (e.value / dt) * vcPrev;
        stampCurrent(z, state.nodes, e.a, e.b, Ieq);
      }
    }
  }

  // V sources
  sources.forEach((e, k) => {
    if (e.kind !== "V") return;
    const row = internalN + k;
    const ia = state.nodes.index.get(e.a) ?? 0;
    const ib = state.nodes.index.get(e.b) ?? 0;
    if (ia > 0) {
      A[ia - 1][row] += 1;
      A[row][ia - 1] += 1;
    }
    if (ib > 0) {
      A[ib - 1][row] += -1;
      A[row][ib - 1] += -1;
    }
    z[row] = evalWave(e.wave, t);
  });

  // Inductors
  inductors.forEach((e, k) => {
    if (e.kind !== "L") return;
    const row = internalN + nSrc + k;
    const ia = state.nodes.index.get(e.a) ?? 0;
    const ib = state.nodes.index.get(e.b) ?? 0;
    if (ia > 0) {
      A[ia - 1][row] += 1;
      A[row][ia - 1] += 1;
    }
    if (ib > 0) {
      A[ib - 1][row] += -1;
      A[row][ib - 1] += -1;
    }
    if (isFinite(dt)) {
      const Req = e.value / dt;
      const iPrev = state.indI.get(e.id) ?? 0;
      A[row][row] += -Req;
      z[row] = -Req * iPrev;
    }
  });

  // Op-amps. Ideal model uses V+ = V-; finite-GBW uses the dominant-pole
  // model A(s) = A0 / (1 + s/ωp) where ωp = 2π·GBW/A0. For implicit Euler:
  //   V_out·(1 + τ/dt) - A0·V+ + A0·V- = (τ/dt)·V_out(t-dt)
  // where τ = 1/ωp. At DC (dt → ∞), τ/dt → 0 and this becomes
  //   V_out - A0·V+ + A0·V- = 0
  opamps.forEach((e, k) => {
    if (e.kind !== "OP") return;
    const row = internalN + nSrc + nInd + k;
    const iVout = state.nodes.index.get(e.vout) ?? 0;
    const iVp = state.nodes.index.get(e.vplus) ?? 0;
    const iVm = state.nodes.index.get(e.vminus) ?? 0;
    if (iVout > 0) A[iVout - 1][row] += 1;
    if (e.A0 != null && e.GBW != null) {
      const A0 = e.A0;
      const tau = A0 / (2 * Math.PI * e.GBW);
      const G = isFinite(dt) ? tau / dt : 0; // 0 collapses to DC: V_out = A0·(V+ - V-)
      if (iVout > 0) A[row][iVout - 1] += 1 + G;
      if (iVp > 0) A[row][iVp - 1] += -A0;
      if (iVm > 0) A[row][iVm - 1] += A0;
      if (isFinite(dt)) {
        const vOutPrev = state.opVout.get(e.id) ?? 0;
        z[row] += G * vOutPrev;
      }
    } else {
      if (iVp > 0) A[row][iVp - 1] += 1;
      if (iVm > 0) A[row][iVm - 1] += -1;
    }
  });

  // Diode companions (Newton)
  for (const e of circuit.elements) {
    if (e.kind !== "D") continue;
    const { Is, vtN } = diodeParams(e);
    const vd = diodeIter.get(e.id) ?? 0;
    const { Geq, Ieq } = diodeCompanion(vd, Is, vtN);
    stampConductance(A, state.nodes, e.a, e.b, Geq);
    // I_eq flows a → b in the linearized model (same direction as positive
    // forward current). That's an outflow at a and inflow at b — same sign
    // convention as stampCurrent's caller for the cap companion.
    stampCurrent(z, state.nodes, e.b, e.a, Ieq);
  }

  // BJT companions (Newton). For PNP, the iterates and resulting currents
  // are flipped via `s`. The Jacobians are sign-invariant since s² = 1, so
  // we stamp the admittance block with NPN derivatives and only flip the
  // constant RHS offset for PNP.
  for (const e of circuit.elements) {
    if (e.kind !== "Q") continue;
    const p = bjtParams(e);
    const s = e.polarity === "npn" ? 1 : -1;
    const vbe = bjtVbeIter.get(e.id) ?? 0;
    const vbc = bjtVbcIter.get(e.id) ?? 0;
    const comp = bjtCompanion(vbe, vbc, p);
    stampBjtTerminal(A, z, state.nodes, e.c, e.b, e.c, e.e, comp.I_C, comp.dIC_dVBE, comp.dIC_dVBC, vbe, vbc, s);
    stampBjtTerminal(A, z, state.nodes, e.b, e.b, e.c, e.e, comp.I_B, comp.dIB_dVBE, comp.dIB_dVBC, vbe, vbc, s);
    stampBjtTerminal(A, z, state.nodes, e.e, e.b, e.c, e.e, comp.I_E, comp.dIE_dVBE, comp.dIE_dVBC, vbe, vbc, s);
  }

  // MOSFET companions (Newton). Same sign-flip dance for PMOS.
  for (const e of circuit.elements) {
    if (e.kind !== "M") continue;
    const p = mosParams(e);
    const s = e.polarity === "nmos" ? 1 : -1;
    const vgs = mosVgsIter.get(e.id) ?? 0;
    const vds = mosVdsIter.get(e.id) ?? 0;
    const { I_D, gm, gds } = mosCompanion(vgs, vds, p);
    // I_D flows INTO the drain externally (NMOS convention), so KCL at D
    // sees +I_D leaving the node toward the device. At S it sees -I_D.
    stampMosTerminal(A, z, state.nodes, e.d, e.d, e.g, e.s, I_D, gm, gds, vgs, vds, s, +1);
    stampMosTerminal(A, z, state.nodes, e.s, e.d, e.g, e.s, -I_D, -gm, -gds, vgs, vds, s, -1);
    // Always-on drain–source shunt so a fully cut-off channel doesn't
    // leave the matrix singular.
    stampConductance(A, state.nodes, e.d, e.s, MOS_GMIN);
  }

  const x = solveLinear(A, z);
  if (!x) throw new Error("solveStep: singular MNA system at t=" + t);

  const v: Record<string, number> = {};
  for (let i = 0; i < state.nodes.names.length; i++) {
    v[state.nodes.names[i]] = i === 0 ? 0 : x[i - 1];
  }
  const i: Record<string, number> = {};
  sources.forEach((e, k) => {
    i[e.id] = x[internalN + k];
  });
  const vc: Record<string, number> = {};
  for (const e of circuit.elements) {
    if (e.kind === "C") vc[e.id] = v[e.a] - v[e.b];
  }
  const il: Record<string, number> = {};
  inductors.forEach((e, k) => {
    il[e.id] = x[internalN + nSrc + k];
  });
  const iop: Record<string, number> = {};
  const vop: Record<string, number> = {};
  opamps.forEach((e, k) => {
    if (e.kind !== "OP") return;
    iop[e.id] = x[internalN + nSrc + nInd + k];
    vop[e.id] = v[e.vout] ?? 0;
  });
  // Nonlinear element voltages from current iteration's solve. Currents
  // are filled in by the caller after Newton converges, recomputed from
  // the final iterate so they match the last linearization exactly.
  const vd: Record<string, number> = {};
  const id: Record<string, number> = {};
  for (const e of circuit.elements) {
    if (e.kind === "D") {
      vd[e.id] = v[e.a] - v[e.b];
      id[e.id] = 0;
    }
  }
  const vbe: Record<string, number> = {};
  const vbc: Record<string, number> = {};
  const ic: Record<string, number> = {};
  const ib: Record<string, number> = {};
  const ie: Record<string, number> = {};
  for (const e of circuit.elements) {
    if (e.kind === "Q") {
      const s = e.polarity === "npn" ? 1 : -1;
      // Report in *effective NPN* convention so the caller can pass
      // directly into bjtCompanion / pnLimit. Final sign-flip happens
      // in solveStep after Newton converges.
      vbe[e.id] = s * (v[e.b] - v[e.e]);
      vbc[e.id] = s * (v[e.b] - v[e.c]);
      ic[e.id] = 0;
      ib[e.id] = 0;
      ie[e.id] = 0;
    }
  }
  const vgs: Record<string, number> = {};
  const vds: Record<string, number> = {};
  const idmos: Record<string, number> = {};
  for (const e of circuit.elements) {
    if (e.kind === "M") {
      const s = e.polarity === "nmos" ? 1 : -1;
      vgs[e.id] = s * (v[e.g] - v[e.s]);
      vds[e.id] = s * (v[e.d] - v[e.s]);
      idmos[e.id] = 0;
    }
  }

  return { v, i, vc, il, iop, vop, vd, id, vbe, vbc, ic, ib, ie, vgs, vds, idmos, t };
}

/** Stamp one terminal of a 3-terminal device with a single-V-pair Jacobian
 *  (BJT-style). `term` is the terminal node we're contributing to; b/c/e
 *  are the BJT's three node names; (dIdVbe, dIdVbc) are the partials in
 *  effective-NPN convention; (vbeK, vbcK) are the effective iterates; `s`
 *  is +1 for NPN, −1 for PNP.
 *
 *  Linearisation in node coords (NPN form):
 *    I_T = (dIT/dVBE + dIT/dVBC) · V_b
 *        + (- dIT/dVBC)         · V_c
 *        + (- dIT/dVBE)         · V_e
 *        + [I_T_k − dIT/dVBE · V_BE_k − dIT/dVBC · V_BC_k]
 *  For PNP the constant term picks up an `s` because the actual terminal
 *  current is `s · I_T_npn`, and the iterates are also `s` times the
 *  device V_BE / V_BC. The admittance block is sign-invariant (s² = 1).
 */
function stampBjtTerminal(
  A: number[][],
  z: number[],
  nodes: NodeMap,
  term: string,
  bNode: string,
  cNode: string,
  eNode: string,
  I_T: number,
  dIdVbe: number,
  dIdVbc: number,
  vbeK: number,
  vbcK: number,
  s: 1 | -1,
): void {
  const iT = nodes.index.get(term) ?? 0;
  if (iT === 0) return;
  const ib = nodes.index.get(bNode) ?? 0;
  const ic = nodes.index.get(cNode) ?? 0;
  const ie = nodes.index.get(eNode) ?? 0;
  if (ib > 0) A[iT - 1][ib - 1] += dIdVbe + dIdVbc;
  if (ic > 0) A[iT - 1][ic - 1] += -dIdVbc;
  if (ie > 0) A[iT - 1][ie - 1] += -dIdVbe;
  const offset = s * (I_T - dIdVbe * vbeK - dIdVbc * vbcK);
  z[iT - 1] += -offset;
}

/** Stamp one terminal of a MOSFET. `sign` is +1 for drain (KCL sees +I_D
 *  leaving toward device), −1 for source. The (I_T, gm, gds) passed in
 *  are already pre-multiplied by `sign` if needed. `s` is +1 for NMOS,
 *  −1 for PMOS; iterates are stored in effective-NMOS form. */
function stampMosTerminal(
  A: number[][],
  z: number[],
  nodes: NodeMap,
  term: string,
  dNode: string,
  gNode: string,
  sNode: string,
  I_T: number,
  gm: number,
  gds: number,
  vgsK: number,
  vdsK: number,
  s: 1 | -1,
  _sign: 1 | -1,
): void {
  const iT = nodes.index.get(term) ?? 0;
  if (iT === 0) return;
  const iD = nodes.index.get(dNode) ?? 0;
  const iG = nodes.index.get(gNode) ?? 0;
  const iS = nodes.index.get(sNode) ?? 0;
  // d/dV_G = +gm, d/dV_D = +gds, d/dV_S = -(gm + gds)
  if (iG > 0) A[iT - 1][iG - 1] += gm;
  if (iD > 0) A[iT - 1][iD - 1] += gds;
  if (iS > 0) A[iT - 1][iS - 1] += -(gm + gds);
  const offset = s * (I_T - gm * vgsK - gds * vdsK);
  z[iT - 1] += -offset;
}

function stampConductance(
  A: number[][],
  nodes: NodeMap,
  a: string,
  b: string,
  G: number,
): void {
  const ia = nodes.index.get(a) ?? 0;
  const ib = nodes.index.get(b) ?? 0;
  if (ia > 0) A[ia - 1][ia - 1] += G;
  if (ib > 0) A[ib - 1][ib - 1] += G;
  if (ia > 0 && ib > 0) {
    A[ia - 1][ib - 1] -= G;
    A[ib - 1][ia - 1] -= G;
  }
}

function stampCurrent(z: number[], nodes: NodeMap, a: string, b: string, I: number): void {
  const ia = nodes.index.get(a) ?? 0;
  const ib = nodes.index.get(b) ?? 0;
  if (ia > 0) z[ia - 1] += I;
  if (ib > 0) z[ib - 1] -= I;
}
