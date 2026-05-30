/**
 * Modified Nodal Analysis for linear RLC + independent V-sources.
 *
 * Unknowns: [V(node 1) ... V(node N-1), I(Vsource_1) ... I(Vsource_M)]
 * Ground is node 0; its row/col is dropped from the matrix.
 *
 * Capacitors are handled via the implicit-Euler companion model:
 *   I_C(t+dt) = (C/dt) · (V_C(t+dt) - V_C(t))
 * which stamps like a conductance G_eq = C/dt plus an equivalent current
 * source I_eq = G_eq · V_C(t) flowing from node b to node a.
 */
import { evalWave, type Circuit, type Element, type NodeMap, buildNodeMap } from "./circuit";
import { solveLinear, zeros } from "./linalg";

export interface StepResult {
  /** Voltage at each node, indexed by name. Ground is always 0. */
  v: Record<string, number>;
  /** Current through each independent V-source, indexed by element id (positive a→b external). */
  i: Record<string, number>;
  /** Voltage across each capacitor at this step, indexed by element id. */
  vc: Record<string, number>;
  /** Time of this sample. */
  t: number;
}

interface SolverState {
  nodes: NodeMap;
  /** Element id -> current cap voltage (V_a - V_b). */
  capV: Map<string, number>;
}

/** Initialise solver state. DC operating point at t=0 with caps replaced by their ICs. */
export function initState(circuit: Circuit): SolverState {
  const nodes = buildNodeMap(circuit);
  const capV = new Map<string, number>();
  for (const e of circuit.elements) {
    if (e.kind === "C") capV.set(e.id, e.ic ?? 0);
  }
  return { nodes, capV };
}

/** Solve one timestep. Pass dt = Infinity (or omit) for the pure-DC operating point. */
export function solveStep(
  circuit: Circuit,
  state: SolverState,
  t: number,
  dt: number = Infinity,
): StepResult {
  const nNodes = state.nodes.names.length; // includes ground
  const internalN = nNodes - 1; // excluding ground

  const sources: Element[] = circuit.elements.filter((e) => e.kind === "V");
  const nSrc = sources.length;
  const dim = internalN + nSrc;

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
        // Caller can avoid this by using a finite dt.
        if (!isFinite(dt)) continue;
        G = e.value / dt;
      }
      stampConductance(A, state.nodes, e.a, e.b, G);

      if (e.kind === "C" && isFinite(dt)) {
        const vcPrev = state.capV.get(e.id) ?? 0;
        const Ieq = (e.value / dt) * vcPrev;
        // Companion current source flows b -> a internally, i.e. injects
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

  return { v, i, vc, t };
}

/** Advance state: copy this step's cap voltages forward as the new initial conditions. */
export function advance(state: SolverState, step: StepResult): void {
  for (const [id, vc] of Object.entries(step.vc)) state.capV.set(id, vc);
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
