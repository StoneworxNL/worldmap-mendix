# Changelog

All notable changes to the World Map widget are documented in this file.

## [2.2.1] - 2026-10-20

### Changed

-   Updated react-svg-worldmap to 2.3.0 and @mendix/pluggable-widgets-tools to 11.15.0. The map looks and works the
    same: the library's new features (a disputed-territories overlay and the Equal Earth projection) are opt-in, and the
    widget doesn't use them.
-   Requires Mendix 11.12.5 or later, as 2.2.0 does. Building the widget now needs Node 22.18 or later.

## [2.2.0] - 2026-10-14

### Upgrading from 2.1.x

-   **Requires Mendix 11.12.5 or later**, the version this release is built and tested with. 2.1.1 and 2.1.2 required
    Mendix 10.21; apps on an earlier Mendix version can keep using 2.1.2.
-   Existing World Map widgets show "widget definition has changed": right-click the widget and choose Update widget, or
    use App → Update all widgets.
-   The new Value suffix starts empty, so tooltips look the same as before.
-   **Responsive maps can get bigger.** "Responsive" (the default size) now fills the full width of its container, with
    a height of 3/4 of the width. Before, it was capped at 75% of the smaller of the window's width and height. For
    example, in a 1400px wide container a responsive map is now 1400 × 1050px. To keep a map smaller, choose a fixed
    size (sm to xxl) or limit the width of its container.

### Added

-   "Value suffix" property: translatable text shown after the value in the country tooltip, e.g. "people". Empty by
    default.
-   Design-mode preview in Studio Pro: the map with sample countries, using the configured size, color and value suffix.
-   The widget's Class and Style properties are now applied to the map.
-   Unit tests (`npm test`).

### Changed

-   Tooltip values are formatted by Mendix in the user's language, with thousands separators.
-   The widget no longer needs to be placed in a data view.
-   Responsive maps fill the width of their container (see "Upgrading from 2.1.x").
-   Updated react-svg-worldmap to 2.1.0 and @mendix/pluggable-widgets-tools to 11.12.0.
-   Demo module re-exported with the release build of this version of the widget. It now requires Studio Pro 11.12.5 or
    later. Each demo map has its own value suffix, with English and Dutch texts. A new scheduled event restores the
    sample data every day at 03:00 UTC.

### Fixed

-   Integer, Long and Decimal values now shade countries according to their value.
-   Countries without an ISO code or value are skipped instead of skewing the shading or breaking the map. This includes
    text values with only spaces, and ISO codes the map doesn't know (e.g. "PRT"), which used to stretch the shading
    range.
-   If several objects have the same ISO code, the last one with a value is used, and the others no longer stretch the
    shading range.
-   An empty Color no longer turns highlighted countries black.
-   The map now updates when the Country ISO or Value attribute changes.
-   Long tooltips are no longer cut off on small maps, and the tooltip arrow no longer shows above the map before the
    first hover.
-   Removed a stray `console.log()` that printed an empty line on every data load.
