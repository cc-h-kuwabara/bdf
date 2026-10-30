import * as vscode from 'vscode';

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  title: string
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'webview.js')
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'style.css')
  );
  const workerUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'worker.js')
  );

  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} blob: data:; script-src ${webview.cspSource} blob: 'unsafe-inline' 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline'; worker-src blob:; connect-src ${webview.cspSource} blob:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <div id="app-container">
    <div id="toolbar">
      <!-- ページ操作 -->
      <div class="toolbar-group">
        <button id="btn-prev" class="toolbar-btn" title="前のページ" disabled>◀</button>
        <input id="input-page" class="toolbar-input" type="number" min="1" value="1" disabled />
        <span id="label-total" class="toolbar-label">/ 1</span>
        <button id="btn-next" class="toolbar-btn" title="次のページ" disabled>▶</button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- ズーム操作 -->
      <div class="toolbar-group">
        <button id="btn-zoom-out" class="toolbar-btn" title="縮小">−</button>
        <select id="select-zoom" class="toolbar-select" title="ズーム倍率">
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1.0" selected>100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2.0">200%</option>
          <option value="3.0">300%</option>
        </select>
        <button id="btn-zoom-in" class="toolbar-btn" title="拡大">＋</button>
        <button id="btn-fit-width" class="toolbar-btn" title="幅に合わせる">幅に合わせる</button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- レイアウト操作 -->
      <div class="toolbar-group">
        <span class="toolbar-label">配置:</span>
        <select id="select-layout" class="toolbar-select">
          <option value="single" selected>単一ページ</option>
          <option value="spread">見開き</option>
          <option value="continuous">連続</option>
        </select>
      </div>

      <div class="toolbar-divider"></div>

      <!-- ビュー選択 -->
      <div class="toolbar-group">
        <span class="toolbar-label">ビュー:</span>
        <select id="select-view" class="toolbar-select" disabled>
          <option value="">(デフォルト)</option>
        </select>
      </div>

      <div class="toolbar-divider"></div>

      <!-- テーマ選択 -->
      <div class="toolbar-group">
        <span id="label-theme" class="toolbar-label">テーマ:</span>
        <select id="select-theme" class="toolbar-select" title="この拡張子のプレビューテーマ設定">
          <option value="auto" selected>自動 (VS Code連動)</option>
          <option value="light">ライト (白紙)</option>
          <option value="dark">ダーク</option>
        </select>
      </div>

      <!-- 検索 -->
      <div class="toolbar-group" style="margin-left: auto;">
        <button id="btn-find" class="toolbar-btn" title="ドキュメント内を検索 (Ctrl+F / Cmd+F)">🔍 検索</button>
      </div>
    </div>

    <!-- ビューアー領域 -->
    <div id="stage-container">
      <div id="viewer-host"></div>
    </div>

    <!-- ローディング / エラー 表示オーバーレイ -->
    <div id="overlay">
      <div id="overlay-spinner" class="spinner"></div>
      <div id="overlay-msg" class="overlay-msg">ファイルを変換・読み込み中...</div>
      <div id="error-card" class="error-card hidden">
        <div class="error-title">プレビューの表示に失敗しました</div>
        <div id="error-details" class="error-details"></div>
      </div>
    </div>
  </div>

  <script nonce="${nonce}">
    window.__bdfWorkerUrl = "${workerUri}";
  </script>
  <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
