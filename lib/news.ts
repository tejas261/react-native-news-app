import axios from "axios";

export type NewsArticle = {
  title?: string | null;
  description?: string | null;
  content?: string | null;
  urlToImage?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  source?: {
    name?: string | null;
  } | null;
  url?: string | null;
};

export type ArticleRouteParams = {
  title?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  author?: string;
  publishedAt?: string;
  sourceName?: string;
  url?: string;
};

export type SavedArticle = ArticleRouteParams & {
  id: string;
  savedAt: string;
};

export const DISCOVER_CATEGORIES = [
  "All",
  "Politics",
  "Sport",
  "Education",
  "Gaming",
  "World",
] as const;

type DiscoverCategory = (typeof DISCOVER_CATEGORIES)[number];

const API_BASE_URL = process.env.EXPO_PUBLIC_NEWS_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

const ensureConfig = () => {
  if (!API_BASE_URL || !API_KEY) {
    throw new Error("Missing news API configuration");
  }
};

const requestArticles = async (
  path: string,
  params: Record<string, string | number | undefined>,
) => {
  ensureConfig();

  const response = await axios.get(`${API_BASE_URL}${path}`, {
    params: {
      apiKey: API_KEY,
      ...params,
    },
  });

  return (response.data?.articles ?? []) as NewsArticle[];
};

export const fetchTopHeadlines = () =>
  requestArticles("/v2/top-headlines", {
    country: "us",
    pageSize: 6,
  });

export const fetchRecommendedArticles = (page = 1) =>
  requestArticles("/v2/everything", {
    q: "breaking news OR world OR innovation",
    language: "en",
    sortBy: "publishedAt",
    page,
    pageSize: 8,
  });

export const fetchDiscoverArticles = ({
  category,
  query,
  page = 1,
}: {
  category: DiscoverCategory;
  query?: string;
  page?: number;
}) => {
  const trimmedQuery = query?.trim();
  const categoryQuery = category === "All" ? undefined : category;
  const combinedQuery = [trimmedQuery, categoryQuery]
    .filter(Boolean)
    .join(" ");

  if (!combinedQuery) {
    return requestArticles("/v2/top-headlines", {
      country: "us",
      page,
      pageSize: 18,
    });
  }

  return requestArticles("/v2/everything", {
    q: combinedQuery,
    language: "en",
    sortBy: "publishedAt",
    page,
    pageSize: 18,
  });
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Education: [
    "education",
    "school",
    "student",
    "teacher",
    "college",
    "university",
  ],
  Gaming: ["game", "gaming", "xbox", "playstation", "nintendo", "esports"],
  Politics: ["politic", "senate", "congress", "election", "minister"],
  Sport: ["sport", "football", "soccer", "basketball", "tennis", "olympic"],
  World: ["world", "global", "international", "country", "border", "war"],
};

export const getArticleCategory = (
  article: NewsArticle,
  index = 0,
): Exclude<DiscoverCategory, "All"> => {
  const haystack = `${article.title ?? ""} ${article.description ?? ""}`.toLowerCase();
  const matchedCategory = Object.entries(CATEGORY_KEYWORDS).find(([, keywords]) =>
    keywords.some((keyword) => haystack.includes(keyword)),
  )?.[0] as Exclude<DiscoverCategory, "All"> | undefined;

  if (matchedCategory) return matchedCategory;

  const rotation: Exclude<DiscoverCategory, "All">[] = [
    "Sport",
    "Politics",
    "Education",
    "World",
    "Gaming",
  ];

  return rotation[index % rotation.length];
};

export const formatRelativeTime = (value?: string | null) => {
  if (!value) return "Just now";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Just now";

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return formatArticleDate(value);
};

export const formatArticleDate = (value?: string | null) => {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const getAuthorLabel = (value?: string | null) => {
  if (!value) return "News Desk";
  return value;
};

export const buildInitials = (value?: string | null) => {
  const words = String(value ?? "News Desk")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  return words.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export const createArticleId = (article: ArticleRouteParams) => {
  const url = article.url?.trim();
  if (url) return url;

  return [
    article.title?.trim() ?? "",
    article.publishedAt?.trim() ?? "",
    article.sourceName?.trim() ?? "",
  ].join("::");
};

export const toSavedArticle = (article: ArticleRouteParams): SavedArticle => ({
  ...article,
  id: createArticleId(article),
  savedAt: new Date().toISOString(),
});

export const toArticleParams = (article: NewsArticle): ArticleRouteParams => ({
  title: article.title ?? "",
  description: article.description ?? "",
  content: article.content ?? "",
  imageUrl: article.urlToImage ?? "",
  author: article.author ?? "",
  publishedAt: article.publishedAt ?? "",
  sourceName: article.source?.name ?? "",
  url: article.url ?? "",
});
