/**
 * AutoCoupon - Logger
 * Zentrales Logging-Modul mit konfigurierbarem Log-Level
 */

import { LogLevel } from '../types';
import { DEBUG } from '../core/config';

class Logger {
  private level: LogLevel = DEBUG.ENABLED ? LogLevel.DEBUG : LogLevel.ERROR;
  private readonly prefix: string = DEBUG.PREFIX;

  /**
   * Setzt das Log-Level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Debug-Nachricht (nur im Debug-Modus)
   */
  debug(...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.prefix, ...args);
    }
  }

  /**
   * Info-Nachricht
   */
  info(...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.prefix, ...args);
    }
  }

  /**
   * Warnung
   */
  warn(...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.prefix, ...args);
    }
  }

  /**
   * Fehler
   */
  error(...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.prefix, ...args);
    }
  }

  /**
   * Erfolg-Nachricht (grün im Debug-Modus)
   */
  success(...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.prefix, '✓', ...args);
    }
  }

  /**
   * Fehler-Nachricht (rot im Debug-Modus)
   */
  fail(...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.prefix, '✗', ...args);
    }
  }
}

/**
 * Singleton-Instanz des Loggers
 */
export const logger = new Logger();
