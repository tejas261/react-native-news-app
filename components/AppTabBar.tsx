import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Bookmark,
  Compass,
  House,
  LucideIcon,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_CONFIG: Record<
  string,
  {
    label: string;
    Icon: LucideIcon;
  }
> = {
  discover: { label: "Discover", Icon: Compass },
  index: { label: "Home", Icon: House },
  saved: { label: "Saved", Icon: Bookmark },
};

type TabButtonProps = {
  focused: boolean;
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  onLongPress: () => void;
};

const TabButton = ({
  focused,
  label,
  Icon,
  onPress,
  onLongPress,
}: TabButtonProps) => {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      damping: 16,
      mass: 0.7,
      stiffness: 220,
      toValue: focused ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [focused, progress]);

  const labelOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const labelWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  const bubbleScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });

  return (
    <Pressable
      accessibilityRole="button"
      onLongPress={onLongPress}
      onPress={onPress}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.activeBubble,
          {
            opacity: progress,
            transform: [{ scale: bubbleScale }],
          },
        ]}
      />

      <View style={styles.tabButtonContent}>
        <Icon color={focused ? "#FFFFFF" : "#9CA3AF"} size={20} strokeWidth={2} />
        <Animated.View
          style={[
            styles.labelWrap,
            {
              opacity: labelOpacity,
              width: labelWidth,
            },
          ]}
        >
          <Text numberOfLines={1} style={styles.labelText}>
            {label}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
};

export default function AppTabBar({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.outerWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options;
          const config = TAB_CONFIG[route.name];

          if (!config) return null;

          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: "tabPress",
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              target: route.key,
              type: "tabLongPress",
            });
          };

          return (
            <TabButton
              key={route.key}
              focused={focused}
              Icon={config.Icon}
              label={String(options?.title ?? config.label)}
              onLongPress={onLongPress}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeBubble: {
    backgroundColor: "#3182F6",
    borderRadius: 999,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  bar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: "rgba(15, 23, 42, 0.06)",
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  labelWrap: {
    marginLeft: 8,
    overflow: "hidden",
  },
  outerWrap: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    position: "absolute",
    right: 0,
  },
  tabButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 8,
    position: "relative",
  },
  tabButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 50,
    minWidth: 44,
    zIndex: 1,
  },
});
