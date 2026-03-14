export type PageState =
  | 'ready'
  | 'login-required'
  | 'unsupported-page'
  | 'unsupported-layout'
  | 'busy';

export type ActivationMode = 'normal' | 'turbo' | 'turbo-extreme';

export type CouponCandidateStatus =
  | 'activatable'
  | 'already-active'
  | 'unavailable';

export type CouponCandidateSource = 'heuristic' | 'legacy-shadow';

export type ActivationOutcome =
  | 'activated'
  | 'already-active'
  | 'unavailable'
  | 'failed'
  | 'aborted';

export type RunPhase =
  | 'idle'
  | 'checking'
  | 'scanning'
  | 'running'
  | 'completed'
  | 'cancelled'
  | 'error';

export type PageBlocker =
  | 'login'
  | 'captcha'
  | 'unsupported-host'
  | 'layout';

export interface Settings {
  preferredMode: ActivationMode;
  overlayEnabled: boolean;
  debugLoggingEnabled: boolean;
  firstRunHintDismissed: boolean;
}

export interface CouponCandidate {
  id: string;
  label: string;
  status: CouponCandidateStatus;
  confidence: number;
  source: CouponCandidateSource;
}

export interface ResolvedCouponCandidate extends CouponCandidate {
  container: HTMLElement;
  actionElement: HTMLElement | null;
}

export interface PageStateResult {
  state: PageState;
  message: string;
  candidateCount: number;
  activatableCount: number;
  blockers: PageBlocker[];
  detectedAt: number;
}

export interface RunSummary {
  activated: number;
  alreadyActive: number;
  unavailable: number;
  failed: number;
  processed: number;
  totalSeen: number;
  aborted: boolean;
  durationMs: number;
}

export interface ActivationStatus {
  phase: RunPhase;
  pageState: PageState;
  mode: ActivationMode | null;
  message: string;
  summary: RunSummary;
  startedAt: number | null;
  finishedAt: number | null;
  canCancel: boolean;
  lastError: string | null;
  progressPercent: number;
}

export interface UiNotification {
  level: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  dismissAfterMs: number;
}

export interface ActiveTabContext {
  tabId: number | null;
  windowId: number | null;
  isPaybackHost: boolean;
  contentReady: boolean;
  pageState: PageState;
  status: ActivationStatus | null;
  lastSummary: RunSummary | null;
}

export interface ActivationAttemptResult {
  candidateId: string;
  outcome: ActivationOutcome;
  message: string;
}

export function createEmptySummary(): RunSummary {
  return {
    activated: 0,
    alreadyActive: 0,
    unavailable: 0,
    failed: 0,
    processed: 0,
    totalSeen: 0,
    aborted: false,
    durationMs: 0,
  };
}

export function createIdleStatus(): ActivationStatus {
  return {
    phase: 'idle',
    pageState: 'unsupported-page',
    mode: null,
    message: 'Bereit',
    summary: createEmptySummary(),
    startedAt: null,
    finishedAt: null,
    canCancel: false,
    lastError: null,
    progressPercent: 0,
  };
}

export function createEmptyContext(): ActiveTabContext {
  return {
    tabId: null,
    windowId: null,
    isPaybackHost: false,
    contentReady: false,
    pageState: 'unsupported-page',
    status: null,
    lastSummary: null,
  };
}
