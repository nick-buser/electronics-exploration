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
  /** Time of this sample. */
  t: number;
}

interface SolverState {
  nodes: NodeMap;
  capV: Map<string, number>;
  indI: Map<string, number>;
  /** Last converged V_D for each diode — Newton starting iterate next step. */
  diodeV: Map<string, number>;
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

/* ── State management ──────────────────────────────────── */

export function initState(circuit: Circuit): SolverState {
  const nodes = buildNodeMap(circuit);
  const capV = new Map<string, number>();
  const indI = new Map<string, number>();
  const diodeV = new Map<string, number>();
  for (const e of circuit.elements) {
    if (e.kind === "C") capV.set(e.id, e.ic ?? 0);
    if (e.kind === "L") indI.set(e.id, e.ic ?? 0);
    if (e.kind === "D") diodeV.set(e.id, e.ic ?? 0);
  }
  return { nodes, capV, indI, diodeV };
}

/** Copy this step's cap/inductor/diode state forward as next-step ICs. */
export function advance(state: SolverState, step: StepResult): void {
  for (const [id, vc] of Object.entries(step.vc)) state.capV.set(id, vc);
  for (const [id, il] of Object.entries(step.il)) state.indI.set(id, il);
  for (const [id, vd] of Object.entries(step.vd)) state.diodeV.set(id, vd);
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
  const maxIter = newton?.maxIter ?? 50;
  const tolRel = newton?.tolRel ?? 1e-3;
  const tolAbs = newton?.tolAbs ?? 1e-6;

  // Per-diode Newton iterate. Seeded from state (previous step's V_D, or IC).
  const diodeIter = new Map<string, number>();
  for (const d of diodes) diodeIter.set(d.id, state.diodeV.get(d.id) ?? 0);

  let result: StepResult | null = null;
  let iters = 0;
  while (iters < maxIter) {
    result = solveOneIteration(circuit, state, t, dt, diodeIter);
    iters++;

    if (diodes.length === 0) break;

    // Update each diode's iterate from this solve's V_a − V_b, applying
    // pn-junction limiting. Track convergence per diode against the
    // pre-update value.
    let converged = true;
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
    if (converged) break;
  }
  if (!result) throw new Error("solveStep: empty solve loop at t=" + t);
  if (iters >= maxIter && diodes.length > 0) {
    throw new Error(`solveStep: Newton did not converge within ${maxIter} iters at t=${t}`);
  }

  // Recompute final diode currents from the converged V_D iterate so they
  // match what the companion stamp used on the last successful pass.
  for (const d of diodes) {
    const { Is, vtN } = diodeParams(d);
    const vd = diodeIter.get(d.id) ?? 0;
    const { Id } = diodeCompanion(vd, Is, vtN);
    result.vd[d.id] = vd;
    result.id[d.id] = Id;
  }

  return result;
}

function solveOneIteration(
  circuit: Circuit,
  state: SolverState,
  t: number,
  dt: number,
  diodeIter: Map<string, number>,
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

  // Op-amps
  opamps.forEach((e, k) => {
    if (e.kind !== "OP") return;
    const row = internalN + nSrc + nInd + k;
    const iVout = state.nodes.index.get(e.vout) ?? 0;
    const iVp = state.nodes.index.get(e.vplus) ?? 0;
    const iVm = state.nodes.index.get(e.vminus) ?? 0;
    if (iVout > 0) A[iVout - 1][row] += 1;
    if (iVp > 0) A[row][iVp - 1] += 1;
    if (iVm > 0) A[row][iVm - 1] += -1;
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
  opamps.forEach((e, k) => {
    iop[e.id] = x[internalN + nSrc + nInd + k];
  });
  // Diode voltages from current iteration's solve; currents are filled in
  // by the caller after Newton converges (recomputed from the final V_D so
  // they match the companion's last linearization exactly).
  const vd: Record<string, number> = {};
  const id: Record<string, number> = {};
  for (const e of circuit.elements) {
    if (e.kind === "D") {
      vd[e.id] = v[e.a] - v[e.b];
      id[e.id] = 0;
    }
  }

  return { v, i, vc, il, iop, vd, id, t };
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
