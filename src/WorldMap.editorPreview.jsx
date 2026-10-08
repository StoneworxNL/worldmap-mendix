import WorldMap from "react-svg-worldmap";

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

export function preview({ valueSuffix, sizeEnum, color }) {
    return <WorldMap color={color} valueSuffix={valueSuffix} size={sizeEnum} data={sampleData} />;
}
