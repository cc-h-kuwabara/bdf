import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

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
      'bdf CLIツールが見つかりません。bdf.exeをビルドするか、設定「bdf.bdfBinaryPath」でパスを指定してください。'
    );
  }

  /**
   * 対象ファイルを BDF バイナリ (Uint8Array) に変換または読み込む
   */
  public async loadOrConvert(
    fileUri: vscode.Uri,
    password?: string,
    token?: vscode.CancellationToken
  ): Promise<Uint8Array> {
    const filePath = fileUri.fsPath;
    const ext = path.extname(filePath).toLowerCase();

    // 拡張子が .bdf の場合は直接読み込む
    if (ext === '.bdf') {
      const data = await vscode.workspace.fs.readFile(fileUri);
      return data;
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
                  `BDF変換エラー (終了コード ${code}): ${stderr.trim() || stdout.trim() || '不明なエラー'}`
                )
              );
            }
          }
        });
      });

      // 変換結果を読み込み
      if (!fs.existsSync(tempOutFile)) {
        throw new Error('BDFファイルの生成に失敗しました（出力ファイルが見つかりません）');
      }

      const buffer = await fs.promises.readFile(tempOutFile);
      return new Uint8Array(buffer);
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
}

export class PasswordRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordRequiredError';
  }
}

