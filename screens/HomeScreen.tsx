import Carousal from "@/components/Carousal";
import RecommendedNews from "@/components/RecommendedNews";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

const HomeScreen = () => {
  const [topHeadlines, setTopHeadlines] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch Carousal Data (Static once)
  const getTopHeadlines = async () => {
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
  };

  // Fetch Paginated Articles
  const getRecommendedArticles = async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_NEWS_BASE_URL}/v2/everything`,
        {
          params: {
            apiKey: process.env.EXPO_PUBLIC_NEWS_API_KEY,
            sortBy: "popularity",
            page: pageNum,
            pageSize: 10,
            domains: "techcrunch.com,thenextweb.com",
          },
        },
      );
      // Append new articles to existing ones
      setRecommendedArticles((prev) => [...prev, ...res.data.articles]);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTopHeadlines();
    getRecommendedArticles(1);
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
              description={item.description}
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
};

export default HomeScreen;
