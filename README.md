# Payback-Coupon

## Übersicht

Dieses Projekt stellt ein Bookmarklet und ein UserScript bereit, um Payback-Coupons automatisch zu aktivieren.

## Versionen

- **Bookmarklet**: Schnell einsetzbar durch Speichern als Browser-Bookmark.
- **UserScript**: Vollautomatische Lösung für Tampermonkey/Greasemonkey.

## Installation

### Bookmarklet

1. Kopieren Sie den gesamten Inhalt aus `payback-coupon-activator-enhanced.js`.
2. Erstellen Sie ein neues Bookmark in Ihrem Browser.
3. Fügen Sie den Code als URL ein (mit dem `javascript:` Präfix).
4. Geben Sie dem Bookmark einen Namen wie "Payback Coupon Aktivator".

### UserScript

1. Kopieren Sie den Inhalt aus `payback-coupon-userscript.js`.
2. Öffnen Sie Ihr UserScript-Manager-Add-on (z.B. Tampermonkey).
3. Erstellen Sie ein neues Script und fügen Sie den Code ein.
4. Speichern Sie und aktivieren Sie das Script.

## Verwendung

1. Navigieren Sie zu einer Webseite mit aktivierbaren Coupons.
2. Klicken Sie auf das gespeicherte Bookmark oder das Userscript-Icon.
3. Das Script wird automatisch alle verfügbare Coupons aktivieren.
4. Fortschrittsanzeige und Meldung zeigt die Anzahl aktivierter Coupons.

## Troubleshooting

- Stellen Sie sicher, dass Sie auf der korrekten Coupon-Seite sind.
- Sollte kein Coupon gefunden werden, überprüfen Sie die Seitenstruktur.
- Versuchen Sie, die Seite neu zu laden, falls die Aktivierung fehlschlägt.

## Hinweise

- Funktioniert nur auf Webseiten mit der entsprechenden HTML-Struktur.
- Verwendet Shadow DOM-Navigation für moderne Web Components.
- Optimierte Performance und Benutzerfreundlichkeit.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
