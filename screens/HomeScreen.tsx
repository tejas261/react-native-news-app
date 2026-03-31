import Carousal from "@/components/Carousal";
import RecommendedNews from "@/components/RecommendedNews";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface RecommendedNewsProps {
  urlToImage: string;
  title: string;
  description: string;
}

const HomeScreen = () => {
  const [topHeadlines, setTopHeadlines] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  async function getTopHeadlines() {
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
    } catch (error: any) {
      throw new Error("Could not fetch topHeadlines", error);
    }
  }

  async function getRecommendedArticles() {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_NEWS_BASE_URL}/v2/everything`,
        {
          params: {
            apiKey: process.env.EXPO_PUBLIC_NEWS_API_KEY,
            sortBy: "popularity",
            page: 1,
            pageSize: 10,
            domains: "techcrunch.com,thenextweb.com",
          },
        },
      );
      setRecommendedArticles(res.data.articles);
    } catch (error: any) {
      throw new Error("Could not fetch topHeadlines", error);
    }
  }

  useEffect(() => {
    Promise.allSettled([getTopHeadlines(), getRecommendedArticles()]);
  }, []);

  return (
    <ScrollView>
      <View
        style={{ paddingTop: 0 }}
        className="flex p-5 justify-between items-center w-full flex-row"
      >
        <Text className="text-xl font-semibold">Breaking News!</Text>
        <Text className="text-blue-500 font-semibold">View all</Text>
      </View>
      <Carousal articles={topHeadlines} autoPlay />
      <View className="flex p-5 pt-0 justify-between items-center w-full flex-row">
        <Text className="text-xl font-semibold">Recommended articles</Text>
      </View>
      <View className="flex flex-col gap-5 p-5" style={{ paddingTop: 0 }}>
        {recommendedArticles.map((item: RecommendedNewsProps, i: number) => {
          return (
            <RecommendedNews
              key={i}
              src={item.urlToImage}
              title={item.title}
              description={item.description}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
