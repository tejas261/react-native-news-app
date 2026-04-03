import NewsListCard from "@/components/NewsListCard";
import { useSavedArticles } from "@/providers/SavedArticlesProvider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Bookmark, Trash2 } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedScreen() {
  const router = useRouter();
  const { hydrated, removeArticle, savedArticles } = useSavedArticles();

  const openArticle = useCallback(
    (article: (typeof savedArticles)[number]) => {
      router.push({
        pathname: "/article",
        params: {
          author: article.author ?? "",
          content: article.content ?? "",
          description: article.description ?? "",
          imageUrl: article.imageUrl ?? "",
          publishedAt: article.publishedAt ?? "",
          sourceName: article.sourceName ?? "",
          title: article.title ?? "",
          url: article.url ?? "",
        },
      });
    },
    [router, savedArticles],
  );

  if (!hydrated) {
    return (
      <SafeAreaView className="flex-1 bg-[#F7F4EF]" edges={["top"]}>
        <StatusBar style="dark" />
        <View style={styles.loaderWrap}>
          <ActivityIndicator color="#3182F6" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F4EF]" edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={savedArticles}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Bookmark color="#3182F6" size={30} />
            </View>
            <Text style={styles.emptyTitle}>No saved posts yet</Text>
            <Text style={styles.emptyCopy}>
              Bookmark an article from the detail screen and it will appear
              here.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Saved</Text>
            <Text style={styles.subtitle}>
              {savedArticles.length === 0
                ? "Your reading list is empty"
                : `${savedArticles.length} saved ${
                    savedArticles.length === 1 ? "story" : "stories"
                  }`}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.rowWrap,
              index < savedArticles.length - 1 && styles.rowDivider,
            ]}
          >
            <NewsListCard
              article={{
                author: item.author,
                description: item.description,
                publishedAt: item.publishedAt,
                source: { name: item.sourceName },
                title: item.title,
                url: item.url,
                urlToImage: item.imageUrl,
              }}
              index={index}
              onPress={() => openArticle(item)}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove saved article"
              onPress={() => {
                void removeArticle(item);
              }}
              style={({ pressed }) => [
                styles.removeButton,
                pressed && styles.removeButtonPressed,
              ]}
            >
              <Trash2 color="#6B7280" size={17} />
            </Pressable>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyCopy: {
    color: "#98A2B3",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 8,
    textAlign: "center",
  },
  emptyIconWrap: {
    alignItems: "center",
    backgroundColor: "#E8F1FF",
    borderRadius: 999,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 72,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginTop: 20,
  },
  header: {
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 132,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  loaderWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  removeButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    marginTop: 10,
    width: 36,
  },
  removeButtonPressed: {
    opacity: 0.8,
  },
  rowDivider: {
    borderBottomColor: "rgba(152, 162, 179, 0.18)",
    borderBottomWidth: 1,
  },
  rowWrap: {
    paddingVertical: 10,
  },
  subtitle: {
    color: "#98A2B3",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 6,
  },
  title: {
    color: "#111827",
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: -1.2,
  },
});
