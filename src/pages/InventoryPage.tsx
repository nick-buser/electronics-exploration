import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import { INV_CATEGORIES, INV_CAT_LABEL, INV_SEED } from "@/data/inventory-seed";
import { inventoryItemSchema, type InventoryItem } from "@/data/schemas";
import { uid } from "@/lib/uid";
import { ItemEditor } from "./inventory/ItemEditor";
import { TransferModal } from "./inventory/TransferModal";

type EditTarget = string | "new" | null;
type TransferTarget = "import" | "export" | null;

const STORAGE_KEY = "bench-inventory-v1";
const STORAGE_VERSION = 1;

type SortKey = keyof InventoryItem;
type SortDir = 1 | -1;

function loadInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INV_SEED;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return INV_SEED;
    const validated: InventoryItem[] = [];
    for (const item of parsed.items) {
      const r = inventoryItemSchema.safeParse(item);
      if (r.success) validated.push(r.data);
    }
    return validated.length > 0 ? validated : INV_SEED;
  } catch {
    return INV_SEED;
  }
}

function saveInventory(items: InventoryItem[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        v: STORAGE_VERSION,
        items,
        updated: new Date().toISOString(),
      }),
    );
  } catch {
    /* ignore quota errors */
  }
}

function fmtMoney(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(loadInventory);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>(1);
  const [editing, setEditing] = useState<EditTarget>(null);
  const [transferOpen, setTransferOpen] = useState<TransferTarget>(null);

  useEffect(() => {
    saveInventory(items);
  }, [items]);

  const editingItem =
    editing && editing !== "new" ? items.find((i) => i.id === editing) ?? null : null;

  function patchItem(
    id: string,
    patch: Partial<Omit<InventoryItem, "id" | "unit" | "tags" | "updated">>,
  ) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, ...patch, updated: new Date().toISOString().slice(0, 10) }
          : i,
      ),
    );
  }

  function addItem(item: Omit<InventoryItem, "id" | "unit" | "tags" | "updated">) {
    const fresh: InventoryItem = {
      id: uid(),
      unit: "pcs",
      tags: [],
      updated: new Date().toISOString().slice(0, 10),
      ...item,
    };
    setItems((prev) => [fresh, ...prev]);
  }

  function applyImport(next: InventoryItem[], mode: "replace" | "merge") {
    if (mode === "replace") {
      setItems(next);
    } else {
      const byId = new Map(items.map((i) => [i.id, i]));
      next.forEach((i) => byId.set(i.id, i));
      setItems(Array.from(byId.values()));
    }
    setTransferOpen(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool = items;
    if (catFilter !== "all") pool = pool.filter((i) => i.cat === catFilter);
    if (lowOnly) pool = pool.filter((i) => i.qty <= (i.min || 0));
    if (q) {
      pool = pool.filter(
        (i) =>
          (i.name || "").toLowerCase().includes(q) ||
          (i.pn || "").toLowerCase().includes(q) ||
          (i.bin || "").toLowerCase().includes(q) ||
          (i.supplier || "").toLowerCase().includes(q) ||
          (i.notes || "").toLowerCase().includes(q),
      );
    }
    return [...pool].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });
  }, [items, query, catFilter, lowOnly, sortKey, sortDir]);

  const stats = useMemo(() => {
    const lineValue = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
    const low = items.filter((i) => i.qty <= (i.min || 0)).length;
    const bins = new Set(items.map((i) => i.bin).filter(Boolean)).size;
    return { skus: items.length, lineValue, low, bins };
  }, [items]);

  function setSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(k);
      setSortDir(1);
    }
  }

  function bumpQty(id: string, delta: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              qty: Math.max(0, i.qty + delta),
              updated: new Date().toISOString().slice(0, 10),
            }
          : i,
      ),
    );
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function resetToSeed() {
    if (!confirm("Reset inventory to seed data? Your current items will be lost.")) return;
    setItems(INV_SEED);
  }

  return (
    <div className="prose-bench">
      <div className="pb-8 mb-8 border-b border-line">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="font-mono font-mono-features text-[10px] uppercase tracking-[0.14em] text-accent">
            Workspace
          </span>
          <span className="font-mono font-mono-features text-[11px] text-faint">
            parts manifest · localStorage
          </span>
        </div>
        <h1 className="text-[36px] leading-[1.15] font-serif font-normal text-text mb-3">Inventory</h1>
        <div className="text-[16px] leading-[1.55] text-text-2 max-w-3xl">
          A running parts manifest. Where each component lives, how many remain, what the spend has been. Edits persist
          locally; export the whole table as JSON to back up, share, or sync with another machine.
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="distinct SKUs" value={stats.skus} />
        <Stat label="line value" value={fmtMoney(stats.lineValue)} accent />
        <Stat label="low / reorder" value={stats.low} warn={stats.low > 0} />
        <Stat label="bins in use" value={stats.bins} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-line rounded-md flex-1 min-w-[260px]">
          <Search size={13} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="filter by name, part #, bin, supplier, notes…"
            className="flex-1 bg-transparent border-0 outline-0 text-[13px] placeholder:text-faint"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-faint hover:text-text-2">
              ×
            </button>
          )}
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-line rounded-md text-[13px] text-text-2"
        >
          <option value="all">all categories</option>
          {INV_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-3 py-2 bg-surface border border-line rounded-md text-[12.5px] text-text-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="accent-accent"
          />
          <span>low stock only</span>
        </label>
        <div className="flex-1" />
        <button
          onClick={() => setTransferOpen("import")}
          className="px-3 py-2 text-[12.5px] text-muted border border-line rounded-md hover:border-line-2 hover:text-text-2 transition-colors"
        >
          ↑ import
        </button>
        <button
          onClick={() => setTransferOpen("export")}
          className="px-3 py-2 text-[12.5px] text-muted border border-line rounded-md hover:border-line-2 hover:text-text-2 transition-colors"
        >
          ↓ export
        </button>
        <button
          onClick={() => setEditing("new")}
          className="px-3 py-2 text-[12.5px] text-accent bg-accent/10 border border-accent/40 rounded-md hover:bg-accent/20 transition-colors"
        >
          + add item
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-line rounded-lg bg-surface">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line bg-bg-2">
              <Th k="name" sortKey={sortKey} dir={sortDir} onSort={setSort}>Part</Th>
              <Th k="pn" sortKey={sortKey} dir={sortDir} onSort={setSort}>MPN</Th>
              <Th k="cat" sortKey={sortKey} dir={sortDir} onSort={setSort}>Category</Th>
              <Th k="bin" sortKey={sortKey} dir={sortDir} onSort={setSort}>Bin</Th>
              <Th k="qty" sortKey={sortKey} dir={sortDir} onSort={setSort} align="right">Qty</Th>
              <Th k="min" sortKey={sortKey} dir={sortDir} onSort={setSort} align="right">Min</Th>
              <Th k="unitCost" sortKey={sortKey} dir={sortDir} onSort={setSort} align="right">Unit</Th>
              <th className="text-right px-3 py-2.5 font-mono font-mono-features text-[10.5px] uppercase tracking-[0.08em] text-faint">Line</th>
              <Th k="supplier" sortKey={sortKey} dir={sortDir} onSort={setSort}>Supplier</Th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-muted">
                  No items match the current filter.
                </td>
              </tr>
            )}
            {filtered.map((i) => {
              const low = i.qty <= (i.min || 0);
              const line = i.qty * i.unitCost;
              return (
                <tr key={i.id} className={clsx("border-b border-line last:border-0 hover:bg-hover/40", low && "bg-amber/5")}>
                  <td className="px-3 py-2.5 align-top">
                    <div className="text-text">{i.name}</div>
                    {i.notes && <div className="text-[11.5px] text-muted mt-0.5">{i.notes}</div>}
                  </td>
                  <td className="px-3 py-2.5 align-top font-mono font-mono-features text-muted">{i.pn || "—"}</td>
                  <td className="px-3 py-2.5 align-top">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-bg-2 border border-line text-[11px] text-text-2">
                      {INV_CAT_LABEL[i.cat] ?? i.cat}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-top font-mono font-mono-features text-text-2">{i.bin || "—"}</td>
                  <td className="px-3 py-2.5 align-top">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => bumpQty(i.id, -1)}
                        className="size-6 grid place-items-center rounded border border-line text-muted hover:border-line-2 hover:text-text"
                      >
                        −
                      </button>
                      <span className={clsx("font-mono font-mono-features w-8 text-right", low && "text-amber")}>
                        {i.qty}
                      </span>
                      <button
                        onClick={() => bumpQty(i.id, +1)}
                        className="size-6 grid place-items-center rounded border border-line text-muted hover:border-line-2 hover:text-text"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-top text-right font-mono font-mono-features text-muted">{i.min}</td>
                  <td className="px-3 py-2.5 align-top text-right font-mono font-mono-features text-text-2">{fmtMoney(i.unitCost)}</td>
                  <td className="px-3 py-2.5 align-top text-right font-mono font-mono-features text-text-2">{fmtMoney(line)}</td>
                  <td className="px-3 py-2.5 align-top text-muted">{i.supplier || "—"}</td>
                  <td className="px-3 py-2.5 align-top text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditing(i.id)}
                      className="font-mono font-mono-features text-[10.5px] uppercase text-faint hover:text-text-2 mr-2"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${i.name}"?`)) deleteItem(i.id);
                      }}
                      className="font-mono font-mono-features text-[10.5px] uppercase text-faint hover:text-rose"
                    >
                      del
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 font-mono font-mono-features text-[11px] text-muted">
        Showing {filtered.length} of {items.length} · stored under <code>{STORAGE_KEY}</code> ·{" "}
        <button onClick={resetToSeed} className="underline hover:text-text-2">
          reset to seed
        </button>
      </div>

      {editing && (
        <ItemEditor
          item={editingItem}
          isNew={editing === "new"}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            if (editing === "new") addItem(patch);
            else patchItem(editing, patch);
            setEditing(null);
          }}
        />
      )}

      {transferOpen === "export" && (
        <TransferModal mode="export" items={items} onClose={() => setTransferOpen(null)} />
      )}
      {transferOpen === "import" && (
        <TransferModal
          mode="import"
          items={items}
          onClose={() => setTransferOpen(null)}
          onImport={applyImport}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={clsx(
        "p-4 rounded-lg border bg-surface",
        warn ? "border-amber/40" : "border-line",
      )}
    >
      <div className="font-mono font-mono-features text-[10px] uppercase tracking-[0.1em] text-faint mb-1">
        {label}
      </div>
      <div
        className={clsx(
          "font-mono font-mono-features text-[22px]",
          accent ? "text-accent" : warn ? "text-amber" : "text-text",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Th({
  k,
  sortKey,
  dir,
  onSort,
  children,
  align,
}: {
  k: SortKey;
  sortKey: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  children: React.ReactNode;
  align?: "right";
}) {
  const active = sortKey === k;
  return (
    <th
      onClick={() => onSort(k)}
      className={clsx(
        "px-3 py-2.5 font-mono font-mono-features text-[10.5px] uppercase tracking-[0.08em] cursor-pointer select-none transition-colors",
        active ? "text-text-2" : "text-faint hover:text-muted",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      <span>{children}</span>
      <span className="ml-1 text-faint">{active ? (dir > 0 ? "↑" : "↓") : "·"}</span>
    </th>
  );
}
