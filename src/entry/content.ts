/**
 * AutoCoupon - Content Script
 * Empfängt Nachrichten vom Popup und startet die Aktivierung
 */

import { CouponActivator } from '../core/activator';

// Flag um doppelte Ausführung zu verhindern
let isRunning = false;

/**
 * Startet die Coupon-Aktivierung
 */
async function startActivation(): Promise<void> {
  if (isRunning) {
    console.log('[AutoCoupon] Aktivierung läuft bereits.');
    return;
  }
  
  isRunning = true;
  console.log('[AutoCoupon] 🚀 AutoCoupon gestartet');
  
  try {
    const activator = new CouponActivator();
    await activator.start();
  } catch (e) {
    console.error('[AutoCoupon] Aktivierungsfehler:', e);
  } finally {
    isRunning = false;
  }
}

/**
 * Message Listener für Extension-Kommunikation
 */
chrome.runtime.onMessage.addListener(
  (request, _sender, sendResponse) => {
    if (request.action === 'START_ACTIVATION') {
      startActivation();
      sendResponse({ status: 'started' });
    }
    return true;
  }
);

console.log('[AutoCoupon] Content Script geladen');
