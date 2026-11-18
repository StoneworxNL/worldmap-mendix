import { createFailedDetailResult, createReadyDetailResult, createUnavailableDetailResult } from "react-svg-worldmap";

// Turns the widget's "Countries with regions" text ("US, ca;BR") into a set of upper-case ISO codes. Empty: undefined,
// meaning every country.
export function parseCountryCodes(text) {
    const codes = (text ?? "")
        .split(/[\s,;]+/)
        .map(code => code.trim().toUpperCase())
        .filter(Boolean);
    return codes.length > 0 ? new Set(codes) : undefined;
}

// The app's root URL (Mendix's global mx.remoteUrl), so that "regions/{code}.json" also works on pages like /p/home.
const appRoot = () => window.mx?.remoteUrl || "/";

export function regionUrlFor(template, countryCode) {
    const url = template.trim().replace(/\{code\}/gi, encodeURIComponent(countryCode));
    return /^([a-z][a-z\d+.-]*:)?\/\//i.test(url) || url.startsWith("/") ? url : appRoot() + url;
}

// Whether a ring of [longitude, latitude] points runs clockwise (with north up), by the sign of its planar area.
function isClockwise(ring) {
    let sum = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        sum += (ring[i][0] - ring[j][0]) * (ring[i][1] + ring[j][1]);
    }
    return sum > 0;
}

// GeoJSON (RFC 7946) runs exterior rings counter-clockwise, d3 (which draws the map) expects them clockwise, and files
// in the wild use either. Rewind every polygon to d3's order: exterior clockwise, holes counter-clockwise. With the
// wrong order, d3 treats a region as the whole globe minus the region. The first ring is the exterior.
function rewindPolygon(rings) {
    return rings.map((ring, i) => (isClockwise(ring) === (i === 0) ? ring : [...ring].reverse()));
}

function toRegionGeometry(geometry) {
    if (geometry?.type === "Polygon") {
        return { type: "Polygon", coordinates: rewindPolygon(geometry.coordinates) };
    }
    if (geometry?.type === "MultiPolygon") {
        return { type: "MultiPolygon", coordinates: geometry.coordinates.map(rewindPolygon) };
    }
    return undefined;
}

// Reads one country's regions from a GeoJSON FeatureCollection (or a single Feature). Features that aren't polygons
// are skipped.
export function toRegionCollection(geoJson, countryCode, nameProperty) {
    const features = geoJson?.type === "Feature" ? [geoJson] : geoJson?.features ?? [];
    const regions = features.flatMap((feature, index) => {
        const geometry = toRegionGeometry(feature?.geometry);
        if (!geometry) {
            return [];
        }
        const properties = feature.properties ?? {};
        const name = properties[nameProperty || "name"] ?? properties.name ?? "";
        return [{ id: `${countryCode}-${feature.id ?? index}`, countryCode, name: String(name), geometry }];
    });
    return { countryCode, regions };
}

/**
 * A react-svg-worldmap DetailProvider that loads each country's regions from `urlTemplate`, once per country.
 * A 404 means the country has no regions ("unavailable"); other errors are "failed".
 */
export function createRegionProvider({ urlTemplate, countryCodes, nameProperty }) {
    return {
        supports: countryCode => countryCodes === undefined || countryCodes.has(countryCode.toUpperCase()),
        loadRegions: async countryCode => {
            const code = countryCode.toUpperCase();
            let response;
            try {
                response = await fetch(regionUrlFor(urlTemplate, code));
            } catch (error) {
                return createFailedDetailResult(code, String(error));
            }
            if (response.status === 404) {
                return createUnavailableDetailResult(code, `No region data for ${code}.`);
            }
            if (!response.ok) {
                return createFailedDetailResult(code, `Loading regions for ${code} failed: HTTP ${response.status}.`);
            }
            try {
                const collection = toRegionCollection(await response.json(), code, nameProperty);
                return collection.regions.length > 0
                    ? createReadyDetailResult(collection)
                    : createUnavailableDetailResult(code, `The region data for ${code} has no polygons.`);
            } catch {
                return createFailedDetailResult(code, `The region data for ${code} isn't valid GeoJSON.`);
            }
        }
    };
}
