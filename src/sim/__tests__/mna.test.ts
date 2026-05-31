import { describe, expect, it } from "vitest";
import type { Circuit } from "../circuit";
import { dcOperatingPoint, runTransient } from "../transient";

describe("Op-amp slew rate", () => {
  it("voltage follower clamps dV_out/dt at +SR for a positive step", () => {
    // Buffer fed a 0 → 5V step at t=0. SR = 1 V/µs → output should ramp
    // linearly at 1 V/µs for 5 µs, then settle at 5V. Without SR the
    // output would track the step within roughly 1/GBW = 100 ns.
    const SR = 1e6; // 1 V/µs
    const c: Circuit = {
      elements: [
        {
          kind: "V",
          id: "vs",
          a: "vin",
          b: "gnd",
          wave: { kind: "step", t0: 0, v0: 0, v1: 5 },
        },
        {
          kind: "OP",
          id: "u1",
          vplus: "vin",
          vminus: "vout",
          vout: "vout",
          A0: 1e5,
          GBW: 10e6,
          SR,
        },
      ],
    };
    // Sample at 100 ns dt out to 10 µs
    const samples = runTransient(c, { duration: 10e-6, dt: 1e-7 });
    // At t = 2 µs, output should be ~2 V (2 µs · 1 V/µs)
    const at2us = samples.find((s) => s.t >= 2e-6);
    expect(at2us).toBeDefined();
    expect(at2us!.v.vout).toBeGreaterThan(1.8);
    expect(at2us!.v.vout).toBeLessThan(2.2);
    // At t = 5 µs, output is approaching 5V (about there)
    const at5us = samples.find((s) => s.t >= 5e-6);
    expect(at5us!.v.vout).toBeGreaterThan(4.5);
    expect(at5us!.v.vout).toBeLessThanOrEqual(5.05);
    // After the ramp completes, output settles at 5V
    const final = samples[samples.length - 1];
    expect(final.v.vout).toBeGreaterThan(4.95);
    expect(final.v.vout).toBeLessThan(5.05);
  });

  it("without SR, the same buffer follows the step within a few µs (GBW-limited)", () => {
    // Same circuit but no SR — output should reach 5V within a couple of
    // GBW-defined time constants (~1/(2π·GBW) for a unity-gain buffer,
    // or ~16 ns at GBW=10 MHz).
    const c: Circuit = {
      elements: [
        {
          kind: "V",
          id: "vs",
          a: "vin",
          b: "gnd",
          wave: { kind: "step", t0: 0, v0: 0, v1: 5 },
        },
        {
          kind: "OP",
          id: "u1",
          vplus: "vin",
          vminus: "vout",
          vout: "vout",
          A0: 1e5,
          GBW: 10e6,
        },
      ],
    };
    const samples = runTransient(c, { duration: 2e-6, dt: 1e-8 });
    // By 1 µs the output should be settled at the step value
    const at1us = samples.find((s) => s.t >= 1e-6);
    expect(at1us!.v.vout).toBeGreaterThan(4.9);
  });

  it("slew rate kicks in symmetrically on a negative step", () => {
    const SR = 0.5e6; // 0.5 V/µs
    const c: Circuit = {
      elements: [
        {
          kind: "V",
          id: "vs",
          a: "vin",
          b: "gnd",
          // Step from +5V down to -5V at t=0
          wave: { kind: "step", t0: 0, v0: 5, v1: -5 },
        },
        {
          kind: "OP",
          id: "u1",
          vplus: "vin",
          vminus: "vout",
          vout: "vout",
          A0: 1e5,
          GBW: 10e6,
          SR,
        },
      ],
    };
    // V_out starts at 0V (runTransient doesn't pre-seed) and slews down
    // toward V_in = -5V at 0.5 V/µs → reaches -5V at t = 10 µs.
    const samples = runTransient(c, { duration: 15e-6, dt: 1e-7 });
    // At t = 5 µs, mid-ramp: V_out ≈ -2.5 V
    const mid = samples.find((s) => s.t >= 5e-6);
    expect(mid!.v.vout).toBeGreaterThan(-3);
    expect(mid!.v.vout).toBeLessThan(-2);
    // Fully settled by the end
    const final = samples[samples.length - 1];
    expect(final.v.vout).toBeLessThan(-4.9);
    expect(final.v.vout).toBeGreaterThan(-5.05);
  });
});

describe("MNA DC analysis", () => {
  it("solves a voltage divider", () => {
    // 10V across two equal 1k resistors → 5V at the midpoint
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 10 } },
        { kind: "R", id: "r1", a: "vin", b: "mid", value: 1000 },
        { kind: "R", id: "r2", a: "mid", b: "gnd", value: 1000 },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.v.vin).toBeCloseTo(10, 6);
    expect(r.v.mid).toBeCloseTo(5, 6);
    expect(r.v.gnd).toBe(0);
    // Source supplies 10 / 2k = 5 mA; sign is the current exiting node a, i.e. -5 mA
    expect(r.i.vs).toBeCloseTo(-5e-3, 9);
  });

  it("solves an asymmetric divider", () => {
    // 3.3V across 4.7k + 10k → mid sits at 3.3 * 10k / 14.7k
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 3.3 } },
        { kind: "R", id: "r1", a: "vin", b: "mid", value: 4700 },
        { kind: "R", id: "r2", a: "mid", b: "gnd", value: 10000 },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.v.mid).toBeCloseTo((3.3 * 10000) / 14700, 6);
  });
});

describe("MNA transient — RC charging", () => {
  it("approaches Vfinal with the textbook time constant", () => {
    // Step source 0 -> 5V through R=1k into C=1µF. tau = 1ms.
    // After 5 tau (= 5ms) we should be within ~0.7% of 5V.
    const c: Circuit = {
      elements: [
        {
          kind: "V",
          id: "vs",
          a: "vin",
          b: "gnd",
          wave: { kind: "step", t0: 0, v0: 0, v1: 5 },
        },
        { kind: "R", id: "r", a: "vin", b: "vout", value: 1000 },
        { kind: "C", id: "c", a: "vout", b: "gnd", value: 1e-6 },
      ],
    };
    const tau = 1e-3;
    const samples = runTransient(c, { duration: 5 * tau, dt: 1e-6 });
    const last = samples[samples.length - 1];
    expect(last.v.vout).toBeGreaterThan(4.96);
    expect(last.v.vout).toBeLessThan(5.01);

    // At t ≈ tau, Vout should be ≈ 5 * (1 - 1/e) ≈ 3.1606V.
    // Implicit Euler under-shoots a little; accept a 5% tolerance.
    const atTau = samples.find((s) => s.t >= tau);
    expect(atTau).toBeDefined();
    expect(atTau!.v.vout).toBeGreaterThan(3.0);
    expect(atTau!.v.vout).toBeLessThan(3.25);
  });

  it("treats a capacitor as open under DC", () => {
    // DC source with C to ground — node should still hit Vsrc since no current flows.
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 2.5 } },
        { kind: "R", id: "r", a: "vin", b: "vout", value: 1000 },
        { kind: "C", id: "c", a: "vout", b: "gnd", value: 100e-9 },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.v.vout).toBeCloseTo(2.5, 6);
  });

  it("treats an inductor as a short under DC", () => {
    // V source through R, then L to ground. The L's a side is the only
    // place the resistor delivers current to; at DC it sinks straight to gnd.
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "R", id: "r", a: "vin", b: "mid", value: 100 },
        { kind: "L", id: "l", a: "mid", b: "gnd", value: 1e-3 },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.v.mid).toBeCloseTo(0, 6); // L is a short → mid sits at ground
    expect(r.il.l).toBeCloseTo(0.05, 6); // 5V / 100Ω = 50 mA flowing into the inductor
  });
});

describe("MNA — op-amp configurations", () => {
  it("voltage follower: V_out = V_in", () => {
    // Vin -> v+, v- shorted to vout (unity-gain buffer)
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 2.7 } },
        { kind: "OP", id: "u1", vplus: "vin", vminus: "vout", vout: "vout" },
        { kind: "R", id: "rload", a: "vout", b: "gnd", value: 1000 },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.v.vout).toBeCloseTo(2.7, 6);
    // Op-amp sources 2.7 mA into the 1kΩ load; the V-source-style sign
    // convention reports that as a negative branch current.
    expect(r.iop.u1).toBeCloseTo(-2.7e-3, 6);
  });

  it("non-inverting amplifier: gain = 1 + R_f/R_g", () => {
    // Vin = 100 mV, R_g = 1k, R_f = 9k → gain = 10 → Vout = 1.0V
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0.1 } },
        { kind: "OP", id: "u1", vplus: "vin", vminus: "fb", vout: "vout" },
        { kind: "R", id: "rg", a: "fb", b: "gnd", value: 1000 },
        { kind: "R", id: "rf", a: "vout", b: "fb", value: 9000 },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.v.vout).toBeCloseTo(1.0, 6);
    expect(r.v.fb).toBeCloseTo(0.1, 6); // golden-rule constraint: V- = V+
  });

  it("inverting amplifier: gain = -R_f/R_in", () => {
    // Vin = 1V, R_in = 1k, R_f = 5k → gain = -5 → Vout = -5V
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 1 } },
        { kind: "R", id: "rin", a: "vin", b: "summing", value: 1000 },
        { kind: "OP", id: "u1", vplus: "gnd", vminus: "summing", vout: "vout" },
        { kind: "R", id: "rf", a: "vout", b: "summing", value: 5000 },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.v.vout).toBeCloseTo(-5.0, 6);
    expect(r.v.summing).toBeCloseTo(0, 6); // virtual ground
  });
});

describe("MNA — finite-GBW op-amp (DC)", () => {
  it("voltage follower DC gain is A0/(A0+1)", () => {
    // With A0 = 1000, the closed-loop DC gain of a unity-gain buffer is
    // A0 / (A0 + 1) ≈ 0.999 — slightly less than the ideal 1.0.
    const A0 = 1000;
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 1 } },
        { kind: "OP", id: "u1", vplus: "vin", vminus: "vout", vout: "vout", A0, GBW: 1e6 },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.v.vout).toBeCloseTo(A0 / (A0 + 1), 5);
  });

  it("with very large A0, finite-GBW indistinguishable from ideal at DC", () => {
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 2.7 } },
        { kind: "OP", id: "u1", vplus: "vin", vminus: "fb", vout: "vout", A0: 1e6, GBW: 1e6 },
        { kind: "R", id: "rg", a: "fb", b: "gnd", value: 1000 },
        { kind: "R", id: "rf", a: "vout", b: "fb", value: 9000 },
      ],
    };
    const r = dcOperatingPoint(c);
    // Ideal gain = 10, V_out = 27. Finite at A0=1e6 should be within ppm.
    expect(r.v.vout).toBeCloseTo(27, 3);
  });
});

describe("MNA — BJT (Ebers-Moll, Newton iteration)", () => {
  it("NPN common-emitter sets I_C ≈ β · I_B in forward active", () => {
    // 5V rail through 470kΩ into base, 1kΩ from collector to rail, emitter
    // to ground. Base current should set up the active-region operating
    // point with I_C around β·I_B.
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vcc", a: "vcc", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "R", id: "rb", a: "vcc", b: "base", value: 470000 },
        { kind: "R", id: "rc", a: "vcc", b: "coll", value: 1000 },
        { kind: "Q", id: "q1", polarity: "npn", c: "coll", b: "base", e: "gnd" },
      ],
    };
    const r = dcOperatingPoint(c);
    // V_BE in the active-region range
    expect(r.vbe.q1).toBeGreaterThan(0.55);
    expect(r.vbe.q1).toBeLessThan(0.8);
    // I_C >> I_B (forward active)
    expect(r.ic.q1).toBeGreaterThan(0);
    expect(r.ib.q1).toBeGreaterThan(0);
    const beta = r.ic.q1 / r.ib.q1;
    // Default β_F = 200; expect β reasonably close
    expect(beta).toBeGreaterThan(100);
    expect(beta).toBeLessThan(300);
    // KCL closure: I_C + I_B + I_E ≈ 0
    expect(Math.abs(r.ic.q1 + r.ib.q1 + r.ie.q1)).toBeLessThan(1e-9);
  });

  it("PNP mirrors NPN — currents flip sign for the same biasing topology", () => {
    // PNP with emitter at +5V, base at +5V through 470kΩ from gnd, collector
    // through 1kΩ to gnd. In active region, I_E > 0 (into emitter from rail),
    // I_C < 0 (out of collector to load), I_B < 0 (out of base).
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vcc", a: "vcc", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "R", id: "rb", a: "base", b: "gnd", value: 470000 },
        { kind: "R", id: "rc", a: "coll", b: "gnd", value: 1000 },
        { kind: "Q", id: "q1", polarity: "pnp", c: "coll", b: "base", e: "vcc" },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.vbe.q1).toBeGreaterThan(-0.8); // negative for PNP active
    expect(r.vbe.q1).toBeLessThan(-0.55);
    expect(r.ic.q1).toBeLessThan(0); // out of collector
    expect(r.ib.q1).toBeLessThan(0); // out of base
    expect(r.ie.q1).toBeGreaterThan(0); // into emitter
    expect(Math.abs(r.ic.q1 + r.ib.q1 + r.ie.q1)).toBeLessThan(1e-9);
  });

  it("NPN with zero base drive sits in cutoff", () => {
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vcc", a: "vcc", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "R", id: "rc", a: "vcc", b: "coll", value: 1000 },
        { kind: "R", id: "rb", a: "base", b: "gnd", value: 100000 },
        { kind: "Q", id: "q1", polarity: "npn", c: "coll", b: "base", e: "gnd" },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(Math.abs(r.ic.q1)).toBeLessThan(1e-6);
    expect(r.v.coll).toBeGreaterThan(4.9); // collector pulled up by rc
  });
});

describe("MNA — MOSFET (Shichman-Hodges, Newton iteration)", () => {
  it("NMOS in cutoff passes essentially no drain current", () => {
    // V_GS = 0.5V which is well below the default Vth of 1.5V → cutoff.
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vdd", a: "vdd", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "V", id: "vgg", a: "gate", b: "gnd", wave: { kind: "dc", value: 0.5 } },
        { kind: "R", id: "rd", a: "vdd", b: "drain", value: 1000 },
        { kind: "M", id: "m1", polarity: "nmos", d: "drain", g: "gate", s: "gnd" },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(Math.abs(r.idmos.m1)).toBeLessThan(1e-9);
    expect(r.v.drain).toBeGreaterThan(4.99); // R_D drops almost nothing
  });

  it("NMOS in saturation: I_D = K/2 · (V_GS - Vth)²", () => {
    // V_GS = 3V, Vth = 1.5V, K = 0.05 → expected I_D = 0.05/2 · 1.5² = 56.25 mA
    // But that'd drop 56V across a 1k load, so use a 50Ω load instead.
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vdd", a: "vdd", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "V", id: "vgg", a: "gate", b: "gnd", wave: { kind: "dc", value: 3 } },
        { kind: "R", id: "rd", a: "vdd", b: "drain", value: 50 },
        { kind: "M", id: "m1", polarity: "nmos", d: "drain", g: "gate", s: "gnd" },
      ],
    };
    const r = dcOperatingPoint(c);
    // Self-consistency: I_D · R_D + V_D = 5 (KCL/KVL)
    expect(r.idmos.m1 * 50 + r.v.drain).toBeCloseTo(5, 3);
    // V_GS - Vth = 1.5; if MOSFET were in saturation alone (no load) the
    // current would be 56 mA. With a 50Ω drop, V_D falls into triode region.
    // Either way, I_D should be tens of mA.
    expect(r.idmos.m1).toBeGreaterThan(0.02);
    expect(r.idmos.m1).toBeLessThan(0.06);
  });

  it("NMOS used as a switch: high gate drains load, low gate doesn't", () => {
    // High side: 5V rail → 100Ω load → drain. Gate driven to 5V (on) then
    // to 0V (off). Compare both operating points.
    const buildWithVg = (vg: number): Circuit => ({
      elements: [
        { kind: "V", id: "vdd", a: "vdd", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "V", id: "vgg", a: "gate", b: "gnd", wave: { kind: "dc", value: vg } },
        { kind: "R", id: "rl", a: "vdd", b: "drain", value: 100 },
        { kind: "M", id: "m1", polarity: "nmos", d: "drain", g: "gate", s: "gnd" },
      ],
    });
    const on = dcOperatingPoint(buildWithVg(5));
    const off = dcOperatingPoint(buildWithVg(0));
    // ON: current flowing, drain pulled close to gnd
    expect(on.idmos.m1).toBeGreaterThan(0.04);
    expect(on.v.drain).toBeLessThan(1); // R_DS(on) tiny vs 100Ω load
    // OFF: no current, drain held at supply
    expect(Math.abs(off.idmos.m1)).toBeLessThan(1e-9);
    expect(off.v.drain).toBeGreaterThan(4.99);
  });
});

describe("MNA — diodes (Newton iteration)", () => {
  it("forward bias: V_D + I·R = V_src and I matches the Shockley equation", () => {
    // 5V source through 1kΩ into a 1N4148-ish diode to ground. Expected
    // operating point: V_D ≈ 0.68 V, I ≈ 4.3 mA.
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "R", id: "r", a: "vin", b: "anode", value: 1000 },
        { kind: "D", id: "d1", a: "anode", b: "gnd" },
      ],
    };
    const r = dcOperatingPoint(c);
    const Is = 4e-9;
    const Vt = 0.025852;
    const N = 1.906;
    const vd = r.vd.d1;
    // V_D in the right ballpark for a small-signal Si diode under modest forward bias
    expect(vd).toBeGreaterThan(0.6);
    expect(vd).toBeLessThan(0.8);
    // Self-consistency: I through R must equal I through the diode
    const iR = (5 - r.v.anode) / 1000;
    const iD = Is * (Math.exp(vd / (N * Vt)) - 1);
    expect(Math.abs(iR - iD)).toBeLessThan(1e-6);
    // And it matches the value the solver reported
    expect(r.id.d1).toBeCloseTo(iD, 9);
  });

  it("reverse bias: I ≈ -Is (saturation current)", () => {
    // Anode at ground, cathode forced to +2V → V_D = -2V (reverse).
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "cathode", b: "gnd", wave: { kind: "dc", value: 2 } },
        { kind: "D", id: "d1", a: "gnd", b: "cathode" },
      ],
    };
    const r = dcOperatingPoint(c);
    expect(r.vd.d1).toBeCloseTo(-2, 6);
    // Reverse leakage is just -Is (a few nanoamps for the 1N4148-ish default)
    expect(r.id.d1).toBeGreaterThan(-1e-8);
    expect(r.id.d1).toBeLessThan(0);
  });

  it("half-wave rectifier with smoothing cap: vout follows positive peaks", () => {
    // 5V/60Hz sine → diode → RC load. The cap charges through the diode on
    // each positive peak and slowly droops via the load between peaks.
    const c: Circuit = {
      elements: [
        {
          kind: "V",
          id: "vs",
          a: "vin",
          b: "gnd",
          wave: { kind: "sine", offset: 0, amplitude: 5, frequency: 60 },
        },
        { kind: "D", id: "d1", a: "vin", b: "vout" },
        { kind: "R", id: "rl", a: "vout", b: "gnd", value: 10000 },
        { kind: "C", id: "cs", a: "vout", b: "gnd", value: 10e-6 },
      ],
    };
    // 3 cycles at 60Hz, 0.1ms steps
    const samples = runTransient(c, { duration: 50e-3, dt: 1e-4 });
    const lastCycle = samples.filter((s) => s.t > 2 * (1 / 60));
    const vouts = lastCycle.map((s) => s.v.vout);
    const peak = Math.max(...vouts);
    const trough = Math.min(...vouts);
    // After settling, vout sits near 5V minus a diode drop. With a 10µF cap
    // into 10kΩ load (τ = 100ms) and ~16ms between peaks, the trough is a
    // fraction of a volt below the peak.
    expect(peak).toBeGreaterThan(3.8);
    expect(peak).toBeLessThan(4.5);
    expect(trough).toBeGreaterThan(2.8);
    // Output is essentially always positive (the cap doesn't discharge below 0)
    expect(trough).toBeGreaterThan(0);
  });
});

describe("MNA transient — LC tank", () => {
  it("trades energy between a pre-charged C and an L", () => {
    // 1µF cap charged to 5V resonating into 1mH inductor through a
    // mild 50Ω load. f_0 = 1 / (2π√(LC)) ≈ 5033 Hz, period ≈ 199 µs.
    const c: Circuit = {
      elements: [
        { kind: "C", id: "c", a: "n", b: "gnd", value: 1e-6, ic: 5 },
        { kind: "L", id: "l", a: "n", b: "gnd", value: 1e-3, ic: 0 },
        { kind: "R", id: "r", a: "n", b: "gnd", value: 50 },
      ],
    };
    // Run for ~3 periods.
    const samples = runTransient(c, { duration: 600e-6, dt: 0.5e-6 });
    const vs = samples.map((s) => s.v.n);
    const ils = samples.map((s) => s.il.l);
    const vMax = Math.max(...vs);
    const vMin = Math.min(...vs);
    const ilMax = Math.max(...ils);

    // Voltage starts near 5V and swings negative — that only happens if
    // the inductor is actually integrating current and returning it.
    expect(vMax).toBeGreaterThan(4.5);
    expect(vMin).toBeLessThan(-0.5);
    // Inductor current peaks near the resonant Z₀ = √(L/C) ≈ 31.6Ω →
    // I_peak ≈ V₀/Z₀ ≈ 158 mA undamped. With R and Euler damping, we
    // accept >50 mA as evidence of energy transfer.
    expect(ilMax).toBeGreaterThan(0.05);
  });
});
