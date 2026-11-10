import WorldMap from "react-svg-worldmap";
import classNames from "classnames";
import previewCss from "./ui/WorldMap.css";

// Studio Pro has no data source objects at design time, so show sample countries instead.
// Values are evenly spread so the preview shows the full range of shading.
const sampleData = [
    { country: "us", value: 80 },
    { country: "br", value: 70 },
    { country: "cn", value: 60 },
    { country: "in", value: 50 },
    { country: "au", value: 40 },
    { country: "za", value: 30 },
    { country: "de", value: 20 },
    { country: "pt", value: 10 }
];

// Sample pins, shown when the Pins data source is set.
const samplePins = [
    { caption: "Amsterdam", coordinates: [4.9, 52.37] },
    { caption: "São Paulo", coordinates: [-46.63, -23.55] },
    { caption: "Tokyo", coordinates: [139.69, 35.69] }
];

export function preview({
    class: className,
    valueSuffix,
    sizeEnum,
    color,
    zoomEnabled,
    zoomShowControls,
    showCountryLabels,
    labelColor,
    pinList,
    pinColor
}) {
    const zoom = zoomEnabled
        ? { showControls: zoomShowControls !== false, showCountryLabels: showCountryLabels !== false }
        : false;
    // pointer-events: none keeps the map's zoom, pan and wheel handlers from taking over Studio Pro's editor canvas.
    return (
        <div
            className={classNames("widget-worldmap", { "widget-worldmap--zoom": zoomEnabled }, className)}
            style={{ pointerEvents: "none" }}
        >
            <WorldMap
                color={color || undefined}
                valueSuffix={valueSuffix}
                size={sizeEnum}
                data={sampleData}
                zoom={zoom}
                labelColor={labelColor || undefined}
                pins={pinList ? samplePins : undefined}
                pinColor={pinColor || undefined}
            />
        </div>
    );
}

// The build turns the stylesheet into a CSS string; Studio Pro applies it in design mode.
export function getPreviewCss() {
    return previewCss;
}
