import { ChevronRight, Search } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const Header = () => {
  const [showInput, setShowInput] = useState(false);
  return (
    <View className="flex flex-row items-center p-5 pb-0 justify-between w-full">
      <Text className="text-xl font-semibold text-gray-700">News TV</Text>

      <View className="flex relative flex-row gap-4 items-center justify-between w-fit">
        {showInput && (
          <TextInput className="border border-gray-300 w-64 pl-4 pr-10 h-12 rounded-full" />
        )}

        <Pressable
          className="absolute right-2 border-0"
          onPress={() => setShowInput(!showInput)}
        >
          {showInput ? <ChevronRight /> : <Search />}
        </Pressable>
      </View>
    </View>
  );
};

export default Header;
