import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { mapRemoteChannel, type RemoteFilterOption } from "@/lib/mjtv-api";
import type { MjtvChannel } from "@/lib/mjtv-data";
import { addRecentChannel, toggleChannelId } from "@/lib/mjtv-state";
import { trpc } from "@/lib/trpc";

export type PlayerMode = "closed" | "expanded" | "mini";

type MjtvContextValue = {
  channels: MjtvChannel[];
  exploreChannels: MjtvChannel[];
  searchChannels: MjtvChannel[];
  savedChannels: MjtvChannel[];
  categoryOptions: RemoteFilterOption[];
  catalogTotal: number;
  exploreTotal: number;
  searchTotal: number;
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
  catalogLoadingMore: boolean;
  catalogError: string | null;
  exploreLoading: boolean;
  exploreLoadingMore: boolean;
  exploreError: string | null;
  searchLoading: boolean;
  searchLoadingMore: boolean;
  searchError: string | null;
  savedLoading: boolean;
  savedError: string | null;
  channelLoading: boolean;
  channelError: string | null;
  refreshCatalog: () => void;
  loadMoreCatalog: () => void;
  loadMoreExplore: () => void;
  loadMoreSearch: () => void;
  retryChannel: () => void;
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
const PAGE_SIZE = 40;

function uniqueChannels(
  pages: { items: Parameters<typeof mapRemoteChannel>[0][] }[] = [],
) {
  const byId = new Map<string, MjtvChannel>();
  for (const page of pages) {
    for (const channel of page.items)
      byId.set(channel.id, mapRemoteChannel(channel));
  }
  return [...byId.values()];
}

function storedIds(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function MjtvProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<PlayerMode>("closed");
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const deferredQuery = useDeferredValue(query.trim());

  const catalogQuery = trpc.mjtv.catalog.useInfiniteQuery(
    { limit: PAGE_SIZE, sort: "quality" },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      retry: false,
      staleTime: 300_000,
      refetchOnMount: false,
    },
  );
  const categoryQuery = trpc.mjtv.catalog.useInfiniteQuery(
    {
      limit: PAGE_SIZE,
      sort: "quality",
      category: selectedCategory || undefined,
    },
    {
      enabled: Boolean(selectedCategory),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      retry: false,
      staleTime: 300_000,
    },
  );
  const searchQuery = trpc.mjtv.catalog.useInfiniteQuery(
    { limit: PAGE_SIZE, sort: "quality", q: deferredQuery || undefined },
    {
      enabled: searchOpen && Boolean(deferredQuery),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      retry: false,
      staleTime: 120_000,
    },
  );

  const channelQuery = trpc.mjtv.channel.useQuery(
    { id: activeChannelId ?? "none" },
    {
      enabled: Boolean(activeChannelId && playerMode !== "closed"),
      retry: 1,
      staleTime: 300_000,
    },
  );
  const savedIds = useMemo(
    () => [...new Set([...favorites, ...history])].slice(0, 50),
    [favorites, history],
  );
  const savedQuery = trpc.mjtv.channels.useQuery(
    { ids: savedIds },
    { enabled: hydrated && savedIds.length > 0, retry: 1, staleTime: 300_000 },
  );

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      AsyncStorage.getItem("mjtv.favorites"),
      AsyncStorage.getItem("mjtv.history"),
    ])
      .then(([storedFavorites, storedHistory]) => {
        if (!mounted) return;
        setFavorites(storedIds(storedFavorites));
        setHistory(storedIds(storedHistory));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated)
      void AsyncStorage.setItem("mjtv.favorites", JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    if (hydrated)
      void AsyncStorage.setItem("mjtv.history", JSON.stringify(history));
  }, [history, hydrated]);

  const channels = useMemo(
    () => uniqueChannels(catalogQuery.data?.pages),
    [catalogQuery.data],
  );
  const categoryChannels = useMemo(
    () => uniqueChannels(categoryQuery.data?.pages),
    [categoryQuery.data],
  );
  const searchResults = useMemo(
    () => uniqueChannels(searchQuery.data?.pages),
    [searchQuery.data],
  );
  const savedChannels = useMemo(
    () => (savedQuery.data ?? []).map((channel) => mapRemoteChannel(channel)),
    [savedQuery.data],
  );
  const exploreChannels = selectedCategory ? categoryChannels : channels;
  const searchChannels = deferredQuery ? searchResults : channels.slice(0, 4);
  const knownChannels = useMemo(() => {
    const byId = new Map<string, MjtvChannel>();
    for (const channel of [
      ...channels,
      ...categoryChannels,
      ...searchResults,
      ...savedChannels,
    ]) {
      byId.set(channel.id, channel);
    }
    return byId;
  }, [categoryChannels, channels, savedChannels, searchResults]);
  const activeChannel = channelQuery.data
    ? mapRemoteChannel(channelQuery.data)
    : activeChannelId
      ? (knownChannels.get(activeChannelId) ?? null)
      : null;
  const firstPage = catalogQuery.data?.pages[0];
  const categoryFirstPage = categoryQuery.data?.pages[0];
  const searchFirstPage = searchQuery.data?.pages[0];

  const value = useMemo<MjtvContextValue>(
    () => ({
      channels,
      exploreChannels,
      searchChannels,
      savedChannels,
      categoryOptions: firstPage?.filters?.categories ?? [],
      catalogTotal: firstPage?.total ?? 0,
      exploreTotal: selectedCategory
        ? (categoryFirstPage?.total ?? 0)
        : (firstPage?.total ?? 0),
      searchTotal: deferredQuery
        ? (searchFirstPage?.total ?? 0)
        : searchChannels.length,
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
      catalogLoadingMore: catalogQuery.isFetchingNextPage,
      catalogError: catalogQuery.error?.message ?? null,
      exploreLoading: selectedCategory
        ? categoryQuery.isLoading
        : catalogQuery.isLoading,
      exploreLoadingMore: selectedCategory
        ? categoryQuery.isFetchingNextPage
        : catalogQuery.isFetchingNextPage,
      exploreError: selectedCategory
        ? (categoryQuery.error?.message ?? null)
        : (catalogQuery.error?.message ?? null),
      searchLoading: Boolean(deferredQuery) && searchQuery.isLoading,
      searchLoadingMore: searchQuery.isFetchingNextPage,
      searchError: searchQuery.error?.message ?? null,
      savedLoading: savedQuery.isLoading,
      savedError: savedQuery.error?.message ?? null,
      channelLoading: channelQuery.isLoading,
      channelError: channelQuery.error?.message ?? null,
      refreshCatalog: () => {
        void catalogQuery.refetch();
        if (selectedCategory) void categoryQuery.refetch();
        if (deferredQuery) void searchQuery.refetch();
      },
      loadMoreCatalog: () => {
        if (catalogQuery.hasNextPage && !catalogQuery.isFetchingNextPage)
          void catalogQuery.fetchNextPage();
      },
      loadMoreExplore: () => {
        const target = selectedCategory ? categoryQuery : catalogQuery;
        if (target.hasNextPage && !target.isFetchingNextPage)
          void target.fetchNextPage();
      },
      loadMoreSearch: () => {
        if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage)
          void searchQuery.fetchNextPage();
      },
      retryChannel: () => {
        void channelQuery.refetch();
      },
      toggleFavorite: (channelId) =>
        setFavorites((current) => toggleChannelId(current, channelId)),
      openPlayer: (channelId) => {
        const channel = knownChannels.get(channelId);
        if (channel && !channel.canOpen) return;
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
    [
      activeChannel,
      catalogQuery,
      categoryFirstPage?.total,
      categoryQuery,
      channelQuery,
      channels,
      deferredQuery,
      exploreChannels,
      favorites,
      firstPage?.filters?.categories,
      firstPage?.total,
      history,
      isPlaying,
      knownChannels,
      muted,
      playerMode,
      query,
      savedChannels,
      searchChannels,
      searchFirstPage?.total,
      searchOpen,
      searchQuery,
      savedQuery.error?.message,
      savedQuery.isLoading,
      selectedCategory,
    ],
  );

  return <MjtvContext.Provider value={value}>{children}</MjtvContext.Provider>;
}

export function useMjtv() {
  const context = useContext(MjtvContext);
  if (!context) throw new Error("useMjtv must be used inside MjtvProvider");
  return context;
}
