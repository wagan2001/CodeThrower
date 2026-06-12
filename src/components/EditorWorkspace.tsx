import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { RotateCcw, Send, Wand2 } from "lucide-react";

loader.config({ monaco });

type Props = {
  language: string;
  code: string;
  isBusy: boolean;
  hasProblem: boolean;
  onCodeChange: (code: string) => void;
  onReset: () => void;
  onSubmit: () => void;
  onGenerateVariant: (variant: "similar" | "easier" | "harder") => void;
};

const monacoLanguageMap: Record<string, string> = {
  Python: "python",
  SQL: "sql",
  JavaScript: "javascript",
  TypeScript: "typescript",
  Rust: "rust",
  "C++": "cpp",
  Java: "java",
  Go: "go"
};

export function EditorWorkspace({
  language,
  code,
  isBusy,
  hasProblem,
  onCodeChange,
  onReset,
  onSubmit,
  onGenerateVariant
}: Props) {
  return (
    <section className="editor-panel" aria-label="Code editor">
      <div className="editor-toolbar">
        <div>
          <h2>Solution</h2>
          <p>{language} editor</p>
        </div>
        <div className="toolbar-actions">
          <button className="icon-text-button" disabled={!hasProblem || isBusy} onClick={onReset}>
            <RotateCcw size={17} aria-hidden="true" />
            Reset
          </button>
          <button className="icon-text-button" disabled={!hasProblem || isBusy} onClick={onSubmit}>
            <Send size={17} aria-hidden="true" />
            Submit
          </button>
        </div>
      </div>

      <div className="monaco-shell">
        <Editor
          height="100%"
          theme="vs-dark"
          language={monacoLanguageMap[language] ?? "plaintext"}
          value={code}
          onChange={(value) => onCodeChange(value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>

      <div className="variant-actions">
        <button disabled={!hasProblem || isBusy} onClick={() => onGenerateVariant("similar")}>
          <Wand2 size={16} aria-hidden="true" />
          Similar
        </button>
        <button disabled={!hasProblem || isBusy} onClick={() => onGenerateVariant("easier")}>
          Easier
        </button>
        <button disabled={!hasProblem || isBusy} onClick={() => onGenerateVariant("harder")}>
          Harder
        </button>
      </div>
    </section>
  );
}
