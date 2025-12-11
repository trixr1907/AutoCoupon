import { styles } from './styles';

export class Overlay {
  private element: HTMLElement;
  private progressBar: HTMLElement;
  private statusElement: HTMLElement;
  private activatedCountElement: HTMLElement;
  private skippedCountElement: HTMLElement;
  
  constructor() {
    this.element = this.createWidget();
    this.progressBar = this.element.querySelector('.sota-progress-bar') as HTMLElement;
    this.statusElement = this.element.querySelector('.sota-status') as HTMLElement;
    this.activatedCountElement = this.element.querySelector('#activator-count') as HTMLElement;
    this.skippedCountElement = this.element.querySelector('#skipped-count') as HTMLElement;
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
        
        <div class="sota-progress-container">
          <div class="sota-progress-bar"></div>
        </div>
        
        <div class="sota-stats-grid">
          <div class="sota-stat-item">
            <div class="sota-stat-value" id="activator-count">0</div>
            <div class="sota-stat-label">Aktiviert</div>
          </div>
          <div class="sota-stat-item">
            <div class="sota-stat-value" id="skipped-count">0</div>
            <div class="sota-stat-label">Bereit</div>
          </div>
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
  
  public updateStats(activated: number, skipped: number) {
    this.activatedCountElement.textContent = activated.toString();
    this.skippedCountElement.textContent = skipped.toString();
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
}
