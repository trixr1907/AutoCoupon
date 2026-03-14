import { RUN_LIMITS } from '../../shared/config/timing';
import type {
  ActivationMode,
  ActivationOutcome,
  ActivationStatus,
  PageStateResult,
  ResolvedCouponCandidate,
} from '../../shared/contracts/models';
import { createEmptySummary, createIdleStatus } from '../../shared/contracts/models';
import { createLogger } from '../../shared/logging/logger';
import type { PaybackAdapter } from '../sites/payback/adapter';

const logger = createLogger('activation-runner');

type SummaryKey = 'activated' | 'alreadyActive' | 'unavailable' | 'failed';

class CancellationError extends Error {
  constructor() {
    super('Activation cancelled');
  }
}

export class ActivationRunner {
  private status: ActivationStatus = createIdleStatus();
  private active = false;
  private cancelRequested = false;
  private readonly outcomes = new Map<string, SummaryKey>();

  constructor(
    private readonly adapter: PaybackAdapter,
    private readonly onStatusChange: (status: ActivationStatus) => void
  ) {}

  getStatus(): ActivationStatus {
    return {
      ...this.status,
      summary: { ...this.status.summary },
    };
  }

  isRunning(): boolean {
    return this.active;
  }

  cancel(): boolean {
    if (!this.active) {
      return false;
    }

    this.cancelRequested = true;
    this.updateStatus({
      message: 'Abbruch angefordert…',
    });

    return true;
  }

  async start(mode: ActivationMode): Promise<ActivationStatus> {
    if (this.active) {
      return this.getStatus();
    }

    this.active = true;
    this.cancelRequested = false;
    this.outcomes.clear();

    this.status = {
      ...createIdleStatus(),
      phase: 'checking',
      pageState: 'busy',
      mode,
      message: 'Prüfe Coupon-Seite…',
      summary: createEmptySummary(),
      startedAt: Date.now(),
      canCancel: true,
      progressPercent: 8,
    };
    this.emitStatus();

    try {
      const pageState = await this.adapter.detectPageState();
      if (pageState.state !== 'ready') {
        this.finishAsPageError(pageState);
        return this.getStatus();
      }

      await this.run(pageState);
      this.finishSuccessfully();
      return this.getStatus();
    } catch (error) {
      if (error instanceof CancellationError) {
        this.finishCancelled();
        return this.getStatus();
      }

      logger.error('Activation failed', error);
      this.finishUnexpectedError(error);
      return this.getStatus();
    } finally {
      this.active = false;
    }
  }

  private async run(initialPageState: PageStateResult): Promise<void> {
    this.updateStatus({
      phase: 'scanning',
      pageState: 'busy',
      message: initialPageState.message,
    });

    let scrollPasses = 0;

    while (true) {
      this.throwIfCancelled();

      const candidates = await this.adapter.collectCandidates();
      this.observeCandidates(candidates);

      const activatable = candidates.filter(
        (candidate) =>
          candidate.status === 'activatable' && !this.outcomes.has(candidate.id)
      );

      if (activatable.length === 0) {
        const revealedMore =
          scrollPasses < RUN_LIMITS.maxScrollPasses
            ? await this.adapter.revealMoreCandidates(this.status.mode ?? 'normal')
            : false;

        if (revealedMore) {
          scrollPasses += 1;
          this.updateStatus({
            phase: 'scanning',
            pageState: 'busy',
            message: 'Suche nach weiteren Coupons…',
          });
          continue;
        }

        break;
      }

      scrollPasses = 0;

      const mode = this.status.mode ?? 'normal';
      const batch =
        mode === 'normal'
          ? activatable.slice(0, 1)
          : mode === 'turbo'
            ? activatable
            : activatable.slice(0, RUN_LIMITS.maxExtremeBurstSize);

      if (mode === 'turbo-extreme' && batch.length > 1) {
        await this.processBurst(batch);
      } else {
        for (const candidate of batch) {
          this.throwIfCancelled();
          await this.processCandidate(candidate);
        }
      }
    }
  }

  private async processCandidate(
    candidate: ResolvedCouponCandidate
  ): Promise<void> {
    this.throwIfCancelled();
    this.updateStatus({
      phase: 'running',
      pageState: 'busy',
      message: `Verarbeite ${candidate.label || 'Coupon'}…`,
    });

    const result = await this.adapter.activateCandidate(
      candidate,
      this.status.mode ?? 'normal'
    );

    this.outcomes.set(result.candidateId, this.mapOutcome(result.outcome));
    this.refreshSummary();

    this.updateStatus({
      phase: 'running',
      pageState: 'busy',
      message: result.message,
    });
  }

  private async processBurst(
    candidates: ResolvedCouponCandidate[]
  ): Promise<void> {
    this.throwIfCancelled();
    this.updateStatus({
      phase: 'running',
      pageState: 'busy',
      message: `Extreme-Burst: ${candidates.length} sichtbare Coupons…`,
    });

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          return await this.adapter.activateCandidate(candidate, 'turbo-extreme');
        } catch (error) {
          logger.error('Extreme burst candidate failed', error);
          return {
            candidateId: candidate.id,
            outcome: 'failed' as const,
            message:
              error instanceof Error
                ? error.message
                : 'Unbekannter Aktivierungsfehler',
          };
        }
      })
    );

    for (const result of results) {
      this.outcomes.set(result.candidateId, this.mapOutcome(result.outcome));
    }

    this.refreshSummary();

    const activated = results.filter((result) => result.outcome === 'activated')
      .length;
    const failed = results.filter((result) => result.outcome === 'failed').length;

    this.updateStatus({
      phase: 'running',
      pageState: 'busy',
      message:
        failed > 0
          ? `Extreme-Burst abgeschlossen: ${activated} aktiviert, ${failed} fehlgeschlagen.`
          : `Extreme-Burst abgeschlossen: ${activated} aktiviert.`,
    });
  }

  private observeCandidates(candidates: ResolvedCouponCandidate[]): void {
    for (const candidate of candidates) {
      if (this.outcomes.has(candidate.id)) {
        continue;
      }

      if (candidate.status === 'already-active') {
        this.outcomes.set(candidate.id, 'alreadyActive');
      } else if (candidate.status === 'unavailable') {
        this.outcomes.set(candidate.id, 'unavailable');
      }
    }

    this.refreshSummary(candidates.length);
  }

  private refreshSummary(totalSeenOverride?: number): void {
    const summary = createEmptySummary();
    summary.totalSeen = Math.max(
      totalSeenOverride ?? 0,
      this.status.summary.totalSeen,
      this.outcomes.size
    );

    for (const outcome of this.outcomes.values()) {
      summary[outcome] += 1;
      summary.processed += 1;
    }

    summary.totalSeen = Math.max(summary.totalSeen, summary.processed);
    summary.durationMs = this.status.startedAt
      ? Date.now() - this.status.startedAt
      : 0;

    this.updateStatus({
      summary,
    });
  }

  private finishSuccessfully(): void {
    const summary = this.getStatus().summary;
    const message =
      summary.activated > 0
        ? `${summary.activated} Coupon${summary.activated === 1 ? '' : 's'} aktiviert.`
        : 'Keine neuen aktivierbaren Coupons gefunden.';

    this.updateStatus({
      phase: 'completed',
      pageState: 'ready',
      message,
      canCancel: false,
      finishedAt: Date.now(),
      progressPercent: 100,
    });
  }

  private finishCancelled(): void {
    const summary = {
      ...this.status.summary,
      aborted: true,
      durationMs: this.status.startedAt
        ? Date.now() - this.status.startedAt
        : 0,
    };

    this.updateStatus({
      phase: 'cancelled',
      pageState: 'ready',
      message: 'Aktivierung abgebrochen.',
      summary,
      canCancel: false,
      finishedAt: Date.now(),
      progressPercent: 100,
    });
  }

  private finishAsPageError(pageState: PageStateResult): void {
    this.updateStatus({
      phase: 'error',
      pageState: pageState.state,
      message: pageState.message,
      canCancel: false,
      finishedAt: Date.now(),
      lastError: pageState.message,
      progressPercent: 100,
    });
  }

  private finishUnexpectedError(error: unknown): void {
    const message =
      error instanceof Error ? error.message : 'Unbekannter Aktivierungsfehler';

    this.updateStatus({
      phase: 'error',
      pageState: 'ready',
      message,
      canCancel: false,
      finishedAt: Date.now(),
      lastError: message,
      progressPercent: 100,
    });
  }

  private updateStatus(partial: Partial<ActivationStatus>): void {
    this.status = {
      ...this.status,
      ...partial,
      summary: {
        ...this.status.summary,
        ...(partial.summary ?? {}),
      },
    };

    this.status.summary.durationMs = this.status.startedAt
      ? Date.now() - this.status.startedAt
      : this.status.summary.durationMs;

    this.status.progressPercent =
      partial.progressPercent ?? this.calculateProgress(this.status);

    this.emitStatus();
  }

  private calculateProgress(status: ActivationStatus): number {
    if (
      status.phase === 'completed' ||
      status.phase === 'cancelled' ||
      status.phase === 'error'
    ) {
      return 100;
    }

    if (status.phase === 'checking') {
      return 8;
    }

    if (status.summary.totalSeen === 0) {
      return 20;
    }

    return Math.min(
      99,
      Math.round((status.summary.processed / status.summary.totalSeen) * 100)
    );
  }

  private emitStatus(): void {
    this.onStatusChange(this.getStatus());
  }

  private throwIfCancelled(): void {
    if (this.cancelRequested) {
      throw new CancellationError();
    }
  }

  private mapOutcome(outcome: ActivationOutcome): SummaryKey {
    switch (outcome) {
      case 'activated':
        return 'activated';
      case 'already-active':
        return 'alreadyActive';
      case 'failed':
        return 'failed';
      default:
        return 'unavailable';
    }
  }
}
