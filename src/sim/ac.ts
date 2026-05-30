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
  return freqs.map((f) => solveAc(circuit, f, opts.inputs));
}

export function solveAc(
  circuit: Circuit,
  frequency: number,
  inputs: Record<string, AcInput>,
): AcPoint {
  const nodes = buildNodeMap(circuit);
  const omega = 2 * Math.PI * frequency;
  const sources: Element[] = circuit.elements.filter((e) => e.kind === "V");
  const nSrc = sources.length;
  const internalN = nodes.names.length - 1;
  const dim = internalN + nSrc;

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
