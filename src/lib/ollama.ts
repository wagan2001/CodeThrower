import {
  buildHintPrompt,
  buildProblemPrompt,
  buildRepairPrompt,
  buildScoringPrompt,
  problemSchemaText,
  scoreSchemaText
} from "./prompts";
import { parseModelJson, validateGeneratedProblem, validateScoreReport } from "./json";
import type {
  GeneratedProblem,
  ModelHealth,
  ModelSettings,
  PracticeConfig,
  ScoreReport
} from "./types";

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
};

type OllamaTagsResponse = {
  models?: { name: string }[];
};

export async function checkOllama(settings: ModelSettings): Promise<ModelHealth> {
  try {
    const response = await fetch(`${trimSlash(settings.baseUrl)}/api/tags`);
    if (!response.ok) {
      return {
        status: "error",
        message: `Ollama responded with HTTP ${response.status}.`,
        models: []
      };
    }

    const data = (await response.json()) as OllamaTagsResponse;
    const models = data.models?.map((model) => model.name).sort() ?? [];
    const hasConfiguredModel = models.includes(settings.model);

    return {
      status: "running",
      message: hasConfiguredModel
        ? `${settings.model} is available.`
        : `Ollama is running. Pull ${settings.model} or choose an installed model.`,
      models
    };
  } catch (error) {
    return {
      status: "offline",
      message:
        error instanceof Error
          ? `Could not reach Ollama: ${error.message}`
          : "Could not reach Ollama.",
      models: []
    };
  }
}

export async function generateProblem(
  settings: ModelSettings,
  config: PracticeConfig,
  followUpContext?: string
): Promise<GeneratedProblem> {
  const raw = await generateText(settings, buildProblemPrompt(config, followUpContext));
  return parseAndRepair(
    settings,
    raw,
    problemSchemaText,
    validateGeneratedProblem
  );
}

export async function generateHint(
  settings: ModelSettings,
  problem: GeneratedProblem,
  code: string,
  hintLevel: number
) {
  return generateText(settings, buildHintPrompt(problem, code, hintLevel));
}

export async function gradeSubmission(
  settings: ModelSettings,
  problem: GeneratedProblem,
  code: string
): Promise<ScoreReport> {
  const raw = await generateText(settings, buildScoringPrompt(problem, code));
  return parseAndRepair(settings, raw, scoreSchemaText, validateScoreReport);
}

async function parseAndRepair<T>(
  settings: ModelSettings,
  raw: string,
  schema: string,
  validate: (value: unknown) => T
): Promise<T> {
  try {
    return validate(parseModelJson(raw));
  } catch (firstError) {
    const repaired = await generateText(settings, buildRepairPrompt(schema, raw), 0.05);
    try {
      return validate(parseModelJson(repaired));
    } catch (secondError) {
      throw new Error(
        `The model returned invalid JSON. ${
          secondError instanceof Error ? secondError.message : String(firstError)
        }`
      );
    }
  }
}

async function generateText(
  settings: ModelSettings,
  prompt: string,
  temperature = settings.temperature
) {
  const response = await fetch(`${trimSlash(settings.baseUrl)}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: settings.model,
      prompt,
      stream: false,
      options: {
        temperature,
        num_ctx: settings.contextSize
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama generation failed with HTTP ${response.status}.`);
  }

  const data = (await response.json()) as OllamaGenerateResponse;
  if (data.error) {
    throw new Error(data.error);
  }
  if (!data.response) {
    throw new Error("Ollama returned an empty response.");
  }

  return data.response;
}

function trimSlash(value: string) {
  return value.replace(/\/$/, "");
}
