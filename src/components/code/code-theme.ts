import { EditorView, type Extension } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import type { CodeLang } from "./code-lang";

export function languageExtension(lang: CodeLang): Extension[] {
  switch (lang) {
    case "c":
    case "cpp":
      return [cpp()];
    case "python":
      return [python()];
    case "js":
      return [javascript()];
    case "ts":
      return [javascript({ typescript: true })];
    case "json":
      return [json()];
    case "text":
      return [];
  }
}

/**
 * Tweaks one-dark so the editor surface matches the atlas palette
 * (transparent background, our mono font, tighter padding). The actual
 * syntax colours still come from oneDark.
 */
const atlasSurface = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "var(--color-text-2)",
    fontSize: "12.5px",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--color-dim)",
  },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--color-hover) 40%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--color-faint)" },
  ".cm-content": {
    fontFamily: "var(--font-mono)",
    padding: "12px 0",
    caretColor: "var(--color-accent)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 12px 0 10px" },
  "&.cm-focused": { outline: "none" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "color-mix(in srgb, var(--color-accent) 18%, transparent)",
  },
  ".cm-scroller": { fontFamily: "var(--font-mono)" },
});

export function atlasTheme(): Extension[] {
  return [oneDark, atlasSurface];
}
