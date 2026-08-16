import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { MJTV_CHANNELS, channelById, type MjtvChannel } from "@/lib/mjtv-data";
import { addRecentChannel, toggleChannelId } from "@/lib/mjtv-state";
import { mapRemoteCatalog, mapRemoteChannel, type RemoteCatalogResponse, type RemoteChannel } from "@/lib/mjtv-api";
import { trpc } from "@/lib/trpc";

export type PlayerMode = "closed" | "expanded" | "mini";

type MjtvContextValue = {
  channels: MjtvChannel[];
  favorites: string[];
  history: string[];
  activeChannel: MjtvChannel | null;
  playerMode: PlayerMode;
  isPlaying: boolean;
  muted: boolean;
  selectedCategory: string;
  query: string;
  searchOpen: boolean;
  catalogLoading: boolean;
  catalogError: string | null;
  refreshCatalog: () => void;
  toggleFavorite: (channelId: string) => void;
  openPlayer: (channelId: string) => void;
  minimizePlayer: () => void;
  expandPlayer: () => void;
  closePlayer: () => void;
  togglePlayback: () => void;
  toggleMuted: () => void;
  setSelectedCategory: (category: string) => void;
  setQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
};

const MjtvContext = createContext<MjtvContextValue | null>(null);

export function MjtvProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<string[]>(["france-24", "arte"]);
  const [history, setHistory] = useState<string[]>(["france-24", "tv5monde", "euronews"]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<PlayerMode>("closed");
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const catalogQuery = trpc.mjtv.catalog.useQuery({ limit: 40, sort: "quality" }, { staleTime: 300_000, refetchOnMount: false });
  const channelQuery = trpc.mjtv.channel.useQuery(
    { id: activeChannelId ?? "none" },
    { enabled: Boolean(activeChannelId && playerMode !== "closed"), staleTime: 300_000 },
  );

  useEffect(() => {
    void (async () => {
      const [storedFavorites, storedHistory] = await Promise.all([
        AsyncStorage.getItem("mjtv.favorites"),
        AsyncStorage.getItem("mjtv.history"),
      ]);
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites) as string[]);
      if (storedHistory) setHistory(JSON.parse(storedHistory) as string[]);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem("mjtv.favorites", JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem("mjtv.history", JSON.stringify(history));
  }, [history, hydrated]);

  const channels = useMemo(() => {
    const remote = catalogQuery.data as RemoteCatalogResponse | undefined;
    if (!remote?.items?.length) return MJTV_CHANNELS;
    const mapped = mapRemoteCatalog(remote);
    const remoteIds = new Set(mapped.map((channel) => channel.id));
    const curatedFallback = MJTV_CHANNELS.filter((channel) => !remoteIds.has(channel.id));
    return [...mapped, ...curatedFallback];
  }, [catalogQuery.data]);

  const activeChannel = useMemo(() => {
    const detail = channelQuery.data as RemoteChannel | undefined;
    return detail?.id ? mapRemoteChannel(detail) : channels.find((channel) => channel.id === activeChannelId) ?? channelById(activeChannelId);
  }, [activeChannelId, channelQuery.data, channels]);

  const value = useMemo<MjtvContextValue>(
    () => ({
      channels,
      favorites,
      history,
      activeChannel,
      playerMode,
      isPlaying,
      muted,
      selectedCategory,
      query,
      searchOpen,
      catalogLoading: catalogQuery.isLoading,
      catalogError: catalogQuery.error?.message ?? null,
      refreshCatalog: () => { void catalogQuery.refetch(); },
      toggleFavorite: (channelId) => setFavorites((current) => toggleChannelId(current, channelId)),
      openPlayer: (channelId) => {
        setActiveChannelId(channelId);
        setHistory((current) => addRecentChannel(current, channelId));
        setPlayerMode("expanded");
        setIsPlaying(true);
      },
      minimizePlayer: () => setPlayerMode("mini"),
      expandPlayer: () => setPlayerMode("expanded"),
      closePlayer: () => {
        setIsPlaying(false);
        setPlayerMode("closed");
        setActiveChannelId(null);
      },
      togglePlayback: () => setIsPlaying((current) => !current),
      toggleMuted: () => setMuted((current) => !current),
      setSelectedCategory,
      setQuery,
      setSearchOpen,
    }),
    [activeChannel, catalogQuery.error?.message, catalogQuery.isLoading, favorites, history, isPlaying, muted, playerMode, query, searchOpen, selectedCategory, channels],
  );

  return <MjtvContext.Provider value={value}>{children}</MjtvContext.Provider>;
}

export function useMjtv() {
  const context = useContext(MjtvContext);
  if (!context) throw new Error("useMjtv must be used inside MjtvProvider");
  return context;
}
