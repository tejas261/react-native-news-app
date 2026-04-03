import "../global.css";

import { SavedArticlesProvider } from "@/providers/SavedArticlesProvider";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <SavedArticlesProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F7F4EF" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="article"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </SavedArticlesProvider>
  );
}
