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

    // The CSS targets react-path-tooltip's internal markup, so check every selector still matches after upgrades.
    it("renders markup that every selector in WorldMap.css still matches", () => {
        const cssPath = join(dirname(expect.getState().testPath), "../ui/WorldMap.css");
        const css = readFileSync(cssPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
        const selectors = [...css.matchAll(/([^{}]+)\{/g)]
            .map(match => match[1].trim())
            .filter(prelude => !prelude.startsWith("@"))
            .flatMap(selectorList => selectorList.split(",").map(selector => selector.trim()));
        const { container } = renderMap();

        expect(selectors.length).toBeGreaterThan(0);
        for (const selector of selectors) {
            expect(container.querySelector(selector)).not.toBeNull();
        }
    });
});
