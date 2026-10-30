import * as vscode from 'vscode';
import * as path from 'path';
import { BdfConverter, PasswordRequiredError } from './converter.js';
import { getThemeForExtension, setThemeForExtension } from './associationManager.js';
import { getWebviewContent } from './html.js';
import type { HostToWebviewMessage, WebviewToHostMessage } from './types.js';

class BdfDocument implements vscode.CustomDocument {
  private readonly _onDidDispose = new vscode.EventEmitter<void>();
  public readonly onDidDispose = this._onDidDispose.event;

  private readonly _onDidChange = new vscode.EventEmitter<void>();
  public readonly onDidChange = this._onDidChange.event;

  private readonly watcher: vscode.FileSystemWatcher;

  constructor(public readonly uri: vscode.Uri) {
    this.watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(path.dirname(uri.fsPath), path.basename(uri.fsPath))
    );
    this.watcher.onDidChange(() => this._onDidChange.fire());
  }

  dispose(): void {
    this.watcher.dispose();
    this._onDidDispose.fire();
    this._onDidDispose.dispose();
    this._onDidChange.dispose();
  }
}

export class BdfCustomEditorProvider implements vscode.CustomReadonlyEditorProvider<BdfDocument> {
  public static readonly viewType = 'bdf.previewEditor';

  private readonly converter: BdfConverter;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.converter = new BdfConverter(context);
  }

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new BdfCustomEditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      BdfCustomEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        },
        supportsMultipleEditorsPerDocument: true
      }
    );
  }

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<BdfDocument> {
    return new BdfDocument(uri);
  }

  async resolveCustomEditor(
    document: BdfDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): Promise<void> {
    const webview = webviewPanel.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist')
      ]
    };

    const fileName = path.basename(document.uri.fsPath);
    webview.html = getWebviewContent(webview, this.context.extensionUri, fileName);

    let currentPassword: string | undefined = undefined;

    const postToWebview = (msg: HostToWebviewMessage) => {
      webview.postMessage(msg);
    };

    const loadAndSendDocument = async (retryPassword = false) => {
      postToWebview({
        type: 'loading',
        filename: fileName,
        message: `${fileName} を変換・読み込み中...`
      });

      try {
        const bdfBytes = await this.converter.loadOrConvert(document.uri, currentPassword, token);
        const cfg = vscode.workspace.getConfiguration('bdf');
        const theme = getThemeForExtension(document.uri.fsPath);
        const defaultLayout = cfg.get<string>('defaultLayout', 'single');
        const defaultZoom = cfg.get<number>('defaultZoom', 1.0);
        postToWebview({
          type: 'open',
          buffer: bdfBytes.buffer.slice(bdfBytes.byteOffset, bdfBytes.byteOffset + bdfBytes.byteLength),
          filename: fileName,
          theme,
          defaultLayout,
          defaultZoom
        });
      } catch (err: any) {
        if (err instanceof PasswordRequiredError || err.name === 'PasswordRequiredError') {
          // パスワード入力プロンプトを表示
          const prompt = retryPassword
            ? 'パスワードが間違っています。再度入力してください:'
            : 'このファイルは暗号化されています。パスワードを入力してください:';

          const input = await vscode.window.showInputBox({
            prompt,
            password: true,
            ignoreFocusOut: true
          });

          if (input !== undefined) {
            currentPassword = input;
            await loadAndSendDocument(true);
            return;
          }
        }

        postToWebview({
          type: 'error',
          message: err.message || String(err)
        });
      }
    };

    // Webview からのイベントリスナー
    const messageSub = webview.onDidReceiveMessage(async (msg: WebviewToHostMessage) => {
      switch (msg.type) {
        case 'ready':
          await loadAndSendDocument();
          break;
        case 'error':
          vscode.window.showErrorMessage(`BDFプレビューエラー: ${msg.message}`);
          break;
        case 'themeChanged': {
          await setThemeForExtension(document.uri.fsPath, msg.theme);
          break;
        }
        case 'requestPassword': {
          const input = await vscode.window.showInputBox({
            prompt: 'パスワードを入力してください:',
            password: true,
            ignoreFocusOut: true
          });
          if (input !== undefined) {
            currentPassword = input;
            await loadAndSendDocument(true);
          }
          break;
        }
      }
    });

    // ファイルが保存・変更されたらプレビューを再生成
    const changeSub = document.onDidChange(async () => {
      await loadAndSendDocument();
    });

    // 設定 bdf.theme.<category>.<ext> が変更されたらWebviewへ即座に反映
    const configSub = vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('bdf.theme')) {
        const theme = getThemeForExtension(document.uri.fsPath);
        postToWebview({ type: 'setTheme', theme });
      }
    });

    webviewPanel.onDidDispose(() => {
      messageSub.dispose();
      changeSub.dispose();
      configSub.dispose();
    });
  }
}

