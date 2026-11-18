// Checks the props the widget hands to react-svg-worldmap, for settings whose effect Jest can't observe in the
// rendered map (the library loads the detailed borders with import(), which Jest doesn't support in node_modules).
import { big, item, listAttribute, listValue, numberFormatter, stubResizeObserver } from "./mendixMocks";
import { fireEvent, render } from "@testing-library/react";
import { WorldMap } from "../WorldMap";

jest.mock("react-svg-worldmap", () => {
    const actual = jest.requireActual("react-svg-worldmap");
    const MockWorldMap = jest.fn(() => null);
    return {
        ...actual,
        __esModule: true,
        default: MockWorldMap,
        preloadDetailedCountryGeometry: jest.fn(() => Promise.resolve())
    };
});

const library = jest.requireMock("react-svg-worldmap");

beforeAll(stubResizeObserver);
beforeEach(() => jest.clearAllMocks());

function renderMap(props = {}) {
    return render(
        <WorldMap
            countryList={listValue([item("1")])}
            countryISO={listAttribute({ 1: "BR" })}
            countryValue={listAttribute({ 1: big(300) }, numberFormatter())}
            sizeEnum="sm"
            zoomEnabled
            zoomMaxScale={8}
            zoomShowControls
            showCountryLabels
            {...props}
        />
    );
}

const lastProps = () => library.default.mock.calls.at(-1)[0];

describe("WorldMap props", () => {
    it("passes Detailed borders and its zoom level to the library", () => {
        renderMap({ detailedBorders: true, detailedBordersMinScale: 3 });
        expect(lastProps().zoom).toMatchObject({ detailedGeometry: true, detailedGeometryMinScale: 3 });

        renderMap({ detailedBorders: false, detailedBordersMinScale: 3 });
        expect(lastProps().zoom).toMatchObject({ detailedGeometry: false });
    });

    it("clamps the zoom levels for detailed borders and regions to 1 through the maximum zoom", () => {
        renderMap({ zoomMaxScale: 4, detailedBorders: true, detailedBordersMinScale: 9, regionMinScale: 0 });

        expect(lastProps().zoom).toMatchObject({ maxScale: 4, detailedGeometryMinScale: 4, regionDetailMinScale: 1 });
    });

    it("preloads the detailed borders when the pointer enters a zoomable map, unless they are off", () => {
        const { container } = renderMap({ detailedBorders: true });
        fireEvent.pointerEnter(container.firstChild);
        expect(library.preloadDetailedCountryGeometry).toHaveBeenCalledTimes(1);

        const off = renderMap({ detailedBorders: false });
        fireEvent.pointerEnter(off.container.firstChild);
        expect(library.preloadDetailedCountryGeometry).toHaveBeenCalledTimes(1);
    });

    it("passes the Atlas theme only when Theme is Atlas", () => {
        renderMap({ theme: "atlas" });
        expect(lastProps().theme).toBe("atlas");

        renderMap({ theme: "default" });
        expect(lastProps().theme).toBeUndefined();
    });

    it("turns on regions only with zoom, Regions and a Region data URL", () => {
        renderMap({ regionsEnabled: true, regionUrl: "regions/{code}.json" });
        expect(lastProps()).toMatchObject({ detailLevel: "regions" });
        expect(lastProps().detailProvider.supports("NL")).toBe(true);

        renderMap({ regionsEnabled: true, regionUrl: " " });
        expect(lastProps().detailLevel).toBeUndefined();

        renderMap({ zoomEnabled: false, regionsEnabled: true, regionUrl: "regions/{code}.json" });
        expect(lastProps().detailLevel).toBeUndefined();
    });

    it("keeps the same region provider across renders, so countries aren't loaded again", () => {
        const { rerender } = renderMap({ regionsEnabled: true, regionUrl: "regions/{code}.json" });
        const provider = lastProps().detailProvider;

        rerender(
            <WorldMap
                countryList={listValue([item("1")])}
                countryISO={listAttribute({ 1: "BR" })}
                countryValue={listAttribute({ 1: big(5) }, numberFormatter())}
                sizeEnum="sm"
                zoomEnabled
                zoomMaxScale={8}
                zoomShowControls
                showCountryLabels
                regionsEnabled
                regionUrl="regions/{code}.json"
            />
        );

        expect(lastProps().detailProvider).toBe(provider);
    });
});
