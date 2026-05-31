/**
 * Varactor LC tank — the tunable-resonance trick that puts a diode's
 * voltage-dependent depletion capacitance to work.
 *
 *   Vbias ──[L]──┬─── tank
 *                │
 *                D (varactor: anode = gnd, cathode = tank)
 *                │
 *               GND
 *
 * At DC, V_tank = Vbias (the inductor is a wire), so the diode sees
 * V_D = −Vbias and sits reverse-biased. Its depletion capacitance follows
 * the SPICE formula C_j(V_D) = Cj0 / (1 − V_D/Vj)^Mj — push Vbias up,
 * the cap shrinks, the LC resonance moves to a higher frequency.
 *
 * The AC sweep drives the Vbias node with a 1 V perturbation. At DC the
 * source forces V_tank to its bias; at AC the source becomes an AC ground
 * looking up the inductor, so the tank's parallel L ‖ C_j shows up as
 * impedance peaking around f_0 = 1 / (2π·√(L·C_j(Vbias))).
 */
import { useCallback, useState } from "react";
import { CircuitBodeDemo, type BodeTrace } from "@/components/circuit/CircuitBodeDemo";
import type { CircuitParam } from "@/components/circuit/CircuitDemo";
import type { Circuit } from "@/sim/circuit";

const PARAMS: CircuitParam[] = [
  {
    id: "vBias",
    label: "V_bias (reverse)",
    min: 0.5,
    max: 25,
    step: 0.5,
    format: (v) => `${v.toFixed(1)} V`,
  },
  {
    id: "lUH",
    label: "L",
    min: 1,
    max: 100,
    step: 1,
    format: (v) => `${v.toFixed(0)} µH`,
  },
  {
    id: "cj0PF",
    label: "Cj0",
    min: 5,
    max: 500,
    step: 5,
    format: (v) => `${v.toFixed(0)} pF`,
  },
];

const INITIAL: Record<string, number> = {
  vBias: 3,
  lUH: 10,
  cj0PF: 100,
};

export function VaractorTankDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [activeId, setActiveId] = useState<string | null>(null);

  const build = useCallback((p: Record<string, number>): Circuit => {
    return {
      elements: [
        { kind: "V", id: "vbias", a: "vbias", b: "gnd", wave: { kind: "dc", value: p.vBias } },
        { kind: "L", id: "l1", a: "tank", b: "vbias", value: p.lUH * 1e-6 },
        // Varactor: anode = gnd, cathode = tank. With V_tank > 0 (set by
        // bias rail), V_D = -V_tank → reverse-biased.
        { kind: "D", id: "dvar", a: "gnd", b: "tank", Cj0: p.cj0PF * 1e-12, Vj: 0.75, Mj: 0.5 },
      ],
    };
  }, []);

  // Closed-form approximation of the resonance frequency from the SPICE
  // C_j formula at V_D = -V_bias. Helps the user line up the trace peak
  // with the predicted f₀.
  const Cj = (values.cj0PF * 1e-12) / Math.sqrt(1 + values.vBias / 0.75);
  const f0 = 1 / (2 * Math.PI * Math.sqrt(values.lUH * 1e-6 * Cj));

  const traces: BodeTrace[] = [
    {
      id: "tank",
      label: `|V_tank| · f₀ ≈ ${fmtFreq(f0)}, C_j ≈ ${(Cj * 1e12).toFixed(1)} pF`,
      color: "var(--color-accent)",
      extract: (p) => p.v.tank,
    },
  ];

  return (
    <CircuitBodeDemo
      title="Varactor LC tank — tune the resonance with reverse bias"
      build={build}
      inputs={{ vbias: { mag: 1 } }}
      params={PARAMS}
      values={values}
      onChange={setValues}
      traces={traces}
      activeId={activeId}
      onActiveChange={setActiveId}
      fStart={1e5}
      fStop={1e8}
      nPoints={401}
      yScale="dB"
      yLabel="|V_tank| · dB"
    />
  );
}

function fmtFreq(f: number): string {
  if (f >= 1e6) return `${(f / 1e6).toFixed(2)} MHz`;
  if (f >= 1e3) return `${(f / 1e3).toFixed(1)} kHz`;
  return `${f.toFixed(0)} Hz`;
}
