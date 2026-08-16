import { describe, expect, it } from "vitest";

import { MJTV_CHANNELS, channelById } from "../lib/mjtv-data";
import { addRecentChannel, filterChannels, toggleChannelId } from "../lib/mjtv-state";

describe("catalogue MJTV mobile", () => {
  it("expose une identité unique et une source de lecture pour chaque chaîne", () => {
    const identifiers = MJTV_CHANNELS.map((channel) => channel.id);
    expect(new Set(identifiers).size).toBe(MJTV_CHANNELS.length);
    expect(MJTV_CHANNELS.every((channel) => channel.streamUrl.startsWith("https://"))).toBe(true);
  });

  it("résout une chaîne du catalogue par son identifiant", () => {
    expect(channelById("france-24")?.name).toBe("France 24");
    expect(channelById("introuvable")).toBeNull();
  });

  it("gère les favoris et les reprises sans doublon", () => {
    expect(toggleChannelId(["arte"], "france-24")).toEqual(["france-24", "arte"]);
    expect(toggleChannelId(["arte"], "arte")).toEqual([]);
    expect(addRecentChannel(["arte", "france-24"], "france-24")).toEqual(["france-24", "arte"]);
  });

  it("filtre les chaînes avec les mêmes termes que la recherche mobile", () => {
    expect(filterChannels(MJTV_CHANNELS, "Actualités", "france").map((channel) => channel.id)).toEqual(["france-24"]);
    expect(filterChannels(MJTV_CHANNELS, "Tout", "culture").map((channel) => channel.id)).toEqual(["arte", "museum-tv"]);
  });
});
