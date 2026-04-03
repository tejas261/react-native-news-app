import Article from "@/components/Article";
import type { ArticleRouteParams } from "@/lib/news";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function ArticleScreen() {
  const params = useLocalSearchParams<ArticleRouteParams>();

  return (
    <View className="flex-1 bg-neutral-950">
      <Stack.Screen options={{ headerShown: false }} />
      <Article
        title={params.title ? String(params.title) : undefined}
        description={
          params.description ? String(params.description) : undefined
        }
        content={params.content ? String(params.content) : undefined}
        imageUrl={params.imageUrl ? String(params.imageUrl) : undefined}
        author={params.author ? String(params.author) : undefined}
        publishedAt={
          params.publishedAt ? String(params.publishedAt) : undefined
        }
        sourceName={params.sourceName ? String(params.sourceName) : undefined}
        url={params.url ? String(params.url) : undefined}
      />
    </View>
  );
}
