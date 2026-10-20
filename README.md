# World Map Mendix Pluggable Widget

World Map Mendix Pluggable Widget based on
[https://yanivam.github.io/react-svg-worldmap/](https://yanivam.github.io/react-svg-worldmap/) that allows you to draw
countries on a world map.

<img alt="Mendix Pluggable Widget World Map Logo" src="https://raw.githubusercontent.com/StoneworxNL/worldmap-mendix/main/src/WorldMap.icon.png" width="65px"/>

![World Map demo: tooltips, On Click and the countries data](https://raw.githubusercontent.com/StoneworxNL/worldmap-mendix/main/images/demo.gif)

[Download the demo as a video (MP4, 41 s)](https://github.com/StoneworxNL/worldmap-mendix/releases/download/v2.2.0/WorldMap-demo.mp4)
· [Try the live demo](https://world-map-sandbox.mxapps.io/)

## Features

-   Shades each country by a number (Integer, Long or Decimal attribute): the higher the value, the stronger the color.
    Text (String) values highlight their countries and show the text in the tooltip.
-   Tooltips show the value formatted by Mendix in the user's language, with thousands separators, followed by an
    optional, translatable suffix such as "people".
-   A responsive size that fills its container, or fixed widths from 240px to 1200px.
-   An On Click action that receives the clicked country's ISO code.
-   Works anywhere on a page; no data view needed. The widget's Class and Style properties apply to the map.
-   A design-mode preview in Studio Pro.

## Requirements

Mendix 11.12.5 or later. The widget is built with the Mendix 11.15 widget tools and tested with Mendix 11.12.5.

## How To Use

1. Create an entity to store the countries (ISO code and value). It can be a database entity, or a non-persistent one
   that a microflow or nanoflow data source fills. Note that the value may be a number (Integer, Long, Decimal) or a
   string.
2. Add the 'World Map' widget to a page.
3. Set up the Countries' datasource, as well as the attributes you'd like to use for the ISO Code and Value.
4. Set the size and color. "Responsive" (the default) fills the width of its container, with a height of 3/4 of the
   width; the other sizes are fixed widths that shrink to fit a smaller container.
5. Optionally, set a value suffix to show after the value in the country tooltip, e.g. "people" (empty by default). It
   is a translatable text, so it can differ per language.

![The World Map properties in Studio Pro](https://raw.githubusercontent.com/StoneworxNL/worldmap-mendix/main/images/config.png)

## Properties

| Property     | Description                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Countries    | The data source with one object per country.                                                                                                                                                                                    |
| Country ISO  | String attribute with the country's two-letter ISO 3166-1 code, e.g. "PT". Case and surrounding spaces are ignored. Two regions use other codes; see "Tooltips and data" below.                                                 |
| Value        | Integer, Long, Decimal or String attribute. Numbers set how strongly the country is colored; text is shown in the tooltip.                                                                                                      |
| Value suffix | Optional, translatable text shown after the value in the tooltip, e.g. "people". Empty by default.                                                                                                                              |
| Size         | Responsive (Auto), the default: the full width of the container, with a height of 3/4 of the width. Or a fixed width: sm (240px), md (336px), lg (480px), xl (640px) or xxl (1200px), which shrinks to fit a smaller container. |
| Color        | Color of highlighted countries, e.g. "red" or "#0f828c". If left empty, the map uses light gray (`#dddddd`).                                                                                                                    |
| On Click     | Optional action to run when a country is clicked. The clicked country's ISO code is available to it as the `$clickedIsoCode` variable.                                                                                          |
| Class, Style | The Common tab's Class and Style properties are applied to the map's root element.                                                                                                                                              |

### Tooltips and data

A country's tooltip shows its name, its value and the value suffix, e.g. "Brazil 216,400,000 people". Values are
formatted by Mendix in the user's language, with thousands separators.

The map draws 175 countries and territories. 173 of them use their two-letter ISO 3166-1 code, e.g. "PT". The other two
use three-letter codes: Northern Cyprus is `CYP` and Somaliland is `SOM`. Those happen to be the official three-letter
codes of Cyprus and Somalia, so if your data uses three-letter codes, `CYP` and `SOM` color Northern Cyprus and
Somaliland instead of being skipped, and clicking either region passes `CYP` or `SOM` as `$clickedIsoCode`.

Objects without a value, or with an ISO code the map doesn't know (e.g. "PRT"), are not shown. If several objects have
the same ISO code (ignoring case and spaces), the last one with a value is used. Long tooltips may extend beyond the
map; a parent container with `overflow: hidden` will clip them.

## On Click Action

To handle clicks on the map, create a microflow or nanoflow with a String parameter to receive the clicked country's ISO
code, and select it as the widget's On Click action. In the action's settings, set that parameter to `$clickedIsoCode`.

![The On Click action, passing $clickedIsoCode to a nanoflow parameter](https://raw.githubusercontent.com/StoneworxNL/worldmap-mendix/main/images/onclick-settings.png)

![A nanoflow with a String parameter for the clicked ISO code](https://raw.githubusercontent.com/StoneworxNL/worldmap-mendix/main/images/onclick-nanoflow.png)

The ISO code comes from the browser, so treat it like any other user input: validate it in your microflow (for example,
check that a matching Country object exists) before using it.

## Studio Pro preview

In Design mode, Studio Pro draws the map with sample countries, using the configured size, color and value suffix. The
preview always uses sample numbers, so even a map with a String value shows graded shading in Studio Pro. Structure mode
shows Studio Pro's default widget box.

![The design-mode preview in Studio Pro](https://raw.githubusercontent.com/StoneworxNL/worldmap-mendix/main/images/preview.png)

## Live demo

[Try the World Map in a Mendix app running on the cloud](https://world-map-sandbox.mxapps.io/).

The demo shows four maps, one per value type: Integer (Responsive), String (240px), Long (336px) and Decimal (1200px),
each with its own value suffix in English and Dutch. Clicking a country on the first map runs a nanoflow that shows the
clicked ISO code. The Configure Countries page holds the data behind the maps. Its "Reset demo data" button, and a
scheduled event every day at 03:00 UTC, restore the sample data.

The demo is public, so please be mindful when changing its data, to keep it working for everyone.

### Countries' Configuration Example

![The Configure Countries page with a country's edit dialog](https://raw.githubusercontent.com/StoneworxNL/worldmap-mendix/main/images/configcountries.png)

### Demo

![The responsive map with a tooltip](https://raw.githubusercontent.com/StoneworxNL/worldmap-mendix/main/images/demoInt.png)

## Development

Building the widget needs Node 22, version 22.18 or later.

-   `npm run lint`: checks formatting and code style.
-   `npm test`: runs the unit tests.
-   `npm run build`: development build in `dist/<version>/`, also copied to the Mendix app set in `config.projectPath`.
-   `npm run release`: production build in `dist/<version>/`. Use this one for the Marketplace. It is not copied to the
    Mendix app: to try it, copy `dist/<version>/stoneworx.WorldMap.mpk` to the app's `widgets` folder yourself.

## Issues, suggestions and feature requests

Let us know if you find any issues or if you have any feature requests.
