import { LinearGradient } from "expo-linear-gradient";
import type { ArticleRouteParams } from "@/lib/news";
import { useSavedArticles } from "@/providers/SavedArticlesProvider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  ChevronLeft,
  Ellipsis,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ArticleProps = ArticleRouteParams;

const sanitizeArticleText = (value?: string) => {
  if (!value) return undefined;

  const cleaned = value
    .replace(/\[\+\d+\schars\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 0 ? cleaned : undefined;
};

const formatRelativeTime = (value?: string) => {
  if (!value) return "Updated recently";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Updated recently";

  const diffMs = Date.now() - timestamp;
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const formatPublishDate = (value?: string) => {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const buildInitials = (value?: string) => {
  if (!value) return "NW";

  const words = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) return "NW";

  return words
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const Article = ({
  title,
  description,
  content,
  imageUrl,
  author,
  publishedAt,
  sourceName,
  url,
}: ArticleProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSaved, toggleArticle } = useSavedArticles();
  const [savePending, setSavePending] = React.useState(false);

  const cleanDescription = sanitizeArticleText(description);
  const cleanContent = sanitizeArticleText(content);
  const articleDetails = React.useMemo(
    () => ({
      author,
      content,
      description,
      imageUrl,
      publishedAt,
      sourceName,
      title,
      url,
    }),
    [author, content, description, imageUrl, publishedAt, sourceName, title, url],
  );
  const bodyParagraphs = [cleanDescription, cleanContent].filter(
    (paragraph, index, paragraphs) =>
      Boolean(paragraph) && paragraphs.indexOf(paragraph) === index,
  ) as string[];
  const heroMeta = ["Trending", formatRelativeTime(publishedAt)].join(" • ");
  const byline = [author ? `By ${author}` : undefined, formatPublishDate(publishedAt)]
    .filter(Boolean)
    .join(" • ");
  const saved = isSaved(articleDetails);

  const openOriginalArticle = () => {
    if (!url) return;
    void Linking.openURL(url);
  };

  const shareArticle = () => {
    if (!url && !title) return;

    const message = url
      ? `${title ? `${title}\n` : ""}${url}`
      : String(title ?? "");

    void Share.share({
      message,
      url,
      title,
    });
  };

  const handleToggleSaved = () => {
    if (savePending) return;

    setSavePending(true);
    void toggleArticle(articleDetails).finally(() => {
      setSavePending(false);
    });
  };

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        className="flex-1 bg-[#080808]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          {imageUrl ? (
            <ImageBackground
              source={{ uri: imageUrl }}
              resizeMode="cover"
              style={StyleSheet.absoluteFillObject}
            />
          ) : (
            <LinearGradient
              colors={["#36536b", "#1f2937", "#09090b"]}
              style={StyleSheet.absoluteFillObject}
            />
          )}

          <LinearGradient
            colors={[
              "rgba(12, 18, 28, 0.16)",
              "rgba(9, 13, 20, 0.24)",
              "rgba(8, 8, 8, 0.92)",
            ]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={[styles.heroContent, { paddingTop: insets.top + 12 }]}>
            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                style={styles.actionButton}
              >
                <ChevronLeft color="#FFFFFF" size={22} />
              </Pressable>

              <View style={styles.actionGroup}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    savePending
                      ? "Saving article"
                      : saved
                        ? "Remove saved article"
                        : "Save article"
                  }
                  disabled={savePending}
                  onPress={handleToggleSaved}
                  style={[
                    styles.actionButton,
                    saved && styles.savedActionButton,
                    savePending && styles.disabledAction,
                  ]}
                >
                  {savePending ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Bookmark
                      color="#FFFFFF"
                      fill={saved ? "#FFFFFF" : "transparent"}
                      size={20}
                    />
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Share article"
                  disabled={!url && !title}
                  onPress={shareArticle}
                  style={[
                    styles.actionButton,
                    !url && !title && styles.disabledAction,
                  ]}
                >
                  <Ellipsis color="#FFFFFF" size={20} />
                </Pressable>
              </View>
            </View>

            <View style={styles.heroTextBlock}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>News</Text>
              </View>

              {title ? (
                <Text style={styles.headlineText}>{title}</Text>
              ) : null}

              <Text style={styles.heroMetaText}>{heroMeta}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom + 24, 32),
            },
          ]}
        >
          <View style={styles.sourceRow}>
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>
                {buildInitials(sourceName)}
              </Text>
            </View>

            <View style={styles.sourceCopy}>
              <View style={styles.sourceNameRow}>
                <Text style={styles.sourceNameText}>
                  {sourceName || "News Wire"}
                </Text>
                <BadgeCheck color="#3182F6" fill="#3182F6" size={18} />
              </View>

              {byline ? (
                <Text style={styles.sourceMetaText}>{byline}</Text>
              ) : null}
            </View>
          </View>

          {bodyParagraphs.length > 0 ? (
            bodyParagraphs.map((paragraph, index) => (
              <Text key={`${paragraph}-${index}`} style={styles.bodyText}>
                {paragraph}
              </Text>
            ))
          ) : (
            <Text style={styles.bodyText}>
              This article preview does not include a body, but the full story
              is available from the original publisher.
            </Text>
          )}

          {url ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Read full article"
              className="flex-row items-center justify-center"
              onPress={openOriginalArticle}
              style={styles.readButton}
            >
              <Text style={styles.readButtonText}>Read full article</Text>
              <ArrowUpRight color="#FFFFFF" size={18} />
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  actionGroup: {
    flexDirection: "row",
    gap: 12,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bodyText: {
    color: "#262626",
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 31,
  },
  disabledAction: {
    opacity: 0.45,
  },
  headlineText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: -1.2,
    lineHeight: 42,
  },
  hero: {
    height: 560,
    overflow: "hidden",
    position: "relative",
  },
  heroContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 112,
    paddingHorizontal: 22,
  },
  heroMetaText: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 16,
    fontWeight: "500",
  },
  heroTextBlock: {
    gap: 14,
  },
  readButton: {
    backgroundColor: "#111827",
    borderRadius: 999,
    gap: 10,
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  readButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  savedActionButton: {
    backgroundColor: "#3182F6",
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  scrollContent: {
    backgroundColor: "#080808",
  },
  sheet: {
    backgroundColor: "#F7F3EE",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    gap: 24,
    marginTop: -72,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  sourceBadge: {
    alignItems: "center",
    backgroundColor: "#C62828",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  sourceBadgeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  sourceCopy: {
    flex: 1,
    gap: 4,
  },
  sourceMetaText: {
    color: "#78716C",
    fontSize: 13,
    fontWeight: "500",
  },
  sourceNameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  sourceNameText: {
    color: "#171717",
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  sourceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: "#3182F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Article;
