import type {
  BackgroundUiResponse,
  PopupRequest,
} from '../../shared/contracts/messages';
import {
  createEmptySummary,
  type ActivationMode,
  type ActiveTabContext,
  type Settings,
} from '../../shared/contracts/models';

type PopupDemoScenario = 'ready' | 'running' | 'result';

const DEFAULT_SETTINGS: Settings = {
  preferredMode: 'normal',
  overlayEnabled: true,
  debugLoggingEnabled: false,
  firstRunHintDismissed: false,
};

export function getPopupDemoResponse(
  message: PopupRequest
): BackgroundUiResponse | null {
  if (!isDemoMode()) {
    return null;
  }

  const settings = getDemoSettings();
  const scenario = getPopupDemoScenario();

  if (message.type === 'settings/update') {
    return {
      ok: true,
      settings: {
        ...settings,
        ...message.payload.patch,
      },
      context: createDemoContext(scenario, settings.preferredMode),
    };
  }

  if (message.type === 'settings/get') {
    return {
      ok: true,
      settings,
    };
  }

  return {
    ok: true,
    settings,
    context: createDemoContext(scenario, settings.preferredMode),
    notification:
      scenario === 'result'
        ? {
            level: 'success',
            title: 'Fertig',
            message: 'Die Demo zeigt einen abgeschlossenen Lauf mit Statistik.',
            dismissAfterMs: 0,
          }
        : undefined,
  };
}

export function getOptionsDemoSettings(): Settings | null {
  if (!isDemoMode()) {
    return null;
  }

  return getDemoSettings();
}

function createDemoContext(
  scenario: PopupDemoScenario,
  mode: ActivationMode
): ActiveTabContext {
  const now = Date.now();

  if (scenario === 'running') {
    return {
      tabId: 1,
      windowId: 1,
      isPaybackHost: true,
      contentReady: true,
      pageState: 'busy',
      status: {
        phase: 'running',
        pageState: 'busy',
        mode,
        message: '3 von 8 Coupons verarbeitet. Aktivierung laeuft lokal im Browser.',
        summary: {
          activated: 2,
          alreadyActive: 1,
          unavailable: 0,
          failed: 0,
          processed: 3,
          totalSeen: 8,
          aborted: false,
          durationMs: 1800,
        },
        startedAt: now - 1800,
        finishedAt: null,
        canCancel: true,
        lastError: null,
        progressPercent: 38,
      },
      lastSummary: null,
    };
  }

  if (scenario === 'result') {
    const summary = {
      activated: 9,
      alreadyActive: 3,
      unavailable: 1,
      failed: 0,
      processed: 13,
      totalSeen: 13,
      aborted: false,
      durationMs: 6200,
    };

    return {
      tabId: 1,
      windowId: 1,
      isPaybackHost: true,
      contentReady: true,
      pageState: 'ready',
      status: {
        phase: 'completed',
        pageState: 'ready',
        mode,
        message: 'Aktivierung abgeschlossen. Statistik siehe unten.',
        summary,
        startedAt: now - 6200,
        finishedAt: now,
        canCancel: false,
        lastError: null,
        progressPercent: 100,
      },
      lastSummary: summary,
    };
  }

  return {
    tabId: 1,
    windowId: 1,
    isPaybackHost: true,
    contentReady: true,
    pageState: 'ready',
    status: null,
    lastSummary: {
      ...createEmptySummary(),
      processed: 0,
      totalSeen: 12,
    },
  };
}

function getDemoSettings(): Settings {
  const params = new URLSearchParams(window.location.search);
  const preferredMode = normalizeMode(params.get('mode'));

  return {
    ...DEFAULT_SETTINGS,
    preferredMode,
  };
}

function getPopupDemoScenario(): PopupDemoScenario {
  const scenario = new URLSearchParams(window.location.search).get('demo');
  if (scenario === 'running' || scenario === 'result') {
    return scenario;
  }

  return 'ready';
}

function normalizeMode(value: string | null): ActivationMode {
  if (value === 'turbo' || value === 'turbo-extreme') {
    return value;
  }

  return 'normal';
}

function isDemoMode(): boolean {
  return new URLSearchParams(window.location.search).has('demo');
}
