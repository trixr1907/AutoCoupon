import { BackgroundRouter } from '../../src/platform/messaging/background-router';
import { SessionRegistry } from '../../src/background/session-registry';
import { POPUP_MESSAGE_TYPE } from '../../src/shared/contracts/messages';
import { getChromeMockControls } from '../test-utils';

describe('BackgroundRouter', () => {
  it('bootstraps a ready PAYBACK tab via the background broker', async () => {
    const controls = getChromeMockControls();
    controls.tabMessageHandlers.set(1, (message) => {
      if ((message as { type: string }).type === 'content/ping') {
        return { ok: true };
      }

      return {
        ok: true,
        page: {
          state: 'ready',
          message: '1 aktivierbarer Coupon erkannt.',
          candidateCount: 1,
          activatableCount: 1,
          blockers: [],
          detectedAt: Date.now(),
        },
        status: null,
      };
    });

    const router = new BackgroundRouter({
      registry: new SessionRegistry(),
    });

    const response = await router.handleMessage(
      {
        type: POPUP_MESSAGE_TYPE.uiBootstrap,
      },
      {}
    );

    expect(response).toMatchObject({
      ok: true,
      context: {
        isPaybackHost: true,
        contentReady: true,
        pageState: 'ready',
      },
    });
  });

  it('persists settings updates and syncs them to content when possible', async () => {
    const controls = getChromeMockControls();
    controls.tabMessageHandlers.set(1, (message) => {
      if ((message as { type: string }).type === 'content/ping') {
        return { ok: true };
      }

      if ((message as { type: string }).type === 'overlay/sync-settings') {
        return { ok: true };
      }

      return {
        ok: true,
        page: {
          state: 'ready',
          message: 'Bereit',
          candidateCount: 0,
          activatableCount: 0,
          blockers: [],
          detectedAt: Date.now(),
        },
      };
    });

    const router = new BackgroundRouter({
      registry: new SessionRegistry(),
    });

    const response = await router.handleMessage(
      {
        type: POPUP_MESSAGE_TYPE.settingsUpdate,
        payload: {
          patch: {
            overlayEnabled: false,
          },
        },
      },
      {}
    );

    expect(response).toMatchObject({
      ok: true,
      settings: {
        overlayEnabled: false,
      },
    });
  });
});
