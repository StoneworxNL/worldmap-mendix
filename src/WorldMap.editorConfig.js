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
export function getProperties(values, defaultProperties, target) {
    if (!values.zoomEnabled) {
        hideProperties(defaultProperties, ["zoomMaxScale", "zoomShowControls", "showCountryLabels", "labelColor"]);
    } else if (!values.showCountryLabels) {
        hideProperties(defaultProperties, ["labelColor"]);
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
    if (values.zoomEnabled && values.zoomMaxScale != null && values.zoomMaxScale < 2) {
        errors.push({ property: "zoomMaxScale", message: "Maximum zoom must be 2 or more." });
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
