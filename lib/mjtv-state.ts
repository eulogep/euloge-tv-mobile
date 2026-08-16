import type { MjtvChannel } from "./mjtv-data";

export const toggleChannelId = (ids: string[], channelId: string): string[] =>
  ids.includes(channelId) ? ids.filter((id) => id !== channelId) : [channelId, ...ids];

export const addRecentChannel = (ids: string[], channelId: string, limit = 50): string[] =>
  [channelId, ...ids.filter((id) => id !== channelId)].slice(0, limit);

export const filterChannels = (channels: MjtvChannel[], category: string, query: string): MjtvChannel[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");
  return channels.filter((channel) => {
    const matchesCategory = category === "Tout" || channel.category === category;
    const matchesQuery = !normalizedQuery || [channel.name, channel.country, channel.category, channel.language, channel.currentProgram]
      .join(" ")
      .toLocaleLowerCase("fr")
      .includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
};
