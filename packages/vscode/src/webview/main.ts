import { Viewer, type PageLayout } from '@bdfkit/viewer';
import {
  BdfWorkerClient,
  buildTextLayer,
  installCopyHandler,
  TEXT_LAYER_CSS,
  type TextContent
} from '@bdfkit/render';
import type { HostToWebviewMessage, PreviewThemeMode, WebviewToHostMessage } from '../types.js';

declare function acquireVsCodeApi(): {
  postMessage(msg: WebviewToHostMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
};

declare global {
  interface Window {
    __bdfWorkerUrl: string;
  }
}

const vscode = acquireVsCodeApi();

// テキストレイヤ用のCSSを注入
const textLayerStyle = document.createElement('style');
textLayerStyle.textContent = `
${TEXT_LAYER_CSS}
.bdfTextLayer {
  pointer-events: auto !important;
  user-select: text !important;
  -webkit-user-select: text !important;
  mix-blend-mode: multiply;
}
.bdfTextLayer span {
  pointer-events: auto !important;
  user-select: text !important;
  -webkit-user-select: text !important;
  cursor: text !important;
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
}
.bdfTextLayer span::selection {
  background: #b4d7ff;
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
}
.bdfTextLayer [data-bdf-cells] span::selection {
  background: transparent !important;
}
`;
document.head.appendChild(textLayerStyle);

// UI Elements
const hostElement = document.getElementById('viewer-host') as HTMLDivElement;
const overlayElement = document.getElementById('overlay') as HTMLDivElement;
const overlaySpinner = document.getElementById('overlay-spinner') as HTMLDivElement;
const overlayMsg = document.getElementById('overlay-msg') as HTMLDivElement;
const errorCard = document.getElementById('error-card') as HTMLDivElement;
const errorDetails = document.getElementById('error-details') as HTMLDivElement;

const prevPageBtn = document.getElementById('btn-prev') as HTMLButtonElement;
const nextPageBtn = document.getElementById('btn-next') as HTMLButtonElement;
const pageInput = document.getElementById('input-page') as HTMLInputElement;
const pageTotal = document.getElementById('label-total') as HTMLSpanElement;

const zoomOutBtn = document.getElementById('btn-zoom-out') as HTMLButtonElement;
const zoomInBtn = document.getElementById('btn-zoom-in') as HTMLButtonElement;
const zoomSelect = document.getElementById('select-zoom') as HTMLSelectElement;
const fitWidthBtn = document.getElementById('btn-fit-width') as HTMLButtonElement;

const layoutSelect = document.getElementById('select-layout') as HTMLSelectElement;
const viewSelect = document.getElementById('select-view') as HTMLSelectElement;
const themeSelect = document.getElementById('select-theme') as HTMLSelectElement;
const themeLabel = document.getElementById('label-theme') as HTMLSpanElement;
const findBtn = document.getElementById('btn-find') as HTMLButtonElement;

let viewer: Viewer | null = null;
let renderer: BdfWorkerClient | null = null;
let currentZoom = 1.0;
let currentPage = 0;
let totalPages = 1;
let currentThemeMode: PreviewThemeMode = 'light';

/**
 * VS Code の body クラス (vscode-light / vscode-dark / vscode-high-contrast) から現在のエディタテーマを判定する
 */
function detectVsCodeTheme(): 'light' | 'dark' {
  if (
    document.body.classList.contains('vscode-light') ||
    document.body.classList.contains('vscode-high-contrast-light')
  ) {
    return 'light';
  }
  return 'dark';
}

/**
 * 設定されたテーマモード (auto / light / dark) を評価して body[data-bdf-effective-theme] に反映する
 */
function applyEffectiveTheme() {
  const effective = currentThemeMode === 'auto' ? detectVsCodeTheme() : currentThemeMode;
  document.body.dataset.bdfEffectiveTheme = effective;
  if (themeSelect && themeSelect.value !== currentThemeMode) {
    themeSelect.value = currentThemeMode;
  }
}

// VS Code のカラーテーマ変更 (body の class 属性変化) をリアルタイム監視して自動追従
const bodyThemeObserver = new MutationObserver(() => {
  applyEffectiveTheme();
});
bodyThemeObserver.observe(document.body, {
  attributes: true,
  attributeFilter: ['class']
});
applyEffectiveTheme();

function showLoading(msg = 'ファイルを読み込み中...') {
  overlayElement.classList.remove('hidden');
  overlaySpinner.classList.remove('hidden');
  overlayMsg.classList.remove('hidden');
  errorCard.classList.add('hidden');
  overlayMsg.textContent = msg;
}

function showError(msg: string) {
  overlayElement.classList.remove('hidden');
  overlaySpinner.classList.add('hidden');
  overlayMsg.classList.add('hidden');
  errorCard.classList.remove('hidden');
  errorDetails.textContent = msg;
}

function hideOverlay() {
  overlayElement.classList.add('hidden');
}

/**
 * ページやシートのフレームにテキストレイヤーを構築してドラッグ選択・コピーを可能にする
 */
let sheetUpdateTimer: ReturnType<typeof setTimeout> | null = null;
let sheetRequestSerial = 0;

function attachTextLayers() {
  if (!viewer || !renderer || !viewer.view) return;
  const currentView = viewer.view;

  // 1. 通常ページ (fixed / flow / pages)
  const pageFrames = viewer.stage.querySelectorAll<HTMLElement>('[data-bdf-page]');
  pageFrames.forEach((frame) => {
    const pageIndex = Number(frame.dataset.bdfPage);
    if (isNaN(pageIndex) || frame.querySelector('.bdfTextLayer') || frame.dataset.bdfTextLoading === '1') return;
    frame.dataset.bdfTextLoading = '1';

    renderer!.content(currentView.id, pageIndex).then((content: TextContent) => {
      delete frame.dataset.bdfTextLoading;
      if (!frame.isConnected || frame.querySelector('.bdfTextLayer')) return;
      const layer = buildTextLayer(content, currentZoom);
      frame.appendChild(layer);
    }).catch((e) => {
      delete frame.dataset.bdfTextLoading;
      console.warn('Text layer loading failed for page', pageIndex, e);
    });
  });

  // 2. スプレッドシート (sheet)
  if (currentView.kind === 'sheet') {
    const spacer = viewer.stage.firstElementChild as HTMLElement;
    if (spacer) {
      let sheetLayerHost = spacer.querySelector<HTMLElement>(':scope > .bdfSheetTextHost');
      if (!sheetLayerHost) {
        sheetLayerHost = document.createElement('div');
        sheetLayerHost.className = 'bdfSheetTextHost';
        // z-index を指定しないことで新しいスタッキングコンテキストを作らず、子要素 .bdfTextLayer の mix-blend-mode: multiply が背面 Canvas と直接合成されるようにする
        sheetLayerHost.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;';
        spacer.appendChild(sheetLayerHost);
      }

      const updateSheetText = () => {
        if (!viewer || !viewer.view || viewer.view.id !== currentView.id) return;
        const width = viewer.stage.clientWidth;
        const height = viewer.stage.clientHeight;
        if (width <= 0 || height <= 0) return;

        const vp = {
          x: Math.max(0, (viewer.stage.scrollLeft / currentZoom) - 200),
          y: Math.max(0, (viewer.stage.scrollTop / currentZoom) - 200),
          w: (width / currentZoom) + 400,
          h: (height / currentZoom) + 400
        };

        const rowsCount = currentView.rows?.reduce((s, [c]) => s + c, 0) || 1000;
        const colsCount = currentView.cols?.reduce((s, [c]) => s + c, 0) || 100;
        const sheetMeta = { rows: rowsCount, cols: colsCount };
        const reqId = ++sheetRequestSerial;

        renderer!.sheetContent(currentView.id, vp).then((content: TextContent) => {
          if (reqId !== sheetRequestSerial || !sheetLayerHost?.isConnected) return;
          const layer = buildTextLayer(content, currentZoom, {
            sheet: sheetMeta,
            selectable: true
          });
          layer.style.position = 'absolute';
          layer.style.inset = '0';
          sheetLayerHost.replaceChildren(layer);
        }).catch((e) => {
          console.warn('Sheet content load failed:', e);
        });
      };

      if (sheetUpdateTimer) clearTimeout(sheetUpdateTimer);
      sheetUpdateTimer = setTimeout(updateSheetText, 50);

      viewer.stage.onscroll = () => {
        (viewer as any).scheduleSheet?.();
        if (sheetUpdateTimer) clearTimeout(sheetUpdateTimer);
        sheetUpdateTimer = setTimeout(updateSheetText, 100);
      };
    }
  }
}

async function initViewer(): Promise<Viewer> {
  if (viewer) return viewer;

  try {
    const resp = await fetch(window.__bdfWorkerUrl);
    if (!resp.ok) {
      throw new Error(`Workerスクリプトのロードに失敗しました (status: ${resp.status})`);
    }
    const workerCode = await resp.text();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerBlobUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerBlobUrl, { type: 'module' });
    renderer = new BdfWorkerClient(worker);

    viewer = new Viewer(hostElement, {
      renderer,
      layout: (layoutSelect.value as PageLayout) || 'single',
      zoom: currentZoom
    });

    // コピーハンドラーを登録（Ctrl+C / Cmd+C でテキストコピー可能）
    installCopyHandler(document.body);

    // ドキュメント更新・ビュー切り替え時のハンドラ
    viewer.addEventListener('documentchange', () => {
      updateViewsAndPages();
      setTimeout(attachTextLayers, 100);
    });

    viewer.addEventListener('viewchange', () => {
      updateViewsAndPages();
      setTimeout(attachTextLayers, 100);
    });

    viewer.addEventListener('error', (e: Event) => {
      const err = (e as CustomEvent)?.detail;
      console.error('BDF Viewer Error:', err);
      vscode.postMessage({ type: 'error', message: String(err) });
    });

    const mutationObserver = new MutationObserver(() => {
      attachTextLayers();
    });
    mutationObserver.observe(viewer.stage, { childList: true });

    return viewer;
  } catch (err: any) {
    showError(`ビューアーの初期化に失敗しました: ${err.message || String(err)}`);
    throw err;
  }
}

function updateViewsAndPages() {
  if (!viewer) return;
  const doc = viewer.document;
  const currentView = viewer.view;
  document.body.dataset.bdfViewKind = currentView?.kind || 'pages';
  applyEffectiveTheme();

  // Views のドロップダウン更新
  if (doc && doc.views && doc.views.length > 0) {
    viewSelect.innerHTML = '';
    for (const v of doc.views) {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.title || v.id;
      if (currentView && v.id === currentView.id) {
        opt.selected = true;
      }
      viewSelect.appendChild(opt);
    }
    viewSelect.disabled = doc.views.length <= 1;
  } else {
    viewSelect.innerHTML = '<option value="">(デフォルト)</option>';
    viewSelect.disabled = true;
  }

  // ページ数の更新
  if (currentView && currentView.pages && currentView.pages.length > 0) {
    totalPages = currentView.pages.length;
    pageTotal.textContent = `/ ${totalPages}`;
    pageInput.max = String(totalPages);
    pageInput.disabled = false;
    prevPageBtn.disabled = currentPage <= 0;
    nextPageBtn.disabled = currentPage >= totalPages - 1;
  } else {
    totalPages = 1;
    pageTotal.textContent = '/ 1';
    pageInput.max = '1';
    pageInput.disabled = true;
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
  }
}

function setZoom(zoom: number) {
  if (!viewer) return;
  currentZoom = Math.max(0.2, Math.min(5.0, zoom));
  viewer.setZoom(currentZoom);

  const pct = Math.round(currentZoom * 100);
  let matched = false;
  for (let i = 0; i < zoomSelect.options.length; i++) {
    if (zoomSelect.options[i].value === String(currentZoom)) {
      zoomSelect.selectedIndex = i;
      matched = true;
      break;
    }
  }
  if (!matched) {
    let customOpt = zoomSelect.querySelector('option[data-custom="true"]') as HTMLOptionElement;
    if (!customOpt) {
      customOpt = document.createElement('option');
      customOpt.setAttribute('data-custom', 'true');
      zoomSelect.appendChild(customOpt);
    }
    customOpt.value = String(currentZoom);
    customOpt.textContent = `${pct}%`;
    customOpt.selected = true;
  }

  setTimeout(attachTextLayers, 100);
}

function setPage(page: number) {
  if (!viewer) return;
  currentPage = Math.max(0, Math.min(totalPages - 1, page));
  viewer.scrollToPage(currentPage);
  pageInput.value = String(currentPage + 1);
  prevPageBtn.disabled = currentPage <= 0;
  nextPageBtn.disabled = currentPage >= totalPages - 1;
  setTimeout(attachTextLayers, 100);
}

// ツールバーのイベントハンドラ
prevPageBtn.addEventListener('click', () => {
  setPage(currentPage - 1);
});

nextPageBtn.addEventListener('click', () => {
  setPage(currentPage + 1);
});

pageInput.addEventListener('change', () => {
  const p = parseInt(pageInput.value, 10);
  if (!isNaN(p)) {
    setPage(p - 1);
  }
});

pageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    pageInput.blur();
  }
});

zoomOutBtn.addEventListener('click', () => {
  setZoom(currentZoom / 1.25);
});

zoomInBtn.addEventListener('click', () => {
  setZoom(currentZoom * 1.25);
});

zoomSelect.addEventListener('change', () => {
  const val = parseFloat(zoomSelect.value);
  if (!isNaN(val)) {
    setZoom(val);
  }
});

fitWidthBtn.addEventListener('click', () => {
  if (!viewer || !viewer.view) return;
  const currentView = viewer.view;
  const p0 = currentView.pages?.[0];
  if (p0 && p0.w > 0) {
    const stageWidth = hostElement.clientWidth - 40;
    if (stageWidth > 0) {
      setZoom(stageWidth / p0.w);
    }
  }
});

layoutSelect.addEventListener('change', () => {
  if (!viewer) return;
  viewer.setLayout(layoutSelect.value as PageLayout);
  setTimeout(attachTextLayers, 100);
});

viewSelect.addEventListener('change', () => {
  if (!viewer) return;
  viewer.setView(viewSelect.value);
  setPage(0);
  setTimeout(attachTextLayers, 100);
});

themeSelect.addEventListener('change', () => {
  currentThemeMode = (themeSelect.value as PreviewThemeMode) || 'auto';
  applyEffectiveTheme();
  vscode.postMessage({ type: 'themeChanged', theme: currentThemeMode });
});

findBtn.addEventListener('click', () => {
  if (!viewer) return;
  viewer.openFind();
});

// メッセージハンドラ
window.addEventListener('message', async (event: MessageEvent<HostToWebviewMessage>) => {
  const msg = event.data;
  switch (msg.type) {
    case 'loading': {
      showLoading(msg.message || `${msg.filename} を変換中...`);
      break;
    }
    case 'error': {
      showError(msg.message);
      break;
    }
    case 'setTheme': {
      currentThemeMode = msg.theme || 'auto';
      applyEffectiveTheme();
      break;
    }
    case 'open': {
      try {
        if (msg.filename && themeLabel) {
          const dotIdx = msg.filename.lastIndexOf('.');
          const extText = dotIdx >= 0 ? msg.filename.slice(dotIdx).toLowerCase() : '';
          themeLabel.textContent = extText ? `テーマ (${extText}):` : 'テーマ:';
        }
        if (msg.theme) {
          currentThemeMode = msg.theme;
          applyEffectiveTheme();
        }
        showLoading('描画の準備中...');
        const v = await initViewer();
        if (msg.defaultLayout && ['single', 'spread', 'continuous'].includes(msg.defaultLayout)) {
          layoutSelect.value = msg.defaultLayout;
          v.setLayout(msg.defaultLayout as PageLayout);
        }
        if (typeof msg.defaultZoom === 'number' && msg.defaultZoom > 0) {
          setZoom(msg.defaultZoom);
        }
        await v.open({ kind: 'buffer', buffer: msg.buffer });
        currentPage = 0;
        pageInput.value = '1';
        updateViewsAndPages();
        hideOverlay();
        setTimeout(attachTextLayers, 150);
      } catch (err: any) {
        showError(`ファイルのプレビューに失敗しました: ${err.message || String(err)}`);
      }
      break;
    }
  }
});

// ホスト（VS Code）へ準備完了を通知
vscode.postMessage({ type: 'ready' });
