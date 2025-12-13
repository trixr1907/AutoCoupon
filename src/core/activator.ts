import { Overlay } from '../ui/overlay';
import { querySelectorAllDeep, isVisible, waitForElementDeep } from './dom-utils';

// Debug mode - set to true for verbose console logging
const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) console.log('[Payback Activator]', ...args);
}

export class CouponActivator {
  private overlay: Overlay;
  private activatedCount: number = 0;
  private skippedCount: number = 0;
  private totalCoupons: number = 0;
  private startTime: number = 0;
  
  // Multiple possible selectors for different Payback page versions
  private static CONTAINER_SELECTORS = [
    'pb-coupon-center',
    'pbc-coupon-center', 
    '[class*="coupon-center"]',
    '[class*="CouponCenter"]',
    '.coupon-overview',
    '#coupon-container'
  ];
  
  private static COUPON_SELECTORS = [
    'pbc-coupon',
    'pb-coupon',
    '[class*="coupon-card"]',
    '[class*="CouponCard"]',
    '.coupon-item',
    '[data-coupon-id]'
  ];
  
  private static BUTTON_SELECTORS = [
    '.not-activated',
    '.activate-button',
    '.coupon-activate',
    'button[class*="activate"]',
    '[class*="ActivateButton"]',
    'button:not(.activated):not(.disabled)',
    '.cta-button:not(.activated)'
  ];
  
  constructor() {
    this.overlay = new Overlay();
    this.startTime = Date.now();
  }
  
  public async start() {
    try {
      log('Starting coupon activation...');
      this.overlay.updateStatus('Initialisiere...');
      this.overlay.updateProgress(5);
      
      // 1. Wait for Coupon Container
      this.overlay.updateStatus('Suche Coupon-Bereich...');
      
      let couponContainer: Element | null = null;
      
      // Try multiple selectors
      for (const selector of CouponActivator.CONTAINER_SELECTORS) {
        log('Trying container selector:', selector);
        couponContainer = await waitForElementDeep(selector, 3000);
        if (couponContainer) {
          log('✓ Found container with:', selector);
          break;
        }
      }
      
      if (!couponContainer) {
        // Fallback: Try to find coupons directly without container
        log('No container found, trying direct coupon search...');
        this.overlay.updateStatus('Suche Coupons direkt...');
      }
      
      this.overlay.updateStatus('Scanne Coupons...');
      this.overlay.updateProgress(15);
      
      // 2. Find all coupons
      let coupons: Element[] = [];
      
      for (const selector of CouponActivator.COUPON_SELECTORS) {
        log('Trying coupon selector:', selector);
        const found = querySelectorAllDeep(selector);
        if (found.length > 0) {
          log(`✓ Found ${found.length} coupons with:`, selector);
          coupons = found;
          break;
        }
      }
      
      // If still no coupons, try looking for any clickable elements that look like activation buttons
      if (coupons.length === 0) {
        log('No coupons found with standard selectors, trying button-first approach...');
        
        for (const selector of CouponActivator.BUTTON_SELECTORS) {
          const buttons = querySelectorAllDeep(selector);
          if (buttons.length > 0) {
            log(`✓ Found ${buttons.length} potential activation buttons with:`, selector);
            // Click these buttons directly
            this.overlay.updateStatus(`${buttons.length} Buttons gefunden`);
            this.overlay.updateStats(0, 0);
            this.totalCoupons = buttons.length;
            
            await this.processButtons(buttons);
            this.finish();
            return;
          }
        }
      }
      
      if (coupons.length === 0) {
        log('❌ No coupons found with any selector');
        log('Page HTML sample:', document.body.innerHTML.substring(0, 2000));
        this.overlay.updateStatus('Keine Coupons gefunden. Eingeloggt?');
        this.overlay.updateProgress(100, 'error');
        this.overlay.remove(5000);
        return;
      }
      
      this.totalCoupons = coupons.length;
      this.overlay.updateStatus(`${this.totalCoupons} Coupons gefunden`);
      this.overlay.updateStats(0, 0);
      this.overlay.updateProgress(20);
      
      await this.processCoupons(coupons);
      
      this.finish();
      
    } catch (e: any) {
      console.error('Activator Error:', e);
      this.overlay.updateStatus('Fehler: ' + (e.message || 'Unbekannt'));
      this.overlay.updateProgress(100, 'error');
      this.overlay.remove(6000);
    }
  }
  
  private async processButtons(buttons: Element[]) {
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const progress = 20 + ((i / buttons.length) * 80);
      
      this.overlay.updateProgress(progress);
      this.overlay.updateStatus(`Aktiviere ${i + 1} von ${this.totalCoupons}...`);
      
      await this.wait(80);
      
      try {
        if (isVisible(btn)) {
          (btn as HTMLElement).click();
          this.activatedCount++;
          log(`✓ Clicked button ${i + 1}`);
        } else {
          this.skippedCount++;
        }
        this.overlay.updateStats(this.activatedCount, this.skippedCount);
      } catch (e) {
        log('Button click failed:', i, e);
        this.skippedCount++;
      }
    }
  }
  
  private async processCoupons(coupons: Element[]) {
    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      const progress = 20 + ((i / coupons.length) * 80);
      
      this.overlay.updateProgress(progress);
      this.overlay.updateStatus(`Aktiviere ${i + 1} von ${this.totalCoupons}...`);
      
      await this.wait(60);
      
      try {
        const result = await this.activateSingleCoupon(coupon);
        if (result) {
          this.activatedCount++;
        } else {
          this.skippedCount++;
        }
        this.overlay.updateStats(this.activatedCount, this.skippedCount);
      } catch (e) {
        log('Coupon failed:', i, e);
        this.skippedCount++;
      }
    }
  }
  
  private async activateSingleCoupon(coupon: Element): Promise<boolean> {
    // Try multiple button selectors inside the coupon
    for (const selector of CouponActivator.BUTTON_SELECTORS) {
      const buttons = querySelectorAllDeep(selector, coupon);
      
      for (const btn of buttons) {
        if (isVisible(btn)) {
          log('Clicking button with selector:', selector);
          (btn as HTMLElement).click();
          return true;
        }
      }
    }
    
    // Fallback: Look for any button element
    const anyButtons = querySelectorAllDeep('button', coupon);
    for (const btn of anyButtons) {
      const text = (btn as HTMLElement).innerText?.toLowerCase() || '';
      if (text.includes('aktivier') || text.includes('einlösen') || text.includes('jetzt')) {
        if (isVisible(btn)) {
          log('Clicking button by text:', text);
          (btn as HTMLElement).click();
          return true;
        }
      }
    }
    
    return false;
  }
  
  private finish() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    this.overlay.updateStatus(`Fertig! ${duration}s`);
    this.overlay.updateProgress(100, 'success');
    
    if (this.activatedCount > 0) {
      setTimeout(() => {
        if (confirm(`${this.activatedCount} Coupons aktiviert!\nSeite neu laden?`)) {
          location.reload();
        } else {
          this.overlay.remove(2000);
        }
      }, 500);
    } else {
      this.overlay.updateStatus('Keine neuen Coupons');
      this.overlay.remove(3000);
    }
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
