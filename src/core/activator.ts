import { Overlay } from '../ui/overlay';
import { querySelectorAllDeep, isVisible, waitForElementDeep } from './dom-utils';

export class CouponActivator {
  private overlay: Overlay;
  private activatedCount: number = 0;
  private skippedCount: number = 0;
  private totalCoupons: number = 0;
  private startTime: number = 0;
  
  constructor() {
    this.overlay = new Overlay();
    this.startTime = Date.now();
  }
  
  public async start() {
    try {
      this.overlay.updateStatus('Initialisiere System...');
      this.overlay.updateProgress(5);
      
      // 1. Wait for Coupon Center (Shadow DOM container)
      this.overlay.updateStatus('Suche Coupon Center...');
      
      // Payback often has a loading skeleton first, so we wait longer
      const couponPage = await waitForElementDeep('pb-coupon-center', 10000);
      
      if (!couponPage) {
        throw new Error('Coupon-Bereich nicht gefunden. Bist du auf payback.de/coupons?');
      }
      
      this.overlay.updateStatus('Analysiere Coupons...');
      this.overlay.updateProgress(15);
      
      // 2. Wait for at least one coupon to appear (it might render async)
      // pb-coupon-center exists, but it might be empty fetching data
      const firstCoupon = await waitForElementDeep('pbc-coupon', 5000, couponPage);
      
      if (!firstCoupon) {
          // Double check if maybe there are really no coupons but the container is there
          // or if the selector changed.
          this.overlay.updateStatus('Keine Coupons erkannt.');
          this.overlay.updateProgress(100, 'normal');
          this.overlay.remove(4000);
          return;
      }

      this.overlay.updateProgress(20);
      
      // 3. Get All Coupons
      // We look deep from the document because querySelectorAllDeep is robust
      const coupons = querySelectorAllDeep('pbc-coupon');
      
      if (coupons.length === 0) {
         this.overlay.updateStatus('Geister-Coupons? (0 gefunden)');
         this.overlay.remove(3000);
         return;
      }
      
      this.totalCoupons = coupons.length;
      this.overlay.updateStatus(`${this.totalCoupons} Coupons identifiziert`);
      this.overlay.updateStats(0, 0);
      
      await this.processCoupons(coupons);
      
      this.finish();
      
    } catch (e: any) {
      console.error('Activator Error:', e);
      this.overlay.updateStatus('Abbruch: ' + (e.message || 'Unbekannter Fehler'));
      this.overlay.updateProgress(100, 'error');
      this.overlay.remove(6000);
    }
  }
  
  private async processCoupons(coupons: Element[]) {
    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      // Progress from 20% to 100%
      const progress = 20 + ((i / coupons.length) * 80);
      
      this.overlay.updateProgress(progress);
      this.overlay.updateStatus(`Aktiviere ${i + 1} von ${this.totalCoupons}...`);
      
      // Throttle slightly to look cool and be safe
      await this.wait(50); 
      
      try {
        const result = await this.activateSingleCoupon(coupon);
        if (result) {
          this.activatedCount++;
        } else {
          this.skippedCount++;
        }
        this.overlay.updateStats(this.activatedCount, this.skippedCount);
      } catch (e) {
        console.warn('Coupon failed:', i, e);
        this.skippedCount++;
      }
    }
  }
  
  private async activateSingleCoupon(coupon: Element): Promise<boolean> {
    // Look for the action button inside the coupon's Shadow DOM (or direct children)
    // The button usually has a specific class like 'button' or is a specific custom element
    
    // Attempt 1: Look for the call-to-action wrapper
    const cta = querySelectorAllDeep('pbc-coupon-call-to-action', coupon)[0];
    
    if (!cta) {
        // Fallback: Maybe it's a direct button?
        // Some coupons are different.
        return false;
    }
    
    // Attempt 2: Look for the actual clickable button/div inside CTA
    // The structure is usually pbc-coupon-call-to-action -> div.cta -> button
    // We look for anything that looks like an activation button'
    const activateBtn = querySelectorAllDeep('.not-activated', cta)[0];
    
    if (activateBtn && isVisible(activateBtn)) {
        (activateBtn as HTMLElement).click();
        return true;
    }
    
    return false;
  }
  
  private finish() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    this.overlay.updateStatus(`Erfolg! ${duration}s`);
    this.overlay.updateProgress(100, 'success');
    
    if (this.activatedCount > 0) {
        setTimeout(() => {
            if (confirm(`Fertig! ${this.activatedCount} Coupons aktiviert.\nSeite neu laden für Punkte-Update?`)) {
                location.reload();
            } else {
                this.overlay.remove(2000);
            }
        }, 500);
    } else {
        this.overlay.remove(3000);
    }
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
