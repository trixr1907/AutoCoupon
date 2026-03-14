# AMO Unlisted Submission

Diese Datei bereitet den manuellen Upload fuer Mozilla `unlisted` vor.

## Dateien fuer den Upload

Erweiterungspaket:

- `packages/firefox-selfhost/autocoupon-<version>.zip`

Source-Code-Paket:

- `packages/firefox-source/autocoupon-firefox-source-<version>.zip`

Hinweis:

- Auf der Upload-Seite waehlst du zuerst das Erweiterungspaket aus.
- Falls Mozilla im weiteren Verlauf das Source-Paket anfordert, nutze das vorbereitete Source-Archiv.
- Das signierte Endergebnis von Mozilla wird spaeter ein `.xpi`.
- Fuer die Endnutzer-Verteilung wird dieses signierte `.xpi` bevorzugt, nicht das Upload-ZIP.

## Kurzbeschreibung

AutoCoupon is a local Firefox extension for PAYBACK coupon pages. It helps the user activate visible coupons directly in the browser after a normal manual login. The extension has no backend, no telemetry, and does not extract cookies or tokens.

## Produktseite fuellen

Fuer die Produktseite auf AMO kannst du diese Werte verwenden.

Sprache:

- `Deutsch` als Standard-Sprache fuer die Produktseite
- Reviewer Notes trotzdem auf `Englisch`

Name:

```text
AutoCoupon
```

Zusammenfassung:

```text
Lokale PAYBACK-Hilfe zur sequenziellen Coupon-Aktivierung direkt im Firefox-Browser.
```

Beschreibung:

```text
AutoCoupon ist eine lokale Firefox-Erweiterung fuer PAYBACK-Coupon-Seiten.

Die Erweiterung hilft dabei, sichtbare Coupons direkt im Browser nacheinander zu aktivieren, nachdem der Nutzer sich ganz normal selbst bei PAYBACK eingeloggt hat.

Wichtige Eigenschaften:
- lokale DOM-Automatisierung im Browser
- kein Backend
- keine Telemetrie
- keine Cookie- oder Token-Extraktion
- keine Umgehung von Login, CAPTCHA oder Schutzmechanismen

Funktionsumfang:
- Erkennung der PAYBACK-Coupon-Seite
- Modusauswahl: Normal, Turbo, Turbo Extreme
- sequentielle Aktivierung sichtbarer Coupons
- Status, Fortschritt und Statistik
- Stop-Funktion
- Options Page fuer Einstellungen und Schnellstart

AutoCoupon arbeitet ausschliesslich auf den freigegebenen PAYBACK-Hosts und speichert nur lokale Erweiterungs-Einstellungen.
```

Homepage:

```text
https://ivo-tech.com
```

Spenden-URL:

```text
https://ko-fi.com/ivotech
```

Tags:

- bei `unlisted` optional
- wenn du sie setzen willst, dann sparsam und neutral
- Empfehlung: leer lassen

Lizenz:

- `MIT`

## Notes for Mozilla Reviewers

Use this text in English for the reviewer notes:

```text
AutoCoupon is a local browser helper for https://www.payback.de/coupons .

Important behavior:
- It only runs on payback.de pages declared in host_permissions.
- The user must log in manually on PAYBACK.
- The add-on does not bypass login, CAPTCHA, rate limits, or other protection mechanisms.
- It has no backend, no remote API, no telemetry, and does not read or export cookies or tokens.
- It stores only local extension settings in storage.local.

Architecture:
- Popup -> Background -> Content messaging only
- Static content script on payback.de
- No broad browsing permissions, no cookies permission, no identity permission, no webRequest permission

What the add-on does:
- Detects whether the current page is a supported PAYBACK coupon page
- Scans visible coupon cards in the page DOM
- Sequentially clicks coupon activation buttons locally in the page context
- Verifies the result after each interaction
- Lets the user stop the run at safe cancellation points

Testing notes:
- Main functionality is available after a normal user login on https://www.payback.de/coupons
- No special backend or private API is required
- Because this add-on works on a third-party user account page, I cannot provide Mozilla with PAYBACK account credentials
- The source archive contains the full TypeScript/Vite project and build scripts
```

## Permissions Statement

```text
Permissions used:
- storage

Host permissions:
- https://www.payback.de/*
- https://*.payback.de/*

Reason:
- storage is used only for local settings and the last local run summary
- host permissions are limited to PAYBACK because the content script only operates on PAYBACK pages
```

## Optional Developer Comment

Wenn Mozilla nach dem Zweck fragt, kannst du kurz so antworten:

```text
This add-on is intended as a local helper for users who manually browse PAYBACK in Firefox and want a browser-native alternative to a previous Android companion implementation.
```

## Nach dem Upload

Wenn Mozilla das Paket akzeptiert und signiert:

1. lade das signierte `.xpi` herunter
2. lege es in einen neuen GitHub Release oder auf deine Website
3. verlinke fuer Firefox kuenftig direkt auf das signierte `.xpi`
4. behalte das unsignierte Upload-ZIP nur als internen Build-Schritt
