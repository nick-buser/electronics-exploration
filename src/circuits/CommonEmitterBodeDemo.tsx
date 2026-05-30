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
 *   - No high-frequency rolloff yet — Cπ and Cμ are not modelled, so a
 *     real 2N3904's ~few-MHz fT-limited rolloff doesn't show up here.
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
];

const INITIAL: Record<string, number> = {
  rcOhm: 3300,
  reOhm: 470,
  cinUF: 10,
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
        { kind: "C", id: "cin", a: "vin", b: "base", value: p.cinUF * 1e-6 },
        { kind: "R", id: "rc", a: "vcc", b: "coll", value: p.rcOhm },
        { kind: "R", id: "re", a: "emit", b: "gnd", value: p.reOhm },
        { kind: "Q", id: "q1", polarity: "npn", c: "coll", b: "base", e: "emit" },
      ],
    };
  }, []);

  // R_in seen by C_in ≈ R_B1 ‖ R_B2 ‖ r_π. r_π ≈ β·V_T/I_E. With the
  // default bias point this lands around 1.5–2 kΩ, so f_in ≈ 8 Hz at
  // C_in = 10 µF.
  const approxFcorner = 1 / (2 * Math.PI * 2000 * values.cinUF * 1e-6);

  const traces: BodeTrace[] = [
    {
      id: "vout",
      label: `|V_out / V_in| · corner ≈ ${fmtFreq(approxFcorner)}`,
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
      fStop={1e7}
      nPoints={201}
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
