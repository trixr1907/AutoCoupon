
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('activate-btn');
  const statusEl = document.getElementById('status-display');

  if (btn) {
    btn.addEventListener('click', async () => {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.id) {
        // Send message to content script
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'START_ACTIVATION' });
          if (statusEl) statusEl.textContent = 'Gestartet!';
          window.close(); // Close popup when started
        } catch (e) {
          if (statusEl) statusEl.textContent = 'Fehler: Nicht auf Payback.de?';
          console.error('Connection error:', e);
        }
      }
    });
  }
});
