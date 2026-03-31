import Header from "@/components/Header";
import HomeScreen from "@/screens/HomeScreen";
import { View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1">
      <Header />
      <HomeScreen />
    </View>
  );
}
