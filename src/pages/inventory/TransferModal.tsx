import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { inventoryFileSchema, type InventoryItem } from "@/data/schemas";
import { uid } from "@/lib/uid";

const STORAGE_VERSION = 1;

type ImportMode = "replace" | "merge";

type ExportProps = {
  mode: "export";
  items: InventoryItem[];
  onClose: () => void;
};

type ImportProps = {
  mode: "import";
  items: InventoryItem[];
  onClose: () => void;
  onImport: (items: InventoryItem[], mode: ImportMode) => void;
};

type Props = ExportProps | ImportProps;

export function TransferModal(props: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-start justify-center pt-[8vh]"
      onClick={props.onClose}
    >
      <div
        className="w-full max-w-[680px] mx-4 bg-bg-2 border border-line-2 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[84vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {props.mode === "export" ? <ExportBody {...props} /> : <ImportBody {...props} />}
      </div>
    </div>
  );
}

/* ── Export ─────────────────────────────────────────── */
function ExportBody({ items, onClose }: ExportProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const exportText = useMemo(
    () =>
      JSON.stringify(
        {
          v: STORAGE_VERSION,
          generator: "bench-atlas",
          exported: new Date().toISOString(),
          count: items.length,
          items,
        },
        null,
        2,
      ),
    [items],
  );

  function copy() {
    navigator.clipboard
      .writeText(exportText)
      .then(() => flashCopied())
      .catch(() => {
        textareaRef.current?.select();
        document.execCommand("copy");
        flashCopied();
      });
  }
  function flashCopied() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  function download() {
    const blob = new Blob([exportText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <>
      <Header eyebrow="export · json" title="Your inventory as JSON" onClose={onClose} />
      <div className="px-6 py-2 font-mono font-mono-features text-[11px] text-faint">
        {items.length} items · {exportText.length.toLocaleString()} chars
      </div>
      <div className="flex-1 overflow-auto px-6 pb-2">
        <textarea
          ref={textareaRef}
          className="inv-json"
          value={exportText}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
        />
      </div>
      <Footer>
        <span className="font-mono font-mono-features text-[11px] text-muted mr-auto">
          {copied ? "✓ copied to clipboard" : "select-all on focus · or use the buttons →"}
        </span>
        <button
          onClick={download}
          className="px-3 py-1.5 text-[12.5px] text-muted border border-line rounded-md hover:border-line-2 hover:text-text-2 transition-colors"
        >
          ↓ download .json
        </button>
        <button
          onClick={copy}
          className="px-3 py-1.5 text-[12.5px] text-accent bg-accent/10 border border-accent/40 rounded-md hover:bg-accent/20 transition-colors"
        >
          {copied ? "copied!" : "copy to clipboard"}
        </button>
      </Footer>
    </>
  );
}

/* ── Import ─────────────────────────────────────────── */
function ImportBody({ items, onClose, onImport }: ImportProps) {
  const [paste, setPaste] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("replace");
  const [parsed, setParsed] = useState<InventoryItem[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (!paste.trim()) {
      setParsed(null);
      setParseError(null);
      return;
    }
    try {
      const raw = JSON.parse(paste);
      const r = inventoryFileSchema.safeParse(raw);
      if (!r.success) {
        const first = r.error.issues[0];
        const path = first?.path?.join(".");
        setParsed(null);
        setParseError(
          path ? `${first?.message} (at ${path})` : first?.message ?? "Invalid inventory JSON",
        );
        return;
      }
      const arr = Array.isArray(r.data) ? r.data : r.data.items;
      const today = new Date().toISOString().slice(0, 10);
      const filled: InventoryItem[] = arr.map((i) => ({
        id: i.id ?? uid(),
        unit: i.unit ?? "pcs",
        tags: i.tags ?? [],
        notes: i.notes ?? "",
        updated: i.updated ?? today,
        name: i.name!,
        pn: i.pn ?? "",
        cat: i.cat!,
        qty: i.qty ?? 0,
        min: i.min ?? 0,
        bin: i.bin ?? "",
        supplier: i.supplier ?? "",
        unitCost: i.unitCost ?? 0,
      }));
      setParsed(filled);
      setParseError(null);
    } catch (e) {
      setParsed(null);
      setParseError(e instanceof Error ? e.message : String(e));
    }
  }, [paste]);

  const previewDelta = useMemo(() => {
    if (!parsed) return null;
    if (importMode === "replace") {
      return `replace ${items.length} → ${parsed.length}`;
    }
    const existing = new Set(items.map((i) => i.id));
    const added = parsed.filter((p) => !existing.has(p.id)).length;
    const updated = parsed.length - added;
    return `+${added} new · ${updated} updated · ${items.length - updated} kept`;
  }, [parsed, importMode, items]);

  return (
    <>
      <Header eyebrow="import · json" title="Paste an inventory JSON" onClose={onClose} />
      <div className="px-6 py-2 flex items-center gap-1.5">
        <ModePill active={importMode === "replace"} onClick={() => setImportMode("replace")}>
          replace all
        </ModePill>
        <ModePill active={importMode === "merge"} onClick={() => setImportMode("merge")}>
          merge by id
        </ModePill>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-2">
        <textarea
          className="inv-json"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder='Paste JSON here — either an array of items, or { "items": [ ... ] } as produced by export.'
        />
      </div>
      <div className="px-6 py-2 font-mono font-mono-features text-[11px]">
        {parseError && <span className="text-rose">⚠ {parseError}</span>}
        {parsed && (
          <span className="text-accent">
            ✓ parsed {parsed.length} item{parsed.length === 1 ? "" : "s"} · {previewDelta}
          </span>
        )}
        {!paste.trim() && <span className="text-faint">waiting for paste…</span>}
      </div>
      <Footer>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-[12.5px] text-muted border border-line rounded-md hover:border-line-2 hover:text-text-2 transition-colors"
        >
          cancel
        </button>
        <button
          onClick={() => parsed && onImport(parsed, importMode)}
          disabled={!parsed}
          className={clsx(
            "px-3 py-1.5 text-[12.5px] border rounded-md transition-colors",
            parsed
              ? "text-accent bg-accent/10 border-accent/40 hover:bg-accent/20"
              : "text-faint border-line cursor-not-allowed opacity-50",
          )}
        >
          {importMode === "replace" ? "replace inventory" : "merge into inventory"}
        </button>
      </Footer>
    </>
  );
}

/* ── shared bits ─────────────────────────────────────── */
function Header({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-line">
      <div>
        <div className="font-mono font-mono-features text-[10.5px] uppercase tracking-[0.12em] text-faint mb-1">
          {eyebrow}
        </div>
        <div className="text-[17px] text-text font-medium">{title}</div>
      </div>
      <button
        onClick={onClose}
        aria-label="close"
        className="text-faint hover:text-text-2 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-line bg-bg">
      {children}
    </div>
  );
}

function ModePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-1 text-[11.5px] font-mono font-mono-features rounded-full border transition-colors",
        active
          ? "bg-accent/10 border-accent/40 text-accent"
          : "bg-transparent border-line text-muted hover:border-line-2 hover:text-text-2",
      )}
    >
      {children}
    </button>
  );
}
