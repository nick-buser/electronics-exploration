/**
 * Small-signal AC analysis (frequency-domain MNA).
 *
 * The same Element types are reused, but reactive components contribute
 * their phasor admittance and voltage sources are excited from a separate
 * `inputs` map rather than their time-domain `wave`. That way a circuit
 * built for transient analysis can be swept directly.
 *
 * Stamps at angular frequency ω:
 *   R: Y = 1/R                (real conductance)
 *   C: Y = jωC                (admittance pole at DC)
 *   L: Y = 1/(jωL) = -j/(ωL)
 *   V: forces V_a - V_b = ac_phasor, branch current as the extra unknown
 *
 * Inductors don't need a branch-current unknown at AC since they have
 * a well-defined admittance for ω > 0.
 */
import { buildNodeMap, type Circuit, type Element, type NodeMap } from "./circuit";
import { abs, add, cx, div, mul, neg, sub, type Complex, ZERO } from "./complex";
import {
  bjtCompanion,
  bjtParams,
  diodeCj,
  diodeCompanion,
  diodeParams,
  mosCompanion,
  mosParams,
  type StepResult,
} from "./mna";
import { dcOperatingPoint } from "./transient";

export interface AcInput {
  /** Phasor magnitude. */
  mag: number;
  /** Phasor phase in radians (default 0). */
  phase?: number;
}

export interface AcOptions {
  /** Lower bound, Hz. Must be > 0 (log sweep). */
  fStart: number;
  /** Upper bound, Hz. */
  fStop: number;
  /** Number of sample points (log-spaced). */
  nPoints: number;
  /** Source id → phasor amplitude. Sources not listed contribute 0. */
  inputs: Record<string, AcInput>;
  /** Pre-computed DC operating point used to linearise nonlinear elements
   *  (diodes, BJTs, MOSFETs). If omitted and the circuit contains any
   *  nonlinear elements, acSweep will compute one automatically via
   *  dcOperatingPoint(). Provide your own when running multiple sweeps
   *  at the same operating point to avoid the redundant work. */
  opPoint?: StepResult;
}

export interface AcPoint {
  f: number;
  /** Node phasor, keyed by node name. */
  v: Record<string, Complex>;
  /** V-source branch current, keyed by element id. Useful for Z = V/I. */
  i: Record<string, Complex>;
}

export function acSweep(circuit: Circuit, opts: AcOptions): AcPoint[] {
  const freqs = logSpace(opts.fStart, opts.fStop, opts.nPoints);
  const opPoint = opts.opPoint ?? maybeOpPoint(circuit);
  return freqs.map((f) => solveAc(circuit, f, opts.inputs, opPoint));
}

function maybeOpPoint(circuit: Circuit): StepResult | undefined {
  const hasNonlinear = circuit.elements.some(
    (e) => e.kind === "D" || e.kind === "Q" || e.kind === "M",
  );
  return hasNonlinear ? dcOperatingPoint(circuit) : undefined;
}

export function solveAc(
  circuit: Circuit,
  frequency: number,
  inputs: Record<string, AcInput>,
  opPoint?: StepResult,
): AcPoint {
  const nodes = buildNodeMap(circuit);
  const omega = 2 * Math.PI * frequency;
  // Auto-compute op-point if the caller didn't provide one but the
  // circuit contains nonlinear elements.
  const bias = opPoint ?? maybeOpPoint(circuit);
  const sources: Element[] = circuit.elements.filter((e) => e.kind === "V");
  const opamps: Element[] = circuit.elements.filter((e) => e.kind === "OP");
  const nSrc = sources.length;
  const nOp = opamps.length;
  const internalN = nodes.names.length - 1;
  const dim = internalN + nSrc + nOp;

  const A = zerosC(dim);
  const z = new Array<Complex>(dim).fill(ZERO).map(() => ({ ...ZERO }));

  for (const e of circuit.elements) {
    if (e.kind === "R") {
      stampY(A, nodes, e.a, e.b, cx(1 / e.value));
    } else if (e.kind === "C") {
      stampY(A, nodes, e.a, e.b, cx(0, omega * e.value));
    } else if (e.kind === "L") {
      // Y = 1/(jωL) = -j/(ωL)
      stampY(A, nodes, e.a, e.b, cx(0, -1 / (omega * e.value)));
    }
  }

  // Parasitic capacitances on nonlinear devices — frequency-domain stamp
  // is a pure jωC admittance between the two terminals. Independent of
  // bias point (we use constant cap values), so this happens whether or
  // not an op-point was supplied.
  for (const e of circuit.elements) {
    if (e.kind === "Q") {
      if (e.Cpi && e.Cpi > 0) stampY(A, nodes, e.b, e.e, cx(0, omega * e.Cpi));
      if (e.Cmu && e.Cmu > 0) stampY(A, nodes, e.b, e.c, cx(0, omega * e.Cmu));
    } else if (e.kind === "M") {
      if (e.Cgs && e.Cgs > 0) stampY(A, nodes, e.g, e.s, cx(0, omega * e.Cgs));
      if (e.Cgd && e.Cgd > 0) stampY(A, nodes, e.g, e.d, cx(0, omega * e.Cgd));
      if (e.Cds && e.Cds > 0) stampY(A, nodes, e.d, e.s, cx(0, omega * e.Cds));
    }
  }

  // Nonlinear elements: linearise around the DC operating point. Each
  // element's Newton-companion Jacobian IS its small-signal admittance
  // matrix at the bias. The Jacobian terms go into the complex MNA matrix;
  // the constant I_eq offset is discarded (small-signal AC is about
  // perturbations from the bias, not absolute currents).
  if (bias) {
    for (const e of circuit.elements) {
      if (e.kind === "D") {
        const { Is, vtN } = diodeParams(e);
        const vd = bias.vd[e.id] ?? 0;
        const { Geq } = diodeCompanion(vd, Is, vtN);
        stampY(A, nodes, e.a, e.b, cx(Geq));
        // Voltage-dependent depletion cap, frozen at the bias V_D.
        const Cj = diodeCj(vd, e);
        if (Cj > 0) stampY(A, nodes, e.a, e.b, cx(0, omega * Cj));
      } else if (e.kind === "Q") {
        const p = bjtParams(e);
        const s = e.polarity === "npn" ? 1 : -1;
        const vbeEff = s * ((bias.v[e.b] ?? 0) - (bias.v[e.e] ?? 0));
        const vbcEff = s * ((bias.v[e.b] ?? 0) - (bias.v[e.c] ?? 0));
        const c = bjtCompanion(vbeEff, vbcEff, p);
        stampBjtAdmittance(A, nodes, e.c, e.b, e.c, e.e, c.dIC_dVBE, c.dIC_dVBC);
        stampBjtAdmittance(A, nodes, e.b, e.b, e.c, e.e, c.dIB_dVBE, c.dIB_dVBC);
        stampBjtAdmittance(A, nodes, e.e, e.b, e.c, e.e, c.dIE_dVBE, c.dIE_dVBC);
      } else if (e.kind === "M") {
        const p = mosParams(e);
        const s = e.polarity === "nmos" ? 1 : -1;
        const vgs = s * ((bias.v[e.g] ?? 0) - (bias.v[e.s] ?? 0));
        const vds = s * ((bias.v[e.d] ?? 0) - (bias.v[e.s] ?? 0));
        const { gm, gds } = mosCompanion(vgs, vds, p);
        stampMosAdmittance(A, nodes, e.d, e.d, e.g, e.s, gm, gds);
        stampMosAdmittance(A, nodes, e.s, e.d, e.g, e.s, -gm, -gds);
      }
    }
  }

  sources.forEach((e, k) => {
    if (e.kind !== "V") return;
    const row = internalN + k;
    const ia = nodes.index.get(e.a) ?? 0;
    const ib = nodes.index.get(e.b) ?? 0;
    if (ia > 0) {
      A[ia - 1][row] = add(A[ia - 1][row], cx(1));
      A[row][ia - 1] = add(A[row][ia - 1], cx(1));
    }
    if (ib > 0) {
      A[ib - 1][row] = add(A[ib - 1][row], cx(-1));
      A[row][ib - 1] = add(A[row][ib - 1], cx(-1));
    }
    const phasor = inputs[e.id];
    if (phasor) {
      const re = phasor.mag * Math.cos(phasor.phase ?? 0);
      const im = phasor.mag * Math.sin(phasor.phase ?? 0);
      z[row] = cx(re, im);
    }
  });

  // Op-amps. Ideal uses V+ = V-. Finite-GBW substitutes the dominant-pole
  // transfer function in the frequency domain:
  //   V_out · (1 + jω/ωp) - A0·V+ + A0·V- = 0,  ωp = 2π·GBW/A0
  opamps.forEach((e, k) => {
    if (e.kind !== "OP") return;
    const row = internalN + nSrc + k;
    const iVout = nodes.index.get(e.vout) ?? 0;
    const iVp = nodes.index.get(e.vplus) ?? 0;
    const iVm = nodes.index.get(e.vminus) ?? 0;
    if (iVout > 0) A[iVout - 1][row] = add(A[iVout - 1][row], cx(1));
    if (e.A0 != null && e.GBW != null) {
      const wp = (2 * Math.PI * e.GBW) / e.A0;
      if (iVout > 0) A[row][iVout - 1] = add(A[row][iVout - 1], cx(1, omega / wp));
      if (iVp > 0) A[row][iVp - 1] = add(A[row][iVp - 1], cx(-e.A0));
      if (iVm > 0) A[row][iVm - 1] = add(A[row][iVm - 1], cx(e.A0));
    } else {
      if (iVp > 0) A[row][iVp - 1] = add(A[row][iVp - 1], cx(1));
      if (iVm > 0) A[row][iVm - 1] = add(A[row][iVm - 1], cx(-1));
    }
  });

  const x = solveComplex(A, z);
  if (!x) throw new Error("solveAc: singular MNA system at f=" + frequency);

  const v: Record<string, Complex> = {};
  for (let i = 0; i < nodes.names.length; i++) {
    v[nodes.names[i]] = i === 0 ? { ...ZERO } : x[i - 1];
  }
  const i: Record<string, Complex> = {};
  sources.forEach((e, k) => {
    i[e.id] = x[internalN + k];
  });

  return { f: frequency, v, i };
}

/* ── helpers ───────────────────────────────────────────── */

/** Complex-valued analogue of stampBjtTerminal from mna.ts. Stamps the
 *  small-signal admittance contributions from one BJT terminal into the
 *  complex MNA matrix. No RHS offset — small-signal AC sees only
 *  perturbations from the bias point. */
function stampBjtAdmittance(
  A: Complex[][],
  nodes: NodeMap,
  term: string,
  bNode: string,
  cNode: string,
  eNode: string,
  dIdVbe: number,
  dIdVbc: number,
): void {
  const iT = nodes.index.get(term) ?? 0;
  if (iT === 0) return;
  const ib = nodes.index.get(bNode) ?? 0;
  const ic = nodes.index.get(cNode) ?? 0;
  const ie = nodes.index.get(eNode) ?? 0;
  if (ib > 0) A[iT - 1][ib - 1] = add(A[iT - 1][ib - 1], cx(dIdVbe + dIdVbc));
  if (ic > 0) A[iT - 1][ic - 1] = add(A[iT - 1][ic - 1], cx(-dIdVbc));
  if (ie > 0) A[iT - 1][ie - 1] = add(A[iT - 1][ie - 1], cx(-dIdVbe));
}

/** Complex-valued analogue of stampMosTerminal. */
function stampMosAdmittance(
  A: Complex[][],
  nodes: NodeMap,
  term: string,
  dNode: string,
  gNode: string,
  sNode: string,
  gm: number,
  gds: number,
): void {
  const iT = nodes.index.get(term) ?? 0;
  if (iT === 0) return;
  const iD = nodes.index.get(dNode) ?? 0;
  const iG = nodes.index.get(gNode) ?? 0;
  const iS = nodes.index.get(sNode) ?? 0;
  if (iG > 0) A[iT - 1][iG - 1] = add(A[iT - 1][iG - 1], cx(gm));
  if (iD > 0) A[iT - 1][iD - 1] = add(A[iT - 1][iD - 1], cx(gds));
  if (iS > 0) A[iT - 1][iS - 1] = add(A[iT - 1][iS - 1], cx(-(gm + gds)));
}

function stampY(A: Complex[][], nodes: NodeMap, a: string, b: string, Y: Complex) {
  const ia = nodes.index.get(a) ?? 0;
  const ib = nodes.index.get(b) ?? 0;
  if (ia > 0) A[ia - 1][ia - 1] = add(A[ia - 1][ia - 1], Y);
  if (ib > 0) A[ib - 1][ib - 1] = add(A[ib - 1][ib - 1], Y);
  if (ia > 0 && ib > 0) {
    A[ia - 1][ib - 1] = sub(A[ia - 1][ib - 1], Y);
    A[ib - 1][ia - 1] = sub(A[ib - 1][ia - 1], Y);
  }
}

function zerosC(n: number): Complex[][] {
  const A: Complex[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    A[i] = new Array<Complex>(n);
    for (let j = 0; j < n; j++) A[i][j] = { ...ZERO };
  }
  return A;
}

function logSpace(lo: number, hi: number, n: number): number[] {
  if (lo <= 0) throw new Error("logSpace: fStart must be > 0");
  const a = Math.log10(lo);
  const b = Math.log10(hi);
  const out: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    out[i] = Math.pow(10, a + (b - a) * t);
  }
  return out;
}

/** Complex Gaussian elimination with partial pivoting. Mutates A and b. */
function solveComplex(A: Complex[][], b: Complex[]): Complex[] | null {
  const n = b.length;
  for (let k = 0; k < n; k++) {
    let piv = k;
    let max = abs(A[k][k]);
    for (let i = k + 1; i < n; i++) {
      const v = abs(A[i][k]);
      if (v > max) {
        max = v;
        piv = i;
      }
    }
    if (max < 1e-18) return null;
    if (piv !== k) {
      [A[k], A[piv]] = [A[piv], A[k]];
      [b[k], b[piv]] = [b[piv], b[k]];
    }
    const akk = A[k][k];
    for (let i = k + 1; i < n; i++) {
      if (abs(A[i][k]) === 0) continue;
      const factor = div(A[i][k], akk);
      for (let j = k; j < n; j++) A[i][j] = sub(A[i][j], mul(factor, A[k][j]));
      b[i] = sub(b[i], mul(factor, b[k]));
    }
  }
  const x = new Array<Complex>(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < n; j++) s = sub(s, mul(A[i][j], x[j]));
    x[i] = div(s, A[i][i]);
  }
  return x;
}

/** Convenience: extract impedance Z = V/I_DUT for a 1V test source.
 *
 * The MNA branch-current convention is a→b internally, so a source
 * delivering current to an external DUT reports a *negative* i[id].
 * We negate before dividing so the resulting phasor has the natural
 * sign for an impedance. The caller is responsible for setting the
 * source's AC magnitude to 1V via `inputs`.
 */
export function impedanceFromSource(point: AcPoint, sourceId: string): Complex {
  const i = point.i[sourceId];
  if (!i) throw new Error(`impedanceFromSource: no source "${sourceId}" in solution`);
  return div(cx(1), neg(i));
}
