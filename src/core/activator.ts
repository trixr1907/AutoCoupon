import { Overlay } from '../ui/overlay';

// Debug mode - disable in production
const DEBUG = true;
function log(...args: unknown[]) {
  if (DEBUG) console.log('[Payback Activator]', ...args);
}

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
      log('🚀 Starting coupon activation...');
      this.overlay.updateStatus('Initialisiere...');
      this.overlay.updateProgress(5);
      
      // 1. Find pb-coupon-center
      this.overlay.updateStatus('Suche Coupon-Center...');
      const couponCenter = document.querySelector('pb-coupon-center');
      
      if (!couponCenter) {
        throw new Error('Coupon-Center nicht gefunden. Bist du auf payback.de/coupons?');
      }
      
      log('✓ Found pb-coupon-center');
      
      // 2. Access Shadow DOM of coupon center
      const centerShadow = couponCenter.shadowRoot;
      if (!centerShadow) {
        throw new Error('Shadow DOM nicht zugänglich.');
      }
      
      log('✓ Accessed center shadow root');
      this.overlay.updateStatus('Scanne Coupons...');
      this.overlay.updateProgress(15);
      
      // Wait a bit for dynamic content
      await this.wait(500);
      
      // 3. Find all pbc-coupon elements inside the shadow
      const coupons = centerShadow.querySelectorAll('pbc-coupon');
      
      if (coupons.length === 0) {
        this.overlay.updateStatus('Keine Coupons gefunden. Eingeloggt?');
        this.overlay.updateProgress(100, 'error');
        this.overlay.remove(5000);
        return;
      }
      
      this.totalCoupons = coupons.length;
      log(`✓ Found ${this.totalCoupons} coupons`);
      this.overlay.updateStatus(`${this.totalCoupons} Coupons gefunden`);
      this.overlay.updateStats(0, 0);
      this.overlay.updateProgress(20);
      
      // 4. Process each coupon
      await this.processCoupons(Array.from(coupons));
      
      this.finish();
      
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unbekannter Fehler';
      console.error('Activator Error:', e);
      this.overlay.updateStatus('Fehler: ' + message);
      this.overlay.updateProgress(100, 'error');
      this.overlay.remove(6000);
    }
  }
  
  private async processCoupons(coupons: Element[]) {
    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      const progress = 20 + ((i / coupons.length) * 80);
      
      this.overlay.updateProgress(progress);
      this.overlay.updateStatus(`Prüfe ${i + 1} von ${this.totalCoupons}...`);
      
      // Small delay to not overwhelm the page
      await this.wait(30);
      
      try {
        const result = await this.activateSingleCoupon(coupon);
        if (result) {
          this.activatedCount++;
          log(`✓ Activated coupon ${i + 1}`);
        } else {
          this.skippedCount++;
        }
        this.overlay.updateStats(this.activatedCount, this.skippedCount);
      } catch (e) {
        log(`✗ Failed coupon ${i + 1}:`, e);
        this.skippedCount++;
      }
    }
  }
  
  private async activateSingleCoupon(coupon: Element): Promise<boolean> {
    // Access the coupon's shadow root
    const couponShadow = coupon.shadowRoot;
    if (!couponShadow) {
      log('No shadow root on coupon');
      return false;
    }
    
    // Find pbc-coupon-call-to-action
    const cta = couponShadow.querySelector('pbc-coupon-call-to-action');
    if (!cta) {
      log('No CTA element found');
      return false;
    }
    
    // Access CTA's shadow root
    const ctaShadow = cta.shadowRoot;
    if (!ctaShadow) {
      log('No shadow root on CTA');
      return false;
    }
    
    // Find the activate button
    // Classes: coupon__activate-button, coupon-call-to-action__button
    const activateBtn = ctaShadow.querySelector('button.coupon__activate-button') as HTMLButtonElement | null;
    
    if (!activateBtn) {
      log('No activate button found');
      return false;
    }
    
    // Check button text to see if it's already activated or unavailable
    const btnText = activateBtn.innerText?.toLowerCase() || '';
    
    // Skip if already activated or not available
    if (btnText.includes('aktiviert') || 
        btnText.includes('eingelöst') ||
        btnText.includes('abgelaufen') ||
        btnText.includes('in kürze')) {
      log('Coupon not activatable:', btnText);
      return false;
    }
    
    // Check if button is visible and enabled
    if (activateBtn.disabled || 
        activateBtn.style.display === 'none' ||
        !activateBtn.offsetParent) {
      log('Button disabled or hidden');
      return false;
    }
    
    // Click the button!
    log('Clicking activate button:', btnText);
    activateBtn.click();
    
    // Small delay after click
    await this.wait(50);
    
    return true;
  }
  
  private finish() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    if (this.activatedCount > 0) {
      this.overlay.updateStatus(`${this.activatedCount} aktiviert! (${duration}s)`);
      this.overlay.updateProgress(100, 'success');
      
      setTimeout(() => {
        if (confirm(`${this.activatedCount} Coupons aktiviert!\n\nSeite neu laden um Änderungen zu sehen?`)) {
          location.reload();
        } else {
          this.overlay.remove(2000);
        }
      }, 500);
    } else {
      this.overlay.updateStatus('Keine neuen Coupons zum Aktivieren');
      this.overlay.updateProgress(100, 'normal');
      this.overlay.remove(4000);
    }
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
