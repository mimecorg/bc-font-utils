# Bulletcode font utilities

A collection of tools for creating web fonts from SVG images.


## Commands

```
bc-build-icons [--rebuild] CONFIG [OUT_PATH]
```

Create TTF and WOFF2 fonts from SVG icons using the given configuration file and optional output path. It defaults to the directory in which the configuration file is located. A CSS file containing icon classes (with a configurable prefix) is also generated.

When the `--rebuild` option is specified, cached SVG images are re-generated even if they already exist.

Currently the tool can import SVG icons from the [lucide-static](https://lucide.dev/guide/packages/lucide-static) package. It can be used to create a customized version of the static icon fonts which contain only icons which are needed.

The tool uses the following packages:

 - [oslllo-svg-fixer](https://github.com/oslllo/svg-fixer) - to trace input SVG images to single path SVG images suitable for using in fonts
 - [svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont) - to convert individual SVG images to a SVG icon file
 - [svg2tiff](https://github.com/fontello/svg2ttf) - to convert the SVG icon file to a TTF font
 - [wawoff2](https://github.com/fontello/wawoff2) - to compress the TTF font to WOFF2 format


## Configuration

Example configuration file:

```yaml
options:
  fontName: lucide
  fontHeight: 1000
  descent: 150
  normalize: true

traceResolution: 800

cssClassPrefix: icon

icons:
 - calendar
 - file
 - list-todo
 - users
 - ...
```

The configuration file should use the YAML format. It must contain at least the list of icons to include in the generated fonts. All other parameters are optional.

 - `options` are described in the [svgicons2svgfont API documentation](https://github.com/nfroidure/svgicons2svgfont?tab=readme-ov-file#api); the `fontName` is also used as the file name for generated files
 - `traceResolution` is the resolution used for tracing single path SVG images
 - `cssClassPrefix` is used in the generated CSS file (defaults to `icon`)
