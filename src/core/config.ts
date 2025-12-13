/**
 * AutoCoupon - Konfiguration
 * Zentrale Konfigurationswerte und Konstanten
 */

/**
 * Timing-Konfiguration für Aktivierung
 */
export const TIMING = {
  /** Turbo-Modus: Schnell aber riskant */
  TURBO: {
    DELAY_MS: 30,
  },
  /** Normal-Modus: Menschlich und sicher */
  NORMAL: {
    MIN_DELAY_MS: 700,
    MAX_DELAY_MS: 1500,
    POST_CLICK_MIN_MS: 500,
    POST_CLICK_MAX_MS: 1000,
  },
  /** Initiale Wartezeit für dynamischen Content */
  INITIAL_WAIT_MS: 500,
} as const;

/**
 * CSS-Selektoren für DOM-Navigation
 */
export const SELECTORS = {
  /** Haupt-Coupon-Center Element */
  COUPON_CENTER: 'pb-coupon-center',
  /** Einzelne Coupon-Elemente */
  COUPON: 'pbc-coupon',
  /** Call-to-Action Element */
  CTA: 'pbc-coupon-call-to-action',
  /** Aktivierungs-Button */
  ACTIVATE_BUTTON: 'button.coupon__activate-button',
  /** Checkmark-Indikatoren */
  CHECKMARK: '.coupon__checkmark, .checkmark, [class*="check"], [class*="aktiv"]',
  /** Grüne Check-Icons */
  GREEN_CHECK: 'svg[fill="green"], .icon--check, .icon-check',
} as const;

/**
 * Text-Pattern für Coupon-Status-Erkennung
 */
export const STATUS_PATTERNS = {
  /** Bereits aktiviert */
  ALREADY_ACTIVE: [
    'aktiviert',
    'eingelöst',
    'einlösen',
    'ist aktiviert',
    'bereits aktiviert',
  ],
  /** Noch nicht verfügbar */
  NOT_YET_AVAILABLE: [
    'in kürze',
    'in kurze',
    'demnächst',
    'bald verfügbar',
  ],
  /** Abgelaufen / Nicht verfügbar */
  EXPIRED: [
    'abgelaufen',
    'nicht verfügbar',
    'beendet',
    'vorbei',
  ],
  /** Kann aktiviert werden */
  CAN_ACTIVATE: [
    'aktivieren',
    'jetzt',
  ],
} as const;

/**
 * UI-Konfiguration
 */
export const UI = {
  /** Widget-ID für DOM */
  WIDGET_ID: 'payback-sota-widget',
  /** Styles-ID für DOM */
  STYLES_ID: 'payback-sota-styles',
  /** Animation-Delay für Widget-Erscheinen */
  SHOW_DELAY_MS: 0,
  /** Delay beim Entfernen des Widgets */
  REMOVE_DELAY_MS: 500,
} as const;

/**
 * Debug-Konfiguration
 */
export const DEBUG = {
  /** Debug-Modus aktiviert */
  ENABLED: true,
  /** Log-Prefix */
  PREFIX: '[AutoCoupon]',
} as const;
