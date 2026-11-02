import * as vscode from 'vscode';
import * as path from 'path';
import { BdfConverter, PasswordRequiredError } from './converter.js';
import { getThemeForExtension, setThemeForExtension } from './associationManager.js';
import { getWebviewContent } from './html.js';
import type { HostToWebviewMessage, WebviewToHostMessage } from './types.js';

export class BdfPreviewPanel {
  public static readonly viewType = 'bdf.previewPanel';
  private static panels = new Map<string, BdfPreviewPanel>();

  private readonly panel: vscode.WebviewPanel;
  private readonly converter: BdfConverter;
  private readonly disposables: vscode.Disposable[] = [];
  private currentPassword?: string;

  private constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly uri: vscode.Uri,
    viewColumn: vscode.ViewColumn
  ) {
    this.converter = new BdfConverter(context);

    const fileName = path.basename(uri.fsPath);
    this.panel = vscode.window.createWebviewPanel(
      BdfPreviewPanel.viewType,
      `Preview: ${fileName}`,
      viewColumn,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'dist')
        ]
      }
    );

    this.panel.webview.html = getWebviewContent(this.panel.webview, context.extensionUri, fileName);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      async (msg: WebviewToHostMessage) => {
        switch (msg.type) {
          case 'ready':
            await this.loadAndSend();
            break;
          case 'error':
            vscode.window.showErrorMessage(`BDF Preview Error: ${msg.message}`);
            break;
          case 'themeChanged':
            await setThemeForExtension(this.uri.fsPath, msg.theme);
            break;
        }
      },
      null,
      this.disposables
    );

    const configSub = vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('bdf.theme')) {
        const theme = getThemeForExtension(this.uri.fsPath);
        this.panel.webview.postMessage({ type: 'setTheme', theme } satisfies HostToWebviewMessage);
      }
    });
    this.disposables.push(configSub);

    // ファイル変更監視
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(path.dirname(uri.fsPath), path.basename(uri.fsPath))
    );
    watcher.onDidChange(() => this.loadAndSend(), null, this.disposables);
    this.disposables.push(watcher);
  }

  public static createOrShow(
    context: vscode.ExtensionContext,
    uri: vscode.Uri,
    viewColumn: vscode.ViewColumn = vscode.ViewColumn.Beside
  ): BdfPreviewPanel {
    const key = uri.toString();
    const existing = BdfPreviewPanel.panels.get(key);
    if (existing) {
      existing.panel.reveal(viewColumn);
      return existing;
    }

    const panel = new BdfPreviewPanel(context, uri, viewColumn);
    BdfPreviewPanel.panels.set(key, panel);
    return panel;
  }

  private async loadAndSend(retryPassword = false) {
    const fileName = path.basename(this.uri.fsPath);
    const postToWebview = (msg: HostToWebviewMessage) => this.panel.webview.postMessage(msg);

    postToWebview({
      type: 'loading',
      filename: fileName,
      message: `Converting and loading ${fileName}...`
    });

    try {
      const bdfBytes = await this.converter.loadOrConvert(this.uri, this.currentPassword);
      const cfg = vscode.workspace.getConfiguration('bdf');
      const theme = getThemeForExtension(this.uri.fsPath);
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
        const prompt = retryPassword
          ? 'Incorrect password. Please try again:'
          : 'This file is password-protected. Please enter the password:';

        const input = await vscode.window.showInputBox({
          prompt,
          password: true,
          ignoreFocusOut: true
        });

        if (input !== undefined) {
          this.currentPassword = input;
          await this.loadAndSend(true);
          return;
        }
      }

      postToWebview({
        type: 'error',
        message: err.message || String(err)
      });
    }
  }

  private dispose() {
    BdfPreviewPanel.panels.delete(this.uri.toString());
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) d.dispose();
    }
  }
}

