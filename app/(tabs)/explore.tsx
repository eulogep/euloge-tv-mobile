import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChannelCard, MjtvHeader } from "@/components/mjtv/primitives";
import { MJTV_CATEGORIES } from "@/lib/mjtv-data";
import { useMjtv } from "@/lib/mjtv-context";
import { haptic } from "@/lib/haptics";
import { filterChannels } from "@/lib/mjtv-state";
import { ScreenContainer } from "@/components/screen-container";

export default function ExploreScreen() {
  const { channels, selectedCategory, setSelectedCategory, setSearchOpen } = useMjtv();
  const filtered = filterChannels(channels, selectedCategory, "");
  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChannelCard channel={item} variant="list" />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<>
          <MjtvHeader title="Explorer" />
          <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir la recherche" onPress={() => { haptic.light(); setSearchOpen(true); }} style={({ pressed }) => [styles.searchPrompt, pressed && styles.pressed]}>
            <MaterialIcons name="search" size={20} color="#A27BFF" /><Text style={styles.searchCopy}>Rechercher une chaîne, un pays…</Text>
          </Pressable>
          <Text style={styles.sectionTitle}>Explorer par catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {MJTV_CATEGORIES.map((category) => {
              const active = category === selectedCategory;
              return <Pressable key={category} accessibilityRole="button" accessibilityLabel={`Filtrer par ${category}`} accessibilityState={{ selected: active }} onPress={() => { haptic.selection(); setSelectedCategory(category); }} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{category}</Text></Pressable>;
            })}
          </ScrollView>
          <View style={styles.resultsRow}><Text style={styles.eyebrow}>RÉSULTATS</Text><Text style={styles.count}>{filtered.length} chaîne{filtered.length > 1 ? "s" : ""}</Text></View>
        </>}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070711" },
  list: { paddingBottom: 32 },
  searchPrompt: { minHeight: 54, marginHorizontal: 20, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(162,123,255,0.32)", borderRadius: 17, backgroundColor: "#171728" },
  searchCopy: { color: "#A9ADC2", fontSize: 13, fontWeight: "600" },
  sectionTitle: { color: "#F5F7FF", marginHorizontal: 20, marginTop: 24, fontSize: 17, fontWeight: "800" },
  chips: { gap: 8, paddingHorizontal: 20, paddingTop: 13, paddingBottom: 17 },
  chip: { minHeight: 42, justifyContent: "center", paddingHorizontal: 15, borderRadius: 21, borderWidth: 1, borderColor: "rgba(162,123,255,0.22)", backgroundColor: "#171728" },
  chipActive: { borderColor: "#A27BFF", backgroundColor: "rgba(122,92,255,0.22)" },
  chipText: { color: "#A9ADC2", fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: "#F5F7FF" },
  resultsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 11 },
  eyebrow: { color: "#A27BFF", fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  count: { color: "#A9ADC2", fontSize: 12 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
