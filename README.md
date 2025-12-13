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

## 🛠️ Installation & Setup (Für Entwickler)

Du möchtest das Projekt selbst bauen oder weiterentwickeln? Hier ist der "Zero to Hero" Guide.

### Voraussetzungen
- [Node.js](https://nodejs.org/) (Version 18+ empfohlen)
- Git

### 1. Repository klonen
```bash
git clone https://github.com/trixr1907/Payback-Coupon.git
cd Payback-Coupon
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Icons generieren (Wichtig!)
Das Projekt benötigt Icons, die aus dem `master-icon.png` generiert werden. Führe diesen Schritt **einmalig** aus:
```bash
npm run generate-icons
```
*Falls dieser Schritt fehlschlägt, stelle sicher, dass `master-icon.png` im Hauptverzeichnis liegt.*

### 4. Build erstellen
Erstelle die produktive Version der Extension:
```bash
npm run build
```
Dies erstellt einen Ordner **`dist/`** mit allen notwendigen Dateien.

---

## 🌍 Installation im Browser

### Chrome / Edge / Brave
1. Öffne `chrome://extensions`.
2. Aktiviere den **Entwicklermodus** (Developer Mode) oben rechts.
3. Klicke auf **"Entpackte Erweiterung laden"** (Load unpacked).
4. Wähle den Ordner **`Payback-Coupon/dist`** aus (nicht den Hauptordner!).

### Firefox
1. Öffne `about:debugging#/runtime/this-firefox`.
2. Klicke auf **"Temporäres Add-on laden..."**.
3. Wähle die Datei **`Payback-Coupon/dist/manifest.json`** aus.
*(Für einen permanenten Firefox-Build nutze `npm run build:firefox`)*

---

## 📖 Nutzung
1. Gehe auf [payback.de/coupons](https://www.payback.de/coupons).
2. Logge dich ein.
3. Klicke auf das **Payback Activator Icon** in deiner Toolbar.
4. Drücke **"Coupons Aktivieren"**.
5. Lehne dich zurück und genieße die Show! 🍿

---

## 🤝 Contributing
Beiträge sind willkommen! Bitte erstelle ein Issue oder einen Pull Request.
Schau dir auch [CONTRIBUTING.md](CONTRIBUTING.md) an.

## 📄 Lizenz
MIT License - siehe [LICENSE](LICENSE) Datei.

---
*Made with ❤️ by Ivo Tech*
