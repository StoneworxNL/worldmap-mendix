import "./ui/WorldMap.css";
import { WorldMapComponent } from "./components/WorldMapComponent";

export function WorldMap({
    class: className,
    style,
    countryList,
    countryISO,
    countryValue,
    valueSuffix,
    sizeEnum,
    color,
    onClickAction
}) {
    return (
        <WorldMapComponent
            className={className}
            style={style}
            countryList={countryList}
            countryISO={countryISO}
            countryValue={countryValue}
            valueSuffix={valueSuffix?.value}
            sizeEnum={sizeEnum}
            color={color}
            onClickAction={onClickAction}
        />
    );
}
