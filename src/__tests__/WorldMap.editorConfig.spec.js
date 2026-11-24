import { check } from "../WorldMap.editorConfig";

const messagesFor = (values, property) => check(values).filter(problem => problem.property === property);

describe("check", () => {
    it("accepts a maximum zoom from 2 to 20", () => {
        for (const zoomMaxScale of [2, 8, 20]) {
            expect(messagesFor({ zoomEnabled: true, zoomMaxScale }, "zoomMaxScale")).toEqual([]);
        }
    });

    it("rejects a maximum zoom below 2 or above 20", () => {
        for (const zoomMaxScale of [1, 21, 800]) {
            expect(messagesFor({ zoomEnabled: true, zoomMaxScale }, "zoomMaxScale")).toHaveLength(1);
        }
    });

    it("ignores the maximum zoom while zoom is off", () => {
        expect(messagesFor({ zoomEnabled: false, zoomMaxScale: 800 }, "zoomMaxScale")).toEqual([]);
    });

    it("warns that overlapping pins stay hidden when there are pins but no zoom", () => {
        const pins = { pinList: {}, pinLatitude: "Lat", pinLongitude: "Lon" };

        expect(messagesFor({ ...pins, zoomEnabled: false }, "pinList")).toEqual([
            expect.objectContaining({ severity: "warning" })
        ]);
        expect(messagesFor({ ...pins, zoomEnabled: true, zoomMaxScale: 8 }, "pinList")).toEqual([]);
        expect(messagesFor({ zoomEnabled: false }, "pinList")).toEqual([]);
    });

    it("asks for the latitude and longitude attributes when there are pins", () => {
        const problems = check({ pinList: {}, zoomEnabled: true, zoomMaxScale: 8 });

        expect(problems.map(problem => problem.property)).toEqual(["pinLatitude", "pinLongitude"]);
    });

    describe("regions", () => {
        const regions = { zoomEnabled: true, zoomMaxScale: 8, regionsEnabled: true, regionUrl: "regions/{code}.json" };

        it("accepts a complete regions setup", () => {
            expect(check({ ...regions, regionMinScale: 4, regionCountries: "US, ca; BR" })).toEqual([]);
        });

        it("warns about regions without zoom", () => {
            expect(messagesFor({ ...regions, zoomEnabled: false }, "regionsEnabled")).toEqual([
                expect.objectContaining({ severity: "warning" })
            ]);
        });

        it("asks for a Region data URL, and warns when it has no {code}", () => {
            const [missing] = messagesFor({ ...regions, regionUrl: " " }, "regionUrl");
            expect(missing.severity).toBeUndefined();
            expect(messagesFor({ ...regions, regionUrl: "regions/all.json" }, "regionUrl")).toEqual([
                expect.objectContaining({ severity: "warning" })
            ]);
            expect(messagesFor({ ...regions, regionUrl: "regions/{code3}.json" }, "regionUrl")).toEqual([]);
        });

        it("rejects country codes that aren't two letters", () => {
            const [problem] = messagesFor({ ...regions, regionCountries: "US, USA, C4" }, "regionCountries");

            expect(problem.message).toContain('"USA", "C4"');
        });

        it("measures the zoom levels against the maximum zoom the map really uses (2 to 20)", () => {
            expect(messagesFor({ ...regions, zoomMaxScale: 1, regionMinScale: 2 }, "regionMinScale")).toEqual([]);
            expect(messagesFor({ ...regions, zoomMaxScale: 50, regionMinScale: 30 }, "regionMinScale")).toHaveLength(1);
            expect(
                messagesFor(
                    { ...regions, detailedBorders: true, detailedBordersMinScale: 9 },
                    "detailedBordersMinScale"
                )
            ).toHaveLength(1);
        });

        it("ignores region settings while Regions is off", () => {
            expect(
                check({ zoomEnabled: true, zoomMaxScale: 8, regionsEnabled: false, regionCountries: "USA" })
            ).toEqual([]);
        });
    });
});
