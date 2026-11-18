// Custom additions to the pluggable-widgets-tools Rollup configuration (passed in as `configDefaultConfig`).
//
// react-svg-worldmap 2.7 loads its detailed (Natural Earth 10m) country borders on demand, with
// `import("./map-assets/countries-detailed.cjs")`. The tools bundle each widget into a single file, so Rollup can't
// split that 2.4 MB file into its own chunk. Inlining it would make every page with a map download it, zoomed in or
// not. Instead, the widget ships the borders as a JSON asset next to its JavaScript and fetches it the first time a
// user zooms in far enough. Studio Pro's design-mode preview never zooms, so there the import is never resolved.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
// The package's "exports" hide package.json, so find the package folder from its entry (dist/index.cjs).
const libraryRoot = dirname(dirname(require.resolve("react-svg-worldmap")));
const libraryVersion = JSON.parse(readFileSync(join(libraryRoot, "package.json"), "utf8")).version;
const detailedGeometrySource = join(libraryRoot, "dist/map-assets/countries-detailed.cjs");
const detailedImport = /import\(\s*["']\.\/map-assets\/countries-detailed\.cjs["']\s*\)/g;

// The library version is part of the file name, so browsers don't keep using cached borders after an upgrade.
const assetFileName = `countries-detailed-${libraryVersion}.json`;

// "module.exports = {...};" (after a comment header) -> the JSON text.
function readDetailedGeometryJson() {
    const source = readFileSync(detailedGeometrySource, "utf8");
    const json = source.slice(source.indexOf("{"), source.lastIndexOf("}") + 1);
    JSON.parse(json); // Fail the build if the library changes the file's format.
    return json;
}

/**
 * @param {"es" | "amd" | "preview"} target
 * @param {string} webPath the asset's path from the app's root URL, as the tools' own asset plugin writes it
 */
function detailedGeometry(target, webPath) {
    // `mx.remoteUrl` is the app's root URL. Mendix page URLs (/p/...) make a plain relative URL resolve wrongly.
    const loader =
        target === "preview"
            ? `Promise.reject(new Error("Detailed borders are not available in the Studio Pro preview."))`
            : `fetch(((typeof mx !== "undefined" && mx.remoteUrl) || "/") + ${JSON.stringify(webPath)}).then(` +
              `function (response) { if (!response.ok) throw new Error("World Map: " + response.status + " loading ` +
              `detailed borders"); return response.json(); })`;
    return {
        name: "worldmap-detailed-geometry",
        transform(code, id) {
            if (!id.replace(/\\/g, "/").includes("/react-svg-worldmap/dist/") || !detailedImport.test(code)) {
                return null;
            }
            detailedImport.lastIndex = 0;
            return { code: code.replace(detailedImport, loader), map: null };
        },
        generateBundle() {
            if (target !== "preview") {
                this.emitFile({
                    type: "asset",
                    fileName: `assets/${assetFileName}`,
                    source: readDetailedGeometryJson()
                });
            }
        }
    };
}

export default args =>
    args.configDefaultConfig.map(config => {
        const file = config.output.file.replace(/\\/g, "/");
        // dist/tmp/widgets/stoneworx/worldmap/WorldMap.(m)js -> stoneworx/worldmap
        const widgetDir = file.slice(
            file.indexOf("/dist/tmp/widgets/") + "/dist/tmp/widgets/".length,
            file.lastIndexOf("/")
        );
        let target;
        if (file.endsWith(".editorPreview.js")) {
            target = "preview";
        } else if (file.endsWith(".mjs")) {
            target = "es";
        } else if (!file.endsWith(".editorConfig.js")) {
            target = "amd";
        }
        if (!target) {
            return config;
        }
        // Same public paths as the tools' asset plugin: "dist/..." for the React client, "widgets/..." for Dojo.
        const webPath = `${target === "es" ? "dist" : "widgets"}/${widgetDir}/assets/${assetFileName}`;
        return { ...config, plugins: [detailedGeometry(target, webPath), ...config.plugins] };
    });
