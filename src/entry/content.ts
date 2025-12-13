/**
 * AutoCoupon - Content Script
 * Empfängt Nachrichten vom Popup und startet die Aktivierung
 */

import { CouponActivator } from '../core/activator';
import { MessageAction, ExtensionMessage, ExtensionResponse } from '../types';
import { logger } from '../utils/logger';

// Flag um doppelte Ausführung zu verhindern
let isRunning = false;

/**
 * Startet die Coupon-Aktivierung
 */
async function startActivation(): Promise<void> {
  if (isRunning) {
    logger.warn('Aktivierung läuft bereits.');
    return;
  }
  
  isRunning = true;
  logger.info('🚀 AutoCoupon gestartet via Extension');
  
  try {
    const activator = new CouponActivator();
    await activator.start();
  } catch (e) {
    logger.error('Aktivierungsfehler:', e);
  } finally {
    isRunning = false;
  }
}

/**
 * Message Listener für Extension-Kommunikation
 */
chrome.runtime.onMessage.addListener(
  (
    request: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void
  ) => {
    if (request.action === MessageAction.START_ACTIVATION) {
      startActivation();
      sendResponse({ status: 'started' });
    }
    
    // Return true um asynchrone Response zu ermöglichen
    return true;
  }
);
