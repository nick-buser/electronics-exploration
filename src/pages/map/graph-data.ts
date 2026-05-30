import type { Edge, Node } from "reactflow";
import {
  ARCHETYPES,
  COMPARISONS,
  COMPONENTS,
  DOMAINS,
  JOURNAL,
  PRINCIPLES,
  PROJECTS,
  TOOLS,
} from "@/data/corpus";
import type { Entry, EntryType } from "@/data/schemas";

export type GraphNodeData = {
  entry: Entry;
  typeLabel: string;
};

const TYPE_LABEL: Record<EntryType, string> = {
  domain: "Domain",
  archetype: "Archetype",
  project: "Project",
  component: "Component",
  tool: "Tool",
  principle: "Principle",
  comparison: "Comparison",
  journal: "Journal",
};

function makeNode(entry: Entry): Node<GraphNodeData> {
  return {
    id: entry.slug,
    type: entry.type,
    data: { entry, typeLabel: TYPE_LABEL[entry.type] },
    position: { x: 0, y: 0 },
  };
}

function edge(from: string, to: string, kind: string): Edge {
  return {
    id: `${from}->${to}`,
    source: from,
    target: to,
    type: "smoothstep",
    data: { kind },
    style: { stroke: "var(--color-line-2)", strokeWidth: 1 },
  };
}

export function buildGraph(opts: { types: Set<EntryType> }): {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
} {
  const { types } = opts;

  const all: Entry[] = [
    ...DOMAINS,
    ...ARCHETYPES,
    ...PROJECTS,
    ...COMPONENTS,
    ...TOOLS,
    ...PRINCIPLES,
    ...COMPARISONS,
    ...JOURNAL,
  ];
  const enabled = new Set(all.filter((e) => types.has(e.type)).map((e) => e.slug));
  const nodes = all.filter((e) => enabled.has(e.slug)).map(makeNode);

  const edges: Edge[] = [];

  // domain → archetype
  for (const a of ARCHETYPES) {
    if (a.domain && enabled.has(a.domain) && enabled.has(a.slug)) {
      edges.push(edge(a.domain, a.slug, "domain"));
    }
  }
  // archetype → project, or domain → project if no archetype
  for (const p of PROJECTS) {
    if (!enabled.has(p.slug)) continue;
    if (p.archetype && enabled.has(p.archetype)) {
      edges.push(edge(p.archetype, p.slug, "archetype"));
    } else if (p.domain && enabled.has(p.domain)) {
      edges.push(edge(p.domain, p.slug, "domain"));
    }
  }
  // project → journal
  for (const j of JOURNAL) {
    if (!enabled.has(j.slug)) continue;
    if (j.project && enabled.has(j.project)) {
      edges.push(edge(j.project, j.slug, "project"));
    }
  }
  // domain → leaf (component / tool / principle / comparison)
  const leaves = [...COMPONENTS, ...TOOLS, ...PRINCIPLES, ...COMPARISONS];
  for (const l of leaves) {
    if (!enabled.has(l.slug)) continue;
    if (l.domain && enabled.has(l.domain)) edges.push(edge(l.domain, l.slug, "domain"));
  }

  return { nodes, edges };
}
