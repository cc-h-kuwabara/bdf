import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const MAX_TEXT_PREVIEW_BYTES = 5 * 1024 * 1024; // 5 MiB
const MAX_HEX_DUMP_BYTES = 128 * 1024; // 128 KiB

export type LoadResult =
  | { kind: 'bdf'; data: Uint8Array }
  | {
      kind: 'text';
      content: string;
      truncated: boolean;
      isBinary?: boolean;
      totalBytes?: number;
      shownBytes?: number;
    };

export class BdfConverter {
  private static binaryPathCache: string | null = null;

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * bdfコマンドまたはgo実行コマンドを検出する
   */
  public async findBdfCommand(): Promise<{ command: string; args: string[] }> {
    // 1. VS Code 設定
    const configPath = vscode.workspace.getConfiguration('bdf').get<string>('bdfBinaryPath');
    if (configPath && fs.existsSync(configPath)) {
      return { command: configPath, args: [] };
    }

    // 2. 拡張機能内同梱バイナリ
    const extBinary = this.context.asAbsolutePath(
      path.join('dist', 'bin', process.platform === 'win32' ? 'bdf.exe' : 'bdf')
    );
    if (fs.existsSync(extBinary)) {
      return { command: extBinary, args: [] };
    }

    // 3. ワークスペース内 bin
    if (vscode.workspace.workspaceFolders) {
      for (const folder of vscode.workspace.workspaceFolders) {
        const wsBin = path.join(
          folder.uri.fsPath,
          'bin',
          process.platform === 'win32' ? 'bdf.exe' : 'bdf'
        );
        if (fs.existsSync(wsBin)) {
          return { command: wsBin, args: [] };
        }
      }
    }

    // 4. キャッシュ確認
    if (BdfConverter.binaryPathCache && fs.existsSync(BdfConverter.binaryPathCache)) {
      return { command: BdfConverter.binaryPathCache, args: [] };
    }

    // 5. PATH 上の bdf
    const bdfCmd = process.platform === 'win32' ? 'bdf.exe' : 'bdf';
    try {
      const checkCmd = process.platform === 'win32' ? 'where' : 'which';
      const { stdout } = await execFileAsync(checkCmd, [bdfCmd]);
      const found = stdout.trim().split(/\r?\n/)[0];
      if (found && fs.existsSync(found)) {
        BdfConverter.binaryPathCache = found;
        return { command: found, args: [] };
      }
    } catch {
      // PATHにない場合は次へ
    }

    // 6. Go がある場合はワークスペースの cmd/bdf を go run で実行
    if (vscode.workspace.workspaceFolders) {
      for (const folder of vscode.workspace.workspaceFolders) {
        const cmdBdfDir = path.join(folder.uri.fsPath, 'cmd', 'bdf');
        if (fs.existsSync(cmdBdfDir)) {
          try {
            await execFileAsync('go', ['version']);
            return {
              command: 'go',
              args: ['run', cmdBdfDir]
            };
          } catch {
            // go コマンドがない場合は無視
          }
        }
      }
    }

    throw new Error(
      'bdf CLI binary was not found. Please build bdf or specify its path in the "bdf.bdfBinaryPath" setting.'
    );
  }

  /**
   * 対象ファイルを BDF バイナリまたはテキストフォールバックとして読み込む
   */
  public async loadOrConvert(
    fileUri: vscode.Uri,
    password?: string,
    token?: vscode.CancellationToken
  ): Promise<LoadResult> {
    const filePath = fileUri.fsPath;
    const ext = path.extname(filePath).toLowerCase();

    // 拡張子が .bdf の場合は直接読み込む
    if (ext === '.bdf') {
      const data = await vscode.workspace.fs.readFile(fileUri);
      return { kind: 'bdf', data };
    }

    // 一時出力ファイルパスを生成
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bdf-preview-'));
    const tempOutFile = path.join(tempDir, 'output.bdf');

    try {
      const { command, args } = await this.findBdfCommand();
      const paramArgs: string[] = [];
      if (['.dxf', '.sxf', '.p21', '.p2z', '.sfc'].includes(ext)) {
        paramArgs.push('-param', 'background=light');
      } else if (ext === '.jww') {
        paramArgs.push('-param', 'colors=print');
      }
      const fullArgs = [...args, 'generate', ...paramArgs, filePath, tempOutFile];

      const env = { ...process.env };
      if (password) {
        env['BDF_PASSWORD'] = password;
      }

      await new Promise<void>((resolve, reject) => {
        if (token?.isCancellationRequested) {
          return reject(new vscode.CancellationError());
        }

        const proc = spawn(command, fullArgs, {
          env,
          windowsHide: true
        });

        let stderr = '';
        let stdout = '';

        proc.stdout.on('data', (d) => {
          stdout += d.toString();
        });

        proc.stderr.on('data', (d) => {
          stderr += d.toString();
        });

        const cancelSub = token?.onCancellationRequested(() => {
          proc.kill();
          reject(new vscode.CancellationError());
        });

        proc.on('error', (err) => {
          cancelSub?.dispose();
          reject(err);
        });

        proc.on('close', (code) => {
          cancelSub?.dispose();
          if (code === 0) {
            resolve();
          } else {
            if (stderr.includes('encrypted') || stderr.includes('password')) {
              reject(new PasswordRequiredError(stderr.trim()));
            } else {
              reject(
                new Error(
                  `BDF conversion failed (exit code ${code}): ${stderr.trim() || stdout.trim() || 'Unknown error'}`
                )
              );
            }
          }
        });
      });

      if (!fs.existsSync(tempOutFile)) {
        throw new Error('Failed to generate BDF file (output file not found).');
      }

      const buffer = await fs.promises.readFile(tempOutFile);
      return { kind: 'bdf', data: new Uint8Array(buffer) };
    } catch (err) {
      if (err instanceof PasswordRequiredError || err instanceof vscode.CancellationError) {
        throw err;
      }

      // BDF で変換できない非対応形式の場合は、テキストまたはバイナリの16進数ダンプとして読み込む
      const fallback = await this.tryReadFallback(fileUri);
      if (fallback) {
        return fallback;
      }

      throw err;
    } finally {
      // 一時ファイルのクリーンアップ
      try {
        if (fs.existsSync(tempOutFile)) {
          fs.unlinkSync(tempOutFile);
        }
        if (fs.existsSync(tempDir)) {
          fs.rmdirSync(tempDir);
        }
      } catch {
        // クリーンアップエラーは無視
      }
    }
  }

  /**
   * ファイルをテキスト、またはバイナリ（16進数ダンプ）として読み込む
   */
  private async tryReadFallback(fileUri: vscode.Uri): Promise<LoadResult | null> {
    try {
      const rawBytes = await vscode.workspace.fs.readFile(fileUri);
      const totalBytes = rawBytes.byteLength;

      // 1. UTF-16 BOM チェック
      if (totalBytes >= 2) {
        const isUtf16Le = rawBytes[0] === 0xff && rawBytes[1] === 0xfe;
        const isUtf16Be = rawBytes[0] === 0xfe && rawBytes[1] === 0xff;
        if (isUtf16Le || isUtf16Be) {
          const truncated = totalBytes > MAX_TEXT_PREVIEW_BYTES;
          const slice = truncated ? rawBytes.subarray(0, MAX_TEXT_PREVIEW_BYTES) : rawBytes;
          const content = new TextDecoder(isUtf16Le ? 'utf-16le' : 'utf-16be').decode(slice);
          return { kind: 'text', content, truncated, isBinary: false, totalBytes };
        }
      }

      // 2. バイナリ判定（NULLバイト・制御文字・UTF-8妥当性）
      let isBinary = false;
      const probeLen = Math.min(totalBytes, 8192);
      let controlCount = 0;
      for (let i = 0; i < probeLen; i++) {
        const b = rawBytes[i];
        if (b === 0) {
          isBinary = true;
          break;
        }
        // タブ(0x09), LF(0x0a), CR(0x0d) 以外の制御文字
        if ((b < 0x20 && b !== 0x09 && b !== 0x0a && b !== 0x0d) || b === 0x7f) {
          controlCount++;
        }
      }
      if (!isBinary && probeLen > 0 && controlCount / probeLen > 0.05) {
        isBinary = true;
      }

      if (!isBinary) {
        try {
          const truncated = totalBytes > MAX_TEXT_PREVIEW_BYTES;
          const slice = truncated ? rawBytes.subarray(0, MAX_TEXT_PREVIEW_BYTES) : rawBytes;
          const content = new TextDecoder('utf-8', { fatal: true }).decode(slice);
          return { kind: 'text', content, truncated, isBinary: false, totalBytes };
        } catch {
          // UTF-8 として不正なバイト列が含まれる場合はバイナリとして扱う
          isBinary = true;
        }
      }

      // 3. バイナリファイルの場合は 16進数ダンプ（hexdump -C 形式）を生成
      const truncated = totalBytes > MAX_HEX_DUMP_BYTES;
      const slice = truncated ? rawBytes.subarray(0, MAX_HEX_DUMP_BYTES) : rawBytes;
      const content = formatHexDump(slice);
      return {
        kind: 'text',
        content,
        truncated,
        isBinary: true,
        totalBytes,
        shownBytes: slice.byteLength
      };
    } catch {
      return null;
    }
  }
}

/**
 * バイト列を hexdump -C 形式の文字列に変換する
 */
function formatHexDump(bytes: Uint8Array): string {
  const lines: string[] = [];
  const total = bytes.byteLength;
  if (total === 0) {
    return '(empty file)';
  }

  for (let offset = 0; offset < total; offset += 16) {
    const addr = offset.toString(16).padStart(8, '0');
    let hexLeft = '';
    let hexRight = '';
    let ascii = '';

    for (let i = 0; i < 16; i++) {
      if (offset + i < total) {
        const b = bytes[offset + i];
        const hex = b.toString(16).padStart(2, '0');
        if (i < 8) {
          hexLeft += (i > 0 ? ' ' : '') + hex;
        } else {
          hexRight += (i > 8 ? ' ' : '') + hex;
        }
        ascii += b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.';
      } else {
        if (i < 8) {
          hexLeft += (i > 0 ? ' ' : '') + '  ';
        } else {
          hexRight += (i > 8 ? ' ' : '') + '  ';
        }
      }
    }

    lines.push(`${addr}  ${hexLeft}  ${hexRight}  |${ascii}|`);
  }

  return lines.join('\n');
}

export class PasswordRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordRequiredError';
  }
}

