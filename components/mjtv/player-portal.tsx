import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusBadge } from "@/components/mjtv/primitives";
import { haptic } from "@/lib/haptics";
import { useMjtv } from "@/lib/mjtv-context";

export function MjtvPlayerPortal() {
  const {
    activeChannel,
    playerMode,
    isPlaying,
    muted,
    channelLoading,
    channelError,
    retryChannel,
    minimizePlayer,
    expandPlayer,
    closePlayer,
    togglePlayback,
    toggleMuted,
  } = useMjtv();
  const insets = useSafeAreaInsets();
  const sources = useMemo(
    () => activeChannel?.streams ?? [],
    [activeChannel?.streams],
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const source = sources[sourceIndex] ?? null;
  const videoSource = useMemo(
    () =>
      source
        ? {
            uri: source.url,
            contentType:
              source.kind === "hls"
                ? ("hls" as const)
                : ("progressive" as const),
          }
        : null,
    [source],
  );
  const player = useVideoPlayer(null, (controller) => {
    controller.staysActiveInBackground = true;
    controller.showNowPlayingNotification = true;
  });
  const statusEvent = useEvent(player, "statusChange", {
    status: player.status,
    error: undefined,
  });
  const playerStatus = statusEvent?.status ?? player.status;
  const playerEventError = statusEvent?.error;
  const handledErrorEvent = useRef(statusEvent);

  useEffect(() => {
    setSourceIndex(0);
    setSourceError(null);
    player.pause();
    player.replace(null);
  }, [activeChannel?.id, player]);

  useEffect(() => {
    if (!source) return;
    try {
      player.replace(videoSource);
    } catch {
      setSourceError("La source sélectionnée ne peut pas être chargée.");
    }
  }, [player, source, videoSource]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    if (!activeChannel || !source || playerStatus !== "error") return;
    if (handledErrorEvent.current === statusEvent) return;
    handledErrorEvent.current = statusEvent;
    const message =
      playerEventError?.message ??
      "La source a rencontré une erreur de lecture.";
    if (sourceIndex < sources.length - 1) {
      setSourceError(
        `${message} Bascule vers ${sources[sourceIndex + 1]?.label ?? "la source suivante"}.`,
      );
      const timer = setTimeout(() => {
        setSourceError(null);
        setSourceIndex((current) => current + 1);
      }, 650);
      return () => clearTimeout(timer);
    }
    setSourceError(
      `${message} Toutes les sources compatibles ont été essayées.`,
    );
  }, [
    activeChannel,
    playerEventError,
    playerStatus,
    source,
    sourceIndex,
    sources,
    statusEvent,
  ]);

  useEffect(() => {
    if (!activeChannel || !source) return;
    if (isPlaying) player.play();
    else player.pause();
  }, [activeChannel, isPlaying, player, source]);

  if (!activeChannel || playerMode === "closed") return null;

  const control = (
    name: "play-arrow" | "pause",
    label: string,
    action: () => void,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={action}
      style={({ pressed }) => [styles.control, pressed && styles.pressed]}
    >
      <MaterialIcons name={name} size={24} color="#FFFFFF" />
    </Pressable>
  );
  const statusLabel =
    playerStatus === "loading"
      ? "Connexion à la source…"
      : playerStatus === "error"
        ? "Lecture indisponible"
        : activeChannel.status === "live"
          ? "Direct confirmé"
          : activeChannel.status === "degraded"
            ? "Disponibilité limitée"
            : "Source sélectionnée";
  const unavailableMessage = channelError
    ? "Les informations de lecture MJTV sont temporairement indisponibles."
    : !channelLoading && sources.length === 0
      ? "Aucune source HTTPS compatible n’est disponible pour cette chaîne."
      : null;

  if (playerMode === "mini") {
    return (
      <View style={[styles.mini, { bottom: 68 + insets.bottom }]}>
        <VideoView
          player={player}
          style={styles.miniVideo}
          contentFit="cover"
          nativeControls={false}
          surfaceType="textureView"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Rouvrir ${activeChannel.name}`}
          onPress={expandPlayer}
          style={styles.miniMeta}
        >
          <Text numberOfLines={1} style={styles.miniTitle}>
            {activeChannel.name}
          </Text>
          <Text numberOfLines={1} style={styles.miniProgram}>
            {activeChannel.currentProgram}
          </Text>
        </Pressable>
        {control(
          isPlaying ? "pause" : "play-arrow",
          isPlaying ? "Mettre en pause" : "Lecture",
          () => {
            haptic.light();
            togglePlayback();
          },
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le mini-lecteur"
          onPress={closePlayer}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <MaterialIcons name="close" size={20} color="#DDE0F0" />
        </Pressable>
      </View>
    );
  }

  return (
    <Modal
      animationType="slide"
      visible
      transparent={false}
      onRequestClose={minimizePlayer}
    >
      <SafeAreaView style={styles.fullscreen}>
        <View style={styles.playerTop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réduire le lecteur"
            onPress={minimizePlayer}
            style={({ pressed }) => [
              styles.topControl,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name="keyboard-arrow-down"
              size={27}
              color="#FFFFFF"
            />
          </Pressable>
          <StatusBadge status={activeChannel.status} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer le lecteur"
            onPress={closePlayer}
            style={({ pressed }) => [
              styles.topControl,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="close" size={21} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.videoFrame}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls
            allowsFullscreen
            allowsPictureInPicture
            startsPictureInPictureAutomatically
            surfaceType="textureView"
          />
          {(channelLoading || playerStatus === "idle") &&
          !unavailableMessage ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#A27BFF" size="large" />
              <Text style={styles.loadingText}>
                {channelLoading ? "Chargement des sources MJTV…" : statusLabel}
              </Text>
            </View>
          ) : null}
          {unavailableMessage ? (
            <View style={styles.errorOverlay}>
              <MaterialIcons name="cloud-off" size={24} color="#FF7188" />
              <Text style={styles.errorTitle}>Lecture indisponible</Text>
              <Text style={styles.errorText}>{unavailableMessage}</Text>
              {channelError ? (
                <Pressable onPress={retryChannel} style={styles.retry}>
                  <Text style={styles.retryText}>Réessayer</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {sourceError ? (
            <View style={styles.errorOverlay}>
              <MaterialIcons name="warning" size={24} color="#FF7188" />
              <Text style={styles.errorTitle}>Lecture interrompue</Text>
              <Text style={styles.errorText}>{sourceError}</Text>
              <Pressable
                onPress={() => {
                  haptic.light();
                  setSourceError(null);
                  setSourceIndex(0);
                }}
                style={styles.retry}
              >
                <Text style={styles.retryText}>Réessayer les sources</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
        <ScrollView
          contentContainerStyle={styles.playerInfo}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.playerHeading}>
            <View style={styles.playerTitleWrap}>
              <Text numberOfLines={1} style={styles.playerTitle}>
                {activeChannel.name}
              </Text>
              <Text numberOfLines={1} style={styles.playerSubtitle}>
                {activeChannel.country} · {activeChannel.category}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={muted ? "Activer le son" : "Couper le son"}
              onPress={toggleMuted}
              style={({ pressed }) => [
                styles.topControl,
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons
                name={muted ? "volume-off" : "volume-up"}
                size={21}
                color="#DDE0F0"
              />
            </Pressable>
          </View>
          <View style={styles.playerControls}>
            {control(
              isPlaying ? "pause" : "play-arrow",
              isPlaying ? "Mettre en pause" : "Lecture",
              () => {
                haptic.light();
                togglePlayback();
              },
            )}
            <Text style={styles.liveCopy}>{statusLabel}</Text>
          </View>
          {sources.length > 0 ? (
            <>
              <Text style={styles.qualityLabel}>QUALITÉ / SOURCE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.qualityRow}
              >
                {sources.map((option, index) => (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Choisir ${option.label}`}
                    accessibilityState={{ selected: sourceIndex === index }}
                    onPress={() => {
                      haptic.selection();
                      setSourceError(null);
                      setSourceIndex(index);
                    }}
                    style={({ pressed }) => [
                      styles.qualityChip,
                      sourceIndex === index && styles.qualityChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.qualityText,
                        sourceIndex === index && styles.qualityTextActive,
                      ]}
                    >
                      {option.quality}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}
          <View style={styles.epgCard}>
            <Text style={styles.epgEyebrow}>
              EN CE MOMENT ·{" "}
              {activeChannel.epgStatus === "unknown"
                ? "EPG en attente"
                : `EPG ${activeChannel.epgStatus}`}
            </Text>
            <Text style={styles.epgCurrent}>
              {activeChannel.currentProgram}
            </Text>
            {activeChannel.progress > 0 ? (
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressValue,
                    {
                      width: `${activeChannel.progress * 100}%`,
                      backgroundColor: activeChannel.accent,
                    },
                  ]}
                />
              </View>
            ) : null}
            <Text style={styles.epgNext}>
              À suivre · {activeChannel.nextProgram}
            </Text>
            {activeChannel.laterPrograms.slice(0, 2).map((program) => (
              <Text key={program} style={styles.epgLater}>
                Plus tard · {program}
              </Text>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mini: {
    position: "absolute",
    left: 12,
    right: 12,
    minHeight: 62,
    zIndex: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.38)",
    backgroundColor: "#171728",
    flexDirection: "row",
    alignItems: "center",
    padding: 7,
    shadowColor: "#000",
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 12,
  },
  miniVideo: {
    width: 66,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#05050B",
  },
  miniMeta: { minWidth: 0, flex: 1, marginHorizontal: 10 },
  miniTitle: { color: "#F5F7FF", fontSize: 12, fontWeight: "800" },
  miniProgram: { color: "#A9ADC2", fontSize: 10, marginTop: 3 },
  control: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7A5CFF",
  },
  close: {
    width: 38,
    height: 38,
    marginLeft: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  fullscreen: { flex: 1, backgroundColor: "#070711" },
  playerTop: {
    height: 62,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  topControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  videoFrame: {
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(162,123,255,0.2)",
    justifyContent: "center",
  },
  video: { width: "100%", height: "100%" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,5,11,0.72)",
  },
  loadingText: {
    color: "#DDE0F0",
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 26,
    backgroundColor: "rgba(5,5,11,0.9)",
  },
  errorTitle: {
    color: "#F5F7FF",
    marginTop: 8,
    fontSize: 16,
    fontWeight: "900",
  },
  errorText: {
    color: "#B9B7C8",
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  retry: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#A27BFF",
  },
  retryText: { color: "#070711", fontSize: 12, fontWeight: "900" },
  playerInfo: { padding: 20, paddingBottom: 40 },
  playerHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  playerTitleWrap: { flex: 1, minWidth: 0 },
  playerTitle: {
    color: "#F5F7FF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  playerSubtitle: { color: "#A9ADC2", fontSize: 12, marginTop: 4 },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  liveCopy: {
    color: "#FF7188",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    flexShrink: 1,
  },
  qualityLabel: {
    color: "#A27BFF",
    marginTop: 22,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  qualityRow: { gap: 8, paddingVertical: 10 },
  qualityChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.25)",
    backgroundColor: "#171728",
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  qualityChipActive: {
    borderColor: "#A27BFF",
    backgroundColor: "rgba(122,92,255,0.2)",
  },
  qualityText: { color: "#A9ADC2", fontSize: 11, fontWeight: "800" },
  qualityTextActive: { color: "#F5F7FF" },
  epgCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(162,123,255,0.24)",
    backgroundColor: "#111324",
  },
  epgEyebrow: {
    color: "#A27BFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  epgCurrent: {
    color: "#F5F7FF",
    marginTop: 7,
    fontSize: 16,
    fontWeight: "800",
  },
  progressTrack: {
    marginTop: 13,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#2A2A42",
    overflow: "hidden",
  },
  progressValue: { height: "100%", borderRadius: 99 },
  epgNext: { color: "#A9ADC2", marginTop: 11, fontSize: 12 },
  epgLater: { color: "#747386", marginTop: 7, fontSize: 11 },
});
