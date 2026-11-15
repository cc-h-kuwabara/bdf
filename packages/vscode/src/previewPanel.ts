import * as vscode from 'vscode';
import * as path from 'path';
import { BdfConverter } from './converter.js';
import { getWebviewContent } from './html.js';
import { PreviewController } from './previewController.js';

export class BdfPreviewPanel {
  public static readonly viewType = 'bdf.previewPanel';
  private static panels = new Map<string, BdfPreviewPanel>();

  private readonly panel: vscode.WebviewPanel;
  private readonly controller: PreviewController;
  private readonly disposables: vscode.Disposable[] = [];

  private constructor(
    context: vscode.ExtensionContext,
    private readonly uri: vscode.Uri,
    viewColumn: vscode.ViewColumn
  ) {
    const converter = new BdfConverter(context);
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

    this.controller = new PreviewController(this.panel, uri, converter);
    this.disposables.push(this.controller);

    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(path.dirname(uri.fsPath), path.basename(uri.fsPath))
    );
    watcher.onDidChange(() => this.controller.loadAndSend(), null, this.disposables);
    this.disposables.push(watcher);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
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
      existing.controller.post({ type: 'focus' });
      return existing;
    }

    const panel = new BdfPreviewPanel(context, uri, viewColumn);
    BdfPreviewPanel.panels.set(key, panel);
    return panel;
  }

  public dispose(): void {
    BdfPreviewPanel.panels.delete(this.uri.toString());
    while (this.disposables.length > 0) {
      this.disposables.pop()?.dispose();
    }
  }
}
