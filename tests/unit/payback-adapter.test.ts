import { PaybackAdapter } from '../../src/content/sites/payback/adapter';
import { loadFixture } from '../test-utils';

const ADAPTER_TEST_TIMEOUT_MS = 15000;

describe('PaybackAdapter', () => {
  it('classifies login and captcha pages as login-required', async () => {
    document.body.innerHTML = loadFixture('payback/login.html');
    window.history.replaceState(
      {},
      '',
      'https://www.payback.de/login?redirectUrl=https%3A%2F%2Fwww.payback.de%2Fcoupons'
    );

    const adapter = new PaybackAdapter();
    await expect(adapter.detectPageState()).resolves.toMatchObject({
      state: 'login-required',
      blockers: ['login', 'captcha'],
    });
  }, ADAPTER_TEST_TIMEOUT_MS);

  it('collects activatable, already-active and unavailable coupons from a standard DOM layout', async () => {
    document.body.innerHTML = loadFixture('payback/react-coupons.html');

    const adapter = new PaybackAdapter();
    const candidates = await adapter.collectCandidates();

    expect(candidates).toHaveLength(3);
    expect(candidates.filter((candidate) => candidate.status === 'activatable')).toHaveLength(1);
    expect(candidates.filter((candidate) => candidate.status === 'already-active')).toHaveLength(1);
    expect(candidates.filter((candidate) => candidate.status === 'unavailable')).toHaveLength(1);

    await expect(adapter.detectPageState()).resolves.toMatchObject({
      state: 'ready',
      candidateCount: 3,
      activatableCount: 1,
    });
  }, ADAPTER_TEST_TIMEOUT_MS);

  it('uses Android-style fallback fingerprints when no explicit id exists', async () => {
    document.body.innerHTML = `
      <main>
        <article>
          <h2>20fach Punkte</h2>
          <img alt="REWE" src="/image/rewe.png" />
          <p>Gültig bis 14.03.2026</p>
          <button>Aktivieren</button>
        </article>
      </main>
    `;

    const adapter = new PaybackAdapter();
    const candidates = await adapter.collectCandidates();

    expect(candidates[0]?.id).toMatch(/^coupon-/);
  }, ADAPTER_TEST_TIMEOUT_MS);

  it('does not stop counting at the old 250 candidate cap on larger coupon pages', async () => {
    const cards = Array.from({ length: 362 }, (_, index) => {
      const label = `Coupon ${index + 1}`;
      return `
        <article data-testid="coupon-${index + 1}">
          <h2>${label}</h2>
          <button>${index < 2 ? 'Aktivieren' : 'Bereits aktiviert'}</button>
        </article>
      `;
    }).join('');

    document.body.innerHTML = `<main>${cards}</main>`;

    const adapter = new PaybackAdapter();
    const candidates = await adapter.collectCandidates();

    expect(candidates).toHaveLength(362);
    expect(candidates.filter((candidate) => candidate.status === 'activatable')).toHaveLength(2);
    expect(candidates.filter((candidate) => candidate.status === 'already-active')).toHaveLength(360);
  }, ADAPTER_TEST_TIMEOUT_MS);

  it('caps noisy wrapper scans to the displayed PAYBACK total and ignores info-style actions', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const cards = Array.from({ length: 20 }, (_, index) => `
      <article class="coupon-card" data-testid="coupon-${index + 1}">
        <div class="coupon-card__content">
          <strong>${index + 1}0fach °P</strong>
          <p>Gueltig bis 29.03.2026</p>
          <button>${index < 2 ? 'Aktivieren' : 'Online einlösen'}</button>
          <button aria-label="Info">i</button>
          <div class="coupon-card__meta coupon-box">
            <span class="coupon-copy">PAYBACK Coupon</span>
          </div>
        </div>
      </article>
    `).join('');

    document.body.innerHTML = `
      <main>
        <label for="coupon-filter">Zeige</label>
        <select id="coupon-filter">
          <option>Alle eCoupons (20)</option>
        </select>
        <h2>Nicht aktiviert (2)</h2>
        <h2>Aktiviert (18)</h2>
        <section class="coupon-grid">${cards}</section>
      </main>
    `;

      const adapter = new PaybackAdapter();
      const candidates = await adapter.collectCandidates();
      const pageState = await adapter.detectPageState();

      expect(candidates).toHaveLength(20);
      expect(candidates.filter((candidate) => candidate.status === 'activatable')).toHaveLength(2);
      expect(pageState.candidateCount).toBe(20);
    } finally {
      warnSpy.mockRestore();
    }
  }, ADAPTER_TEST_TIMEOUT_MS);

  it('prefers individual coupon cards over broad parent sections', async () => {
    document.body.innerHTML = `
      <section>
        <h2>Aktiviert (2)</h2>
        <article>
          <div>
            <strong>500 Extra °P</strong>
            <p>Gueltig bis 29.03.2026</p>
            <button>Vor Ort einlösen</button>
            <button aria-label="Info">i</button>
          </div>
        </article>
        <article>
          <div>
            <strong>40fach °P</strong>
            <p>Gueltig bis 31.03.2026</p>
            <button>Online einlösen</button>
            <button aria-label="Info">i</button>
          </div>
        </article>
      </section>
    `;

    const adapter = new PaybackAdapter();
    const candidates = await adapter.collectCandidates();

    expect(candidates).toHaveLength(2);
    expect(candidates.every((candidate) => candidate.status === 'already-active')).toBe(
      true
    );
  }, ADAPTER_TEST_TIMEOUT_MS);

  it('collapses nested coupon wrappers onto canonical card containers', async () => {
    document.body.innerHTML = `
      <main>
        <section>
          <article class="coupon-card">
            <div class="coupon-card__content">
              <div class="coupon-copy">
                <strong>500 Extra °P</strong>
                <p>Gueltig bis 29.03.2026</p>
              </div>
              <button>Vor Ort einlösen</button>
              <button aria-label="Info">i</button>
            </div>
          </article>
          <article class="coupon-card">
            <div class="coupon-card__content">
              <div class="coupon-copy">
                <strong>40fach °P</strong>
                <p>Gueltig bis 31.03.2026</p>
              </div>
              <button>Online einlösen</button>
              <button aria-label="Info">i</button>
            </div>
          </article>
        </section>
      </main>
    `;

    const adapter = new PaybackAdapter();
    const candidates = await adapter.collectCandidates();

    expect(candidates).toHaveLength(2);
    expect(new Set(candidates.map((candidate) => candidate.id)).size).toBe(2);
    expect(candidates.every((candidate) => candidate.status === 'already-active')).toBe(
      true
    );
  }, ADAPTER_TEST_TIMEOUT_MS);

  it('falls back to the legacy shadow-dom structure when present', async () => {
    const couponCenter = document.createElement('pb-coupon-center');
    const couponCenterShadow = couponCenter.attachShadow({ mode: 'open' });
    const coupon = document.createElement('pbc-coupon');
    const couponShadow = coupon.attachShadow({ mode: 'open' });
    const title = document.createElement('strong');
    title.textContent = 'Legacy Coupon';
    const cta = document.createElement('pbc-coupon-call-to-action');
    const ctaShadow = cta.attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    button.textContent = 'Aktivieren';
    ctaShadow.append(button);
    couponShadow.append(title, cta);
    couponCenterShadow.append(coupon);
    document.body.append(couponCenter);

    const adapter = new PaybackAdapter();
    const candidates = await adapter.collectCandidates();

    expect(candidates.some((candidate) => candidate.source === 'legacy-shadow')).toBe(true);
  }, ADAPTER_TEST_TIMEOUT_MS);
});
