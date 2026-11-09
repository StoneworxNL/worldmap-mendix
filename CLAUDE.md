# World Map widget

Mendix pluggable widget (web) that wraps [react-svg-worldmap](https://github.com/yanivam/react-svg-worldmap). Public
repo, published on the Mendix Marketplace by Stoneworx.

## Build and test

-   Node 22 (22.18 or later). Install with `npm ci`.
-   `npm run lint`, `npm test` (Jest, `src/__tests__`), `npm run release` (production .mpk in `dist/<version>/`).
-   `npm run build` also copies the widget to the Mendix app at `config.projectPath` (`../../`); use `release` in CI.
-   The release output is `dist/<version>/stoneworx.WorldMap.mpk`. It contains `LICENSE` and the generated
    `dependencies.txt` with the license texts of bundled packages.

## Releasing a new version

Bump the version in both `package.json` and `src/package.xml`, add a `CHANGELOG.md` entry (Keep a Changelog style, with
upgrade notes when users must do something), and update the "Requirements" section of `README.md` if the minimum Mendix
version changes. The live demo is https://world-map-sandbox.mxapps.io/ (the demo app is not in this repo).

## Before you start

Check open PRs and branches first (`gh api repos/StoneworxNL/worldmap-mendix/pulls`) and build on them; work is often
already in progress there.

## Updating dependencies

-   `@mendix/pluggable-widgets-tools` 11.16 and later may migrate `package.json` itself on first run (React
    resolutions/overrides) and asks "Update dependencies?" interactively. Run a script once with `echo y |` to accept,
    then commit the result.
-   react-svg-worldmap's CHANGELOG is not always up to date; compare `dist/index.d.ts` between versions to see API
    changes. New library features are opt-in; the widget only uses `WorldMap` and `regions`.
-   React is provided by the Mendix runtime and is not bundled.

## Compliance

-   No secrets, credentials, internal URLs or customer data in the repo (CI runs gitleaks on the full history).
-   Bundled (production) dependencies must be MIT, ISC, BSD-2/3-Clause, 0BSD or Apache-2.0 (CI checks this).
-   react-svg-worldmap and react-path-tooltip don't ship a license file, so their MIT notice is copied into `LICENSE`.
    Keep it there, and add a notice the same way for any new bundled package without one.
