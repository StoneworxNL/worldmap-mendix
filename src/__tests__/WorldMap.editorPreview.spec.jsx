import { opacityOf, pathOf, stubResizeObserver, tooltipOf } from "./mendixMocks";
import { preview } from "../WorldMap.editorPreview";
import { render } from "@testing-library/react";

beforeAll(stubResizeObserver);

describe("design-mode preview", () => {
    it("draws the sample countries with the configured class, suffix and color", () => {
        const { container } = render(
            preview({ class: "my-map", valueSuffix: "people", sizeEnum: "sm", color: "#4951ba" })
        );

        expect(container.firstChild).toHaveClass("widget-worldmap", "my-map");
        expect(tooltipOf(container, "United States")).toBe("United States 80 people");
        expect(pathOf(container, "Brazil").style.fill).toBe("#4951ba");
        expect(opacityOf(container, "United States")).toBeCloseTo(0.8);
        expect(opacityOf(container, "Portugal")).toBeCloseTo(0.2);
    });

    it("falls back to the library's default color when Color is empty", () => {
        const { container } = render(preview({ color: "", sizeEnum: "sm" }));

        expect(pathOf(container, "Brazil").style.fill).toBe("#dddddd");
    });
});
