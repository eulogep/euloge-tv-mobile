import { FlatList, StyleSheet, Text, View } from "react-native";

import { ChannelCard, MjtvHeader } from "@/components/mjtv/primitives";
import { useMjtv } from "@/lib/mjtv-context";
import { ScreenContainer } from "@/components/screen-container";

export default function LiveScreen() {
  const { channels } = useMjtv();
  const available = channels.filter((channel) => channel.status !== "offline");
  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChannelCard channel={item} variant="list" />}
        ListHeaderComponent={<><MjtvHeader title="Live" /><View style={styles.summary}><View style={styles.liveDot} /><View><Text style={styles.summaryTitle}>{available.length} chaîne{available.length > 1 ? "s" : ""} en direct</Text><Text style={styles.summaryText}>États et disponibilités mis à jour à l’ouverture.</Text></View></View></>}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070711" },
  list: { paddingBottom: 32 },
  summary: { marginHorizontal: 20, marginBottom: 19, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(255,64,95,0.28)", borderRadius: 18, backgroundColor: "rgba(255,64,95,0.07)" },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF405F" },
  summaryTitle: { color: "#F5F7FF", fontSize: 16, fontWeight: "800" },
  summaryText: { color: "#A9ADC2", marginTop: 4, fontSize: 11 },
});
