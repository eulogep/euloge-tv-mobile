import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MjtvHeader } from "@/components/mjtv/primitives";
import { haptic } from "@/lib/haptics";
import { ScreenContainer } from "@/components/screen-container";

const items: { icon: "language" | "tune" | "download"; title: string; detail: string }[] = [
  { icon: "language", title: "Langue", detail: "Français" },
  { icon: "tune", title: "Réglages de lecture", detail: "Qualité, sous-titres et données" },
  { icon: "download", title: "Bibliothèque", detail: "Listes importées" },
];

export default function ProfileScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MjtvHeader title="Profil" />
        <View style={styles.hero}><View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View><View><Text style={styles.heroTitle}>Mon espace MJTV</Text><Text style={styles.heroText}>Préférences et lecture</Text></View></View>
        <Text style={styles.eyebrow}>PRÉFÉRENCES</Text>
        <View style={styles.list}>{items.map((item) => <ProfileRow key={item.title} {...item} />)}</View>
        <Text style={styles.eyebrow}>À PROPOS</Text>
        <View style={styles.about}><Text style={styles.aboutTitle}>MJTV</Text><Text style={styles.aboutText}>Plateforme de consultation de chaînes IPTV publiques.</Text><Text style={styles.version}>Version mobile 1.0.0</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ProfileRow({ icon, title, detail }: { icon: "language" | "tune" | "download"; title: string; detail: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={haptic.light} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={styles.rowIcon}><MaterialIcons name={icon} size={21} color="#A27BFF" /></View><View style={styles.rowText}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDetail}>{detail}</Text></View><MaterialIcons name="chevron-right" size={22} color="#747386" /></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070711" },
  content: { paddingBottom: 42 },
  hero: { marginHorizontal: 20, marginTop: 6, marginBottom: 28, padding: 18, flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 20, borderWidth: 1, borderColor: "rgba(162,123,255,0.28)", backgroundColor: "#171728" },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: "#7A5CFF" },
  avatarText: { color: "#070711", fontSize: 23, fontWeight: "900" },
  heroTitle: { color: "#F5F7FF", fontSize: 17, fontWeight: "800" },
  heroText: { color: "#A9ADC2", marginTop: 4, fontSize: 12 },
  eyebrow: { color: "#A27BFF", marginHorizontal: 20, marginBottom: 9, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  list: { marginHorizontal: 20, marginBottom: 26, overflow: "hidden", borderRadius: 18, borderWidth: 1, borderColor: "rgba(162,123,255,0.2)", backgroundColor: "#171728" },
  row: { minHeight: 70, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "rgba(162,123,255,0.12)" },
  rowIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(122,92,255,0.16)" },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { color: "#F5F7FF", fontSize: 14, fontWeight: "800" },
  rowDetail: { color: "#A9ADC2", marginTop: 3, fontSize: 11 },
  about: { marginHorizontal: 20, padding: 17, borderRadius: 18, backgroundColor: "#111324" },
  aboutTitle: { color: "#F5F7FF", fontSize: 16, fontWeight: "800" },
  aboutText: { color: "#A9ADC2", marginTop: 6, fontSize: 12, lineHeight: 18 },
  version: { color: "#747386", marginTop: 13, fontSize: 11 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
