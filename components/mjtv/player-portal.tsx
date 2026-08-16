import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect } from "react";
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusBadge } from "@/components/mjtv/primitives";
import { useMjtv } from "@/lib/mjtv-context";
import { haptic } from "@/lib/haptics";

export function MjtvPlayerPortal() {
  const { activeChannel, playerMode, isPlaying, muted, minimizePlayer, expandPlayer, closePlayer, togglePlayback, toggleMuted } = useMjtv();
  const insets = useSafeAreaInsets();
  const source = activeChannel ? { uri: activeChannel.streamUrl, contentType: "hls" as const } : null;
  const player = useVideoPlayer(source, (controller) => {
    controller.staysActiveInBackground = true;
    controller.showNowPlayingNotification = true;
  });

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    if (!activeChannel) return;
    if (isPlaying) player.play();
    else player.pause();
  }, [activeChannel, isPlaying, player]);

  if (!activeChannel || playerMode === "closed") return null;

  const control = (name: "play-arrow" | "pause", label: string, action: () => void) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={action} style={({ pressed }) => [styles.control, pressed && styles.pressed]}>
      <MaterialIcons name={name} size={24} color="#FFFFFF" />
    </Pressable>
  );

  if (playerMode === "mini") {
    return (
      <View style={[styles.mini, { bottom: 68 + insets.bottom }]}>
        <VideoView player={player} style={styles.miniVideo} contentFit="cover" nativeControls={false} surfaceType="textureView" />
        <Pressable accessibilityRole="button" accessibilityLabel={`Rouvrir ${activeChannel.name}`} onPress={expandPlayer} style={styles.miniMeta}>
          <Text numberOfLines={1} style={styles.miniTitle}>{activeChannel.name}</Text>
          <Text numberOfLines={1} style={styles.miniProgram}>{activeChannel.currentProgram}</Text>
        </Pressable>
        {control(isPlaying ? "pause" : "play-arrow", isPlaying ? "Mettre en pause" : "Lecture", () => { haptic.light(); togglePlayback(); })}
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer le mini-lecteur" onPress={closePlayer} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
          <MaterialIcons name="close" size={20} color="#DDE0F0" />
        </Pressable>
      </View>
    );
  }

  return (
    <Modal animationType="slide" visible transparent={false} onRequestClose={minimizePlayer}>
      <SafeAreaView style={styles.fullscreen}>
        <View style={styles.playerTop}>
          <Pressable accessibilityRole="button" accessibilityLabel="Réduire le lecteur" onPress={minimizePlayer} style={({ pressed }) => [styles.topControl, pressed && styles.pressed]}>
            <MaterialIcons name="keyboard-arrow-down" size={27} color="#FFFFFF" />
          </Pressable>
          <StatusBadge status={activeChannel.status} />
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer le lecteur" onPress={closePlayer} style={({ pressed }) => [styles.topControl, pressed && styles.pressed]}>
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
        </View>
        <View style={styles.playerInfo}>
          <View style={styles.playerHeading}>
            <View style={styles.playerTitleWrap}>
              <Text numberOfLines={1} style={styles.playerTitle}>{activeChannel.name}</Text>
              <Text numberOfLines={1} style={styles.playerSubtitle}>{activeChannel.country} · {activeChannel.category}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={muted ? "Activer le son" : "Couper le son"} onPress={toggleMuted} style={({ pressed }) => [styles.topControl, pressed && styles.pressed]}>
              <MaterialIcons name={muted ? "volume-off" : "volume-up"} size={21} color="#DDE0F0" />
            </Pressable>
          </View>
          <View style={styles.playerControls}>
            {control(isPlaying ? "pause" : "play-arrow", isPlaying ? "Mettre en pause" : "Lecture", () => { haptic.light(); togglePlayback(); })}
            <Text style={styles.liveCopy}>EN DIRECT</Text>
          </View>
          <View style={styles.epgCard}>
            <Text style={styles.epgEyebrow}>EN CE MOMENT</Text>
            <Text style={styles.epgCurrent}>{activeChannel.currentProgram}</Text>
            <View style={styles.progressTrack}><View style={[styles.progressValue, { width: `${activeChannel.progress * 100}%`, backgroundColor: activeChannel.accent }]} /></View>
            <Text style={styles.epgNext}>À suivre · {activeChannel.nextProgram}</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mini: { position: "absolute", left: 12, right: 12, minHeight: 62, zIndex: 50, borderRadius: 16, borderWidth: 1, borderColor: "rgba(162,123,255,0.38)", backgroundColor: "#171728", flexDirection: "row", alignItems: "center", padding: 7, shadowColor: "#000", shadowOpacity: 0.38, shadowRadius: 22, elevation: 12 },
  miniVideo: { width: 66, height: 44, borderRadius: 10, backgroundColor: "#05050B" },
  miniMeta: { minWidth: 0, flex: 1, marginHorizontal: 10 },
  miniTitle: { color: "#F5F7FF", fontSize: 12, fontWeight: "800" },
  miniProgram: { color: "#A9ADC2", fontSize: 10, marginTop: 3 },
  control: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#7A5CFF" },
  close: { width: 38, height: 38, marginLeft: 2, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  fullscreen: { flex: 1, backgroundColor: "#070711" },
  playerTop: { height: 62, paddingHorizontal: 20, alignItems: "center", justifyContent: "space-between", flexDirection: "row" },
  topControl: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  videoFrame: { aspectRatio: 16 / 9, backgroundColor: "#000000", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(162,123,255,0.2)" },
  video: { width: "100%", height: "100%" },
  playerInfo: { padding: 20 },
  playerHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  playerTitleWrap: { flex: 1, minWidth: 0 },
  playerTitle: { color: "#F5F7FF", fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  playerSubtitle: { color: "#A9ADC2", fontSize: 12, marginTop: 4 },
  playerControls: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20 },
  liveCopy: { color: "#FF7188", fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  epgCard: { marginTop: 24, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "rgba(162,123,255,0.24)", backgroundColor: "#111324" },
  epgEyebrow: { color: "#A27BFF", fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  epgCurrent: { color: "#F5F7FF", marginTop: 7, fontSize: 16, fontWeight: "800" },
  progressTrack: { marginTop: 13, height: 4, borderRadius: 99, backgroundColor: "#2A2A42", overflow: "hidden" },
  progressValue: { height: "100%", borderRadius: 99 },
  epgNext: { color: "#A9ADC2", marginTop: 11, fontSize: 12 },
});
