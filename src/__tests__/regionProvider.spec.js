import {
    createRegionProvider,
    parseCountryCodes,
    regionUrlFor,
    toRegionCollection
} from "../components/regionProvider";

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

    it("names regions from the configured property, skips features that aren't polygons", () => {
        const collection = toRegionCollection(
            featureCollection([
                { id: "a", properties: { shapeName: "Utrecht" }, geometry: { type: "Polygon", coordinates: [square] } },
                { properties: { shapeName: "A point" }, geometry: { type: "Point", coordinates: [0, 0] } },
                { properties: { name: "Fallback" }, geometry: { type: "Polygon", coordinates: [square] } }
            ]),
            "NL",
            "shapeName"
        );

        expect(collection.regions.map(({ id, name, countryCode }) => ({ id, name, countryCode }))).toEqual([
            { id: "NL-a", name: "Utrecht", countryCode: "NL" },
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
});
