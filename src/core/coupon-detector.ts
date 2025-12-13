/**
 * AutoCoupon - Coupon Detector
 * Klasse zur Erkennung und Bestimmung des Coupon-Status
 */

import { CouponStatus } from '../types';
import { SELECTORS, STATUS_PATTERNS } from './config';
import { logger } from '../utils/logger';

/**
 * Klasse zur Erkennung des Coupon-Status
 */
export class CouponDetector {
  /**
   * Erkennt den Status eines Coupons und klickt ggf. den Aktivierungs-Button
   */
  detectAndActivate(coupon: Element): CouponStatus {
    const couponShadow = coupon.shadowRoot;
    
    if (!couponShadow) {
      logger.debug('Kein Shadow Root auf Coupon');
      return 'unavailable';
    }

    // 1. Prüfe auf visuelle Indikatoren (grünes Häkchen = bereits aktiv)
    if (this.hasActiveIndicator(couponShadow)) {
      logger.debug('Grünes Häkchen gefunden - Coupon bereits aktiv');
      return 'already-active';
    }

    // 2. Prüfe Coupon-Element-Klassen
    if (this.hasActiveClass(coupon)) {
      logger.debug('Coupon hat aktive Klasse');
      return 'already-active';
    }

    // 3. Finde CTA und Button
    const button = this.findActivateButton(couponShadow);
    
    if (!button) {
      logger.debug('Kein Aktivierungs-Button gefunden');
      return 'unavailable';
    }

    // 4. Bestimme Status basierend auf Button-Text
    const btnText = button.innerText?.toLowerCase().trim() || '';
    const fullCouponText = (couponShadow.textContent || '').toLowerCase();

    return this.determineStatusAndClick(button, btnText, fullCouponText);
  }

  /**
   * Prüft ob visuelle "aktiv"-Indikatoren vorhanden sind
   */
  private hasActiveIndicator(shadow: ShadowRoot): boolean {
    const checkmark = shadow.querySelector(SELECTORS.CHECKMARK);
    const greenCheck = shadow.querySelector(SELECTORS.GREEN_CHECK);
    return !!(checkmark || greenCheck);
  }

  /**
   * Prüft ob das Coupon-Element aktive Klassen hat
   */
  private hasActiveClass(coupon: Element): boolean {
    const classes = coupon.className || '';
    return classes.includes('activated') || classes.includes('aktiv');
  }

  /**
   * Findet den Aktivierungs-Button im CTA Shadow DOM
   */
  private findActivateButton(couponShadow: ShadowRoot): HTMLButtonElement | null {
    const cta = couponShadow.querySelector(SELECTORS.CTA);
    
    if (!cta) {
      logger.debug('Kein CTA-Element gefunden');
      return null;
    }

    const ctaShadow = cta.shadowRoot;
    
    if (!ctaShadow) {
      logger.debug('Kein Shadow Root auf CTA');
      return null;
    }

    // Versuche spezifischen Button zu finden
    let button = ctaShadow.querySelector(SELECTORS.ACTIVATE_BUTTON) as HTMLButtonElement | null;
    
    // Fallback: Irgendein Button
    if (!button) {
      button = ctaShadow.querySelector('button') as HTMLButtonElement | null;
    }

    return button;
  }

  /**
   * Bestimmt den Status basierend auf Button-Text und klickt ggf.
   */
  private determineStatusAndClick(
    button: HTMLButtonElement,
    btnText: string,
    fullText: string
  ): CouponStatus {
    // Bereits aktiviert
    if (this.matchesAnyPattern(btnText, STATUS_PATTERNS.ALREADY_ACTIVE) ||
        this.matchesAnyPattern(fullText, ['ist aktiviert', 'bereits aktiviert'])) {
      logger.debug('Coupon bereits aktiviert:', btnText);
      return 'already-active';
    }

    // Noch nicht verfügbar ("In Kürze")
    if (this.matchesAnyPattern(btnText, STATUS_PATTERNS.NOT_YET_AVAILABLE) ||
        this.matchesAnyPattern(fullText, STATUS_PATTERNS.NOT_YET_AVAILABLE)) {
      logger.debug('Coupon noch nicht verfügbar (In Kürze):', btnText);
      return 'unavailable';
    }

    // Abgelaufen
    if (this.matchesAnyPattern(btnText, STATUS_PATTERNS.EXPIRED)) {
      logger.debug('Coupon abgelaufen/nicht verfügbar:', btnText);
      return 'unavailable';
    }

    // Button deaktiviert oder versteckt
    if (button.disabled || 
        button.style.display === 'none' ||
        !button.offsetParent) {
      logger.debug('Button deaktiviert oder versteckt');
      return 'unavailable';
    }

    // Kann aktiviert werden
    if (this.matchesAnyPattern(btnText, STATUS_PATTERNS.CAN_ACTIVATE)) {
      logger.debug('Klicke Aktivierungs-Button:', btnText);
      button.click();
      return 'activated';
    }

    // Unbekannter Status
    logger.debug('Unbekannter Button-Status:', btnText, '| Volltext:', fullText.substring(0, 100));
    return 'unavailable';
  }

  /**
   * Prüft ob ein Text eines der Patterns enthält
   */
  private matchesAnyPattern(text: string, patterns: readonly string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }
}
