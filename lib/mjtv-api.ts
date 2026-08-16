import { channelById, type ChannelStatus, type MjtvChannel } from "./mjtv-data";

export type RemoteHealth = {
  status?: string;
  checkedAt?: string | null;
  sourceCount?: number;
  playableSourceCount?: number;
  reasonCode?: string;
  reasonMessage?: string;
};

export type RemoteEpg = {
  currentProgram?: { title?: string; name?: string } | null;
  nextProgram?: { title?: string; name?: string } | null;
  laterPrograms?: { title?: string; name?: string }[];
  status?: string;
  updatedAt?: string | null;
};

export type RemoteStream = {
  id: string;
  url: string;
  title?: string | null;
  quality?: string | null;
  label?: string | null;
  kind?: string;
  availability?: { status?: string };
};

export type RemoteChannel = {
  id: string;
  name: string;
  countryName?: string | null;
  countryCode?: string | null;
  languageCodes?: string[];
  primaryCategory?: string;
  categories?: string[];
  streamCount?: number;
  logoUrl?: string | null;
  streams?: RemoteStream[];
  health?: RemoteHealth;
  epg?: RemoteEpg;
};

export type RemoteCatalogResponse = {
  items: RemoteChannel[];
  nextCursor: string | null;
  total: number;
  filters?: unknown;
  generatedAt: string;
};

export type MobileStream = {
  id: string;
  url: string;
  quality: string;
  label: string;
  kind: "hls" | "mp4" | "unknown";
};

const accents = ["#24C8FF", "#FF8A5C", "#8B4DFF", "#35D59A", "#F6C85F", "#C791FF", "#F58BC4"];

function programTitle(program: RemoteEpg["currentProgram"]): string | null {
  if (!program) return null;
  return program.title ?? program.name ?? null;
}

function statusOf(health?: RemoteHealth): ChannelStatus {
  switch (health?.status) {
    case "healthy": return "live";
    case "degraded": return "degraded";
    case "unverified": return "unverified";
    case "blocked_or_restricted": return "restricted";
    default: return "offline";
  }
}

function accentFor(channel: RemoteChannel): string {
  const fallback = channelById(channel.id);
  if (fallback) return fallback.accent;
  return accents[Math.abs([...channel.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % accents.length];
}

export function mapRemoteChannel(channel: RemoteChannel): MjtvChannel {
  const fallback = channelById(channel.id);
  const epg = channel.epg;
  const streams: MobileStream[] = (channel.streams ?? [])
    .filter((stream) => Boolean(stream.url))
    .map((stream, index) => ({
      id: stream.id || `${channel.id}-${index}`,
      url: stream.url,
      quality: stream.quality ?? "Auto",
      label: stream.label ?? stream.title ?? `Source ${index + 1}`,
      kind: stream.kind === "hls" ? "hls" : stream.kind === "mp4" ? "mp4" : "unknown",
    }));
  const primaryStream = streams[0]?.url ?? fallback?.streamUrl ?? "";
  const currentProgram = programTitle(epg?.currentProgram) ?? fallback?.currentProgram ?? "Programme indisponible";
  const nextProgram = programTitle(epg?.nextProgram) ?? fallback?.nextProgram ?? "Guide indisponible";

  return {
    id: channel.id,
    name: channel.name,
    country: channel.countryName ?? channel.countryCode ?? fallback?.country ?? "International",
    language: channel.languageCodes?.join(" · ") || fallback?.language || "Non précisée",
    category: channel.primaryCategory ?? channel.categories?.[0] ?? fallback?.category ?? "Autre",
    currentProgram,
    nextProgram,
    progress: fallback?.progress ?? 0.35,
    status: statusOf(channel.health),
    accent: accentFor(channel),
    streamUrl: primaryStream,
    streams,
    health: channel.health,
    epgStatus: epg?.status ?? "unknown",
  };
}

export function mapRemoteCatalog(response: RemoteCatalogResponse): MjtvChannel[] {
  return response.items.map(mapRemoteChannel);
}
