/**
 * DOM Utility functions for safely traversing Shadow DOMs
 */

/**
 * Finds all elements matching a selector, even within open Shadow Roots.
 * This is an expensive operation and should be used sparingly.
 */
export function querySelectorAllDeep(selector: string, root: Element | Document | ShadowRoot = document): Element[] {
  const results: Element[] = [];
  
  // Check current level
  const currents = root.querySelectorAll(selector);
  currents.forEach(el => results.push(el));
  
  // Traverse all elements at this level to find shadow roots
  const allElements = root.querySelectorAll('*');
  
  allElements.forEach(el => {
    if (el.shadowRoot) {
      results.push(...querySelectorAllDeep(selector, el.shadowRoot));
    }
  });
  
  return results;
}

/**
 * Tries to find an element within a specific shadow root path
 * @param path Array of selectors to traverse down through shadow roots
 */
export function findInShadowPath(root: Element | Document, path: string[]): Element | null {
  let current: Element | Document | ShadowRoot | null = root;
  
  for (const selector of path) {
    if (!current) return null;
    
    // If current is an element and has shadowRoot, switch to it
    if ('shadowRoot' in current && (current as Element).shadowRoot) {
      current = (current as Element).shadowRoot;
    }
    
    if (!current) return null;
    current = current.querySelector(selector);
  }
  
  return current as Element;
}

/**
 * Checks if an element is visible
 */
export function isVisible(elem: Element): boolean {
  if (!(elem instanceof HTMLElement)) return false;
  return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}
