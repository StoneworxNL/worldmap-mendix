import { WorldMapComponent } from "./components/WorldMapComponent";
// import "./ui/WorldMap.css";

export function WorldMap({ countryList, countryISO, countryValue, valueSuffix, sizeEnum, color, onClickAction }) {
    return (
        <WorldMapComponent
            countryList={countryList}
            countryISO={countryISO}
            countryValue={countryValue}
            valueSuffix={valueSuffix}
            sizeEnum={sizeEnum}
            color={color}
            onClickAction={onClickAction}
        />
    );
}
