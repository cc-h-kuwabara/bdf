# BDF

[English](README.md) | 日本語

**BDF**（Browser-specific Document Format）は、ブラウザの Canvas 2D にそのまま描画できる、プレビュー用の文書フォーマットです。安定版 wire format は v1.0 です。

PDF や Word のファイル、CAD の図面をブラウザでプレビューするには、たいていサーバー上でオフィススイートかヘッドレスブラウザを動かすことになります。BDF の変換器はどちらも要りません。素の Go で書かれていて、同じコードは WebAssembly にもなるので、ブラウザの中でも変換できます。PDF、Office のファイル（Word、PowerPoint、Excel、CSV、Parquet、Visio）、InDesign（IDML）、draw.io の図、CAD の図面（DXF、Jw_cad、SXF、CGM、HP-GL/2）、プリント基板（Gerber、Excellon、KiCad）、Illustrator、Photoshop、HTML、Markdown、EPUB、音楽（MML、MIDI、MusicXML。ビューアで演奏可能）、音声ファイル（MP3、M4A、FLAC、Ogg、WAV、AIFF。カバーアート・タグ・歌詞。ビューアで再生可能）、フォントファイルはすべてこうして変換され、1 つのレンダラが Web Worker の中でそのすべてを描画します。

**[試してみる](https://shibukawa.github.io/bdf/)** — デモサイトにファイルをドロップしてください。アップロードせずにブラウザの中で変換して描画します。**[ドキュメントを読む](https://shibukawa.github.io/bdf/docs/)** — なぜ BDF があるのか、対応するすべての形式、サーバー構成のサンプル 3 つ、ビルドの方法まで。

## クイックスタート

```sh
go run ./cmd/bdf generate report.pptx report.bdf   # 変換
go run ./cmd/bdf ls report.bdf                     # 中身を見る

npm ci && npm run demo                             # ブラウザで開く
# http://127.0.0.1:8765/examples/viewer/.out/?src=/report.bdf
```

ソースからビルドするには Go 1.27 以上と Node.js が要ります。続きは[はじめかた](https://shibukawa.github.io/bdf/docs/getting-started.ja.html)を参照してください（Go のコードから直接変換する方法も含みます）。

npm パッケージとしての表示・ブラウザ内変換は [npm パッケージガイド](docs/npm.ja.md) を参照してください。

## VS Code 拡張機能

[`packages/vscode`](packages/vscode) には、BDF が対応する全140種類の拡張子を VS Code 内で直接プレビューできる拡張機能（**BDF Document Preview**）が含まれています。

- **全140拡張子のダイレクトプレビュー**: Office 文書（`.xlsx`, `.docx`, `.pptx`, `.vsdx`）、PDF / EPUB / Markdown / HTML、データ表（`.csv`, `.tsv`, `.parquet`）、デザイン・DTP（`.ai`, `.psd`, `.idml`, `.drawio`, `.emf`）、CAD・プロッタ図面（`.dxf`, `.jww`, `.sxf`, `.cgm`, `.plt`）、プリント基板（`.kicad_sch`, `.kicad_pcb`, Gerber, Excellon）、画像、楽譜（`.musicxml`, `.mid`, `.mml`）、音声、フォントに対応。
- **テキスト・セル選択＆コピー・全文検索**: Canvas 2D プレビュー上でのマウスドラッグによるテキスト・表セルの選択とコピー（`Ctrl+C` / `Cmd+C`）、ドキュメント内検索（`Ctrl+F` / `Cmd+F`）、ズーム、レイアウト切替（単一ページ / 見開き / 連続）、シート・ビュー切替に対応。
- **拡張子ごとの自動プレビュー＆テーマ設定**: 設定画面からカテゴリー別に各拡張子の自動プレビュー有効化（`bdf.preview.<category>.<ext>`）およびプレビューテーマ（`auto`: VS Code連動 / `light`: ライト固定 / `dark`: ダーク固定、`bdf.theme.<category>.<ext>`）を個別に設定可能。

### VSIX のビルドとインストール

```sh
# 1. Go CLI バイナリとワークスペースパッケージのビルド
go build -o ./bin/bdf ./cmd/bdf        # (Windows の場合: ./bin/bdf.exe)
npm install && npm run build

# 2. VS Code 拡張機能のバンドルと VSIX パッケージ化
cd packages/vscode
npm run build
npx @vscode/vsce package --no-dependencies --skip-license

# 3. VS Code へのインストール
code --install-extension bdf-preview-0.1.8.vsix
```

## 構成

| 場所 | 内容 |
|---|---|
| `*.go`、`converter/`、`encoding/`、`raster/`、`contrib/`、`internal/` | Go のエンコーダ・デコーダ、入力形式ごとの変換器パッケージ、文書が持つ値の表の Parquet エンコーディング |
| `form/`、`vector/`、`text/` | 帳票のテンプレートをデータで穴埋めする: タグを書いた Excel・Word・PowerPoint、入力欄のある PDF、pdfme のテンプレート、連帳やレシートの行を書いたテキスト（QR コードとバーコードは `image/barcode/`）。文書を PDF（タグ付き PDF と PDF/A も）と Markdown に書き出す |
| `packages/` | デコーダ、レンダラー、表示面、TinyGo を使うブラウザ内変換の npm パッケージ、および VS Code プレビュー拡張機能（`packages/vscode`） |
| `examples/`、`site/` | デモビューア、サーバー構成のサンプル 4 つ、GitHub Pages で公開しているサイト |
| `docs/` | このドキュメント |

全体の内訳は[フォルダ構成](https://shibukawa.github.io/bdf/docs/architecture/layout.ja.html)を、`go test`・ブラウザの機能テスト・フィクスチャの再生成は[ビルドとテスト](https://shibukawa.github.io/bdf/docs/architecture/development.ja.html)を参照してください。

## ライセンス

[MIT](LICENSE)。

### フォント

このリポジトリのフォントには、それぞれのライセンスがあります。

- **STIX Two Math** 2.13 b171 は、数式を組むフォントとしてパッケージ `image/formula` に埋め込んであります。配布元のリリースのファイルを無改変で使っています（[stipub/stixfonts](https://github.com/stipub/stixfonts) のタグ `v2.13b171`。SHA-256 は [`image/formula/fonts/README.md`](formula/fonts/README.md)）。ライセンスは [SIL Open Font License 1.1](formula/fonts/OFL.txt) です。Copyright 2001-2021 The STIX Fonts Project Authors, with Reserved Font Name "TM Math". `formula` を import したプログラムはこのフォントを含みます。
- **Bravura**（音楽記号。`converter/internal/music/smufl` に表として持つ）は [SIL Open Font License 1.1](converter/internal/music/smufl/OFL.txt) です。Copyright © 2015 Steinberg Media Technologies GmbH, with Reserved Font Name "Bravura".
- **M PLUS 1p** の数字の輪郭を、JAN/EAN/UPC の目視文字用に `image/barcode` に含みます。[SIL Open Font License 1.1](image/barcode/OFL-MPLUS.txt) です。
- **NewStroke**（KiCad の線の字体。`converter/kicad`）は [CC0](converter/kicad/NEWSTROKE.txt) です。
- **DejaVu Sans** のサブセット（サンプル文書用。`fixture`）は [DejaVu Fonts License](fixture/testdata/fonts/LICENSE.txt) です。
- テスト用のフォント（M PLUS 1p、STIX Two Math、STIX Two Text のサブセット）は、ライセンスと一緒に `testdata` ディレクトリにあります。

デモサイトが配るフォントも含めた一覧は[フォントとライセンス](https://shibukawa.github.io/bdf/docs/licenses.ja.html)にあります。
