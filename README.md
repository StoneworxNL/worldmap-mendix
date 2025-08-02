# World Map Mendix Pluggable Widget

World Map Mendix Pluggable Widget based on
[https://yanivam.github.io/react-svg-worldmap/](https://yanivam.github.io/react-svg-worldmap/) that allows you to draw
contries on a world map.

<img alt="Mendix Pluggable Widget World Map Logo" src="https://github.com/StoneworxNL/worldmap-mendix/blob/main/src/WorldMap.icon.png" width="65px"/>

## How To Use

1. Create a database entity to store the Country (ISO Code and Value). Note that the value may be a number (Integer,
   Long, Decimal) or a string.
2. Add the 'World Map' widget to a page.
3. Set up the Countries' datasource, as well as the attributes you'd like to use for the ISO Code and Value.
4. Set the size and color.

![Configuration in Studio Pro](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/config.png)

## Demo project

-   [Mendix app running on the cloud](https://world-map-sandbox.mxapps.io/index.html?profile=Responsive)
-   [Mendix demo module (.mpk)](https://github.com/StoneworxNL/worldmap-mendix/blob/main/demo/WorldMap.mpk)

You can check the demo [here](https://world-map-sandbox.mxapps.io/index.html?profile=Responsive). Please be mindful of
changing the data, as to keep the demo working for every user.

### Contries' Configuration Example

![Countries Configuration](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/configcountries.png)

### Demo

![Demo (1)](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/demo.gif)
![Demo (2)](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/demoInt.png)
