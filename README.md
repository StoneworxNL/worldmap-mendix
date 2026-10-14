# World Map Mendix Pluggable Widget

World Map Mendix Pluggable Widget based on
[https://yanivam.github.io/react-svg-worldmap/](https://yanivam.github.io/react-svg-worldmap/) that allows you to draw
countries on a world map.

<img alt="Mendix Pluggable Widget World Map Logo" src="https://github.com/StoneworxNL/worldmap-mendix/blob/main/src/WorldMap.icon.png" width="65px"/>

## Requirements

Mendix 10.21 or later: the On Click action passes the clicked ISO code as an action variable, which Mendix added in
10.21. The widget is built with the Mendix 11 widget tools and has been tested with Mendix 11.12.5 only.

## How To Use

1. Create a database entity to store the Country (ISO Code and Value). Note that the value may be a number (Integer,
   Long, Decimal) or a string.
2. Add the 'World Map' widget to a page.
3. Set up the Countries' datasource, as well as the attributes you'd like to use for the ISO Code and Value.
4. Set the size and color. "Responsive" (the default) fills the width of its container, with a height of 3/4 of the
   width; the other sizes are fixed widths that shrink to fit a smaller container.
5. Optionally, set a value suffix to show after the value in the country tooltip, e.g. "people" (empty by default). It
   is a translatable text, so it can differ per language.

Tooltip values are formatted by Mendix in the user's language, with thousands separators. Objects without a value, or
with an ISO code the map doesn't know (it uses two-letter ISO 3166-1 codes, e.g. "PT"), are not shown. If several
objects have the same ISO code (ignoring case and spaces), the last one with a value is used. Long tooltips may extend
beyond the map; a parent container with `overflow: hidden` will clip them.

![Configuration in Studio Pro](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/config.png)

## On Click Action

To handle clicks on the map, create a microflow or nanoflow with a String parameter to receive the clicked country's ISO
code, and select it as the widget's On Click action. In the action's settings, set that parameter to `$clickedIsoCode`.

The ISO code comes from the browser, so treat it like any other user input: validate it in your microflow (for example,
check that a matching Country object exists) before using it.

## Demo project

-   [Mendix app running on the cloud](https://world-map-sandbox.mxapps.io/index.html?profile=Responsive)
-   [Mendix demo module (.mpk)](https://github.com/StoneworxNL/worldmap-mendix/blob/main/demo/WorldMap.mpk) (requires
    Studio Pro 11.12.5 or later)

The demo module includes a "Reset demo data" button and a scheduled event, `SE_Country_ResetDemoData`, that replaces all
demo countries with the sample data every day at 03:00 UTC. Scheduled events only run where they're enabled for the
environment; delete or disable the event if you don't want the daily reset.

You can check the demo [here](https://world-map-sandbox.mxapps.io/index.html?profile=Responsive). Please be mindful of
changing the data, as to keep the demo working for every user.

### Countries' Configuration Example

![Countries Configuration](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/configcountries.png)

### Demo

![Demo (1)](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/demo.gif)
![Demo (2)](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/demoInt.png)

## Development

-   `npm run lint`: checks formatting and code style.
-   `npm test`: runs the unit tests.
-   `npm run build`: development build in `dist/<version>/`, also copied to the Mendix app set in `config.projectPath`.
-   `npm run release`: production build in `dist/<version>/`. Use this one for the Marketplace and for the demo module.
    It is not copied to the Mendix app: copy `dist/<version>/stoneworx.WorldMap.mpk` to the app's `widgets` folder
    yourself before exporting the demo module.

## Issues, suggestions and feature requests

Let us know if you find any issues or if you have any feature requests.
