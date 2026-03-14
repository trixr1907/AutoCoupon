// @vitest-environment node

import { createManifest } from '../../vite.config';

describe('manifest generation', () => {
  it('creates a chromium MV3 manifest with a service worker', () => {
    expect(createManifest('chromium')).toMatchInlineSnapshot(`
      {
        "action": {
          "default_popup": "src/pages/popup/index.html",
          "default_title": "AutoCoupon",
        },
        "background": {
          "service_worker": "src/background/index.ts",
          "type": "module",
        },
        "content_scripts": [
          {
            "js": [
              "src/content/index.ts",
            ],
            "matches": [
              "https://www.payback.de/*",
              "https://*.payback.de/*",
            ],
            "run_at": "document_idle",
          },
        ],
        "description": "Local browser accessibility tool for sequential coupon activation on PAYBACK.",
        "host_permissions": [
          "https://www.payback.de/*",
          "https://*.payback.de/*",
        ],
        "icons": {
          "128": "icons/icon128.png",
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
        },
        "manifest_version": 3,
        "name": "AutoCoupon",
        "options_ui": {
          "open_in_tab": true,
          "page": "src/pages/options/index.html",
        },
        "permissions": [
          "storage",
        ],
        "version": "3.0.2",
      }
    `);
  });

  it('creates a firefox MV3 manifest with minimal background differences', () => {
    expect(createManifest('firefox')).toMatchInlineSnapshot(`
      {
        "action": {
          "default_popup": "src/pages/popup/index.html",
          "default_title": "AutoCoupon",
        },
        "background": {
          "scripts": [
            "src/background/index.ts",
          ],
        },
        "browser_specific_settings": {
          "gecko": {
            "id": "autocoupon@ivo.dev",
            "strict_min_version": "121.0",
          },
        },
        "content_scripts": [
          {
            "js": [
              "src/content/index.ts",
            ],
            "matches": [
              "https://www.payback.de/*",
              "https://*.payback.de/*",
            ],
            "run_at": "document_idle",
          },
        ],
        "description": "Local browser accessibility tool for sequential coupon activation on PAYBACK.",
        "host_permissions": [
          "https://www.payback.de/*",
          "https://*.payback.de/*",
        ],
        "icons": {
          "128": "icons/icon128.png",
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
        },
        "manifest_version": 3,
        "name": "AutoCoupon",
        "options_ui": {
          "open_in_tab": true,
          "page": "src/pages/options/index.html",
        },
        "permissions": [
          "storage",
        ],
        "version": "3.0.2",
      }
    `);
  });
});
