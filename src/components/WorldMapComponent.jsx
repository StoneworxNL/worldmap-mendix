import { createElement, useState, useEffect, useCallback } from "react";
import WorldMap from "react-svg-worldmap";

export function WorldMapComponent({ countryList, countryISO, countryValue, sizeEnum, color, onClickAction }) {
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        if (countryList && countryList.status === "available") {
            const formattedCountries = countryList.items.map(country => ({
                country: countryISO.get(country).value,
                value: countryValue.get(country).value
            }));
            console.log();
            setCountries(formattedCountries);
        }
    }, [countryList]);

    const clickAction = useCallback(
        ({ countryCode }) => {
            if (!onClickAction) return;

            if (onClickAction.isExecuting || !onClickAction.canExecute) {
                console.warn("onClickAction cannot be executed.");
                return;
            }
            onClickAction.execute({ clickedIsoCode: countryCode });
        },
        [onClickAction]
    );

    return (
        <div className="App">
            <WorldMap
                color={color}
                value-suffix="people"
                size={sizeEnum}
                data={countries}
                onClickFunction={clickAction}
            />
        </div>
    );
}
