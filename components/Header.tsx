import type { HomeScreenHandle } from "@/screens/HomeScreen";
import { debounce } from "lodash";
import { ChevronRight, Search } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type HeaderProps = {
  homeRef: React.RefObject<HomeScreenHandle | null>;
};

const Header: React.FC<HeaderProps> = ({ homeRef }) => {
  const [showInput, setShowInput] = useState(false);
  const [query, setQuery] = useState("");

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      homeRef.current && homeRef.current.getRecommendedArticles(1, searchQuery);
    }, 500),
    [homeRef],
  );

  const handleSearch = (value?: string | number) => {
    setQuery(String(value));
    debouncedSearch(query);
  };

  return (
    <View className="flex flex-row items-center p-5 justify-between w-full">
      <Text className="text-xl font-semibold text-gray-700">News TV</Text>

      <View className="flex relative flex-row gap-4 items-center justify-between w-fit">
        {showInput && (
          <TextInput
            className="border border-gray-300 w-64 pl-4 pr-10 h-12 rounded-full"
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
            placeholder="Search articles"
          />
        )}

        <Pressable
          className="absolute right-2 border-0"
          onPress={() => {
            if (showInput) {
              handleSearch();
            }
            setShowInput(!showInput);
          }}
        >
          {showInput ? <ChevronRight /> : <Search />}
        </Pressable>
      </View>
    </View>
  );
};

export default Header;
