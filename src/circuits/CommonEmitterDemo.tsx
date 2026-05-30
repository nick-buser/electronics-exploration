/**
 * NPN common-emitter amplifier — the canonical small-signal BJT stage.
 *
 *           ┌── R_C ──┬── V_out
 *  V_CC ────┤         │
 *           │         C (collector)
 *           ├── R_B1 ─┤
 *           │         B (base) ──── C_in ──── V_in
 *           ├── R_B2 ─┤
 *           │         E (emitter)
 *  GND ─────┴── R_E ──┘
 *
 * R_B1 and R_B2 form a bias divider that sets the quiescent base voltage;
 * R_E is the emitter-degeneration resistor that stabilises bias and trades
 * gain for linearity; R_C is the collector load that converts the swinging
 * collector current into a voltage. C_in AC-couples the input so the
 * source can't disturb the bias point. Small-signal voltage gain is
 * approximately −R_C / R_E.
 */
import { useCallback, useState } from "react";
import { CircuitDemo, type CircuitParam } from "@/components/circuit/CircuitDemo";
import {
  Capacitor,
  Ground,
  Junction,
  NodeLabel,
  NpnBjt,
  bjtPins,
  Resistor,
  Schematic,
  VSource,
  Wire,
} from "@/components/circuit/schematic-prims";
import type { Circuit } from "@/sim/circuit";

const PARAMS: CircuitParam[] = [
  {
    id: "vinmV",
    label: "Vin amplitude",
    min: 5,
    max: 100,
    step: 1,
    format: (v) => `${v.toFixed(0)} mV`,
  },
  {
    id: "fHz",
    label: "Vin freq",
    min: 100,
    max: 5000,
    step: 50,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(2)} kHz` : `${v.toFixed(0)} Hz`),
  },
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
];

const INITIAL: Record<string, number> = {
  vinmV: 20,
  fHz: 1000,
  rcOhm: 3300,
  reOhm: 470,
};

export function CommonEmitterDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);

  const build = useCallback((p: Record<string, number>): Circuit => {
    return {
      elements: [
        // 9V rail
        { kind: "V", id: "vcc", a: "vcc", b: "gnd", wave: { kind: "dc", value: 9 } },
        // Bias divider (sets base around 1.5V)
        { kind: "R", id: "rb1", a: "vcc", b: "base", value: 47000 },
        { kind: "R", id: "rb2", a: "base", b: "gnd", value: 10000 },
        // AC-coupled signal input
        {
          kind: "V",
          id: "vs",
          a: "vin",
          b: "gnd",
          wave: {
            kind: "sine",
            offset: 0,
            amplitude: p.vinmV / 1000,
            frequency: p.fHz,
          },
        },
        { kind: "C", id: "cin", a: "vin", b: "base", value: 10e-6 },
        // BJT and bias network
        { kind: "R", id: "rc", a: "vcc", b: "coll", value: p.rcOhm },
        { kind: "R", id: "re", a: "emit", b: "gnd", value: p.reOhm },
        { kind: "Q", id: "q1", polarity: "npn", c: "coll", b: "base", e: "emit" },
      ],
    };
  }, []);

  const period = 1 / values.fHz;
  // Run long enough for the input cap to settle through the bias network,
  // then show 3 cycles of steady state.
  const duration = 0.02 + 3 * period;
  const dt = period / 200;
  const approxGain = values.rcOhm / values.reOhm;

  return (
    <CircuitDemo
      title={`Common-emitter amp · |gain| ≈ R_C / R_E = ${approxGain.toFixed(1)}×`}
      build={build}
      params={PARAMS}
      values={values}
      onChange={setValues}
      probes={[
        { node: "vin", label: "vin" },
        { node: "coll", label: "coll (V_C)" },
      ]}
      duration={duration}
      dt={dt}
      tUnit="ms"
      schematic={<CeSchematic />}
    />
  );
}

function CeSchematic() {
  const q = bjtPins([235, 95]);
  return (
    <Schematic width={360} height={210}>
      {/* Top V_CC rail */}
      <Wire path="M 60 30 L 320 30" />
      <NodeLabel at={[300, 22]} text="VCC" />

      {/* Bias divider R_B1 from VCC to base, R_B2 from base to gnd */}
      <Junction at={[180, 30]} />
      <Resistor a={[180, 30]} b={[180, 70]} label="R_B1" />
      <Wire path={`M 180 70 L 180 95 L ${q.b[0]} ${q.b[1]}`} />
      <Junction at={[180, 95]} />
      <Resistor a={[180, 95]} b={[180, 150]} label="R_B2" />
      <Wire path="M 180 150 L 180 180" />

      {/* R_C from VCC to collector */}
      <Resistor a={[235, 30]} b={[235, 70]} label="R_C" />
      <Wire path={`M ${q.c[0]} ${q.c[1]} L 235 70`} />
      <NodeLabel at={[265, 62]} text="coll" />

      {/* R_E from emitter to gnd */}
      <Resistor a={[q.e[0], q.e[1]]} b={[q.e[0], 165]} label="R_E" />
      <Wire path={`M ${q.e[0]} 165 L ${q.e[0]} 180`} />

      <NpnBjt at={[235, 95]} label="Q1" />

      {/* Input coupling cap + Vin source */}
      <Capacitor a={[110, 95]} b={[150, 95]} label="C_in" />
      <Wire path={`M 150 95 L 175 95`} />
      <NodeLabel at={[130, 88]} text="vin" />
      <Wire path="M 60 95 L 90 95" />
      <Wire path="M 90 95 L 110 95" />
      <VSource a={[60, 65]} b={[60, 95]} label="Vin" />
      <Wire path="M 60 95 L 60 180" />

      {/* VCC source */}
      <VSource a={[40, 30]} b={[40, 180]} label="VCC" />
      <Wire path="M 40 30 L 60 30" />
      <Wire path="M 60 30 L 60 65" />

      {/* Ground rail */}
      <Wire path="M 40 180 L 235 180" />
      <Wire path="M 140 180 L 140 192" />
      <Ground at={[140, 192]} />
    </Schematic>
  );
}
