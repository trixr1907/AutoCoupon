# 🎯 AutoCoupon

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.1.0-green.svg)
![Type](https://img.shields.io/badge/type-Accessibility%20Tool-orange.svg)
![Unofficial](https://img.shields.io/badge/status-UNOFFICIAL-red.svg)

> [!CAUTION]
> **RECHTLICHER HINWEIS / HAFTUNGSAUSSCHLUSS**
> 
> ⚠️ **Dieses Projekt ist ein rein privates Hobbyprojekt und steht in KEINER Verbindung zu Bonusprogramm-Anbietern oder deren Partnern.**
> 
> Dieses Tool ist ein reines **Browser-Hilfsmittel (Accessibility Tool)** für Nutzer, die Schwierigkeiten haben, hunderte kleine Buttons manuell zu klicken (z.B. aufgrund motorischer Einschränkungen).
>
> - **Die Nutzung erfolgt ausdrücklich auf eigene Gefahr.**
> - Es werden keine Sicherheitsmechanismen umgangen. Das Tool klickt lediglich Buttons im sichtbaren Browser-Fenster, so wie es ein Mensch tun würde.
> - **Durch die Nutzung dieses Tools verstoßen Sie möglicherweise gegen die AGB des jeweiligen Anbieters.**
> - Der Entwickler übernimmt **keine Haftung** für gesperrte Accounts, verlorene Punkte oder sonstige Schäden.

## ✨ Features

- **🚀 Bedienungshilfe:** Aktiviert Coupons nacheinander, um mühsames Klicken zu ersparen.
- **🛡️ Menschliche Interaktion:** Simuliert natürliche Maus-Klicks mit zufälligen Verzögerungen.
- **🎨 Modern UI:** Übersichtliches Overlay zur Statusanzeige.
- **🔒 Privacy First:** Läuft 100% lokal. Keine Daten verlassen deinen Browser.

---

## ⚡ Schnellinstallation (Für Nutzer)

**Kein Node.js, kein Git erforderlich!**

### Chrome / Edge / Brave

1. **[⬇️ Download Chrome Version](https://github.com/trixr1907/AutoCoupon/releases/latest/download/AutoCoupon-Chrome.zip)**
2. ZIP entpacken
3. `chrome://extensions` öffnen → **Entwicklermodus** aktivieren
4. **"Entpackte Erweiterung laden"** → Entpackten Ordner wählen

### Firefox

1. **[⬇️ Download Firefox Version](https://github.com/trixr1907/AutoCoupon/releases/latest/download/AutoCoupon-Firefox.zip)**
2. ZIP entpacken
3. `about:debugging#/runtime/this-firefox` öffnen
4. **"Temporäres Add-on laden..."** → `manifest.json` im Ordner wählen

---

## 📖 Nutzung

1. Gehe auf die Coupon-Seite deines Bonusprogramms (z.B. payback.de/coupons).
2. Logge dich ein.
3. Klicke auf das **AutoCoupon Icon** in deiner Toolbar.
4. Das Tool beginnt, die Coupons in menschlicher Geschwindigkeit zu aktivieren.
5. Lehne dich zurück! ☕

---

## ☕ Unterstützen

Gefällt dir das Projekt? Dann unterstütze mich gerne!

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20me-ff5e5b?logo=ko-fi&logoColor=white)](https://ko-fi.com/ivotech)

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
git clone https://github.com/trixr1907/AutoCoupon.git
cd AutoCoupon
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
*Made with ❤️ by [Ivo Tech](https://ivo-tech.com) for Accessibility*
