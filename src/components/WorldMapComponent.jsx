import WorldMap, { preloadDetailedCountryGeometry, regions } from "react-svg-worldmap";
import { createRegionProvider, parseCountryCodes } from "./regionProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";

// Mendix returns Integer/Long/Decimal values as Big.js objects. The map needs plain numbers to scale its shading.
const toMapValue = value => (typeof value?.toNumber === "function" ? value.toNumber() : value);

// The ISO codes the map can draw. Values for other codes would only stretch the shading range.
const mapIsoCodes = new Set(regions.map(region => region.code));

const isEmpty = value => value == null || (typeof value === "string" && value.trim() === "");

// The range Studio Pro allows for Maximum zoom (see check() in WorldMap.editorConfig.js). Below 2 there's nothing to
// zoom; far above 20 users can zoom into a single pixel.
const MIN_ZOOM = 2;
const MAX_ZOOM = 20;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
    detailedBorders,
    detailedBordersMinScale,
    theme,
    regionsEnabled,
    regionMinScale,
    regionUrl,
    regionCountries,
    regionNameProperty,
    onRegionStatusChange,
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

    // Zoom is opt-in; false keeps the map as it was before zoom existed. Maximum zoom is clamped to MIN_ZOOM-MAX_ZOOM,
    // and the zoom levels for detailed borders and regions to 1-maximum zoom.
    const zoom = useMemo(() => {
        if (!zoomEnabled) {
            return false;
        }
        const maxScale = clamp(zoomMaxScale, MIN_ZOOM, MAX_ZOOM);
        return {
            maxScale,
            showControls: zoomShowControls !== false,
            showCountryLabels: showCountryLabels !== false,
            detailedGeometry: detailedBorders !== false,
            detailedGeometryMinScale: clamp(detailedBordersMinScale ?? 2, 1, maxScale),
            regionDetailMinScale: clamp(regionMinScale ?? 4, 1, maxScale)
        };
    }, [
        zoomEnabled,
        zoomMaxScale,
        zoomShowControls,
        showCountryLabels,
        detailedBorders,
        detailedBordersMinScale,
        regionMinScale
    ]);

    // Regions need zoom and a URL. The provider is rebuilt only when its settings change: a new provider makes the map
    // load every country's regions again.
    const regionProvider = useMemo(
        () =>
            zoomEnabled && regionsEnabled && regionUrl?.trim()
                ? createRegionProvider({
                      urlTemplate: regionUrl,
                      countryCodes: parseCountryCodes(regionCountries),
                      nameProperty: regionNameProperty?.trim()
                  })
                : undefined,
        [zoomEnabled, regionsEnabled, regionUrl, regionCountries, regionNameProperty]
    );

    // The library reports several statuses at once (e.g. "loading" for every country in view, from inside its own
    // effect), but Mendix ignores execute() while the action is still running. So queue them, and run the next one
    // only once Mendix hands over a new ActionValue that isn't executing. If no new ActionValue comes (an action that
    // finishes without one), try again after a second.
    const statusQueue = useRef([]);
    const executedWith = useRef(undefined);
    const [statusTick, setStatusTick] = useState(0);
    const regionStatusChange = useCallback(({ status, countryCode }) => {
        statusQueue.current.push({ regionStatus: status, regionCountryCode: countryCode ?? "" });
        setStatusTick(tick => tick + 1);
    }, []);
    useEffect(() => {
        const action = onRegionStatusChange;
        if (!action || statusQueue.current.length === 0) {
            return undefined;
        }
        if (!action.canExecute) {
            statusQueue.current = [];
            return undefined;
        }
        if (action.isExecuting || executedWith.current === action) {
            const retry = setTimeout(() => {
                executedWith.current = undefined;
                setStatusTick(tick => tick + 1);
            }, 1000);
            return () => clearTimeout(retry);
        }
        executedWith.current = action;
        action.execute(statusQueue.current.shift());
        if (statusQueue.current.length > 0) {
            setStatusTick(tick => tick + 1);
        }
        return undefined;
    }, [onRegionStatusChange, statusTick]);

    // Start downloading the detailed borders as soon as the pointer is over a zoomable map, so they are usually there
    // by the time the user has zoomed in.
    const preloadDetailedBorders = useCallback(() => {
        if (zoom?.detailedGeometry) {
            preloadDetailedCountryGeometry().catch(() => undefined);
        }
    }, [zoom]);

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
        <div
            className={classNames("widget-worldmap", { "widget-worldmap--zoom": zoom }, className)}
            style={style}
            onPointerEnter={zoom ? preloadDetailedBorders : undefined}
        >
            <WorldMap
                color={color || undefined}
                theme={theme === "atlas" ? "atlas" : undefined}
                valueSuffix={valueSuffix}
                size={sizeEnum}
                data={countries}
                onClickFunction={clickAction}
                tooltipTextFunction={tooltipText}
                zoom={zoom}
                labelColor={labelColor || undefined}
                detailLevel={regionProvider ? "regions" : undefined}
                detailProvider={regionProvider}
                onDetailStatusChange={regionProvider && onRegionStatusChange ? regionStatusChange : undefined}
                pins={pins}
                pinColor={pinColor || undefined}
            />
        </div>
    );
}
