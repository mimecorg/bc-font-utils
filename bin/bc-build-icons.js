#!/usr/bin/env node

import { mkdir, readFile } from 'fs/promises';
import { basename, dirname, extname } from 'path';

import yaml from 'js-yaml';

import { autohintTtfFont } from '../src/autohint.js';
import { createCss, createTtfFont, createWoff2Font } from '../src/fonts.js';
import { createSvgFont, traceSvgFiles } from '../src/svg.js';

let configPath = null;
let outPath = null;
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
      else if ( arg[ 0 ] != '-' && configPath != null && outPath == null )
        outPath = arg;
      else
        help();
      break;
  }
}

if ( configPath == null )
  help();

if ( outPath == null )
  outPath = dirname( configPath );

await buildIcons( configPath, outPath, rebuild );

async function buildIcons( configPath, outPath, rebuild ) {
  const {
    options = {},
    traceResolution = 800,
    autohint = true,
    cssClassPrefix = 'icon',
    icons,
  } = yaml.load( await readFile( configPath, 'utf-8' ) );

  if ( options.fontName == null )
    options.fontName = basename( configPath, extname( configPath ) );

  const info = JSON.parse( await readFile( 'node_modules/lucide-static/font/info.json', 'utf-8' ) );

  const glyphs = icons.map( icon => ( {
    name: icon,
    codePoint: Number( info[ icon ].encodedCode.replace( '\\', '0x' ) ),
    path: null,
  } ) );

  glyphs.sort( ( a, b ) => a.name.localeCompare( b.name ) );

  const tempPath = 'node_modules/.bc-font-cache';

  await mkdir( tempPath, { recursive: true } );

  await traceSvgFiles( 'node_modules/lucide-static/icons', tempPath, glyphs, options.fontName, rebuild, traceResolution );

  await createSvgFont( tempPath, glyphs, options );

  if ( autohint ) {
    await createTtfFont( tempPath, tempPath, options.fontName );
    await autohintTtfFont( tempPath, outPath, options.fontName );
  } else {
    await createTtfFont( tempPath, outPath, options.fontName );
  }

  await createWoff2Font( outPath, outPath, options.fontName );

  await createCss( outPath, glyphs, options.fontName, cssClassPrefix );
}

function help() {
  console.log( 'Usage: bc-build-icons [--rebuild] CONFIG [OUT_PATH]' );

  process.exit( 1 );
}
