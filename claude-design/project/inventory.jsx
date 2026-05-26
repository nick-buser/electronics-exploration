/* ──────────────────────────────────────────────────────────
   INVENTORY — parts manifest with JSON import/export.
   Persisted to localStorage. Lives at #/inventory.
   ────────────────────────────────────────────────────────── */

const { useState: useSI, useEffect: useEI, useMemo: useMI, useRef: useRI } = React;

const INV_STORAGE_KEY = "bench-inventory-v1";
const INV_VERSION = 1;

const INV_CATEGORIES = [
  { key: "mcu",        label: "MCU / SoC" },
  { key: "ic",         label: "IC" },
  { key: "passive",    label: "Passive" },
  { key: "sensor",     label: "Sensor" },
  { key: "actuator",   label: "Motor / Actuator" },
  { key: "power",      label: "Power" },
  { key: "connector",  label: "Connector / Cable" },
  { key: "module",     label: "Module / Breakout" },
  { key: "mech",       label: "Mechanical" },
  { key: "consumable", label: "Consumable" },
  { key: "tool",       label: "Tool" },
  { key: "other",      label: "Other" },
];
const INV_CAT_LABEL = Object.fromEntries(INV_CATEGORIES.map(c => [c.key, c.label]));

/* ── Seed data — only used if localStorage is empty ─────── */
const INV_SEED = [
  { id: "i-esp32",    name: "ESP32-WROOM-32",      pn: "ESP32-WROOM-32E",  cat: "mcu",       qty: 6,  min: 2,  bin: "A1-2", supplier: "DigiKey",     unitCost: 3.95, notes: "Used in bench harness + ECG. Dual core, Wi-Fi+BLE." },
  { id: "i-rp2040",   name: "RP2040 chip",         pn: "RP2040",           cat: "mcu",       qty: 4,  min: 3,  bin: "A1-3", supplier: "Mouser",      unitCost: 1.10, notes: "For the breakout v1 build." },
  { id: "i-stm32f4",  name: "STM32F411 Black Pill", pn: "STM32F411CEU6",   cat: "module",    qty: 2,  min: 1,  bin: "A2-1", supplier: "AliExpress",  unitCost: 6.20, notes: "USB-C version." },
  { id: "i-ad8232",   name: "AD8232",              pn: "AD8232ACPZ-R7",    cat: "ic",        qty: 3,  min: 1,  bin: "B1-1", supplier: "DigiKey",     unitCost: 5.40, notes: "ECG analog front-end." },
  { id: "i-drv8323",  name: "DRV8323",             pn: "DRV8323RSRGZR",    cat: "ic",        qty: 2,  min: 2,  bin: "B1-2", supplier: "DigiKey",     unitCost: 6.80, notes: "3-phase smart gate driver." },
  { id: "i-ina219",   name: "INA219 breakout",     pn: "Adafruit 904",     cat: "module",    qty: 2,  min: 1,  bin: "B2-1", supplier: "Adafruit",    unitCost: 9.95, notes: "I²C current/voltage sensor." },
  { id: "i-mpu6050",  name: "MPU-6050 IMU",        pn: "GY-521",           cat: "sensor",    qty: 5,  min: 2,  bin: "B2-3", supplier: "AliExpress",  unitCost: 2.30, notes: "6-axis IMU for balancer + arm." },
  { id: "i-ads1115",  name: "ADS1115 16-bit ADC",  pn: "ADS1115IDGSR",     cat: "ic",        qty: 4,  min: 2,  bin: "B1-3", supplier: "LCSC",        unitCost: 2.15 },
  { id: "i-dyna",     name: "Dynamixel-style servo", pn: "STS3215",        cat: "actuator",  qty: 6,  min: 6,  bin: "C1-1", supplier: "AliExpress",  unitCost: 18.50, notes: "SO-ARM100 joints." },
  { id: "i-nema17",   name: "NEMA17 stepper",      pn: "17HS19-2004S1",    cat: "actuator",  qty: 2,  min: 1,  bin: "C1-2", supplier: "StepperOnline", unitCost: 13.40 },
  { id: "i-buck",     name: "MP1584 buck",         pn: "MP1584EN",         cat: "power",     qty: 8,  min: 3,  bin: "D1-1", supplier: "AliExpress",  unitCost: 0.80, notes: "Adjustable 3A buck." },
  { id: "i-tp4056",   name: "TP4056 charger",      pn: "TP4056",           cat: "power",     qty: 10, min: 5,  bin: "D1-2", supplier: "AliExpress",  unitCost: 0.45 },
  { id: "i-18650",    name: "18650 Li-ion",        pn: "Samsung 30Q",      cat: "power",     qty: 4,  min: 4,  bin: "D2-1", supplier: "IMR",         unitCost: 6.50, notes: "3000 mAh, 15A continuous." },
  { id: "i-r1k",      name: "1 kΩ 0805 1%",        pn: "—",                cat: "passive",   qty: 180, min: 50, bin: "E1-1", supplier: "LCSC",       unitCost: 0.005 },
  { id: "i-r10k",     name: "10 kΩ 0805 1%",       pn: "—",                cat: "passive",   qty: 240, min: 50, bin: "E1-2", supplier: "LCSC",       unitCost: 0.005 },
  { id: "i-c100n",    name: "100 nF 0805 X7R",     pn: "—",                cat: "passive",   qty: 1, min: 50, bin: "E2-1", supplier: "LCSC",        unitCost: 0.01, notes: "REORDER — used most of bag on RP2040 breakout." },
  { id: "i-c10u",     name: "10 µF 0805 X5R",      pn: "—",                cat: "passive",   qty: 60, min: 25, bin: "E2-2", supplier: "LCSC",        unitCost: 0.03 },
  { id: "i-usbc",     name: "USB-C receptacle",    pn: "TYPE-C-31-M-12",   cat: "connector", qty: 8,  min: 4,  bin: "F1-1", supplier: "LCSC",        unitCost: 0.35 },
  { id: "i-jstph",    name: "JST-PH 2-pin",        pn: "B2B-PH-K-S",       cat: "connector", qty: 25, min: 10, bin: "F1-2", supplier: "DigiKey",     unitCost: 0.18 },
  { id: "i-solder",   name: "Sn63/Pb37 0.5mm",     pn: "Kester 24-6337",   cat: "consumable", qty: 1, min: 1,  bin: "G1-1", supplier: "DigiKey",     unitCost: 22.00, notes: "Spool, ~60% remaining." },
];

function invDefaults() {
  return INV_SEED.map(x => ({ unit: "pcs", tags: [], updated: new Date().toISOString().slice(0,10), ...x }));
}

function loadInventory() {
  try {
    const raw = localStorage.getItem(INV_STORAGE_KEY);
    if (!raw) return invDefaults();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return invDefaults();
    return parsed.items;
  } catch (_) {
    return invDefaults();
  }
}
function saveInventory(items) {
  try {
    localStorage.setItem(INV_STORAGE_KEY, JSON.stringify({ v: INV_VERSION, items, updated: new Date().toISOString() }));
  } catch (_) { /* ignore quota errors */ }
}

function uid() {
  return "i-" + Math.random().toString(36).slice(2, 9);
}

function fmtMoney(n) {
  if (n == null || isNaN(n)) return "—";
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}

/* ══════════════════════════════════════════════════════════
   InventoryPage
   ══════════════════════════════════════════════════════════ */
function InventoryPage() {
  const [items, setItems] = useSI(loadInventory);
  const [query, setQuery] = useSI("");
  const [catFilter, setCatFilter] = useSI("all");
  const [lowOnly, setLowOnly] = useSI(false);
  const [sort, setSort] = useSI({ key: "name", dir: 1 });
  const [editing, setEditing] = useSI(null); // item id or "new"
  const [transferOpen, setTransferOpen] = useSI(null); // "export" | "import" | null

  useEI(() => { saveInventory(items); }, [items]);
  useEI(() => {
    document.documentElement.classList.add("inv-route");
    return () => document.documentElement.classList.remove("inv-route");
  }, []);

  const filtered = useMI(() => {
    const q = query.trim().toLowerCase();
    let pool = items;
    if (catFilter !== "all") pool = pool.filter(i => i.cat === catFilter);
    if (lowOnly) pool = pool.filter(i => i.qty <= (i.min || 0));
    if (q) {
      pool = pool.filter(i =>
        (i.name || "").toLowerCase().includes(q) ||
        (i.pn || "").toLowerCase().includes(q) ||
        (i.bin || "").toLowerCase().includes(q) ||
        (i.supplier || "").toLowerCase().includes(q) ||
        (i.notes || "").toLowerCase().includes(q)
      );
    }
    const k = sort.key, d = sort.dir;
    pool = [...pool].sort((a, b) => {
      const av = a[k], bv = b[k];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * d;
      return String(av).localeCompare(String(bv)) * d;
    });
    return pool;
  }, [items, query, catFilter, lowOnly, sort]);

  const stats = useMI(() => {
    const lineValue = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.unitCost) || 0), 0);
    const low = items.filter(i => Number(i.qty) <= (Number(i.min) || 0)).length;
    const bins = new Set(items.map(i => i.bin).filter(Boolean)).size;
    const skus = items.length;
    return { lineValue, low, bins, skus };
  }, [items]);

  function setSortKey(k) {
    setSort(s => s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 });
  }

  function patchItem(id, patch) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch, updated: new Date().toISOString().slice(0,10) } : i));
  }
  function deleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }
  function addItem(item) {
    const fresh = { id: uid(), unit: "pcs", qty: 0, min: 0, updated: new Date().toISOString().slice(0,10), ...item };
    setItems(prev => [fresh, ...prev]);
    return fresh.id;
  }
  function bumpQty(id, delta) {
    setItems(prev => prev.map(i => i.id === id
      ? { ...i, qty: Math.max(0, (Number(i.qty) || 0) + delta), updated: new Date().toISOString().slice(0,10) }
      : i));
  }
  function resetToSeed() {
    if (!confirm("Reset inventory to seed data? Your current items will be lost.")) return;
    setItems(invDefaults());
  }

  const editingItem = editing && editing !== "new" ? items.find(i => i.id === editing) : null;

  return (
    <div>
      <div className="page-head">
        <div className="page-meta">
          <span className="page-type">Workspace</span>
          <span className="mono" style={{ color: "var(--faint)" }}>parts manifest · localStorage</span>
        </div>
        <h1 className="page-title">Inventory</h1>
        <div className="page-deck">
          A running parts manifest. Where each component lives, how many remain, what the spend has been.
          Edits persist locally; export the whole table as JSON to back up, share, or sync with another machine.
        </div>
      </div>

      {/* Stats strip */}
      <div className="inv-stats">
        <Stat label="distinct SKUs" value={stats.skus} />
        <Stat label="line value" value={fmtMoney(stats.lineValue)} accent />
        <Stat label="low / reorder" value={stats.low} warn={stats.low > 0} />
        <Stat label="bins in use" value={stats.bins} />
      </div>

      {/* Toolbar */}
      <div className="inv-toolbar">
        <div className="inv-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="filter by name, part #, bin, supplier, notes…"
          />
          {query && <button className="x" onClick={() => setQuery("")} aria-label="clear">×</button>}
        </div>
        <select className="inv-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">all categories</option>
          {INV_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <label className="inv-check">
          <input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} />
          <span>low stock only</span>
        </label>
        <div style={{ flex: 1 }}></div>
        <button className="btn-ghost" onClick={() => setTransferOpen("import")}>↑ import</button>
        <button className="btn-ghost" onClick={() => setTransferOpen("export")}>↓ export</button>
        <button className="btn-primary" onClick={() => setEditing("new")}>+ add item</button>
      </div>

      {/* Table */}
      <div className="inv-table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              <Th sortKey="name"      sort={sort} onSort={setSortKey}>Part</Th>
              <Th sortKey="pn"        sort={sort} onSort={setSortKey}>MPN</Th>
              <Th sortKey="cat"       sort={sort} onSort={setSortKey}>Category</Th>
              <Th sortKey="bin"       sort={sort} onSort={setSortKey}>Bin</Th>
              <Th sortKey="qty"       sort={sort} onSort={setSortKey} align="right">Qty</Th>
              <Th sortKey="min"       sort={sort} onSort={setSortKey} align="right">Min</Th>
              <Th sortKey="unitCost"  sort={sort} onSort={setSortKey} align="right">Unit</Th>
              <Th                                                                  align="right">Line</Th>
              <Th sortKey="supplier"  sort={sort} onSort={setSortKey}>Supplier</Th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan="10" className="inv-empty">No items match the current filter.</td></tr>
            )}
            {filtered.map(i => {
              const low = Number(i.qty) <= (Number(i.min) || 0);
              const line = (Number(i.qty) || 0) * (Number(i.unitCost) || 0);
              return (
                <tr key={i.id} className={low ? "low" : ""}>
                  <td className="part">
                    <div className="part-name">{i.name}</div>
                    {i.notes && <div className="part-notes">{i.notes}</div>}
                  </td>
                  <td className="mono dim">{i.pn || "—"}</td>
                  <td><span className={`cat-chip cat-${i.cat}`}>{INV_CAT_LABEL[i.cat] || i.cat}</span></td>
                  <td className="mono">{i.bin || "—"}</td>
                  <td className="qty-cell">
                    <button className="qty-btn" onClick={() => bumpQty(i.id, -1)} aria-label="dec">−</button>
                    <span className={`qty-val ${low ? "low" : ""}`}>{i.qty ?? 0}</span>
                    <button className="qty-btn" onClick={() => bumpQty(i.id, +1)} aria-label="inc">+</button>
                  </td>
                  <td className="mono dim right">{i.min ?? 0}</td>
                  <td className="mono right">{fmtMoney(Number(i.unitCost))}</td>
                  <td className="mono right">{fmtMoney(line)}</td>
                  <td className="dim">{i.supplier || "—"}</td>
                  <td className="row-actions">
                    <button className="row-btn" onClick={() => setEditing(i.id)} title="edit">edit</button>
                    <button className="row-btn danger" onClick={() => { if (confirm(`Delete "${i.name}"?`)) deleteItem(i.id); }} title="delete">del</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="inv-footnote mono">
        Showing {filtered.length} of {items.length} · stored under <code>{INV_STORAGE_KEY}</code> ·{" "}
        <button className="link-btn" onClick={resetToSeed}>reset to seed</button>
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

      {transferOpen && (
        <TransferModal
          mode={transferOpen}
          items={items}
          onClose={() => setTransferOpen(null)}
          onImport={(next, mode) => {
            if (mode === "replace") setItems(next);
            else {
              // merge by id, prefer incoming
              const byId = new Map(items.map(i => [i.id, i]));
              next.forEach(i => byId.set(i.id || uid(), i));
              setItems(Array.from(byId.values()));
            }
            setTransferOpen(null);
          }}
        />
      )}
    </div>
  );
}

/* ── Stat tile ─────────────────────────────────────────── */
function Stat({ label, value, accent, warn }) {
  return (
    <div className={`inv-stat ${accent ? "accent" : ""} ${warn ? "warn" : ""}`}>
      <div className="inv-stat-label">{label}</div>
      <div className="inv-stat-value">{value}</div>
    </div>
  );
}

/* ── Sortable header cell ──────────────────────────────── */
function Th({ children, sortKey, sort, onSort, align }) {
  const active = sort && sort.key === sortKey;
  const sortable = !!sortKey;
  return (
    <th
      className={`${align === "right" ? "right" : ""} ${sortable ? "sortable" : ""} ${active ? "active" : ""}`}
      onClick={sortable ? () => onSort(sortKey) : undefined}
    >
      <span>{children}</span>
      {sortable && (
        <span className="sort-ind">{active ? (sort.dir > 0 ? "↑" : "↓") : "·"}</span>
      )}
    </th>
  );
}

/* ══════════════════════════════════════════════════════════
   Item editor — drawer
   ══════════════════════════════════════════════════════════ */
function ItemEditor({ item, isNew, onClose, onSave }) {
  const [form, setForm] = useSI(() => item ? { ...item } : {
    name: "", pn: "", cat: "ic", qty: 0, min: 0, bin: "", supplier: "", unitCost: 0, notes: "",
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function submit(e) {
    e && e.preventDefault();
    if (!form.name || !form.name.trim()) { alert("Name is required."); return; }
    onSave({
      ...form,
      name: form.name.trim(),
      pn: (form.pn || "").trim(),
      bin: (form.bin || "").trim(),
      supplier: (form.supplier || "").trim(),
      qty: Number(form.qty) || 0,
      min: Number(form.min) || 0,
      unitCost: Number(form.unitCost) || 0,
    });
  }

  return (
    <div className="inv-veil" onClick={onClose}>
      <form className="inv-drawer" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <div className="drawer-head">
          <div>
            <div className="drawer-eyebrow mono">{isNew ? "new item" : "edit item"}</div>
            <div className="drawer-title">{isNew ? "Add to inventory" : form.name || "—"}</div>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="close">×</button>
        </div>

        <div className="drawer-body">
          <Field label="Name" required>
            <input className="inv-input" value={form.name || ""} onChange={e => set("name", e.target.value)} autoFocus placeholder="e.g. ESP32-WROOM-32" />
          </Field>
          <div className="field-row">
            <Field label="Manufacturer PN">
              <input className="inv-input mono" value={form.pn || ""} onChange={e => set("pn", e.target.value)} placeholder="ESP32-WROOM-32E" />
            </Field>
            <Field label="Category">
              <select className="inv-input" value={form.cat || "ic"} onChange={e => set("cat", e.target.value)}>
                {INV_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="field-row">
            <Field label="Quantity">
              <input className="inv-input mono" type="number" min="0" step="1" value={form.qty ?? 0} onChange={e => set("qty", e.target.value)} />
            </Field>
            <Field label="Min / reorder">
              <input className="inv-input mono" type="number" min="0" step="1" value={form.min ?? 0} onChange={e => set("min", e.target.value)} />
            </Field>
            <Field label="Bin">
              <input className="inv-input mono" value={form.bin || ""} onChange={e => set("bin", e.target.value)} placeholder="A3-2" />
            </Field>
          </div>

          <div className="field-row">
            <Field label="Supplier">
              <input className="inv-input" value={form.supplier || ""} onChange={e => set("supplier", e.target.value)} placeholder="DigiKey, Mouser, LCSC…" />
            </Field>
            <Field label="Unit cost (USD)">
              <input className="inv-input mono" type="number" min="0" step="0.001" value={form.unitCost ?? 0} onChange={e => set("unitCost", e.target.value)} />
            </Field>
          </div>

          <Field label="Notes">
            <textarea className="inv-input" rows="3" value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="datasheet quirks, intended project, etc." />
          </Field>
        </div>

        <div className="drawer-foot">
          <button type="button" className="btn-ghost" onClick={onClose}>cancel</button>
          <button type="submit" className="btn-primary">{isNew ? "add item" : "save changes"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="inv-field">
      <span className="inv-field-label mono">{label}{required && <em>*</em>}</span>
      {children}
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   Transfer modal — export / import JSON
   ══════════════════════════════════════════════════════════ */
function TransferModal({ mode, items, onClose, onImport }) {
  const isExport = mode === "export";
  const exportText = useMI(() => {
    if (!isExport) return "";
    return JSON.stringify({
      v: INV_VERSION,
      generator: "bench-atlas",
      exported: new Date().toISOString(),
      count: items.length,
      items,
    }, null, 2);
  }, [items, isExport]);

  const [paste, setPaste] = useSI("");
  const [importMode, setImportMode] = useSI("replace");
  const [parsed, setParsed] = useSI(null);
  const [parseError, setParseError] = useSI(null);
  const [copied, setCopied] = useSI(false);
  const textareaRef = useRI(null);

  useEI(() => {
    if (isExport) return;
    if (!paste.trim()) { setParsed(null); setParseError(null); return; }
    try {
      const p = JSON.parse(paste);
      let arr;
      if (Array.isArray(p)) arr = p;
      else if (p && Array.isArray(p.items)) arr = p.items;
      else throw new Error("Expected an array or { items: [...] }");
      if (!arr.every(i => i && typeof i === "object" && typeof i.name === "string")) {
        throw new Error("Each item needs at least a 'name' field.");
      }
      setParsed(arr.map(i => ({ id: i.id || uid(), ...i })));
      setParseError(null);
    } catch (e) {
      setParsed(null);
      setParseError(e.message || String(e));
    }
  }, [paste, isExport]);

  function copy() {
    navigator.clipboard.writeText(exportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }).catch(() => {
      textareaRef.current?.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }
  function download() {
    const blob = new Blob([exportText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="inv-veil" onClick={onClose}>
      <div className="inv-modal" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <div className="drawer-eyebrow mono">{isExport ? "export · json" : "import · json"}</div>
            <div className="drawer-title">{isExport ? "Your inventory as JSON" : "Paste an inventory JSON"}</div>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="close">×</button>
        </div>

        {isExport ? (
          <>
            <div className="modal-meta mono">{items.length} items · {exportText.length.toLocaleString()} chars</div>
            <textarea
              ref={textareaRef}
              className="inv-json"
              value={exportText}
              readOnly
              onFocus={e => e.target.select()}
            />
            <div className="drawer-foot">
              <span className="mono dim" style={{ marginRight: "auto", fontSize: 11 }}>
                {copied ? "✓ copied to clipboard" : "select-all on focus · or use the buttons →"}
              </span>
              <button className="btn-ghost" onClick={download}>↓ download .json</button>
              <button className="btn-primary" onClick={copy}>{copied ? "copied!" : "copy to clipboard"}</button>
            </div>
          </>
        ) : (
          <>
            <div className="import-modeswitch">
              <button className={`mode-pill ${importMode === "replace" ? "active" : ""}`} onClick={() => setImportMode("replace")}>replace all</button>
              <button className={`mode-pill ${importMode === "merge" ? "active" : ""}`} onClick={() => setImportMode("merge")}>merge by id</button>
            </div>
            <textarea
              className="inv-json"
              value={paste}
              onChange={e => setPaste(e.target.value)}
              placeholder='Paste JSON here — either an array of items, or { "items": [ ... ] } as produced by export.'
            />
            <div className="modal-meta mono">
              {parseError && <span style={{ color: "var(--rose)" }}>⚠ {parseError}</span>}
              {parsed && <span style={{ color: "var(--accent)" }}>✓ parsed {parsed.length} item{parsed.length === 1 ? "" : "s"}</span>}
              {!paste.trim() && <span className="dim">waiting for paste…</span>}
            </div>
            <div className="drawer-foot">
              <button className="btn-ghost" onClick={onClose}>cancel</button>
              <button
                className="btn-primary"
                disabled={!parsed}
                onClick={() => parsed && onImport(parsed, importMode)}
                style={!parsed ? { opacity: 0.4, cursor: "not-allowed" } : {}}
              >
                {importMode === "replace" ? "replace inventory" : "merge into inventory"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { InventoryPage });
