import "./ui/WorldMap.css";
import { WorldMapComponent } from "./components/WorldMapComponent";

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
