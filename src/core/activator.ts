import { Overlay } from '../ui/overlay';

// Debug mode - disable in production
const DEBUG = true;
function log(...args: unknown[]) {
  if (DEBUG) console.log('[Payback Activator]', ...args);
}

// Coupon status types
type CouponStatus = 'activated' | 'already-active' | 'unavailable';

export class CouponActivator {
  private overlay: Overlay;
  private activatedCount: number = 0;
  private alreadyActiveCount: number = 0;
  private unavailableCount: number = 0;
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
      this.overlay.updateStats(0, 0, 0);
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
        const status = await this.checkAndActivateCoupon(coupon);
        
        switch (status) {
          case 'activated':
            this.activatedCount++;
            log(`✓ Activated coupon ${i + 1}`);
            break;
          case 'already-active':
            this.alreadyActiveCount++;
            break;
          case 'unavailable':
            this.unavailableCount++;
            break;
        }
        
        this.overlay.updateStats(this.activatedCount, this.alreadyActiveCount, this.unavailableCount);
      } catch (e) {
        log(`✗ Failed coupon ${i + 1}:`, e);
        this.unavailableCount++;
      }
    }
  }
  
  private async checkAndActivateCoupon(coupon: Element): Promise<CouponStatus> {
    // Access the coupon's shadow root
    const couponShadow = coupon.shadowRoot;
    if (!couponShadow) {
      log('No shadow root on coupon');
      return 'unavailable';
    }
    
    // Find pbc-coupon-call-to-action
    const cta = couponShadow.querySelector('pbc-coupon-call-to-action');
    if (!cta) {
      log('No CTA element found');
      return 'unavailable';
    }
    
    // Access CTA's shadow root
    const ctaShadow = cta.shadowRoot;
    if (!ctaShadow) {
      log('No shadow root on CTA');
      return 'unavailable';
    }
    
    // Find the activate button
    const activateBtn = ctaShadow.querySelector('button.coupon__activate-button') as HTMLButtonElement | null;
    
    if (!activateBtn) {
      log('No activate button found');
      return 'unavailable';
    }
    
    // Check button text to determine status
    const btnText = activateBtn.innerText?.toLowerCase().trim() || '';
    
    // Already activated
    if (btnText.includes('aktiviert') || 
        btnText.includes('eingelöst') ||
        btnText.includes('einlösen')) {
      log('Coupon already activated:', btnText);
      return 'already-active';
    }
    
    // Not available yet or expired
    if (btnText.includes('in kürze') ||
        btnText.includes('abgelaufen') ||
        btnText.includes('nicht verfügbar') ||
        btnText.includes('beendet')) {
      log('Coupon unavailable:', btnText);
      return 'unavailable';
    }
    
    // Check if button is visible and enabled
    if (activateBtn.disabled || 
        activateBtn.style.display === 'none' ||
        !activateBtn.offsetParent) {
      log('Button disabled or hidden');
      return 'unavailable';
    }
    
    // Check if it looks clickable (has "aktivieren" or "jetzt" in text)
    if (btnText.includes('aktivieren') || btnText.includes('jetzt')) {
      log('Clicking activate button:', btnText);
      activateBtn.click();
      await this.wait(50);
      return 'activated';
    }
    
    // Unknown state - treat as unavailable
    log('Unknown button state:', btnText);
    return 'unavailable';
  }
  
  private finish() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    if (this.activatedCount > 0) {
      this.overlay.updateStatus(`${this.activatedCount} neu aktiviert! (${duration}s)`);
      this.overlay.updateProgress(100, 'success');
      
      setTimeout(() => {
        if (confirm(`${this.activatedCount} Coupons neu aktiviert!\n${this.alreadyActiveCount} waren bereits aktiv.\n${this.unavailableCount} nicht verfügbar.\n\nSeite neu laden?`)) {
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
