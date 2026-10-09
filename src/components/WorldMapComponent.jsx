import { useCallback, useMemo } from "react";
import WorldMap from "react-svg-worldmap";
import classNames from "classnames";

// Mendix returns Integer/Long/Decimal values as Big.js objects. The map needs plain numbers to scale its shading.
const toMapValue = value => (typeof value?.toNumber === "function" ? value.toNumber() : value);

export function WorldMapComponent({
    className,
    style,
    countryList,
    countryISO,
    countryValue,
    valueSuffix,
    sizeEnum,
    color,
    onClickAction
}) {
    // Mendix's own number formatter (user's locale), with thousands separators, which Mendix leaves off by default.
    const numberFormatter = useMemo(() => {
        const formatter = countryValue?.formatter;
        return formatter?.type === "number"
            ? formatter.withConfig({ ...formatter.config, groupDigits: true })
            : undefined;
    }, [countryValue]);

    // While the list reloads, Mendix keeps the previous items, so the map doesn't flash empty.
    // Countries without an ISO code or value are skipped: the map can't draw them and they would skew the shading.
    const { countries, labels } = useMemo(() => {
        const data = [];
        const formattedValues = {};
        for (const item of countryList?.items ?? []) {
            const iso = countryISO.get(item).value?.trim().toUpperCase();
            const attribute = countryValue.get(item);
            if (!iso || attribute.value == null || attribute.value === "") {
                continue;
            }
            data.push({ country: iso, value: toMapValue(attribute.value) });
            formattedValues[iso] = numberFormatter ? numberFormatter.format(attribute.value) : attribute.displayValue;
        }
        return { countries: data, labels: formattedValues };
    }, [countryList, countryISO, countryValue, numberFormatter]);

    const tooltipText = useCallback(
        ({ countryCode, countryName, countryValue: value, prefix, suffix }) =>
            [countryName, prefix, labels[countryCode] ?? String(value), suffix].filter(Boolean).join(" "),
        [labels]
    );

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

    // An empty Color would become fill: "" (black countries); undefined lets the library use its default color.
    return (
        <div className={classNames("widget-worldmap", className)} style={style}>
            <WorldMap
                color={color || undefined}
                valueSuffix={valueSuffix}
                size={sizeEnum}
                data={countries}
                onClickFunction={clickAction}
                tooltipTextFunction={tooltipText}
            />
        </div>
    );
}
