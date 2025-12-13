/**
 * AutoCoupon - Zentrale Typdefinitionen
 */

/**
 * Status eines einzelnen Coupons
 */
export type CouponStatus = "activated" | "already-active" | "unavailable";

/**
 * Ergebnis einer Coupon-Aktivierung
 */
export interface ActivationResult {
  status: CouponStatus;
  couponIndex: number;
  error?: string;
}

/**
 * Statistiken der Aktivierung
 */
export interface ActivationStats {
  activated: number;
  alreadyActive: number;
  unavailable: number;
  total: number;
}

/**
 * Progress-Typ für das Overlay
 */
export type ProgressType = "normal" | "error" | "success";

/**
 * Log-Level für den Logger
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Chrome Extension Message Actions
 */
export const MessageAction = {
  START_ACTIVATION: "START_ACTIVATION",
} as const;

export type MessageActionType =
  (typeof MessageAction)[keyof typeof MessageAction];

/**
 * Message-Struktur für Extension-Kommunikation
 */
export interface ExtensionMessage {
  action: MessageActionType;
}

/**
 * Response-Struktur für Extension-Kommunikation
 */
export interface ExtensionResponse {
  status: "started" | "error";
  message?: string;
}
