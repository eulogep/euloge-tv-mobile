import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
import { useMjtv } from "@/lib/mjtv-context";

export default function LiveScreen() {
  const {
    channels,
    catalogTotal,
    catalogLoading,
    catalogLoadingMore,
    catalogError,
    loadMoreCatalog,
    refreshCatalog,
  } = useMjtv();
  const available = channels.filter(
    (channel) =>
      channel.canOpen && ["live", "degraded"].includes(channel.status),
  );

  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChannelCard channel={item} variant="list" />}
        onEndReached={loadMoreCatalog}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <>
            <MjtvHeader title="Live" />
            {catalogLoading && <LoadingSkeleton rows={2} />}
            {!catalogError ? (
              <View style={styles.summary}>
                <View style={styles.liveDot} />
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryTitle}>
                    {available.length} chaîne{available.length > 1 ? "s" : ""}{" "}
                    confirmée{available.length > 1 ? "s" : ""} dans les pages
                    chargées
                  </Text>
                  <Text style={styles.summaryText}>
                    {catalogTotal} chaînes référencées au total · chargez
                    progressivement en faisant défiler.
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !catalogLoading ? (
            <View style={styles.empty}>
              <MaterialIcons
                name={catalogError ? "cloud-off" : "tv-off"}
                size={34}
                color="#747386"
              />
              <Text style={styles.emptyTitle}>
                {catalogError ? "Service MJTV indisponible" : "Aucune chaîne"}
              </Text>
              <Text style={styles.emptyText}>
                {catalogError
                  ? "Une panne réseau ne signifie pas que le catalogue est vide."
                  : "Aucune chaîne n’est actuellement référencée."}
              </Text>
              {catalogError ? (
                <Pressable onPress={refreshCatalog} style={styles.retry}>
                  <Text style={styles.retryText}>Réessayer</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
        ListFooterComponent={
          catalogLoadingMore ? (
            <ActivityIndicator color="#A27BFF" style={styles.footer} />
          ) : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070711" },
  list: { paddingBottom: 32 },
  summary: {
    marginHorizontal: 20,
    marginBottom: 19,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,64,95,0.28)",
    borderRadius: 18,
    backgroundColor: "rgba(255,64,95,0.07)",
  },
  summaryCopy: { flex: 1 },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF405F",
  },
  summaryTitle: { color: "#F5F7FF", fontSize: 14, fontWeight: "800" },
  summaryText: { color: "#A9ADC2", marginTop: 4, fontSize: 11, lineHeight: 16 },
  empty: { alignItems: "center", paddingHorizontal: 42, paddingTop: 64 },
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
    fontSize: 12,
    lineHeight: 18,
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
});
