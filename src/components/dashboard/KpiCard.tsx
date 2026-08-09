// components/dashboard/KpiCard.tsx
import { View, Text } from "react-native";

export default function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View
      className="rounded-2xl bg-[#141F35] border border-[#22304A] p-4"
      style={{ width: "31%" }}
    >
      <Text style={{ color }} className="text-xl font-bold">
        {value ?? 0}
      </Text>
      <Text className="text-[#8B93A7] text-xs mt-1">{label}</Text>
    </View>
  );
}