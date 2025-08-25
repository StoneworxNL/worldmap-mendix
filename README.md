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

## On Click

If you want to handle clicks on the map, make sure you create an "onClick" action and set it in the Widget's General
settings. To know which country was clicked:

1. Wrap the World Map widget inside a dataview.
2. Add the "Clicked Country" attribute to know the ISO Code of the clicked country.
3. Add the object in context as an input of the action created in 1.

<img alt="OnClick Configurations" src="https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/demoAction.png" width="400px"/>
<img alt="Microflow Example" src="https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/microflow.png" width="400px"/>

## Demo project

-   [Mendix app running on the cloud](https://world-map-sandbox.mxapps.io/index.html?profile=Responsive)
-   [Mendix demo module (.mpk)](https://github.com/StoneworxNL/worldmap-mendix/blob/main/demo/WorldMap.mpk)

You can check the demo [here](https://world-map-sandbox.mxapps.io/index.html?profile=Responsive). Please be mindful of
changing the data, as to keep the demo working for every user.

### Contries' Configuration Example

![Countries Configuration](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/configcountries.png)

![]

### Demo

![Demo (1)](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/demo.gif)
![Demo (2)](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/demoInt.png)

## Issues, suggestions and feature requests

Let us know if you find any issues or if you have any feature requests.
