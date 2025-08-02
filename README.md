## World Map Mendix Pluggable Widget

World Map Mendix Pluggable Widget based on
[https://yanivam.github.io/react-svg-worldmap/](https://yanivam.github.io/react-svg-worldmap/) that allows you to draw
contries on a world map.

<img alt="Mendix Pluggable Widget World Map Logo" src="https://github.com/StoneworxNL/worldmap-mendix/blob/main/src/WorldMap.logo.png" width="65px"/>

<!-- ## Features
Mendix pluggable widget where you can simply add an editor to your web application.
From [BlockNote (Github README), ](https://github.com/TypeCellOS/BlockNote)we can see all of the features and components provided by the editor. Some of them are:

*   Animations;

*   Helpful Placeholders;

*   Drag and Drop Blocks;

*   Nesting / indentation with tab and shift+tab;

*   Slash (/) menu;

*   Format menu;

*   Ctrl+Z, Ctrl+Y to undo and redo, respectively;

*   Editable and View-only modes;

*   Resizable/responsive;

*   Option to preload and save content (JSON);

*   Customize scss. The editor is wrapped by the css classes below:

    *   .blocknote-mendix-wrapper
    *   .blocknote-mx-dark (for dark mode only) -->

## Usage

1. Create a database entity to store the Country (ISO Code and Value). Note that the value may be a number (Integer,
   Long, Decimal) or a string.
2. Add the 'World Map' widget to a page.
3. Set up the Countries' datasource, as well as the attributes you'd like to use for the ISO Code and Value.
4. Set the size and color.

![Configuration in Studio Pro](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/config.png)

### Demo

You can check the demo [here](https://world-map-sandbox.mxapps.io/index.html?profile=Responsive). Please be mindful of
changing the data, as to keep the demo working for every user.

![Demo](https://github.com/StoneworxNL/worldmap-mendix/blob/main/images/demo.gif)

![Usage in Mendix Studio Pro](https://github.com/StoneworxNL/block-note-mendix/blob/main/images/studioproconfig.png)

## Demo project

-   [Mendix app running on the cloud](https://block-note-demo-sandbox.mxapps.io/index.html?profile=Responsive)
-   [Mendix demo module (.mpk)](https://github.com/StoneworxNL/block-note-mendix/blob/main/demo/BlockNoteDemo.mpk)
-   [Mendix demo scss (.scss)](https://github.com/StoneworxNL/block-note-mendix/blob/main/demo/demo.scss)

## Issues, suggestions and feature requests

Minor issue with the Code Block, where the code is all coloured black, so there's no colour to distinguish different
parts of a code snippet. We are working in improving it and adding features to make this widget more flexible for
different purposes. Feel free to suggest us new features and report issues.

## License

BlockNote (the library upon this widget is based on) is licensed under the
[MPL 2.0 license](https://fossa.com/blog/open-source-software-licenses-101-mozilla-public-license-2-0/), which allows
you to use BlockNote in commercial (and closed-source) applications. If you make changes to the
[BlockNote source files](https://github.com/TypeCellOS/BlockNote), you are expected to publish these changes, so that
the rest of the community can benefit as well.

⚠️ If you download this widget from the Mendix Marketplace and **change the Block Note's source code, not the widget's
code itself**, you are expected to publish them [here](https://github.com/TypeCellOS/BlockNote), as per the license
mentioned above.

The widget itself is under MIT. -->
