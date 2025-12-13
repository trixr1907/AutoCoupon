/**
 * AutoCoupon - Overlay Templates
 * HTML Templates für das Overlay Widget
 */

/**
 * Haupt-Widget HTML
 */
export function createWidgetHTML(): string {
  return `
    <div class="sota-card">
      <div class="sota-header">
        <div class="sota-icon">🎯</div>
        <div class="sota-title-group">
          <div class="sota-title">AutoCoupon</div>
          <div class="sota-status">Initialisierung...</div>
        </div>
      </div>
      
      <div class="sota-toggle-container">
        <span class="sota-toggle-label" id="turbo-label">⚡ Turbo (Risiko)</span>
        <label class="sota-toggle">
          <input type="checkbox" id="turbo-mode-toggle">
          <span class="sota-slider"></span>
        </label>
      </div>

      <button id="start-btn" class="sota-btn">🚀 Aktivierung Starten</button>

      <div class="sota-progress-container">
        <div class="sota-progress-bar"></div>
      </div>
      
      <div class="sota-stats-grid three-cols">
        <div class="sota-stat-item success">
          <div class="sota-stat-value" id="activated-count">0</div>
          <div class="sota-stat-label">Neu aktiviert</div>
        </div>
        <div class="sota-stat-item neutral">
          <div class="sota-stat-value" id="already-active-count">0</div>
          <div class="sota-stat-label">Bereits aktiv</div>
        </div>
        <div class="sota-stat-item warning">
          <div class="sota-stat-value" id="unavailable-count">0</div>
          <div class="sota-stat-label">Nicht verfügbar</div>
        </div>
      </div>

      <!-- Support-Bereich (wird nach Abschluss eingeblendet) -->
      <div class="sota-support-section" id="support-section">
        <div class="sota-support-title">🎉 Hat dir AutoCoupon geholfen?</div>
        <div class="sota-support-text">Unterstütze die Entwicklung mit einem Kaffee!</div>
        <div class="sota-support-buttons">
          <a href="https://ko-fi.com/ivotech" target="_blank" class="sota-support-btn kofi">
            ☕ Ko-fi
          </a>
          <a href="https://ivo-tech.com" target="_blank" class="sota-support-btn website">
            🌐 Website
          </a>
        </div>
      </div>
      
      <div class="sota-disclaimer">
        Privates Assistenz-Tool. Nutzung auf eigene Verantwortung.<br>
        Nicht für kommerzielle Zwecke.
      </div>
    </div>
  `;
}
