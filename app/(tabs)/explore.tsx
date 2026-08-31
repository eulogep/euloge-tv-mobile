import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import {
  ChannelCard,
  LoadingSkeleton,
  MjtvHeader,
} from "@/components/mjtv/primitives";
import { haptic } from "@/lib/haptics";
import { useMjtv } from "@/lib/mjtv-context";

export default function ExploreScreen() {
  const {
    exploreChannels,
    exploreTotal,
    categoryOptions,
    selectedCategory,
    setSelectedCategory,
    setSearchOpen,
    exploreLoading,
    exploreLoadingMore,
    exploreError,
    loadMoreExplore,
    refreshCatalog,
  } = useMjtv();
  const categories = [
    { value: "", label: "Tout", count: exploreTotal },
    ...categoryOptions,
  ];

  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={exploreChannels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChannelCard channel={item} variant="list" />}
        contentContainerStyle={styles.list}
        onEndReached={loadMoreExplore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <>
            <MjtvHeader title="Explorer" />
            {exploreLoading && <LoadingSkeleton rows={2} />}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ouvrir la recherche"
              onPress={() => {
                haptic.light();
                setSearchOpen(true);
              }}
              style={({ pressed }) => [
                styles.searchPrompt,
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons name="search" size={20} color="#A27BFF" />
              <Text style={styles.searchCopy}>
                Rechercher dans tout le catalogue…
              </Text>
            </Pressable>
            <Text style={styles.sectionTitle}>Explorer par catégorie</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categories.map((category) => {
                const active = category.value === selectedCategory;
                return (
                  <Pressable
                    key={category.value || "all"}
                    accessibilityRole="button"
                    accessibilityLabel={`Filtrer par ${category.label}`}
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      haptic.selection();
                      setSelectedCategory(category.value);
                    }}
                    style={({ pressed }) => [
                      styles.chip,
                      active && styles.chipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.resultsRow}>
              <Text style={styles.eyebrow}>RÉSULTATS</Text>
              <Text style={styles.count}>
                {exploreTotal} chaîne{exploreTotal > 1 ? "s" : ""}
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          !exploreLoading ? (
            <View style={styles.empty}>
              <MaterialIcons
                name={exploreError ? "cloud-off" : "tv-off"}
                size={34}
                color="#747386"
              />
              <Text style={styles.emptyTitle}>
                {exploreError ? "Catalogue indisponible" : "Aucune chaîne"}
              </Text>
              <Text style={styles.emptyText}>
                {exploreError
                  ? "Vérifiez votre connexion puis réessayez."
                  : "Aucune chaîne ne correspond à ce filtre."}
              </Text>
              {exploreError ? (
                <Pressable onPress={refreshCatalog} style={styles.retry}>
                  <Text style={styles.retryText}>Réessayer</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
        ListFooterComponent={
          exploreLoadingMore ? (
            <ActivityIndicator color="#A27BFF" style={styles.footer} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070711" },
  list: { paddingBottom: 32 },
  searchPrompt: {
    minHeight: 54,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.32)",
    borderRadius: 17,
    backgroundColor: "#171728",
  },
  searchCopy: { color: "#A9ADC2", fontSize: 13, fontWeight: "600" },
  sectionTitle: {
    color: "#F5F7FF",
    marginHorizontal: 20,
    marginTop: 24,
    fontSize: 17,
    fontWeight: "800",
  },
  chips: { gap: 8, paddingHorizontal: 20, paddingTop: 13, paddingBottom: 17 },
  chip: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.22)",
    backgroundColor: "#171728",
  },
  chipActive: {
    borderColor: "#A27BFF",
    backgroundColor: "rgba(122,92,255,0.22)",
  },
  chipText: { color: "#A9ADC2", fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: "#F5F7FF" },
  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 11,
  },
  eyebrow: {
    color: "#A27BFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  count: { color: "#A9ADC2", fontSize: 12 },
  empty: { alignItems: "center", paddingHorizontal: 42, paddingTop: 54 },
  emptyTitle: {
    color: "#F5F7FF",
    marginTop: 14,
    fontSize: 17,
    fontWeight: "800",
  },
  emptyText: {
    color: "#A9ADC2",
    marginTop: 7,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
  },
  retry: {
    minHeight: 44,
    marginTop: 16,
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: "#A27BFF",
  },
  retryText: { color: "#070711", fontSize: 12, fontWeight: "900" },
  footer: { marginVertical: 18 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
