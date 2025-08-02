import { createElement, useState, useEffect } from "react";
import WorldMap from "react-svg-worldmap";

export function WorldMapComponent({ countryList, countryISO, countryValue, sizeEnum, color }) {
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

    return (
        <div className="App">
            <WorldMap color={color} value-suffix="people" size={sizeEnum} data={countries} />
        </div>
    );
}
