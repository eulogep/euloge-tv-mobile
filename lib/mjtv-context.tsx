import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { MJTV_CHANNELS, channelById, type MjtvChannel } from "@/lib/mjtv-data";
import { addRecentChannel, toggleChannelId } from "@/lib/mjtv-state";

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

  const value = useMemo<MjtvContextValue>(
    () => ({
      channels: MJTV_CHANNELS,
      favorites,
      history,
      activeChannel: channelById(activeChannelId),
      playerMode,
      isPlaying,
      muted,
      selectedCategory,
      query,
      searchOpen,
      toggleFavorite: (channelId) => {
        setFavorites((current) => toggleChannelId(current, channelId));
      },
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
    [activeChannelId, favorites, history, isPlaying, muted, playerMode, query, searchOpen, selectedCategory],
  );

  return <MjtvContext.Provider value={value}>{children}</MjtvContext.Provider>;
}

export function useMjtv() {
  const context = useContext(MjtvContext);
  if (!context) throw new Error("useMjtv must be used inside MjtvProvider");
  return context;
}
