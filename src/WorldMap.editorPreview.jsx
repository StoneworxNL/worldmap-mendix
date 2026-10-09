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

export function preview({ class: className, valueSuffix, sizeEnum, color }) {
    return (
        <div className={classNames("widget-worldmap", className)}>
            <WorldMap color={color || undefined} valueSuffix={valueSuffix} size={sizeEnum} data={sampleData} />
        </div>
    );
}

// The build turns the stylesheet into a CSS string; Studio Pro applies it in design mode.
export function getPreviewCss() {
    return previewCss;
}
