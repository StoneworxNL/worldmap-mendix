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
});
