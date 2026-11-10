import {
    actionValue,
    big,
    dynamicValue,
    item,
    listAttribute,
    listValue,
    numberFormatter,
    opacityOf,
    pathOf,
    stubResizeObserver,
    tooltipOf
} from "./mendixMocks";
import { dirname, join } from "path";
import { fireEvent, render } from "@testing-library/react";
import { WorldMap } from "../WorldMap";
import { readFileSync } from "fs";

beforeAll(stubResizeObserver);
afterEach(() => jest.restoreAllMocks());

// jsdom has no layout, so the map measures 0px wide, and the library draws no pins on a map without a width.
const giveMapAWidth = () =>
    jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ width: 800, height: 600 });

const items = [item("1"), item("2"), item("3")];
const isoCodes = listAttribute({ 1: "BR", 2: "PT", 3: "DE" });

function renderMap(props = {}) {
    return render(
        <WorldMap
            countryList={listValue(items)}
            countryISO={isoCodes}
            countryValue={listAttribute({ 1: big(300), 2: big(100), 3: big(200) }, numberFormatter())}
            sizeEnum="sm"
            color="#ff0000"
            {...props}
        />
    );
}

describe("WorldMap", () => {
    it("shades countries by their numeric value", () => {
        const { container } = renderMap();

        expect(opacityOf(container, "Brazil")).toBeCloseTo(0.8);
        expect(opacityOf(container, "Germany")).toBeCloseTo(0.5);
        expect(opacityOf(container, "Portugal")).toBeCloseTo(0.2);
    });

    it("formats tooltip numbers with the attribute's Mendix formatter, with thousands separators", () => {
        const formatter = numberFormatter({ groupDigits: false, decimalPrecision: 2 });
        const { container } = renderMap({
            countryValue: listAttribute({ 1: big("1234567.5"), 2: big(100), 3: big(200) }, formatter),
            valueSuffix: dynamicValue("people")
        });

        expect(formatter.withConfig).toHaveBeenCalledWith({ groupDigits: true, decimalPrecision: 2 });
        expect(tooltipOf(container, "Brazil")).toBe("Brazil 1.234.567,5 people");
    });

    it("renders when <html lang> is not a valid locale", () => {
        document.documentElement.lang = "en_US";
        try {
            const { container } = renderMap();
            expect(tooltipOf(container, "Brazil")).toBe("Brazil 300");
        } finally {
            document.documentElement.lang = "";
        }
    });

    it("shows text values as Mendix displays them", () => {
        const { container } = renderMap({
            countryValue: listAttribute({ 1: "Brasília", 2: "Lisbon", 3: "Berlin" }),
            valueSuffix: dynamicValue("(capital)")
        });

        expect(tooltipOf(container, "Portugal")).toBe("Portugal Lisbon (capital)");
    });

    it("skips countries without an ISO code or value, but keeps 0", () => {
        const list = listValue([item("1"), item("2"), item("3"), item("4"), item("5"), item("6")]);
        const iso = listAttribute({ 1: "BR", 2: "PT", 3: "DE", 4: "", 5: null, 6: "  " });
        const values = listAttribute(
            { 1: big(300), 2: big(0), 3: null, 4: big(999), 5: big(999), 6: big(999) },
            numberFormatter()
        );
        const { container } = renderMap({ countryList: list, countryISO: iso, countryValue: values });

        expect(tooltipOf(container, "Portugal")).toBe("Portugal 0");
        expect(tooltipOf(container, "Germany")).toBe("Germany");
        // Only 0 and 300 count towards the shading range.
        expect(opacityOf(container, "Portugal")).toBeCloseTo(0.2);
        expect(opacityOf(container, "Brazil")).toBeCloseTo(0.8);
    });

    it("skips ISO codes the map doesn't know, so they don't stretch the shading range", () => {
        const list = listValue([item("1"), item("2"), item("3")]);
        const iso = listAttribute({ 1: "BR", 2: "PT", 3: "PRT" });
        const values = listAttribute({ 1: big(300), 2: big(100), 3: big(10000) }, numberFormatter());
        const { container } = renderMap({ countryList: list, countryISO: iso, countryValue: values });

        expect(opacityOf(container, "Portugal")).toBeCloseTo(0.2);
        expect(opacityOf(container, "Brazil")).toBeCloseTo(0.8);
    });

    it("skips text values that are empty or only spaces", () => {
        const { container } = renderMap({ countryValue: listAttribute({ 1: "Brasília", 2: "  ", 3: "" }) });

        expect(tooltipOf(container, "Brazil")).toBe("Brazil Brasília");
        expect(tooltipOf(container, "Portugal")).toBe("Portugal");
        expect(tooltipOf(container, "Germany")).toBe("Germany");
    });

    it("trims and uppercases ISO codes", () => {
        const { container } = renderMap({ countryISO: listAttribute({ 1: " br ", 2: "pt", 3: "De" }) });

        expect(tooltipOf(container, "Brazil")).toBe("Brazil 300");
        expect(tooltipOf(container, "Portugal")).toBe("Portugal 100");
        expect(tooltipOf(container, "Germany")).toBe("Germany 200");
    });

    it("uses the last item when an ISO code occurs more than once", () => {
        const { container } = renderMap({
            countryISO: listAttribute({ 1: "BR", 2: "PT", 3: "BR" }),
            countryValue: listAttribute({ 1: big(100), 2: big(200), 3: big(300) }, numberFormatter())
        });

        expect(tooltipOf(container, "Brazil")).toBe("Brazil 300");
        // The dropped duplicate (100) doesn't stretch the shading range, so Portugal is the minimum.
        expect(opacityOf(container, "Portugal")).toBeCloseTo(0.2);
        expect(opacityOf(container, "Brazil")).toBeCloseTo(0.8);
    });

    it("keeps an earlier duplicate when the last one has no value", () => {
        const { container } = renderMap({
            countryISO: listAttribute({ 1: "BR", 2: "PT", 3: "br" }),
            countryValue: listAttribute({ 1: big(300), 2: big(100), 3: null }, numberFormatter())
        });

        expect(tooltipOf(container, "Brazil")).toBe("Brazil 300");
    });

    it("falls back to the library's default color when Color is empty", () => {
        const { container } = renderMap({ color: "" });

        expect(pathOf(container, "Brazil").style.fill).toBe("#dddddd");
    });

    it("shows the value suffix only when it has a value", () => {
        expect(tooltipOf(renderMap({ valueSuffix: dynamicValue("people") }).container, "Brazil")).toBe(
            "Brazil 300 people"
        );
        expect(tooltipOf(renderMap({ valueSuffix: undefined }).container, "Brazil")).toBe("Brazil 300");
        expect(tooltipOf(renderMap({ valueSuffix: dynamicValue(undefined, "loading") }).container, "Brazil")).toBe(
            "Brazil 300"
        );
    });

    it("applies the Mendix class and style to the root element", () => {
        const { container } = renderMap({ class: "mx-name-worldMap1", style: { maxWidth: "500px" } });
        const root = container.firstChild;

        expect(root).toHaveClass("widget-worldmap", "mx-name-worldMap1");
        expect(root).toHaveStyle({ maxWidth: "500px" });
    });

    it("passes the clicked country's ISO code to the On Click action", () => {
        const onClickAction = actionValue();
        const { container } = renderMap({ onClickAction });

        fireEvent.click(pathOf(container, "Brazil"));

        expect(onClickAction.execute).toHaveBeenCalledWith({ clickedIsoCode: "BR" });
    });

    it("doesn't run the On Click action while it can't be executed", () => {
        const onClickAction = actionValue({ canExecute: false });
        const { container } = renderMap({ onClickAction });

        fireEvent.click(pathOf(container, "Brazil"));

        expect(onClickAction.execute).not.toHaveBeenCalled();
    });

    it("keeps showing the previous items while the list reloads", () => {
        const { container } = renderMap({ countryList: listValue(items, "loading") });

        expect(tooltipOf(container, "Brazil")).toBe("Brazil 300");
    });

    it("shows no countries while the list has no items", () => {
        const { container } = renderMap({ countryList: listValue(undefined, "unavailable") });

        expect(tooltipOf(container, "Brazil")).toBe("Brazil");
    });

    it("updates when the Value attribute changes", () => {
        const { container, rerender } = renderMap();

        rerender(
            <WorldMap
                countryList={listValue(items)}
                countryISO={isoCodes}
                countryValue={listAttribute({ 1: big(5), 2: big(100), 3: big(200) }, numberFormatter())}
                sizeEnum="sm"
            />
        );

        expect(tooltipOf(container, "Brazil")).toBe("Brazil 5");
    });

    it("has no zoom buttons or country names unless zoom is on", () => {
        const { container } = renderMap();

        expect(container.querySelector(".worldmap__zoom-viewport")).toBeNull();
        expect(container.querySelector('[data-map-layer="country-labels"]')).toBeNull();
        expect(container.firstChild).not.toHaveClass("widget-worldmap--zoom");
    });

    it("adds zoom buttons and country names when zoom is on", () => {
        const { container, getByRole } = renderMap({
            zoomEnabled: true,
            zoomMaxScale: 4,
            zoomShowControls: true,
            showCountryLabels: true
        });

        expect(container.firstChild).toHaveClass("widget-worldmap--zoom");
        expect(getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
        expect(container.querySelector('[data-map-layer="country-labels"]')).not.toBeNull();
    });

    it("clamps Maximum zoom to 20", () => {
        giveMapAWidth();
        const { container, getByRole } = renderMap({
            zoomEnabled: true,
            zoomMaxScale: 800,
            zoomShowControls: true,
            showCountryLabels: true
        });
        const scale = () =>
            Number(
                /scale\(([\d.]+)\)/.exec(
                    container.querySelector('[data-map-layer="countries"]').getAttribute("transform")
                )[1]
            );
        const initial = scale();

        for (let i = 0; i < 10; i++) {
            fireEvent.click(getByRole("button", { name: "Zoom in" }));
        }

        expect(scale() / initial).toBeCloseTo(20);
    });

    it("hides the zoom buttons and country names when they are turned off", () => {
        const { container, queryByRole } = renderMap({
            zoomEnabled: true,
            zoomMaxScale: 4,
            zoomShowControls: false,
            showCountryLabels: false
        });

        expect(container.querySelector(".worldmap__zoom-viewport")).not.toBeNull();
        expect(queryByRole("button", { name: "Zoom in" })).toBeNull();
        expect(container.querySelector('[data-map-layer="country-labels"]')).toBeNull();
    });

    it("draws a pin with its caption for each item with a latitude and longitude", () => {
        giveMapAWidth();
        const pinItems = [item("a"), item("b"), item("c"), item("d")];
        const { container } = renderMap({
            pinList: listValue(pinItems),
            pinLatitude: listAttribute({ a: big("52.37"), b: big(-23.55), c: null, d: big(10) }),
            pinLongitude: listAttribute({ a: big("4.9"), b: big(-46.63), c: big(10), d: big(500) }),
            pinCaption: listAttribute({ a: "Amsterdam", b: "São Paulo", c: "No latitude", d: "Out of range" }),
            pinColor: "#0000ff"
        });

        const pins = [...container.querySelectorAll("[data-map-pin]")];
        expect(pins.map(pin => pin.textContent)).toEqual(["Amsterdam", "São Paulo"]);
        expect(pins[0].querySelector("path")).toHaveAttribute("fill", "#0000ff");
    });

    it("draws no pins without the Pins data source", () => {
        giveMapAWidth();
        const { container } = renderMap({ pinLatitude: listAttribute({}), pinLongitude: listAttribute({}) });

        expect(container.querySelector('[data-map-layer="pins"]')).toBeNull();
    });

    // The CSS targets react-path-tooltip's internal markup, so check every selector still matches after upgrades.
    it("renders markup that every selector in WorldMap.css still matches", () => {
        const cssPath = join(dirname(expect.getState().testPath), "../ui/WorldMap.css");
        const css = readFileSync(cssPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
        const selectors = [...css.matchAll(/([^{}]+)\{/g)]
            .map(match => match[1].trim())
            .filter(prelude => !prelude.startsWith("@"))
            .flatMap(selectorList => selectorList.split(",").map(selector => selector.trim()));
        // With zoom, so the zoom-only selectors are checked too.
        const { container } = renderMap({ zoomEnabled: true, zoomMaxScale: 8 });

        expect(selectors.length).toBeGreaterThan(0);
        for (const selector of selectors) {
            expect(container.querySelector(selector)).not.toBeNull();
        }
    });
});
