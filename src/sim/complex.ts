/**
 * Bare-bones complex arithmetic. Used by AC analysis where each unknown
 * is a phasor. JS doesn't ship a complex type, but circuits we'll throw
 * at this are small enough that allocation overhead is invisible.
 */
export interface Complex {
  re: number;
  im: number;
}

export const ZERO: Complex = { re: 0, im: 0 };
export const ONE: Complex = { re: 1, im: 0 };

export function cx(re: number, im = 0): Complex {
  return { re, im };
}
export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}
export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}
export function neg(a: Complex): Complex {
  return { re: -a.re, im: -a.im };
}
export function mul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}
export function scale(a: Complex, s: number): Complex {
  return { re: a.re * s, im: a.im * s };
}
export function div(a: Complex, b: Complex): Complex {
  const d = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / d,
    im: (a.im * b.re - a.re * b.im) / d,
  };
}
export function abs(a: Complex): number {
  return Math.hypot(a.re, a.im);
}
export function arg(a: Complex): number {
  return Math.atan2(a.im, a.re);
}

/** Polar → rectangular. */
export function polar(magnitude: number, phaseRad = 0): Complex {
  return { re: magnitude * Math.cos(phaseRad), im: magnitude * Math.sin(phaseRad) };
}

/** 20·log10(|z|), with a floor so log(0) doesn't explode. */
export function magnitudeDb(z: Complex, floor = 1e-30): number {
  return 20 * Math.log10(Math.max(floor, abs(z)));
}
