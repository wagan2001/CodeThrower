import type { DojoSession, ModelSettings } from "./types";

const sessionsKey = "codethrower.sessions.v1";
const settingsKey = "codethrower.modelSettings.v1";

export const defaultModelSettings: ModelSettings = {
  baseUrl: "http://localhost:11434",
  model: "qwen2.5-coder:7b-instruct",
  temperature: 0.25,
  contextSize: 8192
};

export function loadSessions(): DojoSession[] {
  return readJson<DojoSession[]>(sessionsKey, []);
}

export function saveSessions(sessions: DojoSession[]) {
  localStorage.setItem(sessionsKey, JSON.stringify(sessions));
}

export function upsertSession(session: DojoSession) {
  const sessions = loadSessions();
  const next = [session, ...sessions.filter((item) => item.id !== session.id)].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  );
  saveSessions(next);
  return next;
}

export function loadModelSettings(): ModelSettings {
  return {
    ...defaultModelSettings,
    ...readJson<Partial<ModelSettings>>(settingsKey, {})
  };
}

export function saveModelSettings(settings: ModelSettings) {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
