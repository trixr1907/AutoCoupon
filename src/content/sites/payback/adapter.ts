import {
  DOM_STABILITY,
  MODE_TIMINGS,
  RUN_LIMITS,
} from '../../../shared/config/timing';
import type {
  ActivationAttemptResult,
  ActivationMode,
  CouponCandidateStatus,
  PageBlocker,
  PageStateResult,
  ResolvedCouponCandidate,
} from '../../../shared/contracts/models';
import { createLogger } from '../../../shared/logging/logger';
import {
  ACTION_SELECTOR,
  ACTIVATE_PATTERNS,
  ALREADY_ACTIVE_PATTERNS,
  CAPTCHA_PATTERNS,
  CONTAINER_SELECTOR,
  COUPON_HINT_PATTERNS,
  COUPON_SURFACE_PATTERNS,
  LOGIN_PATTERNS,
  REDEEM_PATTERNS,
  UNAVAILABLE_PATTERNS,
  matchesAny,
} from './patterns';

type SearchRoot = Document | ShadowRoot | Element;

interface PaybackAdapterOptions {
  pageUrl?: URL | string | (() => URL | string);
  root?: SearchRoot;
}

const logger = createLogger('payback-adapter');

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function truncateText(value: string, maxLength: number): string {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 1)}…`;
}

function collectSearchRoots(root: SearchRoot = document): SearchRoot[] {
  const roots: SearchRoot[] = [root];
  const queue: SearchRoot[] = [root];
  const seen = new Set<Node>([root]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const nodes = current.querySelectorAll('*');
    for (const node of nodes) {
      if (node.shadowRoot && !seen.has(node.shadowRoot)) {
        seen.add(node.shadowRoot);
        roots.push(node.shadowRoot);
        queue.push(node.shadowRoot);
      }
    }
  }

  return roots;
}

function queryAllDeep<T extends Element>(
  selector: string,
  root: SearchRoot = document
): T[] {
  const results: T[] = [];
  const seen = new Set<Element>();

  for (const searchRoot of collectSearchRoots(root)) {
    for (const match of Array.from(searchRoot.querySelectorAll<T>(selector))) {
      if (!seen.has(match)) {
        seen.add(match);
        results.push(match);
      }
    }
  }

  return results;
}

function getTextContent(element: Element | null | undefined): string {
  if (!element) {
    return '';
  }

  if ('innerText' in element && typeof element.innerText === 'string') {
    return normalizeText(element.innerText || element.textContent);
  }

  return normalizeText(element.textContent);
}

function getElementLabel(element: Element | null | undefined): string {
  if (!(element instanceof HTMLElement)) {
    return '';
  }

  const value =
    element instanceof HTMLInputElement || element instanceof HTMLButtonElement
      ? element.value
      : '';

  return normalizeText(
    [
      element.innerText,
      element.textContent,
      element.getAttribute('aria-label'),
      element.getAttribute('title'),
      value,
    ]
      .filter(Boolean)
      .join(' ')
  );
}

function isVisible(element: Element | null | undefined): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (!element.isConnected || element.hidden) {
    return false;
  }

  let current: HTMLElement | null = element;
  while (current) {
    const style = window.getComputedStyle(current);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0'
    ) {
      return false;
    }
    current = current.parentElement;
  }

  return true;
}

function isInteractable(element: Element | null | undefined): boolean {
  if (!(element instanceof HTMLElement) || !isVisible(element)) {
    return false;
  }

  if (
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true'
  ) {
    return false;
  }

  return true;
}

function scrollIntoViewIfNeeded(element: Element): void {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const rect = element.getBoundingClientRect();
  const outsideViewport =
    rect.top < 0 ||
    rect.bottom > window.innerHeight ||
    rect.left < 0 ||
    rect.right > window.innerWidth;

  if (outsideViewport || rect.width === 0 || rect.height === 0) {
    element.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'auto',
    });
  }
}

function hashString(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return `coupon-${(hash >>> 0).toString(16)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function randomBetween(min: number, max: number): number {
  if (max <= min) {
    return min;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function waitForDomQuiet(
  timeoutMs: number = DOM_STABILITY.domWaitTimeoutMs,
  quietWindowMs: number = DOM_STABILITY.domQuietWindowMs
): Promise<void> {
  const roots = collectSearchRoots(document);
  const observers: MutationObserver[] = [];
  let lastMutation = Date.now();

  for (const root of roots) {
    const observer = new MutationObserver(() => {
      lastMutation = Date.now();
    });

    observer.observe(root, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    observers.push(observer);
  }

  const deadline = Date.now() + timeoutMs;

  try {
    while (Date.now() < deadline) {
      if (Date.now() - lastMutation >= quietWindowMs) {
        return;
      }
      await sleep(50);
    }
  } finally {
    observers.forEach((observer) => observer.disconnect());
  }
}

export class PaybackAdapter {
  constructor(private readonly options: PaybackAdapterOptions = {}) {}

  async detectPageState(): Promise<PageStateResult> {
    await this.waitForStability();

    const url = this.getPageUrl();
    const surfaceText = this.getSurfaceText();

    if (!this.isPaybackUrl(url)) {
      return this.buildPageState({
        state: 'unsupported-page',
        message: 'Bitte eine PAYBACK-Seite öffnen.',
        blockers: ['unsupported-host'],
      });
    }

    const blockers = this.detectLoginBlockers(url, surfaceText);
    if (blockers.length > 0) {
      return this.buildPageState({
        state: 'login-required',
        message:
          'Bitte zuerst bei PAYBACK einloggen und Sicherheitsabfragen manuell abschließen.',
        blockers,
      });
    }

    const candidates = await this.collectCandidates();
    const activatableCount = candidates.filter(
      (candidate) => candidate.status === 'activatable'
    ).length;

    if (candidates.length > 0) {
      return this.buildPageState({
        state: 'ready',
        message:
          activatableCount > 0
            ? `${activatableCount} aktivierbare Coupons erkannt.`
            : 'Coupon-Seite erkannt. Keine aktivierbaren Coupons sichtbar.',
        candidateCount: candidates.length,
        activatableCount,
      });
    }

    if (this.isCouponSurface(url, surfaceText)) {
      return this.buildPageState({
        state: 'unsupported-layout',
        message:
          'Coupon-Seite erkannt, aber das aktuelle Layout konnte nicht sicher gelesen werden.',
        blockers: ['layout'],
      });
    }

    return this.buildPageState({
      state: 'unsupported-page',
      message: 'Bitte die PAYBACK Coupon-Seite öffnen.',
    });
  }

  async collectCandidates(): Promise<ResolvedCouponCandidate[]> {
    const candidates = [
      ...this.collectHeuristicCandidates(),
      ...this.collectLegacyShadowCandidates(),
    ];
    const merged = new Map<string, ResolvedCouponCandidate>();

    for (const candidate of candidates) {
      const existing = merged.get(candidate.id);
      if (!existing || this.shouldReplaceCandidate(existing, candidate)) {
        merged.set(candidate.id, candidate);
      }
    }

    const sortedCandidates = Array.from(merged.values())
      .sort((left, right) => {
        const leftPriority = this.statusPriority(left.status);
        const rightPriority = this.statusPriority(right.status);

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return right.confidence - left.confidence;
      });

    if (sortedCandidates.length > RUN_LIMITS.maxCandidatesPerScan) {
      logger.warn('Candidate scan hit safety cap', {
        collected: sortedCandidates.length,
        cappedAt: RUN_LIMITS.maxCandidatesPerScan,
      });
    }

    const resolved = sortedCandidates.slice(0, RUN_LIMITS.maxCandidatesPerScan);

    logger.debug('Collected candidates', {
      total: resolved.length,
      activatable: resolved.filter((candidate) => candidate.status === 'activatable')
        .length,
    });

    return resolved;
  }

  async activateCandidate(
    candidate: ResolvedCouponCandidate,
    mode: ActivationMode
  ): Promise<ActivationAttemptResult> {
    if (candidate.status !== 'activatable') {
      return {
        candidateId: candidate.id,
        outcome:
          candidate.status === 'already-active'
            ? 'already-active'
            : 'unavailable',
        message: 'Coupon ist nicht aktivierbar.',
      };
    }

    const currentCandidate = await this.findCandidateById(candidate.id);
    const actionElement = currentCandidate?.actionElement ?? candidate.actionElement;

    if (!actionElement || !isInteractable(actionElement)) {
      return {
        candidateId: candidate.id,
        outcome: 'unavailable',
        message: 'Aktivierungsbutton ist nicht mehr bedienbar.',
      };
    }

    scrollIntoViewIfNeeded(actionElement);
    await this.waitForDelay(mode, 'before');
    actionElement.click();
    await this.waitForDelay(mode, 'after');

    const refreshedCandidate = await this.waitForCandidateResolution(
      candidate.id,
      candidate.status,
      mode
    );

    if (!refreshedCandidate) {
      return {
        candidateId: candidate.id,
        outcome: 'activated',
        message:
          'Coupon wurde nach dem Klick neu gerendert und nicht mehr als aktivierbar erkannt.',
      };
    }

    if (refreshedCandidate.status === 'activatable') {
      return {
        candidateId: candidate.id,
        outcome: 'failed',
        message: 'Der Coupon blieb nach dem Klick aktivierbar.',
      };
    }

    return {
      candidateId: candidate.id,
      outcome:
        refreshedCandidate.status === 'already-active'
          ? 'activated'
          : 'unavailable',
      message:
        refreshedCandidate.status === 'already-active'
          ? 'Coupon erfolgreich aktiviert.'
          : 'Coupon wurde als nicht verfügbar erkannt.',
    };
  }

  async waitForStability(): Promise<void> {
    await waitForDomQuiet();
  }

  async revealMoreCandidates(mode: ActivationMode): Promise<boolean> {
    const before = window.scrollY;
    const maxScrollTop =
      Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      ) - window.innerHeight;

    if (maxScrollTop <= before + 4) {
      return false;
    }

    const target = before + Math.max(window.innerHeight * 0.8, 700);

    window.scrollTo({
      top: Math.min(target, maxScrollTop),
      behavior: 'auto',
    });

    await sleep(MODE_TIMINGS[mode].scrollPauseMs);
    await this.waitForStability();

    return window.scrollY > before;
  }

  private buildPageState(input: {
    state: PageStateResult['state'];
    message: string;
    blockers?: PageBlocker[];
    candidateCount?: number;
    activatableCount?: number;
  }): PageStateResult {
    return {
      state: input.state,
      message: input.message,
      candidateCount: input.candidateCount ?? 0,
      activatableCount: input.activatableCount ?? 0,
      blockers: input.blockers ?? [],
      detectedAt: Date.now(),
    };
  }

  private collectHeuristicCandidates(): ResolvedCouponCandidate[] {
    const actionCandidates = queryAllDeep<HTMLElement>(
      ACTION_SELECTOR,
      this.getSearchRoot()
    )
      .map((actionElement) => this.buildCandidateFromAction(actionElement))
      .filter(
        (candidate): candidate is ResolvedCouponCandidate => candidate !== null
      );

    const passiveCandidates = this.collectPassiveCandidates(actionCandidates);
    return [...actionCandidates, ...passiveCandidates];
  }

  private collectPassiveCandidates(
    actionCandidates: ResolvedCouponCandidate[]
  ): ResolvedCouponCandidate[] {
    const knownIds = new Set(actionCandidates.map((candidate) => candidate.id));

    return queryAllDeep<HTMLElement>(CONTAINER_SELECTOR, this.getSearchRoot())
      .filter((container) => this.isCouponLikeContainer(container))
      .filter(
        (container) =>
          !actionCandidates.some(
            (candidate) =>
              candidate.container !== container && container.contains(candidate.container)
          )
      )
      .map((container) => this.buildPassiveCandidate(container))
      .filter(
        (candidate): candidate is ResolvedCouponCandidate => candidate !== null
      )
      .filter((candidate) => !knownIds.has(candidate.id));
  }

  private collectLegacyShadowCandidates(): ResolvedCouponCandidate[] {
    const searchRoot = this.getSearchRoot();
    const couponCenter =
      'querySelector' in searchRoot
        ? searchRoot.querySelector('pb-coupon-center')
        : null;

    if (!couponCenter?.shadowRoot) {
      return [];
    }

    const legacyCandidates: ResolvedCouponCandidate[] = [];

    for (const [index, coupon] of Array.from(
      couponCenter.shadowRoot.querySelectorAll<HTMLElement>('pbc-coupon')
    ).entries()) {
      const couponShadow = coupon.shadowRoot;
      if (!couponShadow) {
        continue;
      }

      const cta = couponShadow.querySelector('pbc-coupon-call-to-action');
      const actionElement =
        (cta?.shadowRoot?.querySelector('button') as HTMLElement | null) ?? null;
      const containerText = normalizeText(couponShadow.textContent);

      legacyCandidates.push({
        id: this.getCandidateId(coupon, `legacy-${index}`),
        label: this.getCandidateLabel(coupon),
        status: this.classifyCandidate({
          actionElement,
          actionLabel: getElementLabel(actionElement),
          containerText,
        }),
        confidence: 10,
        container: coupon,
        actionElement,
        source: 'legacy-shadow',
      });
    }

    return legacyCandidates;
  }

  private buildCandidateFromAction(
    actionElement: HTMLElement
  ): ResolvedCouponCandidate | null {
    if (!isVisible(actionElement)) {
      return null;
    }

    const container = this.resolveCouponContainer(actionElement);
    if (!container) {
      return null;
    }

    const actionLabel = getElementLabel(actionElement);
    const containerText = getTextContent(container);

    if (!this.isRelevantAction(actionElement, actionLabel, containerText)) {
      return null;
    }

    return {
      id: this.getCandidateId(container),
      label: this.getCandidateLabel(container),
      status: this.classifyCandidate({
        actionElement,
        actionLabel,
        containerText,
      }),
      confidence: this.getContainerScore(container) + 2,
      container,
      actionElement,
      source: 'heuristic',
    };
  }

  private buildPassiveCandidate(
    container: HTMLElement
  ): ResolvedCouponCandidate | null {
    const containerText = getTextContent(container);
    const status = this.classifyCandidate({
      actionElement: null,
      actionLabel: '',
      containerText,
    });

    if (status === 'activatable') {
      return null;
    }

    return {
      id: this.getCandidateId(container),
      label: this.getCandidateLabel(container),
      status,
      confidence: this.getContainerScore(container),
      container,
      actionElement: null,
      source: 'heuristic',
    };
  }

  private classifyCandidate(input: {
    actionElement: HTMLElement | null;
    actionLabel: string;
    containerText: string;
  }): CouponCandidateStatus {
    const { actionElement, actionLabel, containerText } = input;
    const combinedText = `${actionLabel} ${containerText}`;

    if (
      matchesAny(
        combinedText,
        ALREADY_ACTIVE_PATTERNS.concat(REDEEM_PATTERNS)
      ) &&
      !matchesAny(actionLabel, ACTIVATE_PATTERNS)
    ) {
      return 'already-active';
    }

    if (matchesAny(combinedText, UNAVAILABLE_PATTERNS)) {
      return 'unavailable';
    }

    if (actionElement && !isInteractable(actionElement)) {
      return 'unavailable';
    }

    if (matchesAny(actionLabel, ACTIVATE_PATTERNS)) {
      return 'activatable';
    }

    return matchesAny(
      containerText,
      ALREADY_ACTIVE_PATTERNS.concat(REDEEM_PATTERNS)
    )
      ? 'already-active'
      : 'unavailable';
  }

  private isRelevantAction(
    actionElement: HTMLElement,
    actionLabel: string,
    containerText: string
  ): boolean {
    if (
      matchesAny(
        actionLabel,
        ACTIVATE_PATTERNS.concat(ALREADY_ACTIVE_PATTERNS)
          .concat(REDEEM_PATTERNS)
          .concat(UNAVAILABLE_PATTERNS)
      )
    ) {
      return true;
    }

    return (
      this.isCouponLikeContainer(actionElement) || this.isCouponText(containerText)
    );
  }

  private isCouponLikeContainer(element: HTMLElement): boolean {
    return this.getContainerScore(element) >= 3;
  }

  private getContainerScore(element: HTMLElement): number {
    const descriptor = normalizeText(
      [
        element.tagName,
        element.className,
        element.id,
        element.getAttribute('data-testid'),
        element.getAttribute('data-qa'),
      ]
        .filter(Boolean)
        .join(' ')
    );

    const text = getTextContent(element);
    let score = 0;

    if (matchesAny(descriptor, COUPON_HINT_PATTERNS)) {
      score += 3;
    }

    if (matchesAny(text, COUPON_SURFACE_PATTERNS)) {
      score += 2;
    }

    if (
      matchesAny(
        text,
        ACTIVATE_PATTERNS.concat(ALREADY_ACTIVE_PATTERNS).concat(REDEEM_PATTERNS)
      )
    ) {
      score += 2;
    }

    if (matchesAny(text, UNAVAILABLE_PATTERNS)) {
      score += 1;
    }

    if (text.length >= 20 && text.length <= 1200) {
      score += 1;
    }

    return score;
  }

  private resolveCouponContainer(element: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = element;
    let fallback: HTMLElement | null = null;

    while (current && current !== document.body) {
      if (
        current.matches(
          '[data-testid*="coupon" i], [data-qa*="coupon" i], [class*="coupon" i], [id*="coupon" i]'
        )
      ) {
        return current;
      }

      if (
        !fallback &&
        current.matches('article, [role="article"], [role="listitem"], li, section')
      ) {
        fallback = current;
      }

      if (this.getContainerScore(current) >= 4) {
        return current;
      }

      current = current.parentElement;
    }

    return fallback;
  }

  private getCandidateId(
    container: HTMLElement,
    fallbackLabel?: string
  ): string {
    const explicitId =
      container.getAttribute('data-testid') ||
      container.getAttribute('data-qa') ||
      container.id;

    if (explicitId) {
      return hashString(explicitId);
    }

    const title = this.getCandidateLabel(container);
    const containerText = getTextContent(container);
    const mediaFingerprint = normalizeText(
      Array.from(container.querySelectorAll('img'))
        .map((image) => image.getAttribute('src') || image.getAttribute('alt') || '')
        .filter(Boolean)
        .join(' ')
    );
    const dateFingerprint = normalizeText(
      (containerText.match(/\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/g) || []).join(' ')
    );
    const pointsFingerprint = normalizeText(
      (
        containerText.match(/\b\d+\s*(?:fach|xfach|°p|punkte?)\b/gi) || []
      ).join(' ')
    );
    const fingerprint = normalizeText(
      `${title} ${mediaFingerprint} ${pointsFingerprint} ${dateFingerprint} ${
        fallbackLabel ?? ''
      }`
    );

    return hashString(fingerprint);
  }

  private getCandidateLabel(container: HTMLElement): string {
    const heading = container.querySelector<HTMLElement>(
      'h1, h2, h3, h4, strong, [data-testid*="title" i]'
    );
    const headingText = normalizeText(heading?.textContent ?? '');

    if (headingText) {
      return truncateText(headingText, 80);
    }

    return truncateText(getTextContent(container), 80);
  }

  private shouldReplaceCandidate(
    existing: ResolvedCouponCandidate,
    candidate: ResolvedCouponCandidate
  ): boolean {
    if (existing.status === candidate.status) {
      return candidate.confidence > existing.confidence;
    }

    return this.statusPriority(candidate.status) < this.statusPriority(existing.status);
  }

  private statusPriority(status: CouponCandidateStatus): number {
    return status === 'activatable' ? 0 : status === 'already-active' ? 1 : 2;
  }

  private async findCandidateById(
    candidateId: string
  ): Promise<ResolvedCouponCandidate | null> {
    return (
      (await this.collectCandidates()).find((candidate) => candidate.id === candidateId) ??
      null
    );
  }

  private async waitForCandidateResolution(
    candidateId: string,
    previousStatus: CouponCandidateStatus,
    mode: ActivationMode
  ): Promise<ResolvedCouponCandidate | null> {
    const timing = MODE_TIMINGS[mode];
    const deadline = Date.now() + timing.verificationTimeoutMs;

    while (Date.now() < deadline) {
      const refreshedCandidate = await this.findCandidateById(candidateId);

      if (!refreshedCandidate) {
        return null;
      }

      if (refreshedCandidate.status !== previousStatus) {
        return refreshedCandidate;
      }

      await sleep(timing.verificationPollMs);
    }

    await this.waitForStability();
    return await this.findCandidateById(candidateId);
  }

  private getPageUrl(): URL {
    const pageUrl = this.options.pageUrl;
    const resolved = typeof pageUrl === 'function' ? pageUrl() : pageUrl;

    if (resolved instanceof URL) {
      return resolved;
    }

    return new URL(resolved ?? window.location.href);
  }

  private getSearchRoot(): SearchRoot {
    return this.options.root ?? document;
  }

  private getSurfaceText(): string {
    const root = this.getSearchRoot();

    if (root instanceof Document) {
      return getTextContent(root.body);
    }

    return normalizeText(root.textContent);
  }

  private detectLoginBlockers(url: URL, text: string): PageBlocker[] {
    const blockers = new Set<PageBlocker>();

    if (url.pathname.includes('/login') || matchesAny(text, LOGIN_PATTERNS)) {
      blockers.add('login');
    }

    if (matchesAny(text, CAPTCHA_PATTERNS)) {
      blockers.add('captcha');
    }

    return [...blockers];
  }

  private isPaybackUrl(url: URL): boolean {
    return url.hostname === 'www.payback.de' || url.hostname.endsWith('.payback.de');
  }

  private isCouponSurface(url: URL, text: string): boolean {
    return url.pathname.includes('/coupon') || matchesAny(text, COUPON_SURFACE_PATTERNS);
  }

  private isCouponText(text: string): boolean {
    return matchesAny(text, COUPON_SURFACE_PATTERNS);
  }

  private async waitForDelay(
    mode: ActivationMode,
    phase: 'before' | 'after'
  ): Promise<void> {
    const timing = MODE_TIMINGS[mode];
    const min =
      phase === 'before' ? timing.beforeClickMinMs : timing.afterClickMinMs;
    const max =
      phase === 'before' ? timing.beforeClickMaxMs : timing.afterClickMaxMs;

    if (max <= 0) {
      return;
    }

    await sleep(randomBetween(min, max));
  }
}
