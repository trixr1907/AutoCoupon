import type { RunSummary, Settings } from '../../shared/contracts/models';
import { browserApi } from '../browser/browser';

const SETTINGS_KEY = 'settings';
const LAST_RUN_SUMMARY_KEY = 'lastRunSummary';

export const defaultSettings: Settings = {
  preferredMode: 'normal',
  overlayEnabled: true,
  debugLoggingEnabled: false,
  firstRunHintDismissed: false,
};

export async function getSettings(): Promise<Settings> {
  const stored = (await browserApi.storage.local.get(
    SETTINGS_KEY
  )) as Partial<Record<typeof SETTINGS_KEY, Partial<Settings>>>;

  return {
    ...defaultSettings,
    ...(stored[SETTINGS_KEY] ?? {}),
  };
}

export async function updateSettings(
  patch: Partial<Settings>
): Promise<Settings> {
  const merged = {
    ...(await getSettings()),
    ...patch,
  };

  await browserApi.storage.local.set({
    [SETTINGS_KEY]: merged,
  });

  return merged;
}

export async function getLastRunSummary(): Promise<RunSummary | null> {
  const stored = (await browserApi.storage.local.get(
    LAST_RUN_SUMMARY_KEY
  )) as Partial<Record<typeof LAST_RUN_SUMMARY_KEY, RunSummary | null>>;

  return stored[LAST_RUN_SUMMARY_KEY] ?? null;
}

export async function setLastRunSummary(
  summary: RunSummary | null
): Promise<void> {
  await browserApi.storage.local.set({
    [LAST_RUN_SUMMARY_KEY]: summary,
  });
}
