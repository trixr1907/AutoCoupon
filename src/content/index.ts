import type { ContentCommand, ContentCommandResponse } from '../shared/contracts/messages';
import { isContentCommand } from '../platform/messaging/contracts';
import { addRuntimeMessageListener } from '../platform/browser/browser';
import { NOTIFICATION_TIMEOUT_MS } from '../shared/config/timing';
import { ContentSession } from './runtime/session';
import { createLogger } from '../shared/logging/logger';

const logger = createLogger('content');
const SENTINEL_ATTRIBUTE = 'data-autocoupon-content-ready';

const root = document.documentElement;

if (window.top !== window) {
  logger.debug('Skipping content bootstrap in subframe');
} else if (root.hasAttribute(SENTINEL_ATTRIBUTE)) {
  logger.debug('Content session already initialized');
} else {
  root.setAttribute(SENTINEL_ATTRIBUTE, 'booting');

  const session = new ContentSession();
  void session.init().catch((error) => {
    logger.error('Content session init failed', error);
  });

  addRuntimeMessageListener((message, _sender, sendResponse) => {
    if (!isContentCommand(message)) {
      return false;
    }

    void session
      .handleCommand(message as ContentCommand)
      .then((response: ContentCommandResponse) => {
        sendResponse(response);
      })
      .catch((error: unknown) => {
        logger.error('Content command failed', error);
        sendResponse({
          ok: false,
          notification: {
            level: 'error',
            title: 'Content-Fehler',
            message:
              error instanceof Error ? error.message : 'Unbekannter Content-Fehler',
            dismissAfterMs: NOTIFICATION_TIMEOUT_MS.contentError,
          },
        });
      });

    return true;
  });

  root.setAttribute(SENTINEL_ATTRIBUTE, 'true');
}
