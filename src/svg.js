import { createReadStream, createWriteStream, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

import Svg from 'oslllo-svg-fixer/src/svg.js';
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont';

export async function traceSvgFiles( sourcePath, targetPath, glyphs, fontName, rebuild, traceResolution ) {
  for ( const glyph of glyphs ) {
    glyph.path = join( targetPath, `${fontName}-${glyph.name}.svg` );

    if ( !rebuild && existsSync( glyph.path ) )
      continue;

    console.log( `tracing ${glyph.name}...` );

    const svg = new Svg( join( sourcePath, `${glyph.name}.svg` ), traceResolution );
    const tracedSvg = await svg.process();

    await writeFile( glyph.path, tracedSvg );
  }
}

export function createSvgFont( targetPath, glyphs, options ) {
  return new Promise( async ( resolve, reject ) => {
    console.log( 'generating SVG font...' );

    const svgFontStream = new SVGIcons2SVGFontStream( {
      fontHeight: 1000,
      descent: 150,
      normalize: true,
      ...options,
    } );

    svgFontStream.pipe( createWriteStream( join( targetPath, `${options.fontName}.svg` ) ) )
      .on( 'finish', resolve )
      .on( 'error', reject );

    for ( const glyph of glyphs ) {
      const glyphStream = createReadStream( glyph.path );

      glyphStream.metadata = {
        name: glyph.name,
        unicode: [ String.fromCodePoint( glyph.codePoint ) ],
      }

      svgFontStream.write( glyphStream );
    }

    svgFontStream.end();
  } );
}
