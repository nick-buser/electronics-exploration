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
  /** Ideal op-amp: V(vplus) - V(vminus) = 0, output sources whatever current
   *  is needed to satisfy that constraint. Requires negative feedback in the
   *  surrounding circuit or the MNA system is singular. */
  | { kind: "OP"; id: string; vplus: string; vminus: string; vout: string };

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
