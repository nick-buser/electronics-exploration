/**
 * Hand-laid SVG schematic primitives. Each primitive takes two endpoints
 * (a, b) and is drawn centered along the segment connecting them — so the
 * caller positions parts by where their pins land, and rotation falls
 * out automatically.
 *
 * Coordinates are in user units of the parent <svg>. Authors typically
 * pick a viewBox like 0..400 x 0..200 and snap pin positions to a 20px
 * grid for legibility.
 */
import type { ReactNode } from "react";

export type Pt = readonly [number, number];

const STROKE = "var(--color-text-2)";
const STROKE_W = 1.5;
const LABEL_FILL = "var(--color-text)";
const VALUE_FILL = "var(--color-muted)";

/* ── geometry helpers ──────────────────────────────────── */

function angle(a: Pt, b: Pt): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]) * (180 / Math.PI);
}

function dist(a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.hypot(dx, dy);
}

function midpoint(a: Pt, b: Pt): Pt {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Body extents perpendicular to the segment (in user units). */
const RESISTOR_LEN = 36;
const RESISTOR_W = 12;
const CAP_GAP = 6;
const CAP_PLATE = 18;
const VSOURCE_R = 14;

/* ── primitives ────────────────────────────────────────── */

export function Wire({ path }: { path: string }) {
  return <path d={path} stroke={STROKE} strokeWidth={STROKE_W} fill="none" strokeLinecap="round" />;
}

export function Junction({ at }: { at: Pt }) {
  return <circle cx={at[0]} cy={at[1]} r={2.5} fill={STROKE} />;
}

export function NodeLabel({ at, text, anchor = "start" }: { at: Pt; text: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text
      x={at[0]}
      y={at[1]}
      fontFamily="var(--font-mono)"
      fontSize={9}
      fill={VALUE_FILL}
      textAnchor={anchor}
      dominantBaseline="middle"
    >
      {text}
    </text>
  );
}

function PartLabel({ pos, label, value, side }: { pos: Pt; label?: string; value?: string; side: "above" | "below" | "left" }) {
  const lines: ReactNode[] = [];
  const baseY = pos[1] + (side === "above" ? -14 : side === "below" ? 16 : 0);
  const baseX = pos[0] + (side === "left" ? 14 : 0);
  const anchor: "start" | "middle" = side === "left" ? "start" : "middle";
  if (label) {
    lines.push(
      <text
        key="l"
        x={baseX}
        y={baseY}
        fontFamily="var(--font-mono)"
        fontSize={10}
        fill={LABEL_FILL}
        textAnchor={anchor}
        dominantBaseline="middle"
      >
        {label}
      </text>,
    );
  }
  if (value) {
    lines.push(
      <text
        key="v"
        x={baseX}
        y={baseY + (label ? 11 : 0)}
        fontFamily="var(--font-mono)"
        fontSize={9}
        fill={VALUE_FILL}
        textAnchor={anchor}
        dominantBaseline="middle"
      >
        {value}
      </text>,
    );
  }
  return <>{lines}</>;
}

/** Resistor as an IEC rectangle straddling the midpoint. */
export function Resistor({ a, b, label, value }: { a: Pt; b: Pt; label?: string; value?: string }) {
  const len = dist(a, b);
  const mid = midpoint(a, b);
  const ang = angle(a, b);
  // Leads from each pin into the body
  const leadLen = Math.max(0, (len - RESISTOR_LEN) / 2);
  const leadAxStart = a;
  const leadAxEnd: Pt = [
    a[0] + Math.cos((ang * Math.PI) / 180) * leadLen,
    a[1] + Math.sin((ang * Math.PI) / 180) * leadLen,
  ];
  const leadBxStart: Pt = [
    b[0] - Math.cos((ang * Math.PI) / 180) * leadLen,
    b[1] - Math.sin((ang * Math.PI) / 180) * leadLen,
  ];
  return (
    <g>
      <Wire path={`M ${leadAxStart[0]} ${leadAxStart[1]} L ${leadAxEnd[0]} ${leadAxEnd[1]}`} />
      <Wire path={`M ${leadBxStart[0]} ${leadBxStart[1]} L ${b[0]} ${b[1]}`} />
      <g transform={`translate(${mid[0]} ${mid[1]}) rotate(${ang})`}>
        <rect
          x={-RESISTOR_LEN / 2}
          y={-RESISTOR_W / 2}
          width={RESISTOR_LEN}
          height={RESISTOR_W}
          stroke={STROKE}
          strokeWidth={STROKE_W}
          fill="var(--color-bg)"
        />
      </g>
      <PartLabel pos={mid} label={label} value={value} side={Math.abs(ang) < 45 ? "above" : "left"} />
    </g>
  );
}

/** Inductor — a row of half-circle "coils" along the segment. */
export function Inductor({ a, b, label, value }: { a: Pt; b: Pt; label?: string; value?: string }) {
  const len = dist(a, b);
  const mid = midpoint(a, b);
  const ang = angle(a, b);
  const COIL_LEN = 36;
  const N_ARCS = 4;
  const arcW = COIL_LEN / N_ARCS;
  const arcR = arcW / 2;
  const leadLen = Math.max(0, (len - COIL_LEN) / 2);
  const cos = Math.cos((ang * Math.PI) / 180);
  const sin = Math.sin((ang * Math.PI) / 180);
  const leadAxEnd: Pt = [a[0] + cos * leadLen, a[1] + sin * leadLen];
  const leadBxStart: Pt = [b[0] - cos * leadLen, b[1] - sin * leadLen];
  // In local coordinates centered on mid, axis along x, arcs bulging up
  const arcs: string[] = [];
  for (let i = 0; i < N_ARCS; i++) {
    const x0 = -COIL_LEN / 2 + i * arcW;
    const x1 = x0 + arcW;
    arcs.push(`M ${x0} 0 A ${arcR} ${arcR} 0 0 1 ${x1} 0`);
  }
  return (
    <g>
      <Wire path={`M ${a[0]} ${a[1]} L ${leadAxEnd[0]} ${leadAxEnd[1]}`} />
      <Wire path={`M ${leadBxStart[0]} ${leadBxStart[1]} L ${b[0]} ${b[1]}`} />
      <g transform={`translate(${mid[0]} ${mid[1]}) rotate(${ang})`}>
        <path d={arcs.join(" ")} stroke={STROKE} strokeWidth={STROKE_W} fill="none" strokeLinecap="round" />
      </g>
      <PartLabel pos={mid} label={label} value={value} side={Math.abs(ang) < 45 ? "above" : "left"} />
    </g>
  );
}

/** Non-polarized capacitor — two parallel plates perpendicular to the lead. */
export function Capacitor({ a, b, label, value }: { a: Pt; b: Pt; label?: string; value?: string }) {
  const len = dist(a, b);
  const mid = midpoint(a, b);
  const ang = angle(a, b);
  const half = CAP_GAP / 2;
  const leadLen = Math.max(0, len / 2 - half);
  const cos = Math.cos((ang * Math.PI) / 180);
  const sin = Math.sin((ang * Math.PI) / 180);
  const leadAxEnd: Pt = [a[0] + cos * leadLen, a[1] + sin * leadLen];
  const leadBxStart: Pt = [b[0] - cos * leadLen, b[1] - sin * leadLen];
  return (
    <g>
      <Wire path={`M ${a[0]} ${a[1]} L ${leadAxEnd[0]} ${leadAxEnd[1]}`} />
      <Wire path={`M ${leadBxStart[0]} ${leadBxStart[1]} L ${b[0]} ${b[1]}`} />
      <g transform={`translate(${mid[0]} ${mid[1]}) rotate(${ang})`}>
        <line x1={-half} y1={-CAP_PLATE / 2} x2={-half} y2={CAP_PLATE / 2} stroke={STROKE} strokeWidth={STROKE_W} />
        <line x1={half} y1={-CAP_PLATE / 2} x2={half} y2={CAP_PLATE / 2} stroke={STROKE} strokeWidth={STROKE_W} />
      </g>
      <PartLabel pos={mid} label={label} value={value} side={Math.abs(ang) < 45 ? "above" : "left"} />
    </g>
  );
}

/** Ideal voltage source — circle with + on the a side, - on the b side. */
export function VSource({ a, b, label, value }: { a: Pt; b: Pt; label?: string; value?: string }) {
  const len = dist(a, b);
  const mid = midpoint(a, b);
  const ang = angle(a, b);
  const cos = Math.cos((ang * Math.PI) / 180);
  const sin = Math.sin((ang * Math.PI) / 180);
  const leadLen = Math.max(0, len / 2 - VSOURCE_R);
  const leadAxEnd: Pt = [a[0] + cos * leadLen, a[1] + sin * leadLen];
  const leadBxStart: Pt = [b[0] - cos * leadLen, b[1] - sin * leadLen];
  // + and - are placed along the axis inside the circle, on the a and b
  // halves respectively
  const plusPos: Pt = [mid[0] + cos * (VSOURCE_R * -0.45), mid[1] + sin * (VSOURCE_R * -0.45)];
  const minusPos: Pt = [mid[0] + cos * (VSOURCE_R * 0.45), mid[1] + sin * (VSOURCE_R * 0.45)];
  return (
    <g>
      <Wire path={`M ${a[0]} ${a[1]} L ${leadAxEnd[0]} ${leadAxEnd[1]}`} />
      <Wire path={`M ${leadBxStart[0]} ${leadBxStart[1]} L ${b[0]} ${b[1]}`} />
      <circle cx={mid[0]} cy={mid[1]} r={VSOURCE_R} stroke={STROKE} strokeWidth={STROKE_W} fill="var(--color-bg)" />
      <text
        x={plusPos[0]}
        y={plusPos[1]}
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill={STROKE}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        +
      </text>
      <text
        x={minusPos[0]}
        y={minusPos[1]}
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill={STROKE}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        −
      </text>
      <PartLabel pos={mid} label={label} value={value} side="left" />
    </g>
  );
}

/** Diode — triangle (anode side) pointing toward the cathode bar. */
export function Diode({ a, b, label, value }: { a: Pt; b: Pt; label?: string; value?: string }) {
  const len = dist(a, b);
  const mid = midpoint(a, b);
  const ang = angle(a, b);
  const TRI_LEN = 12;
  const TRI_W = 10;
  const BAR_W = 10;
  const cos = Math.cos((ang * Math.PI) / 180);
  const sin = Math.sin((ang * Math.PI) / 180);
  const leadLen = Math.max(0, (len - TRI_LEN) / 2);
  const leadAxEnd: Pt = [a[0] + cos * leadLen, a[1] + sin * leadLen];
  const leadBxStart: Pt = [b[0] - cos * leadLen, b[1] - sin * leadLen];
  return (
    <g>
      <Wire path={`M ${a[0]} ${a[1]} L ${leadAxEnd[0]} ${leadAxEnd[1]}`} />
      <Wire path={`M ${leadBxStart[0]} ${leadBxStart[1]} L ${b[0]} ${b[1]}`} />
      <g transform={`translate(${mid[0]} ${mid[1]}) rotate(${ang})`}>
        {/* Triangle pointing right (a is the anode on the left, b the cathode on the right). */}
        <polygon
          points={`-${TRI_LEN / 2},-${TRI_W / 2} -${TRI_LEN / 2},${TRI_W / 2} ${TRI_LEN / 2},0`}
          fill={STROKE}
          stroke={STROKE}
          strokeWidth={STROKE_W}
          strokeLinejoin="round"
        />
        {/* Cathode bar at the tip */}
        <line
          x1={TRI_LEN / 2}
          y1={-BAR_W / 2}
          x2={TRI_LEN / 2}
          y2={BAR_W / 2}
          stroke={STROKE}
          strokeWidth={STROKE_W}
          strokeLinecap="round"
        />
      </g>
      <PartLabel pos={mid} label={label} value={value} side={Math.abs(ang) < 45 ? "above" : "left"} />
    </g>
  );
}

/* ── BJT ───────────────────────────────────────────────── */

const BJT_BODY_R = 12;
const BJT_W = 36;
const BJT_H = 44;

export type BjtPins = { c: Pt; b: Pt; e: Pt };

/** Pin coordinates for a BJT centered at `at`. Collector is up, emitter
 *  down, base on the left. */
export function bjtPins(at: Pt): BjtPins {
  return {
    c: [at[0], at[1] - BJT_H / 2],
    b: [at[0] - BJT_W / 2, at[1]],
    e: [at[0], at[1] + BJT_H / 2],
  };
}

export function NpnBjt({ at, label }: { at: Pt; label?: string }) {
  return <BjtBody at={at} polarity="npn" label={label} />;
}
export function PnpBjt({ at, label }: { at: Pt; label?: string }) {
  return <BjtBody at={at} polarity="pnp" label={label} />;
}

function BjtBody({
  at,
  polarity,
  label,
}: {
  at: Pt;
  polarity: "npn" | "pnp";
  label?: string;
}) {
  const cx = at[0];
  const cy = at[1];
  const collY = cy - BJT_H / 2;
  const emY = cy + BJT_H / 2;
  const bX = cx - BJT_W / 2;
  // Base horizontal stub
  const baseStubX = cx - BJT_BODY_R;
  // Vertical "base bar"
  const barTop = cy - BJT_BODY_R + 2;
  const barBot = cy + BJT_BODY_R - 2;
  // Collector + emitter slanted leads
  const slantTopX = cx + 8;
  const slantTopY = cy - BJT_BODY_R + 3;
  const slantBotX = cx + 8;
  const slantBotY = cy + BJT_BODY_R - 3;
  // Arrow on emitter for direction
  const arrowSize = 5;
  return (
    <g>
      {/* Base lead */}
      <Wire path={`M ${bX} ${cy} L ${baseStubX} ${cy}`} />
      {/* Base bar */}
      <line
        x1={baseStubX}
        y1={barTop}
        x2={baseStubX}
        y2={barBot}
        stroke={STROKE}
        strokeWidth={STROKE_W + 0.5}
        strokeLinecap="round"
      />
      {/* Collector lead and slant */}
      <line x1={baseStubX} y1={cy - 6} x2={slantTopX} y2={slantTopY} stroke={STROKE} strokeWidth={STROKE_W} />
      <Wire path={`M ${slantTopX} ${slantTopY} L ${cx} ${cy - BJT_BODY_R + 3} L ${cx} ${collY}`} />
      {/* Emitter lead and slant */}
      <line x1={baseStubX} y1={cy + 6} x2={slantBotX} y2={slantBotY} stroke={STROKE} strokeWidth={STROKE_W} />
      <Wire path={`M ${slantBotX} ${slantBotY} L ${cx} ${cy + BJT_BODY_R - 3} L ${cx} ${emY}`} />
      {/* Emitter arrow: NPN points OUT of device, PNP points IN */}
      {polarity === "npn" ? (
        <polygon
          points={`${slantBotX - 1},${slantBotY + 1} ${slantBotX - arrowSize},${slantBotY - arrowSize / 2 + 1} ${slantBotX - arrowSize / 2},${slantBotY + arrowSize - 1}`}
          fill={STROKE}
          stroke={STROKE}
        />
      ) : (
        <polygon
          points={`${baseStubX + 1},${cy + 6 - 1} ${baseStubX + arrowSize},${cy + 6 + arrowSize / 2 - 1} ${baseStubX + arrowSize / 2},${cy + 6 - arrowSize + 1}`}
          fill={STROKE}
          stroke={STROKE}
        />
      )}
      {/* Optional circle around body for completeness */}
      <circle cx={cx + 2} cy={cy} r={14} fill="none" stroke={STROKE} strokeWidth={1} opacity={0.4} />
      {label && (
        <text
          x={cx + 20}
          y={cy + 4}
          fontFamily="var(--font-mono)"
          fontSize={10}
          fill={LABEL_FILL}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/* ── MOSFET ────────────────────────────────────────────── */

const MOS_W = 36;
const MOS_H = 44;

export type MosPins = { d: Pt; g: Pt; s: Pt };

export function mosPins(at: Pt): MosPins {
  return {
    d: [at[0], at[1] - MOS_H / 2],
    g: [at[0] - MOS_W / 2, at[1]],
    s: [at[0], at[1] + MOS_H / 2],
  };
}

export function Nmos({ at, label }: { at: Pt; label?: string }) {
  return <MosBody at={at} polarity="nmos" label={label} />;
}
export function Pmos({ at, label }: { at: Pt; label?: string }) {
  return <MosBody at={at} polarity="pmos" label={label} />;
}

function MosBody({
  at,
  polarity,
  label,
}: {
  at: Pt;
  polarity: "nmos" | "pmos";
  label?: string;
}) {
  const cx = at[0];
  const cy = at[1];
  const dY = cy - MOS_H / 2;
  const sY = cy + MOS_H / 2;
  const gX = cx - MOS_W / 2;
  // Gate has a small gap from the channel bar (the famous "insulated gate")
  const gateBarX = cx - 10;
  const channelBarX = cx - 6;
  const barTop = cy - 12;
  const barBot = cy + 12;
  const arrowSize = 5;
  return (
    <g>
      {/* Gate lead + gate bar (left, separated from channel) */}
      <Wire path={`M ${gX} ${cy} L ${gateBarX} ${cy}`} />
      <line
        x1={gateBarX}
        y1={barTop}
        x2={gateBarX}
        y2={barBot}
        stroke={STROKE}
        strokeWidth={STROKE_W + 0.5}
        strokeLinecap="round"
      />
      {/* Channel bar (right of gate, with a small gap to show the insulator) */}
      <line
        x1={channelBarX}
        y1={barTop + 1}
        x2={channelBarX}
        y2={barBot - 1}
        stroke={STROKE}
        strokeWidth={STROKE_W + 0.5}
        strokeLinecap="round"
      />
      {/* Drain (top) */}
      <Wire path={`M ${channelBarX} ${barTop + 4} L ${cx + 4} ${barTop + 4} L ${cx + 4} ${dY}`} />
      <Wire path={`M ${cx + 4} ${dY} L ${cx} ${dY}`} />
      {/* Source (bottom) */}
      <Wire path={`M ${channelBarX} ${barBot - 4} L ${cx + 4} ${barBot - 4} L ${cx + 4} ${sY}`} />
      <Wire path={`M ${cx + 4} ${sY} L ${cx} ${sY}`} />
      {/* Body / source tie + arrow (NMOS arrow points IN at source, PMOS points OUT) */}
      <Wire path={`M ${channelBarX} ${cy} L ${cx + 4} ${cy}`} />
      {polarity === "nmos" ? (
        <polygon
          points={`${channelBarX + 1},${cy - arrowSize / 2 + 1} ${channelBarX + 1},${cy + arrowSize / 2 - 1} ${channelBarX + arrowSize},${cy}`}
          fill={STROKE}
        />
      ) : (
        <polygon
          points={`${channelBarX + arrowSize},${cy - arrowSize / 2 + 1} ${channelBarX + arrowSize},${cy + arrowSize / 2 - 1} ${channelBarX + 1},${cy}`}
          fill={STROKE}
        />
      )}
      {label && (
        <text
          x={cx + 20}
          y={cy + 4}
          fontFamily="var(--font-mono)"
          fontSize={10}
          fill={LABEL_FILL}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/* ── op-amp ────────────────────────────────────────────── */

const OPAMP_W = 44;
const OPAMP_H = 36;
const OPAMP_PIN_INSET = 8;

export type OpAmpPins = { plus: Pt; minus: Pt; out: Pt };

/** Pin positions for an op-amp centered at `at`. Pass `vPlusUp = false` to
 *  put the `−` input on top (handy for inverting amps to keep the feedback
 *  wires from crossing). */
export function opAmpPins(at: Pt, vPlusUp = true): OpAmpPins {
  const dy = OPAMP_H / 2 - OPAMP_PIN_INSET;
  return {
    plus: [at[0] - OPAMP_W / 2, at[1] + (vPlusUp ? -dy : +dy)],
    minus: [at[0] - OPAMP_W / 2, at[1] + (vPlusUp ? +dy : -dy)],
    out: [at[0] + OPAMP_W / 2, at[1]],
  };
}

export function OpAmp({
  at,
  label,
  vPlusUp = true,
}: {
  at: Pt;
  label?: string;
  vPlusUp?: boolean;
}) {
  const left = at[0] - OPAMP_W / 2;
  const right = at[0] + OPAMP_W / 2;
  const top = at[1] - OPAMP_H / 2;
  const bot = at[1] + OPAMP_H / 2;
  const plusY = at[1] + (vPlusUp ? -(OPAMP_H / 2 - OPAMP_PIN_INSET) : +(OPAMP_H / 2 - OPAMP_PIN_INSET));
  const minusY = at[1] + (vPlusUp ? +(OPAMP_H / 2 - OPAMP_PIN_INSET) : -(OPAMP_H / 2 - OPAMP_PIN_INSET));
  return (
    <g>
      <polygon
        points={`${left},${top} ${left},${bot} ${right},${at[1]}`}
        fill="var(--color-bg)"
        stroke={STROKE}
        strokeWidth={STROKE_W}
      />
      <text
        x={left + 7}
        y={plusY}
        fontFamily="var(--font-mono)"
        fontSize={10}
        fill={STROKE}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        +
      </text>
      <text
        x={left + 7}
        y={minusY}
        fontFamily="var(--font-mono)"
        fontSize={10}
        fill={STROKE}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        −
      </text>
      {label && (
        <text
          x={at[0] + 2}
          y={bot + 12}
          fontFamily="var(--font-mono)"
          fontSize={9}
          fill={VALUE_FILL}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/* ── Schmitt trigger ───────────────────────────────────── */

const SCHMITT_W = 44;
const SCHMITT_H = 32;

export type SchmittPins = { in: Pt; out: Pt };

export function schmittPins(at: Pt): SchmittPins {
  return {
    in: [at[0] - SCHMITT_W / 2, at[1]],
    out: [at[0] + SCHMITT_W / 2, at[1]],
  };
}

/** Schmitt trigger symbol: triangle with the canonical hysteresis glyph
 *  inside (a tiny S-curve drawn from two small line segments). */
export function Schmitt({ at, label }: { at: Pt; label?: string }) {
  const left = at[0] - SCHMITT_W / 2;
  const right = at[0] + SCHMITT_W / 2;
  const top = at[1] - SCHMITT_H / 2;
  const bot = at[1] + SCHMITT_H / 2;
  // Hysteresis glyph: rectangular pulse-ish shape inside the triangle
  const gx0 = at[0] - 8;
  const gx1 = at[0] + 8;
  const gy0 = at[1] - 4;
  const gy1 = at[1] + 4;
  return (
    <g>
      <polygon
        points={`${left},${top} ${left},${bot} ${right},${at[1]}`}
        fill="var(--color-bg)"
        stroke={STROKE}
        strokeWidth={STROKE_W}
      />
      {/* Hysteresis loop glyph */}
      <path
        d={`M ${gx0} ${gy1} L ${at[0] - 2} ${gy1} L ${at[0] - 2} ${gy0} L ${gx1} ${gy0}`}
        stroke={STROKE}
        strokeWidth={1}
        fill="none"
      />
      {label && (
        <text
          x={at[0] + 2}
          y={bot + 12}
          fontFamily="var(--font-mono)"
          fontSize={9}
          fill={VALUE_FILL}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Ground symbol at a single point. */
export function Ground({ at }: { at: Pt }) {
  const [x, y] = at;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 4} stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1={x - 9} y1={y + 4} x2={x + 9} y2={y + 4} stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1={x - 6} y1={y + 7} x2={x + 6} y2={y + 7} stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1={x - 3} y1={y + 10} x2={x + 3} y2={y + 10} stroke={STROKE} strokeWidth={STROKE_W} />
    </g>
  );
}

/* ── container ─────────────────────────────────────────── */

export function Schematic({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: "block" }}
    >
      {children}
    </svg>
  );
}
