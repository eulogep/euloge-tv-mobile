import { describe, expect, it } from "vitest";

import { mapRemoteChannel } from "../lib/mjtv-api";

describe("mapping des contrats MJTV desktop", () => {
  it("convertit la santé et l’EPG publics en modèle mobile", () => {
    const channel = mapRemoteChannel({
      id: "remote-news",
      name: "Remote News",
      countryName: "France",
      primaryCategory: "news",
      health: { status: "degraded", reasonMessage: "Disponibilité limitée", sourceCount: 2, playableSourceCount: 1 },
      epg: {
        currentProgram: { title: "Le journal" },
        nextProgram: { title: "Focus" },
        status: "available",
      },
      streams: [{ id: "hls-720", url: "https://example.test/live.m3u8", quality: "720p", label: "HD", kind: "hls" }],
    });

    expect(channel.status).toBe("degraded");
    expect(channel.currentProgram).toBe("Le journal");
    expect(channel.nextProgram).toBe("Focus");
    expect(channel.streams?.[0]).toMatchObject({ quality: "720p", kind: "hls" });
    expect(channel.streamUrl).toBe("https://example.test/live.m3u8");
  });

  it("retombe sur les valeurs locales si l’EPG ou les sources distantes sont absents", () => {
    const channel = mapRemoteChannel({ id: "france-24", name: "France 24", health: { status: "healthy" } });
    expect(channel.currentProgram).toBe("Le journal");
    expect(channel.streamUrl).toContain(".m3u8");
    expect(channel.status).toBe("live");
  });
});
