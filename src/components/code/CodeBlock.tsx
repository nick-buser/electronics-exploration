import { Suspense, lazy, useState } from "react";
import { Check, Copy } from "lucide-react";
import { LANG_LABEL, type CodeLang } from "./code-lang";

const CodeMirrorEditor = lazy(() => import("./CodeMirrorEditor"));

type Props = {
  /** Source code. Leading/trailing blank lines are trimmed. */
  code: string;
  language?: CodeLang;
  /** Shown on the left of the header bar; falls back to the language label. */
  filename?: string;
  /** Render an editable scratchpad instead of a read-only block. */
  editable?: boolean;
  showLineNumbers?: boolean;
};

export function CodeBlock({
  code,
  language = "text",
  filename,
  editable = false,
  showLineNumbers = true,
}: Props) {
  const initial = dedent(code);
  const [value, setValue] = useState(initial);
  const [copied, setCopied] = useState(false);

  function copy() {
    const text = editable ? value : initial;
    navigator.clipboard
      .writeText(text)
      .then(flash)
      .catch(() => {
        // Fallback for non-secure contexts
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        flash();
      });
  }
  function flash() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="my-6 rounded-lg border border-line bg-bg-2 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-line bg-bg">
        <span className="font-mono font-mono-features text-[10.5px] uppercase tracking-[0.1em] text-faint">
          {filename ?? LANG_LABEL[language]}
        </span>
        {filename && (
          <span className="font-mono font-mono-features text-[10px] text-dim">
            {LANG_LABEL[language]}
          </span>
        )}
        {editable && (
          <span className="font-mono font-mono-features text-[9.5px] uppercase tracking-[0.12em] text-accent/70">
            editable
          </span>
        )}
        <span className="flex-1" />
        <button
          onClick={copy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded font-mono font-mono-features text-[10.5px] text-muted hover:text-text-2 hover:bg-hover transition-colors"
          aria-label="copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <div className="px-3">
        <Suspense fallback={<CodeFallback code={initial} />}>
          <CodeMirrorEditor
            value={editable ? value : initial}
            language={language}
            editable={editable}
            showLineNumbers={showLineNumbers}
            onChange={editable ? setValue : undefined}
          />
        </Suspense>
      </div>
    </div>
  );
}

function CodeFallback({ code }: { code: string }) {
  return (
    <pre className="m-0 py-3 overflow-x-auto font-mono font-mono-features text-[12.5px] leading-[1.5] text-text-2">
      {code}
    </pre>
  );
}

function dedent(src: string): string {
  const lines = src.replace(/\t/g, "  ").split("\n");
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  const indents = lines
    .filter((l) => l.trim().length > 0)
    .map((l) => l.match(/^ */)?.[0].length ?? 0);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join("\n");
}
