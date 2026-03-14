import { afterEach, beforeEach, vi } from 'vitest';
import { getChromeMockControls, installChromeMock } from './test-utils';

installChromeMock();

beforeEach(() => {
  getChromeMockControls().reset();

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  document.documentElement.innerHTML = '<head></head><body></body>';
  window.history.replaceState({}, '', 'https://www.payback.de/coupons');

  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    writable: true,
    value: 0,
  });

  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: 900,
  });

  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    writable: true,
    value: 900,
  });

  Object.defineProperty(document.body, 'scrollHeight', {
    configurable: true,
    writable: true,
    value: 900,
  });

  window.scrollTo = vi.fn((options?: number | ScrollToOptions, y?: number) => {
    if (typeof options === 'number') {
      window.scrollY = y ?? 0;
      return;
    }

    window.scrollY = options?.top ?? 0;
  });

  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});
