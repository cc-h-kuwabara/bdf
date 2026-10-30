# BDF Document Preview for Visual Studio Code

BDF（Browser-specific Document Format）の機能を利用して、VS Code 内でオフィス文書、PDF、CAD図面、基板データ、音楽、ベクター画像などを直接プレビュー表示する拡張機能です。

## 特徴

- **豊富なファイル形式に対応**:
  - **Office / 表計算 / プレゼン**: Word (`.docx`, `.docm`), Excel (`.xlsx`, `.xlsm`), PowerPoint (`.pptx`, `.pptm`), Visio (`.vsdx`), InDesign (`.idml`)
  - **データ**: CSV (`.csv`, `.tsv`), Parquet (`.parquet`)
  - **文書・書籍**: PDF (`.pdf`), EPUB (`.epub`)
  - **CAD / 設計図**: DXF (`.dxf`), Jw_cad (`.jww`), SXF (`.sxf`, `.p21`, `.sfc`), CGM (`.cgm`), HP-GL/2 (`.plt`, `.hpgl`), draw.io (`.drawio`)
  - **プリント基板**: KiCad (`.kicad_sch`, `.kicad_pcb`), Gerber (`.gbr`, `.ger`), Excellon (`.drl`, `.xln`)
  - **デザイン・画像**: Illustrator (`.ai`), Photoshop (`.psd`), EMF/WMF (`.emf`, `.wmf`)
  - **音楽・音声**: MusicXML (`.musicxml`, `.mxl`), MIDI (`.mid`, `.midi`), MML (`.mml`), 音声 (`.mp3`, `.m4a`, `.flac`, `.ogg`, `.wav`)
  - **フォント**: TrueType / OpenType (`.ttf`, `.otf`), WOFF (`.woff`, `.woff2`)
  - **BDFフォーマット**: `.bdf`
- **高速 Canvas 2D レンダリング**:
  - Web Worker と Canvas 2D による高速・低メモリな文書レンダリング
- **フル機能のビューア UI**:
  - 単一ページ / 見開き / 連続スクロールのレイアウト切替
  - ページ送り・ページジャンプ
  - 拡大 / 縮小 / 幅に合わせる / ページ全体に合わせる
  - 複数シート・複数ビュー（Excelシート、KiCadレイヤー等）の切替ドロップダウン
  - 全文テキスト検索（Find）
- **ライブリロード**:
  - 開いているファイルが保存されたら自動でプレビューを再生成

## 使い方

1. 対応ファイルをエディタで開く（右クリック「プログラムから開く (Open With...) -> BDF Document Preview」）
2. または、エディタ右上のプレビューボタン「BDF: 横にプレビューを開く」をクリック
3. エクスプローラーでファイルを右クリックし「BDF: プレビューを開く」を選択

## 必要要件

- 本拡張機能には `bdf` CLIバイナリが同梱されているため、追加のセットアップ不要で動作します。
- 必要に応じて VS Code 設定 `bdf.bdfBinaryPath` で外部の bdf バイナリを指定することも可能です。

