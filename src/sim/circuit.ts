/**
 * Linear circuit primitives.
 *
 * Nodes are referenced by string name. The special ground node is "gnd".
 * A circuit is just a list of elements; the solver assigns integer indices.
 */

export type Wave =
  | { kind: "dc"; value: number }
  | { kind: "step"; t0: number; v0: number; v1: number }
  | { kind: "sine"; offset: number; amplitude: number; frequency: number; phase?: number }
  | { kind: "pulse"; period: number; duty: number; vLo: number; vHi: number; t0?: number };

export function evalWave(w: Wave, t: number): number {
  switch (w.kind) {
    case "dc":
      return w.value;
    case "step":
      return t < w.t0 ? w.v0 : w.v1;
    case "sine":
      return w.offset + w.amplitude * Math.sin(2 * Math.PI * w.frequency * t + (w.phase ?? 0));
    case "pulse": {
      const t0 = w.t0 ?? 0;
      const phase = ((t - t0) % w.period + w.period) % w.period;
      return phase < w.period * w.duty ? w.vHi : w.vLo;
    }
  }
}

export type Element =
  | { kind: "R"; id: string; a: string; b: string; value: number }
  | { kind: "C"; id: string; a: string; b: string; value: number; ic?: number }
  | { kind: "L"; id: string; a: string; b: string; value: number; ic?: number }
  | { kind: "V"; id: string; a: string; b: string; wave: Wave }
  /** Op-amp. When `A0` and `GBW` are both set, behaves as a single-pole
   *  finite-gain amplifier: A(s) = A0 / (1 + s/ωp) where ωp = 2π·GBW/A0.
   *  When either is omitted, falls back to the ideal V+ = V- model.
   *  `A0` is DC open-loop gain (dimensionless); `GBW` is the gain-bandwidth
   *  product in Hz (the frequency where |A(jω)| crosses unity). Requires
   *  negative feedback in the surrounding circuit; otherwise the matrix
   *  is singular (ideal) or numerically dominated by A0 (finite GBW). */
  | {
      kind: "OP";
      id: string;
      vplus: string;
      vminus: string;
      vout: string;
      A0?: number;
      GBW?: number;
    }
  /** Shockley diode. Anode = a, cathode = b. Forward current flows a → b.
   *  I_D = Is · (exp(V_D / (N·Vt)) − 1). All three model params default to a
   *  1N4148-ish profile so most circuits can omit them. `ic` seeds the
   *  Newton iterate at t=0; transient analysis tracks V_D across steps. */
  | {
      kind: "D";
      id: string;
      a: string;
      b: string;
      Is?: number;
      Vt?: number;
      N?: number;
      ic?: number;
    }
  /** Ebers–Moll BJT (injection model). Terminals are collector / base /
   *  emitter. `polarity: "npn" | "pnp"`. In NPN forward active, V_BE > 0
   *  and the device sinks current at the collector. PNP is the mirror.
   *  Defaults model a 2N3904-ish NPN.
   *
   *  Parasitic capacitances `Cpi` (base-emitter) and `Cmu` (base-collector)
   *  are stamped as constant linear caps when set. In transient analysis
   *  they use the same implicit-Euler companion as a regular C; in AC they
   *  contribute jωC admittance. Omit them and the device is treated as
   *  parasitic-free (fine for low-frequency work). */
  | {
      kind: "Q";
      id: string;
      polarity: "npn" | "pnp";
      c: string;
      b: string;
      e: string;
      Is?: number;
      Vt?: number;
      betaF?: number;
      betaR?: number;
      Cpi?: number;
      Cmu?: number;
      /** Early voltage in volts. Models base-width modulation: the forward
       *  current picks up a factor (1 − V_BC/V_A), giving the BJT a finite
       *  small-signal output resistance r_o = V_A / I_C in forward active.
       *  Omit or set to Infinity for the ideal "horizontal" output. */
      VA?: number;
    }
  /** Shichman–Hodges (SPICE Level-1) MOSFET. Terminals are drain / gate /
   *  source (body tied to source). `polarity: "nmos" | "pmos"`. Three
   *  regions: cutoff (V_GS_eff < 0), triode (V_DS < V_GS_eff), saturation
   *  (V_DS ≥ V_GS_eff). Defaults model a 2N7000-ish NMOS.
   *
   *  Parasitic capacitances `Cgs`, `Cgd`, `Cds` are stamped as constant
   *  linear caps when set. Same warm-start trick as the BJT — the device
   *  already tracks V_GS and V_DS for Newton, so the cap companion has
   *  its "previous voltage" for free. */
  | {
      kind: "M";
      id: string;
      polarity: "nmos" | "pmos";
      d: string;
      g: string;
      s: string;
      /** Transconductance parameter K = µ·Cox·(W/L). */
      K?: number;
      /** Threshold voltage. */
      Vth?: number;
      Cgs?: number;
      Cgd?: number;
      Cds?: number;
      /** Channel-length modulation coefficient (V⁻¹). Saturation current
       *  picks up a factor (1 + λ·V_DS), giving the MOSFET a finite
       *  small-signal output resistance r_o = 1 / (λ·I_D). Default 0 = the
       *  textbook "flat" saturation. */
      lambda?: number;
    };

export interface Circuit {
  elements: Element[];
  /** Optional explicit node list — names of nets you want to track. Ground is implicit. */
  nodes?: string[];
}

export interface NodeMap {
  /** node name -> index. Ground is 0. */
  index: Map<string, number>;
  /** index -> node name */
  names: string[];
}

export const GROUND = "gnd";

/** Returns every node name referenced by an element. */
export function elementNodes(e: Element): string[] {
  if (e.kind === "OP") return [e.vplus, e.vminus, e.vout];
  if (e.kind === "Q") return [e.c, e.b, e.e];
  if (e.kind === "M") return [e.d, e.g, e.s];
  return [e.a, e.b];
}

/** Builds a stable name→index map for a circuit (ground is always 0). */
export function buildNodeMap(c: Circuit): NodeMap {
  const seen = new Set<string>([GROUND]);
  for (const e of c.elements) for (const n of elementNodes(e)) seen.add(n);
  if (c.nodes) for (const n of c.nodes) seen.add(n);

  const names = [GROUND, ...[...seen].filter((n) => n !== GROUND).sort()];
  const index = new Map<string, number>();
  names.forEach((n, i) => index.set(n, i));
  return { index, names };
}
