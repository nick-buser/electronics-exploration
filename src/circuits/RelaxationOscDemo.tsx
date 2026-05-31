/**
 * Relaxation oscillator built from a Schmitt trigger with hysteresis,
 * a resistor, and a capacitor. The Schmitt drives the cap through R;
 * the cap's voltage is what the Schmitt senses; the hysteresis between
 * the upper and lower thresholds is what stops the system from latching.
 *
 *  out ─[R]─ cap ─[C]─ gnd       in = cap
 *
 * Half-period for symmetric thresholds (vTh_high − vMid = vMid − vTh_low):
 *   T/2 = R·C · ln((V_swing + V_thWindow) / (V_swing − V_thWindow))
 * For vHigh=5, vLow=0, vTh = 5/3 and 10/3 (the 555-style 1/3 and 2/3
 * thresholds), T ≈ 2·R·C·ln(2) ≈ 1.39·R·C.
 *
 * Set vHigh < vLow on the Schmitt to get the inverting polarity the
 * relaxation oscillator topology requires (when the cap charges past
 * the upper threshold, the output drops, kicking off discharge).
 */
import { useCallback, useState } from "react";
import { CircuitDemo, type CircuitParam } from "@/components/circuit/CircuitDemo";
import {
  Capacitor,
  Ground,
  Junction,
  NodeLabel,
  Resistor,
  Schematic,
  Schmitt,
  schmittPins,
  VSource,
  Wire,
} from "@/components/circuit/schematic-prims";
import type { Circuit } from "@/sim/circuit";

const PARAMS: CircuitParam[] = [
  {
    id: "rKohm",
    label: "R",
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
    id: "vSupplyV",
    label: "V_supply",
    min: 2,
    max: 12,
    step: 0.5,
    format: (v) => `${v.toFixed(1)} V`,
  },
];

const INITIAL: Record<string, number> = {
  rKohm: 10,
  cNF: 100,
  vSupplyV: 5,
};

export function RelaxationOscDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);

  const build = useCallback((p: Record<string, number>): Circuit => {
    const Vs = p.vSupplyV;
    // 1/3 and 2/3 of supply — the canonical 555 thresholds.
    const vTl = Vs / 3;
    const vTh = (2 * Vs) / 3;
    return {
      elements: [
        { kind: "R", id: "rint", a: "out", b: "cap", value: p.rKohm * 1000 },
        { kind: "C", id: "cint", a: "cap", b: "gnd", value: p.cNF * 1e-9, ic: 0 },
        {
          kind: "XSCH",
          id: "u1",
          in: "cap",
          out: "out",
          vThHigh: vTh,
          vThLow: vTl,
          // Inverting: when input crosses up past vThHigh, output drops
          // to vHigh = 0; when input crosses down past vThLow, output
          // rises to vLow = V_supply.
          vHigh: 0,
          vLow: Vs,
        },
      ],
    };
  }, []);

  const Rval = values.rKohm * 1000;
  const Cval = values.cNF * 1e-9;
  const periodS = 2 * Rval * Cval * Math.log(2);
  const freqHz = 1 / periodS;
  // Show 4 cycles
  const duration = 4 * periodS;
  const dt = periodS / 800;

  return (
    <CircuitDemo
      title={`Relaxation oscillator · f ≈ ${fmtFreq(freqHz)} (T ≈ ${fmtTime(periodS)})`}
      build={build}
      params={PARAMS}
      values={values}
      onChange={setValues}
      probes={[
        { node: "cap", label: "V_cap (input)" },
        { node: "out", label: "V_out (output)" },
      ]}
      duration={duration}
      dt={dt}
      tUnit="ms"
      schematic={<RelaxOscSchematic />}
    />
  );
}

function RelaxOscSchematic() {
  const u = schmittPins([170, 80]);
  return (
    <Schematic width={320} height={180}>
      {/* Top rail: Schmitt output through R back to the cap */}
      <Wire path={`M ${u.out[0]} ${u.out[1]} L 250 80`} />
      <NodeLabel at={[210, 72]} text="out" />
      <Junction at={[250, 80]} />
      <Wire path="M 250 80 L 250 50" />
      <Resistor a={[250, 50]} b={[100, 50]} label="R" />
      <Wire path="M 100 50 L 100 80" />

      {/* The cap to ground, with the Schmitt's input tapping the same node */}
      <Junction at={[100, 80]} />
      <NodeLabel at={[58, 72]} text="cap" />
      <Wire path={`M 100 80 L ${u.in[0]} ${u.in[1]}`} />
      <Capacitor a={[100, 80]} b={[100, 140]} label="C" />
      <Wire path="M 100 140 L 100 160" />

      {/* Schmitt body */}
      <Schmitt at={[170, 80]} label="U1" />

      {/* Ground rail */}
      <Wire path="M 100 160 L 250 160" />
      <Wire path="M 175 160 L 175 172" />
      <Ground at={[175, 172]} />

      {/* Supply pseudo-source (just for visual context — the Schmitt has
          vLow set to V_supply so its output already encodes the rail). */}
      <VSource a={[40, 60]} b={[40, 140]} label="V_s" />
      <Wire path="M 40 140 L 100 140" />
      <Wire path="M 40 60 L 40 50" />
      <Wire path="M 40 50 L 100 50" />
    </Schematic>
  );
}

function fmtFreq(f: number): string {
  if (f >= 1e6) return `${(f / 1e6).toFixed(1)} MHz`;
  if (f >= 1e3) return `${(f / 1e3).toFixed(2)} kHz`;
  if (f >= 1) return `${f.toFixed(0)} Hz`;
  return `${(f * 1000).toFixed(0)} mHz`;
}

function fmtTime(t: number): string {
  if (t < 1e-6) return `${(t * 1e9).toFixed(0)} ns`;
  if (t < 1e-3) return `${(t * 1e6).toFixed(0)} µs`;
  if (t < 1) return `${(t * 1e3).toFixed(2)} ms`;
  return `${t.toFixed(2)} s`;
}
