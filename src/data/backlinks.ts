import { isValidElement, type ReactElement, type ReactNode } from "react";
import { BY_SLUG } from "@/data/corpus";
import type { Entry } from "./schemas";
import {
  ArchetypeBodies,
  ComparisonBodies,
  ComponentBodies,
  DomainBodies,
  JournalBodies,
  PrincipleBodies,
  ProjectBodies,
  ToolBodies,
} from "@/pages/bodies";

/**
 * Walks a body's React tree without rendering it: visits prop values
 * recursively so we catch <a href> links nested inside custom components'
 * children, rows arrays, and similar content props. Function-typed elements
 * (custom components) aren't invoked — we only inspect what their parent
 * passes in via props.
 */
function walk(node: ReactNode, into: Set<string>, depth = 0): void {
  if (node == null || typeof node === "boolean") return;
  if (typeof node === "string" || typeof node === "number") return;
  if (depth > 64) return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child as ReactNode, into, depth + 1);
    return;
  }
  if (!isValidElement(node)) return;

  const el = node as ReactElement<Record<string, unknown>>;
  if (el.type === "a") {
    const href = el.props.href;
    if (typeof href === "string") {
      const m = href.match(/^#\/(.+)$/);
      if (m) into.add(m[1]);
    }
  }
  for (const key of Object.keys(el.props)) {
    walk(el.props[key] as ReactNode, into, depth + 1);
  }
}

let cache: Map<string, Entry[]> | null = null;

function compute(): Map<string, Entry[]> {
  const refs = new Map<string, Set<string>>();

  const registries = [
    DomainBodies,
    ArchetypeBodies,
    ProjectBodies,
    ComponentBodies,
    ToolBodies,
    PrincipleBodies,
    ComparisonBodies,
    JournalBodies,
  ];

  for (const reg of registries) {
    for (const [sourceSlug, Body] of Object.entries(reg)) {
      if (!BY_SLUG[sourceSlug]) continue;
      const found = new Set<string>();
      try {
        walk(Body() as ReactNode, found);
      } catch {
        /* body not safely walkable */
      }
      for (const target of found) {
        if (target === sourceSlug || !BY_SLUG[target]) continue;
        let set = refs.get(target);
        if (!set) {
          set = new Set();
          refs.set(target, set);
        }
        set.add(sourceSlug);
      }
    }
  }

  const out = new Map<string, Entry[]>();
  for (const [target, sources] of refs) {
    const entries = [...sources]
      .map((s) => BY_SLUG[s])
      .filter((e): e is Entry => Boolean(e))
      .sort((a, b) => a.title.localeCompare(b.title));
    out.set(target, entries);
  }
  return out;
}

export function getBacklinks(slug: string): Entry[] {
  if (!cache) cache = compute();
  return cache.get(slug) ?? [];
}
