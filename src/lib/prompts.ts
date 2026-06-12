import type { GeneratedProblem, PracticeConfig } from "./types";

export const problemSchemaText = `{
  "title": string,
  "problemStatement": string,
  "examples": [
    {
      "input": string,
      "output": string,
      "explanation": string
    }
  ],
  "constraints": string[],
  "starterCode": string,
  "expectedConcepts": string[],
  "publicTests": string[],
  "hiddenTests": string[],
  "canonicalSolution": string,
  "rubric": {
    "correctness": 50,
    "edgeCases": 20,
    "codeQuality": 15,
    "complexity": 15
  }
}`;

export const scoreSchemaText = `{
  "score": number,
  "correctness": number,
  "edgeCases": number,
  "codeQuality": number,
  "complexity": number,
  "majorIssues": string[],
  "minorIssues": string[],
  "whatTheyDidWell": string[],
  "nextStepAdvice": string,
  "mistakeTags": string[],
  "shouldRevealSolution": false
}`;

export function buildProblemPrompt(config: PracticeConfig, followUpContext?: string) {
  return `You are a coding dojo problem generator.

Create one practice problem.

Language: ${config.language}
Topic: ${config.topic}
Difficulty: ${config.difficulty}
Mode: ${formatMode(config.mode)}
Estimated session length: ${config.estimatedMinutes} minutes
${followUpContext ? `Follow-up context: ${followUpContext}` : ""}

Return valid JSON only.

Schema:
${problemSchemaText}

Rules:
- The problem must be solvable in ${Math.max(15, config.estimatedMinutes - 10)} to ${Math.max(25, config.estimatedMinutes + 10)} minutes.
- The problem must match the requested language and topic.
- Avoid trivia.
- Avoid requiring external packages unless the user requested them.
- Make the task testable.
- Include public tests in a format a learner can reason about.
- Keep hidden tests internal in the JSON.
- Do not include markdown outside the JSON.`;
}

export function buildHintPrompt(problem: GeneratedProblem, currentCode: string, hintLevel: number) {
  return `You are a coding dojo coach.

The user is solving this problem:
${JSON.stringify(withoutSolution(problem), null, 2)}

The user's current code:
${currentCode || "(No code yet.)"}

Hint level requested: ${hintLevel}

Rules:
- Do not reveal the full solution.
- Hint level 1: small conceptual nudge.
- Hint level 2: point toward the likely approach.
- Hint level 3: describe the algorithm, but do not write complete code.
- Keep the hint specific to the user's code.
- Keep the hint under 120 words.`;
}

export function buildScoringPrompt(problem: GeneratedProblem, submission: string) {
  return `You are a strict coding evaluator.

Grade the user's submission against the problem, rubric, expected concepts, canonical solution, and tests.

Problem:
${JSON.stringify(problem, null, 2)}

User submission:
${submission || "(No code submitted.)"}

Return valid JSON only.

Schema:
${scoreSchemaText}

Rules:
- Be strict but helpful.
- Do not reveal the full canonical solution.
- Focus on the user's submitted answer.
- Mention concrete missing cases.
- Prefer actionable feedback over generic encouragement.
- Do not set shouldRevealSolution to true.`;
}

export function buildRepairPrompt(schema: string, invalidResponse: string) {
  return `You returned invalid JSON.

Fix the response so it is valid JSON matching this schema:
${schema}

Invalid response:
${invalidResponse}

Return valid JSON only.`;
}

function withoutSolution(problem: GeneratedProblem) {
  const { canonicalSolution: _solution, hiddenTests: _hidden, ...safeProblem } = problem;
  return safeProblem;
}

function formatMode(mode: PracticeConfig["mode"]) {
  return mode
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
