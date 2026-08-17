import type {
  RemoteChannel,
  RemoteEpg,
  RemoteStream,
} from "@/shared/mjtv-contract";
import type { ChannelStatus, MjtvChannel } from "./mjtv-data";

export type {
  RemoteCatalogResponse,
  RemoteChannel,
  RemoteFilterOption,
} from "@/shared/mjtv-contract";

export type MobileStream = {
  id: string;
  url: string;
  quality: string;
  label: string;
  kind: "hls" | "mp4";
  availability: string;
  compatibility: string;
};

const accents = [
  "#24C8FF",
  "#FF8A5C",
  "#8B4DFF",
  "#35D59A",
  "#F6C85F",
  "#C791FF",
  "#F58BC4",
];

function programTitle(program: RemoteEpg["currentProgram"]): string | null {
  if (!program) return null;
  return program.title ?? program.name ?? null;
}

function statusOf(health?: RemoteChannel["health"]): ChannelStatus {
  switch (health?.status) {
    case "healthy":
      return "live";
    case "degraded":
      return "degraded";
    case "unverified":
      return "unverified";
    case "blocked_or_restricted":
      return "restricted";
    default:
      return "offline";
  }
}

function accentFor(channel: RemoteChannel): string {
  const hash = [...channel.id].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return accents[Math.abs(hash) % accents.length]!;
}

const rejectedAvailability = new Set([
  "unsupported_format",
  "invalid_url",
  "forbidden_or_restricted",
]);
const availabilityScore: Record<string, number> = {
  playable: 50,
  unknown: 30,
  checking: 20,
  temporarily_unavailable: 10,
  network_error: 5,
  timeout: 5,
};
const compatibilityScore: Record<string, number> = {
  preferred: 30,
  "native-only": 25,
  unknown: 15,
  limited: 5,
  blocked: -100,
};

export function rankRemoteStreams(
  streams: RemoteStream[] = [],
): MobileStream[] {
  return streams
    .filter((stream) => {
      if (!stream.url || !["hls", "mp4"].includes(stream.kind ?? ""))
        return false;
      if (stream.requiresReferrer || stream.requiresCustomUserAgent)
        return false;
      if (stream.browserCompatibility === "blocked") return false;
      if (rejectedAvailability.has(stream.availability?.status ?? "unknown"))
        return false;
      try {
        return new URL(stream.url).protocol === "https:";
      } catch {
        return false;
      }
    })
    .map((stream, index) => ({ stream, index }))
    .sort((left, right) => {
      const leftScore =
        (availabilityScore[left.stream.availability?.status ?? "unknown"] ??
          0) +
        (compatibilityScore[left.stream.browserCompatibility ?? "unknown"] ??
          0);
      const rightScore =
        (availabilityScore[right.stream.availability?.status ?? "unknown"] ??
          0) +
        (compatibilityScore[right.stream.browserCompatibility ?? "unknown"] ??
          0);
      return rightScore - leftScore || left.index - right.index;
    })
    .map(({ stream }, index) => ({
      id: stream.id || `source-${index}`,
      url: stream.url,
      quality: stream.quality ?? "Auto",
      label: stream.label ?? stream.title ?? `Source ${index + 1}`,
      kind: stream.kind as "hls" | "mp4",
      availability: stream.availability?.status ?? "unknown",
      compatibility: stream.browserCompatibility ?? "unknown",
    }));
}

function progressOf(epg: RemoteEpg | undefined, now: number): number {
  const start = Date.parse(epg?.currentProgram?.startAt ?? "");
  const end = Date.parse(epg?.currentProgram?.endAt ?? "");
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    return 0;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

export function mapRemoteChannel(
  channel: RemoteChannel,
  now = Date.now(),
): MjtvChannel {
  const epg = channel.epg;
  const streams = rankRemoteStreams(channel.streams);
  const streamCount = channel.streamCount ?? channel.streams?.length ?? 0;
  const canOpen =
    streamCount > 0 &&
    !["archived", "no_source"].includes(channel.health?.status ?? "");

  return {
    id: channel.id,
    name: channel.name,
    country: channel.countryName ?? channel.countryCode ?? "International",
    language: channel.languageCodes?.join(" · ") || "Non précisée",
    category: channel.primaryCategory ?? channel.categories?.[0] ?? "other",
    currentProgram:
      programTitle(epg?.currentProgram) ?? "Programme indisponible",
    nextProgram: programTitle(epg?.nextProgram) ?? "Guide indisponible",
    progress: progressOf(epg, now),
    status: statusOf(channel.health),
    accent: accentFor(channel),
    logoUrl: channel.logoUrl ?? null,
    streamCount,
    canOpen,
    streamUrl: streams[0]?.url ?? "",
    streams,
    health: channel.health,
    epgStatus: epg?.status ?? "unknown",
    laterPrograms: (epg?.laterPrograms ?? [])
      .map(programTitle)
      .filter((title): title is string => Boolean(title)),
    epgUpdatedAt: epg?.updatedAt ?? null,
    epgSource: epg?.source?.name ?? null,
  };
}
