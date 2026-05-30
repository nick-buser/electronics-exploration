import { describe, expect, it } from "vitest";
import type { Circuit } from "../circuit";
import { acSweep, impedanceFromSource, solveAc } from "../ac";
import { abs } from "../complex";

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
