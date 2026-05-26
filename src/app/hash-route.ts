import { useEffect, useState } from "react";

function parseHash(): string {
  const h = window.location.hash || "";
  const m = h.match(/^#\/?(.*)$/);
  return m ? m[1] : "";
}

export function useHashRoute(): string {
  const [slug, setSlug] = useState<string>(() => parseHash());
  useEffect(() => {
    const onHash = () => setSlug(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return slug;
}

export function navigate(slug: string): void {
  window.location.hash = `#/${slug}`;
}
