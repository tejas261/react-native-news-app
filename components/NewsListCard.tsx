import type { NewsArticle } from "@/lib/news";
import {
  buildInitials,
  formatArticleDate,
  getArticleCategory,
  getAuthorLabel,
} from "@/lib/news";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type NewsListCardProps = {
  article: NewsArticle;
  index: number;
  onPress: (article: NewsArticle) => void;
  variant?: "home" | "discover";
};

export default function NewsListCard({
  article,
  index,
  onPress,
  variant = "home",
}: NewsListCardProps) {
  const compact = variant === "discover";
  const category = getArticleCategory(article, index);
  const author = getAuthorLabel(article.author);

  return (
    <Pressable
      onPress={() => onPress(article)}
      style={({ pressed }) => [
        styles.row,
        compact ? styles.rowCompact : styles.rowHome,
        pressed && styles.rowPressed,
      ]}
    >
      {article.urlToImage ? (
        <Image
          resizeMode="cover"
          source={{ uri: article.urlToImage }}
          style={[styles.thumb, compact ? styles.thumbCompact : styles.thumbHome]}
        />
      ) : (
        <View
          style={[styles.thumb, compact ? styles.thumbCompact : styles.thumbHome]}
        >
          <LinearGradient
            colors={["#dbeafe", "#eff6ff"]}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.placeholderThumbText}>{category}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.categoryText}>{category}</Text>
        <Text
          numberOfLines={compact ? 3 : 2}
          style={[styles.title, compact && styles.titleCompact]}
        >
          {article.title ?? "Untitled article"}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.authorWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{buildInitials(author)}</Text>
            </View>
            <Text numberOfLines={1} style={styles.authorText}>
              {author}
            </Text>
          </View>

          <Text style={styles.dateText}>{formatArticleDate(article.publishedAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  authorText: {
    color: "#98A2B3",
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  authorWrap: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 8,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    borderRadius: 999,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  avatarText: {
    color: "#667085",
    fontSize: 9,
    fontWeight: "700",
  },
  categoryText: {
    color: "#98A2B3",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    gap: 5,
    justifyContent: "center",
  },
  dateText: {
    color: "#98A2B3",
    fontSize: 13,
    fontWeight: "500",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginTop: 2,
  },
  placeholderThumbText: {
    color: "#1D4ED8",
    fontSize: 15,
    fontWeight: "800",
  },
  row: {
    alignItems: "center",
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 14,
  },
  rowCompact: {
    paddingVertical: 10,
  },
  rowHome: {
    paddingVertical: 4,
  },
  rowPressed: {
    opacity: 0.84,
  },
  thumb: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbCompact: {
    height: 108,
    width: 108,
  },
  thumbHome: {
    height: 98,
    width: 98,
  },
  title: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 21,
  },
  titleCompact: {
    fontSize: 16,
    lineHeight: 23,
  },
});
