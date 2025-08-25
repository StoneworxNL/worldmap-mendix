import { createElement, useState, useEffect, useCallback } from "react";
import WorldMap from "react-svg-worldmap";

export function WorldMapComponent({
    countryList,
    countryISO,
    countryValue,
    sizeEnum,
    color,
    onClickAction,
    countryClickedISO
}) {
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

            if (countryClickedISO) {
                if (countryClickedISO.status !== "available") {
                    console.warn("countryClickedISO is not available.");
                    return;
                } else countryClickedISO.setValue(countryCode);
            }

            onClickAction.execute();
        },
        [onClickAction, countryClickedISO]
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
