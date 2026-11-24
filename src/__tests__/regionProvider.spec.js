import {
    createRegionProvider,
    parseCountryCodes,
    regionUrlFor,
    toRegionCollection
} from "../components/regionProvider";
import { geoArea } from "d3-geo";
import { regions } from "react-svg-worldmap";
import { toAlpha3 } from "../components/countryCodes";

// A 1x1 degree square, counter-clockwise (the GeoJSON order), with a counter-clockwise hole.
const square = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0]
];
const hole = [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.75, 0.75],
    [0.25, 0.75],
    [0.25, 0.25]
];

const featureCollection = features => ({ type: "FeatureCollection", features });
const response = (status, body) => ({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

afterEach(() => {
    delete global.fetch;
    delete window.mx;
});

describe("parseCountryCodes", () => {
    it("reads codes separated by commas, semicolons or spaces, in any case", () => {
        expect(parseCountryCodes(" us, ca;BR  nl ")).toEqual(new Set(["US", "CA", "BR", "NL"]));
    });

    it("returns undefined (every country) when empty", () => {
        expect(parseCountryCodes("")).toBeUndefined();
        expect(parseCountryCodes(" , ")).toBeUndefined();
        expect(parseCountryCodes(undefined)).toBeUndefined();
    });
});

describe("regionUrlFor", () => {
    it("replaces {code} and resolves relative addresses against the app's root URL", () => {
        window.mx = { remoteUrl: "https://app.example.com/" };

        expect(regionUrlFor("regions/{code}.geojson", "NL")).toBe("https://app.example.com/regions/NL.geojson");
        expect(regionUrlFor("/regions/{CODE}.json", "NL")).toBe("/regions/NL.json");
        expect(regionUrlFor("https://cdn.example.com/{code}.json", "US")).toBe("https://cdn.example.com/US.json");
        expect(regionUrlFor("//cdn.example.com/{code}.json", "US")).toBe("//cdn.example.com/US.json");
    });

    it("falls back to the site root without Mendix's mx global", () => {
        expect(regionUrlFor("regions/{code}.json", "BR")).toBe("/regions/BR.json");
    });

    it("replaces {code3} with the three-letter ISO code, so geoBoundaries file names work as they are", () => {
        expect(regionUrlFor("regions/geoBoundaries-{code3}-ADM1_simplified.geojson", "PT")).toBe(
            "/regions/geoBoundaries-PRT-ADM1_simplified.geojson"
        );
        expect(regionUrlFor("{CODE3}/{code}.json", "us")).toBe("/USA/us.json");
        expect(regionUrlFor("{code3}.json", "XK")).toBe("/XKX.json");
    });

    it("returns undefined when {code3} is needed but the country has no three-letter code", () => {
        expect(regionUrlFor("{code3}.json", "ZZ")).toBeUndefined();
        expect(regionUrlFor("{code}.json", "ZZ")).toBe("/ZZ.json");
    });
});

describe("toAlpha3", () => {
    // Northern Cyprus and Somaliland have no ISO code: the map gives them CYP and SOM, and {code3} skips them.
    it("maps every two-letter code the map draws to a three-letter code", () => {
        const missing = regions
            .map(region => region.code)
            .filter(code => code.length === 2)
            .filter(code => !/^[A-Z]{3}$/.test(toAlpha3(code) ?? ""));

        expect(missing).toEqual([]);
        expect(toAlpha3("nl")).toBe("NLD");
        expect(toAlpha3("GB")).toBe("GBR");
        expect(toAlpha3("CYP")).toBeUndefined();
    });
});

describe("toRegionCollection", () => {
    it("rewinds polygons to d3's order: exterior clockwise, holes counter-clockwise", () => {
        const collection = toRegionCollection(
            featureCollection([
                {
                    type: "Feature",
                    properties: { name: "Square" },
                    geometry: { type: "Polygon", coordinates: [square, hole] }
                }
            ]),
            "NL",
            "name"
        );
        const [exterior, inner] = collection.regions[0].geometry.coordinates;

        expect(exterior).toEqual([...square].reverse());
        expect(inner).toEqual(hole);
    });

    it("leaves rings that are already in d3's order alone", () => {
        const clockwise = [...square].reverse();
        const collection = toRegionCollection(
            featureCollection([{ properties: {}, geometry: { type: "MultiPolygon", coordinates: [[clockwise]] } }]),
            "NL"
        );

        expect(collection.regions[0].geometry.coordinates[0][0]).toBe(clockwise);
    });

    it("rewinds rings that cross the antimeridian correctly", () => {
        // Counter-clockwise, from 179°E across 180° to 179°W: a plain planar area gets this ring's direction wrong.
        const acrossAntimeridian = [
            [179, 60],
            [-179, 60],
            [-179, 61],
            [179, 61],
            [179, 60]
        ];
        const collection = toRegionCollection(
            featureCollection([{ properties: {}, geometry: { type: "Polygon", coordinates: [acrossAntimeridian] } }]),
            "RU"
        );
        const geometry = collection.regions[0].geometry;

        expect(geometry.coordinates[0]).toEqual([...acrossAntimeridian].reverse());
        expect(geoArea(geometry)).toBeLessThan(0.01);
    });

    it("names regions from the configured property, skips features that aren't polygons", () => {
        const collection = toRegionCollection(
            featureCollection([
                { id: 2, properties: { shapeName: "Utrecht" }, geometry: { type: "Polygon", coordinates: [square] } },
                { properties: { shapeName: "A point" }, geometry: { type: "Point", coordinates: [0, 0] } },
                { properties: { name: "Fallback" }, geometry: { type: "Polygon", coordinates: [square] } }
            ]),
            "NL",
            "shapeName"
        );

        // Ids come from the position in the file, so a feature id (2) can't collide with another feature's position.
        expect(collection.regions.map(({ id, name, countryCode }) => ({ id, name, countryCode }))).toEqual([
            { id: "NL-0", name: "Utrecht", countryCode: "NL" },
            { id: "NL-2", name: "Fallback", countryCode: "NL" }
        ]);
    });
});

describe("createRegionProvider", () => {
    const geoJson = featureCollection([
        { properties: { name: "Square" }, geometry: { type: "Polygon", coordinates: [square] } }
    ]);

    it("supports only the listed countries, or every country without a list", () => {
        const listed = createRegionProvider({ urlTemplate: "{code}.json", countryCodes: new Set(["US"]) });
        const all = createRegionProvider({ urlTemplate: "{code}.json", countryCodes: undefined });

        expect(listed.supports("us")).toBe(true);
        expect(listed.supports("NL")).toBe(false);
        expect(all.supports("NL")).toBe(true);
    });

    it("loads a country's regions from its URL", async () => {
        global.fetch = jest.fn(() => Promise.resolve(response(200, geoJson)));
        const provider = createRegionProvider({ urlTemplate: "https://example.com/{code}.json", nameProperty: "name" });

        const result = await provider.loadRegions("nl");

        expect(global.fetch).toHaveBeenCalledWith("https://example.com/NL.json");
        expect(result.status).toBe("ready");
        expect(result.collection.regions[0].name).toBe("Square");
    });

    it("reports a missing file as unavailable, and other errors as failed", async () => {
        const provider = createRegionProvider({ urlTemplate: "https://example.com/{code}.json" });

        global.fetch = jest.fn(() => Promise.resolve(response(404)));
        expect((await provider.loadRegions("NL")).status).toBe("unavailable");

        global.fetch = jest.fn(() => Promise.resolve(response(500)));
        expect((await provider.loadRegions("NL")).status).toBe("failed");

        global.fetch = jest.fn(() => Promise.reject(new TypeError("Network error")));
        expect((await provider.loadRegions("NL")).status).toBe("failed");

        global.fetch = jest.fn(() =>
            Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError("Unexpected token")) })
        );
        expect((await provider.loadRegions("NL")).status).toBe("failed");

        global.fetch = jest.fn(() => Promise.resolve(response(200, featureCollection([]))));
        expect((await provider.loadRegions("NL")).status).toBe("unavailable");
    });

    it("loads by three-letter code, and skips countries without one", async () => {
        global.fetch = jest.fn(() => Promise.resolve(response(200, geoJson)));
        const provider = createRegionProvider({ urlTemplate: "https://example.com/{code3}.json" });

        expect((await provider.loadRegions("pt")).status).toBe("ready");
        expect(global.fetch).toHaveBeenCalledWith("https://example.com/PRT.json");
        expect((await provider.loadRegions("ZZ")).status).toBe("unavailable");
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});
