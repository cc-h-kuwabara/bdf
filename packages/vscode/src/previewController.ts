import * as vscode from 'vscode';
import * as path from 'path';
import { BdfConverter, PasswordRequiredError } from './converter.js';
import { getThemeForExtension, setThemeForExtension } from './associationManager.js';
import type { HostToWebviewMessage, WebviewToHostMessage } from './types.js';

/**
 * CustomEditor と WebviewPanel で共通利用するプレビューライフサイクル・メッセージ管理コントローラ
 */
export class PreviewController implements vscode.Disposable {
  private currentPassword?: string;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly webviewPanel: vscode.WebviewPanel,
    private readonly uri: vscode.Uri,
    private readonly converter: BdfConverter,
    private readonly token?: vscode.CancellationToken
  ) {
    const webview = this.webviewPanel.webview;

    this.disposables.push(
      webview.onDidReceiveMessage((msg) => this.handleMessage(msg)),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('bdf.theme')) {
          const theme = getThemeForExtension(this.uri.fsPath);
          this.post({ type: 'setTheme', theme });
        }
      }),
      this.webviewPanel.onDidChangeViewState((e) => {
        if (e.webviewPanel.active) {
          this.post({ type: 'focus' });
        }
      })
    );
  }

  public post(msg: HostToWebviewMessage): void {
    this.webviewPanel.webview.postMessage(msg);
  }

  public async loadAndSend(retryPassword = false): Promise<void> {
    const fileName = path.basename(this.uri.fsPath);
    this.post({
      type: 'loading',
      filename: fileName,
      message: `Converting and loading ${fileName}...`
    });

    try {
      const result = await this.converter.loadOrConvert(this.uri, this.currentPassword, this.token);
      const cfg = vscode.workspace.getConfiguration('bdf');

      if (result.kind === 'text') {
        this.post({
          type: 'openText',
          content: result.content,
          filename: fileName,
          theme: 'auto',
          truncated: result.truncated,
          isBinary: result.isBinary,
          totalBytes: result.totalBytes,
          shownBytes: result.shownBytes
        });
      } else {
        const theme = getThemeForExtension(this.uri.fsPath);
        const defaultLayout = cfg.get<string>('defaultLayout', 'single');
        const defaultZoom = cfg.get<number>('defaultZoom', 1.0);
        this.post({
          type: 'open',
          buffer: new Uint8Array(result.data).buffer,
          filename: fileName,
          theme,
          defaultLayout,
          defaultZoom
        });
      }

      if (this.webviewPanel.active) {
        this.post({ type: 'focus' });
      }
    } catch (err: any) {
      if (err instanceof PasswordRequiredError || err.name === 'PasswordRequiredError') {
        const prompt = retryPassword
          ? 'Incorrect password. Please try again:'
          : 'This file is password-protected. Please enter the password:';
        const retried = await this.promptPasswordAndReload(prompt);
        if (retried) return;
      }

      this.post({
        type: 'error',
        message: err?.message || String(err)
      });
    }
  }

  private async promptPasswordAndReload(prompt: string): Promise<boolean> {
    const input = await vscode.window.showInputBox({
      prompt,
      password: true,
      ignoreFocusOut: true
    });
    if (input !== undefined) {
      this.currentPassword = input;
      await this.loadAndSend(true);
      return true;
    }
    return false;
  }

  private async handleMessage(msg: WebviewToHostMessage): Promise<void> {
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
      case 'requestPassword':
        await this.promptPasswordAndReload('Please enter the document password:');
        break;
      case 'close':
        this.webviewPanel.dispose();
        break;
    }
  }

  public dispose(): void {
    while (this.disposables.length > 0) {
      this.disposables.pop()?.dispose();
    }
  }
}
