import { describe, expect, it } from "vitest";

import { mapRemoteChannel, rankRemoteStreams } from "../lib/mjtv-api";

describe("mapping des contrats MJTV desktop", () => {
  it("mappe la santé, l’EPG et sa progression sans inventer de données", () => {
    const channel = mapRemoteChannel(
      {
        id: "remote-news",
        name: "Remote News",
        countryName: "France",
        languageCodes: ["fr"],
        primaryCategory: "news",
        streamCount: 1,
        health: {
          status: "degraded",
          reasonMessage: "Disponibilité limitée",
          sourceCount: 2,
          playableSourceCount: 1,
        },
        epg: {
          currentProgram: {
            title: "Le journal",
            startAt: "2026-08-17T10:00:00.000Z",
            endAt: "2026-08-17T11:00:00.000Z",
          },
          nextProgram: { title: "Focus" },
          laterPrograms: [{ title: "Le débat" }],
          status: "available",
          source: { name: "EPG officiel", kind: "xmltv" },
        },
        streams: [
          {
            id: "hls-720",
            url: "https://example.test/live.m3u8",
            quality: "720p",
            label: "HD",
            kind: "hls",
            browserCompatibility: "preferred",
            availability: { status: "playable" },
          },
        ],
      },
      Date.parse("2026-08-17T10:30:00.000Z"),
    );

    expect(channel.status).toBe("degraded");
    expect(channel.currentProgram).toBe("Le journal");
    expect(channel.nextProgram).toBe("Focus");
    expect(channel.laterPrograms).toEqual(["Le débat"]);
    expect(channel.progress).toBe(0.5);
    expect(channel.epgSource).toBe("EPG officiel");
    expect(channel.streams?.[0]).toMatchObject({
      quality: "720p",
      kind: "hls",
    });
    expect(channel.streamUrl).toBe("https://example.test/live.m3u8");
  });

  it("ne crée aucune source ou EPG de secours quand le contrat les omet", () => {
    const channel = mapRemoteChannel({
      id: "sans-source",
      name: "Sans source",
      health: { status: "healthy" },
    });

    expect(channel.streamUrl).toBe("");
    expect(channel.streams).toEqual([]);
    expect(channel.canOpen).toBe(false);
    expect(channel.currentProgram).toBe("Programme indisponible");
    expect(channel.nextProgram).toBe("Guide indisponible");
  });

  it("privilégie les sources compatibles et rejette les sources non sûres", () => {
    const streams = rankRemoteStreams([
      {
        id: "limited",
        url: "https://example.test/limited.m3u8",
        kind: "hls",
        browserCompatibility: "limited",
        availability: { status: "temporarily_unavailable" },
      },
      {
        id: "preferred",
        url: "https://example.test/live.m3u8",
        kind: "hls",
        browserCompatibility: "preferred",
        availability: { status: "playable" },
      },
      { id: "http", url: "http://example.test/live.m3u8", kind: "hls" },
      {
        id: "referrer",
        url: "https://example.test/referrer.m3u8",
        kind: "hls",
        requiresReferrer: true,
      },
      {
        id: "blocked",
        url: "https://example.test/blocked.m3u8",
        kind: "hls",
        browserCompatibility: "blocked",
      },
    ]);

    expect(streams.map((stream) => stream.id)).toEqual([
      "preferred",
      "limited",
    ]);
  });
});
