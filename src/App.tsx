import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, History, Play } from "lucide-react";
import { CoachingPanel } from "./components/CoachingPanel";
import { EditorWorkspace } from "./components/EditorWorkspace";
import { PracticeSetup } from "./components/PracticeSetup";
import { ProblemPanel } from "./components/ProblemPanel";
import { RuntimePanel } from "./components/RuntimePanel";
import { ScorePanel } from "./components/ScorePanel";
import { SessionHistory } from "./components/SessionHistory";
import { checkOllama, generateHint, generateProblem, gradeSubmission } from "./lib/ollama";
import {
  loadModelSettings,
  loadSessions,
  saveModelSettings,
  saveSessions,
  upsertSession
} from "./lib/storage";
import type {
  Difficulty,
  DojoSession,
  ModelHealth,
  ModelSettings,
  PracticeConfig,
  Submission
} from "./lib/types";

const defaultConfig: PracticeConfig = {
  language: "Python",
  topic: "data cleanup with dictionaries and edge cases",
  difficulty: "Intermediate",
  mode: "guided",
  estimatedMinutes: 35
};

const initialHealth: ModelHealth = {
  status: "unknown",
  message: "Check Ollama before generating a problem.",
  models: []
};

type BusyState = "idle" | "checking" | "generating" | "hinting" | "scoring";

export default function App() {
  const [settings, setSettings] = useState<ModelSettings>(() => loadModelSettings());
  const [health, setHealth] = useState<ModelHealth>(initialHealth);
  const [config, setConfig] = useState<PracticeConfig>(defaultConfig);
  const [sessions, setSessions] = useState<DojoSession[]>(() => loadSessions());
  const [activeSession, setActiveSession] = useState<DojoSession | undefined>();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<BusyState>("idle");
  const [hasAutoChecked, setHasAutoChecked] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "success" | "error"; text: string }>();
  const [view, setView] = useState<"dojo" | "history">("dojo");

  const latestScore = activeSession?.submissions[0]?.scoreReport;
  const isBusy = busy !== "idle";

  useEffect(() => {
    saveModelSettings(settings);
  }, [settings]);

  const runHealthCheck = useCallback(async () => {
    setBusy("checking");
    setHealth((current) => ({ ...current, status: "checking", message: "Checking Ollama..." }));
    const next = await checkOllama(settings);
    setHealth(next);
    setBusy("idle");
    if (next.status === "running") {
      setMessage({ tone: "success", text: next.message });
    } else {
      setMessage({ tone: "error", text: next.message });
    }
  }, [settings]);

  useEffect(() => {
    if (!hasAutoChecked) {
      setHasAutoChecked(true);
      void runHealthCheck();
    }
  }, [hasAutoChecked, runHealthCheck]);

  const persistSession = useCallback((session: DojoSession) => {
    const next = upsertSession(session);
    setSessions(next);
    setActiveSession(session);
  }, []);

  const startGeneratedSession = useCallback(
    async (nextConfig: PracticeConfig, followUpContext?: string) => {
      if (!nextConfig.topic.trim()) {
        setMessage({ tone: "error", text: "Add a practice topic before generating a problem." });
        return;
      }

      setBusy("generating");
      setMessage({ tone: "info", text: "Asking the local model for a structured problem..." });

      try {
        const problem = await generateProblem(settings, nextConfig, followUpContext);
        const now = new Date().toISOString();
        const session: DojoSession = {
          id: crypto.randomUUID(),
          language: nextConfig.language,
          topic: nextConfig.topic.trim(),
          difficulty: nextConfig.difficulty,
          mode: nextConfig.mode,
          problem,
          hintsUsed: 0,
          hints: [],
          submissions: [],
          createdAt: now,
          updatedAt: now
        };
        persistSession(session);
        setConfig(nextConfig);
        setCode(problem.starterCode);
        setView("dojo");
        setMessage({ tone: "success", text: "Problem generated and session saved." });
      } catch (error) {
        setMessage({ tone: "error", text: errorMessage(error) });
      } finally {
        setBusy("idle");
      }
    },
    [persistSession, settings]
  );

  const requestHint = useCallback(async () => {
    if (!activeSession || activeSession.hints.length >= 3) {
      return;
    }

    const hintLevel = activeSession.hints.length + 1;
    setBusy("hinting");
    setMessage({ tone: "info", text: `Requesting hint ${hintLevel}...` });

    try {
      const hintText = await generateHint(settings, activeSession.problem, code, hintLevel);
      const now = new Date().toISOString();
      const updated: DojoSession = {
        ...activeSession,
        hintsUsed: hintLevel,
        hints: [
          ...activeSession.hints,
          {
            id: crypto.randomUUID(),
            sessionId: activeSession.id,
            hintLevel,
            hintText,
            createdAt: now
          }
        ],
        updatedAt: now
      };
      persistSession(updated);
      setMessage({ tone: "success", text: `Hint ${hintLevel} added.` });
    } catch (error) {
      setMessage({ tone: "error", text: errorMessage(error) });
    } finally {
      setBusy("idle");
    }
  }, [activeSession, code, persistSession, settings]);

  const submitSolution = useCallback(async () => {
    if (!activeSession) {
      return;
    }

    setBusy("scoring");
    setMessage({ tone: "info", text: "Grading with the rubric and hidden solution context..." });

    try {
      const scoreReport = await gradeSubmission(settings, activeSession.problem, code);
      const now = new Date().toISOString();
      const submission: Submission = {
        id: crypto.randomUUID(),
        sessionId: activeSession.id,
        code,
        createdAt: now,
        scoreReport
      };
      const updated: DojoSession = {
        ...activeSession,
        submissions: [submission, ...activeSession.submissions],
        updatedAt: now
      };
      persistSession(updated);
      setMessage({ tone: "success", text: `Scored ${scoreReport.score}/100.` });
    } catch (error) {
      setMessage({ tone: "error", text: errorMessage(error) });
    } finally {
      setBusy("idle");
    }
  }, [activeSession, code, persistSession, settings]);

  const generateVariant = useCallback(
    (variant: "similar" | "easier" | "harder") => {
      if (!activeSession) {
        return;
      }

      const nextDifficulty = adjustDifficulty(config.difficulty, variant);
      const nextConfig = { ...config, difficulty: nextDifficulty };
      const latestAdvice = activeSession.submissions[0]?.scoreReport?.nextStepAdvice;
      const followUpContext = [
        `Current problem title: ${activeSession.problem.title}.`,
        variant === "similar" ? "Generate a similar rep with a fresh scenario." : "",
        variant === "easier" ? "Reduce complexity while keeping the same core topic." : "",
        variant === "harder" ? "Increase challenge with one additional edge case." : "",
        latestAdvice ? `Previous feedback: ${latestAdvice}` : ""
      ]
        .filter(Boolean)
        .join(" ");

      void startGeneratedSession(nextConfig, followUpContext);
    },
    [activeSession, config, startGeneratedSession]
  );

  const selectSession = (session: DojoSession) => {
    setActiveSession(session);
    setConfig({
      language: session.language,
      topic: session.topic,
      difficulty: session.difficulty,
      mode: session.mode,
      estimatedMinutes: config.estimatedMinutes
    });
    setCode(session.submissions[0]?.code ?? session.problem.starterCode);
    setView("dojo");
    setMessage({ tone: "info", text: "Loaded saved session." });
  };

  const clearHistory = () => {
    if (!confirm("Clear all saved CodeThrower sessions?")) {
      return;
    }
    saveSessions([]);
    setSessions([]);
    setActiveSession(undefined);
    setCode("");
    setMessage({ tone: "success", text: "Session history cleared." });
  };

  const statusText = useMemo(() => {
    if (busy === "idle") {
      return activeSession ? "Ready for the next rep action." : "Ready to generate a rep.";
    }
    return {
      checking: "Checking runtime...",
      generating: "Generating problem...",
      hinting: "Generating hint...",
      scoring: "Scoring submission..."
    }[busy];
  }, [activeSession, busy]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="product-kicker">CodeThrower</p>
          <h1>Local coding dojo</h1>
        </div>

        <nav className="view-tabs" aria-label="Primary views">
          <button className={view === "dojo" ? "active" : ""} onClick={() => setView("dojo")}>
            <Play size={17} aria-hidden="true" />
            Dojo
          </button>
          <button
            className={view === "history" ? "active" : ""}
            onClick={() => setView("history")}
          >
            <History size={17} aria-hidden="true" />
            History
          </button>
        </nav>
      </header>

      <RuntimePanel
        settings={settings}
        health={health}
        onSettingsChange={setSettings}
        onCheck={runHealthCheck}
      />

      {message && (
        <div className={`app-message ${message.tone}`} role="status">
          {message.tone === "error" ? (
            <AlertCircle size={17} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={17} aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="status-strip">{statusText}</div>

      {view === "dojo" ? (
        <div className="dojo-layout">
          <aside className="left-rail">
            <PracticeSetup
              config={config}
              isBusy={isBusy}
              onConfigChange={setConfig}
              onGenerate={() => void startGeneratedSession(config)}
            />
            <CoachingPanel
              hints={activeSession?.hints ?? []}
              isBusy={isBusy}
              hasProblem={Boolean(activeSession)}
              onHint={requestHint}
            />
          </aside>

          <ProblemPanel problem={activeSession?.problem} />

          <div className="right-rail">
            <EditorWorkspace
              language={config.language}
              code={code}
              isBusy={isBusy}
              hasProblem={Boolean(activeSession)}
              onCodeChange={setCode}
              onReset={() => setCode(activeSession?.problem.starterCode ?? "")}
              onSubmit={submitSolution}
              onGenerateVariant={generateVariant}
            />
            <ScorePanel report={latestScore} />
          </div>
        </div>
      ) : (
        <SessionHistory
          sessions={sessions}
          activeSessionId={activeSession?.id}
          onSelect={selectSession}
          onClear={clearHistory}
        />
      )}
    </main>
  );
}

function adjustDifficulty(current: Difficulty, variant: "similar" | "easier" | "harder") {
  if (variant === "similar") {
    return current;
  }

  const ladder: Difficulty[] = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Interview",
    "Expert"
  ];
  const index = ladder.indexOf(current);
  if (index === -1) {
    return variant === "easier" ? "Intermediate" : "Advanced";
  }
  const nextIndex = variant === "easier" ? Math.max(0, index - 1) : Math.min(ladder.length - 1, index + 1);
  return ladder[nextIndex];
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
}
