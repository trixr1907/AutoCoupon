# Root Cause Analysis

## Kurzfassung

Die frühere Aktivierungslogik war direkt an eine veraltete PAYBACK-Implementierung mit offenen Shadow-DOM-Web-Components gekoppelt. Der sichtbare Stand vom **11. März 2026** zeigt dagegen eine Next.js/MUI-basierte Coupon-Oberfläche und einen Login-Redirect mit reCAPTCHA für ausgeloggte Nutzer. Dadurch waren die alten Selektoren und Traversierungsannahmen nicht mehr belastbar.

## Primäre Ursache

Die bisherige Implementierung erwartete:

- `pb-coupon-center`
- `pbc-coupon`
- `pbc-coupon-call-to-action`
- offene `shadowRoot`-Zugriffe

Diese Struktur ist heute nicht mehr die sichere Baseline. Sobald die Seite keine passenden Custom Elements oder keine offenen Shadow Roots mehr liefert, findet der Aktivator weder das Coupon-Center noch die CTA-Buttons.

## Verstärkende technische Schulden

### 1. Einmaliger Scan mit fixer Wartezeit

Es gab nur einen einzigen Scan nach einer fixen Initial-Wartezeit. Das ist auf SPA-/Lazy-Loading-Seiten fragil, weil Coupons später nachgeladen oder umgerendert werden können.

### 2. Gecachte DOM-Referenzen

Die frühere Logik verarbeitete eine statische `Element[]`. Bei React-/SPA-Rerendern werden solche Referenzen schnell stale.

### 3. Zu harte Button- und Statusannahmen

Status und Klickbarkeit wurden stark über spezifische Klassen/Labels abgeleitet. Kleine DOM- oder Textänderungen konnten die Erkennung brechen.

### 4. Unzureichende Seitenerkennung

Das Popup behandelte PAYBACK-Seiten zu grob als startbar. Login-/Redirect-/Schutzseiten wurden nicht sauber als Blocker kommuniziert.

## Neue Gegenmaßnahmen

- Seitenerkennung vor jedem Start: `ready`, `login-required`, `unsupported-page`, `unsupported-layout`, `busy`
- Heuristische Candidate-Erkennung über sichtbare Interaktionen, Container-Hints, ARIA/Text und Coupon-Kontext
- Rescan nach jedem Aktivierungsversuch
- Scroll/Rescan für Lazy Loading
- Verifikation des Statuswechsels nach dem Klick
- Legacy-Shadow-DOM-Fallback nur noch ergänzend, nicht mehr als Primärpfad
- Saubere Abbrüche auf Login-/CAPTCHA-/Schutzseiten

## Nicht implementiert

Bewusst **nicht** umgesetzt:

- CAPTCHA- oder Login-Umgehung
- Skripting gegen Anti-Bot-Mechanismen
- automatisierte Umgehung von Rate-Limits oder Sperrmechanismen
