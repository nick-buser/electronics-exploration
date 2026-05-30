import { useMemo } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { atlasTheme, languageExtension } from "./code-theme";
import type { CodeLang } from "./code-lang";

export type CodeMirrorEditorProps = {
  value: string;
  language: CodeLang;
  editable?: boolean;
  showLineNumbers?: boolean;
  onChange?: (next: string) => void;
};

export default function CodeMirrorEditor({
  value,
  language,
  editable = false,
  showLineNumbers = true,
  onChange,
}: CodeMirrorEditorProps) {
  const extensions = useMemo(
    () => [...languageExtension(language), EditorView.lineWrapping],
    [language],
  );

  return (
    <CodeMirror
      value={value}
      theme={atlasTheme()}
      extensions={extensions}
      editable={editable}
      readOnly={!editable}
      onChange={onChange}
      basicSetup={{
        lineNumbers: showLineNumbers,
        foldGutter: false,
        highlightActiveLine: editable,
        highlightActiveLineGutter: editable,
        autocompletion: editable,
        searchKeymap: false,
        allowMultipleSelections: editable,
      }}
    />
  );
}
