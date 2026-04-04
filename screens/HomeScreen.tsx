import HeadlineCarousel from "@/components/HeadlineCarousel";
import NewsListCard from "@/components/NewsListCard";
import {
  fetchRecommendedArticles,
  fetchTopHeadlines,
  NewsArticle,
  toArticleParams,
} from "@/lib/news";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Menu, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ActionButton = ({
  icon,
  onPress,
}: {
  icon: React.ReactNode;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.iconButton,
      pressed && styles.iconButtonPressed,
    ]}
  >
    {icon}
  </Pressable>
);

export default function HomeScreen() {
  const router = useRouter();
  const [topHeadlines, setTopHeadlines] = useState<NewsArticle[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<NewsArticle[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;

  const loadFeed = useCallback(async () => {
    const [headlines, recommendations] = await Promise.all([
      fetchTopHeadlines(),
      fetchRecommendedArticles(),
    ]);

    setTopHeadlines(headlines);
    setRecommendedArticles(recommendations);
  }, []);

  useEffect(() => {
    Animated.spring(entrance, {
      damping: 18,
      mass: 0.7,
      stiffness: 180,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await loadFeed();
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [loadFeed]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFeed();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, [loadFeed]);

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

      {loading && topHeadlines.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#3182F6" size="large" />
        </View>
      ) : (
        <Animated.View style={[styles.screenWrap, animatedStyle]}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                onRefresh={handleRefresh}
                refreshing={refreshing}
                tintColor="#3182F6"
              />
            }
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <ActionButton icon={<Menu color="#111827" size={20} />} />

              <View style={styles.headerActions}>
                <ActionButton
                  icon={<Search color="#111827" size={20} />}
                  onPress={() => router.navigate("/discover")}
                />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Breaking News</Text>
              <Pressable onPress={() => router.navigate("/discover")}>
                <Text style={styles.sectionAction}>View all</Text>
              </Pressable>
            </View>

            <HeadlineCarousel
              articles={topHeadlines}
              onPressArticle={openArticle}
            />

            <View style={[styles.sectionHeader, styles.recommendationHeader]}>
              <Text style={styles.sectionTitle}>Recommendation</Text>
              <Pressable onPress={() => router.navigate("/discover")}>
                <Text style={styles.sectionAction}>View all</Text>
              </Pressable>
            </View>
            <Text>{String(!!process.env.EXPO_PUBLIC_NEWS_BASE_URL)}</Text>
            <Text>{String(!!process.env.EXPO_PUBLIC_NEWS_API_KEY)}</Text>

            <View style={styles.recommendationList}>
              {recommendedArticles.slice(0, 4).map((article, index) => (
                <View
                  key={`${article.url ?? article.title ?? "recommendation"}-${index}`}
                  style={[
                    styles.recommendationItem,
                    index < Math.min(recommendedArticles.length, 4) - 1 &&
                      styles.recommendationDivider,
                  ]}
                >
                  <NewsListCard
                    article={article}
                    index={index}
                    onPress={openArticle}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    width: 48,
  },
  iconButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  notificationDot: {
    backgroundColor: "#EF4444",
    borderColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 2,
    height: 10,
    position: "absolute",
    right: 10,
    top: 10,
    width: 10,
  },
  recommendationHeader: {
    marginTop: 28,
  },
  recommendationList: {
    marginTop: 2,
  },
  recommendationDivider: {
    borderBottomColor: "rgba(152, 162, 179, 0.18)",
    borderBottomWidth: 1,
    paddingBottom: 14,
  },
  recommendationItem: {
    paddingTop: 2,
  },
  screenWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 132,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionAction: {
    color: "#3182F6",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 26,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
});
