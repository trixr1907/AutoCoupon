/**
 * AutoCoupon - Coupon Activator
 * Hauptklasse für die Coupon-Aktivierung
 */

import { Overlay } from '../ui/overlay';
import { CouponDetector } from './coupon-detector';
import { CouponStatus, ActivationStats } from '../types';
import { SELECTORS, TIMING } from './config';
import { logger } from '../utils/logger';

/**
 * Hauptklasse für die Coupon-Aktivierung
 */
export class CouponActivator {
  private readonly overlay: Overlay;
  private readonly detector: CouponDetector;
  private readonly stats: ActivationStats;
  private readonly startTime: number;
  
  constructor() {
    this.overlay = new Overlay();
    this.detector = new CouponDetector();
    this.stats = {
      activated: 0,
      alreadyActive: 0,
      unavailable: 0,
      total: 0,
    };
    this.startTime = Date.now();
  }
  
  /**
   * Startet den Aktivierungsprozess
   */
  public async start(): Promise<void> {
    try {
      logger.info('🚀 Starte Coupon-Aktivierung...');
      this.overlay.updateStatus('Initialisiere...');
      this.overlay.updateProgress(5);
      
      // 1. Finde Coupon-Center
      const coupons = await this.findCoupons();
      
      if (coupons.length === 0) {
        this.handleNoCouponsFound();
        return;
      }
      
      this.stats.total = coupons.length;
      logger.success(`${this.stats.total} Coupons gefunden`);
      this.overlay.updateStatus(`${this.stats.total} Coupons gefunden! Bereit?`);
      this.overlay.updateStats(0, 0, 0);
      this.overlay.updateProgress(20);
      
      // Warte auf Benutzer-Interaktion
      await this.overlay.waitForStart();
      
      this.overlay.updateStatus('Starte Aktivierung...');
      
      // 2. Verarbeite alle Coupons
      await this.processCoupons(coupons);
      
      // 3. Abschluss
      this.finish();
      
    } catch (e: unknown) {
      this.handleError(e);
    }
  }
  
  /**
   * Findet alle Coupons auf der Seite
   */
  private async findCoupons(): Promise<Element[]> {
    this.overlay.updateStatus('Suche Coupon-Center...');
    
    const couponCenter = document.querySelector(SELECTORS.COUPON_CENTER);
    
    if (!couponCenter) {
      throw new Error('Coupon-Center nicht gefunden. Bist du auf payback.de/coupons?');
    }
    
    logger.success('pb-coupon-center gefunden');
    
    const centerShadow = couponCenter.shadowRoot;
    
    if (!centerShadow) {
      throw new Error('Shadow DOM nicht zugänglich.');
    }
    
    logger.success('Shadow Root zugänglich');
    this.overlay.updateStatus('Scanne Coupons...');
    this.overlay.updateProgress(15);
    
    // Warte auf dynamischen Content
    await this.wait(TIMING.INITIAL_WAIT_MS);
    
    const coupons = centerShadow.querySelectorAll(SELECTORS.COUPON);
    return Array.from(coupons);
  }
  
  /**
   * Verarbeitet alle gefundenen Coupons
   */
  private async processCoupons(coupons: Element[]): Promise<void> {
    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      const progress = 20 + ((i / coupons.length) * 80);
      
      this.overlay.updateProgress(progress);
      this.overlay.updateStatus(`Prüfe ${i + 1} von ${this.stats.total}...`);
      
      // Delay basierend auf Turbo-Modus
      await this.applyDelay();
      
      try {
        const status = this.detector.detectAndActivate(coupon);
        this.updateStats(status, i);
        
        // Extra Pause nach erfolgreichem Klick
        if (status === 'activated' && !this.overlay.isTurboMode()) {
          await this.waitHuman(
            TIMING.NORMAL.POST_CLICK_MIN_MS,
            TIMING.NORMAL.POST_CLICK_MAX_MS
          );
        }
        
        this.overlay.updateStats(
          this.stats.activated,
          this.stats.alreadyActive,
          this.stats.unavailable
        );
      } catch (e) {
        logger.fail(`Coupon ${i + 1}:`, e);
        this.stats.unavailable++;
      }
    }
  }
  
  /**
   * Aktualisiert die Statistiken basierend auf dem Status
   */
  private updateStats(status: CouponStatus, index: number): void {
    switch (status) {
      case 'activated':
        this.stats.activated++;
        logger.success(`Coupon ${index + 1} aktiviert`);
        break;
      case 'already-active':
        this.stats.alreadyActive++;
        break;
      case 'unavailable':
        this.stats.unavailable++;
        break;
    }
  }
  
  /**
   * Wendet die korrekte Verzögerung an
   */
  private async applyDelay(): Promise<void> {
    if (this.overlay.isTurboMode()) {
      await this.wait(TIMING.TURBO.DELAY_MS);
    } else {
      await this.waitHuman(TIMING.NORMAL.MIN_DELAY_MS, TIMING.NORMAL.MAX_DELAY_MS);
    }
  }
  
  /**
   * Abschluss der Aktivierung
   */
  private finish(): void {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    if (this.stats.activated > 0) {
      this.overlay.updateStatus(`✅ ${this.stats.activated} neu aktiviert! (${duration}s)`);
      this.overlay.updateProgress(100, 'success');
    } else {
      this.overlay.updateStatus('Alle Coupons waren bereits aktiv');
      this.overlay.updateProgress(100, 'normal');
    }
    
    // Support-Bereich einblenden
    setTimeout(() => {
      this.overlay.showSupportSection();
    }, 500);
    
    // Overlay nach 15 Sekunden automatisch entfernen
    this.overlay.remove(15000);
  }
  
  /**
   * Fehlerbehandlung
   */
  private handleError(e: unknown): void {
    const message = e instanceof Error ? e.message : 'Unbekannter Fehler';
    logger.error('Activator Error:', e);
    this.overlay.updateStatus('Fehler: ' + message);
    this.overlay.updateProgress(100, 'error');
    this.overlay.remove(6000);
  }
  
  /**
   * Behandelt den Fall, dass keine Coupons gefunden wurden
   */
  private handleNoCouponsFound(): void {
    this.overlay.updateStatus('Keine Coupons gefunden. Eingeloggt?');
    this.overlay.updateProgress(100, 'error');
    this.overlay.remove(5000);
  }
  
  /**
   * Einfache Verzögerung
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Menschliche Verzögerung (zufällig zwischen min und max)
   */
  private waitHuman(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
