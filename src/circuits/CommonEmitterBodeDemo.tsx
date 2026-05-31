/**
 * Frequency response of the common-emitter NPN amplifier — same circuit
 * as the transient demo on the same page, but plotted in the frequency
 * domain. The simulator does a DC operating point first (Newton iterates
 * on the BJT until V_BE, V_BC converge), then linearises the transistor
 * around that bias and runs the AC sweep. The resulting Bode plot shows:
 *
 *   - A high-pass corner at f_in = 1 / (2π·R_in·C_in) from the input
 *     coupling cap; below that, C_in blocks the signal.
 *   - A flat midband gain ≈ R_C / (R_E + r_e), where r_e = V_T / I_E is
 *     the BJT's intrinsic emitter resistance at the bias current.
 *   - A high-frequency rolloff dominated by the Miller-multiplied C_μ at
 *     the base — push C_μ up and watch the upper corner march down.
 *
 * A 1 kΩ source resistor sits in front of the coupling cap so the upper
 * pole has a non-trivial source impedance to act against. Without it the
 * Miller effect would be invisible (the ideal V source would just force
 * the base no matter what the cap demanded).
 */
import { useCallback, useState } from "react";
import { CircuitBodeDemo, type BodeTrace } from "@/components/circuit/CircuitBodeDemo";
import type { CircuitParam } from "@/components/circuit/CircuitDemo";
import type { Circuit } from "@/sim/circuit";

const PARAMS: CircuitParam[] = [
  {
    id: "rcOhm",
    label: "R_C",
    min: 500,
    max: 10000,
    step: 100,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} kΩ` : `${v.toFixed(0)} Ω`),
  },
  {
    id: "reOhm",
    label: "R_E",
    min: 100,
    max: 2000,
    step: 50,
    format: (v) => `${v.toFixed(0)} Ω`,
  },
  {
    id: "cinUF",
    label: "C_in",
    min: 0.1,
    max: 100,
    step: 0.1,
    format: (v) => (v >= 1 ? `${v.toFixed(1)} µF` : `${(v * 1000).toFixed(0)} nF`),
  },
  {
    id: "cpiPF",
    label: "Cπ",
    min: 0,
    max: 200,
    step: 1,
    format: (v) => `${v.toFixed(0)} pF`,
  },
  {
    id: "cmuPF",
    label: "Cμ",
    min: 0,
    max: 50,
    step: 0.5,
    format: (v) => `${v.toFixed(1)} pF`,
  },
];

const INITIAL: Record<string, number> = {
  rcOhm: 3300,
  reOhm: 470,
  cinUF: 10,
  cpiPF: 30,
  cmuPF: 4,
};

export function CommonEmitterBodeDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [activeId, setActiveId] = useState<string | null>(null);

  const build = useCallback((p: Record<string, number>): Circuit => {
    return {
      elements: [
        { kind: "V", id: "vcc", a: "vcc", b: "gnd", wave: { kind: "dc", value: 9 } },
        { kind: "R", id: "rb1", a: "vcc", b: "base", value: 47000 },
        { kind: "R", id: "rb2", a: "base", b: "gnd", value: 10000 },
        // AC test source — DC value 0; AC amplitude comes from the inputs map.
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        // Realistic source impedance — gives the Miller pole something to
        // act against. Without it, an ideal V source forces the base and
        // the upper rolloff disappears.
        { kind: "R", id: "rs", a: "vin", b: "cin_in", value: 1000 },
        { kind: "C", id: "cin", a: "cin_in", b: "base", value: p.cinUF * 1e-6 },
        { kind: "R", id: "rc", a: "vcc", b: "coll", value: p.rcOhm },
        { kind: "R", id: "re", a: "emit", b: "gnd", value: p.reOhm },
        {
          kind: "Q",
          id: "q1",
          polarity: "npn",
          c: "coll",
          b: "base",
          e: "emit",
          Cpi: p.cpiPF * 1e-12,
          Cmu: p.cmuPF * 1e-12,
        },
      ],
    };
  }, []);

  // Approximate input pole frequency. R_in seen by C_in ≈ R_S + (R_bias ‖ r_π).
  // At default bias r_π ≈ β·V_T/I_E ≈ 2.5 kΩ, R_bias ≈ 8 kΩ → ~3 kΩ total.
  const fcInput = 1 / (2 * Math.PI * 3000 * values.cinUF * 1e-6);

  const traces: BodeTrace[] = [
    {
      id: "vout",
      label: `|V_out / V_in| · input corner ≈ ${fmtFreq(fcInput)}`,
      color: "var(--color-accent)",
      extract: (p) => p.v.coll,
    },
  ];

  return (
    <CircuitBodeDemo
      title="Common-emitter Bode plot (small-signal at op-point)"
      build={build}
      inputs={{ vs: { mag: 1 } }}
      params={PARAMS}
      values={values}
      onChange={setValues}
      traces={traces}
      activeId={activeId}
      onActiveChange={setActiveId}
      fStart={0.1}
      fStop={1e8}
      nPoints={241}
      yScale="dB"
      yLabel="|gain| · dB"
    />
  );
}

function fmtFreq(f: number): string {
  if (f >= 1e6) return `${(f / 1e6).toFixed(1)} MHz`;
  if (f >= 1e3) return `${(f / 1e3).toFixed(1)} kHz`;
  if (f >= 1) return `${f.toFixed(1)} Hz`;
  return `${(f * 1000).toFixed(0)} mHz`;
}
