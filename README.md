# AutoCoupon

AutoCoupon is a local browser extension for Chromium and Firefox that helps users activate visible coupons on PAYBACK coupon pages in sequence.

The extension runs entirely in the browser context. It has no backend, no telemetry, does not extract cookies or tokens, and does not bypass login, CAPTCHA, rate limits or other protection mechanisms. Users must log in manually and stay in control of the active browser session.

## What it does

- Detects supported PAYBACK coupon pages
- Processes visible coupon cards sequentially
- Shows run status in the popup and optional in-page overlay
- Supports conservative and faster activation modes
- Stores only local extension settings in `storage.local`
- Keeps browser-specific code isolated for Chromium and Firefox builds

## What it does not do

- No credential handling
- No CAPTCHA or protection bypass
- No cookie, token or account-data extraction
- No backend service
- No telemetry or remote tracking
- No broad browsing permissions outside the declared PAYBACK host permissions

## Installation from release builds

Release artifacts are published on the GitHub releases page:

- Chromium: `AutoCoupon-Chromium.zip`
- Firefox temporary/test build: `AutoCoupon-Firefox.zip`
- Firefox permanent install: signed `AutoCoupon-Firefox-<version>-signed.xpi` when available

Release page:

- https://github.com/trixr1907/AutoCoupon/releases/tag/v3.0.3

### Chromium

1. Download `AutoCoupon-Chromium.zip` from the release page.
2. Extract the archive into a normal folder.
3. Open `chrome://extensions`.
4. Enable developer mode.
5. Choose `Load unpacked`.
6. Select the extracted Chromium build folder.
7. Optionally pin the extension to the browser toolbar.

### Firefox temporary install

1. Download `AutoCoupon-Firefox.zip` from the release page.
2. Extract the archive into a normal folder.
3. Open `about:debugging#/runtime/this-firefox`.
4. Choose `Load Temporary Add-on...`.
5. Select `manifest.json` from the extracted Firefox build folder.

Temporary Firefox installs usually need to be loaded again after a browser restart. For permanent installation, use a Mozilla-signed XPI when available.

## Usage

1. Install and pin the extension.
2. Open `https://www.payback.de/coupons`.
3. Log in manually if required.
4. Open the AutoCoupon popup.
5. Choose an activation mode.
6. Start the run with `Activate coupons` / `Coupons aktivieren`.
7. Watch progress in the popup or overlay.
8. Stop the run at any time if needed.

## Activation modes

### `normal`

- Conservative default mode
- Uses delays and verification between steps
- Best choice for normal use

### `turbo`

- Faster than `normal`
- Still verifies candidate-specific state changes
- Useful when the page reacts reliably

### `turbo-extreme`

- Fastest mode
- Processes visible coupons in small bursts
- More experimental than the other modes

## Development

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

Build outputs:

- `dist/chromium`
- `dist/firefox`

Firefox-specific distribution helpers:

```bash
npm run build:firefox:selfhost
npm run lint:firefox
npm run package:firefox:source
npm run sign:firefox:unlisted
```

## Architecture

```text
src/
  background/         Broker between popup and content scripts
  content/            PAYBACK DOM adapter, runner, session and overlay
  pages/              Popup, options page and shared UI parts
  platform/           Browser, messaging and storage adapters
  shared/             Contracts, configuration and logging
tests/
  unit/
  integration/
  fixtures/payback/
```

Key rules:

- The popup never talks directly to the content script.
- PAYBACK selectors and page-specific logic stay under `src/content/sites/payback`.
- Browser differences stay under `src/platform/browser`.
- Persistence uses only extension-local storage.

## Related documentation

- Firefox distribution notes: [docs/firefox-distribution.md](docs/firefox-distribution.md)
- AMO unlisted submission notes: [docs/amo-unlisted-submission.md](docs/amo-unlisted-submission.md)
- Root-cause analysis: [docs/root-cause-analysis.md](docs/root-cause-analysis.md)

## Contact

- Website: https://ivo-tech.com
- Support: https://ivo-tech.com/#contact

## License

MIT, see [LICENSE](LICENSE).
