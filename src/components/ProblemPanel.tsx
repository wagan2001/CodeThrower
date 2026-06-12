import { ClipboardList, ListChecks } from "lucide-react";
import type { GeneratedProblem } from "../lib/types";

type Props = {
  problem?: GeneratedProblem;
};

export function ProblemPanel({ problem }: Props) {
  if (!problem) {
    return (
      <section className="problem-panel empty-state" aria-label="Problem">
        <ClipboardList size={24} aria-hidden="true" />
        <h2>Generate a rep to begin</h2>
        <p>
          Choose a language, topic, difficulty, and mode. The generated problem
          will appear here with examples, constraints, concepts, and public tests.
        </p>
      </section>
    );
  }

  return (
    <section className="problem-panel" aria-label="Problem">
      <div className="section-heading">
        <ClipboardList size={20} aria-hidden="true" />
        <div>
          <h2>{problem.title}</h2>
          <p>Problem statement</p>
        </div>
      </div>

      <p className="problem-statement">{problem.problemStatement}</p>

      <div className="content-block">
        <h3>Examples</h3>
        {problem.examples.map((example, index) => (
          <div className="example-row" key={`${example.input}-${index}`}>
            <span>Input</span>
            <code>{example.input}</code>
            <span>Output</span>
            <code>{example.output}</code>
            <p>{example.explanation}</p>
          </div>
        ))}
      </div>

      <div className="content-block">
        <h3>Constraints</h3>
        <ul>
          {problem.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>
      </div>

      <div className="content-block">
        <h3>Expected concepts</h3>
        <div className="tag-list">
          {problem.expectedConcepts.map((concept) => (
            <span key={concept}>{concept}</span>
          ))}
        </div>
      </div>

      <div className="content-block">
        <h3>
          <ListChecks size={17} aria-hidden="true" />
          Public tests
        </h3>
        <ul>
          {problem.publicTests.map((test) => (
            <li key={test}>{test}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
