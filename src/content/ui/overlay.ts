import {
  ERROR_OVERLAY_REMOVAL_MS,
  FINAL_OVERLAY_REMOVAL_MS,
} from '../../shared/config/timing';
import type { ActivationStatus } from '../../shared/contracts/models';

const OVERLAY_ROOT_ID = 'autocoupon-overlay-root';

const styles = `
  :host {
    all: initial;
  }

  .panel {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    width: min(360px, calc(100vw - 24px));
    color: #f4f8fc;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }

  .card {
    border-radius: 20px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background:
      radial-gradient(circle at top right, rgba(55, 120, 255, 0.22), transparent 38%),
      linear-gradient(180deg, rgba(8, 15, 30, 0.96), rgba(10, 18, 34, 0.96));
    box-shadow: 0 18px 42px rgba(2, 6, 23, 0.4);
    backdrop-filter: blur(14px);
    overflow: hidden;
  }

  .content {
    display: grid;
    gap: 14px;
    padding: 18px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }

  .subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: #9fb3ca;
  }

  .badge {
    align-self: start;
    border-radius: 999px;
    border: 1px solid rgba(96, 165, 250, 0.28);
    background: rgba(37, 99, 235, 0.16);
    padding: 6px 10px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #d7e7ff;
  }

  .status {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
  }

  .track {
    height: 8px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.14);
    overflow: hidden;
  }

  .bar {
    height: 100%;
    width: 0%;
    border-radius: 999px;
    background: linear-gradient(90deg, #38bdf8, #2563eb);
    transition: width 160ms ease;
  }

  .bar.success {
    background: linear-gradient(90deg, #22c55e, #16a34a);
  }

  .bar.error {
    background: linear-gradient(90deg, #fb923c, #ef4444);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .stat {
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(15, 23, 42, 0.56);
    padding: 10px;
  }

  .label {
    display: block;
    margin-bottom: 6px;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #89a0ba;
  }

  .value {
    font-size: 18px;
    font-weight: 700;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .meta {
    font-size: 12px;
    color: #94a8bf;
  }

  .cancel {
    appearance: none;
    border: 1px solid rgba(248, 113, 113, 0.32);
    background: rgba(127, 29, 29, 0.28);
    color: #fee2e2;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
`;

export class Overlay {
  private host: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private removalTimerId: number | null = null;
  private onCancel: (() => void) | null = null;

  setEnabled(enabled: boolean, onCancel: () => void): void {
    this.onCancel = onCancel;

    if (!enabled) {
      this.destroy();
      return;
    }

    this.ensureMounted();
  }

  render(status: ActivationStatus): void {
    this.ensureMounted();
    this.clearRemovalTimer();

    if (!this.shadowRoot) {
      return;
    }

    const skipped =
      status.summary.alreadyActive + status.summary.unavailable;

    this.setText('status-text', status.message);
    this.setText(
      'mode-badge',
      status.mode === 'turbo-extreme'
        ? 'Extreme'
        : status.mode === 'turbo'
          ? 'Turbo'
          : status.phase === 'completed'
            ? 'Fertig'
            : status.phase === 'error'
              ? 'Fehler'
              : 'Normal'
    );
    this.setText('processed', String(status.summary.processed));
    this.setText('activated', String(status.summary.activated));
    this.setText('skipped', String(skipped));
    this.setText('failed', String(status.summary.failed));
    this.setText(
      'meta',
      status.summary.totalSeen > 0
        ? `${status.summary.processed}/${status.summary.totalSeen} gescannte Coupons`
        : 'Scanne Coupon-Seite…'
    );

    const cancelButton = this.getElement('cancel-button') as HTMLButtonElement;
    cancelButton.hidden = !status.canCancel;

    const bar = this.getElement('progress-bar');
    bar.className = 'bar';
    if (status.phase === 'completed') {
      bar.classList.add('success');
    }
    if (status.phase === 'error' || status.phase === 'cancelled') {
      bar.classList.add('error');
    }
    bar.setAttribute('style', `width: ${status.progressPercent}%`);

    if (status.phase === 'completed') {
      this.scheduleDestroy(FINAL_OVERLAY_REMOVAL_MS);
    }

    if (status.phase === 'error' || status.phase === 'cancelled') {
      this.scheduleDestroy(ERROR_OVERLAY_REMOVAL_MS);
    }
  }

  destroy(): void {
    this.clearRemovalTimer();
    this.host?.remove();
    this.host = null;
    this.shadowRoot = null;
  }

  private ensureMounted(): void {
    this.removeDuplicateHosts();

    if (this.host?.isConnected) {
      return;
    }

    this.host = document.createElement('div');
    this.host.id = OVERLAY_ROOT_ID;
    this.shadowRoot = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadowRoot.appendChild(style);

    const panel = this.createElement('div', { className: 'panel' });
    const card = this.createElement('div', { className: 'card' });
    const content = this.createElement('div', { className: 'content' });
    const header = this.createElement('div', { className: 'header' });
    const heading = this.createElement('div');
    const title = this.createElement('h2', {
      className: 'title',
      textContent: 'AutoCoupon',
    });
    const subtitle = this.createElement('p', {
      className: 'subtitle',
      textContent: 'Lokale PAYBACK-Hilfe im Browser-Kontext.',
    });
    const badge = this.createElement('span', {
      className: 'badge',
      id: 'mode-badge',
      textContent: 'Bereit',
    });
    const status = this.createElement('div', {
      className: 'status',
      id: 'status-text',
      textContent: 'Initialisiere…',
    });
    const track = this.createElement('div', { className: 'track' });
    const progressBar = this.createElement('div', {
      className: 'bar',
      id: 'progress-bar',
    });
    const stats = this.createElement('div', { className: 'stats' });
    const footer = this.createElement('div', { className: 'footer' });
    const meta = this.createElement('span', {
      className: 'meta',
      id: 'meta',
      textContent: 'Warte auf Status…',
    });
    const cancelButton = this.createElement('button', {
      className: 'cancel',
      id: 'cancel-button',
      textContent: 'Abbrechen',
    }) as HTMLButtonElement;
    cancelButton.hidden = true;

    heading.append(title, subtitle);
    header.append(heading, badge);
    track.appendChild(progressBar);
    stats.append(
      this.createStat('Bearbeitet', 'processed'),
      this.createStat('Aktiviert', 'activated'),
      this.createStat('Übersprungen', 'skipped'),
      this.createStat('Fehler', 'failed')
    );
    footer.append(meta, cancelButton);
    content.append(header, status, track, stats, footer);
    card.appendChild(content);
    panel.appendChild(card);
    this.shadowRoot.appendChild(panel);

    document.documentElement.appendChild(this.host);

    cancelButton.onclick = () => {
      this.onCancel?.();
    };
  }

  private createStat(label: string, valueId: string): HTMLDivElement {
    const stat = this.createElement('div', { className: 'stat' });
    const statLabel = this.createElement('span', {
      className: 'label',
      textContent: label,
    });
    const value = this.createElement('span', {
      className: 'value',
      id: valueId,
      textContent: '0',
    });

    stat.append(statLabel, value);
    return stat;
  }

  private createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options: {
      className?: string;
      id?: string;
      textContent?: string;
    } = {}
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);

    if (options.className) {
      element.className = options.className;
    }

    if (options.id) {
      element.id = options.id;
    }

    if (options.textContent !== undefined) {
      element.textContent = options.textContent;
    }

    return element;
  }

  private removeDuplicateHosts(): void {
    const existingHosts = document.querySelectorAll(`#${OVERLAY_ROOT_ID}`);
    for (const existingHost of existingHosts) {
      if (existingHost !== this.host) {
        existingHost.remove();
      }
    }
  }

  private setText(id: string, value: string): void {
    this.getElement(id).textContent = value;
  }

  private getElement(id: string): HTMLElement {
    if (!this.shadowRoot) {
      throw new Error('Overlay is not mounted');
    }

    const element = this.shadowRoot.getElementById(id);
    if (!element) {
      throw new Error(`Overlay element not found: ${id}`);
    }

    return element;
  }

  private scheduleDestroy(delayMs: number): void {
    this.removalTimerId = window.setTimeout(() => {
      this.destroy();
    }, delayMs);
  }

  private clearRemovalTimer(): void {
    if (this.removalTimerId !== null) {
      window.clearTimeout(this.removalTimerId);
      this.removalTimerId = null;
    }
  }
}
