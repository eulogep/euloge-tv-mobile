import { describe, expect, it } from "vitest";

import type { MjtvChannel } from "../lib/mjtv-data";
import {
  addRecentChannel,
  filterChannels,
  toggleChannelId,
} from "../lib/mjtv-state";

const channels: MjtvChannel[] = [
  {
    id: "news-fr",
    name: "Actualité France",
    country: "France",
    language: "fr",
    category: "news",
    currentProgram: "Programme indisponible",
    nextProgram: "Guide indisponible",
    progress: 0,
    status: "live",
    accent: "#24C8FF",
    logoUrl: null,
    streamCount: 1,
    canOpen: true,
    streamUrl: "https://example.test/news.m3u8",
    streams: [],
    epgStatus: "unknown",
    laterPrograms: [],
    epgUpdatedAt: null,
    epgSource: null,
  },
  {
    id: "culture-fr",
    name: "Culture Europe",
    country: "France",
    language: "fr",
    category: "culture",
    currentProgram: "Programme indisponible",
    nextProgram: "Guide indisponible",
    progress: 0,
    status: "unverified",
    accent: "#8B4DFF",
    logoUrl: null,
    streamCount: 0,
    canOpen: false,
    streamUrl: "",
    streams: [],
    epgStatus: "unknown",
    laterPrograms: [],
    epgUpdatedAt: null,
    epgSource: null,
  },
];

describe("état local MJTV mobile", () => {
  it("gère les favoris et les reprises sans doublon", () => {
    expect(toggleChannelId(["culture-fr"], "news-fr")).toEqual([
      "news-fr",
      "culture-fr",
    ]);
    expect(toggleChannelId(["culture-fr"], "culture-fr")).toEqual([]);
    expect(addRecentChannel(["culture-fr", "news-fr"], "news-fr")).toEqual([
      "news-fr",
      "culture-fr",
    ]);
  });

  it("filtre uniquement les chaînes réellement fournies par le catalogue", () => {
    expect(
      filterChannels(channels, "news", "france").map((channel) => channel.id),
    ).toEqual(["news-fr"]);
    expect(
      filterChannels(channels, "Tout", "culture").map((channel) => channel.id),
    ).toEqual(["culture-fr"]);
  });
});
