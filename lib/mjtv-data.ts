export type ChannelStatus =
  | "live"
  | "degraded"
  | "unverified"
  | "restricted"
  | "offline";

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
  logoUrl: string | null;
  streamCount: number;
  canOpen: boolean;
  streamUrl: string;
  streams?: {
    id: string;
    url: string;
    quality: string;
    label: string;
    kind: "hls" | "mp4";
    availability: string;
    compatibility: string;
  }[];
  health?: {
    status?: string;
    checkedAt?: string | null;
    sourceCount?: number;
    playableSourceCount?: number;
    reasonCode?: string;
    reasonMessage?: string;
  };
  epgStatus?: string;
  laterPrograms: string[];
  epgUpdatedAt: string | null;
  epgSource: string | null;
};
