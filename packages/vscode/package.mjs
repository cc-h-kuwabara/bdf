import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TARGET_MAP } from './build.mjs';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

const ALL_TARGETS = Object.keys(TARGET_MAP);

function getHostTarget() {
  const os = process.platform;
  const arch = process.arch;
  if (os === 'win32' && arch === 'x64') return 'win32-x64';
  if (os === 'win32' && arch === 'arm64') return 'win32-arm64';
  if (os === 'darwin' && arch === 'x64') return 'darwin-x64';
  if (os === 'darwin' && arch === 'arm64') return 'darwin-arm64';
  if (os === 'linux' && arch === 'x64') return 'linux-x64';
  if (os === 'linux' && arch === 'arm64') return 'linux-arm64';
  return 'linux-x64';
}

async function packageTarget(target) {
  console.log(`\n========================================`);
  console.log(` Packaging for target: ${target}`);
  console.log(`========================================`);

  // 1. Build extension with target binary
  const buildArgs = ['build.mjs'];
  if (target) {
    buildArgs.push('--target', target);
  }
  const { stdout: buildStdout, stderr: buildStderr } = await execFileAsync('node', buildArgs, {
    cwd: __dirname,
    env: process.env,
  });
  if (buildStdout) console.log(buildStdout.trim());
  if (buildStderr) console.error(buildStderr.trim());

  // 2. Run vsce package --target
  const vsceArgs = ['@vscode/vsce', 'package', '--no-dependencies', '--skip-license'];
  if (target) {
    vsceArgs.push('--target', target);
  }

  const { stdout, stderr } = await execFileAsync('npx', vsceArgs, {
    cwd: __dirname,
    env: process.env,
  });
  if (stdout) console.log(stdout.trim());
  if (stderr) console.error(stderr.trim());
}

async function main() {
  const args = process.argv.slice(2);
  let targets = [];

  if (args.length === 0) {
    // デフォルト: 現在のホストプラットフォーム
    targets = [getHostTarget()];
  } else if (args.includes('all')) {
    targets = ALL_TARGETS;
  } else {
    for (const arg of args) {
      if (!TARGET_MAP[arg]) {
        console.error(`Unknown target: ${arg}. Valid targets: ${ALL_TARGETS.join(', ')} (or "all")`);
        process.exit(1);
      }
      targets.push(arg);
    }
  }

  console.log(`Target platforms to package: ${targets.join(', ')}`);

  for (const target of targets) {
    await packageTarget(target);
  }

  console.log(`\nAll packages created successfully!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
