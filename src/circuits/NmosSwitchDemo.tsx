/**
 * NMOS as a low-side switch driving a load (e.g. an LED+resistor or a relay
 * coil simplified to R_L). Vgate swings between 0V (off) and 5V (on); the
 * load sees ~0V across it when off and ~V_supply when on.
 *
 *   V_supply ──── R_load ─── drain
 *                              │
 *                              ┤├   (NMOS, gate driven by V_gate)
 *                              │
 *                            source ── GND
 *
 * The classic "MCU pin can't drive enough current — use a FET" use case.
 */
import { useCallback, useState } from "react";
import { CircuitDemo, type CircuitParam } from "@/components/circuit/CircuitDemo";
import {
  Ground,
  NodeLabel,
  Nmos,
  mosPins,
  Resistor,
  Schematic,
  VSource,
  Wire,
} from "@/components/circuit/schematic-prims";
import type { Circuit } from "@/sim/circuit";

const PARAMS: CircuitParam[] = [
  {
    id: "vSupply",
    label: "V_supply",
    min: 3,
    max: 12,
    step: 0.5,
    format: (v) => `${v.toFixed(1)} V`,
  },
  {
    id: "rLoadOhm",
    label: "R_load",
    min: 20,
    max: 1000,
    step: 10,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} kΩ` : `${v.toFixed(0)} Ω`),
  },
  {
    id: "fHz",
    label: "Gate freq",
    min: 1,
    max: 100,
    step: 1,
    format: (v) => `${v.toFixed(0)} Hz`,
  },
  {
    id: "dutyPct",
    label: "Gate duty",
    min: 10,
    max: 90,
    step: 1,
    format: (v) => `${v.toFixed(0)} %`,
  },
];

const INITIAL: Record<string, number> = {
  vSupply: 5,
  rLoadOhm: 100,
  fHz: 20,
  dutyPct: 50,
};

export function NmosSwitchDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);

  const build = useCallback((p: Record<string, number>): Circuit => {
    return {
      elements: [
        { kind: "V", id: "vdd", a: "vdd", b: "gnd", wave: { kind: "dc", value: p.vSupply } },
        {
          kind: "V",
          id: "vgg",
          a: "gate",
          b: "gnd",
          wave: {
            kind: "pulse",
            period: 1 / p.fHz,
            duty: p.dutyPct / 100,
            vLo: 0,
            vHi: 5,
          },
        },
        { kind: "R", id: "rl", a: "vdd", b: "drain", value: p.rLoadOhm },
        { kind: "M", id: "m1", polarity: "nmos", d: "drain", g: "gate", s: "gnd" },
      ],
    };
  }, []);

  const period = 1 / values.fHz;
  // Show 2.5 cycles
  const duration = 2.5 * period;
  const dt = period / 400;

  return (
    <CircuitDemo
      title={`NMOS low-side switch · ${values.fHz}Hz square at gate`}
      build={build}
      params={PARAMS}
      values={values}
      onChange={setValues}
      probes={[
        { node: "gate", label: "gate" },
        { node: "drain", label: "drain (V_DS)" },
      ]}
      duration={duration}
      dt={dt}
      tUnit="ms"
      schematic={<NmosSchematic />}
    />
  );
}

function NmosSchematic() {
  const m = mosPins([220, 110]);
  return (
    <Schematic width={340} height={210}>
      {/* V_supply rail */}
      <Wire path="M 60 30 L 280 30" />
      <NodeLabel at={[255, 22]} text="V_supply" />

      {/* R_load from rail to drain */}
      <Resistor a={[220, 30]} b={[220, 75]} label="R_load" />
      <Wire path={`M 220 75 L ${m.d[0]} ${m.d[1]}`} />
      <NodeLabel at={[245, 65]} text="drain" />

      {/* MOSFET */}
      <Nmos at={[220, 110]} label="M1" />

      {/* Source to ground */}
      <Wire path={`M ${m.s[0]} ${m.s[1]} L ${m.s[0]} 180`} />

      {/* Gate driver: pulse source between gate and gnd */}
      <Wire path={`M 100 110 L ${m.g[0]} ${m.g[1]}`} />
      <NodeLabel at={[130, 102]} text="gate" />
      <VSource a={[80, 110]} b={[80, 180]} label="Vg" />
      <Wire path="M 80 110 L 100 110" />

      {/* V_supply source */}
      <VSource a={[40, 30]} b={[40, 180]} label="V+" />
      <Wire path="M 40 30 L 60 30" />

      {/* Ground rail */}
      <Wire path="M 40 180 L 220 180" />
      <Wire path="M 130 180 L 130 192" />
      <Ground at={[130, 192]} />
    </Schematic>
  );
}
