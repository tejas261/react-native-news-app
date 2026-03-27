import React from "react";
import { Image, Text, View } from "react-native";

interface NewsProps {
  src: string;
  title: string;
  description: string;
}

const RecommendedNews = ({ src, title, description }: NewsProps) => {
  return (
    <View className="flex flex-row justify-between items-center w-full">
      <Image source={{ uri: src }} />
      <View className="flex flex-col items-center justify-start">
        <Text>{title}</Text>
        <Text>{description}</Text>
      </View>
    </View>
  );
};

export default RecommendedNews;
