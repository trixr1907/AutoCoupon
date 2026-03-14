import type {
  ActivationStatus,
  ActiveTabContext,
  PageState,
  RunSummary,
} from '../shared/contracts/models';
import { createEmptyContext } from '../shared/contracts/models';

export function buildTabContext(input: {
  tabId: number | null;
  windowId: number | null;
  isPaybackHost: boolean;
  contentReady: boolean;
  pageState?: PageState;
  status?: ActivationStatus | null;
  lastSummary?: RunSummary | null;
}): ActiveTabContext {
  const context = createEmptyContext();

  return {
    ...context,
    tabId: input.tabId,
    windowId: input.windowId,
    isPaybackHost: input.isPaybackHost,
    contentReady: input.contentReady,
    pageState: input.pageState ?? context.pageState,
    status: input.status ?? null,
    lastSummary: input.lastSummary ?? null,
  };
}
