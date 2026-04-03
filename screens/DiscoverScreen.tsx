import NewsListCard from "@/components/NewsListCard";
import {
  DISCOVER_CATEGORIES,
  fetchDiscoverArticles,
  NewsArticle,
  toArticleParams,
} from "@/lib/news";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DiscoverCategory = (typeof DISCOVER_CATEGORIES)[number];

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DiscoverScreen() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<DiscoverCategory>("All");
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entrance, {
      damping: 18,
      mass: 0.72,
      stiffness: 180,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 320);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const loadArticles = useCallback(async () => {
    setLoading(true);

    try {
      const nextArticles = await fetchDiscoverArticles({
        category: selectedCategory,
        query: debouncedSearch,
      });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setArticles(nextArticles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  const openArticle = useCallback(
    (article: NewsArticle) => {
      router.push({
        pathname: "/article",
        params: toArticleParams(article),
      });
    },
    [router],
  );

  const animatedStyle = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F4EF]" edges={["top"]}>
      <StatusBar style="dark" />

      <Animated.View style={[styles.screenWrap, animatedStyle]}>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={articles}
          keyExtractor={(item, index) =>
            `${item.url ?? item.title ?? "discover"}-${index}`
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color="#3182F6" size="large" />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  No stories matched that search.
                </Text>
                <Text style={styles.emptyCopy}>
                  Try a broader query or switch back to All.
                </Text>
              </View>
            )
          }
          ListHeaderComponent={
            <View>
              <Pressable
                onPress={() => router.navigate("/")}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <ChevronLeft color="#111827" size={20} />
              </Pressable>

              <Text style={styles.title}>Discover</Text>
              <Text style={styles.subtitle}>
                News from all around the world
              </Text>

              <View style={styles.searchWrap}>
                <View style={styles.searchInputWrap}>
                  <Search color="#9CA3AF" size={18} />
                  <TextInput
                    onChangeText={setSearchValue}
                    placeholder="Search"
                    placeholderTextColor="#9CA3AF"
                    style={styles.searchInput}
                    value={searchValue}
                  />
                </View>
              </View>

              <FlatList
                contentContainerStyle={styles.categoryContent}
                data={DISCOVER_CATEGORIES}
                horizontal
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const selected = item === selectedCategory;

                  return (
                    <Pressable
                      onPress={() => setSelectedCategory(item)}
                      style={[
                        styles.categoryChip,
                        selected && styles.categoryChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                }}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.cardSpacing,
                index < articles.length - 1 && styles.cardDivider,
              ]}
            >
              <NewsListCard
                article={item}
                index={index}
                onPress={openArticle}
                variant="discover"
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    height: 46,
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    width: 46,
  },
  cardSpacing: {
    paddingVertical: 10,
  },
  cardDivider: {
    borderBottomColor: "rgba(152, 162, 179, 0.18)",
    borderBottomWidth: 1,
  },
  categoryChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    marginRight: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  categoryChipSelected: {
    backgroundColor: "#3182F6",
  },
  categoryChipText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
  categoryContent: {
    paddingVertical: 8,
  },
  emptyCopy: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  listContent: {
    paddingBottom: 132,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  screenWrap: {
    flex: 1,
  },
  searchInput: {
    color: "#111827",
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  searchInputWrap: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  searchWrap: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    marginTop: 26,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  title: {
    color: "#111827",
    fontSize: 46,
    fontWeight: "700",
    letterSpacing: -1.6,
    lineHeight: 50,
  },
});
