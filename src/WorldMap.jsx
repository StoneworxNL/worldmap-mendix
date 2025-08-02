import { createElement } from "react";
import { WorldMapComponent } from "./components/WorldMapComponent";
// import "./ui/WorldMap.css";

export function WorldMap({ countryList, countryISO, countryValue, sizeEnum2, color }) {
    return (
        <WorldMapComponent
            countryList={countryList}
            countryISO={countryISO}
            countryValue={countryValue}
            sizeEnum={sizeEnum2}
            color={color}
        />
    );
}
