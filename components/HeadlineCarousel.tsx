import type { NewsArticle } from "@/lib/news";
import { formatRelativeTime, getArticleCategory } from "@/lib/news";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 64;
const CARD_SPACING = 16;

type HeadlineCarouselProps = {
  articles: NewsArticle[];
  onPressArticle: (article: NewsArticle) => void;
};

export default function HeadlineCarousel({
  articles,
  onPressArticle,
}: HeadlineCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<NewsArticle>>(null);

  const safeArticles = useMemo(
    () => articles.filter((article) => article.title || article.urlToImage),
    [articles],
  );

  useEffect(() => {
    if (safeArticles.length < 2) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = currentIndex === safeArticles.length - 1 ? 0 : currentIndex + 1;

        listRef.current?.scrollToOffset({
          animated: true,
          offset: nextIndex * (CARD_WIDTH + CARD_SPACING),
        });

        return nextIndex;
      });
    }, 4200);

    return () => clearInterval(timer);
  }, [safeArticles.length]);

  if (safeArticles.length === 0) {
    return (
      <View style={styles.placeholderCard}>
        <LinearGradient
          colors={["#dbeafe", "#eff6ff"]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.placeholderTitle}>Fresh stories will show up here.</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={safeArticles}
        decelerationRate="fast"
        horizontal
        keyExtractor={(item, index) => `${item.url ?? item.title ?? "headline"}-${index}`}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(
            event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING),
          );
          setActiveIndex(nextIndex);
        }}
        renderItem={({ item, index }) => {
          const category = getArticleCategory(item, index);

          return (
            <Pressable
              onPress={() => onPressArticle(item)}
              style={({ pressed }) => [
                styles.card,
                index === safeArticles.length - 1 && styles.lastCard,
                pressed && styles.cardPressed,
              ]}
            >
              {item.urlToImage ? (
                <ImageBackground
                  source={{ uri: item.urlToImage }}
                  style={StyleSheet.absoluteFillObject}
                />
              ) : (
                <LinearGradient
                  colors={["#334155", "#0f172a"]}
                  style={StyleSheet.absoluteFillObject}
                />
              )}

              <LinearGradient
                colors={["rgba(15,23,42,0.08)", "rgba(15,23,42,0.26)", "rgba(2,6,23,0.86)"]}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.cardContent}>
                <View style={styles.tagPill}>
                  <Text style={styles.tagText}>{category}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text numberOfLines={1} style={styles.metaText}>
                    {item.source?.name ?? "Global Desk"} • {formatRelativeTime(item.publishedAt)}
                  </Text>
                  <Text numberOfLines={2} style={styles.titleText}>
                    {item.title ?? "Untitled headline"}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
      />

      <View style={styles.pagination}>
        {safeArticles.map((article, index) => {
          const isActive = index === activeIndex;

          return (
            <View
              key={`${article.url ?? article.title ?? "dot"}-${index}`}
              style={[styles.dot, isActive && styles.activeDot]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: "#3182F6",
    width: 20,
  },
  card: {
    borderRadius: 28,
    height: 220,
    marginRight: CARD_SPACING,
    overflow: "hidden",
    width: CARD_WIDTH,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18,
  },
  cardFooter: {
    gap: 8,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.985 }],
  },
  dot: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  lastCard: {
    marginRight: 4,
  },
  metaText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: "500",
  },
  pagination: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 14,
  },
  placeholderCard: {
    alignItems: "center",
    borderRadius: 28,
    height: 220,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    color: "#1E293B",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: "#3182F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -0.9,
    lineHeight: 32,
  },
});
