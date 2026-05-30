import { describe, expect, it } from "vitest";
import type { Circuit } from "../circuit";
import { dcOperatingPoint, runTransient } from "../transient";

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
