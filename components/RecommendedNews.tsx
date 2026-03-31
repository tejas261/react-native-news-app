import React from "react";
import { Image, Text, View } from "react-native";

interface NewsProps {
  src: string;
  title: string;
  description: string;
}

const RecommendedNews = ({ src, title, description }: NewsProps) => {
  return (
    <View className="flex flex-row justify-between gap-5 items-start w-full p-5">
      <Image source={{ uri: src }} className="w-40 h-36 rounded-xl" />
      <View className="flex flex-col items-start flex-1 shrink">
        <Text className="line-clamp-3 font-semibold text-xl">{title}</Text>
        <Text className="line-clamp-3 text-sm">{description}</Text>
      </View>
    </View>
  );
};

export default RecommendedNews;
