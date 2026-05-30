/**
 * Half-wave rectifier with smoothing cap.
 *
 *   Vin ───[ D ]──┬──── Vout
 *                 │
 *                 ├── [ C_smooth ] ── GND
 *                 │
 *                 └── [ R_load ] ─── GND
 *
 * The cap charges through the diode on each positive peak of Vin, then
 * holds Vout up while it discharges through the load between peaks.
 * Watch R · C vs the input period: small RC → big ripple, large RC → near-flat DC.
 */
import { useCallback, useState } from "react";
import { CircuitDemo, type CircuitParam } from "@/components/circuit/CircuitDemo";
import {
  Capacitor,
  Diode,
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
    id: "amp",
    label: "Vin peak",
    min: 1,
    max: 12,
    step: 0.5,
    format: (v) => `${v.toFixed(1)} V`,
  },
  {
    id: "fHz",
    label: "Vin freq",
    min: 50,
    max: 1000,
    step: 10,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(2)} kHz` : `${v.toFixed(0)} Hz`),
  },
  {
    id: "rLoadOhm",
    label: "R_load",
    min: 200,
    max: 20000,
    step: 100,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} kΩ` : `${v.toFixed(0)} Ω`),
  },
  {
    id: "cSmoothuF",
    label: "C_smooth",
    min: 0.1,
    max: 100,
    step: 0.1,
    format: (v) => (v >= 1 ? `${v.toFixed(1)} µF` : `${(v * 1000).toFixed(0)} nF`),
  },
];

const INITIAL: Record<string, number> = {
  amp: 5,
  fHz: 60,
  rLoadOhm: 10000,
  cSmoothuF: 10,
};

export function RectifierDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);

  const build = useCallback((p: Record<string, number>): Circuit => {
    return {
      elements: [
        {
          kind: "V",
          id: "vs",
          a: "vin",
          b: "gnd",
          wave: {
            kind: "sine",
            offset: 0,
            amplitude: p.amp,
            frequency: p.fHz,
          },
        },
        { kind: "D", id: "d1", a: "vin", b: "vout" },
        { kind: "R", id: "rload", a: "vout", b: "gnd", value: p.rLoadOhm },
        { kind: "C", id: "csm", a: "vout", b: "gnd", value: p.cSmoothuF * 1e-6 },
      ],
    };
  }, []);

  const period = 1 / values.fHz;
  // Show 4 input cycles. Tight enough timestep that diode edges stay clean.
  const duration = 4 * period;
  const dt = period / 400;
  const tau = values.rLoadOhm * values.cSmoothuF * 1e-6;
  const tauMs = tau * 1000;

  return (
    <CircuitDemo
      title={`Half-wave rectifier · τ = ${tauMs.toFixed(1)} ms (R·C)`}
      build={build}
      params={PARAMS}
      values={values}
      onChange={setValues}
      probes={[
        { node: "vin", label: "vin (sine)" },
        { node: "vout", label: "vout (filtered)" },
      ]}
      duration={duration}
      dt={dt}
      tUnit="ms"
      schematic={<RectifierSchematic />}
    />
  );
}

function RectifierSchematic() {
  return (
    <Schematic width={340} height={170}>
      {/* Top rail */}
      <Wire path="M 40 50 L 100 50" />
      <Diode a={[100, 50]} b={[180, 50]} label="D" />
      <Wire path="M 180 50 L 260 50" />
      <Junction at={[220, 50]} />
      <NodeLabel at={[80, 42]} text="vin" />
      <NodeLabel at={[245, 42]} text="vout" />

      {/* Smoothing cap to ground */}
      <Capacitor a={[220, 50]} b={[220, 110]} label="C_s" />
      <Wire path="M 220 110 L 220 140" />

      {/* Load resistor to ground */}
      <Resistor a={[280, 50]} b={[280, 110]} label="R_L" />
      <Wire path="M 280 110 L 280 140" />
      <Wire path="M 260 50 L 280 50" />

      {/* Bottom rail + source */}
      <Wire path="M 40 140 L 280 140" />
      <VSource a={[40, 50]} b={[40, 140]} label="Vin" />

      <Wire path="M 160 140 L 160 152" />
      <Ground at={[160, 152]} />
    </Schematic>
  );
}
