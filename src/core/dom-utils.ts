/**
 * AutoCoupon - DOM Utilities
 * Hilfsfunktionen für die sichere Traversierung von Shadow DOMs
 */

type SearchRoot = Element | Document | ShadowRoot;

/**
 * Findet alle Elemente die einem Selector entsprechen, auch in Shadow DOMs.
 * Dies ist eine teure Operation und sollte sparsam verwendet werden.
 */
export function querySelectorAllDeep(
  selector: string,
  root: SearchRoot = document
): Element[] {
  const results: Element[] = [];
  
  // Aktuelle Ebene prüfen
  const currents = root.querySelectorAll(selector);
  currents.forEach((el: Element) => results.push(el));
  
  // Alle Elemente auf dieser Ebene durchsuchen
  const allElements = root.querySelectorAll('*');
  
  allElements.forEach((el: Element) => {
    if (el.shadowRoot) {
      results.push(...querySelectorAllDeep(selector, el.shadowRoot));
    }
  });
  
  return results;
}

/**
 * Versucht ein Element in einem spezifischen Shadow Root Pfad zu finden
 * @param path Array von Selektoren zum Durchtraversieren
 */
export function findInShadowPath(
  root: SearchRoot,
  path: string[]
): Element | null {
  let current: SearchRoot | null = root;
  
  for (const selector of path) {
    if (!current) return null;
    
    // Wenn current ein Element mit shadowRoot ist, wechsle dorthin
    if ('shadowRoot' in current) {
      const element = current as Element;
      if (element.shadowRoot) {
        current = element.shadowRoot;
      }
    }
    
    if (!current) return null;
    current = current.querySelector(selector);
  }
  
  return current as Element | null;
}

/**
 * Prüft ob ein Element sichtbar ist
 */
export function isVisible(elem: Element): boolean {
  if (!(elem instanceof HTMLElement)) return false;
  return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}

/**
 * Wartet auf ein Element im DOM (inkl. Shadow DOMs)
 * @param selector Der Selector zum Suchen
 * @param timeoutMs Maximale Wartezeit in ms
 * @param root Das Root-Element zum Suchen
 */
export function waitForElementDeep(
  selector: string,
  timeoutMs: number = 5000,
  root: SearchRoot = document
): Promise<Element | null> {
  return new Promise((resolve) => {
    // 1. Sofort versuchen
    const initialFind = querySelectorAllDeep(selector, root);
    if (initialFind.length > 0) {
      return resolve(initialFind[0]);
    }

    // 2. Alle 200ms prüfen
    const intervalId = setInterval(() => {
      const el = querySelectorAllDeep(selector, root);
      if (el.length > 0) {
        clearInterval(intervalId);
        resolve(el[0]);
      }
    }, 200);

    // 3. Timeout
    setTimeout(() => {
      clearInterval(intervalId);
      resolve(null);
    }, timeoutMs);
  });
}
