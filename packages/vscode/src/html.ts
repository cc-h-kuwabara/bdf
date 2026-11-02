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
<html lang="en">
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
      <!-- Page navigation -->
      <div class="toolbar-group">
        <button id="btn-prev" class="toolbar-btn" title="Previous Page" disabled>◀</button>
        <input id="input-page" class="toolbar-input" type="number" min="1" value="1" disabled />
        <span id="label-total" class="toolbar-label">/ 1</span>
        <button id="btn-next" class="toolbar-btn" title="Next Page" disabled>▶</button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Zoom controls -->
      <div class="toolbar-group">
        <button id="btn-zoom-out" class="toolbar-btn" title="Zoom Out">−</button>
        <select id="select-zoom" class="toolbar-select" title="Zoom Level">
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1.0" selected>100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2.0">200%</option>
          <option value="3.0">300%</option>
        </select>
        <button id="btn-zoom-in" class="toolbar-btn" title="Zoom In">＋</button>
        <button id="btn-fit-width" class="toolbar-btn" title="Fit to Width">Fit Width</button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Layout controls -->
      <div class="toolbar-group">
        <span class="toolbar-label">Layout:</span>
        <select id="select-layout" class="toolbar-select" title="Page Layout">
          <option value="single" selected>Single Page</option>
          <option value="spread">Two-Page Spread</option>
          <option value="continuous">Continuous</option>
        </select>
      </div>

      <div class="toolbar-divider"></div>

      <!-- View selector -->
      <div class="toolbar-group">
        <span class="toolbar-label">View:</span>
        <select id="select-view" class="toolbar-select" title="Select Sheet / View" disabled>
          <option value="">(Default)</option>
        </select>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Theme selector -->
      <div class="toolbar-group">
        <span id="label-theme" class="toolbar-label">Theme:</span>
        <select id="select-theme" class="toolbar-select" title="Preview Theme for This File Extension">
          <option value="auto" selected>Auto (VS Code)</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <!-- Find -->
      <div class="toolbar-group" style="margin-left: auto;">
        <button id="btn-find" class="toolbar-btn" title="Find in Document (Ctrl+F / Cmd+F)">🔍 Find</button>
      </div>
    </div>

    <!-- Viewer stage -->
    <div id="stage-container">
      <div id="viewer-host"></div>
    </div>

    <!-- Loading / Error overlay -->
    <div id="overlay">
      <div id="overlay-spinner" class="spinner"></div>
      <div id="overlay-msg" class="overlay-msg">Converting and loading file...</div>
      <div id="error-card" class="error-card hidden">
        <div class="error-title">Failed to render preview</div>
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
