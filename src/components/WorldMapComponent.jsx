import WorldMap, { regions } from "react-svg-worldmap";
import { useCallback, useMemo } from "react";
import classNames from "classnames";

// Mendix returns Integer/Long/Decimal values as Big.js objects. The map needs plain numbers to scale its shading.
const toMapValue = value => (typeof value?.toNumber === "function" ? value.toNumber() : value);

// The ISO codes the map can draw. Values for other codes would only stretch the shading range.
const mapIsoCodes = new Set(regions.map(region => region.code));

const isEmpty = value => value == null || (typeof value === "string" && value.trim() === "");

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
    // Items without a value or with an ISO code the map doesn't know are skipped: they can't be drawn and would skew
    // the shading. If an ISO code occurs more than once, the last item with a value wins.
    const { countries, labels } = useMemo(() => {
        const valuesByIso = new Map();
        const formattedValues = {};
        for (const item of countryList?.items ?? []) {
            const iso = countryISO.get(item).value?.trim().toUpperCase();
            const attribute = countryValue.get(item);
            if (!mapIsoCodes.has(iso) || isEmpty(attribute.value)) {
                continue;
            }
            valuesByIso.set(iso, toMapValue(attribute.value));
            formattedValues[iso] = numberFormatter ? numberFormatter.format(attribute.value) : attribute.displayValue;
        }
        const data = Array.from(valuesByIso, ([country, value]) => ({ country, value }));
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
