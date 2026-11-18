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
            detailedBorders={detailedBorders}
            detailedBordersMinScale={detailedBordersMinScale}
            theme={theme}
            regionsEnabled={regionsEnabled}
            regionMinScale={regionMinScale}
            regionUrl={regionUrl}
            regionCountries={regionCountries}
            regionNameProperty={regionNameProperty}
            onRegionStatusChange={onRegionStatusChange}
            pinList={pinList}
            pinLatitude={pinLatitude}
            pinLongitude={pinLongitude}
            pinCaption={pinCaption}
            pinColor={pinColor}
        />
    );
}
