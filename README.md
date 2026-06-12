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

Build the frontend:

```bash
npm run build
```

The default Ollama endpoint is `http://localhost:11434` and the default model is
`qwen2.5-coder:7b-instruct`.

## Desktop Shell

The repository includes Tauri 2 configuration in `src-tauri/`. A Rust toolchain
is required to run or build the native shell:

```bash
npm run tauri dev
```
