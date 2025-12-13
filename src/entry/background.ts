/**
 * AutoCoupon - Background Service Worker
 * Verwaltet Extension-Lifecycle Events
 */

import { logger } from '../utils/logger';

/**
 * Installation/Update Handler
 */
chrome.runtime.onInstalled.addListener((details) => {
  switch (details.reason) {
    case 'install':
      logger.info('AutoCoupon installiert');
      break;
    case 'update':
      logger.info('AutoCoupon aktualisiert auf Version', chrome.runtime.getManifest().version);
      break;
  }
});

/**
 * Extension Icon klick Handler (optional)
 */
chrome.action.onClicked.addListener((_tab) => {
  // Popup wird automatisch geöffnet durch manifest.json action.default_popup
  // Dieser Handler ist nur aktiv wenn kein default_popup definiert ist
});
