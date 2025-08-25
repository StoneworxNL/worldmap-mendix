import { createElement } from "react";
import { WorldMapComponent } from "./components/WorldMapComponent";
// import "./ui/WorldMap.css";

export function WorldMap({ countryList, countryISO, countryValue, sizeEnum, color, onClickAction, countryClickedISO }) {
    return (
        <WorldMapComponent
            countryList={countryList}
            countryISO={countryISO}
            countryValue={countryValue}
            sizeEnum={sizeEnum}
            color={color}
            onClickAction={onClickAction}
            countryClickedISO={countryClickedISO}
        />
    );
}
