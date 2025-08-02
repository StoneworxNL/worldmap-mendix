import { createElement } from "react";

import { HelloWorldSample } from "./components/HelloWorldSample";
import "./ui/WorldMap.css";

export function WorldMap({ countryList, countryISO, countryValue, sizeEnum, color }) {
    return (
        <HelloWorldSample
            countryList={countryList}
            countryISO={countryISO}
            countryValue={countryValue}
            sizeEnum={sizeEnum}
            color={color}
        />
    );
}
