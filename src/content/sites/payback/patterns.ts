export const ACTION_SELECTOR =
  'button, [role="button"], a[href], input[type="button"], input[type="submit"]';

export const SEMANTIC_CONTAINER_SELECTOR = [
  'article',
  '[role="article"]',
  '[role="listitem"]',
  'li',
  'section',
].join(', ');

export const PREFERRED_CONTAINER_SELECTOR = [
  '[data-testid*="coupon" i]',
  '[data-qa*="coupon" i]',
  '[class*="coupon" i]',
  '[id*="coupon" i]',
  'article',
  '[role="article"]',
  '[role="listitem"]',
  'li',
].join(', ');

export const CONTAINER_SELECTOR = [
  '[data-testid*="coupon" i]',
  '[data-qa*="coupon" i]',
  '[class*="coupon" i]',
  '[id*="coupon" i]',
  SEMANTIC_CONTAINER_SELECTOR,
].join(', ');

export const ACTIVATE_PATTERNS = [
  /\baktivieren\b/i,
  /\bjetzt aktivieren\b/i,
  /\bcoupon aktivieren\b/i,
] as const;

export const REDEEM_PATTERNS = [
  /\beinlösen\b/i,
  /\bvor ort einlösen\b/i,
  /\bonline einlösen\b/i,
] as const;

export const ALREADY_ACTIVE_PATTERNS = [
  /\bbereits aktiviert\b/i,
  /\bist aktiviert\b/i,
  /\baktiviert\b/i,
  /\bbereits aktiv\b/i,
] as const;

export const UNAVAILABLE_PATTERNS = [
  /\bin kürze\b/i,
  /\bdemnächst\b/i,
  /\bbald verfügbar\b/i,
  /\bnicht verfügbar\b/i,
  /\babgelaufen\b/i,
  /\bbeendet\b/i,
  /\bvorbei\b/i,
] as const;

export const LOGIN_PATTERNS = [
  /\beinloggen\b/i,
  /\blogin\b/i,
  /\bkundennummer\b/i,
  /\be-mail oder kundennummer\b/i,
] as const;

export const CAPTCHA_PATTERNS = [/\bcaptcha\b/i, /\brecaptcha\b/i] as const;

export const COUPON_SURFACE_PATTERNS = [
  /\bcoupon\b/i,
  /\bcoupons\b/i,
  /\brabatt\b/i,
  /\bpunkte\b/i,
  /\boffer\b/i,
  /\be-coupon\b/i,
] as const;

export const COUPON_HINT_PATTERNS = [
  /\bcoupon\b/i,
  /\bvoucher\b/i,
  /\boffer\b/i,
  /\brabatt\b/i,
  /\bpunkte\b/i,
  /\be-coupon\b/i,
] as const;

export function matchesAny(
  text: string,
  patterns: readonly RegExp[]
): boolean {
  return patterns.some((pattern) => pattern.test(text));
}
