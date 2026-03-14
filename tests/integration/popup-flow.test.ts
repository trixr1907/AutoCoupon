import { flushPromises } from '../test-utils';

describe('popup flow', () => {
  it('renders bootstrap state from the background broker', async () => {
    document.body.innerHTML = `
      <main class="layout">
        <section class="hero">
          <img id="brand-logo" />
          <p id="brand-eyebrow"></p>
          <h1 id="brand-title"></h1>
          <p id="brand-subtitle"></p>
          <span id="version-badge"></span>
        </section>
        <div id="branding-info"></div>
        <section class="card">
          <button id="options-button" type="button"></button>
          <span id="state-dot"></span>
          <p id="state-headline"></p>
          <p id="state-copy"></p>
          <div id="notification"></div>
        </section>
        <button id="start-button" type="button"></button>
        <button id="cancel-button" type="button"></button>
        <button id="open-button" type="button"></button>
        <button id="reload-button" type="button"></button>
        <span id="processed-value"></span>
        <span id="activated-value"></span>
        <span id="skipped-value"></span>
        <span id="failed-value"></span>
        <span id="version-text"></span>
        <input type="radio" name="mode" value="normal" checked />
        <input type="radio" name="mode" value="turbo" />
        <input type="radio" name="mode" value="turbo-extreme" />
      </main>
    `;

    const runtimeSendMessage = chrome.runtime.sendMessage as ReturnType<typeof vi.fn>;
    runtimeSendMessage.mockResolvedValue({
      ok: true,
      settings: {
        preferredMode: 'turbo',
        overlayEnabled: true,
        debugLoggingEnabled: false,
        firstRunHintDismissed: false,
      },
      context: {
        tabId: 1,
        windowId: 1,
        isPaybackHost: true,
        contentReady: true,
        pageState: 'ready',
        status: null,
        lastSummary: null,
      },
    });

    vi.resetModules();
    await import('../../src/pages/popup/index');
    await flushPromises();

    expect(document.getElementById('state-headline')?.textContent).toBe(
      'Coupon-Seite bereit'
    );
    expect(
      (
        document.querySelector<HTMLInputElement>(
          'input[name="mode"][value="turbo"]'
        )
      )?.checked
    ).toBe(true);
  });
});
