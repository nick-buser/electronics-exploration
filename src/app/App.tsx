import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Palette } from "./Palette";
import { useHashRoute } from "./hash-route";
import { PageDispatcher } from "@/pages/PageDispatcher";

export function App() {
  const slug = useHashRoute();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField = ["INPUT", "TEXTAREA"].includes(
        (document.activeElement as HTMLElement | null)?.tagName ?? "",
      );
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "/" && !inField) {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="grid grid-cols-[280px_minmax(0,1fr)] min-h-screen bg-bg text-text">
      <Sidebar slug={slug} onOpenPalette={() => setPaletteOpen(true)} />
      <div className="flex flex-col min-w-0">
        <Topbar slug={slug} onOpenPalette={() => setPaletteOpen(true)} />
        <main className="px-12 py-14 max-w-[920px] w-full mx-auto">
          <PageDispatcher slug={slug} />
        </main>
      </div>
      {paletteOpen && <Palette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}
