// components/dashboards/DashboardStates.tsx
import { View, Text, Pressable, ActivityIndicator } from "react-native";

export function DashboardLoading() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color="#D4AF37" size="large" />
    </View>
  );
}

export function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-[#E8877A] text-center mb-4">{message}</Text>
      <Pressable onPress={onRetry} className="px-5 py-2.5 rounded-full border border-[#D4AF37]">
        <Text className="text-[#D4AF37] text-sm font-semibold">Retry</Text>
      </Pressable>
    </View>
  );
}