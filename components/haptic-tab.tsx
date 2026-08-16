import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Animated } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (value: number) => Animated.timing(scale, { toValue: value, duration: 110, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <PlatformPressable
        {...props}
        onPressIn={(ev) => {
          animate(0.94);
          if (process.env.EXPO_OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          props.onPressIn?.(ev);
        }}
        onPressOut={(ev) => {
          animate(1);
          props.onPressOut?.(ev);
        }}
      />
    </Animated.View>
  );
}
