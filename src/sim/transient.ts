/**
 * Convenience wrappers for DC and transient analysis.
 */
import type { Circuit } from "./circuit";
import { advance, initState, solveStep, type StepResult } from "./mna";

export function dcOperatingPoint(circuit: Circuit): StepResult {
  const state = initState(circuit);
  return solveStep(circuit, state, 0, Infinity);
}

export interface TransientOptions {
  /** Total simulation duration, in seconds. */
  duration: number;
  /** Timestep, in seconds. Implicit Euler is unconditionally stable, but small dt → accurate. */
  dt: number;
  /** Down-sample factor for the returned trace (1 = keep every step). */
  decimate?: number;
}

/** Runs a transient analysis and returns sampled steps.
 *
 * Capacitors start at their `ic` (default 0). Sources are NOT used to
 * pre-charge them — that would smear a step discontinuity at t=0 into
 * the initial conditions. The first emitted sample is at t = dt.
 */
export function runTransient(circuit: Circuit, opts: TransientOptions): StepResult[] {
  const { duration, dt } = opts;
  const decimate = Math.max(1, Math.floor(opts.decimate ?? 1));
  const state = initState(circuit);

  const out: StepResult[] = [];
  const nSteps = Math.ceil(duration / dt);
  for (let k = 1; k <= nSteps; k++) {
    const t = k * dt;
    const step = solveStep(circuit, state, t, dt);
    advance(state, step);
    if (k === 1 || k % decimate === 0 || k === nSteps) out.push(step);
  }
  return out;
}
