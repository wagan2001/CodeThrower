import type { GeneratedProblem, ScoreReport } from "./types";

export function parseModelJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const objectStart = cleaned.indexOf("{");
    const objectEnd = cleaned.lastIndexOf("}");
    if (objectStart >= 0 && objectEnd > objectStart) {
      return JSON.parse(cleaned.slice(objectStart, objectEnd + 1)) as T;
    }
    throw new Error("The model did not return parseable JSON.");
  }
}

export function validateGeneratedProblem(value: unknown): GeneratedProblem {
  const problem = requireObject(value, "problem");
  const rubric = requireObject(problem.rubric, "rubric");

  return {
    title: requireString(problem.title, "title"),
    problemStatement: requireString(problem.problemStatement, "problemStatement"),
    examples: requireArray(problem.examples, "examples").map((example, index) => {
      const object = requireObject(example, `examples[${index}]`);
      return {
        input: requireString(object.input, `examples[${index}].input`),
        output: requireString(object.output, `examples[${index}].output`),
        explanation: requireString(object.explanation, `examples[${index}].explanation`)
      };
    }),
    constraints: requireStringArray(problem.constraints, "constraints"),
    starterCode: requireString(problem.starterCode, "starterCode"),
    expectedConcepts: requireStringArray(problem.expectedConcepts, "expectedConcepts"),
    publicTests: requireStringArray(problem.publicTests, "publicTests"),
    hiddenTests: requireStringArray(problem.hiddenTests, "hiddenTests"),
    canonicalSolution: requireString(problem.canonicalSolution, "canonicalSolution"),
    rubric: {
      correctness: requireNumber(rubric.correctness, "rubric.correctness"),
      edgeCases: requireNumber(rubric.edgeCases, "rubric.edgeCases"),
      codeQuality: requireNumber(rubric.codeQuality, "rubric.codeQuality"),
      complexity: requireNumber(rubric.complexity, "rubric.complexity")
    }
  };
}

export function validateScoreReport(value: unknown): ScoreReport {
  const report = requireObject(value, "scoreReport");
  return {
    score: clampScore(requireNumber(report.score, "score"), 100),
    correctness: clampScore(requireNumber(report.correctness, "correctness"), 50),
    edgeCases: clampScore(requireNumber(report.edgeCases, "edgeCases"), 20),
    codeQuality: clampScore(requireNumber(report.codeQuality, "codeQuality"), 15),
    complexity: clampScore(requireNumber(report.complexity, "complexity"), 15),
    majorIssues: requireStringArray(report.majorIssues, "majorIssues"),
    minorIssues: requireStringArray(report.minorIssues, "minorIssues"),
    whatTheyDidWell: requireStringArray(report.whatTheyDidWell, "whatTheyDidWell"),
    nextStepAdvice: requireString(report.nextStepAdvice, "nextStepAdvice"),
    mistakeTags: requireStringArray(report.mistakeTags, "mistakeTags"),
    shouldRevealSolution: false
  };
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

function requireNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${label} must be a number.`);
  }
  return value;
}

function requireArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array.`);
  }
  return value;
}

function requireStringArray(value: unknown, label: string): string[] {
  return requireArray(value, label).map((item, index) =>
    requireString(item, `${label}[${index}]`)
  );
}

function clampScore(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}
