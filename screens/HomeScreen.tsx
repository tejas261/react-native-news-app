import Carousal from "@/components/Carousal";
import RecommendedNews from "@/components/RecommendedNews";
import axios from "axios";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export type HomeScreenHandle = {
  getRecommendedArticles: (pageNum: number, query?: string) => Promise<void>;
};

type HomeScreenProps = {};

const HomeScreen = forwardRef<HomeScreenHandle, HomeScreenProps>(
  (_props, ref) => {
    const [topHeadlines, setTopHeadlines] = useState<any[]>([]);
    const [recommendedArticles, setRecommendedArticles] = useState<any[]>([]);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch Carousal Data (Static once)
    const getTopHeadlines = useCallback(async (): Promise<void> => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_NEWS_BASE_URL}/v2/top-headlines`,
          {
            params: {
              country: "us",
              apiKey: process.env.EXPO_PUBLIC_NEWS_API_KEY,
            },
          },
        );
        setTopHeadlines(res.data.articles);
      } catch (error) {
        console.error(error);
      }
    }, []);

    // Track current query and request ids to avoid race conditions
    const currentQueryRef = useRef<string | undefined>(undefined);
    const requestIdRef = useRef(0);

    // Fetch Paginated Articles (supports search and pagination)
    const getRecommendedArticles = useCallback(
      async (pageNum: number, query?: string): Promise<void> => {
        // Allow a new search to preempt current loading, but block extra pagination calls while loading
        const normalizedQuery = query?.trim() || undefined;
        if (!normalizedQuery && loading) return;

        const isNewQuery = normalizedQuery !== currentQueryRef.current;
        const nextPage = isNewQuery ? 1 : pageNum;
        if (isNewQuery) {
          currentQueryRef.current = normalizedQuery;
          setRecommendedArticles([]); // reset list for a new search
          setPage(1);
        }

        const myRequestId = ++requestIdRef.current;
        setLoading(true);
        try {
          const params: Record<string, any> = {
            apiKey: process.env.EXPO_PUBLIC_NEWS_API_KEY,
            sortBy: "popularity",
            page: nextPage,
            pageSize: 10,
            domains: "techcrunch.com,thenextweb.com",
          };
          if (currentQueryRef.current) params.q = currentQueryRef.current;

          const res = await axios.get(
            `${process.env.EXPO_PUBLIC_NEWS_BASE_URL}/v2/everything`,
            { params },
          );

          // Ignore stale responses
          if (myRequestId !== requestIdRef.current) return;

          setRecommendedArticles((prev) =>
            isNewQuery ? res.data.articles : [...prev, ...res.data.articles],
          );
          setPage(nextPage);
        } catch (error) {
          console.error(error);
        } finally {
          // Only clear loading for the latest request
          if (myRequestId === requestIdRef.current) setLoading(false);
        }
      },
      [loading],
    );

    useImperativeHandle(ref, () => ({ getRecommendedArticles }), [
      getRecommendedArticles,
    ]);

    const didInit = useRef(false);
    useEffect(() => {
      if (didInit.current) return;
      didInit.current = true;
      getTopHeadlines();
      getRecommendedArticles(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Header content (Everything above the list)
    const renderHeader = () => (
      <View>
        <View
          style={{ paddingTop: 0 }}
          className="flex p-5 justify-between items-center w-full flex-row"
        >
          <Text className="text-xl font-semibold">Breaking News!</Text>
          <Text className="text-blue-500 font-semibold">View all</Text>
        </View>
        <Carousal articles={topHeadlines} autoPlay />
        <View
          style={{ paddingBottom: 6 }}
          className="flex p-5 pt-0 justify-between items-center w-full flex-row"
        >
          <Text className="text-xl font-semibold">Recommended articles</Text>
        </View>
      </View>
    );

    return (
      <View className="flex-1">
        {renderHeader()}
        <FlatList
          data={recommendedArticles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View>
              <RecommendedNews
                src={item.urlToImage}
                title={item.title}
                author={item.author}
                publishedAt={item.publishedAt}
              />
            </View>
          )}
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" /> : null
          }
          onEndReached={() => getRecommendedArticles(page + 1)}
          onEndReachedThreshold={0.5}
        />
      </View>
    );
  },
);

HomeScreen.displayName = "HomeScreen";

export default HomeScreen;
