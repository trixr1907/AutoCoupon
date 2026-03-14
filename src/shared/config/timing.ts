import type { ActivationMode } from '../contracts/models';

export const DOM_STABILITY = {
  domQuietWindowMs: 350,
  domWaitTimeoutMs: 4000,
} as const;

export const RUN_LIMITS = {
  maxCandidatesPerScan: 250,
  maxScrollPasses: 5,
  maxExtremeBurstSize: 4,
} as const;

export const POPUP_POLL_INTERVAL_MS = 1000;
export const FINAL_OVERLAY_REMOVAL_MS = 12000;
export const ERROR_OVERLAY_REMOVAL_MS = 8000;
export const NOTIFICATION_TIMEOUT_MS = {
  settingsSaved: 2500,
  activationWarning: 3500,
  activationError: 3500,
  cancelWarning: 3000,
  backgroundError: 4000,
  contentError: 3500,
} as const;

export const MODE_TIMINGS: Record<
  ActivationMode,
  {
    beforeClickMinMs: number;
    beforeClickMaxMs: number;
    afterClickMinMs: number;
    afterClickMaxMs: number;
    scrollPauseMs: number;
    verificationPollMs: number;
    verificationTimeoutMs: number;
  }
> = {
  normal: {
    beforeClickMinMs: 450,
    beforeClickMaxMs: 900,
    afterClickMinMs: 550,
    afterClickMaxMs: 950,
    scrollPauseMs: 650,
    verificationPollMs: 120,
    verificationTimeoutMs: 2500,
  },
  turbo: {
    beforeClickMinMs: 0,
    beforeClickMaxMs: 0,
    afterClickMinMs: 0,
    afterClickMaxMs: 0,
    scrollPauseMs: 90,
    verificationPollMs: 20,
    verificationTimeoutMs: 1500,
  },
  'turbo-extreme': {
    beforeClickMinMs: 0,
    beforeClickMaxMs: 0,
    afterClickMinMs: 0,
    afterClickMaxMs: 0,
    scrollPauseMs: 35,
    verificationPollMs: 10,
    verificationTimeoutMs: 900,
  },
} as const;
