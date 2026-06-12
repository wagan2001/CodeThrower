import { Lightbulb, MessageSquareText } from "lucide-react";
import type { HintRecord } from "../lib/types";

type Props = {
  hints: HintRecord[];
  isBusy: boolean;
  hasProblem: boolean;
  onHint: () => void;
};

export function CoachingPanel({ hints, isBusy, hasProblem, onHint }: Props) {
  const nextHintLevel = Math.min(hints.length + 1, 3);

  return (
    <section className="coaching-panel" aria-label="Coaching">
      <div className="section-heading">
        <Lightbulb size={20} aria-hidden="true" />
        <div>
          <h2>Coaching</h2>
          <p>{hints.length}/3 hints used</p>
        </div>
      </div>

      <button
        className="secondary-action"
        onClick={onHint}
        disabled={!hasProblem || isBusy || hints.length >= 3}
      >
        <MessageSquareText size={17} aria-hidden="true" />
        Hint {nextHintLevel}
      </button>

      <div className="hint-list">
        {hints.length === 0 ? (
          <p className="muted">Hints will build from a small nudge toward an algorithm-level push.</p>
        ) : (
          hints.map((hint) => (
            <article className="hint-item" key={hint.id}>
              <span>Hint {hint.hintLevel}</span>
              <p>{hint.hintText}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
