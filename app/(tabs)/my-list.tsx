import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ChannelCard, MjtvHeader } from "@/components/mjtv/primitives";
import { haptic } from "@/lib/haptics";
import { useMjtv } from "@/lib/mjtv-context";

export default function MyListScreen() {
  const { savedChannels, favorites, history, savedLoading, savedError } =
    useMjtv();
  const [tab, setTab] = useState<"favorites" | "history">("favorites");
  const ids = tab === "favorites" ? favorites : history;
  const items = ids
    .map((id) => savedChannels.find((channel) => channel.id === id))
    .filter(Boolean);

  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item!.id}
        renderItem={({ item }) => (
          <ChannelCard channel={item!} variant="list" />
        )}
        ListHeaderComponent={
          <>
            <MjtvHeader title="Ma liste" />
            <View style={styles.segment}>
              <Tab
                label="Favoris"
                active={tab === "favorites"}
                onPress={() => {
                  haptic.selection();
                  setTab("favorites");
                }}
              />
              <Tab
                label="Historique"
                active={tab === "history"}
                onPress={() => {
                  haptic.selection();
                  setTab("history");
                }}
              />
            </View>
            <Text style={styles.description}>
              {tab === "favorites"
                ? "Vos chaînes enregistrées."
                : "Vos dernières chaînes regardées."}
            </Text>
          </>
        }
        ListEmptyComponent={
          savedLoading ? (
            <ActivityIndicator color="#A27BFF" style={styles.loading} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {savedError
                  ? "Liste temporairement indisponible"
                  : tab === "favorites"
                    ? "Aucun favori"
                    : "Aucun historique"}
              </Text>
              <Text style={styles.emptyText}>
                {savedError
                  ? "Les identifiants sont conservés localement. Réessayez lorsque le service MJTV sera disponible."
                  : "Ajoutez une chaîne depuis une carte pour la retrouver ici."}
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        active && styles.tabActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070711" },
  list: { paddingBottom: 32 },
  segment: {
    minHeight: 48,
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#111324",
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "#2B244A" },
  tabText: { color: "#A9ADC2", fontSize: 13, fontWeight: "800" },
  tabTextActive: { color: "#F5F7FF" },
  description: {
    color: "#A9ADC2",
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 16,
    fontSize: 12,
  },
  loading: { marginTop: 54 },
  empty: { paddingHorizontal: 36, paddingTop: 60, alignItems: "center" },
  emptyTitle: { color: "#F5F7FF", fontSize: 17, fontWeight: "800" },
  emptyText: {
    color: "#A9ADC2",
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
