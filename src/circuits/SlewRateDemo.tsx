/**
 * Slew-rate demo: voltage follower fed a square wave. Compare the small-
 * signal "infinite slew" trace (GBW-limited only) with the slew-limited
 * version side by side. With a fast enough step or low enough slew, the
 * output ramps linearly at ±SR instead of tracking the input.
 *
 * The simulator's slew handler is an outer loop on top of Newton: each
 * step solves with the normal finite-GBW stamp, checks whether V_out
 * moved by more than dt·SR, and if so swaps in a forced V_out = V_prev
 * ± dt·SR stamp and re-solves. Settles in 1–2 outer passes.
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
    id: "ampV",
    label: "Step amplitude",
    min: 0.5,
    max: 10,
    step: 0.5,
    format: (v) => `${v.toFixed(1)} V`,
  },
  {
    id: "fkHz",
    label: "Square freq",
    min: 1,
    max: 200,
    step: 1,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} MHz` : `${v.toFixed(0)} kHz`),
  },
  {
    id: "srVuS",
    label: "SR",
    min: 0.1,
    max: 50,
    step: 0.1,
    format: (v) => `${v.toFixed(1)} V/µs`,
  },
  {
    id: "gbwMHz",
    label: "GBW",
    min: 1,
    max: 100,
    step: 1,
    format: (v) => `${v.toFixed(0)} MHz`,
  },
];

const INITIAL: Record<string, number> = {
  ampV: 5,
  fkHz: 50,
  srVuS: 1,
  gbwMHz: 10,
};

export function SlewRateDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);

  const build = useCallback((p: Record<string, number>): Circuit => {
    return {
      elements: [
        // Pulse source feeds V+; output drives V- (unity-gain buffer).
        {
          kind: "V",
          id: "vs",
          a: "vin",
          b: "gnd",
          wave: {
            kind: "pulse",
            period: 1 / (p.fkHz * 1000),
            duty: 0.5,
            vLo: -p.ampV,
            vHi: p.ampV,
          },
        },
        {
          kind: "OP",
          id: "u1",
          vplus: "vin",
          vminus: "vout",
          vout: "vout",
          A0: 1e5,
          GBW: p.gbwMHz * 1e6,
          SR: p.srVuS * 1e6,
        },
      ],
    };
  }, []);

  // Show two periods of the square wave with tight enough dt to catch
  // the slew ramp cleanly.
  const period = 1 / (values.fkHz * 1000);
  const duration = 2 * period;
  const dt = period / 2000;

  return (
    <CircuitDemo
      title={`Voltage follower · SR = ${values.srVuS.toFixed(1)} V/µs · max dV_in/dt ≈ ${(2 * values.ampV * values.fkHz).toFixed(0)} V/ms (avg)`}
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
      tUnit="us"
      schematic={<SlewSchematic />}
    />
  );
}

function SlewSchematic() {
  const op = opAmpPins([180, 90], true);
  return (
    <Schematic width={320} height={170}>
      {/* Input source to V+ */}
      <Wire path={`M 40 50 L ${op.plus[0]} 50`} />
      <Wire path={`M ${op.plus[0]} 50 L ${op.plus[0]} ${op.plus[1]}`} />
      <NodeLabel at={[80, 42]} text="vin" />

      <OpAmp at={[180, 90]} label="U1" />

      {/* Output → load + feedback (unity gain follower: V_out = V−) */}
      <Wire path={`M ${op.out[0]} ${op.out[1]} L 270 90`} />
      <NodeLabel at={[230, 82]} text="vout" />
      <Junction at={[270, 90]} />

      {/* Feedback wire from output to V- */}
      <Wire path="M 270 90 L 270 130" />
      <Wire path={`M ${op.minus[0]} ${op.minus[1]} L 150 130 L 270 130`} />

      {/* Output load */}
      <Resistor a={[270, 90]} b={[300, 90]} label="R_L" />
      <Wire path="M 300 90 L 300 150" />

      {/* Bottom rail + source */}
      <Wire path="M 40 150 L 300 150" />
      <VSource a={[40, 50]} b={[40, 150]} label="Vin" />

      <Wire path="M 160 150 L 160 162" />
      <Ground at={[160, 162]} />
    </Schematic>
  );
}
