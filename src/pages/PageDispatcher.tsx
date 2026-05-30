import { lazy, Suspense } from "react";
import { BY_SLUG } from "@/data/corpus";
import { HomePage } from "./HomePage";
import { InventoryPage } from "./InventoryPage";
import {
  ArchetypePage,
  ComparisonPage,
  ComponentPage,
  DomainPage,
  JournalPage,
  NotFoundPage,
  PrinciplePage,
  ProjectPage,
  ToolPage,
} from "./EntryPages";

const MapPage = lazy(() => import("./map/MapPage").then((m) => ({ default: m.MapPage })));

function MapFallback() {
  return (
    <div className="flex-1 grid place-items-center text-muted font-mono font-mono-features text-[12px]">
      loading map…
    </div>
  );
}

export function PageDispatcher({ slug }: { slug: string }) {
  if (slug === "" || slug === "home") return <HomePage />;
  if (slug === "inventory") return <InventoryPage />;
  if (slug === "map")
    return (
      <Suspense fallback={<MapFallback />}>
        <MapPage />
      </Suspense>
    );
  const entry = BY_SLUG[slug];
  if (!entry) return <NotFoundPage slug={slug} />;
  switch (entry.type) {
    case "domain":
      return <DomainPage entry={entry} />;
    case "archetype":
      return <ArchetypePage entry={entry} />;
    case "project":
      return <ProjectPage entry={entry} />;
    case "component":
      return <ComponentPage entry={entry} />;
    case "tool":
      return <ToolPage entry={entry} />;
    case "principle":
      return <PrinciplePage entry={entry} />;
    case "comparison":
      return <ComparisonPage entry={entry} />;
    case "journal":
      return <JournalPage entry={entry} />;
  }
}
