import { StatusBar } from "expo-status-bar";
import type { LucideIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PlaceholderScreenProps = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

export default function PlaceholderScreen({
  title,
  description,
  Icon,
}: PlaceholderScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F4EF]" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="flex-1 px-6 pt-6">
        <View className="rounded-[36px] bg-white p-8 shadow-sm">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E0ECFF]">
            <Icon color="#2563EB" size={28} />
          </View>
          <Text className="mt-6 text-[34px] font-bold tracking-[-1.1px] text-[#111827]">
            {title}
          </Text>
          <Text className="mt-3 text-base leading-7 text-[#6B7280]">
            {description}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
