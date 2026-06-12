import { Download, History, Trash2 } from "lucide-react";
import type { DojoSession } from "../lib/types";

type Props = {
  sessions: DojoSession[];
  activeSessionId?: string;
  onSelect: (session: DojoSession) => void;
  onClear: () => void;
};

export function SessionHistory({ sessions, activeSessionId, onSelect, onClear }: Props) {
  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "codethrower-session-history.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="history-panel" aria-label="Session history">
      <div className="history-heading">
        <div className="section-heading">
          <History size={20} aria-hidden="true" />
          <div>
            <h2>History</h2>
            <p>{sessions.length} saved sessions</p>
          </div>
        </div>
        <div className="toolbar-actions">
          <button className="icon-button" onClick={exportHistory} disabled={!sessions.length} title="Export history">
            <Download size={17} aria-hidden="true" />
          </button>
          <button className="icon-button danger" onClick={onClear} disabled={!sessions.length} title="Clear history">
            <Trash2 size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="session-list">
        {sessions.length === 0 ? (
          <p className="muted">Completed reps and generated problems will be saved here.</p>
        ) : (
          sessions.map((session) => {
            const latestScore = session.submissions[0]?.scoreReport?.score;
            return (
              <button
                className={session.id === activeSessionId ? "session-row active" : "session-row"}
                key={session.id}
                onClick={() => onSelect(session)}
              >
                <span>{session.problem.title}</span>
                <small>
                  {session.language} · {session.topic} · {new Date(session.updatedAt).toLocaleDateString()}
                </small>
                {typeof latestScore === "number" && <strong>{latestScore}/100</strong>}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
