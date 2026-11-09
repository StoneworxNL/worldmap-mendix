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
    onClickAction,
    zoomEnabled,
    zoomMaxScale,
    zoomShowControls,
    showCountryLabels,
    labelColor,
    pinList,
    pinLatitude,
    pinLongitude,
    pinCaption,
    pinColor
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

    // Zoom is opt-in; false keeps the map as it was before zoom existed. The library zooms out no further than the
    // whole map (1), so a maximum below 2 would leave nothing to zoom.
    const zoom = useMemo(
        () =>
            zoomEnabled
                ? {
                      maxScale: Math.max(2, zoomMaxScale ?? 8),
                      showControls: zoomShowControls !== false,
                      showCountryLabels: showCountryLabels !== false
                  }
                : false,
        [zoomEnabled, zoomMaxScale, zoomShowControls, showCountryLabels]
    );

    // Pins without a latitude or longitude are skipped. The library skips coordinates out of range itself and, when
    // pins overlap, keeps the one that comes first in the list.
    const pins = useMemo(() => {
        if (!pinList?.items || !pinLatitude || !pinLongitude) {
            return undefined;
        }
        return pinList.items.flatMap(item => {
            const latitude = toMapValue(pinLatitude.get(item).value);
            const longitude = toMapValue(pinLongitude.get(item).value);
            if (typeof latitude !== "number" || typeof longitude !== "number") {
                return [];
            }
            return [{ id: item.id, coordinates: [longitude, latitude], caption: pinCaption?.get(item).value ?? "" }];
        });
    }, [pinList, pinLatitude, pinLongitude, pinCaption]);

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

    // An empty color would become fill: "" (black); undefined lets the library use its default color.
    return (
        <div className={classNames("widget-worldmap", { "widget-worldmap--zoom": zoom }, className)} style={style}>
            <WorldMap
                color={color || undefined}
                valueSuffix={valueSuffix}
                size={sizeEnum}
                data={countries}
                onClickFunction={clickAction}
                tooltipTextFunction={tooltipText}
                zoom={zoom}
                labelColor={labelColor || undefined}
                pins={pins}
                pinColor={pinColor || undefined}
            />
        </div>
    );
}
