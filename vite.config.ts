import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import webExtension from '@samrum/vite-plugin-web-extension';
import { BRAND_NAME } from './src/shared/config/branding';

type TargetBrowser = 'chromium' | 'firefox';

interface PackageMetadata {
  description: string;
  version: string;
}

const packageMetadata = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as PackageMetadata;

const targetBrowser = (
  process.env.TARGET_BROWSER === 'firefox' ? 'firefox' : 'chromium'
) as TargetBrowser;

const baseManifest = {
  manifest_version: 3,
  name: BRAND_NAME,
  description: packageMetadata.description,
  version: packageMetadata.version,
  permissions: ['storage'],
  host_permissions: [
    'https://www.payback.de/*',
    'https://*.payback.de/*',
  ],
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_title: BRAND_NAME,
  },
  options_ui: {
    page: 'src/pages/options/index.html',
    open_in_tab: true,
  },
  content_scripts: [
    {
      matches: ['https://www.payback.de/*', 'https://*.payback.de/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  icons: {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
} as const;

export function createManifest(target: TargetBrowser) {
  if (target === 'firefox') {
    return {
      ...baseManifest,
      background: {
        scripts: ['src/background/index.ts'],
      },
      browser_specific_settings: {
        gecko: {
          data_collection_permissions: {
            required: ['none'],
          },
          id: 'autocoupon@ivo.dev',
          strict_min_version: '140.0',
        },
        gecko_android: {
          strict_min_version: '142.0',
        },
      },
    } as const;
  }

  return {
    ...baseManifest,
    background: {
      service_worker: 'src/background/index.ts',
      type: 'module',
    },
  } as const;
}

export default defineConfig({
  build: {
    emptyOutDir: true,
    minify: 'esbuild',
    outDir: targetBrowser === 'firefox' ? 'dist/firefox' : 'dist/chromium',
    sourcemap: true,
  },
  plugins: [
    webExtension({
      manifest: createManifest(targetBrowser) as never,
      useDynamicUrlWebAccessibleResources: false,
    }),
  ],
});
