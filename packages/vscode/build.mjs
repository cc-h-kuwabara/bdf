import { build } from 'esbuild';
import { copyFile, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(dirname(__dirname));
const isWatch = process.argv.includes('--watch');

export const TARGET_MAP = {
  'win32-x64': { os: 'windows', arch: 'amd64', exe: 'bdf.exe' },
  'win32-arm64': { os: 'windows', arch: 'arm64', exe: 'bdf.exe' },
  'darwin-x64': { os: 'darwin', arch: 'amd64', exe: 'bdf' },
  'darwin-arm64': { os: 'darwin', arch: 'arm64', exe: 'bdf' },
  'linux-x64': { os: 'linux', arch: 'amd64', exe: 'bdf' },
  'linux-arm64': { os: 'linux', arch: 'arm64', exe: 'bdf' },
};

function parseTargetArg() {
  const targetIdx = process.argv.indexOf('--target');
  if (targetIdx !== -1 && process.argv[targetIdx + 1]) {
    const target = process.argv[targetIdx + 1];
    if (!TARGET_MAP[target]) {
      throw new Error(`Unsupported target: "${target}". Supported: ${Object.keys(TARGET_MAP).join(', ')}`);
    }
    return target;
  }
  return null;
}

async function ensureBdfBinary(target) {
  const targetInfo = target ? TARGET_MAP[target] : null;
  const exeName = targetInfo ? targetInfo.exe : (process.platform === 'win32' ? 'bdf.exe' : 'bdf');
  const cacheDir = targetInfo ? join(root, 'bin', target) : join(root, 'bin');
  const cachedExe = join(cacheDir, exeName);

  if (!existsSync(cachedExe)) {
    console.log(`Building bdf CLI binary for ${target || 'current platform'}...`);
    await mkdir(cacheDir, { recursive: true });
    const env = { ...process.env, CGO_ENABLED: '0' };
    if (targetInfo) {
      env.GOOS = targetInfo.os;
      env.GOARCH = targetInfo.arch;
    }
    await execFileAsync('go', ['build', '-o', cachedExe, './cmd/bdf'], {
      cwd: root,
      env,
    });
  }

  // Clean dist/bin and copy the target binary
  const distBin = join(__dirname, 'dist', 'bin');
  await rm(distBin, { recursive: true, force: true });
  await mkdir(distBin, { recursive: true });

  const dest = join(distBin, exeName);
  await copyFile(cachedExe, dest);
  console.log(`Copied bdf CLI binary to ${dest}`);
}

async function main() {
  const target = parseTargetArg();
  await mkdir(join(__dirname, 'dist'), { recursive: true });

  console.log(`Building VS Code Extension${target ? ` (target: ${target})` : ''}...`);

  // 1. Extension Host (Node.js)
  await build({
    entryPoints: [join(__dirname, 'src', 'extension.ts')],
    outfile: join(__dirname, 'dist', 'extension.js'),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    sourcemap: true,
    external: ['vscode'],
    logLevel: 'info',
  });

  // 2. Webview Script (Browser)
  await build({
    entryPoints: [join(__dirname, 'src', 'webview', 'main.ts')],
    outfile: join(__dirname, 'dist', 'webview.js'),
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2022',
    sourcemap: true,
    logLevel: 'info',
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

  // 5. Ensure bdf binary is built & copied
  await ensureBdfBinary(target);

  console.log(`Build completed successfully${target ? ` for ${target}` : ''}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
