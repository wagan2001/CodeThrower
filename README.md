# CodeThrower

CodeThrower is a local coding dojo desktop app. The MVP targets a Tauri shell,
a React + TypeScript interface, Monaco editing, Ollama as the development model
runtime, and JSON-backed session history.

## MVP Loop

1. Choose a language, topic, difficulty, and practice mode.
2. Generate a focused coding rep from a local Ollama model.
3. Write a solution in Monaco.
4. Ask for up to three progressive hints.
5. Submit for rubric-based scoring.
6. Save the session locally and review it in history.

## Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the app:

```text
http://127.0.0.1:1420
```

Build the frontend:

```bash
npm run build
```

The default Ollama endpoint is `http://localhost:11434` and the default model is
`qwen2.5-coder:7b-instruct`.

Pull the recommended development model before using the app:

```bash
ollama pull qwen2.5-coder:7b-instruct
```

If the browser or Tauri webview cannot reach Ollama, allow the local app origin:

```bash
$env:OLLAMA_ORIGINS="http://127.0.0.1:1420,http://localhost:1420,tauri://localhost"
ollama serve
```

## Current MVP Features

- Ollama health check and editable runtime settings.
- Schema-driven problem generation with one JSON repair retry.
- Monaco editor with language-aware syntax modes.
- Progressive three-step hint ladder.
- LLM-only rubric grading for correctness, edge cases, quality, and complexity.
- Similar, easier, and harder follow-up rep generation.
- JSON session history stored in local browser/Tauri storage.
- Session reload, history clear, and history export.

Code execution is intentionally not included in this version.

## Desktop Shell

The repository includes Tauri 2 configuration in `src-tauri/`. A Rust toolchain
is required to run or build the native shell:

```bash
npm run tauri dev
```
