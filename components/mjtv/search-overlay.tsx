import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ChannelCard } from "@/components/mjtv/primitives";
import { useMjtv } from "@/lib/mjtv-context";

export function MjtvSearchOverlay() {
  const {
    query,
    searchOpen,
    searchChannels,
    searchTotal,
    searchLoading,
    searchLoadingMore,
    searchError,
    setQuery,
    setSearchOpen,
    loadMoreSearch,
    refreshCatalog,
  } = useMjtv();
  const searching = Boolean(query.trim());

  return (
    <Modal
      visible={searchOpen}
      animationType="fade"
      onRequestClose={() => setSearchOpen(false)}
    >
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer la recherche"
            onPress={() => setSearchOpen(false)}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="arrow-back" size={22} color="#F5F7FF" />
          </Pressable>
          <Text style={styles.title}>Recherche</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.inputShell}>
          <MaterialIcons name="search" size={20} color="#A27BFF" />
          <TextInput
            autoFocus
            accessibilityLabel="Rechercher une chaîne, un pays ou une catégorie"
            placeholder="Chaîne, pays, catégorie…"
            placeholderTextColor="#747386"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            style={styles.input}
          />
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
              onPress={() => setQuery("")}
              style={styles.clearButton}
            >
              <MaterialIcons name="close" size={18} color="#A9ADC2" />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.recentRow}>
          <Text style={styles.eyebrow}>
            {searching
              ? `${searchTotal} RÉSULTAT${searchTotal > 1 ? "S" : ""}`
              : "CHAÎNES POPULAIRES"}
          </Text>
          {!searching ? (
            <Text style={styles.hint}>
              Saisissez un terme pour rechercher tout le catalogue.
            </Text>
          ) : null}
        </View>
        <FlatList
          data={searchChannels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChannelCard channel={item} variant="list" />
          )}
          contentContainerStyle={styles.list}
          onEndReached={searching ? loadMoreSearch : undefined}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            searchLoading ? (
              <ActivityIndicator color="#A27BFF" style={styles.loading} />
            ) : (
              <View style={styles.empty}>
                <MaterialIcons
                  name={searchError ? "cloud-off" : "search-off"}
                  size={34}
                  color="#747386"
                />
                <Text style={styles.emptyTitle}>
                  {searchError
                    ? "Recherche indisponible"
                    : "Aucune chaîne trouvée"}
                </Text>
                <Text style={styles.emptyText}>
                  {searchError
                    ? "Le service MJTV ne répond pas actuellement."
                    : "Essayez un autre mot-clé, un pays ou une catégorie."}
                </Text>
                {searchError ? (
                  <Pressable onPress={refreshCatalog} style={styles.retry}>
                    <Text style={styles.retryText}>Réessayer</Text>
                  </Pressable>
                ) : null}
              </View>
            )
          }
          ListFooterComponent={
            searchLoadingMore ? (
              <ActivityIndicator color="#A27BFF" style={styles.loading} />
            ) : null
          }
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070711" },
  header: {
    height: 62,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171728",
  },
  title: { color: "#F5F7FF", fontSize: 18, fontWeight: "800" },
  spacer: { width: 44 },
  inputShell: {
    minHeight: 54,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.36)",
    backgroundColor: "#171728",
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: "#F5F7FF",
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  clearButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  recentRow: { paddingHorizontal: 20, paddingTop: 23, paddingBottom: 10 },
  eyebrow: {
    color: "#A27BFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  hint: { color: "#A9ADC2", marginTop: 6, fontSize: 12 },
  list: { paddingTop: 6, paddingBottom: 30 },
  loading: { marginVertical: 24 },
  empty: { alignItems: "center", paddingHorizontal: 42, paddingTop: 62 },
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
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
});
