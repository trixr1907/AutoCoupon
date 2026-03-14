import './styles.css';
import '../shared/branding.css';

import {
  getManifestVersion,
  sendRuntimeMessage,
} from '../../platform/browser/browser';
import {
  BRAND_NAME,
  OPTIONS_BRAND_EYEBROW,
  OPTIONS_BRAND_SUBTITLE,
} from '../../shared/config/branding';
import {
  POPUP_MESSAGE_TYPE,
  type BackgroundUiResponse,
  type PopupRequest,
} from '../../shared/contracts/messages';
import type { ActivationMode, Settings } from '../../shared/contracts/models';
import { applyBrandHeader, renderBrandingInfo } from '../shared/branding';
import { getOptionsDemoSettings } from '../shared/demo-state';

interface OptionElements {
  brandLogo: HTMLImageElement;
  brandEyebrow: HTMLElement;
  brandTitle: HTMLElement;
  brandSubtitle: HTMLElement;
  brandingInfo: HTMLElement;
  versionBadge: HTMLElement;
  firstRunCard: HTMLElement;
  dismissFirstRunButton: HTMLButtonElement;
  overlayToggle: HTMLInputElement;
  debugToggle: HTMLInputElement;
  modeInputs: NodeListOf<HTMLInputElement>;
}

const elements = getElements();
let currentSettings: Settings | null = null;

void init();

async function init(): Promise<void> {
  document.title = `${BRAND_NAME} Optionen`;
  applyBrandHeader(
    {
      logo: elements.brandLogo,
      eyebrow: elements.brandEyebrow,
      title: elements.brandTitle,
      subtitle: elements.brandSubtitle,
    },
    {
      eyebrow: OPTIONS_BRAND_EYEBROW,
      subtitle: OPTIONS_BRAND_SUBTITLE,
    }
  );
  renderBrandingInfo(elements.brandingInfo, 'full');

  const manifestVersion =
    getManifestVersion('Tutorial');
  elements.versionBadge.textContent = `v${manifestVersion}`;

  elements.dismissFirstRunButton.addEventListener('click', () => {
    void update({
      firstRunHintDismissed: true,
    });
  });

  elements.overlayToggle.addEventListener('change', () => {
    void update({
      overlayEnabled: elements.overlayToggle.checked,
    });
  });

  elements.debugToggle.addEventListener('change', () => {
    void update({
      debugLoggingEnabled: elements.debugToggle.checked,
    });
  });

  elements.modeInputs.forEach((input) => {
    input.addEventListener('change', () => {
      void update({
        preferredMode: getSelectedMode(),
      });
    });
  });

  const response = await request({
    type: POPUP_MESSAGE_TYPE.settingsGet,
  });

  applySettings(response.settings);
}

async function request(message: PopupRequest): Promise<BackgroundUiResponse> {
  const demoSettings = getOptionsDemoSettings();
  if (demoSettings) {
    return {
      ok: true,
      settings:
        message.type === POPUP_MESSAGE_TYPE.settingsUpdate
          ? {
              ...demoSettings,
              ...message.payload.patch,
            }
          : demoSettings,
    };
  }

  return await sendRuntimeMessage<PopupRequest, BackgroundUiResponse>(message);
}

async function update(patch: Partial<Settings>): Promise<void> {
  const response = await request({
    type: POPUP_MESSAGE_TYPE.settingsUpdate,
    payload: {
      patch,
    },
  });

  applySettings(response.settings);
}

function applySettings(settings: Settings | undefined): void {
  if (!settings) {
    return;
  }

  currentSettings = settings;
  elements.overlayToggle.checked = settings.overlayEnabled;
  elements.debugToggle.checked = settings.debugLoggingEnabled;
  elements.firstRunCard.hidden = settings.firstRunHintDismissed;
  elements.modeInputs.forEach((input) => {
    input.checked = input.value === settings.preferredMode;
  });
}

function getSelectedMode(): ActivationMode {
  const selected =
    Array.from(elements.modeInputs).find((input) => input.checked)?.value ??
    currentSettings?.preferredMode ??
    'normal';

  if (selected === 'turbo') {
    return 'turbo';
  }

  if (selected === 'turbo-extreme') {
    return 'turbo-extreme';
  }

  return 'normal';
}

function getElements(): OptionElements {
  const brandLogo = document.getElementById('brand-logo');
  const brandEyebrow = document.getElementById('brand-eyebrow');
  const brandTitle = document.getElementById('brand-title');
  const brandSubtitle = document.getElementById('brand-subtitle');
  const brandingInfo = document.getElementById('branding-info');
  const versionBadge = document.getElementById('version-badge');
  const firstRunCard = document.getElementById('first-run-card');
  const dismissFirstRunButton = document.getElementById('dismiss-first-run');
  const overlayToggle = document.getElementById('overlay-enabled');
  const debugToggle = document.getElementById('debug-logging-enabled');
  const modeInputs =
    document.querySelectorAll<HTMLInputElement>('input[name="preferred-mode"]');

  if (
    !(brandLogo instanceof HTMLImageElement) ||
    !brandEyebrow ||
    !brandTitle ||
    !brandSubtitle ||
    !brandingInfo ||
    !versionBadge ||
    !firstRunCard ||
    !dismissFirstRunButton ||
    !(overlayToggle instanceof HTMLInputElement) ||
    !(debugToggle instanceof HTMLInputElement)
  ) {
    throw new Error('Options elements are missing');
  }

  return {
    brandLogo,
    brandEyebrow,
    brandTitle,
    brandSubtitle,
    brandingInfo,
    versionBadge,
    firstRunCard,
    dismissFirstRunButton: dismissFirstRunButton as HTMLButtonElement,
    overlayToggle,
    debugToggle,
    modeInputs,
  };
}
