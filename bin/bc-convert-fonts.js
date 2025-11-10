#!/usr/bin/env node

import { copyFile, mkdir, readFile, rm } from 'fs/promises';
import { dirname, join } from 'path';

import yaml from 'js-yaml';

import { autohintTtfFont } from '../src/autohint.js';
import { createWoff2Font } from '../src/fonts.js';

let configPath = null;
let sourcePath = null;
let targetPath = null;

for ( let i = 2; i < process.argv.length; i++ ) {
  const arg = process.argv[ i ];
  if ( arg[ 0 ] != '-' && configPath == null )
    configPath = arg;
  else if ( arg[ 0 ] != '-' && configPath != null && sourcePath == null )
    sourcePath = arg;
  else if ( arg[ 0 ] != '-' && configPath != null && sourcePath != null && targetPath == null )
    targetPath = arg;
  else
    help();
}

if ( configPath == null || sourcePath == null )
  help();

if ( targetPath == null )
  targetPath = dirname( configPath );

await convertFonts( configPath, sourcePath, targetPath );

async function convertFonts( configPath, sourcePath, targetPath ) {
  const {
    autohint = true,
    outputTTF = false,
    fonts,
  } = yaml.load( await readFile( configPath, 'utf-8' ) );

  const tempPath = 'node_modules/.bc-font-cache';

  await mkdir( tempPath, { recursive: true } );

  for ( const fontName in fonts ) {
    const sourceFontName = fonts[ fontName ];

    const sourceFontPath = join( sourcePath, `${sourceFontName}.ttf` );
    const ttfFontPath = join( outputTTF ? targetPath : tempPath, `${fontName}.ttf` );
    const woff2FontPath = join( targetPath, `${fontName}.woff2` );

    console.log( `converting ${sourceFontName}...` );

    if ( autohint ) {
      await autohintTtfFont( sourceFontPath, ttfFontPath );
      await createWoff2Font( ttfFontPath, woff2FontPath );
    } else {
      if ( outputTTF )
        await copyFile( sourceFontPath, ttfFontPath );
      await createWoff2Font( sourceFontPath, woff2FontPath );
    }

    if ( !outputTTF )
      await rm( ttfFontPath );
  }
}

function help() {
  console.log( 'Usage: bc-convert-fonts CONFIG IN_PATH [OUT_PATH]' );

  process.exit( 1 );
}
