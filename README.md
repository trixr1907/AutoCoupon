# Payback-Coupon

## Installation

1. Kopieren Sie den gesamten Inhalt aus `payback-coupon-activator.js`
2. Erstellen Sie ein neues Bookmark in Ihrem Browser
3. Fügen Sie den Code als URL ein (mit dem `javascript:` Präfix)
4. Geben Sie dem Bookmark einen Namen wie "Payback Coupon Aktivator"

## Verwendung

1. Navigieren Sie zu einer Webseite mit aktivierbaren Coupons
2. Klicken Sie auf das gespeicherte Bookmark
3. Das Script wird automatisch alle verfügbaren Coupons aktivieren
4. Nach 2 Sekunden erscheint eine Meldung mit der Anzahl aktivierter Coupons
5. Sie werden gefragt, ob Sie die Seite neu laden möchten

## Funktionsweise

Das Script:
- Sucht nach dem `pb-coupon-center` Element
- Durchläuft alle `pbc-coupon` Elemente im Shadow DOM
- Klickt auf verfügbare "Aktivieren"-Buttons (`.not-activated`)
- Zeigt eine Zusammenfassung der aktivierten Coupons an

## Hinweise

- Funktioniert nur auf Webseiten mit der entsprechenden HTML-Struktur
- Verwendet Shadow DOM-Navigation für moderne Web Components
- Wartet 2 Sekunden nach der Aktivierung, um dem Server Zeit zu geben
