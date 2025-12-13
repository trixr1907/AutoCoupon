# 🎯 Payback Coupon Activator (SOTA Edition)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![Type](https://img.shields.io/badge/type-Browser%20Extension-orange.svg)

> **State of the Art (SOTA) Coupon Activation.**  
> Automatische Aktivierung aller Payback-Coupons mit einem Klick. Entwickelt von **Ivo Tech**.

## ✨ Features

- **🚀 One-Click Activation:** Aktiviert hunderte Coupons in Sekunden.
- **🛡️ Smart & Safe:** Nutzt "Human-Like"-Delays und Shadow-DOM-Traversal für maximale Kompatibilität.
- **🎨 Modern UI:** Ein Overlay, das sich sehen lassen kann (Neon/Glassmorphism Design).
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
4. Drücke **"Coupons Aktivieren"**.
5. Lehne dich zurück und genieße die Show! 🍿

---

## 🛠️ Für Entwickler

Du möchtest das Projekt selbst bauen oder weiterentwickeln?

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
├── core/          # Aktivierungs-Logik
├── entry/         # Extension Entry Points
└── ui/            # Overlay & Styles
```

</details>

---

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstelle ein Issue oder einen Pull Request.

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei.

---
*Made with ❤️ by Ivo Tech*
