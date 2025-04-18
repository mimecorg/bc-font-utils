import { spawn } from 'child_process';
import { access, constants } from 'fs/promises';
import { delimiter, dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname( fileURLToPath( import.meta.url ) );

export async function autohintTtfFont( sourcePath, targetPath, fontName ) {
  console.log( 'autohinting TTF font...' );

  const ttfautohintPaht = await findTtfautohintPath();

  const input = join( sourcePath, `${fontName}.ttf` );
  const output = join( targetPath, `${fontName}.ttf` );

  await spawnProcess( ttfautohintPaht, [ '--symbol', '--stem-width-mode=sss', input, output ] );
}

async function findTtfautohintPath() {
  if ( process.platform == 'win32' )
    return resolve( __dirname, '../ttfautohint/ttfautohint.exe' );

  for ( const dir of process.env.PATH.split( delimiter ) ) {
    const path = join( dir, 'ttfautohint' );
    try {
      await access( path, constants.R_OK | constants.X_OK );
      return path;
    } catch {
    }
  }

  throw new Error( 'Could not find ttfautohint' );
}

function spawnProcess( command, args, options = {} ) {
  return new Promise( ( resolve, reject ) => {
    spawn( command, args, { ...options, stdio: 'inherit', env: process.env } )
      .on( 'exit', resolve )
      .on( 'error', reject );
  } );
}
