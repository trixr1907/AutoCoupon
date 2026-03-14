import type {
  ActivationStatus,
  ActiveTabContext,
  PageStateResult,
  RunSummary,
} from '../shared/contracts/models';
import { createEmptyContext } from '../shared/contracts/models';

export class SessionRegistry {
  private readonly contexts = new Map<number, ActiveTabContext>();

  ensure(tabId: number, windowId: number | null): ActiveTabContext {
    const existing = this.contexts.get(tabId);
    if (existing) {
      return existing;
    }

    const context = {
      ...createEmptyContext(),
      tabId,
      windowId,
    };
    this.contexts.set(tabId, context);
    return context;
  }

  get(tabId: number): ActiveTabContext | undefined {
    return this.contexts.get(tabId);
  }

  setBase(
    tabId: number,
    input: {
      windowId: number | null;
      isPaybackHost: boolean;
      contentReady?: boolean;
    }
  ): ActiveTabContext {
    const context = this.ensure(tabId, input.windowId);
    context.windowId = input.windowId;
    context.isPaybackHost = input.isPaybackHost;
    if (typeof input.contentReady === 'boolean') {
      context.contentReady = input.contentReady;
    }
    return context;
  }

  markContentReady(tabId: number, windowId: number | null): ActiveTabContext {
    const context = this.ensure(tabId, windowId);
    context.windowId = windowId;
    context.contentReady = true;
    return context;
  }

  updatePageState(
    tabId: number,
    pageState: PageStateResult
  ): ActiveTabContext | undefined {
    const context = this.contexts.get(tabId);
    if (!context) {
      return undefined;
    }

    context.pageState = pageState.state;
    return context;
  }

  updateStatus(
    tabId: number,
    status: ActivationStatus
  ): ActiveTabContext | undefined {
    const context = this.contexts.get(tabId);
    if (!context) {
      return undefined;
    }

    context.status = {
      ...status,
      summary: { ...status.summary },
    };
    context.pageState = status.pageState;
    if (status.phase === 'completed' || status.phase === 'cancelled') {
      context.lastSummary = { ...status.summary };
    }
    return context;
  }

  updateSummary(
    tabId: number,
    summary: RunSummary
  ): ActiveTabContext | undefined {
    const context = this.contexts.get(tabId);
    if (!context) {
      return undefined;
    }

    context.lastSummary = { ...summary };
    return context;
  }

  remove(tabId: number): void {
    this.contexts.delete(tabId);
  }
}
