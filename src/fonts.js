import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import svg2ttf from 'svg2ttf';
import { compress } from 'wawoff2';

export async function createTtfFont( sourcePath, targetPath, fontName ) {
  console.log( 'generating TTF font...' );

  const svfFontString = await readFile( join( sourcePath, `${fontName}.svg` ), 'utf-8' );

  const ttf = svg2ttf( svfFontString );

  await writeFile( join( targetPath, `${fontName}.ttf` ), Buffer.from( ttf.buffer ) );
}

export async function createWoff2Font( sourcePath, targetPath, fontName ) {
  console.log( 'generating WOFF2 font...' );

  const ttf = await readFile( join( sourcePath, `${fontName}.ttf` ) );

  const woff2 = await compress( ttf );

  await writeFile( join( targetPath, `${fontName}.woff2` ), Buffer.from( woff2 ) );
}

export async function createCss( path, glyphs, fontName, classPrefix ) {
  console.log( 'generating CSS file...' );

  const css = glyphs.map( glyph => `.${classPrefix}-${glyph.name}:before { content: "\\${glyph.codePoint.toString( 16 )}"; }\n` );

  await writeFile( join( path, `${fontName}.css` ), css.join( '' ), 'utf-8' );
}
