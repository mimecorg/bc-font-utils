#!/usr/bin/env node

import { mkdir, readFile, rm } from 'fs/promises';
import { basename, dirname, extname, join } from 'path';

import yaml from 'js-yaml';

import { autohintTtfFont } from '../src/autohint.js';
import { createCss, createTtfFont, createWoff2Font } from '../src/fonts.js';
import { createSvgFont, traceSvgFiles } from '../src/svg.js';

let configPath = null;
let targetPath = null;
let rebuild = false;

for ( let i = 2; i < process.argv.length; i++ ) {
  const arg = process.argv[ i ];
  switch ( arg ) {
    case '--rebuild':
      rebuild = true;
      break;

    default:
      if ( arg[ 0 ] != '-' && configPath == null )
        configPath = arg;
      else if ( arg[ 0 ] != '-' && configPath != null && targetPath == null )
        targetPath = arg;
      else
        help();
      break;
  }
}

if ( configPath == null )
  help();

if ( targetPath == null )
  targetPath = dirname( configPath );

await buildIcons( configPath, targetPath, rebuild );

async function buildIcons( configPath, targetPath, rebuild ) {
  const {
    options = {},
    traceResolution = 800,
    autohint = true,
    outputTTF = false,
    cssClassPrefix = 'icon',
    icons,
  } = yaml.load( await readFile( configPath, 'utf-8' ) );

  if ( options.fontName == null )
    options.fontName = basename( configPath, extname( configPath ) );

  const info = JSON.parse( await readFile( 'node_modules/lucide-static/font/info.json', 'utf-8' ) );

  const availableIcons = icons.filter( icon => {
    if ( info[ icon ] != null ) {
      return true;
    } else {
      console.log( `Warning: unknown icon "${icon}"` );
      return false;
    }
  } );

  const glyphs = availableIcons.map( icon => ( {
    name: icon,
    codePoint: Number( info[ icon ].encodedCode.replace( '\\', '0x' ) ),
    path: null,
  } ) );

  glyphs.sort( ( a, b ) => a.name.localeCompare( b.name ) );

  const tempPath = 'node_modules/.bc-font-cache';

  await mkdir( tempPath, { recursive: true } );

  await traceSvgFiles( 'node_modules/lucide-static/icons', tempPath, glyphs, options.fontName, rebuild, traceResolution );

  const svgFontPath = join( tempPath, `${options.fontName}.svg` );
  const ttfFontPath = join( outputTTF ? targetPath : tempPath, `${options.fontName}.ttf` );
  const woff2FontPath = join( targetPath, `${options.fontName}.woff2` );
  const cssPath = join( targetPath, `${options.fontName}.css` );

  await createSvgFont( svgFontPath, glyphs, options );

  if ( autohint ) {
    const tempFontPath = join( tempPath, `${options.fontName}.tmp.ttf` );
    await createTtfFont( svgFontPath, tempFontPath );
    await rm( svgFontPath );
    await autohintTtfFont( tempFontPath, ttfFontPath );
    await rm( tempFontPath );
  } else {
    await createTtfFont( svgFontPath, ttfFontPath );
    await rm( svgFontPath );
  }

  await createWoff2Font( ttfFontPath, woff2FontPath );
  if ( !outputTTF )
    await rm( ttfFontPath );

  await createCss( cssPath, glyphs, cssClassPrefix );
}

function help() {
  console.log( 'Usage: bc-build-icons [--rebuild] CONFIG [OUT_PATH]' );

  process.exit( 1 );
}
