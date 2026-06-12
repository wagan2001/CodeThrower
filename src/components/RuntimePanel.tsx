import { Activity, CheckCircle2, RefreshCw, ServerCog, WifiOff } from "lucide-react";
import type { ModelHealth, ModelSettings, RuntimeStatus } from "../lib/types";

type Props = {
  settings: ModelSettings;
  health: ModelHealth;
  onSettingsChange: (settings: ModelSettings) => void;
  onCheck: () => void;
};

export function RuntimePanel({ settings, health, onSettingsChange, onCheck }: Props) {
  const statusIcon = getStatusIcon(health.status);

  return (
    <section className="runtime-band" aria-label="Model runtime">
      <div className="runtime-summary">
        <ServerCog size={20} aria-hidden="true" />
        <div>
          <h2>Ollama runtime</h2>
          <p>{health.message}</p>
        </div>
        <span className={`status-pill status-${health.status}`}>
          {statusIcon}
          {health.status}
        </span>
      </div>

      <div className="runtime-controls">
        <label>
          <span>Endpoint</span>
          <input
            value={settings.baseUrl}
            onChange={(event) =>
              onSettingsChange({ ...settings, baseUrl: event.target.value })
            }
          />
        </label>
        <label>
          <span>Model</span>
          <input
            list="installed-models"
            value={settings.model}
            onChange={(event) =>
              onSettingsChange({ ...settings, model: event.target.value })
            }
          />
          <datalist id="installed-models">
            {health.models.map((model) => (
              <option value={model} key={model} />
            ))}
          </datalist>
        </label>
        <label>
          <span>Temp</span>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={settings.temperature}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                temperature: Number(event.target.value)
              })
            }
          />
        </label>
        <label>
          <span>Context</span>
          <input
            type="number"
            min="2048"
            step="512"
            value={settings.contextSize}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                contextSize: Number(event.target.value)
              })
            }
          />
        </label>
        <button className="icon-button" onClick={onCheck} title="Check model runtime">
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function getStatusIcon(status: RuntimeStatus) {
  if (status === "running") {
    return <CheckCircle2 size={15} aria-hidden="true" />;
  }
  if (status === "checking") {
    return <Activity size={15} aria-hidden="true" />;
  }
  return <WifiOff size={15} aria-hidden="true" />;
}
