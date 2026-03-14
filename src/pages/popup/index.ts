import './styles.css';
import '../shared/branding.css';

import {
  getManifestVersion,
  openOptionsPage,
  sendRuntimeMessage,
} from '../../platform/browser/browser';
import {
  BRAND_NAME,
  POPUP_BRAND_EYEBROW,
  POPUP_BRAND_SUBTITLE,
} from '../../shared/config/branding';
import { POPUP_POLL_INTERVAL_MS } from '../../shared/config/timing';
import {
  POPUP_MESSAGE_TYPE,
  type BackgroundUiResponse,
  type PopupRequest,
} from '../../shared/contracts/messages';
import type {
  ActivationMode,
  ActiveTabContext,
  Settings,
  UiNotification,
} from '../../shared/contracts/models';
import { applyBrandHeader, renderBrandingInfo } from '../shared/branding';
import { getPopupDemoResponse } from '../shared/demo-state';

interface PopupElements {
  brandLogo: HTMLImageElement;
  brandEyebrow: HTMLElement;
  brandTitle: HTMLElement;
  brandSubtitle: HTMLElement;
  brandingInfo: HTMLElement;
  versionBadge: HTMLElement;
  versionText: HTMLElement;
  stateDot: HTMLElement;
  stateHeadline: HTMLElement;
  stateCopy: HTMLElement;
  notification: HTMLElement;
  startButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  openButton: HTMLButtonElement;
  reloadButton: HTMLButtonElement;
  optionsButton: HTMLButtonElement;
  processedValue: HTMLElement;
  activatedValue: HTMLElement;
  skippedValue: HTMLElement;
  failedValue: HTMLElement;
  modeInputs: NodeListOf<HTMLInputElement>;
}

const elements = getElements();
let pollTimerId: number | null = null;
let latestSettings: Settings | null = null;

void init();

async function init(): Promise<void> {
  document.title = BRAND_NAME;
  applyBrandHeader(
    {
      logo: elements.brandLogo,
      eyebrow: elements.brandEyebrow,
      title: elements.brandTitle,
      subtitle: elements.brandSubtitle,
    },
    {
      eyebrow: POPUP_BRAND_EYEBROW,
      subtitle: POPUP_BRAND_SUBTITLE,
    }
  );
  renderBrandingInfo(elements.brandingInfo, 'compact');

  const manifestVersion =
    getManifestVersion('Tutorial');
  elements.versionBadge.textContent = `v${manifestVersion}`;
  elements.versionText.textContent = `v${manifestVersion}`;

  elements.startButton.addEventListener('click', () => {
    void request({
      type: POPUP_MESSAGE_TYPE.activationStart,
      payload: {
        mode: getSelectedMode(),
      },
    });
  });

  elements.cancelButton.addEventListener('click', () => {
    void request({
      type: POPUP_MESSAGE_TYPE.activationCancel,
    });
  });

  elements.openButton.addEventListener('click', () => {
    void request({
      type: POPUP_MESSAGE_TYPE.pageOpenCoupons,
    });
  });

  elements.reloadButton.addEventListener('click', () => {
    void request({
      type: POPUP_MESSAGE_TYPE.pageReloadCoupons,
    });
  });

  elements.optionsButton.addEventListener('click', () => {
    void openOptionsPage();
  });

  elements.modeInputs.forEach((input) => {
    input.addEventListener('change', () => {
      void request({
        type: POPUP_MESSAGE_TYPE.settingsUpdate,
        payload: {
          patch: {
            preferredMode: getSelectedMode(),
          },
        },
      });
    });
  });

  const response = await request({
    type: POPUP_MESSAGE_TYPE.uiBootstrap,
  });

  renderResponse(response);
}

async function request(message: PopupRequest): Promise<BackgroundUiResponse> {
  const demoResponse = getPopupDemoResponse(message);
  if (demoResponse) {
    renderResponse(demoResponse);
    return demoResponse;
  }

  const response = await sendRuntimeMessage<PopupRequest, BackgroundUiResponse>(
    message
  );
  renderResponse(response);
  return response;
}

function renderResponse(response: BackgroundUiResponse): void {
  latestSettings = response.settings ?? latestSettings;
  if (latestSettings) {
    setSelectedMode(latestSettings.preferredMode);
  }

  renderContext(response.context ?? null);
  renderNotification(response.notification ?? null);

  if (shouldPoll(response.context ?? null)) {
    startPolling();
  } else {
    stopPolling();
  }
}

function renderContext(context: ActiveTabContext | null): void {
  const status = context?.status ?? null;
  const summary = status?.summary ?? context?.lastSummary ?? null;
  const pageState = context?.pageState ?? 'unsupported-page';

  renderState(pageState, context);
  renderSummary(summary);

  const canStart =
    Boolean(context?.isPaybackHost) &&
    pageState === 'ready' &&
    !status?.canCancel;
  const canCancel = Boolean(status?.canCancel);

  elements.startButton.disabled = !canStart;
  elements.cancelButton.hidden = !canCancel;
  elements.startButton.textContent = canCancel
    ? 'Aktivierung läuft'
    : 'Coupons aktivieren';
  elements.reloadButton.disabled = !context?.isPaybackHost;
}

function renderState(
  pageState: ActiveTabContext['pageState'],
  context: ActiveTabContext | null
): void {
  if (context?.isPaybackHost && !context.contentReady && !context.status?.canCancel) {
    elements.stateHeadline.textContent = 'Coupon-Seite wird geladen';
    elements.stateCopy.textContent =
      'PAYBACK erkannt. Die Coupon-Seite wird geöffnet und geprüft.';
    elements.stateDot.className = 'state-dot warning';
    return;
  }

  let headline = 'Coupon-Seite bereit';
  const copy =
    context?.status?.message ??
    (context?.isPaybackHost
      ? 'PAYBACK erkannt. Seite wird geprüft.'
      : 'Öffne die PAYBACK-Coupon-Seite und logge dich ein.');
  let stateKind: 'ready' | 'warning' | 'error' = 'ready';

  switch (pageState) {
    case 'busy':
      headline = 'Aktivierung läuft';
      stateKind = 'warning';
      break;
    case 'login-required':
      headline = 'Login erforderlich';
      stateKind = 'warning';
      break;
    case 'unsupported-layout':
      headline = 'Layout derzeit nicht sicher lesbar';
      stateKind = 'error';
      break;
    case 'unsupported-page':
      headline = context?.isPaybackHost ? 'Nicht auf Coupon-Seite' : 'Falsche Seite';
      stateKind = 'error';
      break;
    default:
      headline = 'Coupon-Seite bereit';
      stateKind = 'ready';
      break;
  }

  elements.stateHeadline.textContent = headline;
  elements.stateCopy.textContent = copy;
  elements.stateDot.className = 'state-dot';
  if (stateKind !== 'ready') {
    elements.stateDot.classList.add(stateKind);
  }
}

function renderSummary(
  summary:
    | {
        processed: number;
        activated: number;
        alreadyActive: number;
        unavailable: number;
        failed: number;
      }
    | null
): void {
  const skipped = summary ? summary.alreadyActive + summary.unavailable : 0;
  elements.processedValue.textContent = String(summary?.processed ?? 0);
  elements.activatedValue.textContent = String(summary?.activated ?? 0);
  elements.skippedValue.textContent = String(skipped);
  elements.failedValue.textContent = String(summary?.failed ?? 0);
}

function shouldPoll(context: ActiveTabContext | null): boolean {
  if (!context) {
    return false;
  }

  if (context.status?.canCancel) {
    return true;
  }

  return context.isPaybackHost && !context.contentReady;
}

function renderNotification(notification: UiNotification | null): void {
  if (!notification) {
    elements.notification.hidden = true;
    elements.notification.className = 'notice';
    elements.notification.textContent = '';
    return;
  }

  elements.notification.hidden = false;
  elements.notification.className = `notice ${notification.level}`;
  elements.notification.textContent = `${notification.title}: ${notification.message}`;
}

function getSelectedMode(): ActivationMode {
  const selected =
    Array.from(elements.modeInputs).find((input) => input.checked)?.value ??
    'normal';

  if (selected === 'turbo') {
    return 'turbo';
  }

  if (selected === 'turbo-extreme') {
    return 'turbo-extreme';
  }

  return 'normal';
}

function setSelectedMode(mode: ActivationMode): void {
  elements.modeInputs.forEach((input) => {
    input.checked = input.value === mode;
  });
}

function startPolling(): void {
  if (pollTimerId !== null) {
    return;
  }

  pollTimerId = window.setInterval(() => {
    void request({
      type: POPUP_MESSAGE_TYPE.contextRefresh,
    });
  }, POPUP_POLL_INTERVAL_MS);
}

function stopPolling(): void {
  if (pollTimerId !== null) {
    window.clearInterval(pollTimerId);
    pollTimerId = null;
  }
}

function getElements(): PopupElements {
  const brandLogo = document.getElementById('brand-logo');
  const brandEyebrow = document.getElementById('brand-eyebrow');
  const brandTitle = document.getElementById('brand-title');
  const brandSubtitle = document.getElementById('brand-subtitle');
  const brandingInfo = document.getElementById('branding-info');
  const versionBadge = document.getElementById('version-badge');
  const versionText = document.getElementById('version-text');
  const stateDot = document.getElementById('state-dot');
  const stateHeadline = document.getElementById('state-headline');
  const stateCopy = document.getElementById('state-copy');
  const notification = document.getElementById('notification');
  const startButton = document.getElementById('start-button');
  const cancelButton = document.getElementById('cancel-button');
  const openButton = document.getElementById('open-button');
  const reloadButton = document.getElementById('reload-button');
  const optionsButton = document.getElementById('options-button');
  const processedValue = document.getElementById('processed-value');
  const activatedValue = document.getElementById('activated-value');
  const skippedValue = document.getElementById('skipped-value');
  const failedValue = document.getElementById('failed-value');
  const modeInputs = document.querySelectorAll<HTMLInputElement>('input[name="mode"]');

  if (
    !(brandLogo instanceof HTMLImageElement) ||
    !brandEyebrow ||
    !brandTitle ||
    !brandSubtitle ||
    !brandingInfo ||
    !versionBadge ||
    !versionText ||
    !stateDot ||
    !stateHeadline ||
    !stateCopy ||
    !notification ||
    !startButton ||
    !cancelButton ||
    !openButton ||
    !reloadButton ||
    !optionsButton ||
    !processedValue ||
    !activatedValue ||
    !skippedValue ||
    !failedValue
  ) {
    throw new Error('Popup elements are missing');
  }

  return {
    brandLogo,
    brandEyebrow,
    brandTitle,
    brandSubtitle,
    brandingInfo,
    versionBadge,
    versionText,
    stateDot,
    stateHeadline,
    stateCopy,
    notification,
    startButton: startButton as HTMLButtonElement,
    cancelButton: cancelButton as HTMLButtonElement,
    openButton: openButton as HTMLButtonElement,
    reloadButton: reloadButton as HTMLButtonElement,
    optionsButton: optionsButton as HTMLButtonElement,
    processedValue,
    activatedValue,
    skippedValue,
    failedValue,
    modeInputs,
  };
}
