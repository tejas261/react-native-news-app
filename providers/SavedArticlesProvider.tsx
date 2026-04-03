import type { ArticleRouteParams, SavedArticle } from "@/lib/news";
import { createArticleId, toSavedArticle } from "@/lib/news";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "saved-articles-v1";

type SavedArticlesContextValue = {
  hydrated: boolean;
  isSaved: (article: ArticleRouteParams) => boolean;
  removeArticle: (article: ArticleRouteParams) => Promise<void>;
  savedArticles: SavedArticle[];
  saveArticle: (article: ArticleRouteParams) => Promise<void>;
  toggleArticle: (article: ArticleRouteParams) => Promise<boolean>;
};

const SavedArticlesContext = createContext<
  SavedArticlesContextValue | undefined
>(undefined);

const sortBySavedAt = (articles: SavedArticle[]) =>
  [...articles].sort((left, right) => right.savedAt.localeCompare(left.savedAt));

const mergeArticles = (existing: SavedArticle[], incoming: SavedArticle[]) => {
  const byId = new Map<string, SavedArticle>();

  [...existing, ...incoming].forEach((article) => {
    const current = byId.get(article.id);
    if (!current || current.savedAt < article.savedAt) {
      byId.set(article.id, article);
    }
  });

  return sortBySavedAt([...byId.values()]);
};

export function SavedArticlesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const savedArticlesRef = useRef<SavedArticle[]>([]);

  useEffect(() => {
    savedArticlesRef.current = savedArticles;
  }, [savedArticles]);

  useEffect(() => {
    let mounted = true;

    const loadSavedArticles = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw) as SavedArticle[];
        if (mounted && Array.isArray(parsed)) {
          setSavedArticles((currentArticles) => {
            const mergedArticles = mergeArticles(currentArticles, parsed);
            savedArticlesRef.current = mergedArticles;
            return mergedArticles;
          });
        }
      } catch (error) {
        console.error("Failed to load saved articles", error);
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    };

    void loadSavedArticles();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (nextArticles: SavedArticle[]) => {
    const sortedArticles = sortBySavedAt(nextArticles);
    savedArticlesRef.current = sortedArticles;
    setSavedArticles(sortedArticles);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sortedArticles));
  }, []);

  const isSaved = useCallback(
    (article: ArticleRouteParams) =>
      savedArticles.some((savedArticle) => savedArticle.id === createArticleId(article)),
    [savedArticles],
  );

  const saveArticle = useCallback(
    async (article: ArticleRouteParams) => {
      const nextArticle = toSavedArticle(article);
      const existingArticles = savedArticlesRef.current.filter(
        (savedArticle) => savedArticle.id !== nextArticle.id,
      );
      await persist([nextArticle, ...existingArticles]);
    },
    [persist],
  );

  const removeArticle = useCallback(
    async (article: ArticleRouteParams) => {
      const articleId = createArticleId(article);
      await persist(
        savedArticlesRef.current.filter(
          (savedArticle) => savedArticle.id !== articleId,
        ),
      );
    },
    [persist],
  );

  const toggleArticle = useCallback(
    async (article: ArticleRouteParams) => {
      const alreadySaved = savedArticlesRef.current.some(
        (savedArticle) => savedArticle.id === createArticleId(article),
      );

      if (alreadySaved) {
        await removeArticle(article);
        return false;
      }

      await saveArticle(article);
      return true;
    },
    [removeArticle, saveArticle],
  );

  const value = useMemo(
    () => ({
      hydrated,
      isSaved,
      removeArticle,
      savedArticles,
      saveArticle,
      toggleArticle,
    }),
    [hydrated, isSaved, removeArticle, savedArticles, saveArticle, toggleArticle],
  );

  return (
    <SavedArticlesContext.Provider value={value}>
      {children}
    </SavedArticlesContext.Provider>
  );
}

export const useSavedArticles = () => {
  const context = useContext(SavedArticlesContext);

  if (!context) {
    throw new Error(
      "useSavedArticles must be used within a SavedArticlesProvider",
    );
  }

  return context;
};
