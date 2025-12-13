/**
 * AutoCoupon - Overlay Widget
 * UI-Komponente für die Statusanzeige während der Aktivierung
 */

import { overlayStyles } from './styles';
import { createWidgetHTML } from './templates';
import { ProgressType } from '../types';
import { UI } from '../core/config';

/**
 * Overlay Widget Klasse
 */
export class Overlay {
  private readonly element: HTMLElement;
  private readonly progressBar: HTMLElement;
  private readonly statusElement: HTMLElement;
  private readonly activatedCountElement: HTMLElement;
  private readonly alreadyActiveCountElement: HTMLElement;
  private readonly unavailableCountElement: HTMLElement;
  private readonly turboToggle: HTMLInputElement;
  private readonly startBtn: HTMLButtonElement;
  
  constructor() {
    this.element = this.createWidget();
    
    // Element-Referenzen cachen
    this.progressBar = this.querySelector('.sota-progress-bar');
    this.statusElement = this.querySelector('.sota-status');
    this.activatedCountElement = this.querySelector('#activated-count');
    this.alreadyActiveCountElement = this.querySelector('#already-active-count');
    this.unavailableCountElement = this.querySelector('#unavailable-count');
    this.turboToggle = this.querySelector('#turbo-mode-toggle') as HTMLInputElement;
    this.startBtn = this.querySelector('#start-btn') as HTMLButtonElement;

    this.initTurboToggle();
  }

  /**
   * Helper für querySelector mit Fehlerbehandlung
   */
  private querySelector<T extends HTMLElement>(selector: string): T {
    const element = this.element.querySelector(selector) as T | null;
    if (!element) {
      throw new Error(`Element nicht gefunden: ${selector}`);
    }
    return element;
  }
  
  /**
   * Erstellt das Widget im DOM
   */
  private createWidget(): HTMLElement {
    // Alte Instanz entfernen
    const oldWidget = document.getElementById(UI.WIDGET_ID);
    if (oldWidget) oldWidget.remove();
    
    // Styles injizieren
    this.injectStyles();
    
    // Widget erstellen
    const widget = document.createElement('div');
    widget.id = UI.WIDGET_ID;
    widget.innerHTML = createWidgetHTML();
    
    document.body.appendChild(widget);
    
    // Animation triggern
    requestAnimationFrame(() => {
      widget.classList.add('visible');
    });
    
    return widget;
  }

  /**
   * Injiziert die Styles in den DOM
   */
  private injectStyles(): void {
    if (document.getElementById(UI.STYLES_ID)) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = UI.STYLES_ID;
    styleEl.textContent = overlayStyles;
    document.head.appendChild(styleEl);
  }

  /**
   * Initialisiert den Turbo-Toggle
   */
  private initTurboToggle(): void {
    this.turboToggle.addEventListener('change', () => {
      const label = this.element.querySelector('#turbo-label');
      label?.classList.toggle('active', this.turboToggle.checked);
    });
  }
  
  /**
   * Aktualisiert den Status-Text
   */
  public updateStatus(text: string): void {
    this.statusElement.textContent = text;
  }
  
  /**
   * Aktualisiert den Fortschrittsbalken
   */
  public updateProgress(percent: number, type: ProgressType = 'normal'): void {
    const clampedPercent = Math.max(0, Math.min(100, percent));
    this.progressBar.style.width = `${clampedPercent}%`;
    
    this.progressBar.classList.remove('error', 'success');
    if (type !== 'normal') {
      this.progressBar.classList.add(type);
    }
  }
  
  /**
   * Aktualisiert die Statistik-Anzeige
   */
  public updateStats(activated: number, alreadyActive: number, unavailable: number): void {
    this.activatedCountElement.textContent = String(activated);
    this.alreadyActiveCountElement.textContent = String(alreadyActive);
    this.unavailableCountElement.textContent = String(unavailable);
  }
  
  /**
   * Gibt das Root-Element zurück
   */
  public getElement(): HTMLElement {
    return this.element;
  }
  
  /**
   * Entfernt das Widget aus dem DOM
   */
  public remove(delay: number = 0): void {
    if (delay > 0) {
      setTimeout(() => this.remove(0), delay);
      return;
    }
    
    this.element.classList.remove('visible');
    
    setTimeout(() => {
      this.element.parentNode?.removeChild(this.element);
    }, UI.REMOVE_DELAY_MS);
  }

  /**
   * Prüft ob der Turbo-Modus aktiviert ist
   */
  public isTurboMode(): boolean {
    return this.turboToggle.checked;
  }

  /**
   * Wartet auf den Start-Button-Klick
   */
  public waitForStart(): Promise<void> {
    return new Promise(resolve => {
      this.startBtn.classList.add('visible');
      this.startBtn.onclick = () => {
        this.startBtn.classList.remove('visible');
        resolve();
      };
    });
  }

  /**
   * Zeigt den Support-Bereich an
   */
  public showSupportSection(): void {
    const supportSection = this.element.querySelector('#support-section');
    if (supportSection) {
      supportSection.classList.add('visible');
    }
  }
}
