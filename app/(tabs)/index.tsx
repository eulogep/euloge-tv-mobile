import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChannelArtwork, ChannelCard, LoadingSkeleton, MjtvHeader, SectionHeading, StatusBadge } from "@/components/mjtv/primitives";
import { useMjtv } from "@/lib/mjtv-context";
import { haptic } from "@/lib/haptics";
import { ScreenContainer } from "@/components/screen-container";

const railSections = [
  { title: "Pour vous", detail: "Une sélection selon vos envies", ids: ["arte", "france-24", "museum-tv", "tv5monde"] },
  { title: "En direct maintenant", detail: "Les chaînes disponibles à regarder", ids: ["euronews", "lcp", "rfi", "france-2"] },
];

export default function HomeScreen() {
  const { channels, favorites, openPlayer, toggleFavorite, catalogLoading, catalogError, refreshCatalog } = useMjtv();
  const featured = channels[0];
  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={railSections}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <SectionHeading title={item.title} detail={item.detail} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {item.ids.map((id) => {
                const channel = channels.find((entry) => entry.id === id);
                return channel ? <ChannelCard key={channel.id} channel={channel} /> : null;
              })}
            </ScrollView>
          </View>
        )}
        ListHeaderComponent={
          <>
            <MjtvHeader />
            {catalogLoading && <LoadingSkeleton rows={2} />}
            {catalogError && <Pressable onPress={refreshCatalog} style={styles.networkNotice}><MaterialIcons name="sync" size={17} color="#F6C85F" /><Text style={styles.networkNoticeText}>Catalogue indisponible · toucher pour réessayer</Text></Pressable>}
            <View style={styles.heroHalo} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Regarder ${featured.name}`}
              onPress={() => { haptic.light(); openPlayer(featured.id); }}
              style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
            >
              <View style={styles.heroArtwork}><ChannelArtwork channel={featured} /></View>
              <View style={styles.heroContent}>
                <View style={styles.heroBadgeRow}><StatusBadge status={featured.status} /><Text style={styles.heroFlag}>FR</Text></View>
                <Text style={styles.heroEyebrow}>À LA UNE</Text>
                <Text numberOfLines={1} style={styles.heroTitle}>{featured.name}</Text>
                <Text numberOfLines={1} style={styles.heroProgram}>{featured.currentProgram}</Text>
                <View style={styles.heroActions}>
                  <View style={styles.watchButton}><MaterialIcons name="play-arrow" size={18} color="#070711" /><Text style={styles.watchText}>Regarder</Text></View>
                  <Pressable accessibilityRole="button" accessibilityLabel="Ajouter la chaîne à Ma liste" onPress={(event) => { event.stopPropagation(); haptic.selection(); toggleFavorite(featured.id); }} style={({ pressed }) => [styles.heroFavorite, pressed && styles.pressed]}>
                    <MaterialIcons name={favorites.includes(featured.id) ? "star" : "star-border"} size={20} color="#F5F7FF" />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </>
        }
        ListFooterComponent={<View style={styles.footer}><Text style={styles.footerText}>MJTV référence des sources publiques. Disponibilité non garantie.</Text></View>}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070711" },
  list: { paddingBottom: 38 },
  heroHalo: { position: "absolute", width: 290, height: 290, borderRadius: 150, top: 6, right: -100, backgroundColor: "#7A5CFF", opacity: 0.14 },
  hero: { marginHorizontal: 20, marginTop: 2, minHeight: 234, padding: 16, overflow: "hidden", borderRadius: 24, borderWidth: 1, borderColor: "rgba(162,123,255,0.42)", backgroundColor: "#171728", justifyContent: "flex-end" },
  heroArtwork: { position: "absolute", top: 0, right: 0, left: 0, height: 126, opacity: 0.98 },
  heroContent: { marginTop: 102 },
  heroBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroFlag: { color: "#A9ADC2", fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  heroEyebrow: { color: "#A27BFF", marginTop: 11, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  heroTitle: { color: "#F5F7FF", marginTop: 5, fontSize: 28, lineHeight: 32, fontWeight: "900", letterSpacing: -0.8 },
  heroProgram: { color: "#DDE0F0", marginTop: 4, fontSize: 13, fontWeight: "600" },
  heroActions: { marginTop: 15, flexDirection: "row", alignItems: "center", gap: 10 },
  watchButton: { minHeight: 44, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 22, backgroundColor: "#A27BFF" },
  watchText: { color: "#070711", fontSize: 13, fontWeight: "900" },
  heroFavorite: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  section: { marginTop: 25 },
  rail: { paddingLeft: 20, paddingRight: 8, paddingTop: 8 },
  footer: { paddingHorizontal: 20, paddingTop: 28 },
  footerText: { color: "#747386", fontSize: 11, lineHeight: 17, textAlign: "center" },
  networkNotice: { marginHorizontal: 20, marginBottom: 10, minHeight: 42, paddingHorizontal: 12, borderRadius: 13, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(246,200,95,0.1)", borderWidth: 1, borderColor: "rgba(246,200,95,0.26)" },
  networkNoticeText: { color: "#F6C85F", fontSize: 11, fontWeight: "700" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
