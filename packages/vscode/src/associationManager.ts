import * as vscode from 'vscode';
import * as path from 'path';
import type { PreviewThemeMode } from './types.js';

export interface ExtensionCategory {
  id: string;
  title: string;
  order: number;
}

export interface ExtensionMeta {
  ext: string;
  category: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  defaultTheme: PreviewThemeMode;
}

export const EXTENSION_CATEGORIES: ExtensionCategory[] = [
  { id: 'office', title: '02. Office Documents (Excel / Word / PowerPoint / Visio)', order: 2 },
  { id: 'document', title: '03. Documents, eBooks & Web (BDF / PDF / EPUB / HTML / Markdown)', order: 3 },
  { id: 'data', title: '04. Data & Tables (CSV / TSV / Parquet)', order: 4 },
  { id: 'design', title: '05. Design, DTP & Diagrams (Illustrator / Photoshop / InDesign / draw.io / EMF)', order: 5 },
  { id: 'cad', title: '06. CAD & Plotter Drawings (DXF / Jw_cad / SXF / CGM / HP-GL/2)', order: 6 },
  { id: 'pcb', title: '07. PCB & Schematics (KiCad / Gerber / Excellon)', order: 7 },
  { id: 'image', title: '08. Images (TIFF / PNG / JPEG / GIF / WebP / AVIF / BMP / ICO / SVG)', order: 8 },
  { id: 'music', title: '09. Sheet Music & Scores (MusicXML / MIDI / MML)', order: 9 },
  { id: 'audio', title: '10. Audio Files (MP3 / AAC / FLAC / Ogg / Opus / WAV / AIFF)', order: 10 },
  { id: 'font', title: '11. Fonts (TTF / OTF / TTC / OTC / WOFF / WOFF2)', order: 11 },
];

export const SUPPORTED_EXTENSIONS: ExtensionMeta[] = [
  // 02. Office Documents (Excel / Word / PowerPoint / Visio)
  { ext: 'xlsx', category: 'office', label: 'Excel (.xlsx)', description: 'Microsoft Excel Workbook (.xlsx)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'xlsm', category: 'office', label: 'Excel (.xlsm)', description: 'Microsoft Excel Macro-Enabled Workbook (.xlsm)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'xltx', category: 'office', label: 'Excel (.xltx)', description: 'Microsoft Excel Template (.xltx)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'xltm', category: 'office', label: 'Excel (.xltm)', description: 'Microsoft Excel Macro-Enabled Template (.xltm)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'docx', category: 'office', label: 'Word (.docx)', description: 'Microsoft Word Document (.docx)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'docm', category: 'office', label: 'Word (.docm)', description: 'Microsoft Word Macro-Enabled Document (.docm)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'dotx', category: 'office', label: 'Word (.dotx)', description: 'Microsoft Word Template (.dotx)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'dotm', category: 'office', label: 'Word (.dotm)', description: 'Microsoft Word Macro-Enabled Template (.dotm)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'pptx', category: 'office', label: 'PowerPoint (.pptx)', description: 'Microsoft PowerPoint Presentation (.pptx)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'pptm', category: 'office', label: 'PowerPoint (.pptm)', description: 'Microsoft PowerPoint Macro-Enabled Presentation (.pptm)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'ppsx', category: 'office', label: 'PowerPoint (.ppsx)', description: 'Microsoft PowerPoint Slide Show (.ppsx)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'ppsm', category: 'office', label: 'PowerPoint (.ppsm)', description: 'Microsoft PowerPoint Macro-Enabled Slide Show (.ppsm)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'potx', category: 'office', label: 'PowerPoint (.potx)', description: 'Microsoft PowerPoint Template (.potx)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'potm', category: 'office', label: 'PowerPoint (.potm)', description: 'Microsoft PowerPoint Macro-Enabled Template (.potm)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'vsdx', category: 'office', label: 'Visio (.vsdx)', description: 'Microsoft Visio Drawing (.vsdx)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'vsdm', category: 'office', label: 'Visio (.vsdm)', description: 'Microsoft Visio Macro-Enabled Drawing (.vsdm)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'vstx', category: 'office', label: 'Visio (.vstx)', description: 'Microsoft Visio Template (.vstx)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'vstm', category: 'office', label: 'Visio (.vstm)', description: 'Microsoft Visio Macro-Enabled Template (.vstm)', defaultEnabled: true, defaultTheme: 'light' },

  // 03. Documents, eBooks & Web (BDF / PDF / EPUB / HTML / Markdown)
  { ext: 'bdf', category: 'document', label: 'BDF (.bdf)', description: 'BDF Document (.bdf)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'bdft', category: 'document', label: 'BDF Template (.bdft)', description: 'BDF Compiled Form Template (.bdft)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'pdf', category: 'document', label: 'PDF (.pdf)', description: 'PDF Document (.pdf)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'epub', category: 'document', label: 'EPUB (.epub)', description: 'EPUB Publication (.epub)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'html', category: 'document', label: 'HTML (.html)', description: 'HTML Document in Reader Mode (.html)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'htm', category: 'document', label: 'HTML (.htm)', description: 'HTML Document in Reader Mode (.htm)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'xhtml', category: 'document', label: 'XHTML (.xhtml)', description: 'XHTML Document in Reader Mode (.xhtml)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'mhtml', category: 'document', label: 'MHTML (.mhtml)', description: 'MHTML Web Archive (.mhtml)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'mht', category: 'document', label: 'MHT (.mht)', description: 'MHT Web Archive (.mht)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'md', category: 'document', label: 'Markdown (.md)', description: 'Markdown Document in Reader Mode (.md)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'markdown', category: 'document', label: 'Markdown (.markdown)', description: 'Markdown Document in Reader Mode (.markdown)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'mdown', category: 'document', label: 'Markdown (.mdown)', description: 'Markdown Document in Reader Mode (.mdown)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'mkd', category: 'document', label: 'Markdown (.mkd)', description: 'Markdown Document in Reader Mode (.mkd)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'mdx', category: 'document', label: 'MDX (.mdx)', description: 'MDX Document in Reader Mode (.mdx)', defaultEnabled: false, defaultTheme: 'auto' },

  // 04. Data & Tables (CSV / TSV / Parquet)
  { ext: 'csv', category: 'data', label: 'CSV (.csv)', description: 'Comma-Separated Values (.csv)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'tsv', category: 'data', label: 'TSV (.tsv)', description: 'Tab-Separated Values (.tsv)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'tab', category: 'data', label: 'TAB (.tab)', description: 'Tab-Separated Values (.tab)', defaultEnabled: false, defaultTheme: 'auto' },
  { ext: 'parquet', category: 'data', label: 'Parquet (.parquet)', description: 'Apache Parquet Columnar Data (.parquet)', defaultEnabled: true, defaultTheme: 'auto' },
  { ext: 'parq', category: 'data', label: 'Parquet (.parq)', description: 'Apache Parquet Columnar Data (.parq)', defaultEnabled: true, defaultTheme: 'auto' },
  { ext: 'pqt', category: 'data', label: 'Parquet (.pqt)', description: 'Apache Parquet Columnar Data (.pqt)', defaultEnabled: true, defaultTheme: 'auto' },

  // 05. Design, DTP & Diagrams (Illustrator / Photoshop / InDesign / draw.io / EMF)
  { ext: 'ai', category: 'design', label: 'Illustrator (.ai)', description: 'Adobe Illustrator Artwork (.ai)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'psd', category: 'design', label: 'Photoshop (.psd)', description: 'Adobe Photoshop Document (.psd)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'psb', category: 'design', label: 'Photoshop (.psb)', description: 'Adobe Photoshop Large Document (.psb)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'idml', category: 'design', label: 'InDesign (.idml)', description: 'Adobe InDesign Markup Document (.idml)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'drawio', category: 'design', label: 'draw.io (.drawio)', description: 'draw.io Diagram (.drawio)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'dio', category: 'design', label: 'draw.io (.dio)', description: 'draw.io Diagram (.dio)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'emf', category: 'design', label: 'EMF (.emf)', description: 'Windows Enhanced Metafile (.emf)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'wmf', category: 'design', label: 'WMF (.wmf)', description: 'Windows Metafile (.wmf)', defaultEnabled: true, defaultTheme: 'light' },

  // 06. CAD & Plotter Drawings (DXF / Jw_cad / SXF / CGM / HP-GL/2)
  { ext: 'dxf', category: 'cad', label: 'AutoCAD DXF (.dxf)', description: 'AutoCAD DXF Drawing (.dxf)', defaultEnabled: true, defaultTheme: 'auto' },
  { ext: 'jww', category: 'cad', label: 'Jw_cad (.jww)', description: 'Jw_cad Drawing (.jww)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'sxf', category: 'cad', label: 'SXF (.sxf)', description: 'SXF CAD Drawing (.sxf)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'p21', category: 'cad', label: 'SXF P21 (.p21)', description: 'SXF P21 CAD Drawing (.p21)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'p2z', category: 'cad', label: 'SXF P2Z (.p2z)', description: 'SXF P2Z Compressed CAD Drawing (.p2z)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'sfc', category: 'cad', label: 'SXF SFC (.sfc)', description: 'SXF SFC CAD Drawing (.sfc)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'cgm', category: 'cad', label: 'CGM (.cgm)', description: 'Computer Graphics Metafile (.cgm)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'cgz', category: 'cad', label: 'CGZ (.cgz)', description: 'Compressed Computer Graphics Metafile (.cgz)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'plt', category: 'cad', label: 'HP-GL/2 (.plt)', description: 'HP-GL/2 Plotter File (.plt)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'hpgl', category: 'cad', label: 'HP-GL/2 (.hpgl)', description: 'HP-GL/2 Plotter File (.hpgl)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'hgl', category: 'cad', label: 'HP-GL (.hgl)', description: 'HP-GL Plotter File (.hgl)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'hpg', category: 'cad', label: 'HP-GL (.hpg)', description: 'HP-GL Plotter File (.hpg)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'hp2', category: 'cad', label: 'HP-GL/2 (.hp2)', description: 'HP-GL/2 Plotter File (.hp2)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'rtl', category: 'cad', label: 'HP RTL (.rtl)', description: 'HP RTL Plotter File (.rtl)', defaultEnabled: true, defaultTheme: 'light' },

  // 07. PCB & Schematics (KiCad / Gerber / Excellon)
  { ext: 'kicad_sch', category: 'pcb', label: 'KiCad Schematic (.kicad_sch)', description: 'KiCad Schematic (.kicad_sch)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'kicad_pcb', category: 'pcb', label: 'KiCad Board (.kicad_pcb)', description: 'KiCad Printed Circuit Board (.kicad_pcb)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'kicad_pro', category: 'pcb', label: 'KiCad Project (.kicad_pro)', description: 'KiCad Project File (.kicad_pro)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gbr', category: 'pcb', label: 'Gerber (.gbr)', description: 'Gerber RS-274X PCB Layer (.gbr)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'ger', category: 'pcb', label: 'Gerber (.ger)', description: 'Gerber RS-274X PCB Layer (.ger)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gtl', category: 'pcb', label: 'Gerber Top Copper (.gtl)', description: 'Gerber Top Copper Layer (.gtl)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gbl', category: 'pcb', label: 'Gerber Bottom Copper (.gbl)', description: 'Gerber Bottom Copper Layer (.gbl)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gto', category: 'pcb', label: 'Gerber Top Silk (.gto)', description: 'Gerber Top Silkscreen Layer (.gto)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gbo', category: 'pcb', label: 'Gerber Bottom Silk (.gbo)', description: 'Gerber Bottom Silkscreen Layer (.gbo)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gts', category: 'pcb', label: 'Gerber Top Mask (.gts)', description: 'Gerber Top Solder Mask Layer (.gts)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gbs', category: 'pcb', label: 'Gerber Bottom Mask (.gbs)', description: 'Gerber Bottom Solder Mask Layer (.gbs)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gtp', category: 'pcb', label: 'Gerber Top Paste (.gtp)', description: 'Gerber Top Solder Paste Layer (.gtp)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gbp', category: 'pcb', label: 'Gerber Bottom Paste (.gbp)', description: 'Gerber Bottom Solder Paste Layer (.gbp)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gko', category: 'pcb', label: 'Gerber Outline (.gko)', description: 'Gerber Board Keep-Out / Outline Layer (.gko)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gml', category: 'pcb', label: 'Gerber Mill (.gml)', description: 'Gerber Mill / Outline Layer (.gml)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gm1', category: 'pcb', label: 'Gerber Mechanical 1 (.gm1)', description: 'Gerber Mechanical Layer 1 (.gm1)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'g1', category: 'pcb', label: 'Gerber Inner 1 (.g1)', description: 'Gerber Inner Copper Layer 1 (.g1)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'g2', category: 'pcb', label: 'Gerber Inner 2 (.g2)', description: 'Gerber Inner Copper Layer 2 (.g2)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'g3', category: 'pcb', label: 'Gerber Inner 3 (.g3)', description: 'Gerber Inner Copper Layer 3 (.g3)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'g4', category: 'pcb', label: 'Gerber Inner 4 (.g4)', description: 'Gerber Inner Copper Layer 4 (.g4)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gp1', category: 'pcb', label: 'Gerber Plane 1 (.gp1)', description: 'Gerber Internal Plane Layer 1 (.gp1)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'gp2', category: 'pcb', label: 'Gerber Plane 2 (.gp2)', description: 'Gerber Internal Plane Layer 2 (.gp2)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'pho', category: 'pcb', label: 'Gerber Photoplot (.pho)', description: 'Gerber Photoplot Data (.pho)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'art', category: 'pcb', label: 'Allegro Artwork (.art)', description: 'Cadence Allegro Gerber Artwork (.art)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'cmp', category: 'pcb', label: 'EAGLE Component Copper (.cmp)', description: 'EAGLE Component Side Copper (.cmp)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'sol', category: 'pcb', label: 'EAGLE Solder Copper (.sol)', description: 'EAGLE Solder Side Copper (.sol)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'plc', category: 'pcb', label: 'EAGLE Component Silk (.plc)', description: 'EAGLE Component Side Silkscreen (.plc)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'pls', category: 'pcb', label: 'EAGLE Solder Silk (.pls)', description: 'EAGLE Solder Side Silkscreen (.pls)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'stc', category: 'pcb', label: 'EAGLE Component Mask (.stc)', description: 'EAGLE Component Side Solder Stop Mask (.stc)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'sts', category: 'pcb', label: 'EAGLE Solder Mask (.sts)', description: 'EAGLE Solder Side Solder Stop Mask (.sts)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'crc', category: 'pcb', label: 'EAGLE Component Cream (.crc)', description: 'EAGLE Component Side Solder Paste (.crc)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'crs', category: 'pcb', label: 'EAGLE Solder Cream (.crs)', description: 'EAGLE Solder Side Solder Paste (.crs)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'drl', category: 'pcb', label: 'Excellon Drill (.drl)', description: 'Excellon NC Drill File (.drl)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'drd', category: 'pcb', label: 'Excellon Drill (.drd)', description: 'Excellon NC Drill File (.drd)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'xln', category: 'pcb', label: 'Excellon Drill (.xln)', description: 'Excellon NC Drill File (.xln)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'exc', category: 'pcb', label: 'Excellon Drill (.exc)', description: 'Excellon NC Drill File (.exc)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'zip', category: 'pcb', label: 'PCB Archive (.zip)', description: 'Gerber / KiCad Project ZIP Archive (.zip)', defaultEnabled: false, defaultTheme: 'light' },

  // 08. Images (TIFF / PNG / JPEG / GIF / WebP / AVIF / BMP / ICO / SVG)
  { ext: 'tif', category: 'image', label: 'TIFF (.tif)', description: 'Multi-page TIFF Image (.tif)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'tiff', category: 'image', label: 'TIFF (.tiff)', description: 'Multi-page TIFF Image (.tiff)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'png', category: 'image', label: 'PNG (.png)', description: 'PNG Image (.png)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'apng', category: 'image', label: 'APNG (.apng)', description: 'Animated PNG Image (.apng)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'jpg', category: 'image', label: 'JPEG (.jpg)', description: 'JPEG Image (.jpg)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'jpeg', category: 'image', label: 'JPEG (.jpeg)', description: 'JPEG Image (.jpeg)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'jpe', category: 'image', label: 'JPEG (.jpe)', description: 'JPEG Image (.jpe)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'jfif', category: 'image', label: 'JFIF (.jfif)', description: 'JPEG JFIF Image (.jfif)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'gif', category: 'image', label: 'GIF (.gif)', description: 'GIF Image (.gif)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'webp', category: 'image', label: 'WebP (.webp)', description: 'WebP Image (.webp)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'avif', category: 'image', label: 'AVIF (.avif)', description: 'AVIF Image (.avif)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'bmp', category: 'image', label: 'BMP (.bmp)', description: 'BMP Bitmap Image (.bmp)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'ico', category: 'image', label: 'ICO (.ico)', description: 'ICO Icon Image (.ico)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'svg', category: 'image', label: 'SVG (.svg)', description: 'SVG Vector Image (.svg)', defaultEnabled: false, defaultTheme: 'light' },

  // 09. Sheet Music & Scores (MusicXML / MIDI / MML)
  { ext: 'musicxml', category: 'music', label: 'MusicXML (.musicxml)', description: 'MusicXML Score (.musicxml)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'mxl', category: 'music', label: 'MusicXML (.mxl)', description: 'Compressed MusicXML Score (.mxl)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'mid', category: 'music', label: 'MIDI (.mid)', description: 'Standard MIDI File (.mid)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'midi', category: 'music', label: 'MIDI (.midi)', description: 'Standard MIDI File (.midi)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'smf', category: 'music', label: 'MIDI (.smf)', description: 'Standard MIDI File (.smf)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'kar', category: 'music', label: 'Karaoke MIDI (.kar)', description: 'Karaoke MIDI File (.kar)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'rmi', category: 'music', label: 'RIFF MIDI (.rmi)', description: 'RIFF MIDI File (.rmi)', defaultEnabled: true, defaultTheme: 'light' },
  { ext: 'mml', category: 'music', label: 'MML (.mml)', description: 'Music Macro Language Score (.mml)', defaultEnabled: true, defaultTheme: 'light' },

  // 10. Audio Files (MP3 / AAC / FLAC / Ogg / Opus / WAV / AIFF)
  { ext: 'mp3', category: 'audio', label: 'MP3 (.mp3)', description: 'MP3 Audio File (.mp3)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'm4a', category: 'audio', label: 'M4A (.m4a)', description: 'MPEG-4 Audio / AAC / ALAC (.m4a)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'm4b', category: 'audio', label: 'M4B (.m4b)', description: 'MPEG-4 Audiobook (.m4b)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'm4p', category: 'audio', label: 'M4P (.m4p)', description: 'MPEG-4 Audio (.m4p)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'aac', category: 'audio', label: 'AAC (.aac)', description: 'AAC (ADTS) Audio File (.aac)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'flac', category: 'audio', label: 'FLAC (.flac)', description: 'FLAC Lossless Audio File (.flac)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'ogg', category: 'audio', label: 'Ogg Vorbis (.ogg)', description: 'Ogg Vorbis Audio File (.ogg)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'oga', category: 'audio', label: 'Ogg Audio (.oga)', description: 'Ogg Audio File (.oga)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'opus', category: 'audio', label: 'Opus (.opus)', description: 'Ogg Opus Audio File (.opus)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'spx', category: 'audio', label: 'Speex (.spx)', description: 'Ogg Speex Audio File (.spx)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'wav', category: 'audio', label: 'WAV (.wav)', description: 'WAV Audio File (.wav)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'wave', category: 'audio', label: 'WAVE (.wave)', description: 'WAVE Audio File (.wave)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'aif', category: 'audio', label: 'AIFF (.aif)', description: 'AIFF Audio File (.aif)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'aiff', category: 'audio', label: 'AIFF (.aiff)', description: 'AIFF Audio File (.aiff)', defaultEnabled: false, defaultTheme: 'light' },
  { ext: 'aifc', category: 'audio', label: 'AIFF-C (.aifc)', description: 'AIFF-C Audio File (.aifc)', defaultEnabled: false, defaultTheme: 'light' },

  // 11. Fonts (TTF / OTF / TTC / OTC / WOFF / WOFF2)
  { ext: 'ttf', category: 'font', label: 'TrueType (.ttf)', description: 'TrueType Font Specimen (.ttf)', defaultEnabled: true, defaultTheme: 'auto' },
  { ext: 'otf', category: 'font', label: 'OpenType (.otf)', description: 'OpenType Font Specimen (.otf)', defaultEnabled: true, defaultTheme: 'auto' },
  { ext: 'ttc', category: 'font', label: 'TrueType Collection (.ttc)', description: 'TrueType Font Collection Specimen (.ttc)', defaultEnabled: true, defaultTheme: 'auto' },
  { ext: 'otc', category: 'font', label: 'OpenType Collection (.otc)', description: 'OpenType Font Collection Specimen (.otc)', defaultEnabled: true, defaultTheme: 'auto' },
  { ext: 'woff', category: 'font', label: 'WOFF (.woff)', description: 'Web Open Font Format 1.0 Specimen (.woff)', defaultEnabled: true, defaultTheme: 'auto' },
  { ext: 'woff2', category: 'font', label: 'WOFF2 (.woff2)', description: 'Web Open Font Format 2.0 Specimen (.woff2)', defaultEnabled: true, defaultTheme: 'auto' },
];

const BDF_EDITOR_ID = 'bdf.previewEditor';

/**
 * Retrieve ExtensionMeta from a file path or extension string
 */
export function getExtensionMeta(filePathOrExt: string): ExtensionMeta | undefined {
  const cleaned = (
    filePathOrExt.includes('.') ? path.extname(filePathOrExt) : filePathOrExt
  )
    .replace(/^\./, '')
    .toLowerCase();
  return SUPPORTED_EXTENSIONS.find((item) => item.ext === cleaned);
}

/**
 * Get the preview theme mode (bdf.theme.<category>.<ext>) for a given file path or extension
 */
export function getThemeForExtension(filePathOrExt: string): PreviewThemeMode {
  const meta = getExtensionMeta(filePathOrExt);
  const bdfThemeConfig = vscode.workspace.getConfiguration('bdf.theme');
  if (meta) {
    const key = `${meta.category}.${meta.ext}`;
    const val = bdfThemeConfig.get<PreviewThemeMode>(key, meta.defaultTheme);
    if (val === 'auto' || val === 'light' || val === 'dark') {
      return val;
    }
    return meta.defaultTheme;
  }
  return 'light';
}

/**
 * Persist the preview theme mode (bdf.theme.<category>.<ext>) for a given file path or extension
 */
export async function setThemeForExtension(
  filePathOrExt: string,
  theme: PreviewThemeMode
): Promise<void> {
  const meta = getExtensionMeta(filePathOrExt);
  if (!meta) return;
  const bdfThemeConfig = vscode.workspace.getConfiguration('bdf.theme');
  await bdfThemeConfig.update(
    `${meta.category}.${meta.ext}`,
    theme,
    vscode.ConfigurationTarget.Global
  );
}

/**
 * Read bdf.preview.<category>.<ext> with fallback to legacy bdf.preview.<ext>
 */
function isExtensionEnabled(bdfPreviewConfig: vscode.WorkspaceConfiguration, item: ExtensionMeta): boolean {
  const categorizedKey = `${item.category}.${item.ext}`;
  const inspectCategorized = bdfPreviewConfig.inspect<boolean>(categorizedKey);
  if (
    inspectCategorized?.globalValue !== undefined ||
    inspectCategorized?.workspaceValue !== undefined ||
    inspectCategorized?.workspaceFolderValue !== undefined
  ) {
    return bdfPreviewConfig.get<boolean>(categorizedKey, item.defaultEnabled);
  }
  const inspectLegacy = bdfPreviewConfig.inspect<boolean>(item.ext);
  if (
    inspectLegacy?.globalValue !== undefined ||
    inspectLegacy?.workspaceValue !== undefined ||
    inspectLegacy?.workspaceFolderValue !== undefined
  ) {
    return bdfPreviewConfig.get<boolean>(item.ext, item.defaultEnabled);
  }
  return item.defaultEnabled;
}

/**
 * Synchronize bdf.preview.<category>.<ext> settings with workbench.editorAssociations
 */
export async function syncAssociationsFromConfig(): Promise<void> {
  const bdfConfig = vscode.workspace.getConfiguration('bdf.preview');
  const workbenchConfig = vscode.workspace.getConfiguration('workbench');
  const currentAssoc = workbenchConfig.get<Record<string, string>>('editorAssociations') || {};
  const updatedAssoc = { ...currentAssoc };

  let changed = false;

  for (const item of SUPPORTED_EXTENSIONS) {
    const isEnabled = isExtensionEnabled(bdfConfig, item);
    const globPattern = `*.${item.ext}`;

    if (isEnabled) {
      if (updatedAssoc[globPattern] !== BDF_EDITOR_ID) {
        updatedAssoc[globPattern] = BDF_EDITOR_ID;
        changed = true;
      }
    } else {
      if (updatedAssoc[globPattern] === BDF_EDITOR_ID) {
        delete updatedAssoc[globPattern];
        changed = true;
      }
    }
  }

  if (changed) {
    await workbenchConfig.update(
      'editorAssociations',
      updatedAssoc,
      vscode.ConfigurationTarget.Global
    );
  }
}

/**
 * Show an interactive QuickPick with category separators to configure default preview extensions
 */
export async function showConfigureAssociationsQuickPick(): Promise<void> {
  const bdfConfig = vscode.workspace.getConfiguration('bdf.preview');

  interface ExtQuickPickItem extends vscode.QuickPickItem {
    meta?: ExtensionMeta;
  }

  const items: ExtQuickPickItem[] = [];

  for (const cat of EXTENSION_CATEGORIES) {
    const catExts = SUPPORTED_EXTENSIONS.filter((e) => e.category === cat.id);
    if (catExts.length === 0) continue;

    items.push({
      label: cat.title,
      kind: vscode.QuickPickItemKind.Separator
    });

    for (const meta of catExts) {
      const isEnabled = isExtensionEnabled(bdfConfig, meta);
      items.push({
        label: meta.label,
        description: `[${cat.title.replace(/^\d+\.\s*/, '')}] ${meta.description}`,
        picked: isEnabled,
        meta
      });
    }
  }

  const selected = await vscode.window.showQuickPick(items, {
    canPickMany: true,
    matchOnDescription: true,
    placeHolder: 'Select file extensions to open automatically with BDF Preview',
    title: 'BDF: Configure Default File Associations (140 Extensions)'
  });

  if (selected === undefined) {
    return;
  }

  const selectedExts = new Set(
    selected.map((s) => s.meta?.ext).filter((e): e is string => Boolean(e))
  );

  for (const meta of SUPPORTED_EXTENSIONS) {
    const shouldEnable = selectedExts.has(meta.ext);
    const currentVal = isExtensionEnabled(bdfConfig, meta);
    if (shouldEnable !== currentVal) {
      await bdfConfig.update(
        `${meta.category}.${meta.ext}`,
        shouldEnable,
        vscode.ConfigurationTarget.Global
      );
    }
  }

  await syncAssociationsFromConfig();

  vscode.window.showInformationMessage(
    `Updated BDF Preview file associations (${selectedExts.size} / ${SUPPORTED_EXTENSIONS.length} enabled).`
  );
}
