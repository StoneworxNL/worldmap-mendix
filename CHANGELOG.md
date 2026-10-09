# Changelog

All notable changes to the World Map widget are documented in this file.

## [2.2.0] - Unreleased

### Added

-   "Value suffix" property: translatable text shown after the value in the country tooltip, e.g. "people". Empty by
    default.
-   Design-mode preview in Studio Pro: the map with sample countries, using the configured size, color and value suffix.
-   The widget's Class and Style properties are now applied to the map.

### Changed

-   Tooltip values are formatted by Mendix in the user's language, with thousands separators.
-   The widget no longer needs to be placed in a data view.
-   Updated react-svg-worldmap to 2.1.0 and @mendix/pluggable-widgets-tools to 11.12.0.

### Fixed

-   Integer, Long and Decimal values now shade countries according to their value.
-   Countries without an ISO code or value are skipped instead of skewing the shading or breaking the map.
-   An empty Color no longer turns highlighted countries black.
-   The map now updates when the Country ISO or Value attribute changes.
-   Long tooltips are no longer cut off on small maps, and the tooltip arrow no longer shows above the map before the
    first hover.
-   Removed a stray `console.log()` that printed an empty line on every data load.
