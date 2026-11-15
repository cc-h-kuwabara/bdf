import * as vscode from 'vscode';
import * as path from 'path';
import { BdfConverter } from './converter.js';
import { getWebviewContent } from './html.js';
import { PreviewController } from './previewController.js';

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

    const controller = new PreviewController(webviewPanel, document.uri, this.converter, token);
    const changeSub = document.onDidChange(() => controller.loadAndSend());

    webviewPanel.onDidDispose(() => {
      changeSub.dispose();
      controller.dispose();
    });
  }
}
