/**
 * Behavioral 555 astable, built from the new XSCH + SW primitives — the
 * goal is to make the canonical 1972 IC click in your head: it really is
 * just a hysteretic latch with two trip points (1/3 and 2/3 of V_cc) plus
 * a discharge transistor. Externally:
 *
 *   V_cc ─[R1]─ disch ─[R2]─ cap ─[C]─ gnd
 *                                 │
 *                                 └─── threshold + trigger tied here
 *
 * Internally we mock the IC with:
 *   - XSCH "out":   inverting Schmitt (vHigh=0, vLow=Vcc) — drives pin 3.
 *                   When the cap crosses *up* past 2/3 V_cc, OUT snaps LOW.
 *   - XSCH "qlatch": non-inverting Schmitt (vHigh=Vcc, vLow=0) — the
 *                   internal flip-flop's Q. Same thresholds, same input,
 *                   so it's always the inverse of OUT.
 *   - SW "discharge": closes when Q is HIGH, shunting the disch pin to gnd.
 *                   That short-circuits R1 during the discharge half-cycle
 *                   — which is why the high time depends on R1+R2 but the
 *                   low time only on R2.
 *
 * Periods (textbook):
 *   T_high = ln(2) · (R1 + R2) · C
 *   T_low  = ln(2) · R2 · C
 *   T      = ln(2) · (R1 + 2·R2) · C
 *   Duty   = (R1 + R2) / (R1 + 2·R2)
 */
import { useCallback, useMemo, useState } from "react";
import { CircuitDemo, type CircuitParam } from "@/components/circuit/CircuitDemo";
import {
  Capacitor,
  Ground,
  IcBlock,
  Junction,
  NodeLabel,
  Resistor,
  Schematic,
  VSource,
  Wire,
} from "@/components/circuit/schematic-prims";
import type { Circuit } from "@/sim/circuit";

const PARAMS: CircuitParam[] = [
  {
    id: "r1Kohm",
    label: "R1",
    min: 1,
    max: 100,
    step: 1,
    format: (v) => `${v.toFixed(0)} kΩ`,
  },
  {
    id: "r2Kohm",
    label: "R2",
    min: 1,
    max: 100,
    step: 1,
    format: (v) => `${v.toFixed(0)} kΩ`,
  },
  {
    id: "cNF",
    label: "C",
    min: 10,
    max: 1000,
    step: 10,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} µF` : `${v.toFixed(0)} nF`),
  },
  {
    id: "vccV",
    label: "V_cc",
    min: 3,
    max: 15,
    step: 0.5,
    format: (v) => `${v.toFixed(1)} V`,
  },
];

const INITIAL: Record<string, number> = {
  r1Kohm: 10,
  r2Kohm: 10,
  cNF: 100,
  vccV: 5,
};

export function Astable555Demo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);

  const build = useCallback((p: Record<string, number>): Circuit => {
    const Vcc = p.vccV;
    const vTl = Vcc / 3;
    const vTh = (2 * Vcc) / 3;
    return {
      elements: [
        // Supply rail
        { kind: "V", id: "vcc", a: "vcc", b: "gnd", wave: { kind: "dc", value: Vcc } },
        // External RC network
        { kind: "R", id: "r1", a: "vcc", b: "disch", value: p.r1Kohm * 1000 },
        { kind: "R", id: "r2", a: "disch", b: "cap", value: p.r2Kohm * 1000 },
        { kind: "C", id: "cload", a: "cap", b: "gnd", value: p.cNF * 1e-9, ic: 0 },
        // Internal Schmitt #1 — the pin-3 OUT signal. Inverting polarity:
        // when cap rises past 2/3 V_cc, OUT snaps to 0.
        {
          kind: "XSCH",
          id: "uout",
          in: "cap",
          out: "out",
          vThHigh: vTh,
          vThLow: vTl,
          vHigh: 0,
          vLow: Vcc,
        },
        // Internal Schmitt #2 — the Q output of the RS latch, drives the
        // discharge transistor's base. Non-inverting: HIGH when cap is in
        // the upper hysteresis region (discharge phase). Always inverse of
        // OUT — same thresholds, same input.
        {
          kind: "XSCH",
          id: "ulatch",
          in: "cap",
          out: "qlatch",
          vThHigh: vTh,
          vThLow: vTl,
          vHigh: Vcc,
          vLow: 0,
        },
        // Discharge transistor — closes when Q is HIGH, shorting the disch
        // pin to gnd through ~10 Ω (TLC555-like saturation resistance).
        {
          kind: "SW",
          id: "qd",
          p: "disch",
          n: "gnd",
          cp: "qlatch",
          cn: "gnd",
          vOn: 0.7 * Vcc,
          vOff: 0.3 * Vcc,
          Ron: 10,
          Roff: 1e9,
        },
      ],
    };
  }, []);

  const metrics = useMemo(() => {
    const R1 = values.r1Kohm * 1000;
    const R2 = values.r2Kohm * 1000;
    const C = values.cNF * 1e-9;
    const tHigh = Math.log(2) * (R1 + R2) * C;
    const tLow = Math.log(2) * R2 * C;
    const period = tHigh + tLow;
    const freq = 1 / period;
    const duty = (100 * tHigh) / period;
    return { period, freq, duty };
  }, [values]);

  const duration = 4 * metrics.period;
  const dt = metrics.period / 800;

  return (
    <CircuitDemo
      title={`555 astable · f ≈ ${fmtFreq(metrics.freq)} · duty ≈ ${metrics.duty.toFixed(1)} %`}
      build={build}
      params={PARAMS}
      values={values}
      onChange={setValues}
      probes={[
        { node: "cap", label: "V_cap (pins 2,6)" },
        { node: "out", label: "OUT (pin 3)" },
      ]}
      duration={duration}
      dt={dt}
      tUnit="ms"
      schematic={<Astable555Schematic />}
    />
  );
}

function Astable555Schematic() {
  // IC body: centre [260, 110], 70×120 → bounds x∈[225,295], y∈[50,170].
  // External R1, R2, C live in their own column at x=180 (far enough left
  // that resistor labels — which sit to the right of the body in the
  // schematic-prim convention — don't bleed into the IC).
  return (
    <Schematic width={360} height={230}>
      {/* V_cc supply on the far left */}
      <VSource a={[40, 60]} b={[40, 160]} label="V_cc" />
      <Wire path="M 40 160 L 40 195" />
      <Ground at={[40, 195]} />
      <Wire path="M 40 60 L 40 30" />
      <Wire path="M 40 30 L 285 30" />
      <NodeLabel at={[110, 22]} text="V_cc" />

      {/* IC block — abstract "555" symbol */}
      <IcBlock at={[260, 110]} width={70} height={120} label="555" />

      {/* Pin 8 (V_cc): top edge, slightly right of centre */}
      <Wire path="M 285 30 L 285 50" />
      {/* Pin 1 (GND): bottom edge, slightly right of centre */}
      <Wire path="M 285 170 L 285 195" />
      <Ground at={[285, 195]} />

      {/* R1 from V_cc rail down to disch node */}
      <Junction at={[180, 30]} />
      <Wire path="M 180 30 L 180 55" />
      <Resistor a={[180, 55]} b={[180, 95]} label="R1" />
      <Wire path="M 180 95 L 180 110" />
      {/* disch node (pin 7) — small elbow into the IC's upper-left pin */}
      <Junction at={[180, 110]} />
      <NodeLabel at={[140, 105]} text="disch" />
      <Wire path="M 180 110 L 205 110" />
      <Wire path="M 205 110 L 205 80" />
      <Wire path="M 205 80 L 225 80" />

      {/* R2 from disch node down to cap node */}
      <Wire path="M 180 110 L 180 125" />
      <Resistor a={[180, 125]} b={[180, 165]} label="R2" />

      {/* cap node (pins 2 + 6 tied) — feeds C to gnd and the IC */}
      <Junction at={[180, 170]} />
      <NodeLabel at={[152, 165]} text="cap" />
      <Wire path="M 180 170 L 205 170" />
      <Wire path="M 205 170 L 205 140" />
      <Wire path="M 205 140 L 225 140" />
      <Capacitor a={[180, 170]} b={[180, 200]} label="C" />
      <Wire path="M 180 200 L 180 215" />
      <Ground at={[180, 215]} />

      {/* OUT (pin 3) — right edge of IC at vertical centre, off to the right */}
      <Wire path="M 295 110 L 335 110" />
      <NodeLabel at={[323, 102]} text="out" />
    </Schematic>
  );
}

function fmtFreq(f: number): string {
  if (f >= 1e6) return `${(f / 1e6).toFixed(1)} MHz`;
  if (f >= 1e3) return `${(f / 1e3).toFixed(2)} kHz`;
  if (f >= 1) return `${f.toFixed(0)} Hz`;
  return `${(f * 1000).toFixed(0)} mHz`;
}
