import { CouponActivator } from './core/activator';

// Entry point
(function() {
  console.log('🚀 Payback SOTA Activator Initializing...');
  const app = new CouponActivator();
  app.start();
})();
