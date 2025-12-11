# 🚀 Payback Activator (Ivo Tech Edition)

![Version](https://img.shields.io/badge/version-2.0.0-cyan.svg?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-purple.svg?style=flat-square) ![Made By](https://img.shields.io/badge/Made%20by-IVO%20TECH-orange.svg?style=flat-square)

**Premium Coupon Aktivator im Synthwave Design**

Ein hochentwickeltes Browser-Tool für maximalen Komfort auf Payback.de. Verwandelt die Coupon-Seite in ein modernes Dashboard. Automatisches Aktivieren aller Coupons mit einem Klick.

---

## ✨ Features

*   **💎 Ivo Tech Design**: Komplettes visuelles One-Click-Interface im stylishen Neon/Synthwave Look.
*   **⚡ One-Click Activation**: Aktiviert Dutzende Coupons in Sekundenschnelle.
*   **🤖 Smart Detection**: Das Icon leuchtet nur auf, wenn du dich auf der Payback-Seite befindest.
*   **🔒 Privacy First**: Läuft 100% lokal in deinem Browser. Keine Daten werden an extrene Server gesendet.
*   **🦊 Multi-Browser**: Verfügbar für Google Chrome, Microsoft Edge und Mozilla Firefox.

---

## 📦 Installation

Da dies ein exklusives Developer-Tool ist, installieren wir es direkt über den Entwicklermodus. Keine Sorge, das dauert nur 1 Minute.

### Option A: Google Chrome & Microsoft Edge

1.  Lade [diesen Ordner](dist/) herunter (oder nutze den `dist` Ordner aus dem Build).
2.  Öffne Chrome und gehe zuAdresse: `chrome://extensions`.
3.  Aktiviere oben rechts den **Entwicklermodus**.
4.  Klicke auf **"Entpackte Erweiterung laden"**.
5.  Wähle den Ordner `dist` aus.
6.  Fertig! Das Icon erscheint oben rechts. 🚀

### Option B: Mozilla Firefox

1.  Lade [diesen Ordner](dist-firefox/) herunter (oder nutze den `dist-firefox` Ordner aus dem Build).
2.  Öffne Firefox und gehe zur Adresse: `about:debugging`.
3.  Klicke links auf **"Dieser Firefox"**.
4.  Klicke auf **"Temporäres Add-on laden..."**.
5.  Wähle eine beliebige Datei aus dem `dist-firefox` Ordner (z.B. `manifest.json`).
6.  Fertig! 🦊

---

## 🛠️ Development

Willst du den Code selbst bearbeiten? Hier ist dein Quickstart-Guide.

**Voraussetzungen:**
*   Node.js installiert

```bash
# Repo klonen
git clone https://github.com/dein-user/payback-activator.git
cd payback-activator

# Abhängigkeiten installieren
npm install

# Icons generieren (benötigt master-icon.png)
npm run generate-icons

# Chrome Build erstellen
npm run build

# Firefox Build erstellen
npm run build:firefox
```

Die fertigen Builds landen in `dist/` (Chrome) und `dist-firefox/` (Firefox).

---

## 📝 Lizenz

Dieses Projekt ist unter der MIT Lizenz veröffentlicht.
Code & Design by **Ivo Tech**.

---
*Disclaimer: Dieses Tool steht in keiner offiziellen Verbindung zu Payback. Nutzung auf eigene Verantwortung.*
