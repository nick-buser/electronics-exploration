import clsx from "clsx";
import type { ReactNode } from "react";

export function DemoFrame({
  label = "// demo",
  title,
  readouts,
  children,
  controls,
}: {
  label?: string;
  title: string;
  readouts?: ReactNode;
  children: ReactNode;
  controls?: ReactNode;
}) {
  return (
    <div className="my-8 bg-surface border border-line rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-line bg-bg-2">
        <span className="font-mono font-mono-features text-[10px] uppercase tracking-[0.12em] text-faint">
          {label}
        </span>
        <span className="text-[13px] text-text-2">{title}</span>
        <span className="flex-1" />
        {readouts}
      </div>
      <div className="p-5">{children}</div>
      {controls && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-5 py-4 border-t border-line bg-bg-2">
          {controls}
        </div>
      )}
    </div>
  );
}

export function Readout({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 px-2 py-1 rounded bg-bg border border-line">
      <span className="font-mono font-mono-features text-[10px] uppercase tracking-[0.1em] text-faint">
        {label}
      </span>
      <span className="font-mono font-mono-features text-[12.5px] text-text">{value}</span>
    </span>
  );
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  display?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between text-[12px] text-muted">
        <span>{label}</span>
        <span className="font-mono font-mono-features text-text-2">
          {display ?? value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent"
      />
    </label>
  );
}

export function Seg<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-md border border-line overflow-hidden bg-bg">
      {options.map((o, i) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "px-3 py-1 text-[12px] transition-colors",
            i > 0 && "border-l border-line",
            value === o.value
              ? "bg-accent/15 text-accent"
              : "text-muted hover:bg-hover hover:text-text-2",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
