import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vi } from 'vitest';

interface ChromeMockControls {
  storageState: Record<string, unknown>;
  activeTab: chrome.tabs.Tab | undefined;
  tabMessageHandlers: Map<number, (message: unknown) => unknown>;
  reset(): void;
}

declare global {
  var __autocouponChromeMockControls: ChromeMockControls | undefined;
}

function createStorageGet(state: Record<string, unknown>) {
  return async (keys?: string | string[] | Record<string, unknown>) => {
    if (typeof keys === 'string') {
      return { [keys]: state[keys] };
    }

    if (Array.isArray(keys)) {
      return Object.fromEntries(keys.map((key) => [key, state[key]]));
    }

    if (typeof keys === 'object' && keys !== null) {
      return Object.fromEntries(
        Object.keys(keys).map((key) => [key, state[key] ?? keys[key]])
      );
    }

    return { ...state };
  };
}

function createMockTab(
  overrides: Partial<chrome.tabs.Tab> = {}
): chrome.tabs.Tab {
  return {
    id: 1,
    windowId: 1,
    active: true,
    highlighted: true,
    index: 0,
    pinned: false,
    incognito: false,
    selected: true,
    discarded: false,
    autoDiscardable: true,
    groupId: -1,
    frozen: false,
    url: 'https://www.payback.de/coupons',
    ...overrides,
  };
}

export function installChromeMock(): ChromeMockControls {
  const controls: ChromeMockControls = {
    storageState: {},
    activeTab: createMockTab(),
    tabMessageHandlers: new Map(),
    reset() {
      this.storageState = {};
      this.activeTab = createMockTab();
      this.tabMessageHandlers.clear();
      chrome.runtime.sendMessage = vi.fn(async () => ({ ok: true }));
      chrome.tabs.query = vi.fn(async () =>
        this.activeTab ? [this.activeTab] : []
      );
      chrome.tabs.sendMessage = vi.fn(async (tabId: number, message: unknown) => {
        const handler = this.tabMessageHandlers.get(tabId);
        if (!handler) {
          throw new Error(`No tab handler registered for ${tabId}`);
        }

        return await handler(message);
      });
      chrome.tabs.update = vi.fn(
        async (_tabId: number, updateProperties: chrome.tabs.UpdateProperties) => {
          this.activeTab = createMockTab({
            ...(this.activeTab ?? {}),
            ...updateProperties,
          });

          return this.activeTab;
        }
      ) as unknown as typeof chrome.tabs.update;
      chrome.tabs.create = vi.fn(
        async (createProperties: chrome.tabs.CreateProperties) => {
          this.activeTab = createMockTab({
            id: 99,
            url: createProperties.url,
          });

          return this.activeTab;
        }
      ) as unknown as typeof chrome.tabs.create;
      chrome.storage.local.get = vi.fn(
        createStorageGet(this.storageState)
      ) as unknown as typeof chrome.storage.local.get;
      chrome.storage.local.set = vi.fn(async (value: Record<string, unknown>) => {
        Object.assign(this.storageState, value);
      }) as unknown as typeof chrome.storage.local.set;
    },
  };

  const runtimeOnMessageListeners: Array<
    Parameters<typeof chrome.runtime.onMessage.addListener>[0]
  > = [];

  globalThis.chrome = {
    runtime: {
      onInstalled: {
        addListener: vi.fn(),
      },
      onMessage: {
        addListener: vi.fn((listener) => {
          runtimeOnMessageListeners.push(listener);
        }),
      },
      getManifest: vi.fn(() => ({
        version: '3.0.0',
        options_ui: {
          page: 'src/pages/options/index.html',
        },
      })),
      openOptionsPage: vi.fn(async () => {}),
      sendMessage: vi.fn(async () => ({ ok: true })),
      getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
    },
    tabs: {
      query: vi.fn(async () => []),
      sendMessage: vi.fn(async () => undefined),
      update: vi.fn(async () => undefined),
      create: vi.fn(async () => undefined),
      onRemoved: {
        addListener: vi.fn(),
      },
    },
    storage: {
      local: {
        get: vi.fn(async () => ({})),
        set: vi.fn(async () => undefined),
      },
    },
  } as unknown as typeof chrome;

  globalThis.__autocouponChromeMockControls = controls;
  controls.reset();

  return controls;
}

export function getChromeMockControls(): ChromeMockControls {
  if (!globalThis.__autocouponChromeMockControls) {
    return installChromeMock();
  }

  return globalThis.__autocouponChromeMockControls;
}

export function loadFixture(relativePath: string): string {
  return readFileSync(resolve('tests/fixtures', relativePath), 'utf8');
}

export async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}
