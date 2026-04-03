import { Timer, UserRound } from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";

interface NewsProps {
  src: string;
  title: string;
  author: string;
  publishedAt: string;
}

const RecommendedNews = ({ src, title, author, publishedAt }: NewsProps) => {
  return (
    <View className="flex flex-row justify-between gap-5 items-start w-full flex-1 p-5">
      <Image source={{ uri: src }} className="w-40 h-36 rounded-xl" />
      <View className="flex flex-col justify-evenly h-full items-start flex-1 shrink">
        <Text className="line-clamp-3 font-semibold text-xl">{title}</Text>

        <View className="flex flex-row justify-between items-center w-full gap-2">
          <View className="flex flex-row justify-between items-center w-fit gap-1.5">
            <UserRound size={16} />
            <Text className="text-sm max-w-24 line-clamp-2 truncate text-wrap">
              {author || "Anonymous"}
            </Text>
          </View>
          <View className="flex flex-row justify-between items-center w-fit gap-1.5">
            <Timer size={16} />
            <Text className="text-sm text-gray-500">
              {new Date(publishedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RecommendedNews;
