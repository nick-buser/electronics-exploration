/**
 * Modified Nodal Analysis for linear RLC + independent V-sources.
 *
 * Unknowns:
 *   [V(node 1) ... V(node N-1),
 *    I(Vsource_1) ... I(Vsource_M),
 *    I(L_1) ... I(L_K)]
 *
 * Ground is node 0; its row/col is dropped from the matrix.
 *
 * Capacitors are stamped via the implicit-Euler companion model in Norton
 * form: G_eq = C/dt in parallel with an equivalent current source
 * I_eq = G_eq · V_C(t-dt) flowing b → a.
 *
 * Inductors are stamped via the implicit-Euler companion model in branch-
 * current form: V_a - V_b = (L/dt) · I_L - (L/dt) · I_L(t-dt). At DC
 * (dt = Infinity) this collapses to V_a = V_b, i.e. a wire.
 */
import { evalWave, type Circuit, type Element, type NodeMap, buildNodeMap } from "./circuit";
import { solveLinear, zeros } from "./linalg";

export interface StepResult {
  /** Voltage at each node, indexed by name. Ground is always 0. */
  v: Record<string, number>;
  /** Current through each independent V-source, indexed by element id
   *  (positive = a → b internally). */
  i: Record<string, number>;
  /** Voltage across each capacitor at this step, indexed by element id. */
  vc: Record<string, number>;
  /** Current through each inductor at this step, indexed by element id
   *  (positive = a → b internally). */
  il: Record<string, number>;
  /** Time of this sample. */
  t: number;
}

interface SolverState {
  nodes: NodeMap;
  /** Element id -> current cap voltage (V_a - V_b). */
  capV: Map<string, number>;
  /** Element id -> current inductor current (a → b). */
  indI: Map<string, number>;
}

/** Initialise solver state. Caps start at IC voltage; inductors at IC current. */
export function initState(circuit: Circuit): SolverState {
  const nodes = buildNodeMap(circuit);
  const capV = new Map<string, number>();
  const indI = new Map<string, number>();
  for (const e of circuit.elements) {
    if (e.kind === "C") capV.set(e.id, e.ic ?? 0);
    if (e.kind === "L") indI.set(e.id, e.ic ?? 0);
  }
  return { nodes, capV, indI };
}

/** Solve one timestep. Pass dt = Infinity (or omit) for the pure-DC operating point. */
export function solveStep(
  circuit: Circuit,
  state: SolverState,
  t: number,
  dt: number = Infinity,
): StepResult {
  const nNodes = state.nodes.names.length; // includes ground
  const internalN = nNodes - 1;

  const sources: Element[] = circuit.elements.filter((e) => e.kind === "V");
  const inductors: Element[] = circuit.elements.filter((e) => e.kind === "L");
  const nSrc = sources.length;
  const nInd = inductors.length;
  const dim = internalN + nSrc + nInd;

  const A = zeros(dim, dim);
  const z = new Array<number>(dim).fill(0);

  // Stamp resistors and the resistive part of capacitor companions
  for (const e of circuit.elements) {
    if (e.kind === "R" || e.kind === "C") {
      let G: number;
      if (e.kind === "R") {
        G = 1 / e.value;
      } else {
        // Pure-DC operating point: open the cap (G = 0, no current source).
        if (!isFinite(dt)) continue;
        G = e.value / dt;
      }
      stampConductance(A, state.nodes, e.a, e.b, G);

      if (e.kind === "C" && isFinite(dt)) {
        const vcPrev = state.capV.get(e.id) ?? 0;
        const Ieq = (e.value / dt) * vcPrev;
        // Companion current source flows b → a internally, i.e. injects
        // +Ieq into node a and -Ieq into node b in the RHS.
        stampCurrent(z, state.nodes, e.a, e.b, Ieq);
      }
    }
  }

  // Stamp voltage sources
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

  // Stamp inductors. Branch-current unknown; constitutive eq is
  //   V_a - V_b - (L/dt) · I_L = -(L/dt) · I_L(t-dt)
  // At dt = Infinity this is V_a - V_b = 0 (short), with I_L floating.
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

  const x = solveLinear(A, z);
  if (!x) throw new Error("solveStep: singular MNA system at t=" + t);

  // Unpack results
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

  return { v, i, vc, il, t };
}

/** Advance state: copy this step's cap voltages and inductor currents forward. */
export function advance(state: SolverState, step: StepResult): void {
  for (const [id, vc] of Object.entries(step.vc)) state.capV.set(id, vc);
  for (const [id, il] of Object.entries(step.il)) state.indI.set(id, il);
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
