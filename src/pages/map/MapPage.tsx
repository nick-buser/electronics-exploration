import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import clsx from "clsx";
import { buildGraph } from "./graph-data";
import { layoutGraph } from "./layout";
import { EntryNode } from "./EntryNode";
import { TYPE_META } from "@/data/corpus";
import type { EntryType } from "@/data/schemas";
import { navigate } from "@/app/hash-route";

const ALL_TYPES = Object.keys(TYPE_META) as EntryType[];

const TYPE_DOT: Record<EntryType, string> = {
  domain: "bg-accent",
  archetype: "bg-amber",
  project: "bg-violet",
  component: "bg-sky",
  tool: "bg-rose",
  principle: "bg-text-2",
  comparison: "bg-muted",
  journal: "bg-faint",
};

const NODE_TYPES = {
  domain: EntryNode,
  archetype: EntryNode,
  project: EntryNode,
  component: EntryNode,
  tool: EntryNode,
  principle: EntryNode,
  comparison: EntryNode,
  journal: EntryNode,
};

export function MapPage() {
  const [enabled, setEnabled] = useState<Set<EntryType>>(() => new Set(ALL_TYPES));
  const [direction, setDirection] = useState<"TB" | "LR">("TB");

  const { nodes, edges } = useMemo(() => {
    const g = buildGraph({ types: enabled });
    return layoutGraph(g.nodes, g.edges, direction);
  }, [enabled, direction]);

  const onNodeClick: NodeMouseHandler = (_e, node) => {
    navigate(node.id);
  };

  function toggleType(t: EntryType) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      // Always keep at least one type enabled
      if (next.size === 0) return prev;
      return next;
    });
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Header strip — sits inside the content area */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-line bg-bg-2">
        <div>
          <div className="font-mono font-mono-features text-[10px] uppercase tracking-[0.14em] text-accent">
            Atlas
          </div>
          <div className="text-[18px] font-serif text-text leading-tight">Map</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-mono-features text-[10.5px] uppercase tracking-[0.1em] text-faint mr-1">
            layout
          </span>
          <button
            onClick={() => setDirection("TB")}
            className={clsx(
              "px-2 py-1 text-[11.5px] font-mono font-mono-features border rounded transition-colors",
              direction === "TB"
                ? "bg-accent/10 border-accent/40 text-accent"
                : "bg-transparent border-line text-muted hover:border-line-2 hover:text-text-2",
            )}
          >
            top → bottom
          </button>
          <button
            onClick={() => setDirection("LR")}
            className={clsx(
              "px-2 py-1 text-[11.5px] font-mono font-mono-features border rounded transition-colors",
              direction === "LR"
                ? "bg-accent/10 border-accent/40 text-accent"
                : "bg-transparent border-line text-muted hover:border-line-2 hover:text-text-2",
            )}
          >
            left → right
          </button>
        </div>
      </div>

      {/* Legend / type toggles */}
      <div className="flex flex-wrap items-center gap-1.5 px-6 py-2 border-b border-line bg-bg-2">
        <span className="font-mono font-mono-features text-[10px] uppercase tracking-[0.1em] text-faint mr-1">
          show
        </span>
        {ALL_TYPES.map((t) => {
          const on = enabled.has(t);
          return (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={clsx(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono font-mono-features text-[10.5px] border transition-colors",
                on
                  ? "bg-bg border-line-2 text-text-2"
                  : "bg-transparent border-line text-faint opacity-60 hover:opacity-100",
              )}
            >
              <span className={clsx("size-1.5 rounded-full", TYPE_DOT[t])} />
              {TYPE_META[t].label}
            </button>
          );
        })}
        <span className="ml-auto font-mono font-mono-features text-[10.5px] text-faint">
          {nodes.length} nodes · {edges.length} edges
        </span>
      </div>

      {/* Graph canvas */}
      <div className="flex-1 min-h-0 bg-bg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodeClick={onNodeClick}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-line)" />
          <Controls
            showInteractive={false}
            className="!bg-bg-2 !border-line"
            style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)" }}
          />
          <MiniMap
            zoomable
            pannable
            nodeColor={(n) => {
              const t = n.type as EntryType;
              return (
                {
                  domain: "var(--color-accent)",
                  archetype: "var(--color-amber)",
                  project: "var(--color-violet)",
                  component: "var(--color-sky)",
                  tool: "var(--color-rose)",
                  principle: "var(--color-text-2)",
                  comparison: "var(--color-muted)",
                  journal: "var(--color-faint)",
                }[t] ?? "var(--color-muted)"
              );
            }}
            maskColor="rgba(10, 13, 18, 0.7)"
            style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)" }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
