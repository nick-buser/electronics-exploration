/**
 * The gain–bandwidth tradeoff. Same op-amp, same A₀ and GBW; three non-
 * inverting amps with different feedback resistor ratios. Each one stays
 * flat at its closed-loop gain up to some corner, then rolls off at
 * −20 dB/decade. The corner sits at GBW / G — so doubling the gain halves
 * the bandwidth. Every trace converges onto the same open-loop curve at
 * high frequency and crosses unity gain at exactly GBW.
 */
import { useCallback, useState } from "react";
import { CircuitBodeDemo, type BodeTrace } from "@/components/circuit/CircuitBodeDemo";
import type { CircuitParam } from "@/components/circuit/CircuitDemo";
import type { Circuit } from "@/sim/circuit";

const PARAMS: CircuitParam[] = [
  {
    id: "log10A0",
    label: "A₀ (DC open-loop)",
    min: 3,
    max: 7,
    step: 0.1,
    format: (v) => {
      const a0 = Math.pow(10, v);
      if (a0 >= 1e6) return `${(a0 / 1e6).toFixed(0)}M`;
      if (a0 >= 1e3) return `${(a0 / 1e3).toFixed(0)}k`;
      return a0.toFixed(0);
    },
  },
  {
    id: "log10GBW",
    label: "GBW",
    min: 5,
    max: 9,
    step: 0.1,
    format: (v) => {
      const f = Math.pow(10, v);
      if (f >= 1e9) return `${(f / 1e9).toFixed(1)} GHz`;
      if (f >= 1e6) return `${(f / 1e6).toFixed(1)} MHz`;
      if (f >= 1e3) return `${(f / 1e3).toFixed(0)} kHz`;
      return `${f.toFixed(0)} Hz`;
    },
  },
];

const INITIAL: Record<string, number> = {
  log10A0: 5, // A0 = 100k (typical small-signal op-amp)
  log10GBW: 6, // GBW = 1 MHz
};

const GAIN_CONFIGS = [
  { id: "g1", gain: 1, label: "G = 1× (buffer)" },
  { id: "g10", gain: 10, label: "G = 10×" },
  { id: "g100", gain: 100, label: "G = 100×" },
];

export function GbwTradeoffDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [activeId, setActiveId] = useState<string | null>(null);

  const build = useCallback(
    (p: Record<string, number>, traceId: string): Circuit => {
      const A0 = Math.pow(10, p.log10A0);
      const GBW = Math.pow(10, p.log10GBW);
      const cfg = GAIN_CONFIGS.find((g) => g.id === traceId)!;
      const elements: Circuit["elements"] = [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
      ];
      if (cfg.gain === 1) {
        // Voltage follower
        elements.push({
          kind: "OP",
          id: "u1",
          vplus: "vin",
          vminus: "vout",
          vout: "vout",
          A0,
          GBW,
        });
      } else {
        // Non-inverting: G = 1 + R_f / R_g. Pick R_g = 1 kΩ.
        const Rg = 1000;
        const Rf = (cfg.gain - 1) * Rg;
        elements.push({
          kind: "OP",
          id: "u1",
          vplus: "vin",
          vminus: "fb",
          vout: "vout",
          A0,
          GBW,
        });
        elements.push({ kind: "R", id: "rg", a: "fb", b: "gnd", value: Rg });
        elements.push({ kind: "R", id: "rf", a: "vout", b: "fb", value: Rf });
      }
      return { elements };
    },
    [],
  );

  const A0 = Math.pow(10, values.log10A0);
  const GBW = Math.pow(10, values.log10GBW);

  const traces: BodeTrace[] = GAIN_CONFIGS.map((cfg, i) => ({
    id: cfg.id,
    label: `${cfg.label} · fc ≈ ${fmtFreq(GBW / cfg.gain)}`,
    color: ["var(--color-accent)", "var(--color-amber)", "var(--color-rose)"][i],
    extract: (p) => p.v.vout,
  }));

  return (
    <CircuitBodeDemo
      title={`Gain–bandwidth tradeoff · GBW = ${fmtFreq(GBW)}, A₀ = ${fmtAm(A0)}`}
      build={build}
      inputs={{ vs: { mag: 1 } }}
      params={PARAMS}
      values={values}
      onChange={setValues}
      traces={traces}
      activeId={activeId}
      onActiveChange={setActiveId}
      fStart={1}
      fStop={1e9}
      nPoints={241}
      yScale="dB"
      yLabel="|gain| · dB"
    />
  );
}

function fmtFreq(f: number): string {
  if (f >= 1e9) return `${(f / 1e9).toFixed(2)} GHz`;
  if (f >= 1e6) return `${(f / 1e6).toFixed(2)} MHz`;
  if (f >= 1e3) return `${(f / 1e3).toFixed(1)} kHz`;
  return `${f.toFixed(0)} Hz`;
}

function fmtAm(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
  return v.toFixed(0);
}
