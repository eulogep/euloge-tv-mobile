export type ChannelStatus = "live" | "degraded" | "unverified" | "restricted" | "offline";

export type MjtvChannel = {
  id: string;
  name: string;
  country: string;
  language: string;
  category: string;
  currentProgram: string;
  nextProgram: string;
  progress: number;
  status: ChannelStatus;
  accent: string;
  streamUrl: string;
  streams?: { id: string; url: string; quality: string; label: string; kind: "hls" | "mp4" | "unknown" }[];
  health?: { status?: string; checkedAt?: string | null; sourceCount?: number; playableSourceCount?: number; reasonCode?: string; reasonMessage?: string };
  epgStatus?: string;
};

export const MJTV_CHANNELS: MjtvChannel[] = [
  {
    id: "france-24",
    name: "France 24",
    country: "France",
    language: "Français",
    category: "Actualités",
    currentProgram: "Le journal",
    nextProgram: "Focus international",
    progress: 0.64,
    status: "live",
    accent: "#24C8FF",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "arte",
    name: "ARTE",
    country: "France · Allemagne",
    language: "Français",
    category: "Culture",
    currentProgram: "Invitation au voyage",
    nextProgram: "Arte Journal",
    progress: 0.38,
    status: "live",
    accent: "#FF8A5C",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "tv5monde",
    name: "TV5MONDE",
    country: "France",
    language: "Français",
    category: "International",
    currentProgram: "64 minutes",
    nextProgram: "Le journal Afrique",
    progress: 0.76,
    status: "live",
    accent: "#8B4DFF",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "euronews",
    name: "Euronews",
    country: "Europe",
    language: "Français",
    category: "Actualités",
    currentProgram: "Euronews now",
    nextProgram: "Brussels, my love?",
    progress: 0.21,
    status: "live",
    accent: "#35D59A",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "rfi",
    name: "RFI",
    country: "France",
    language: "Français",
    category: "Radio",
    currentProgram: "Afrique matin",
    nextProgram: "Journal Monde",
    progress: 0.52,
    status: "degraded",
    accent: "#F6C85F",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "lcp",
    name: "LCP",
    country: "France",
    language: "Français",
    category: "Politique",
    currentProgram: "Débat du jour",
    nextProgram: "Questions au Gouvernement",
    progress: 0.44,
    status: "live",
    accent: "#C791FF",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "museum-tv",
    name: "Museum TV",
    country: "France",
    language: "Français",
    category: "Culture",
    currentProgram: "Art contemporain",
    nextProgram: "Portraits d’artistes",
    progress: 0.18,
    status: "live",
    accent: "#F58BC4",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "france-2",
    name: "France 2",
    country: "France",
    language: "Français",
    category: "Généraliste",
    currentProgram: "Télématin",
    nextProgram: "Journal de 13 heures",
    progress: 0.86,
    status: "offline",
    accent: "#72A7FF",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
];

export const MJTV_CATEGORIES = ["Tout", "Actualités", "Culture", "International", "Radio", "Politique"];

export const channelById = (id: string | null) => MJTV_CHANNELS.find((channel) => channel.id === id) ?? null;
