import { Handle, Position, type NodeProps } from "reactflow";
import clsx from "clsx";
import type { GraphNodeData } from "./graph-data";

const TYPE_STYLES: Record<string, { ring: string; text: string; dot: string }> = {
  domain: { ring: "border-accent/60", text: "text-accent", dot: "bg-accent" },
  archetype: { ring: "border-amber/60", text: "text-amber", dot: "bg-amber" },
  project: { ring: "border-violet/60", text: "text-violet", dot: "bg-violet" },
  component: { ring: "border-sky/60", text: "text-sky", dot: "bg-sky" },
  tool: { ring: "border-rose/60", text: "text-rose", dot: "bg-rose" },
  principle: { ring: "border-text-2/40", text: "text-text-2", dot: "bg-text-2" },
  comparison: { ring: "border-muted/50", text: "text-muted", dot: "bg-muted" },
  journal: { ring: "border-faint/50", text: "text-faint", dot: "bg-faint" },
};

export function EntryNode({ data }: NodeProps<GraphNodeData>) {
  const t = data.entry.type;
  const s = TYPE_STYLES[t] ?? TYPE_STYLES.principle;
  return (
    <div
      className={clsx(
        "group w-[168px] h-[44px] px-2.5 py-1.5 bg-surface border rounded-md shadow-sm flex items-center gap-2 cursor-pointer transition-colors hover:bg-surface-2 hover:border-text-2/60",
        s.ring,
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-1 !h-1" />
      <span className={clsx("size-1.5 rounded-full shrink-0", s.dot)} />
      <div className="flex flex-col min-w-0 leading-tight">
        <span className={clsx("font-mono font-mono-features text-[8.5px] uppercase tracking-[0.1em]", s.text)}>
          {data.typeLabel}
        </span>
        <span className="text-[12px] text-text truncate">{data.entry.title}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-1 !h-1" />
    </div>
  );
}
