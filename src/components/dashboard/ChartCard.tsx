// components/dashboard/ChartCard.tsx
import { View, Text } from "react-native";
import { ReactNode } from "react";

export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="rounded-2xl bg-[#141F35] border border-[#22304A] p-4 mb-4">
      <Text className="text-[#F5F1E8] text-sm font-bold mb-3">{title}</Text>
      {children}
    </View>
  );
}