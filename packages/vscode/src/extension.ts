import * as vscode from 'vscode';
import { BdfCustomEditorProvider } from './editorProvider.js';
import { BdfPreviewPanel } from './previewPanel.js';
import {
  syncAssociationsFromConfig,
  showConfigureAssociationsQuickPick
} from './associationManager.js';

export function activate(context: vscode.ExtensionContext) {
  // 1. Custom Editor Provider を登録
  context.subscriptions.push(BdfCustomEditorProvider.register(context));

  // 2. コマンド「bdf.openPreview」を登録
  context.subscriptions.push(
    vscode.commands.registerCommand('bdf.openPreview', async (uri?: vscode.Uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      if (!targetUri) {
        vscode.window.showWarningMessage('プレビューするファイルが選択されていません。');
        return;
      }
      BdfPreviewPanel.createOrShow(context, targetUri, vscode.ViewColumn.Active);
    })
  );

  // 3. コマンド「bdf.openPreviewToSide」を登録
  context.subscriptions.push(
    vscode.commands.registerCommand('bdf.openPreviewToSide', async (uri?: vscode.Uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      if (!targetUri) {
        vscode.window.showWarningMessage('プレビューするファイルが選択されていません。');
        return;
      }
      BdfPreviewPanel.createOrShow(context, targetUri, vscode.ViewColumn.Beside);
    })
  );

  // 4. コマンド「bdf.configureAssociations」を登録 (チェックボックス選択UI)
  context.subscriptions.push(
    vscode.commands.registerCommand('bdf.configureAssociations', async () => {
      await showConfigureAssociationsQuickPick();
    })
  );

  // 5. 設定変更監視 (settings.json や設定UIで bdf.preview が変更されたら自動同期)
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('bdf.preview')) {
        await syncAssociationsFromConfig();
      }
    })
  );

  // 起動時に現在の設定を workbench.editorAssociations に同期
  syncAssociationsFromConfig().catch((err) => {
    console.error('Failed to sync BDF editor associations:', err);
  });
}

export function deactivate() {}
