import { styles } from './styles';

export class Overlay {
  private element: HTMLElement;
  private progressBar: HTMLElement;
  private statusElement: HTMLElement;
  private activatedCountElement: HTMLElement;
  private alreadyActiveCountElement: HTMLElement;
  private unavailableCountElement: HTMLElement;
  private turboToggle: HTMLInputElement;
  private startBtn: HTMLButtonElement;
  
  constructor() {
    this.element = this.createWidget();
    this.progressBar = this.element.querySelector('.sota-progress-bar') as HTMLElement;
    this.statusElement = this.element.querySelector('.sota-status') as HTMLElement;
    this.activatedCountElement = this.element.querySelector('#activated-count') as HTMLElement;
    this.alreadyActiveCountElement = this.element.querySelector('#already-active-count') as HTMLElement;
    this.unavailableCountElement = this.element.querySelector('#unavailable-count') as HTMLElement;
    this.turboToggle = this.element.querySelector('#turbo-mode-toggle') as HTMLInputElement;
    this.startBtn = this.element.querySelector('#start-btn') as HTMLButtonElement;

    this.turboToggle.addEventListener('change', () => {
      const label = this.element.querySelector('#turbo-label');
      if (this.turboToggle.checked) {
        label?.classList.add('active');
      } else {
        label?.classList.remove('active');
      }
    });
  }
  
  private createWidget(): HTMLElement {
    // Remove old instance if exists
    const oldWidget = document.getElementById('payback-sota-widget');
    if (oldWidget) oldWidget.remove();
    
    // Inject styles
    if (!document.getElementById('payback-sota-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'payback-sota-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }
    
    const widget = document.createElement('div');
    widget.id = 'payback-sota-widget';
    widget.innerHTML = `
      <div class="sota-card">
        <div class="sota-header">
          <div class="sota-icon">🎯</div>
          <div class="sota-title-group">
            <div class="sota-title">Payback Activator</div>
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


        
        <div class="sota-disclaimer">
          Privates Assistenz-Tool. Nutzung auf eigene Verantwortung.<br>
          Nicht für kommerzielle Zwecke.
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    // Trigger animation next frame
    requestAnimationFrame(() => {
      widget.classList.add('visible');
    });
    
    return widget;
  }
  
  public updateStatus(text: string) {
    this.statusElement.textContent = text;
  }
  
  public updateProgress(percent: number, type: 'normal' | 'error' | 'success' = 'normal') {
    this.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    
    this.progressBar.classList.remove('error', 'success');
    if (type !== 'normal') {
      this.progressBar.classList.add(type);
    }
  }
  
  public updateStats(activated: number, alreadyActive: number, unavailable: number) {
    this.activatedCountElement.textContent = activated.toString();
    this.alreadyActiveCountElement.textContent = alreadyActive.toString();
    this.unavailableCountElement.textContent = unavailable.toString();
  }
  
  public getElement(): HTMLElement {
    return this.element;
  }
  
  public remove(delay: number = 0) {
    if (delay > 0) {
      setTimeout(() => this.remove(0), delay);
      return;
    }
    
    this.element.classList.remove('visible');
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 500);
  }

  public isTurboMode(): boolean {
    return this.turboToggle.checked;
  }

  public waitForStart(): Promise<void> {
    return new Promise(resolve => {
      this.startBtn.classList.add('visible');
      this.startBtn.onclick = () => {
        this.startBtn.classList.remove('visible');
        resolve();
      };
    });
  }
}
