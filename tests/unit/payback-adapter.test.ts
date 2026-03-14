import { PaybackAdapter } from '../../src/content/sites/payback/adapter';
import { loadFixture } from '../test-utils';

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
  });

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
  });

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
  });

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
  });

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
  });

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
  });
});
