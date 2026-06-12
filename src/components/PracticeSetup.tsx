import { BrainCircuit, SlidersHorizontal } from "lucide-react";
import type { Difficulty, PracticeConfig, PracticeMode } from "../lib/types";

const languages = ["Python", "SQL", "JavaScript", "TypeScript", "Rust", "C++", "Java", "Go"];
const difficulties: Difficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Interview",
  "Expert",
  "Adaptive"
];

const modes: { value: PracticeMode; label: string }[] = [
  { value: "guided", label: "Guided" },
  { value: "test", label: "Test me" },
  { value: "debugging", label: "Debugging" },
  { value: "refactor", label: "Refactor" },
  { value: "explain_first", label: "Explain first" }
];

type Props = {
  config: PracticeConfig;
  isBusy: boolean;
  onConfigChange: (config: PracticeConfig) => void;
  onGenerate: () => void;
};

export function PracticeSetup({ config, isBusy, onConfigChange, onGenerate }: Props) {
  return (
    <section className="setup-panel" aria-label="Practice setup">
      <div className="section-heading">
        <BrainCircuit size={20} aria-hidden="true" />
        <div>
          <h2>Practice setup</h2>
          <p>Pick the rep you want to throw at the model.</p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>Language</span>
          <select
            value={config.language}
            onChange={(event) =>
              onConfigChange({ ...config, language: event.target.value })
            }
          >
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Difficulty</span>
          <select
            value={config.difficulty}
            onChange={(event) =>
              onConfigChange({
                ...config,
                difficulty: event.target.value as Difficulty
              })
            }
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty}>{difficulty}</option>
            ))}
          </select>
        </label>

        <label className="wide-field">
          <span>Practice topic</span>
          <textarea
            value={config.topic}
            rows={3}
            placeholder="pandas groupby with messy business data"
            onChange={(event) =>
              onConfigChange({ ...config, topic: event.target.value })
            }
          />
        </label>

        <label>
          <span>Session length</span>
          <input
            type="number"
            min="15"
            max="90"
            step="5"
            value={config.estimatedMinutes}
            onChange={(event) =>
              onConfigChange({
                ...config,
                estimatedMinutes: Number(event.target.value)
              })
            }
          />
        </label>
      </div>

      <fieldset className="segmented-control">
        <legend>Mode</legend>
        {modes.map((mode) => (
          <label key={mode.value}>
            <input
              type="radio"
              name="mode"
              checked={config.mode === mode.value}
              onChange={() => onConfigChange({ ...config, mode: mode.value })}
            />
            <span>{mode.label}</span>
          </label>
        ))}
      </fieldset>

      <button className="primary-action" onClick={onGenerate} disabled={isBusy}>
        <SlidersHorizontal size={18} aria-hidden="true" />
        {isBusy ? "Generating..." : "Generate problem"}
      </button>
    </section>
  );
}
