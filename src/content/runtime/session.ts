import {
  CONTENT_COMMAND_TYPE,
  CONTENT_EVENT_TYPE,
  type ContentCommand,
  type ContentCommandResponse,
} from '../../shared/contracts/messages';
import {
  createIdleStatus,
  type ActivationStatus,
  type PageStateResult,
  type Settings,
} from '../../shared/contracts/models';
import { setLoggerDebugEnabled } from '../../shared/logging/logger';
import { sendRuntimeMessage } from '../../platform/browser/browser';
import { getSettings } from '../../platform/storage/settings-store';
import { createContentResponse } from '../../platform/messaging/contracts';
import { ActivationRunner } from './activation-runner';
import { PaybackAdapter } from '../sites/payback/adapter';
import { Overlay } from '../ui/overlay';
import { NOTIFICATION_TIMEOUT_MS } from '../../shared/config/timing';

export class ContentSession {
  private settings: Settings | null = null;
  private readonly adapter = new PaybackAdapter();
  private readonly overlay = new Overlay();
  private readonly runner = new ActivationRunner(this.adapter, (status) => {
    this.handleStatusChange(status);
  });
  private lastStatus: ActivationStatus | null = null;

  async init(): Promise<void> {
    await this.applySettings(await getSettings());
  }

  async handleCommand(
    command: ContentCommand
  ): Promise<ContentCommandResponse> {
    switch (command.type) {
      case CONTENT_COMMAND_TYPE.ping:
        return createContentResponse({
          ok: true,
          status: this.lastStatus ?? createIdleStatus(),
        });

      case CONTENT_COMMAND_TYPE.getPageState: {
        const page = await this.detectPageState();
        return createContentResponse({
          ok: true,
          page,
          status: this.lastStatus ?? createIdleStatus(),
        });
      }

      case CONTENT_COMMAND_TYPE.overlaySyncSettings: {
        await this.applySettings(command.payload.settings);
        return createContentResponse({
          ok: true,
          status: this.lastStatus ?? createIdleStatus(),
        });
      }

      case CONTENT_COMMAND_TYPE.activationStart: {
        await this.applySettings(command.payload.settings);
        const status = await this.runner.start(command.payload.mode);
        return createContentResponse({
          ok: status.phase !== 'error',
          page: await this.detectPageState(),
          status,
          notification:
            status.phase === 'error'
              ? {
                  level: 'error',
                  title: 'Aktivierung blockiert',
                  message: status.message,
                  dismissAfterMs: NOTIFICATION_TIMEOUT_MS.activationError,
                }
              : undefined,
        });
      }

      case CONTENT_COMMAND_TYPE.activationCancel:
        this.runner.cancel();
        return createContentResponse({
          ok: true,
          status: this.lastStatus ?? createIdleStatus(),
        });
    }
  }

  private async detectPageState(): Promise<PageStateResult> {
    if (this.runner.isRunning()) {
      const status = this.runner.getStatus();
      return {
        state: 'busy',
        message: status.message,
        candidateCount: status.summary.totalSeen,
        activatableCount: 0,
        blockers: [],
        detectedAt: Date.now(),
      };
    }

    const page = await this.adapter.detectPageState();
    await this.emitEvent(CONTENT_EVENT_TYPE.pageStateChanged, { page });
    return page;
  }

  private async applySettings(settings: Settings): Promise<void> {
    this.settings = settings;
    setLoggerDebugEnabled(settings.debugLoggingEnabled);
    this.overlay.setEnabled(
      settings.overlayEnabled && this.lastStatus !== null,
      () => {
        this.runner.cancel();
      }
    );

    if (this.lastStatus && settings.overlayEnabled) {
      this.overlay.render(this.lastStatus);
    } else {
      this.overlay.destroy();
    }
  }

  private handleStatusChange(status: ActivationStatus): void {
    this.lastStatus = status;

    if (this.settings?.overlayEnabled) {
      this.overlay.render(status);
    } else {
      this.overlay.destroy();
    }

    void this.emitEvent(CONTENT_EVENT_TYPE.activationStatusChanged, {
      status,
    });

    if (
      status.phase === 'completed' ||
      status.phase === 'cancelled' ||
      status.phase === 'error'
    ) {
      void this.emitEvent(CONTENT_EVENT_TYPE.activationCompleted, {
        status,
      });
    }
  }

  private async emitEvent<TPayload extends object>(
    type: (typeof CONTENT_EVENT_TYPE)[keyof typeof CONTENT_EVENT_TYPE],
    payload: TPayload
  ): Promise<void> {
    await sendRuntimeMessage({
      type,
      payload,
    });
  }
}
