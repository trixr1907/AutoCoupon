import { Overlay } from '../ui/overlay';

// Debug mode - disable in production
const DEBUG = true;
function log(...args: unknown[]) {
  if (DEBUG) console.log('[AutoCoupon]', ...args);
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
      this.overlay.updateStatus(`${this.totalCoupons} Coupons gefunden! Bereit?`);
      this.overlay.updateStats(0, 0, 0);
      this.overlay.updateProgress(20);
      
      // WAIT FOR USER INTERACTION
      await this.overlay.waitForStart();
      
      this.overlay.updateStatus('Starte Aktivierung...');
      
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
      
      // Determine Delay based on Turbo Mode
      if (this.overlay.isTurboMode()) {
        await this.wait(30); // Fast / Risky
      } else {
        await this.waitHuman(700, 1500); // Safe / Human
      }
      
      try {
        const status = await this.checkAndActivateCoupon(coupon);
        
        switch (status) {
          case 'activated':
            this.activatedCount++;
            log(`✓ Activated coupon ${i + 1}`);
            
            // Extra pause after successful click
            if (!this.overlay.isTurboMode()) {
              await this.waitHuman(500, 1000);
            }
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
    
    // Check for visual indicators first (green checkmark = already active)
    const checkmark = couponShadow.querySelector('.coupon__checkmark, .checkmark, [class*="check"], [class*="aktiv"]');
    const hasGreenCheck = couponShadow.querySelector('svg[fill="green"], .icon--check, .icon-check');
    
    if (checkmark || hasGreenCheck) {
      log('Found green checkmark - coupon already active');
      return 'already-active';
    }

    // Also check the coupon element itself for status classes
    const couponClasses = coupon.className || '';
    if (couponClasses.includes('activated') || couponClasses.includes('aktiv')) {
      log('Coupon has activated class');
      return 'already-active';
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
      // Maybe it's a different button type - check for any button
      const anyButton = ctaShadow.querySelector('button') as HTMLButtonElement | null;
      if (!anyButton) {
        log('No button found at all');
        return 'unavailable';
      }
    }
    
    const button = activateBtn || ctaShadow.querySelector('button') as HTMLButtonElement;
    if (!button) {
      return 'unavailable';
    }
    
    // Check button text to determine status
    const btnText = button.innerText?.toLowerCase().trim() || '';
    
    // Also get full coupon text for additional context
    const fullCouponText = (couponShadow.textContent || '').toLowerCase();
    
    // --- ALREADY ACTIVATED ---
    // "Aktiviert" text or green checkmark indicators
    if (btnText.includes('aktiviert') || 
        btnText.includes('eingelöst') ||
        btnText.includes('einlösen') ||
        fullCouponText.includes('ist aktiviert') ||
        fullCouponText.includes('bereits aktiviert')) {
      log('Coupon already activated:', btnText);
      return 'already-active';
    }
    
    // --- NOT YET AVAILABLE ("In Kürze") ---
    // These are upcoming coupons - count as "noch nicht verfügbar"
    if (btnText.includes('in kürze') ||
        btnText.includes('in kurze') ||
        btnText.includes('demnächst') ||
        btnText.includes('bald verfügbar') ||
        fullCouponText.includes('in kürze')) {
      log('Coupon not yet available (In Kürze):', btnText);
      return 'unavailable'; // This will be counted as "Noch nicht verfügbar"
    }
    
    // --- EXPIRED or TRULY UNAVAILABLE ---
    if (btnText.includes('abgelaufen') ||
        btnText.includes('nicht verfügbar') ||
        btnText.includes('beendet') ||
        btnText.includes('vorbei')) {
      log('Coupon expired/unavailable:', btnText);
      return 'unavailable';
    }
    
    // Check if button is visible and enabled
    if (button.disabled || 
        button.style.display === 'none' ||
        !button.offsetParent) {
      log('Button disabled or hidden');
      return 'unavailable';
    }
    
    // --- CAN BE ACTIVATED ---
    if (btnText.includes('aktivieren') || btnText.includes('jetzt')) {
      log('Clicking activate button:', btnText);
      button.click();
      return 'activated';
    }
    
    // Unknown state - log for debugging
    log('Unknown button state:', btnText, '| Full text:', fullCouponText.substring(0, 100));
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
  
  private waitHuman(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
