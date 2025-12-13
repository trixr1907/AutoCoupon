document.addEventListener('DOMContentLoaded', () => {
  const activateBtn = document.getElementById('activate-btn');
  const statusText = document.getElementById('status-text');
  const statusDot = document.getElementById('status-dot');
  const howtoToggle = document.getElementById('howto-toggle');
  const howtoContent = document.getElementById('howto-content');

  // How-To Toggle
  if (howtoToggle && howtoContent) {
    howtoToggle.addEventListener('click', () => {
      howtoToggle.classList.toggle('open');
      howtoContent.classList.toggle('show');
      howtoToggle.innerHTML = howtoContent.classList.contains('show') 
        ? `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg> Anleitung ausblenden`
        : `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg> Anleitung anzeigen`;
    });
  }

  // Activate Button
  if (activateBtn) {
    activateBtn.addEventListener('click', async () => {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url?.includes('payback.de')) {
        if (statusText) statusText.textContent = 'Bitte auf payback.de öffnen!';
        if (statusDot) statusDot.style.background = '#ef4444';
        return;
      }
      
      if (tab.id) {
        try {
          if (statusText) statusText.textContent = 'Starte Aktivierung...';
          if (statusDot) statusDot.style.background = '#eab308';
          
          await chrome.tabs.sendMessage(tab.id, { action: 'START_ACTIVATION' });
          
          if (statusText) statusText.textContent = 'Läuft! Schau auf die Seite.';
          if (statusDot) statusDot.style.background = '#22c55e';
          
          // Close popup after short delay
          setTimeout(() => window.close(), 800);
        } catch (e) {
          console.error('Connection error:', e);
          if (statusText) statusText.textContent = 'Fehler: Seite neu laden?';
          if (statusDot) statusDot.style.background = '#ef4444';
        }
      }
    });
  }
});
