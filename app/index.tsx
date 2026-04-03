import Header from "@/components/Header";
import type { HomeScreenHandle } from "@/screens/HomeScreen";
import HomeScreen from "@/screens/HomeScreen";
import React, { useRef } from "react";
import { View } from "react-native";

export default function Index() {
  const homeRef = useRef<HomeScreenHandle | null>(null);

  return (
    <View className="flex-1">
      <Header homeRef={homeRef} />
      <HomeScreen ref={homeRef} />
    </View>
  );
}
