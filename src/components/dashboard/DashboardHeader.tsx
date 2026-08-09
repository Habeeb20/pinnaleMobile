// components/dashboards/DashboardHeader.tsx
import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";

const GOLD = "#D4AF37";

export default function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)");
  };

  return (
    <View className="px-6 pt-4 pb-3 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3 flex-1">
        {user?.profilePicture ? (
          <Image
            source={{ uri: user.profilePicture }}
            className="w-11 h-11 rounded-full"
            style={{ borderWidth: 1.5, borderColor: GOLD }}
          />
        ) : (
          <View className="w-11 h-11 rounded-full bg-[#141F35] border-[1.5px] border-[#D4AF37] items-center justify-center">
            <Text className="text-[#D4AF37] font-bold text-xs">{initials(user?.name)}</Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-[#F5F1E8] text-base font-bold" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-[#8B93A7] text-xs" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Pressable
        onPress={handleLogout}
        className="w-10 h-10 rounded-full bg-[#141F35] border border-[#22304A] items-center justify-center active:border-[#E8877A]"
      >
        <LogOut size={17} color="#E8877A" strokeWidth={2} />
      </Pressable>
    </View>
  );
}