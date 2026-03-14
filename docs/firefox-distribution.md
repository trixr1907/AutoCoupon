# Firefox-Distribution

AutoCoupon kann in Firefox dauerhaft installiert werden, aber dafuer reicht `about:debugging` nicht aus. Die temporaere Testinstallation ueber `about:debugging#/runtime/this-firefox` verschwindet nach einem Browser-Neustart.

Der dauerhafte Weg in normalem Firefox ist ein von Mozilla signiertes Add-on.

Wichtig fuer dieses Repository:

- der signing-vorbereitete Manifest-Pfad ist auf aktuelle Firefox-Versionen ausgelegt
- Desktop: Firefox 140+
- Android: Firefox 142+

Das ist noetig, damit die von Mozilla geforderte `data_collection_permissions`-Angabe fuer signierte Add-ons lint-sauber und konsistent im Manifest vorhanden ist.

## Empfohlener Weg

Fuer dieses Projekt ist zunaechst `unlisted` Self-Distribution der einfachste realistische Weg:

1. Das Add-on bleibt ausserhalb des AMO-Verzeichnisses.
2. Mozilla signiert das Paket.
3. Du verteilst das signierte `.xpi` selbst, zum Beispiel ueber GitHub Releases oder deine Website.
4. Nutzer koennen dieses signierte Paket dauerhaft in Firefox installieren.

## Voraussetzungen

- Mozilla-/AMO-Konto
- AMO API-Key und API-Secret
- gesetzte Umgebungsvariablen:

```bash
export WEB_EXT_API_KEY="..."
export WEB_EXT_API_SECRET="..."
```

Annahme:

- Das Projekt wird zunaechst fuer Desktop-Firefox signiert und verteilt. Android-Unterstuetzung bleibt technisch mit vorbereitet, ist aber nicht der primaere Distributionspfad.

## Lokale Vorbereitung

```bash
npm install
npm run check
```

## Unsigned Self-Hosted Testpaket bauen

Damit pruefst du zuerst nur die Paketstruktur:

```bash
npm run build:firefox:selfhost
```

Ergebnis:

- Ausgabe unter `packages/firefox-selfhost/`

Hinweis:

- Dieses Paket ist ohne Mozilla-Signierung noch keine dauerhafte Installationsloesung fuer normalen Firefox.

## Source-Code-Paket fuer Mozilla vorbereiten

Fuer manuelle Mozilla-Uploads ist ein separates Source-Paket sinnvoll, damit der gebuendelte Vite-Build nachvollziehbar pruefbar bleibt:

```bash
npm run package:firefox:source
```

Ergebnis:

- Ausgabe unter `packages/firefox-source/`

Die vorbereiteten Upload-Dateien und Reviewer-Texte sind in [docs/amo-unlisted-submission.md](./amo-unlisted-submission.md) zusammengefasst.

## Firefox-Linting

```bash
npm run lint:firefox
```

Das hilft, offensichtliche Firefox-/Manifest-Probleme vor dem Signieren zu finden.

## Signiertes unlisted XPI erzeugen

```bash
npm run sign:firefox:unlisted
```

Ergebnis:

- signiertes Paket unter `packages/firefox-signed/`

Dieses signierte `.xpi` ist die Basis fuer eine dauerhafte Firefox-Installation ausserhalb von `about:debugging`.

## Verteilung des signierten XPI

Sobald das signierte Paket vorliegt, kannst du es zum Beispiel so verteilen:

- GitHub Release
- eigene Website
- direkter Download-Link

Praktisch wichtig:

- Hosting ueber HTTPS
- saubere Dateiendung `.xpi`
- fuer Endnutzer klar kennzeichnen, dass es das signierte Firefox-Paket ist

## Oeffentliche AMO-Listung

Wenn du die Erweiterung spaeter direkt im offiziellen Firefox Add-ons Store anbieten willst, ist der naechste Schritt eine `listed`-Einreichung ueber AMO statt reiner Self-Distribution.

Das ist sinnvoll, wenn du:

- einfache Endnutzer-Installation willst
- automatische Update-Verteilung ueber Firefox willst
- eine oeffentliche Store-Seite moechtest

## Repo-Status

Der Repo-Workflow ist fuer Firefox bereits vorbereitet:

- `browser_specific_settings.gecko.id` ist gesetzt
- Firefox-Build wird separat erzeugt
- `web-ext`-basierte Build-/Lint-/Sign-Skripte sind vorhanden

## Referenzen

- Mozilla Add-ons: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons
- Signing & Distribution Overview: https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/
- Self-Distribution: https://extensionworkshop.com/documentation/publish/self-distribution/
