import {
  browserApi,
  extractWindowId,
  isPaybackUrl,
  openOptionsPage,
} from '../platform/browser/browser';
import { BackgroundRouter } from '../platform/messaging/background-router';
import { SessionRegistry } from './session-registry';
import { createLogger } from '../shared/logging/logger';
import { NOTIFICATION_TIMEOUT_MS } from '../shared/config/timing';

const logger = createLogger('background');
const registry = new SessionRegistry();
const router = new BackgroundRouter({ registry });

browserApi.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    void openOptionsPage();
    logger.info('Extension installed');
  }

  if (details.reason === 'update') {
    logger.info('Extension updated', browserApi.runtime.getManifest().version);
  }
});

browserApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void router
    .handleMessage(message, sender)
    .then((response) => {
      sendResponse(response);
    })
    .catch((error: unknown) => {
      logger.error('Background routing failed', error);
      sendResponse({
        ok: false,
        notification: {
          level: 'error',
          title: 'Background-Fehler',
          message:
            error instanceof Error
              ? error.message
              : 'Unbekannter Background-Fehler',
          dismissAfterMs: NOTIFICATION_TIMEOUT_MS.backgroundError,
        },
      });
    });

  return true;
});

browserApi.tabs.onRemoved.addListener((tabId) => {
  registry.remove(tabId);
});

browserApi.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== 'loading') {
    return;
  }

  const nextUrl = changeInfo.url ?? tab.url;
  registry.markNavigating(tabId, {
    windowId: extractWindowId(tab),
    isPaybackHost: isPaybackUrl(nextUrl),
  });
});
