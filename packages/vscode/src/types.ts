export type PreviewThemeMode = 'auto' | 'light' | 'dark';

export type WebviewToHostMessage =
  | { type: 'ready' }
  | { type: 'error'; message: string }
  | { type: 'requestPassword'; attempt: number }
  | { type: 'status'; message: string }
  | { type: 'themeChanged'; theme: PreviewThemeMode }
  | { type: 'close' };

export type HostToWebviewMessage =
    | {
      type: 'open';
      buffer: ArrayBuffer;
      filename: string;
      readOnly?: boolean;
      theme?: PreviewThemeMode;
      defaultLayout?: string;
      defaultZoom?: number;
    }
  | {
      type: 'openText';
      content: string;
      filename: string;
      theme?: PreviewThemeMode;
      truncated?: boolean;
      isBinary?: boolean;
      totalBytes?: number;
      shownBytes?: number;
    }
  | { type: 'loading'; filename: string; message?: string }
  | { type: 'error'; message: string }
  | { type: 'setPassword'; password?: string }
  | { type: 'setTheme'; theme: PreviewThemeMode }
  | { type: 'focus' };
