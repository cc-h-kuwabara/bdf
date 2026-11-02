# BDF Document Preview for Visual Studio Code

Preview 140 file extensions—including Office documents, PDF, CAD drawings, PCB layouts, sheet music, audio, fonts, and data tables—directly inside Visual Studio Code using **BDF** (Browser-specific Document Format).

## Features

- **140 Supported File Extensions Across 10 Categories**:
  - **Office Documents**: Excel (`.xlsx`, `.xlsm`, `.xltx`, `.xltm`), Word (`.docx`, `.docm`, `.dotx`, `.dotm`), PowerPoint (`.pptx`, `.pptm`, `.ppsx`, `.ppsm`, `.potx`, `.potm`), Visio (`.vsdx`, `.vsdm`, `.vstx`, `.vstm`)
  - **Documents, eBooks & Web**: BDF (`.bdf`, `.bdft`), PDF (`.pdf`), EPUB (`.epub`), HTML (`.html`, `.htm`, `.xhtml`, `.mhtml`, `.mht`), Markdown (`.md`, `.markdown`, `.mdown`, `.mkd`, `.mdx`)
  - **Data & Tables**: CSV / TSV (`.csv`, `.tsv`, `.tab`), Apache Parquet (`.parquet`, `.parq`, `.pqt`)
  - **Design, DTP & Diagrams**: Illustrator (`.ai`), Photoshop (`.psd`, `.psb`), InDesign (`.idml`), draw.io (`.drawio`, `.dio`), Windows Metafile (`.emf`, `.wmf`)
  - **CAD & Plotter Drawings**: AutoCAD DXF (`.dxf`), Jw_cad (`.jww`), SXF (`.sxf`, `.p21`, `.p2z`, `.sfc`), CGM (`.cgm`, `.cgz`), HP-GL/2 (`.plt`, `.hpgl`, `.hgl`, `.hpg`, `.hp2`, `.rtl`)
  - **PCB & Schematics**: KiCad (`.kicad_sch`, `.kicad_pcb`, `.kicad_pro`), Gerber RS-274X (`.gbr`, `.ger`, `.gtl`, `.gbl`, etc.), Excellon Drill (`.drl`, `.drd`, `.xln`, `.exc`)
  - **Images**: Multi-page TIFF (`.tif`, `.tiff`), PNG, APNG, JPEG, GIF, WebP, AVIF, BMP, ICO, SVG
  - **Sheet Music & Scores**: MusicXML (`.musicxml`, `.mxl`), MIDI (`.mid`, `.midi`, `.smf`, `.kar`, `.rmi`), MML (`.mml`)
  - **Audio Files**: MP3, M4A, M4B, AAC, FLAC, Ogg, Opus, Speex, WAV, AIFF
  - **Fonts**: TrueType / OpenType / WOFF (`.ttf`, `.otf`, `.ttc`, `.otc`, `.woff`, `.woff2`)
- **Selectable Text & Table Cells**:
  - Drag-select and copy (`Ctrl+C` / `Cmd+C`) text and spreadsheet cells directly from the Canvas 2D preview.
- **Full Viewer Controls**:
  - Page navigation, zoom (`Fit Width`, `50%`–`300%`), layout modes (`Single Page`, `Two-Page Spread`, `Continuous`), multi-sheet/view switcher, and full-text search (`Ctrl+F` / `Cmd+F`).
- **Per-Extension File Associations & Theme Settings**:
  - Configure automatic preview (`bdf.preview.<category>.<ext>`) and preview theme (`bdf.theme.<category>.<ext>`: `auto`, `light`, or `dark`) individually for every file extension.
