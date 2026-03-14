import { getRuntimeUrl } from '../../platform/browser/browser';
import {
  BRANDING_ABOUT_COPY,
  BRAND_LOGO_PATH,
  BRAND_NAME,
  BUY_ME_A_COFFEE_LABEL,
  DEVELOPER_CREDIT,
  HOMEPAGE_LABEL,
  SUPPORT_LABEL,
} from '../../shared/config/branding';
import {
  BUY_ME_A_COFFEE_URL,
  HOMEPAGE_URL,
  SUPPORT_URL,
} from '../../shared/config/urls';

type BrandingVariant = 'compact' | 'full';

interface BrandingHeaderElements {
  logo: HTMLImageElement;
  eyebrow: HTMLElement;
  title: HTMLElement;
  subtitle: HTMLElement;
}

interface BrandingHeaderContent {
  eyebrow: string;
  subtitle: string;
}

interface BrandingLink {
  href: string;
  label: string;
}

const LINKS_BY_VARIANT: Record<BrandingVariant, BrandingLink[]> = {
  compact: [
    { href: HOMEPAGE_URL, label: HOMEPAGE_LABEL },
    { href: BUY_ME_A_COFFEE_URL, label: BUY_ME_A_COFFEE_LABEL },
  ],
  full: [
    { href: HOMEPAGE_URL, label: HOMEPAGE_LABEL },
    { href: SUPPORT_URL, label: SUPPORT_LABEL },
    { href: BUY_ME_A_COFFEE_URL, label: BUY_ME_A_COFFEE_LABEL },
  ],
};

export function applyBrandHeader(
  elements: BrandingHeaderElements,
  content: BrandingHeaderContent
): void {
  elements.logo.src = getRuntimeUrl(BRAND_LOGO_PATH);
  elements.logo.alt = `${BRAND_NAME} Logo`;
  elements.eyebrow.textContent = content.eyebrow;
  elements.title.textContent = BRAND_NAME;
  elements.subtitle.textContent = content.subtitle;
}

export function renderBrandingInfo(
  container: HTMLElement,
  variant: BrandingVariant
): void {
  const root = document.createElement('div');
  root.className = `branding-info branding-info--${variant}`;

  if (variant === 'full') {
    root.append(
      createBrandHead(),
      createParagraph('branding-copy', BRANDING_ABOUT_COPY)
    );
  }

  root.append(
    createParagraph('developer-credit', DEVELOPER_CREDIT),
    createLinks(LINKS_BY_VARIANT[variant])
  );

  container.replaceChildren(root);
}

function createBrandHead(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'branding-head';

  const logoShell = document.createElement('span');
  logoShell.className = 'brand-logo-shell';

  const logo = document.createElement('img');
  logo.className = 'brand-logo';
  logo.src = getRuntimeUrl(BRAND_LOGO_PATH);
  logo.alt = `${BRAND_NAME} Logo`;

  const text = document.createElement('p');
  text.className = 'branding-title';
  text.textContent = BRAND_NAME;

  logoShell.append(logo);
  wrapper.append(logoShell, text);

  return wrapper;
}

function createParagraph(className: string, textContent: string): HTMLElement {
  const paragraph = document.createElement('p');
  paragraph.className = className;
  paragraph.textContent = textContent;
  return paragraph;
}

function createLinks(links: BrandingLink[]): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'branding-links';

  links.forEach((link) => {
    const anchor = document.createElement('a');
    anchor.className = 'branding-link';
    anchor.href = link.href;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    anchor.textContent = link.label;
    wrapper.append(anchor);
  });

  return wrapper;
}
