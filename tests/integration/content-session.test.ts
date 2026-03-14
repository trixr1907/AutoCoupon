import { ContentSession } from '../../src/content/runtime/session';
import { CONTENT_COMMAND_TYPE } from '../../src/shared/contracts/messages';
import { getChromeMockControls, loadFixture } from '../test-utils';

describe('ContentSession', () => {
  it('does not mount the overlay while idle after initialization', async () => {
    document.body.innerHTML = loadFixture('payback/react-coupons.html');

    const session = new ContentSession();
    await session.init();

    expect(document.getElementById('autocoupon-overlay-root')).toBeNull();
  });

  it('emits status updates while processing coupons', async () => {
    document.body.innerHTML = loadFixture('payback/react-coupons.html');
    const card = document.querySelector<HTMLElement>('[data-testid="coupon-card"]');
    const button = card?.querySelector<HTMLButtonElement>('button');
    if (!card || !button) {
      throw new Error('Missing activatable coupon fixture');
    }

    button.addEventListener('click', () => {
      card.innerHTML = '<h2>10fach Punkte bei REWE</h2><p>Bereits aktiviert</p>';
    });

    const controls = getChromeMockControls();
    const runtimeSendMessage = chrome.runtime.sendMessage as ReturnType<typeof vi.fn>;
    runtimeSendMessage.mockResolvedValue({ ok: true });

    const session = new ContentSession();
    await session.init();
    await session.handleCommand({
      type: CONTENT_COMMAND_TYPE.activationStart,
      payload: {
        mode: 'turbo',
        settings: {
          preferredMode: 'turbo',
          overlayEnabled: true,
          debugLoggingEnabled: false,
          firstRunHintDismissed: false,
        },
      },
    });

    expect(runtimeSendMessage).toHaveBeenCalled();
    expect(controls.storageState).toEqual({});
  });
});
