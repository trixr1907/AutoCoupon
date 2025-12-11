import { CouponActivator } from '../core/activator';

// Listener for messages from Popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'START_ACTIVATION') {
    
    // Check if we are already running to avoid double execution
    if ((window as any)._paybackActivatorRunning) {
      console.log('Activator already running.');
      return;
    }
    
    (window as any)._paybackActivatorRunning = true;
    console.log('🚀 SOTA Payback Activator started via Extension');
    
    const activator = new CouponActivator();
    activator.start().then(() => {
      (window as any)._paybackActivatorRunning = false;
    }).catch(e => {
        console.error(e);
        (window as any)._paybackActivatorRunning = false;
    });

    sendResponse({ status: 'started' });
  }
});
