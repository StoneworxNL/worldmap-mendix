/**
 * @typedef Property
 * @type {object}
 * @property {string} key
 * @property {string} caption
 * @property {string} description
 * @property {string[]} objectHeaders
 * @property {ObjectProperties[]} objects
 * @property {Properties[]} properties
 */

/**
 * @typedef ObjectProperties
 * @type {object}
 * @property {PropertyGroup[]} properties
 * @property {string[]} captions
 */

/**
 * @typedef PropertyGroup
 * @type {object}
 * @property {string} caption
 * @property {PropertyGroup[]} propertyGroups
 * @property {Property[]} properties
 */

/**
 * @typedef Properties
 * @type {PropertyGroup}
 */

/**
 * @typedef Problem
 * @type {object}
 * @property {string} property
 * @property {("error" | "warning" | "deprecation")} severity
 * @property {string} message
 * @property {string} studioMessage
 * @property {string} url
 * @property {string} studioUrl
 */

/**
 * @param {object} values
 * @param {Properties} defaultProperties
 * @param {("web"|"desktop")} target
 * @returns {Properties}
 */
// Keep in sync with the clamp in components/WorldMapComponent.jsx.
const MIN_ZOOM = 2;
const MAX_ZOOM = 20;

export function getProperties(values, defaultProperties, target) {
    if (!values.zoomEnabled) {
        hideProperties(defaultProperties, [
            "zoomMaxScale",
            "zoomShowControls",
            "showCountryLabels",
            "labelColor",
            "detailedBorders",
            "detailedBordersMinScale"
        ]);
    } else {
        if (!values.showCountryLabels) {
            hideProperties(defaultProperties, ["labelColor"]);
        }
        if (!values.detailedBorders) {
            hideProperties(defaultProperties, ["detailedBordersMinScale"]);
        }
    }
    if (!values.regionsEnabled) {
        hideProperties(defaultProperties, [
            "regionMinScale",
            "regionUrl",
            "regionCountries",
            "regionNameProperty",
            "onRegionStatusChange"
        ]);
    }
    if (!values.pinList) {
        hideProperties(defaultProperties, ["pinLatitude", "pinLongitude", "pinCaption", "pinColor"]);
    }
    return defaultProperties;
}

function hideProperties(propertyGroups, keys) {
    for (const group of propertyGroups) {
        group.properties = group.properties?.filter(property => !keys.includes(property.key));
        if (group.propertyGroups) {
            hideProperties(group.propertyGroups, keys);
        }
    }
}

/**
 * @param {Object} values
 * @returns {Problem[]} returns a list of problems.
 */
export function check(values) {
    /** @type {Problem[]} */
    const errors = [];
    if (
        values.zoomEnabled &&
        values.zoomMaxScale != null &&
        (values.zoomMaxScale < MIN_ZOOM || values.zoomMaxScale > MAX_ZOOM)
    ) {
        errors.push({
            property: "zoomMaxScale",
            message: `Maximum zoom must be between ${MIN_ZOOM} and ${MAX_ZOOM}.`
        });
    }
    const maxScale = values.zoomMaxScale ?? 8;
    for (const [key, caption, enabled] of [
        ["detailedBordersMinScale", "Detailed borders from zoom", values.zoomEnabled && values.detailedBorders],
        ["regionMinScale", "Regions from zoom", values.zoomEnabled && values.regionsEnabled]
    ]) {
        const scale = values[key];
        if (enabled && scale != null && (scale < 1 || scale > maxScale)) {
            errors.push({
                property: key,
                severity: "warning",
                message: `${caption} must be between 1 and the maximum zoom (${maxScale}); the nearest of those is used.`
            });
        }
    }
    if (values.regionsEnabled && !values.zoomEnabled) {
        errors.push({
            property: "regionsEnabled",
            severity: "warning",
            message: "Regions are only drawn when zoomed in. Turn on Zoom and pan on the Zoom tab."
        });
    }
    if (values.regionsEnabled && !values.regionUrl?.trim()) {
        errors.push({ property: "regionUrl", message: "Enter the Region data URL, with {code} for the country code." });
    } else if (values.regionsEnabled && !/\{code\}/i.test(values.regionUrl)) {
        errors.push({
            property: "regionUrl",
            severity: "warning",
            message: "The Region data URL has no {code}, so every country loads the same file."
        });
    }
    if (values.pinList && !values.zoomEnabled) {
        errors.push({
            property: "pinList",
            severity: "warning",
            message:
                "Zoom and pan is off, so pins that overlap another pin or its caption stay hidden. Turn on zoom, or use short captions and few pins."
        });
    }
    if (values.pinList) {
        for (const [key, caption] of [
            ["pinLatitude", "Latitude"],
            ["pinLongitude", "Longitude"]
        ]) {
            if (!values[key]) {
                errors.push({ property: key, message: `Select the ${caption} attribute for the pins.` });
            }
        }
    }
    return errors;
}

// /**
//  * @param {object} values
//  * @param {boolean} isDarkMode
//  * @param {number[]} version
//  * @returns {object}
//  */
// export function getPreview(values, isDarkMode, version) {
//     // Customize your pluggable widget appearance for Studio Pro.
//     return {
//         type: "Container",
//         children: []
//     };
// }

// /**
//  * @param {Object} values
//  * @param {("web"|"desktop")} platform
//  * @returns {string}
//  */
// export function getCustomCaption(values, platform) {
//     return "WorldMap";
// }
