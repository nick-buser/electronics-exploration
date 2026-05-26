/* ──────────────────────────────────────────────────────────
   APP — shell, routing, sidebar, search palette
   ────────────────────────────────────────────────────────── */

const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR } = React;

/* ── Hash routing ──────────────────────────────────────── */
function useHashRoute() {
  const [slug, setSlug] = useS(() => parseHash());
  useE(() => {
    const onHash = () => setSlug(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return slug;
}
function parseHash() {
  const h = window.location.hash || "";
  const m = h.match(/^#\/?(.*)$/);
  return m ? m[1] : "";
}

/* ── Sidebar ───────────────────────────────────────────── */
function Sidebar({ slug, onOpenPalette }) {
  const groups = [
    { label: "Domains", items: DOMAINS, type: "domain" },
    { label: "Archetypes", items: ARCHETYPES, type: "archetype" },
    {
      label: "Projects", items: PROJECTS, type: "project",
      render: (e) => (
        <span className={`nav-item status-${e.status} ${slug === e.slug ? "active" : ""}`}
              key={e.slug} onClick={() => window.location.hash = `#/${e.slug}`}>
          <span className="dot"></span>
          {e.title}
          <span className="meta">{e.tier}</span>
        </span>
      )
    },
    { label: "Principles", items: PRINCIPLES, type: "principle" },
    { label: "Components", items: COMPONENTS, type: "component" },
    { label: "Tools", items: TOOLS, type: "tool" },
    { label: "Comparisons", items: COMPARISONS, type: "comparison" },
    { label: "Journal", items: JOURNAL, type: "journal" },
  ];

  const [collapsed, setCollapsed] = useS({});

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">B</div>
        <div className="brand-name">bench<span> · atlas</span></div>
      </div>

      <button className="search-trigger" onClick={onOpenPalette}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        Search the atlas…
        <span className="kbd">⌘K</span>
      </button>

      <div className="nav-section">
        <div className="nav-label" onClick={() => window.location.hash = "#/"} style={{ cursor: "pointer" }}>
          Overview
        </div>
        <span className={`nav-item ${slug === "" ? "active" : ""}`} onClick={() => window.location.hash = "#/"}>
          <span className="dot"></span>Home
        </span>
        <span className={`nav-item ${slug === "inventory" ? "active" : ""}`} onClick={() => window.location.hash = "#/inventory"}>
          <span className="dot"></span>Inventory
          <span className="meta">parts</span>
        </span>
      </div>

      {groups.map(g => (
        <div className="nav-section" key={g.label}>
          <button className={`nav-group-toggle ${collapsed[g.label] ? "collapsed" : ""}`}
                  onClick={() => setCollapsed(c => ({ ...c, [g.label]: !c[g.label] }))}>
            <svg className="chev" width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4.5 L6 7.5 L9 4.5" />
            </svg>
            {g.label}
            <span style={{ marginLeft: "auto" }}>{g.items.length}</span>
          </button>
          {!collapsed[g.label] && g.items.map(e =>
            g.render ? g.render(e) : (
              <span key={e.slug} className={`nav-item ${slug === e.slug ? "active" : ""}`}
                    onClick={() => window.location.hash = `#/${e.slug}`}>
                <span className="dot"></span>
                {e.title}
                {e.tier && <span className="meta">{e.tier}</span>}
              </span>
            )
          )}
        </div>
      ))}

      <div style={{ padding: "20px 20px 0", fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: "0.08em" }}>
        v0.1 · {ENTRIES.length} slugs
      </div>
    </aside>
  );
}

/* ── Topbar with breadcrumbs ───────────────────────────── */
function Topbar({ slug, onOpenPalette, onOpenTweaks }) {
  const entry = BY_SLUG[slug];
  const crumbs = [];
  crumbs.push({ label: "Atlas", href: "#/" });
  if (entry) {
    crumbs.push({ label: TYPES[entry.type].group, href: `#/` }); // group is just label
    if (entry.domain && entry.type !== "domain") {
      const d = DOMAINS.find(x => x.slug === entry.domain);
      if (d) crumbs.push({ label: d.title, href: `#/${d.slug}` });
    }
    crumbs.push({ label: entry.title, href: null });
  }

  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            {c.href ? <a href={c.href}>{c.label}</a> : <span className="current">{c.label}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-right">
        <button className="top-btn" onClick={onOpenPalette}>Search ⌘K</button>
        <button className="top-btn" onClick={onOpenTweaks}>Tweaks</button>
      </div>
    </div>
  );
}

/* ── Search palette ────────────────────────────────────── */
function fuzzyScore(q, text) {
  if (!q) return 0;
  q = q.toLowerCase();
  text = text.toLowerCase();
  if (text.includes(q)) return 10 + (text.startsWith(q) ? 5 : 0);
  // character-by-character fuzzy
  let qi = 0;
  for (let i = 0; i < text.length && qi < q.length; i++) {
    if (text[i] === q[qi]) qi++;
  }
  return qi === q.length ? 3 : 0;
}

function Palette({ onClose }) {
  const [query, setQuery] = useS("");
  const [typeFilter, setTypeFilter] = useS(null);
  const [domainFilter, setDomainFilter] = useS(null);
  const [focus, setFocus] = useS(0);
  const inputRef = useR(null);

  useE(() => { inputRef.current?.focus(); }, []);

  const results = useM(() => {
    let pool = ENTRIES;
    if (typeFilter) pool = pool.filter(e => e.type === typeFilter);
    if (domainFilter) pool = pool.filter(e => e.domain === domainFilter);

    if (!query) return pool.slice(0, 40);

    const scored = pool.map(e => {
      const titleS = fuzzyScore(query, e.title) * 3;
      const deckS = e.deck ? fuzzyScore(query, e.deck) * 0.6 : 0;
      const slugS = fuzzyScore(query, e.slug);
      const total = titleS + deckS + slugS;
      // include a body snippet from deck if matched
      let snippet = null;
      if (e.deck) {
        const idx = e.deck.toLowerCase().indexOf(query.toLowerCase());
        if (idx !== -1) {
          const start = Math.max(0, idx - 18);
          const end = Math.min(e.deck.length, idx + query.length + 30);
          snippet = { text: e.deck.slice(start, end), q: query };
        }
      }
      return { e, total, snippet };
    }).filter(r => r.total > 0).sort((a, b) => b.total - a.total).slice(0, 40);

    return scored.map(r => ({ ...r.e, __snippet: r.snippet }));
  }, [query, typeFilter, domainFilter]);

  // grouped
  const grouped = useM(() => {
    const g = {};
    results.forEach(r => {
      const k = TYPES[r.type].group;
      (g[k] = g[k] || []).push(r);
    });
    return g;
  }, [results]);

  useE(() => { setFocus(0); }, [query, typeFilter, domainFilter]);

  function onKey(e) {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") { e.preventDefault(); setFocus(f => Math.min(f + 1, results.length - 1)); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setFocus(f => Math.max(f - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[focus];
      if (r) { window.location.hash = `#/${r.slug}`; onClose(); }
    }
  }

  return (
    <div className="palette-veil" onClick={onClose}>
      <div className="palette" onClick={e => e.stopPropagation()} onKeyDown={onKey} tabIndex={0}>
        <div className="palette-input-row">
          <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input ref={inputRef} className="palette-input" placeholder="Search slugs, principles, components, projects…"
                 value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKey} />
        </div>
        <div className="palette-filters">
          <span className="mono" style={{ fontSize: 10, color: "var(--faint)", marginRight: 4, alignSelf: "center", textTransform: "uppercase", letterSpacing: "0.1em" }}>type</span>
          <button className={`filter-chip ${typeFilter === null ? "active" : ""}`} onClick={() => setTypeFilter(null)}>all</button>
          {Object.entries(TYPES).map(([k, v]) => (
            <button key={k} className={`filter-chip ${typeFilter === k ? "active" : ""}`}
                    onClick={() => setTypeFilter(typeFilter === k ? null : k)}>{v.label}</button>
          ))}
        </div>
        <div className="palette-filters" style={{ borderBottom: "1px solid var(--line)" }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--faint)", marginRight: 4, alignSelf: "center", textTransform: "uppercase", letterSpacing: "0.1em" }}>domain</span>
          <button className={`filter-chip ${domainFilter === null ? "active" : ""}`} onClick={() => setDomainFilter(null)}>any</button>
          {DOMAINS.map(d => (
            <button key={d.slug} className={`filter-chip ${domainFilter === d.slug ? "active" : ""}`}
                    onClick={() => setDomainFilter(domainFilter === d.slug ? null : d.slug)}>{d.title}</button>
          ))}
        </div>

        <div className="palette-results">
          {results.length === 0 && <div className="palette-empty">No matches</div>}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="palette-group-label">{group} — {items.length}</div>
              {items.map((r, i) => {
                const globalIdx = results.indexOf(r);
                return (
                  <div key={r.slug}
                       className={`palette-result ${globalIdx === focus ? "focused" : ""}`}
                       onClick={() => { window.location.hash = `#/${r.slug}`; onClose(); }}
                       onMouseEnter={() => setFocus(globalIdx)}>
                    <span className="r-type">{TYPES[r.type].label}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="r-title">{r.title}</span>
                      {r.__snippet && (
                        <span className="r-snippet">{r.__snippet.text}</span>
                      )}
                    </span>
                    <span className="r-meta">{r.tier || r.domain || ""}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="palette-footer">
          <span><span className="kbd">↑↓</span>navigate</span>
          <span><span className="kbd">↵</span>open</span>
          <span><span className="kbd">esc</span>close</span>
          <span style={{ marginLeft: "auto" }}>{results.length} of {ENTRIES.length}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Tweaks ────────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "default",
  "accent": "#7dd3c0",
  "density": "default"
}/*EDITMODE-END*/;

const ACCENT_MAP = {
  "#7dd3c0": "mint",
  "#d9b87a": "amber",
  "#d98a8a": "rose",
  "#a89cd9": "violet",
  "#8ab8d9": "sky",
};

function TweaksWrapper() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweak values as data attributes on <html>
  useE(() => {
    const root = document.documentElement;
    if (tweaks.theme && tweaks.theme !== "default") root.dataset.theme = tweaks.theme;
    else delete root.dataset.theme;
    const accentName = ACCENT_MAP[(tweaks.accent || "").toLowerCase()];
    if (accentName && accentName !== "mint") root.dataset.accent = accentName;
    else delete root.dataset.accent;
    if (tweaks.density && tweaks.density !== "default") root.dataset.density = tweaks.density;
    else delete root.dataset.density;
  }, [tweaks.theme, tweaks.accent, tweaks.density]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme">
        <TweakRadio label="Surface" value={tweaks.theme}
          onChange={v => setTweak("theme", v)}
          options={[
            { value: "default", label: "Slate" },
            { value: "graphite", label: "Graphite" },
            { value: "navy", label: "Navy" },
          ]} />
      </TweakSection>
      <TweakSection label="Accent">
        <TweakColor label="Color" value={tweaks.accent}
          onChange={v => setTweak("accent", v)}
          options={["#7dd3c0", "#d9b87a", "#d98a8a", "#a89cd9", "#8ab8d9"]} />
      </TweakSection>
      <TweakSection label="Layout">
        <TweakRadio label="Density" value={tweaks.density}
          onChange={v => setTweak("density", v)}
          options={[
            { value: "dense", label: "Dense" },
            { value: "default", label: "Default" },
            { value: "airy", label: "Airy" },
          ]} />
      </TweakSection>
    </TweaksPanel>
  );
}

/* ── App ───────────────────────────────────────────────── */
function App() {
  const slug = useHashRoute();
  const [paletteOpen, setPaletteOpen] = useS(false);

  // Scroll to top on slug change
  useE(() => { window.scrollTo(0, 0); }, [slug]);

  // Global keybindings
  useE(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app">
      <Sidebar slug={slug} onOpenPalette={() => setPaletteOpen(true)} />
      <div className="main">
        <Topbar slug={slug} onOpenPalette={() => setPaletteOpen(true)}
                onOpenTweaks={() => window.parent.postMessage({ type: "__activate_edit_mode" }, "*")} />
        <div className="content">
          <PageDispatcher slug={slug} />
        </div>
      </div>
      {paletteOpen && <Palette onClose={() => setPaletteOpen(false)} />}
      <TweaksWrapper />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
