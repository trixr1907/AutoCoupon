/**
 * AutoCoupon - Popup Script
 * Steuert das Extension-Popup und kommuniziert mit dem Content Script
 */

/**
 * Elemente-Referenzen
 */
interface PopupElements {
  activateBtn: HTMLButtonElement | null;
  statusText: HTMLElement | null;
  statusDot: HTMLElement | null;
  howtoToggle: HTMLButtonElement | null;
  howtoContent: HTMLElement | null;
}

/**
 * Status-Farben
 */
const STATUS_COLORS = {
  ready: '#22c55e',
  loading: '#eab308',
  error: '#ef4444',
} as const;

/**
 * Initialisiert das Popup
 */
function initPopup(): void {
  const elements = getElements();
  
  initHowToToggle(elements);
  initActivateButton(elements);
}

/**
 * Holt alle DOM-Elemente
 */
function getElements(): PopupElements {
  return {
    activateBtn: document.getElementById('activate-btn') as HTMLButtonElement | null,
    statusText: document.getElementById('status-text'),
    statusDot: document.getElementById('status-dot'),
    howtoToggle: document.getElementById('howto-toggle') as HTMLButtonElement | null,
    howtoContent: document.getElementById('howto-content'),
  };
}

/**
 * Initialisiert den How-To Toggle
 */
function initHowToToggle(elements: PopupElements): void {
  const { howtoToggle, howtoContent } = elements;
  
  if (!howtoToggle || !howtoContent) return;
  
  howtoToggle.addEventListener('click', () => {
    howtoToggle.classList.toggle('open');
    howtoContent.classList.toggle('show');
    
    const isOpen = howtoContent.classList.contains('show');
    const icon = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>`;
    
    howtoToggle.innerHTML = isOpen
      ? `${icon} Anleitung ausblenden`
      : `${icon} Anleitung anzeigen`;
  });
}

/**
 * Initialisiert den Aktivierungs-Button
 */
function initActivateButton(elements: PopupElements): void {
  const { activateBtn, statusText, statusDot } = elements;
  
  if (!activateBtn) return;
  
  activateBtn.addEventListener('click', async () => {
    await handleActivation(statusText, statusDot);
  });
}

/**
 * Behandelt den Aktivierungsvorgang
 */
async function handleActivation(
  statusText: HTMLElement | null,
  statusDot: HTMLElement | null
): Promise<void> {
  try {
    // Aktuellen Tab holen
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Prüfen ob auf Payback
    if (!tab.url?.includes('payback.de')) {
      updateStatus(statusText, statusDot, 'Bitte auf payback.de öffnen!', 'error');
      return;
    }
    
    if (!tab.id) {
      updateStatus(statusText, statusDot, 'Tab-Fehler', 'error');
      return;
    }
    
    const tabId = tab.id;
    
    // Status aktualisieren
    updateStatus(statusText, statusDot, 'Starte...', 'loading');
    
    // Message senden - einfacher String statt Konstante
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'START_ACTIVATION' });
      
      // Erfolg
      updateStatus(statusText, statusDot, 'Läuft! Schau auf die Seite.', 'ready');
      setTimeout(() => window.close(), 500);
      
    } catch {
      // Content Script nicht geladen - Seite neu laden
      updateStatus(statusText, statusDot, 'Lade Seite neu...', 'loading');
      await chrome.tabs.reload(tabId);
      
      // Warte und versuche nochmal
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      try {
        await chrome.tabs.sendMessage(tabId, { action: 'START_ACTIVATION' });
        updateStatus(statusText, statusDot, 'Läuft!', 'ready');
        setTimeout(() => window.close(), 500);
      } catch {
        updateStatus(statusText, statusDot, 'Bitte nochmal klicken', 'error');
      }
    }
    
  } catch (e) {
    console.error('Activation error:', e);
    updateStatus(statusText, statusDot, 'Fehler', 'error');
  }
}

/**
 * Aktualisiert den Status im UI
 */
function updateStatus(
  statusText: HTMLElement | null,
  statusDot: HTMLElement | null,
  text: string,
  state: keyof typeof STATUS_COLORS
): void {
  if (statusText) statusText.textContent = text;
  if (statusDot) statusDot.style.background = STATUS_COLORS[state];
}

// Initialisierung
document.addEventListener('DOMContentLoaded', initPopup);
