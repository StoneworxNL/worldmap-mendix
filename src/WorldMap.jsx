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
            zoomEnabled={zoomEnabled}
            zoomMaxScale={zoomMaxScale}
            zoomShowControls={zoomShowControls}
            showCountryLabels={showCountryLabels}
            labelColor={labelColor}
            pinList={pinList}
            pinLatitude={pinLatitude}
            pinLongitude={pinLongitude}
            pinCaption={pinCaption}
            pinColor={pinColor}
        />
    );
}
