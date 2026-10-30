import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(dirname(__dirname));
const isWatch = process.argv.includes('--watch');

async function main() {
  await mkdir(join(__dirname, 'dist'), { recursive: true });
  await mkdir(join(__dirname, 'dist', 'bin'), { recursive: true });

  console.log('Building VS Code Extension...');

  // 1. Extension Host (Node.js)
  const extCtx = await build({
    entryPoints: [join(__dirname, 'src', 'extension.ts')],
    outfile: join(__dirname, 'dist', 'extension.js'),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    sourcemap: true,
    external: ['vscode'],
    logLevel: 'info'
  });

  // 2. Webview Script (Browser)
  const webviewCtx = await build({
    entryPoints: [join(__dirname, 'src', 'webview', 'main.ts')],
    outfile: join(__dirname, 'dist', 'webview.js'),
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2022',
    sourcemap: true,
    logLevel: 'info'
  });

  // 3. Copy CSS
  await copyFile(
    join(__dirname, 'src', 'webview', 'style.css'),
    join(__dirname, 'dist', 'style.css')
  );
  console.log('Copied style.css');

  // 4. Copy Worker
  const workerSrc = join(root, 'packages', 'render', 'dist', 'worker.js');
  if (existsSync(workerSrc)) {
    await copyFile(workerSrc, join(__dirname, 'dist', 'worker.js'));
    console.log('Copied worker.js');
  } else {
    console.warn('Warning: packages/render/dist/worker.js not found. Run npm run build first.');
  }

  // 5. Copy bdf binary if exists
  const bdfExe = join(root, 'bin', process.platform === 'win32' ? 'bdf.exe' : 'bdf');
  if (existsSync(bdfExe)) {
    const dest = join(__dirname, 'dist', 'bin', process.platform === 'win32' ? 'bdf.exe' : 'bdf');
    await copyFile(bdfExe, dest);
    console.log(`Copied bdf CLI binary to ${dest}`);
  }

  console.log('Build completed successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
