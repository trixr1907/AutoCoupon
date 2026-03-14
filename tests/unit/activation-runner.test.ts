import { ActivationRunner } from '../../src/content/runtime/activation-runner';
import { PaybackAdapter } from '../../src/content/sites/payback/adapter';
import type {
  ActivationAttemptResult,
  ActivationMode,
  ActivationStatus,
  PageStateResult,
  ResolvedCouponCandidate,
} from '../../src/shared/contracts/models';

class TrackingAdapter extends PaybackAdapter {
  public collectCalls = 0;

  override async collectCandidates() {
    this.collectCalls += 1;
    return await super.collectCandidates();
  }
}

class ConcurrentAdapter {
  public maxConcurrentActivations = 0;
  private concurrentActivations = 0;
  private readonly candidates: ResolvedCouponCandidate[];
  private readonly activated = new Set<string>();

  constructor(count: number) {
    this.candidates = Array.from({ length: count }, (_, index) => {
      const container = document.createElement('article');
      const actionElement = document.createElement('button');
      container.append(actionElement);

      return {
        id: `candidate-${index + 1}`,
        label: `Coupon ${index + 1}`,
        status: 'activatable' as const,
        confidence: 10,
        source: 'heuristic' as const,
        container,
        actionElement,
      };
    });
  }

  async detectPageState(): Promise<PageStateResult> {
    return {
      state: 'ready',
      message: 'Bereit',
      candidateCount: this.candidates.length,
      activatableCount: this.candidates.filter(
        (candidate) => !this.activated.has(candidate.id)
      ).length,
      blockers: [],
      detectedAt: Date.now(),
    };
  }

  async collectCandidates(): Promise<ResolvedCouponCandidate[]> {
    return this.candidates.map((candidate) => ({
      ...candidate,
      status: this.activated.has(candidate.id) ? 'already-active' : 'activatable',
    }));
  }

  async activateCandidate(
    candidate: ResolvedCouponCandidate,
    _mode: ActivationMode
  ): Promise<ActivationAttemptResult> {
    this.concurrentActivations += 1;
    this.maxConcurrentActivations = Math.max(
      this.maxConcurrentActivations,
      this.concurrentActivations
    );

    await new Promise((resolve) => {
      window.setTimeout(resolve, 40);
    });

    this.activated.add(candidate.id);
    this.concurrentActivations -= 1;

    return {
      candidateId: candidate.id,
      outcome: 'activated',
      message: 'Aktiviert',
    };
  }

  async waitForStability(): Promise<void> {}

  async revealMoreCandidates(): Promise<boolean> {
    return false;
  }
}

function buildActivatableCoupon(label: string): HTMLElement {
  const article = document.createElement('article');
  article.className = 'coupon-card';

  const title = document.createElement('h2');
  title.textContent = label;

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Aktivieren';
  button.addEventListener('click', () => {
    article.innerHTML = `<h2>${label}</h2><p>Bereits aktiviert</p>`;
  });

  article.append(title, button);
  return article;
}

function createRunner(adapter: PaybackAdapter | ConcurrentAdapter) {
  const snapshots: ActivationStatus[] = [];
  const runner = new ActivationRunner(adapter as never, (status) => {
    snapshots.push({
      ...status,
      summary: { ...status.summary },
    });
  });

  return { runner, snapshots };
}

describe('ActivationRunner', () => {
  it('handles rerenders without stale element failures', async () => {
    document.body.append(buildActivatableCoupon('10fach Punkte'));

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { runner } = createRunner(new PaybackAdapter());
    await runner.start('turbo');

    expect(runner.getStatus()).toMatchObject({
      phase: 'completed',
      summary: {
        activated: 1,
        failed: 0,
      },
    });
  });

  it('finds lazily loaded coupons after scrolling', async () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      writable: true,
      value: 2400,
    });
    Object.defineProperty(document.body, 'scrollHeight', {
      configurable: true,
      writable: true,
      value: 2400,
    });

    document.body.append(buildActivatableCoupon('Erster Coupon'));

    let lazyCouponAdded = false;
    window.scrollTo = vi.fn((options?: number | ScrollToOptions, y?: number) => {
      if (typeof options === 'number') {
        window.scrollY = y ?? 0;
      } else {
        window.scrollY = options?.top ?? 0;
      }

      if (!lazyCouponAdded && window.scrollY > 0) {
        lazyCouponAdded = true;
        document.body.append(buildActivatableCoupon('Nachgeladen'));
        Object.defineProperty(document.documentElement, 'scrollHeight', {
          configurable: true,
          writable: true,
          value: 900,
        });
        Object.defineProperty(document.body, 'scrollHeight', {
          configurable: true,
          writable: true,
          value: 900,
        });
      }
    });

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { runner } = createRunner(new PaybackAdapter());
    await runner.start('turbo');

    expect(runner.getStatus()).toMatchObject({
      phase: 'completed',
      summary: {
        activated: 2,
      },
    });
  });

  it('processes visible candidates in turbo without duplicate activations', async () => {
    document.body.append(
      buildActivatableCoupon('Erster Coupon'),
      buildActivatableCoupon('Zweiter Coupon'),
      buildActivatableCoupon('Dritter Coupon')
    );

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const adapter = new TrackingAdapter();
    const { runner } = createRunner(adapter);
    await runner.start('turbo');

    expect(runner.getStatus().summary.activated).toBe(3);
    expect(adapter.collectCalls).toBeGreaterThan(0);
  });

  it('runs visible activations concurrently in turbo-extreme', async () => {
    const adapter = new ConcurrentAdapter(4);
    const { runner } = createRunner(adapter);

    await runner.start('turbo-extreme');

    expect(runner.getStatus()).toMatchObject({
      phase: 'completed',
      summary: {
        activated: 4,
      },
    });
    expect(adapter.maxConcurrentActivations).toBeGreaterThan(1);
  });
});
