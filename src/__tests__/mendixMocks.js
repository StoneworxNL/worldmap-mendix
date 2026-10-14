// Minimal stand-ins for the Mendix pluggable widget API values the widget receives.
import Big from "big.js";

// jsdom has no ResizeObserver; react-svg-worldmap uses it to measure its container.
export function stubResizeObserver() {
    global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

export const big = value => new Big(value);

export const item = id => ({ id });

export const listValue = (items, status = "available") => ({ status, items });

// Like a ListAttributeValue: `get(item)` returns the value, the display value and the attribute's formatter.
export function listAttribute(valuesById, formatter) {
    return {
        formatter,
        get: ({ id }) => {
            const value = valuesById[id];
            return { value, displayValue: value == null ? "" : String(value) };
        }
    };
}

// Like Mendix's NumberFormatter in a Dutch locale: "." groups thousands and "," separates decimals.
export function numberFormatter(config = { groupDigits: false, decimalPrecision: 2 }) {
    return {
        type: "number",
        config,
        withConfig: jest.fn(newConfig => numberFormatter(newConfig)),
        format: value => {
            const [integer, decimals] = value.toFixed().split(".");
            const grouped = config.groupDigits ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : integer;
            return decimals ? `${grouped},${decimals}` : grouped;
        }
    };
}

export const dynamicValue = (value, status = "available") => ({ status, value });

export const actionValue = (overrides = {}) => ({
    canExecute: true,
    isExecuting: false,
    execute: jest.fn(),
    ...overrides
});

// The library renders a <title> per country path; for countries with data it holds the tooltip text.
export function pathOf(container, countryName) {
    return [...container.querySelectorAll("path > title")].find(
        title => title.textContent === countryName || title.textContent.startsWith(`${countryName} `)
    )?.parentElement;
}

export const tooltipOf = (container, countryName) => pathOf(container, countryName)?.querySelector("title").textContent;

export const opacityOf = (container, countryName) => Number(pathOf(container, countryName).style.fillOpacity);
