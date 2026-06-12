export type Difficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Interview"
  | "Expert"
  | "Adaptive";

export type PracticeMode =
  | "guided"
  | "test"
  | "debugging"
  | "refactor"
  | "explain_first";

export type RuntimeStatus = "unknown" | "checking" | "running" | "offline" | "error";

export type ProblemExample = {
  input: string;
  output: string;
  explanation: string;
};

export type GeneratedProblem = {
  title: string;
  problemStatement: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: string;
  expectedConcepts: string[];
  publicTests: string[];
  hiddenTests: string[];
  canonicalSolution: string;
  rubric: {
    correctness: number;
    edgeCases: number;
    codeQuality: number;
    complexity: number;
  };
};

export type ScoreReport = {
  score: number;
  correctness: number;
  edgeCases: number;
  codeQuality: number;
  complexity: number;
  majorIssues: string[];
  minorIssues: string[];
  whatTheyDidWell: string[];
  nextStepAdvice: string;
  mistakeTags: string[];
  shouldRevealSolution?: boolean;
};

export type Submission = {
  id: string;
  sessionId: string;
  code: string;
  createdAt: string;
  scoreReport?: ScoreReport;
};

export type HintRecord = {
  id: string;
  sessionId: string;
  hintLevel: number;
  hintText: string;
  createdAt: string;
};

export type DojoSession = {
  id: string;
  language: string;
  topic: string;
  difficulty: Difficulty;
  mode: PracticeMode;
  problem: GeneratedProblem;
  hintsUsed: number;
  hints: HintRecord[];
  submissions: Submission[];
  createdAt: string;
  updatedAt: string;
};

export type PracticeConfig = {
  language: string;
  topic: string;
  difficulty: Difficulty;
  mode: PracticeMode;
  estimatedMinutes: number;
};

export type ModelSettings = {
  baseUrl: string;
  model: string;
  temperature: number;
  contextSize: number;
};

export type ModelHealth = {
  status: RuntimeStatus;
  message: string;
  models: string[];
};
