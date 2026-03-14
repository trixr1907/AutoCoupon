# Contributing

Beiträge sind willkommen, solange das Projekt ein lokales Accessibility-Tool bleibt.

## Erwarteter Ablauf

```bash
npm install
npm run check
npm run build
```

## Beiträge sollen

- keine Schutzmechanismen umgehen
- die gemeinsame Chrome-/Firefox-Codebasis erhalten
- PAYBACK-spezifische DOM-Logik nur unter `src/content/sites/payback` ändern
- Browser-Unterschiede nur unter `src/platform/browser` kapseln
- Tests und Doku mit aktualisieren, wenn Verhalten geändert wird

## Vor einem Pull Request

- `npm run check` muss lokal grün sein
- relevante Unit-/Integrationstests ergänzen, wenn Adapter, Runner, Messaging oder Storage geändert werden
- README oder `docs/root-cause-analysis.md` aktualisieren, wenn Annahmen zur Zielseite geändert werden
