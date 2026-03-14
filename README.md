# AutoCoupon

AutoCoupon ist eine lokale Browser-Erweiterung fuer Chrome und Firefox, die sichtbare Coupons auf `payback.de` sequenziell aktiviert. Die Erweiterung arbeitet direkt im Browser-Kontext, nutzt kein externes Backend und umgeht weder Login noch CAPTCHA noch andere Schutzmechanismen.

## Projektbeschreibung

- basiert fachlich auf `AutoCoupon-Android`
- arbeitet lokal auf der sichtbaren PAYBACK-Seite
- keine Telemetrie, keine Cookie- oder Token-Extraktion
- Popup fuer Start, Stop, Status und Statistik
- Options Page fuer Einstellungen, Schnellstart und Tutorial
- optionales In-Page-Overlay fuer Laufstatus und Stop-Funktion

## Installation aus dem GitHub-Release

Die einfachste Nutzung erfolgt ueber die ZIP-Dateien im Release:

- Chromium: `AutoCoupon-Chromium.zip`
- Firefox dauerhaft: signiertes `AutoCoupon-Firefox-<version>-signed.xpi`
- Firefox temporär/Test: `AutoCoupon-Firefox.zip`

Release-Seite:

- https://github.com/trixr1907/AutoCoupon/releases/tag/v3.0.3

### Chrome aus dem Release installieren

1. Auf der Release-Seite `AutoCoupon-Chromium.zip` herunterladen.
2. Die ZIP-Datei in einen normalen Ordner entpacken.
3. `chrome://extensions` oeffnen.
4. Den Entwicklermodus aktivieren.
5. `Entpackte Erweiterung laden` waehlen.
6. Den entpackten Chromium-Ordner auswaehlen.
7. Die Erweiterung optional an die Browser-Leiste anpinnen.

### Firefox dauerhaft aus dem Release installieren

1. Auf der Release-Seite das signierte Firefox-XPI `AutoCoupon-Firefox-<version>-signed.xpi` herunterladen, falls es bereits fuer diese Version vorhanden ist.
2. In Firefox `about:addons` oeffnen.
3. Im Erweiterungsbereich das Zahnrad-Menue oeffnen.
4. `Add-on aus Datei installieren...` waehlen.
5. Die heruntergeladene `.xpi`-Datei auswaehlen.
6. Die Installation bestaetigen.

Hinweis:

- Das ist die empfohlene Firefox-Variante fuer die normale Nutzung, sobald fuer die jeweilige Version ein signiertes XPI bereitliegt.
- Dafuer wird das von Mozilla signierte XPI verwendet.

### Firefox temporaer aus dem Release installieren

1. Auf der Release-Seite `AutoCoupon-Firefox.zip` herunterladen.
2. Die ZIP-Datei in einen normalen Ordner entpacken.
3. `about:debugging#/runtime/this-firefox` oeffnen.
4. `Temporäres Add-on laden...` waehlen.
5. Im entpackten Firefox-Ordner die Datei `manifest.json` auswaehlen.

Hinweis:

- Die Firefox-Installation auf diesem Weg ist in der Regel temporaer und muss nach einem Browser-Neustart erneut geladen werden.
- Fuer eine dauerhafte Firefox-Installation brauchst du ein von Mozilla signiertes XPI.
- Der signing-vorbereitete Workflow im Repository ist auf aktuelle Firefox-Versionen ausgelegt: Desktop ab 140+, Android ab 142+.
- Der vorbereitete Repo-Workflow dafuer steht in [docs/firefox-distribution.md](docs/firefox-distribution.md).

## Installation aus dem Quellcode

### Chrome

1. `npm install`
2. `npm run build`
3. `chrome://extensions` oeffnen
4. Entwicklermodus aktivieren
5. `Entpackte Erweiterung laden` waehlen
6. `dist/chromium` auswaehlen

### Firefox

1. `npm install`
2. `npm run build`
3. `about:debugging#/runtime/this-firefox` oeffnen
4. `Temporäres Add-on laden...` waehlen
5. `dist/firefox/manifest.json` auswaehlen

## Kurzanleitung

1. Erweiterung im Browser laden und anpinnen.
2. `https://www.payback.de/coupons` oeffnen.
3. Dich normal bei PAYBACK einloggen.
4. Das AutoCoupon-Popup oeffnen.
5. Einen Modus waehlen.
6. `Coupons aktivieren` starten.
7. Statistik im Popup oder Overlay beobachten.
8. Bei Bedarf `Aktivierung abbrechen`.
9. Einstellungen ueber die Options Page anpassen.

## Schritt-fuer-Schritt-Tutorial

### 1. Erweiterung installieren

Die Erweiterung wird lokal geladen und danach am besten direkt an die Browser-Leiste angepinnt.

![Browser mit installierter Erweiterung](docs/images/install-extension.png)

### 2. PAYBACK oeffnen und einloggen

Oeffne PAYBACK ganz normal im Browser und melde dich selbst an. AutoCoupon uebernimmt den Login nicht und greift nicht in Schutzabfragen ein.

### 3. Coupon-Seite oeffnen

Wechsle auf `https://www.payback.de/coupons` und warte kurz, bis die Seite sichtbar geladen ist.

### 4. Erweiterung oeffnen

Oeffne das Popup der Erweiterung. Dort siehst du sofort, ob die aktuelle Seite erkannt wurde und ob ein Start moeglich ist.

![Geoeffnetes Popup](docs/images/open-popup.png)

### 5. Aktivierungsmodus auswaehlen

Waehle den Modus, der am besten zu deiner Situation passt. Fuer die meisten Nutzer ist `Normal` die beste Wahl.

![Modusauswahl im Popup](docs/images/mode-selection.png)

### 6. Coupons automatisch aktivieren

Mit `Coupons aktivieren` startet der Lauf. AutoCoupon verarbeitet nur sichtbare Coupons lokal im Browser und prueft jeden Schritt nach.

![Laufende Aktivierung](docs/images/activation-running.png)

### 7. Ergebnis und Statistik verstehen

Nach dem Lauf siehst du, wie viele Coupons verarbeitet, aktiviert, uebersprungen oder nicht verfuegbar waren.

![Ergebnis und Statistik](docs/images/activation-result.png)

### 8. Aktivierung stoppen

Waehle `Aktivierung abbrechen`, wenn du den laufenden Durchgang sauber stoppen moechtest. Der Lauf endet dann kontrolliert als Abbruch und nicht als harter Fehler.

### 9. Einstellungen aendern

In der Options Page stellst du Standardmodus, Overlay und Debug-Logging ein. Dort findest du auch Schnellstart, Tutorial und Support-Links.

![Options Page mit Schnellstart und Tutorial](docs/images/options-page.png)

## Modi

### `normal`

- konservativ und am robustesten
- mit Klick-Verzoegerung und laengerer Verifikation
- beste Standardwahl

### `turbo`

- schneller als `normal`
- weiterhin mit kandidatenspezifischer Verifikation
- sinnvoll, wenn die Coupon-Seite stabil reagiert

### `turbo-extreme`

- schnellster Modus
- verarbeitet sichtbare Coupons in kleinen Bursts
- experimenteller als die anderen Modi

## Troubleshooting

### Popup zeigt `Login erforderlich`

- PAYBACK ist noch nicht eingeloggt
- oder eine Schutz-/Captcha-Seite ist aktiv
- Login bitte normal selbst abschliessen

### Popup zeigt `Nicht auf Coupon-Seite`

- oeffne `https://www.payback.de/coupons`
- warte kurz, bis die Seite vollstaendig sichtbar ist

### Popup zeigt `Layout derzeit nicht sicher lesbar`

- PAYBACK hat das Layout veraendert
- Seite neu laden und erneut pruefen
- wenn das Problem bleibt, Support kontaktieren

### Aktivierung laeuft nicht an

- pruefe, ob die Seite als `ready` erkannt wird
- pruefe, ob du dich bereits auf der Coupon-Seite befindest
- pruefe, ob ein anderer Lauf noch aktiv ist

### Overlay ist nicht sichtbar

- oeffne die Options Page
- aktiviere `In-Page-Overlay`
- lade die Coupon-Seite neu

## Branding, Support und Kontakt

- Entwickelt von Ivo
- Homepage: https://ivo-tech.com
- Support: https://ivo-tech.com/#contact
- Buy me a coffee: https://ko-fi.com/ivotech

Das Branding bleibt bewusst zurueckhaltend. Funktion, Statusanzeige und Bedienung haben immer Vorrang.

## Entwicklung und Checks

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

Firefox-spezifische Distributions-Skripte:

```bash
npm run build:firefox:selfhost
npm run lint:firefox
npm run package:firefox:source
npm run sign:firefox:unlisted
```

Build-Ausgaben:

- `dist/chromium`
- `dist/firefox`

## Architektur in Kurzform

```text
src/
  background/         Broker zwischen Popup und Content
  content/            PAYBACK-DOM-Logik, Runner, Session, Overlay
  pages/              Popup, Options und gemeinsame UI-Teile
  platform/           Browser-, Messaging- und Storage-Adapter
  shared/             Contracts, Konfiguration und Logging
tests/
  unit/
  integration/
  fixtures/payback/
```

Wichtige Regeln:

- Popup spricht nie direkt mit dem Content Script
- PAYBACK-Selektoren und Pattern leben nur unter `src/content/sites/payback`
- Browser-Unterschiede leben nur unter `src/platform/browser`
- Persistenz erfolgt nur ueber `storage.local`

## Referenzen

- Android-Fachreferenz: [MainActivity.kt](/home/ivo/projects/AutoCoupon-Android/app/src/main/java/com/ivotech/autocoupon/MainActivity.kt)
- Android-Fachreferenz: [injector.js](/home/ivo/projects/AutoCoupon-Android/app/src/main/assets/injector.js)
- Root-Cause-Analyse: [docs/root-cause-analysis.md](docs/root-cause-analysis.md)

## Lizenz

MIT
