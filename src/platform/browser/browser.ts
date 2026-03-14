type BrowserApi = typeof chrome;

type GlobalWithOptionalBrowser = typeof globalThis & {
  browser?: BrowserApi;
  chrome?: BrowserApi;
};

export const browserApi = (
  (globalThis as GlobalWithOptionalBrowser).browser ??
  (globalThis as GlobalWithOptionalBrowser).chrome
) as BrowserApi;

export type RuntimeMessageListener = Parameters<
  typeof chrome.runtime.onMessage.addListener
>[0];

export async function queryActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await browserApi.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tabs[0];
}

export async function sendRuntimeMessage<TRequest, TResponse>(
  message: TRequest
): Promise<TResponse> {
  return (await browserApi.runtime.sendMessage(message)) as TResponse;
}

export async function sendMessageToTab<TRequest, TResponse>(
  tabId: number,
  message: TRequest
): Promise<TResponse> {
  return (await browserApi.tabs.sendMessage(tabId, message)) as TResponse;
}

export async function updateTab(
  tabId: number,
  updateProperties: chrome.tabs.UpdateProperties
): Promise<chrome.tabs.Tab> {
  return (await browserApi.tabs.update(
    tabId,
    updateProperties
  )) as chrome.tabs.Tab;
}

export async function createTab(
  createProperties: chrome.tabs.CreateProperties
): Promise<chrome.tabs.Tab> {
  return (await browserApi.tabs.create(
    createProperties
  )) as chrome.tabs.Tab;
}

export async function openOptionsPage(): Promise<void> {
  if (typeof browserApi.runtime.openOptionsPage === 'function') {
    await browserApi.runtime.openOptionsPage();
    return;
  }

  const manifest = browserApi.runtime.getManifest();
  const page = manifest.options_ui?.page ?? manifest.options_page;
  if (page) {
    await createTab({ url: browserApi.runtime.getURL(page) });
  }
}

export function getRuntimeUrl(path: string): string {
  if (typeof browserApi?.runtime?.getURL === 'function') {
    return browserApi.runtime.getURL(path);
  }

  return `/${path.replace(/^\/+/, '')}`;
}

export function getManifestVersion(fallback = '0.0.0'): string {
  return browserApi?.runtime?.getManifest?.().version ?? fallback;
}

export function addRuntimeMessageListener(
  listener: RuntimeMessageListener
): void {
  browserApi.runtime.onMessage.addListener(listener);
}

export function extractTabId(tab: chrome.tabs.Tab | undefined): number | null {
  return typeof tab?.id === 'number' ? tab.id : null;
}

export function extractWindowId(
  tab: chrome.tabs.Tab | undefined
): number | null {
  return typeof tab?.windowId === 'number' ? tab.windowId : null;
}

export function isPaybackUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'www.payback.de' ||
      parsed.hostname.endsWith('.payback.de')
    );
  } catch {
    return false;
  }
}
