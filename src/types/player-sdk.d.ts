interface PlayerSubtitleSource {
  language?: string;
  srclang?: string;
  label?: string;
  url?: string;
  src?: string;
  primary?: boolean;
  default?: boolean;
}

interface PlayerReadyInfo {
  duration: number;
}

interface PlayerEventHandlers {
  ready?: (
    event?: unknown,
    info?: PlayerReadyInfo,
    videoElement?: HTMLVideoElement | null,
  ) => void;
  play?: () => void;
  pause?: () => void;
  ended?: () => void;
  error?: (error?: unknown) => void;
}

interface PlayerOptions {
  url: string;
  container: string | HTMLElement;
  wrapper?: string;
  thumbnailSrc?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  title?: string;
  controlsAutoHideMs?: number;
  themeColor?: string;
  subtitle?: PlayerSubtitleSource[] | null;
  events?: PlayerEventHandlers;
}

interface PlayerInstance {
  load: (url: string) => Promise<void> | void;
  play: () => Promise<void> | void;
  pause: () => void;
  setCaptionLanguage: (language: string) => void;
  setSubtitle: (
    subtitles: PlayerSubtitleSource[] | null,
    preferredLanguage?: string,
  ) => void;
  destroy: () => void;
  getVideoElement?: () => HTMLVideoElement | null;
}

interface PlayerConstructor {
  new (options: PlayerOptions): PlayerInstance;
}

interface Window {
  Player?: PlayerConstructor;
}
