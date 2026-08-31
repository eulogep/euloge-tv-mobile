import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { useMjtv } from "@/lib/mjtv-context";
import type { MjtvChannel } from "@/lib/mjtv-data";
import { haptic } from "@/lib/haptics";

const logo = require("@/assets/images/icon.png");

export function MjtvHeader({ title }: { title?: string }) {
  const { setSearchOpen } = useMjtv();
  return (
    <View style={styles.header}>
      <View style={styles.brandCluster}>
        <Image source={logo} style={styles.logo} accessibilityLabel="MJTV" />
        {title ? (
          <Text style={styles.headerTitle}>{title}</Text>
        ) : (
          <Text style={styles.wordmark}>MJTV</Text>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Rechercher"
        hitSlop={6}
        onPress={() => {
          haptic.light();
          setSearchOpen(true);
        }}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <MaterialIcons name="search" size={21} color="#F5F7FF" />
      </Pressable>
    </View>
  );
}

export function StatusBadge({ status }: { status: MjtvChannel["status"] }) {
  const copy =
    status === "live"
      ? "LIVE"
      : status === "degraded"
        ? "DÉGRADÉ"
        : status === "unverified"
          ? "À VÉRIFIER"
          : status === "restricted"
            ? "ACCÈS LIMITÉ"
            : "HORS LIGNE";
  const colors =
    status === "live"
      ? {
          backgroundColor: "rgba(255,64,95,0.16)",
          borderColor: "rgba(255,64,95,0.48)",
          color: "#FF7188",
        }
      : status === "degraded"
        ? {
            backgroundColor: "rgba(246,200,95,0.14)",
            borderColor: "rgba(246,200,95,0.36)",
            color: "#F6C85F",
          }
        : status === "unverified"
          ? {
              backgroundColor: "rgba(162,123,255,0.14)",
              borderColor: "rgba(162,123,255,0.36)",
              color: "#B79BFF",
            }
          : status === "restricted"
            ? {
                backgroundColor: "rgba(246,200,95,0.12)",
                borderColor: "rgba(246,200,95,0.32)",
                color: "#F6C85F",
              }
            : {
                backgroundColor: "rgba(255,92,116,0.12)",
                borderColor: "rgba(255,92,116,0.36)",
                color: "#FF8799",
              };
  return (
    <View style={[styles.badge, colors]}>
      <View style={[styles.badgeDot, { backgroundColor: colors.color }]} />
      <Text style={[styles.badgeText, { color: colors.color }]}>{copy}</Text>
    </View>
  );
}

export function ChannelArtwork({
  channel,
  compact = false,
}: {
  channel: MjtvChannel;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.artwork,
        compact && styles.artworkCompact,
        { borderColor: `${channel.accent}55` },
      ]}
    >
      <View style={[styles.artGlow, { backgroundColor: channel.accent }]} />
      {channel.logoUrl ? (
        <Image
          source={{ uri: channel.logoUrl }}
          style={styles.channelLogo}
          resizeMode="contain"
        />
      ) : (
        <Text style={[styles.artMark, { color: channel.accent }]}>
          {channel.name.slice(0, 1)}
        </Text>
      )}
      <Text numberOfLines={1} style={styles.artName}>
        {channel.name}
      </Text>
    </View>
  );
}

export function ChannelCard({
  channel,
  variant = "rail",
}: {
  channel: MjtvChannel;
  variant?: "rail" | "list";
}) {
  const { favorites, openPlayer, toggleFavorite } = useMjtv();
  const favorite = favorites.includes(channel.id);
  const isList = variant === "list";
  const cardStyle: ViewStyle = isList ? styles.listCard : styles.railCard;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir ${channel.name}`}
      accessibilityState={{ disabled: !channel.canOpen }}
      disabled={!channel.canOpen}
      onPress={() => {
        haptic.light();
        openPlayer(channel.id);
      }}
      style={({ pressed }) => [
        cardStyle,
        !channel.canOpen && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={isList ? styles.listArtWrap : undefined}>
        <ChannelArtwork channel={channel} compact={isList} />
        <View style={styles.cardBadge}>
          <StatusBadge status={channel.status} />
        </View>
      </View>
      <View style={[styles.cardContent, isList && styles.listCardContent]}>
        <View style={styles.cardTextWrap}>
          <Text numberOfLines={1} style={styles.channelName}>
            {channel.name}
          </Text>
          <Text numberOfLines={1} style={styles.channelMeta}>
            {channel.country} · {channel.category}
          </Text>
          <Text numberOfLines={1} style={styles.programTitle}>
            {channel.currentProgram}
          </Text>
          {channel.progress > 0 ? (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressValue,
                  {
                    width: `${channel.progress * 100}%`,
                    backgroundColor: channel.accent,
                  },
                ]}
              />
            </View>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            favorite
              ? `Retirer ${channel.name} des favoris`
              : `Ajouter ${channel.name} aux favoris`
          }
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            haptic.selection();
            toggleFavorite(channel.id);
          }}
          style={({ pressed }) => [
            styles.favoriteButton,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons
            name={favorite ? "star" : "star-border"}
            size={19}
            color={favorite ? "#A27BFF" : "#A9ADC2"}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  const opacity = useRef(new Animated.Value(0.42)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.82,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.42,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return (
    <Animated.View style={[styles.skeletonWrap, { opacity }]}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.skeletonRow}>
          <View style={styles.skeletonArt} />
          <View style={styles.skeletonCopy}>
            <View style={styles.skeletonLineWide} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineShort} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

export function SectionHeading({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={22} color="#A27BFF" />
    </View>
  );
}

export const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  brandCluster: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 34, height: 34, borderRadius: 10 },
  wordmark: {
    color: "#F5F7FF",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  headerTitle: {
    color: "#F5F7FF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171728",
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.28)",
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  badge: {
    minHeight: 24,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  artwork: {
    height: 104,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#111324",
    justifyContent: "center",
    alignItems: "center",
  },
  artworkCompact: { height: 82, borderRadius: 14 },
  artGlow: {
    position: "absolute",
    width: 118,
    height: 118,
    opacity: 0.22,
    borderRadius: 60,
    right: -25,
    top: -36,
  },
  artMark: {
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 44,
    textShadowColor: "rgba(0,0,0,0.56)",
    textShadowRadius: 10,
  },
  channelLogo: { width: "72%", height: "58%" },
  artName: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 9,
    color: "rgba(245,247,255,0.88)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  railCard: {
    width: 178,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.2)",
    backgroundColor: "#171728",
    marginRight: 12,
  },
  listCard: {
    minHeight: 106,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.18)",
    backgroundColor: "#171728",
    flexDirection: "row",
    alignItems: "stretch",
  },
  listArtWrap: { width: 130, padding: 10 },
  cardBadge: { position: "absolute", top: 8, right: 8 },
  cardContent: { minHeight: 106, padding: 12, flexDirection: "row", gap: 8 },
  listCardContent: {
    flex: 1,
    minHeight: 0,
    paddingLeft: 0,
    justifyContent: "center",
  },
  cardTextWrap: { flex: 1, minWidth: 0 },
  channelName: {
    color: "#F5F7FF",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
  },
  channelMeta: { color: "#A9ADC2", fontSize: 10, lineHeight: 16 },
  programTitle: {
    color: "#DDE0F0",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 7,
    lineHeight: 16,
  },
  progressTrack: {
    height: 3,
    borderRadius: 99,
    overflow: "hidden",
    marginTop: 7,
    backgroundColor: "#2A2A42",
  },
  progressValue: { height: "100%", borderRadius: 99 },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  sectionHeading: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  skeletonWrap: { marginHorizontal: 20, gap: 10, paddingVertical: 8 },
  skeletonRow: {
    height: 82,
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#171728",
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.14)",
  },
  skeletonArt: { width: 70, borderRadius: 11, backgroundColor: "#2A2941" },
  skeletonCopy: { flex: 1, justifyContent: "center", gap: 8 },
  skeletonLineWide: {
    width: "72%",
    height: 11,
    borderRadius: 6,
    backgroundColor: "#35324D",
  },
  skeletonLine: {
    width: "50%",
    height: 8,
    borderRadius: 5,
    backgroundColor: "#2A2941",
  },
  skeletonLineShort: {
    width: "34%",
    height: 6,
    borderRadius: 4,
    backgroundColor: "#2A2941",
  },
  disabled: { opacity: 0.56 },
  sectionTitle: {
    color: "#F5F7FF",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sectionDetail: { color: "#A9ADC2", marginTop: 2, fontSize: 12 },
});
