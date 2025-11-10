import { readFile, writeFile } from 'fs/promises';

import svg2ttf from 'svg2ttf';
import { compress } from 'wawoff2';

export async function createTtfFont( sourcePath, targetPath ) {
  console.log( 'generating TTF font...' );

  const svfFontString = await readFile( sourcePath, 'utf-8' );

  const ttf = svg2ttf( svfFontString );

  await writeFile( targetPath, Buffer.from( ttf.buffer ) );
}

export async function createWoff2Font( sourcePath, targetPath ) {
  console.log( 'generating WOFF2 font...' );

  const ttf = await readFile( sourcePath );

  const woff2 = await compress( ttf );

  await writeFile( targetPath, Buffer.from( woff2 ) );
}

export async function createCss( path, glyphs, classPrefix ) {
  console.log( 'generating CSS file...' );

  const css = glyphs.map( glyph => `.${classPrefix}-${glyph.name}:before { content: "\\${glyph.codePoint.toString( 16 )}"; }\n` );

  await writeFile( path, css.join( '' ), 'utf-8' );
}
