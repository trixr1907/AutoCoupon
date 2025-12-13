# 🎯 Payback Coupon Activator (Assistenz-Edition)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.1.0-green.svg)
![Type](https://img.shields.io/badge/type-Accessibility%20Tool-orange.svg)
![Unofficial](https://img.shields.io/badge/status-UNOFFICIAL-red.svg)

> [!CAUTION]
> **RECHTLICHER HINWEIS / HAFTUNGSAUSSCHLUSS**
> 
> ⚠️ **Dieses Projekt ist ein rein privates Hobbyprojekt und steht in KEINER Verbindung zur PAYBACK GmbH oder deren Partnern.**
> 
> Dieses Tool ist ein reines **Browser-Hilfsmittel (Accessibility Tool)** für Nutzer, die Schwierigkeiten haben, hunderte kleine Buttons manuell zu klicken (z.B. aufgrund motorischer Einschränkungen).
>
> - **Die Nutzung erfolgt ausdrücklich auf eigene Gefahr.**
> - Es werden keine Sicherheitsmechanismen umgangen. Das Tool klickt lediglich Buttons im sichtbaren Browser-Fenster, so wie es ein Mensch tun würde.
> - **Durch die Nutzung dieses Tools verstoßen Sie möglicherweise gegen die Allgemeinen Geschäftsbedingungen (AGB) von Payback.**
> - Der Entwickler übernimmt **keine Haftung** für gesperrte Accounts, verlorene Punkte oder sonstige Schäden, die durch die Nutzung entstehen.

## ✨ Features

- **🚀 Bedienungshilfe:** Aktiviert Coupons nacheinander, um mühsames Klicken zu ersparen.
- **🛡️ Menschliche Interaktion:** Simuliert natürliche Maus-Klicks mit zufälligen Verzögerungen.
- **🎨 Modern UI:** Übersichtliches Overlay zur Statusanzeige.
- **🔒 Privacy First:** Läuft 100% lokal. Keine Daten verlassen deinen Browser.

---

## ⚡ Schnellinstallation (Für Nutzer)

**Kein Node.js, kein Git erforderlich!**

### Chrome / Edge / Brave

1. **[⬇️ Download Chrome Version](https://github.com/trixr1907/Payback-Coupon/releases/latest/download/Payback-Activator-Chrome.zip)**
2. ZIP entpacken
3. `chrome://extensions` öffnen → **Entwicklermodus** aktivieren
4. **"Entpackte Erweiterung laden"** → Entpackten Ordner wählen

### Firefox

1. **[⬇️ Download Firefox Version](https://github.com/trixr1907/Payback-Coupon/releases/latest/download/Payback-Activator-Firefox.zip)**
2. ZIP entpacken
3. `about:debugging#/runtime/this-firefox` öffnen
4. **"Temporäres Add-on laden..."** → `manifest.json` im Ordner wählen

---

## 📖 Nutzung

1. Gehe auf [payback.de/coupons](https://www.payback.de/coupons).
2. Logge dich ein.
3. Klicke auf das **Payback Activator Icon** in deiner Toolbar.
4. Das Tool beginnt, die Coupons in menschlicher Geschwindigkeit zu aktivieren.
5. Lehne dich zurück! ☕

---

## 🛠️ Für Entwickler / Forschung

Du möchtest den Code analysieren oder weiterentwickeln?

<details>
<summary><strong>Entwickler-Setup anzeigen</strong></summary>

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 18+)
- Git

### Setup

```bash
git clone https://github.com/trixr1907/Payback-Coupon.git
cd Payback-Coupon
npm install
npm run generate-icons
npm run build          # Für Chrome/Edge
npm run build:firefox  # Für Firefox
```

### Projektstruktur

```
src/
├── core/          # Aktivierungs-Logik (Simulierte Interaktion)
├── entry/         # Extension Entry Points
└── ui/            # Overlay & Styles
```

</details>

---

## 🤝 Contributing

Beiträge zur Verbesserung der Sicherheit und Accessibility sind willkommen.

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei.

---
*Made with ❤️ for Accessibility*
