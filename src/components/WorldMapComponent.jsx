import { useState, useEffect, useCallback } from "react";
import WorldMap from "react-svg-worldmap";

// Mendix returns Integer/Long/Decimal values as Big.js objects. Plain numbers let the map
// scale colors numerically and let the tooltip format them with thousands separators.
const toMapValue = value => (value && typeof value.toNumber === "function" ? value.toNumber() : value);

export function WorldMapComponent({
    countryList,
    countryISO,
    countryValue,
    valueSuffix,
    sizeEnum,
    color,
    onClickAction
}) {
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        if (countryList && countryList.status === "available") {
            const formattedCountries = countryList.items.map(country => ({
                country: countryISO.get(country).value,
                value: toMapValue(countryValue.get(country).value)
            }));
            console.log();
            setCountries(formattedCountries);
        }
    }, [countryList]);

    // Format numbers in the app's language (set on <html lang> by Mendix), not the browser's.
    const tooltipText = useCallback(({ countryName, countryValue: value, prefix, suffix }) => {
        const numberFormat = new Intl.NumberFormat(document.documentElement.lang || undefined);
        const formattedValue = typeof value === "number" ? numberFormat.format(value) : value;
        return [countryName, prefix, formattedValue, suffix].filter(part => part != null && part !== "").join(" ");
    }, []);

    const clickAction = useCallback(
        ({ countryCode }) => {
            if (!onClickAction) return;

            if (onClickAction.isExecuting || !onClickAction.canExecute) {
                console.warn("onClickAction cannot be executed.");
                return;
            }
            onClickAction.execute({ clickedIsoCode: countryCode });
        },
        [onClickAction]
    );

    return (
        <div className="App widget-worldmap">
            <WorldMap
                color={color}
                valueSuffix={valueSuffix}
                size={sizeEnum}
                data={countries}
                onClickFunction={clickAction}
                tooltipTextFunction={tooltipText}
            />
        </div>
    );
}
