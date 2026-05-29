import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { INV_CATEGORIES } from "@/data/inventory-seed";
import {
  inventoryItemSchema,
  type InventoryItem,
  type InvCategory,
} from "@/data/schemas";

type FormState = {
  name: string;
  pn: string;
  cat: InvCategory;
  qty: string;
  min: string;
  bin: string;
  supplier: string;
  unitCost: string;
  notes: string;
};

function toForm(item: InventoryItem | null): FormState {
  return {
    name: item?.name ?? "",
    pn: item?.pn ?? "",
    cat: item?.cat ?? "ic",
    qty: String(item?.qty ?? 0),
    min: String(item?.min ?? 0),
    bin: item?.bin ?? "",
    supplier: item?.supplier ?? "",
    unitCost: String(item?.unitCost ?? 0),
    notes: item?.notes ?? "",
  };
}

type Props = {
  item: InventoryItem | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (
    patch: Pick<
      InventoryItem,
      "name" | "pn" | "cat" | "qty" | "min" | "bin" | "supplier" | "unitCost" | "notes"
    >,
  ) => void;
};

export function ItemEditor({ item, isNew, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(item));
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = form.name.trim();
    if (!trimmed) {
      setNameError("Name is required.");
      return;
    }
    const cleaned = {
      name: trimmed,
      pn: form.pn.trim(),
      cat: form.cat,
      qty: Number(form.qty) || 0,
      min: Number(form.min) || 0,
      bin: form.bin.trim(),
      supplier: form.supplier.trim(),
      unitCost: Number(form.unitCost) || 0,
      notes: form.notes,
    };
    // Validate against schema before bubbling up
    const probe = inventoryItemSchema.safeParse({
      id: item?.id ?? "_probe",
      unit: item?.unit ?? "pcs",
      tags: item?.tags ?? [],
      ...cleaned,
    });
    if (!probe.success) {
      setNameError(probe.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    onSave(cleaned);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <form
        className="w-full max-w-[480px] h-full bg-bg-2 border-l border-line-2 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-line">
          <div>
            <div className="font-mono font-mono-features text-[10.5px] uppercase tracking-[0.12em] text-faint mb-1">
              {isNew ? "new item" : "edit item"}
            </div>
            <div className="text-[17px] text-text font-medium">
              {isNew ? "Add to inventory" : form.name || "—"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="text-faint hover:text-text-2 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-5 flex flex-col gap-4">
          <Field label="Name" required error={nameError}>
            <input
              autoFocus
              className="inv-input"
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. ESP32-WROOM-32"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Manufacturer PN">
              <input
                className="inv-input font-mono font-mono-features"
                value={form.pn}
                onChange={(e) => set("pn", e.target.value)}
                placeholder="ESP32-WROOM-32E"
              />
            </Field>
            <Field label="Category">
              <select
                className="inv-input"
                value={form.cat}
                onChange={(e) => set("cat", e.target.value as InvCategory)}
              >
                {INV_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Quantity">
              <input
                className="inv-input font-mono font-mono-features"
                type="number"
                min={0}
                step={1}
                value={form.qty}
                onChange={(e) => set("qty", e.target.value)}
              />
            </Field>
            <Field label="Min / reorder">
              <input
                className="inv-input font-mono font-mono-features"
                type="number"
                min={0}
                step={1}
                value={form.min}
                onChange={(e) => set("min", e.target.value)}
              />
            </Field>
            <Field label="Bin">
              <input
                className="inv-input font-mono font-mono-features"
                value={form.bin}
                onChange={(e) => set("bin", e.target.value)}
                placeholder="A3-2"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Supplier">
              <input
                className="inv-input"
                value={form.supplier}
                onChange={(e) => set("supplier", e.target.value)}
                placeholder="DigiKey, Mouser, LCSC…"
              />
            </Field>
            <Field label="Unit cost (USD)">
              <input
                className="inv-input font-mono font-mono-features"
                type="number"
                min={0}
                step={0.001}
                value={form.unitCost}
                onChange={(e) => set("unitCost", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              className="inv-input min-h-[88px] resize-y"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="datasheet quirks, intended project, etc."
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-line bg-bg">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-[12.5px] text-muted border border-line rounded-md hover:border-line-2 hover:text-text-2 transition-colors"
          >
            cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-[12.5px] text-accent bg-accent/10 border border-accent/40 rounded-md hover:bg-accent/20 transition-colors"
          >
            {isNew ? "add item" : "save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono font-mono-features text-[10.5px] uppercase tracking-[0.1em] text-faint">
        {label}
        {required && <em className="not-italic text-accent ml-0.5">*</em>}
      </span>
      {children}
      {error && (
        <span className="font-mono font-mono-features text-[10.5px] text-rose">⚠ {error}</span>
      )}
    </label>
  );
}
