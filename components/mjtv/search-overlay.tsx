import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo } from "react";
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import { ChannelCard } from "@/components/mjtv/primitives";
import { useMjtv } from "@/lib/mjtv-context";
import { filterChannels } from "@/lib/mjtv-state";

export function MjtvSearchOverlay() {
  const { channels, query, searchOpen, setQuery, setSearchOpen } = useMjtv();
  const results = useMemo(() => {
    const matchingChannels = filterChannels(channels, "Tout", query);
    return query.trim() ? matchingChannels : matchingChannels.slice(0, 4);
  }, [channels, query]);

  return (
    <Modal visible={searchOpen} animationType="fade" onRequestClose={() => setSearchOpen(false)}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer la recherche" onPress={() => setSearchOpen(false)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
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
            <Pressable accessibilityRole="button" accessibilityLabel="Effacer la recherche" onPress={() => setQuery("")} style={styles.clearButton}>
              <MaterialIcons name="close" size={18} color="#A9ADC2" />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.recentRow}>
          <Text style={styles.eyebrow}>{query ? `${results.length} RÉSULTAT${results.length > 1 ? "S" : ""}` : "RECHERCHES POPULAIRES"}</Text>
          {!query ? <Text style={styles.hint}>Actualités · Culture · Europe</Text> : null}
        </View>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChannelCard channel={item} variant="list" />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="search-off" size={34} color="#747386" /><Text style={styles.emptyTitle}>Aucune chaîne trouvée</Text><Text style={styles.emptyText}>Essayez un autre mot-clé, un pays ou une catégorie.</Text></View>}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070711" },
  header: { height: 62, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#171728" },
  title: { color: "#F5F7FF", fontSize: 18, fontWeight: "800" },
  spacer: { width: 44 },
  inputShell: { minHeight: 54, marginHorizontal: 20, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", borderRadius: 17, borderWidth: 1, borderColor: "rgba(162,123,255,0.36)", backgroundColor: "#171728" },
  input: { flex: 1, minWidth: 0, color: "#F5F7FF", fontSize: 15, paddingVertical: 14, paddingHorizontal: 10 },
  clearButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  recentRow: { paddingHorizontal: 20, paddingTop: 23, paddingBottom: 10 },
  eyebrow: { color: "#A27BFF", fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  hint: { color: "#A9ADC2", marginTop: 6, fontSize: 12 },
  list: { paddingTop: 6, paddingBottom: 30 },
  empty: { alignItems: "center", paddingHorizontal: 42, paddingTop: 78 },
  emptyTitle: { color: "#F5F7FF", marginTop: 14, fontSize: 17, fontWeight: "800" },
  emptyText: { color: "#A9ADC2", marginTop: 7, textAlign: "center", fontSize: 13, lineHeight: 20 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
});
