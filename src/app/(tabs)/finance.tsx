// src/app/(tabs)/schools.tsx
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Schools() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center">
      <Text className="text-[#F5F1E8] text-lg font-bold">Schools</Text>
    </SafeAreaView>
  );
}