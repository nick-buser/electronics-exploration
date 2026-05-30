/**
 * Non-inverting amplifier: gain = 1 + R_f / R_g.
 *
 * V_in → V+ of op-amp.
 * V- → R_g to ground and R_f to V_out.
 * The two resistors form a voltage divider from V_out down to V-, and the
 * op-amp pushes V_out until V- matches V+ = V_in. That picks off exactly
 * V_in · R_g/(R_g+R_f) at V-, so V_out = V_in · (R_g+R_f)/R_g = V_in (1 + R_f/R_g).
 */
import { useCallback, useState } from "react";
import { CircuitDemo, type CircuitParam } from "@/components/circuit/CircuitDemo";
import {
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
    id: "amp",
    label: "Vin amplitude",
    min: 50,
    max: 500,
    step: 10,
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
    id: "rgOhm",
    label: "R_g",
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
];

const INITIAL: Record<string, number> = {
  amp: 100,
  fHz: 1000,
  rgOhm: 1000,
  rfOhm: 9000,
};

export function NonInvertingAmpDemo() {
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
            amplitude: p.amp / 1000,
            frequency: p.fHz,
          },
        },
        { kind: "OP", id: "u1", vplus: "vin", vminus: "fb", vout: "vout" },
        { kind: "R", id: "rg", a: "fb", b: "gnd", value: p.rgOhm },
        { kind: "R", id: "rf", a: "vout", b: "fb", value: p.rfOhm },
        // Small load so the op-amp output node has somewhere to push current.
        { kind: "R", id: "rload", a: "vout", b: "gnd", value: 10000 },
      ],
    };
  }, []);

  const gain = 1 + values.rfOhm / values.rgOhm;
  const period = 1 / values.fHz;
  const duration = 4 * period;
  const dt = period / 200;

  return (
    <CircuitDemo
      title={`Non-inverting amp · gain = ${gain.toFixed(2)}×`}
      build={build}
      params={PARAMS}
      values={values}
      onChange={setValues}
      probes={[
        { node: "vin", label: "vin" },
        { node: "vout", label: "vout" },
      ]}
      duration={duration}
      dt={dt}
      tUnit="ms"
      schematic={<NonInvertingSchematic />}
    />
  );
}

function NonInvertingSchematic() {
  // Op-amp centered at (185, 60). Pins via the kit helper.
  const op = opAmpPins([185, 60], true);
  return (
    <Schematic width={340} height={170}>
      {/* Top rail from source to V+ */}
      <Wire path={`M 40 50 L ${op.plus[0]} 50`} />
      <Wire path={`M ${op.plus[0]} 50 L ${op.plus[0]} ${op.plus[1]}`} />
      <NodeLabel at={[80, 42]} text="vin" />

      <OpAmp at={[185, 60]} label="U1" />

      {/* Output → load and feedback */}
      <Wire path={`M ${op.out[0]} ${op.out[1]} L 270 60`} />
      <NodeLabel at={[230, 52]} text="vout" />
      <Junction at={[270, 60]} />

      {/* Feedback wire down from output, through R_f, to V- node */}
      <Wire path="M 270 60 L 270 110" />
      <Resistor a={[270, 110]} b={[160, 110]} label="R_f" />

      {/* V- pin down to feedback junction */}
      <Wire path={`M ${op.minus[0]} ${op.minus[1]} L 160 68`} />
      <Wire path="M 160 68 L 160 110" />
      <Junction at={[160, 110]} />

      {/* R_g from feedback junction to ground rail */}
      <Resistor a={[160, 110]} b={[160, 140]} label="R_g" />

      {/* Output load */}
      <Resistor a={[270, 60]} b={[300, 60]} label="R_L" />
      <Wire path="M 300 60 L 300 140" />

      {/* Bottom ground rail */}
      <Wire path="M 40 140 L 300 140" />
      <VSource a={[40, 50]} b={[40, 140]} label="Vin" />

      <Wire path="M 170 140 L 170 152" />
      <Ground at={[170, 152]} />
    </Schematic>
  );
}
