/**
 * First-order active low-pass filter (inverting topology).
 *
 *           R_in
 *  Vin ─[ ]──┬──┐
 *            │  │  R_f
 *            │  ├──[ ]──┐
 *            │  │       │
 *            │  └──||───┤  C_f in parallel with R_f
 *            │       fb │
 *            │          │
 *           -─┐        │
 *  GND  ────+ ├────── Vout
 *           U1│
 *
 * Transfer function: H(s) = -R_f / (R_in · (1 + s·R_f·C_f))
 *
 * DC gain magnitude is R_f / R_in; the cap shorts the feedback at high
 * frequency, dropping the gain at -20 dB/decade above fc = 1/(2π·R_f·C_f).
 */
import { useCallback, useState } from "react";
import { CircuitBodeDemo, type BodeTrace } from "@/components/circuit/CircuitBodeDemo";
import type { CircuitParam } from "@/components/circuit/CircuitDemo";
import {
  Capacitor,
  Ground,
  Junction,
  NodeLabel,
  OpAmp,
  opAmpPins,
  Resistor,
  Schematic,
  VSource,
  Wire,
} from "@/components/circuit/schematic-prims";
import type { Circuit } from "@/sim/circuit";

const PARAMS: CircuitParam[] = [
  {
    id: "rinOhm",
    label: "R_in",
    min: 100,
    max: 10000,
    step: 100,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} kΩ` : `${v.toFixed(0)} Ω`),
  },
  {
    id: "rfOhm",
    label: "R_f",
    min: 1000,
    max: 100000,
    step: 1000,
    format: (v) => `${(v / 1000).toFixed(0)} kΩ`,
  },
  {
    id: "cfnF",
    label: "C_f",
    min: 0.1,
    max: 100,
    step: 0.1,
    format: (v) => (v >= 1 ? `${v.toFixed(1)} nF` : `${(v * 1000).toFixed(0)} pF`),
  },
];

const INITIAL: Record<string, number> = {
  rinOhm: 1000,
  rfOhm: 10000,
  cfnF: 1.59, // fc ≈ 10 kHz with R_f = 10 kΩ
};

export function ActiveLowPassDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [activeId, setActiveId] = useState<string | null>("gain");

  const build = useCallback((p: Record<string, number>): Circuit => {
    return {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "R", id: "rin", a: "vin", b: "sum", value: p.rinOhm },
        { kind: "OP", id: "u1", vplus: "gnd", vminus: "sum", vout: "vout" },
        { kind: "R", id: "rf", a: "vout", b: "sum", value: p.rfOhm },
        { kind: "C", id: "cf", a: "vout", b: "sum", value: p.cfnF * 1e-9 },
      ],
    };
  }, []);

  const dcGain = values.rfOhm / values.rinOhm;
  const fc = 1 / (2 * Math.PI * values.rfOhm * values.cfnF * 1e-9);

  const traces: BodeTrace[] = [
    {
      id: "gain",
      label: `|V_out / V_in| · ${dcGain.toFixed(1)}× DC`,
      color: "var(--color-accent)",
      extract: (p) => p.v.vout,
      schematic: <ActiveLpSchematic />,
    },
  ];

  return (
    <CircuitBodeDemo
      title={`Active low-pass · fc ≈ ${fmtFreq(fc)}`}
      build={build}
      inputs={{ vs: { mag: 1 } }}
      params={PARAMS}
      values={values}
      onChange={setValues}
      traces={traces}
      activeId={activeId}
      onActiveChange={setActiveId}
      fStart={1}
      fStop={1e7}
      nPoints={201}
      yScale="dB"
      yLabel="|gain| · dB"
    />
  );
}

function fmtFreq(f: number): string {
  if (f >= 1e6) return `${(f / 1e6).toFixed(2)} MHz`;
  if (f >= 1e3) return `${(f / 1e3).toFixed(2)} kHz`;
  return `${f.toFixed(0)} Hz`;
}

function ActiveLpSchematic() {
  // Use vPlusUp=false so V- is on top — keeps feedback wires above and the
  // ground reference clean at the bottom.
  const op = opAmpPins([200, 80], false);
  return (
    <Schematic width={350} height={170}>
      {/* Vin → R_in → sum (= V-) */}
      <Wire path="M 35 50 L 70 50" />
      <NodeLabel at={[55, 42]} text="vin" />
      <Resistor a={[70, 50]} b={[140, 50]} label="R_in" />
      <Wire path={`M 140 50 L ${op.minus[0]} 50`} />
      <Wire path={`M ${op.minus[0]} 50 L ${op.minus[0]} ${op.minus[1]}`} />
      <Junction at={[op.minus[0], 50]} />

      {/* Feedback R_f and C_f in parallel from vout to sum */}
      <Wire path={`M ${op.out[0]} ${op.out[1]} L 280 ${op.out[1]}`} />
      <NodeLabel at={[245, 72]} text="vout" />
      <Junction at={[280, op.out[1]]} />
      <Wire path={`M 280 ${op.out[1]} L 280 32`} />
      <Resistor a={[280, 32]} b={[op.minus[0], 32]} label="R_f" />
      <Wire path={`M 280 ${op.out[1]} L 280 110`} />
      <Capacitor a={[280, 110]} b={[op.minus[0], 110]} label="C_f" />
      <Wire path={`M ${op.minus[0]} 32 L ${op.minus[0]} 50`} />
      <Wire path={`M ${op.minus[0]} 50 L ${op.minus[0]} 110`} />

      {/* V+ to ground */}
      <Wire path={`M ${op.plus[0]} ${op.plus[1]} L ${op.plus[0]} 140`} />

      <OpAmp at={[200, 80]} label="U1" vPlusUp={false} />

      {/* Ground rail */}
      <Wire path="M 35 140 L 280 140" />
      <Wire path="M 280 140 L 280 110" />
      <VSource a={[35, 50]} b={[35, 140]} label="1V AC" />

      <Wire path="M 150 140 L 150 152" />
      <Ground at={[150, 152]} />
    </Schematic>
  );
}
