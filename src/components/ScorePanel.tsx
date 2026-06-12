import { Gauge, Target } from "lucide-react";
import type { ScoreReport } from "../lib/types";

type Props = {
  report?: ScoreReport;
};

export function ScorePanel({ report }: Props) {
  if (!report) {
    return (
      <section className="score-panel" aria-label="Score report">
        <div className="section-heading">
          <Gauge size={20} aria-hidden="true" />
          <div>
            <h2>Score report</h2>
            <p>Submit a solution to get rubric feedback.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="score-panel" aria-label="Score report">
      <div className="score-header">
        <div>
          <h2>Score report</h2>
          <p>Overall score</p>
        </div>
        <strong>{report.score}/100</strong>
      </div>

      <div className="score-grid">
        <Metric label="Correctness" value={report.correctness} max={50} />
        <Metric label="Edge cases" value={report.edgeCases} max={20} />
        <Metric label="Code quality" value={report.codeQuality} max={15} />
        <Metric label="Complexity" value={report.complexity} max={15} />
      </div>

      <FeedbackList title="What went well" items={report.whatTheyDidWell} />
      <FeedbackList title="Major issues" items={report.majorIssues} />
      <FeedbackList title="Minor issues" items={report.minorIssues} />

      <div className="next-step">
        <Target size={18} aria-hidden="true" />
        <p>{report.nextStepAdvice}</p>
      </div>

      <div className="tag-list">
        {report.mistakeTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>
        {value}/{max}
      </strong>
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="content-block compact">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
