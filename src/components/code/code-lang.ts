// Lightweight language metadata — safe to import from eagerly-loaded code
// (no CodeMirror modules pulled in here, so the heavy editor stays lazy).

export type CodeLang = "c" | "cpp" | "python" | "js" | "ts" | "json" | "text";

export const LANG_LABEL: Record<CodeLang, string> = {
  c: "C",
  cpp: "C++",
  python: "Python",
  js: "JavaScript",
  ts: "TypeScript",
  json: "JSON",
  text: "text",
};
