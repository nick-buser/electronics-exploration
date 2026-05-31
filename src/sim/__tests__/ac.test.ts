import { describe, expect, it } from "vitest";
import type { Circuit } from "../circuit";
import { acSweep, impedanceFromSource, solveAc } from "../ac";
import { abs } from "../complex";
import { dcOperatingPoint } from "../transient";

describe("AC analysis — RC low-pass", () => {
  it("hits -3 dB at the textbook corner", () => {
    const R = 1000;
    const C = 159e-9; // chosen so fc ≈ 1 kHz
    const fc = 1 / (2 * Math.PI * R * C);
    const c: Circuit = {
      elements: [
        // Wave doesn't matter for AC analysis; just satisfy the type.
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "R", id: "r1", a: "vin", b: "vout", value: R },
        { kind: "C", id: "c1", a: "vout", b: "gnd", value: C },
      ],
    };
    // 51 log-spaced points across 4 decades centred on fc
    const pts = acSweep(c, { fStart: fc / 100, fStop: fc * 100, nPoints: 401, inputs: { vs: { mag: 1 } } });
    const closest = pts.reduce((best, p) =>
      Math.abs(Math.log10(p.f) - Math.log10(fc)) <
      Math.abs(Math.log10(best.f) - Math.log10(fc))
        ? p
        : best,
    );
    const mag = abs(closest.v.vout);
    expect(mag).toBeGreaterThan(0.7);
    expect(mag).toBeLessThan(0.72);
  });

  it("approaches unity gain well below fc and rolls off above", () => {
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "R", id: "r1", a: "vin", b: "vout", value: 1000 },
        { kind: "C", id: "c1", a: "vout", b: "gnd", value: 1e-6 },
      ],
    };
    const lo = solveAc(c, 1, { vs: { mag: 1 } });
    const hi = solveAc(c, 1e6, { vs: { mag: 1 } });
    expect(abs(lo.v.vout)).toBeGreaterThan(0.999);
    expect(abs(hi.v.vout)).toBeLessThan(2e-3); // well past corner → very small
  });
});

describe("AC analysis — finite-GBW op-amp", () => {
  it("open-loop output rolls off at -20 dB/decade above the dominant pole", () => {
    // Open-loop test: no feedback. V_out / V+ = A0 / (1 + jω/ωp)
    // with ωp = 2π·GBW/A0. At f = GBW/A0, |gain| = A0/√2.
    const A0 = 1e5;
    const GBW = 1e6;
    const fp = GBW / A0; // 10 Hz
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        // No feedback path, but the matrix is non-singular because A0 is
        // finite and a tiny load terminates vout.
        { kind: "OP", id: "u1", vplus: "vin", vminus: "gnd", vout: "vout", A0, GBW },
        { kind: "R", id: "rl", a: "vout", b: "gnd", value: 1e6 },
      ],
    };
    // Way below the pole — full open-loop gain (within 1%)
    const lo = solveAc(c, 0.01, { vs: { mag: 1 } });
    expect(abs(lo.v.vout)).toBeGreaterThan(A0 * 0.99);
    expect(abs(lo.v.vout)).toBeLessThan(A0 * 1.01);
    // At the pole — -3 dB
    const atFp = solveAc(c, fp, { vs: { mag: 1 } });
    expect(abs(atFp.v.vout)).toBeGreaterThan(A0 / Math.SQRT2 - A0 * 0.02);
    expect(abs(atFp.v.vout)).toBeLessThan(A0 / Math.SQRT2 + A0 * 0.02);
    // At unity-gain frequency = GBW, |gain| should be ≈ 1
    const atGbw = solveAc(c, GBW, { vs: { mag: 1 } });
    expect(abs(atGbw.v.vout)).toBeGreaterThan(0.9);
    expect(abs(atGbw.v.vout)).toBeLessThan(1.1);
  });

  it("voltage follower bandwidth equals GBW", () => {
    const A0 = 1e5;
    const GBW = 1e6;
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "OP", id: "u1", vplus: "vin", vminus: "vout", vout: "vout", A0, GBW },
      ],
    };
    // Closed-loop gain G = 1, so closed-loop bandwidth ≈ GBW.
    // At f = GBW, |gain| = 1/√2.
    const r = solveAc(c, GBW, { vs: { mag: 1 } });
    expect(abs(r.v.vout)).toBeGreaterThan(0.7);
    expect(abs(r.v.vout)).toBeLessThan(0.72);
  });

  it("non-inverting amp closed-loop bandwidth = GBW / closed_loop_gain", () => {
    const A0 = 1e5;
    const GBW = 1e6;
    const G = 10; // closed-loop gain: 1 + R_f/R_g = 1 + 9000/1000
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "OP", id: "u1", vplus: "vin", vminus: "fb", vout: "vout", A0, GBW },
        { kind: "R", id: "rg", a: "fb", b: "gnd", value: 1000 },
        { kind: "R", id: "rf", a: "vout", b: "fb", value: 9000 },
      ],
    };
    // Way below corner — full gain
    const lo = solveAc(c, 100, { vs: { mag: 1 } });
    expect(abs(lo.v.vout)).toBeGreaterThan(9.9);
    expect(abs(lo.v.vout)).toBeLessThan(10.01);
    // At f = GBW/G, -3 dB
    const corner = solveAc(c, GBW / G, { vs: { mag: 1 } });
    expect(abs(corner.v.vout)).toBeGreaterThan(7);
    expect(abs(corner.v.vout)).toBeLessThan(7.15);
    // Well above corner — rolling off toward unity at GBW
    const past = solveAc(c, GBW, { vs: { mag: 1 } });
    expect(abs(past.v.vout)).toBeLessThan(1.2);
  });
});

describe("AC small-signal at operating point", () => {
  it("forward-biased diode looks like its small-signal conductance g_d = I/V_T", () => {
    // Drive 5V through a 1kΩ resistor into a 1N4148-ish diode to gnd. The
    // DC operating point gives V_D ≈ 0.68V, I ≈ 4.3 mA. The diode's
    // dynamic resistance at this bias is r_d = N·V_T / I ≈ 12 Ω (with
    // default N=1.906). When swept at any frequency, the cap-less circuit
    // has no frequency dependence — |V_out / V_in| is a real divider:
    //   V_out / V_in = r_d / (R + r_d)
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "R", id: "r", a: "vin", b: "vd", value: 1000 },
        { kind: "D", id: "d1", a: "vd", b: "gnd" },
      ],
    };
    // Sanity: DC op
    const dc = dcOperatingPoint(c);
    expect(dc.v.vd).toBeGreaterThan(0.6);
    expect(dc.v.vd).toBeLessThan(0.8);
    const iBias = (5 - dc.v.vd) / 1000;
    // r_d at this bias point (default N=1.906, Vt=0.025852)
    const rd = (1.906 * 0.025852) / iBias;
    const expectedRatio = rd / (1000 + rd);
    // Inject a 1 V AC perturbation at vin (DC bias source is also vs;
    // the AC stamp swaps in 1V phasor amplitude at that source). The
    // diode is linearised at its DC bias, so the gain is frequency-flat.
    const pts = acSweep(c, { fStart: 1, fStop: 1e6, nPoints: 31, inputs: { vs: { mag: 1 } } });
    for (const p of pts) {
      expect(abs(p.v.vd)).toBeGreaterThan(expectedRatio * 0.95);
      expect(abs(p.v.vd)).toBeLessThan(expectedRatio * 1.05);
    }
  });

  it("common-emitter BJT amplifier: midband gain matches -R_C/(R_E + r_e), HF rolloff via C_in", () => {
    // Voltage-divider biased NPN, AC-coupled signal input. With the test
    // values, I_C ≈ 2 mA so r_e ≈ V_T/I_E ≈ 12.5 Ω; midband |gain| ≈
    // R_C / (R_E + r_e) ≈ 3300 / 482 ≈ 6.85.
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vcc", a: "vcc", b: "gnd", wave: { kind: "dc", value: 9 } },
        { kind: "R", id: "rb1", a: "vcc", b: "base", value: 47000 },
        { kind: "R", id: "rb2", a: "base", b: "gnd", value: 10000 },
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "C", id: "cin", a: "vin", b: "base", value: 10e-6 },
        { kind: "R", id: "rc", a: "vcc", b: "coll", value: 3300 },
        { kind: "R", id: "re", a: "emit", b: "gnd", value: 470 },
        { kind: "Q", id: "q1", polarity: "npn", c: "coll", b: "base", e: "emit" },
      ],
    };
    // Sanity: bias point looks active
    const dc = dcOperatingPoint(c);
    expect(dc.v.base).toBeGreaterThan(1.4);
    expect(dc.v.base).toBeLessThan(1.8);
    expect(dc.ic.q1).toBeGreaterThan(1.5e-3);
    expect(dc.ic.q1).toBeLessThan(3e-3);

    // Probe at midband (well above C_in corner, below any other poles)
    const mid = solveAc(c, 10e3, { vs: { mag: 1 } });
    const midGain = abs(mid.v.coll);
    expect(midGain).toBeGreaterThan(5);
    expect(midGain).toBeLessThan(8);

    // Way below the coupling-cap corner, the cap blocks → gain → 0
    const lo = solveAc(c, 0.01, { vs: { mag: 1 } });
    expect(abs(lo.v.coll)).toBeLessThan(midGain * 0.05);

    // Above the coupling-cap corner but below any model-side rolloff, gain
    // stays at the midband value (our model has no parasitic Cπ/Cμ)
    const hi = solveAc(c, 1e6, { vs: { mag: 1 } });
    expect(abs(hi.v.coll)).toBeGreaterThan(midGain * 0.95);
    expect(abs(hi.v.coll)).toBeLessThan(midGain * 1.05);
  });
});

describe("Parasitic capacitances on nonlinear devices", () => {
  it("BJT Cπ + Cμ add a high-frequency rolloff to the common-emitter amp (Miller effect)", () => {
    // Same circuit as the existing CE test, but the BJT now carries
    // parasitic Cπ = 30 pF and Cμ = 4 pF. The Miller-multiplied cap at
    // the base creates an upper pole in the kHz–MHz range.
    const build = (cpi: number, cmu: number): Circuit => ({
      elements: [
        { kind: "V", id: "vcc", a: "vcc", b: "gnd", wave: { kind: "dc", value: 9 } },
        { kind: "R", id: "rb1", a: "vcc", b: "base", value: 47000 },
        { kind: "R", id: "rb2", a: "base", b: "gnd", value: 10000 },
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        // Add some source impedance so the input pole isn't dominated by
        // a zero-Ω drive — makes the Miller cap actually matter.
        { kind: "R", id: "rs", a: "vin", b: "cin_in", value: 1000 },
        { kind: "C", id: "cin", a: "cin_in", b: "base", value: 10e-6 },
        { kind: "R", id: "rc", a: "vcc", b: "coll", value: 3300 },
        { kind: "R", id: "re", a: "emit", b: "gnd", value: 470 },
        { kind: "Q", id: "q1", polarity: "npn", c: "coll", b: "base", e: "emit", Cpi: cpi, Cmu: cmu },
      ],
    });
    const bare = build(0, 0);
    const withCaps = build(30e-12, 4e-12);

    // Midband: both should agree (caps are negligible at low frequency)
    const midBare = abs(solveAc(bare, 10e3, { vs: { mag: 1 } }).v.coll);
    const midWith = abs(solveAc(withCaps, 10e3, { vs: { mag: 1 } }).v.coll);
    expect(midWith).toBeGreaterThan(midBare * 0.95);
    expect(midWith).toBeLessThan(midBare * 1.05);

    // High frequency: parasitic-cap version should be substantially lower
    // (Miller cap dominates at the base). At 10 MHz, capped version is
    // clearly below midband (the Miller pole has kicked in); bare version
    // stays flat because the model has no parasitics.
    const hiBare = abs(solveAc(bare, 10e6, { vs: { mag: 1 } }).v.coll);
    const hiWith = abs(solveAc(withCaps, 10e6, { vs: { mag: 1 } }).v.coll);
    expect(hiBare).toBeGreaterThan(midBare * 0.9); // bare version still flat
    expect(hiWith).toBeLessThan(midWith * 0.5); // capped version visibly rolled off
  });

  it("MOSFET Cgd transitions the drain from gm·R_D gain to cap-follower at high freq", () => {
    // Common-source-like driver with Cgd between gate and drain. At low
    // freq, the drain swings by gm·R_D times the gate perturbation
    // (transistor action). At very high freq, Cgd looks like a wire from
    // gate to drain — the cap pulls drain toward the gate, so |V_drain|
    // moves toward |V_gate| = 1 V regardless of gm.
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vdd", a: "vdd", b: "gnd", wave: { kind: "dc", value: 5 } },
        { kind: "V", id: "vgg", a: "gate", b: "gnd", wave: { kind: "dc", value: 3 } },
        { kind: "R", id: "rd", a: "vdd", b: "drain", value: 50 },
        { kind: "M", id: "m1", polarity: "nmos", d: "drain", g: "gate", s: "gnd", Cgd: 10e-12 },
      ],
    };
    const lo = solveAc(c, 1, { vgg: { mag: 1 } });
    const hi = solveAc(c, 1e9, { vgg: { mag: 1 } });
    // Low freq: drain phasor magnitude is gm·R_D · 1 V (several volts)
    expect(abs(lo.v.drain)).toBeGreaterThan(2);
    // High freq: cap dominates, drain follows gate (~1 V phasor)
    expect(abs(hi.v.drain)).toBeGreaterThan(0.5);
    expect(abs(hi.v.drain)).toBeLessThan(1.5);
  });
});

describe("AC analysis — op-amp configurations", () => {
  it("ideal voltage follower has unity gain at any frequency", () => {
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "OP", id: "u1", vplus: "vin", vminus: "vout", vout: "vout" },
      ],
    };
    for (const f of [1, 1e3, 1e6, 1e9]) {
      const p = solveAc(c, f, { vs: { mag: 1 } });
      expect(abs(p.v.vout)).toBeCloseTo(1, 6);
    }
  });

  it("active low-pass: DC gain = R_f/R_in and -3 dB at 1/(2π R_f C_f)", () => {
    // Inverting topology: V_out / V_in = -R_f / (R_in (1 + jω R_f C_f))
    // R_in = 1k, R_f = 10k, C_f = 1.59 nF → fc ≈ 10 kHz, |gain DC| = 10
    const Rin = 1000;
    const Rf = 10000;
    const Cf = 1.59e-9;
    const fc = 1 / (2 * Math.PI * Rf * Cf);
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vin", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "R", id: "rin", a: "vin", b: "sum", value: Rin },
        { kind: "OP", id: "u1", vplus: "gnd", vminus: "sum", vout: "vout" },
        { kind: "R", id: "rf", a: "vout", b: "sum", value: Rf },
        { kind: "C", id: "cf", a: "vout", b: "sum", value: Cf },
      ],
    };
    // DC gain: at very low freq, |Vout| = Rf/Rin · 1V = 10
    const lo = solveAc(c, 1, { vs: { mag: 1 } });
    expect(abs(lo.v.vout)).toBeCloseTo(10, 1);

    // -3 dB at fc: |gain| = 10/√2 ≈ 7.07
    const pts = acSweep(c, { fStart: 1, fStop: 1e6, nPoints: 601, inputs: { vs: { mag: 1 } } });
    const closest = pts.reduce((best, p) =>
      Math.abs(Math.log10(p.f) - Math.log10(fc)) <
      Math.abs(Math.log10(best.f) - Math.log10(fc))
        ? p
        : best,
    );
    const mag = abs(closest.v.vout);
    expect(mag).toBeGreaterThan(7);
    expect(mag).toBeLessThan(7.15);

    // Past fc, rolloff. At f = 100·fc, gain ~ 10/100 = 0.1
    const past = solveAc(c, 100 * fc, { vs: { mag: 1 } });
    expect(abs(past.v.vout)).toBeLessThan(0.15);
  });
});

describe("AC analysis — impedance of reactive elements", () => {
  it("|Z| of a 100 nF cap matches 1/(ωC)", () => {
    const C = 100e-9;
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vcc", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "C", id: "c1", a: "vcc", b: "gnd", value: C },
      ],
    };
    for (const f of [1e3, 1e5, 1e7]) {
      const p = solveAc(c, f, { vs: { mag: 1 } });
      const z = impedanceFromSource(p, "vs");
      const expected = 1 / (2 * Math.PI * f * C);
      expect(abs(z)).toBeCloseTo(expected, 3);
    }
  });

  it("|Z| of a 1 µH inductor matches ωL", () => {
    const L = 1e-6;
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vcc", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "L", id: "l1", a: "vcc", b: "gnd", value: L },
      ],
    };
    for (const f of [1e5, 1e7, 1e9]) {
      const p = solveAc(c, f, { vs: { mag: 1 } });
      const z = impedanceFromSource(p, "vs");
      const expected = 2 * Math.PI * f * L;
      expect(abs(z)).toBeCloseTo(expected, 3);
    }
  });

  it("series LC has a sharp impedance minimum at the resonant frequency", () => {
    const L = 1e-9; // 1 nH ESL
    const C = 100e-9; // 100 nF cap
    const fRes = 1 / (2 * Math.PI * Math.sqrt(L * C));
    const c: Circuit = {
      elements: [
        { kind: "V", id: "vs", a: "vcc", b: "gnd", wave: { kind: "dc", value: 0 } },
        { kind: "L", id: "l1", a: "vcc", b: "mid", value: L },
        { kind: "C", id: "c1", a: "mid", b: "gnd", value: C },
      ],
    };
    const pts = acSweep(c, { fStart: 1e3, fStop: 1e9, nPoints: 601, inputs: { vs: { mag: 1 } } });
    const z = pts.map((p) => ({ f: p.f, m: abs(impedanceFromSource(p, "vs")) }));
    const minIdx = z.reduce((bestI, p, i) => (p.m < z[bestI].m ? i : bestI), 0);
    // Resonance log-frequency, allow half a decade tolerance to absorb the
    // log-grid coarseness.
    expect(Math.abs(Math.log10(z[minIdx].f) - Math.log10(fRes))).toBeLessThan(0.05);
    // Minimum should be very small (ideal series LC at resonance → 0).
    expect(z[minIdx].m).toBeLessThan(0.1);
    // Way off resonance |Z| is dominated by whichever reactance is bigger
    expect(z[0].m).toBeGreaterThan(z[minIdx].m * 10);
    expect(z[z.length - 1].m).toBeGreaterThan(z[minIdx].m * 10);
  });
});
