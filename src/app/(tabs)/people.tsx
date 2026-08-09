// src/app/(tabs)/people.tsx  (and grades.tsx, finance.tsx, library.tsx, schools.tsx — same pattern)
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function People() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center">
      <Text className="text-[#F5F1E8] text-lg font-bold">People</Text>
    </SafeAreaView>
  );
}