import { Overlay } from '../ui/overlay';
import { querySelectorAllDeep, isVisible } from './dom-utils';

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
      this.overlay.updateStatus('Analysiere Seite...');
      this.overlay.updateProgress(10);
      
      await this.wait(500);
      
      // Find coupon container - Payback uses custom elements
      // We search deep because it might be wrapped in other structured layout elements
      const couponPage = document.querySelector('pb-coupon-center');
      
      if (!couponPage) {
        throw new Error('Keine Coupon-Seite gefunden. Bitte auf payback.de/coupons nutzen.');
      }
      
      this.overlay.updateStatus('Scanne Coupons...');
      this.overlay.updateProgress(20);
      
      await this.wait(500); // Give Shadow DOM time to hydrate if needed
      
      // Deep search for all coupons
      const coupons = querySelectorAllDeep('pbc-coupon');
      
      if (coupons.length === 0) {
         this.overlay.updateStatus('Keine Coupons gefunden.');
         this.overlay.updateProgress(100, 'normal');
         this.overlay.remove(3000);
         return;
      }
      
      this.totalCoupons = coupons.length;
      this.overlay.updateStatus(`${this.totalCoupons} Coupons gefunden`);
      this.overlay.updateStats(0, 0); // Reset UI
      
      await this.processCoupons(coupons);
      
      this.finish();
      
    } catch (e: any) {
      console.error('Activator Error:', e);
      this.overlay.updateStatus('Fehler: ' + e.message);
      this.overlay.updateProgress(100, 'error');
      this.overlay.remove(5000);
    }
  }
  
  private async processCoupons(coupons: Element[]) {
    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      const progress = 30 + ((i / coupons.length) * 70);
      
      this.overlay.updateProgress(progress);
      this.overlay.updateStatus(`Verarbeite ${i + 1}/${this.totalCoupons}...`);
      
      // Delay for visual effect and not to spam the browser logic
      await this.wait(100 + Math.random() * 200);
      
      try {
        const result = await this.activateSingleCoupon(coupon);
        if (result) {
          this.activatedCount++;
        } else {
          this.skippedCount++;
        }
        this.overlay.updateStats(this.activatedCount, this.skippedCount);
      } catch (e) {
        console.warn('Failed to activate coupon', i, e);
        this.skippedCount++;
      }
    }
  }
  
  private async activateSingleCoupon(coupon: Element): Promise<boolean> {
    // Find the call-to-action button inside the coupon
    // Usually deeper in shadow roots
    
    // Strategy: Look for the specific button class or custom element that triggers activation
    // Based on previous knowledge: pbc-coupon-call-to-action -> .not-activated
    
    let cta: Element | null = null;
    
    if (coupon.shadowRoot) {
        cta = coupon.shadowRoot.querySelector('pbc-coupon-call-to-action');
    } else {
        cta = coupon.querySelector('pbc-coupon-call-to-action');
    }
    
    if (!cta) return false;
    
    // Check if activated
    const button = cta.shadowRoot ? 
        cta.shadowRoot.querySelector('.not-activated') : 
        cta.querySelector('.not-activated'); // Fallback if no shadow
        
    if (button && isVisible(button)) {
        (button as HTMLElement).click();
        return true;
    }
    
    return false;
  }
  
  private finish() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    this.overlay.updateStatus(`Fertig in ${duration}s!`);
    this.overlay.updateProgress(100, 'success');
    
    if (this.activatedCount > 0) {
        setTimeout(() => {
            if (confirm(`Fertig! ${this.activatedCount} Coupons aktiviert. Seite neu laden?`)) {
                location.reload();
            } else {
                this.overlay.remove(1000);
            }
        }, 800);
    } else {
        this.overlay.remove(3000);
    }
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
