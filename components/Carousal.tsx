import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Article {
  title: string;
  description: string;
  urlToImage: string;
  author: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface Props {
  articles: Article[];
  autoPlay?: boolean;
  interval?: number; // ms
}

const SPACING = 10;
const ITEM_WIDTH = width * 0.85; // 👈 creates peek
const SIDE_SPACING = (width - ITEM_WIDTH) / 2;

const NewsCarousel: React.FC<Props> = ({
  articles,
  autoPlay = false,
  interval = 3000,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || articles.length === 0) return;

    const timer = setInterval(() => {
      const nextIndex =
        activeIndex === articles.length - 1 ? 0 : activeIndex + 1;

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * (ITEM_WIDTH + SPACING),
        animated: true,
      });

      setActiveIndex(nextIndex);
    }, interval);

    return () => clearInterval(timer);
  }, [activeIndex, autoPlay, interval]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / (ITEM_WIDTH + SPACING),
    );
    setActiveIndex(index);
  };

  const renderItem = ({ item }: { item: Article }) => (
    <View
      style={{
        width: ITEM_WIDTH,
        height: 200,
        marginRight: SPACING,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <ImageBackground source={{ uri: item.urlToImage }} style={{ flex: 1 }}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            padding: 12,
          }}
        >
          {/* Meta */}
          <Text style={{ color: "#ddd", fontSize: 12 }}>
            {item.source.name} •{" "}
            {new Date(item.publishedAt).toLocaleDateString()}
          </Text>

          {/* Title */}
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              marginTop: 4,
            }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </View>
  );

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={articles}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{
          paddingHorizontal: SIDE_SPACING, // 👈 centers first & last
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Pagination */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        {articles.map((_, index) => (
          <View
            key={index}
            style={{
              height: 6,
              width: activeIndex === index ? 16 : 6,
              borderRadius: 3,
              backgroundColor: activeIndex === index ? "#3b82f6" : "#ccc",
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default NewsCarousel;
