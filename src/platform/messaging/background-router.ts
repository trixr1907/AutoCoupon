import {
  createContentResponse,
  createUiResponse,
  isContentEvent,
  isPopupRequest,
} from './contracts';
import {
  CONTENT_COMMAND_TYPE,
  CONTENT_EVENT_TYPE,
  POPUP_MESSAGE_TYPE,
  type BackgroundUiResponse,
  type ContentCommand,
  type ContentCommandResponse,
  type ContentEvent,
  type PopupRequest,
} from '../../shared/contracts/messages';
import {
  PAYBACK_COUPONS_URL,
} from '../../shared/config/urls';
import { NOTIFICATION_TIMEOUT_MS } from '../../shared/config/timing';
import {
  createEmptyContext,
  createIdleStatus,
} from '../../shared/contracts/models';
import type {
  ActiveTabContext,
  PageStateResult,
} from '../../shared/contracts/models';
import {
  createTab,
  extractTabId,
  extractWindowId,
  isPaybackUrl,
  queryActiveTab,
  sendMessageToTab,
  updateTab,
} from '../browser/browser';
import {
  getLastRunSummary,
  getSettings,
  setLastRunSummary,
  updateSettings,
} from '../storage/settings-store';
import type { SessionRegistry } from '../../background/session-registry';
import { buildTabContext } from '../../background/tab-context';
import { createLogger } from '../../shared/logging/logger';

const logger = createLogger('background-router');

interface BackgroundRouterDependencies {
  registry: SessionRegistry;
}

export class BackgroundRouter {
  constructor(private readonly dependencies: BackgroundRouterDependencies) {}

  async handleMessage(
    message: unknown,
    sender: chrome.runtime.MessageSender
  ): Promise<BackgroundUiResponse | ContentCommandResponse | undefined> {
    if (isContentEvent(message)) {
      await this.handleContentEvent(message, sender);
      return createContentResponse({ ok: true });
    }

    if (isPopupRequest(message)) {
      return await this.handlePopupRequest(message);
    }

    return undefined;
  }

  private async handlePopupRequest(
    request: PopupRequest
  ): Promise<BackgroundUiResponse> {
    switch (request.type) {
      case POPUP_MESSAGE_TYPE.uiBootstrap: {
        const [settings, context] = await Promise.all([
          getSettings(),
          this.resolveActiveContext({ forceRefresh: true }),
        ]);

        return createUiResponse({
          ok: true,
          settings,
          context,
        });
      }

      case POPUP_MESSAGE_TYPE.contextRefresh: {
        return createUiResponse({
          ok: true,
          context: await this.resolveActiveContext({ forceRefresh: true }),
        });
      }

      case POPUP_MESSAGE_TYPE.settingsGet: {
        return createUiResponse({
          ok: true,
          settings: await getSettings(),
          context: await this.resolveActiveContext({ forceRefresh: false }),
        });
      }

      case POPUP_MESSAGE_TYPE.settingsUpdate: {
        const settings = await updateSettings(request.payload.patch);
        const context = await this.resolveActiveContext({ forceRefresh: false });
        if (context.tabId && context.isPaybackHost) {
          await this.safeSendContentCommand(context.tabId, {
            type: CONTENT_COMMAND_TYPE.overlaySyncSettings,
            payload: { settings },
          });
        }

        return createUiResponse({
          ok: true,
          settings,
          context,
          notification: {
            level: 'success',
            title: 'Einstellungen gespeichert',
            message: 'Die lokalen Optionen wurden aktualisiert.',
            dismissAfterMs: NOTIFICATION_TIMEOUT_MS.settingsSaved,
          },
        });
      }

      case POPUP_MESSAGE_TYPE.activationStart: {
        const settings = await getSettings();
        const activeTab = await queryActiveTab();
        const tabId = extractTabId(activeTab);
        const context = await this.resolveActiveContext({ forceRefresh: true });

        if (!tabId || !context.isPaybackHost) {
          return createUiResponse({
            ok: false,
            context,
            settings,
            notification: {
              level: 'warning',
              title: 'Falsche Seite',
              message: 'Öffne zuerst die PAYBACK-Coupon-Seite.',
              dismissAfterMs: NOTIFICATION_TIMEOUT_MS.activationWarning,
            },
          });
        }

        const response = await this.safeSendContentCommand(tabId, {
          type: CONTENT_COMMAND_TYPE.activationStart,
          payload: {
            mode: request.payload.mode,
            settings,
          },
        });

        if (!response?.ok) {
          return createUiResponse({
            ok: false,
            context: await this.resolveActiveContext({ forceRefresh: true }),
            settings,
            notification:
              response?.notification ?? {
                level: 'error',
                title: 'Aktivierung fehlgeschlagen',
                message: 'Die Aktivierung konnte nicht gestartet werden.',
                dismissAfterMs: NOTIFICATION_TIMEOUT_MS.activationError,
              },
          });
        }

        return createUiResponse({
          ok: true,
          context: await this.resolveActiveContext({ forceRefresh: true }),
          settings,
        });
      }

      case POPUP_MESSAGE_TYPE.activationCancel: {
        const activeTab = await queryActiveTab();
        const tabId = extractTabId(activeTab);
        const context = await this.resolveActiveContext({ forceRefresh: false });

        if (!tabId || !context.contentReady) {
          return createUiResponse({
            ok: false,
            context,
            notification: {
              level: 'warning',
              title: 'Kein aktiver Lauf',
              message: 'Es läuft derzeit keine Aktivierung.',
              dismissAfterMs: NOTIFICATION_TIMEOUT_MS.cancelWarning,
            },
          });
        }

        await this.safeSendContentCommand(tabId, {
          type: CONTENT_COMMAND_TYPE.activationCancel,
        });

        return createUiResponse({
          ok: true,
          context: await this.resolveActiveContext({ forceRefresh: true }),
        });
      }

      case POPUP_MESSAGE_TYPE.pageOpenCoupons: {
        const activeTab = await queryActiveTab();
        const tabId = extractTabId(activeTab);
        let targetTab: chrome.tabs.Tab;

        if (tabId) {
          targetTab = await updateTab(tabId, { url: PAYBACK_COUPONS_URL });
        } else {
          targetTab = await createTab({ url: PAYBACK_COUPONS_URL });
        }

        const targetTabId = extractTabId(targetTab);
        if (targetTabId) {
          this.dependencies.registry.markNavigating(targetTabId, {
            windowId: extractWindowId(targetTab),
            isPaybackHost: true,
          });
        }

        return createUiResponse({
          ok: true,
          context:
            targetTabId
              ? buildTabContext({
                  ...(this.dependencies.registry.get(targetTabId) ?? createEmptyContext()),
                  tabId: targetTabId,
                  windowId: extractWindowId(targetTab),
                  isPaybackHost: true,
                  contentReady: false,
                })
              : await this.resolveActiveContext({ forceRefresh: false }),
        });
      }

      case POPUP_MESSAGE_TYPE.pageReloadCoupons: {
        const activeTab = await queryActiveTab();
        const tabId = extractTabId(activeTab);
        let targetTab: chrome.tabs.Tab;
        if (tabId) {
          targetTab = await updateTab(tabId, { url: PAYBACK_COUPONS_URL });
        } else {
          targetTab = await createTab({ url: PAYBACK_COUPONS_URL });
        }

        const targetTabId = extractTabId(targetTab);
        if (targetTabId) {
          this.dependencies.registry.markNavigating(targetTabId, {
            windowId: extractWindowId(targetTab),
            isPaybackHost: true,
          });
        }

        return createUiResponse({
          ok: true,
          context:
            targetTabId
              ? buildTabContext({
                  ...(this.dependencies.registry.get(targetTabId) ?? createEmptyContext()),
                  tabId: targetTabId,
                  windowId: extractWindowId(targetTab),
                  isPaybackHost: true,
                  contentReady: false,
                })
              : await this.resolveActiveContext({ forceRefresh: false }),
        });
      }
    }
  }

  private async handleContentEvent(
    event: ContentEvent,
    sender: chrome.runtime.MessageSender
  ): Promise<void> {
    const tabId = extractTabId(sender.tab);
    if (!tabId) {
      return;
    }

    const windowId = extractWindowId(sender.tab);
    const url = sender.tab?.url;
    this.dependencies.registry.setBase(tabId, {
      windowId,
      isPaybackHost: isPaybackUrl(url),
      contentReady: true,
    });

    switch (event.type) {
      case CONTENT_EVENT_TYPE.ready:
      case CONTENT_EVENT_TYPE.pageStateChanged:
        this.dependencies.registry.updatePageState(tabId, event.payload.page);
        return;

      case CONTENT_EVENT_TYPE.activationStatusChanged:
        this.dependencies.registry.updateStatus(tabId, event.payload.status);
        return;

      case CONTENT_EVENT_TYPE.activationCompleted:
        this.dependencies.registry.updateStatus(tabId, event.payload.status);
        await setLastRunSummary(event.payload.status.summary);
        this.dependencies.registry.updateSummary(tabId, event.payload.status.summary);
        return;
    }
  }

  private async resolveActiveContext(input: {
    forceRefresh: boolean;
  }): Promise<ActiveTabContext> {
    const activeTab = await queryActiveTab();
    const tabId = extractTabId(activeTab);
    const windowId = extractWindowId(activeTab);

    if (!tabId) {
      return buildTabContext({
        ...createEmptyContext(),
        tabId: null,
        windowId,
        isPaybackHost: false,
        contentReady: false,
      });
    }

    const isPaybackHost = isPaybackUrl(activeTab?.url);
    const cached =
      this.dependencies.registry.get(tabId) ??
      this.dependencies.registry.setBase(tabId, {
        windowId,
        isPaybackHost,
      });

    cached.windowId = windowId;
    cached.isPaybackHost = isPaybackHost;

    if (!isPaybackHost) {
      cached.contentReady = false;
      cached.pageState = 'unsupported-page';
      cached.status = null;
      cached.lastSummary = await getLastRunSummary();
      return buildTabContext(cached);
    }

    if (input.forceRefresh || !cached.contentReady) {
      const snapshot = await this.refreshFromContent(tabId);
      if (snapshot) {
        cached.contentReady = true;
        cached.pageState = snapshot.page.state;
        cached.status = snapshot.status;
      } else {
        cached.contentReady = false;
        cached.pageState = 'unsupported-layout';
      }
    }

    if (!cached.lastSummary) {
      cached.lastSummary = await getLastRunSummary();
    }

    return buildTabContext(cached);
  }

  private async refreshFromContent(
    tabId: number
  ): Promise<{
    page: PageStateResult;
    status: ActiveTabContext['status'];
  } | null> {
    const pingResponse = await this.safeSendContentCommand(tabId, {
      type: CONTENT_COMMAND_TYPE.ping,
    });

    if (!pingResponse?.ok) {
      return null;
    }

    const stateResponse = await this.safeSendContentCommand(tabId, {
      type: CONTENT_COMMAND_TYPE.getPageState,
    });

    if (!stateResponse?.ok || !stateResponse.page) {
      return null;
    }

    return {
      page: stateResponse.page,
      status: stateResponse.status ?? createIdleStatus(),
    };
  }

  private async safeSendContentCommand(
    tabId: number,
    command: ContentCommand
  ): Promise<ContentCommandResponse | null> {
    try {
      return await sendMessageToTab<ContentCommand, ContentCommandResponse>(
        tabId,
        command
      );
    } catch (error) {
      logger.debug('Content command failed', tabId, command.type, error);
      return null;
    }
  }
}
