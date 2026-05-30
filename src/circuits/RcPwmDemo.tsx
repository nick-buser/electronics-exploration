/**
 * PWM source charging an RC low-pass.
 *
 * Source: square wave 0 / 3.3V at the chosen frequency and duty
 * Load:   series R into capacitor to ground
 * Probes: vin (the raw PWM) and vout (after the RC filter)
 *
 * Visualises why "average voltage" is something the load actually sees:
 * crank R*C up relative to the period and vout flattens into a DC level
 * proportional to duty cycle.
 */
import { useState, useCallback } from "react";
import { CircuitDemo, type CircuitParam } from "@/components/circuit/CircuitDemo";
import {
  Capacitor,
  Ground,
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
    id: "duty",
    label: "Duty",
    min: 5,
    max: 95,
    step: 1,
    unit: "%",
  },
  {
    id: "fkHz",
    label: "PWM freq",
    min: 0.5,
    max: 10,
    step: 0.5,
    unit: "kHz",
    format: (v) => v.toFixed(1),
  },
  {
    id: "rOhm",
    label: "R",
    min: 100,
    max: 10000,
    step: 100,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}kΩ` : `${v.toFixed(0)}Ω`),
  },
  {
    id: "cNf",
    label: "C",
    min: 1,
    max: 1000,
    step: 1,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}µF` : `${v.toFixed(0)}nF`),
  },
];

const INITIAL: Record<string, number> = {
  duty: 35,
  fkHz: 2,
  rOhm: 1000,
  cNf: 100,
};

export function RcPwmDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);

  const build = useCallback((p: Record<string, number>): Circuit => {
    const freq = p.fkHz * 1000; // Hz
    const period = 1 / freq;
    const R = p.rOhm;
    const C = p.cNf * 1e-9;
    return {
      elements: [
        {
          kind: "V",
          id: "vs",
          a: "vin",
          b: "gnd",
          wave: { kind: "pulse", period, duty: p.duty / 100, vLo: 0, vHi: 3.3 },
        },
        { kind: "R", id: "r1", a: "vin", b: "vout", value: R },
        { kind: "C", id: "c1", a: "vout", b: "gnd", value: C },
      ],
    };
  }, []);

  // Show ~5 PWM cycles at the chosen frequency, with a tight dt so the
  // square edges stay sharp even at high R*C.
  const period = 1 / (values.fkHz * 1000);
  const duration = 5 * period;
  const dt = period / 200;

  return (
    <CircuitDemo
      title="PWM through an RC low-pass"
      build={build}
      params={PARAMS}
      values={values}
      onChange={setValues}
      probes={[
        { node: "vin", label: "vin (raw PWM)" },
        { node: "vout", label: "vout (filtered)" },
      ]}
      duration={duration}
      dt={dt}
      tUnit="ms"
      schematic={<RcPwmSchematic />}
    />
  );
}

function RcPwmSchematic() {
  // Layout in a 320x150 viewBox, 20px grid:
  //   VSource at x=50, vertical pin spacing 80
  //   Wire over to (150, 40), Resistor 150..210, Wire to (260, 40)
  //   Capacitor at (260, 40)..(260, 100), Ground below
  //   Bottom rail from (50, 120) across to (260, 120)
  return (
    <Schematic width={320} height={150}>
      {/* Top rail from source to R */}
      <Wire path="M 50 40 L 130 40" />
      <Resistor a={[130, 40]} b={[200, 40]} label="R" value="1kΩ" />
      <Wire path="M 200 40 L 260 40" />
      <NodeLabel at={[78, 32]} text="vin" />
      <NodeLabel at={[232, 32]} text="vout" />
      <Junction at={[260, 40]} />

      {/* Cap to ground */}
      <Capacitor a={[260, 40]} b={[260, 100]} label="C" value="100nF" />
      <Wire path="M 260 100 L 260 120" />

      {/* Bottom rail */}
      <Wire path="M 50 120 L 260 120" />

      {/* Source */}
      <VSource a={[50, 40]} b={[50, 120]} label="PWM" />

      {/* Ground at center bottom */}
      <Junction at={[155, 120]} />
      <Wire path="M 155 120 L 155 130" />
      <Ground at={[155, 130]} />
    </Schematic>
  );
}
