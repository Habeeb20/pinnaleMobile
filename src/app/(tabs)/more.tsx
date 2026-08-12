// // src/app/(tabs)/more.tsx
// import { View, Text, Pressable, ScrollView } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import { ChevronRight, LogOut } from "lucide-react-native";
// import { useAuth } from "@/lib/auth-context";
// import { ROLE_MORE_ITEMS } from "@/lib/role-nav-config";
//
// export default function More() {
//   const { user, logout } = useAuth();
//   const router = useRouter();
//   const items = ROLE_MORE_ITEMS[user?.role || "admin"] || [];
//
//   const handleLogout = async () => {
//     await logout();
//     router.replace("/(auth)");
//   };
//
//   return (
//     <SafeAreaView className="flex-1 bg-[#0B1220]">
//       <ScrollView contentContainerStyle={{ padding: 24 }}>
//         <Text className="text-[#F5F1E8] text-2xl font-bold mb-6">More</Text>
//
//         <View className="rounded-2xl bg-[#141F35] border border-[#22304A] overflow-hidden mb-6">
//           {items.map((item, i) => (
//             <Pressable
//               key={item.route}
//               className={`flex-row items-center justify-between px-5 py-4 active:bg-[#1A2540] ${
//                 i !== items.length - 1 ? "border-b border-[#22304A]" : ""
//               }`}
//             >
//               <Text className="text-[#F5F1E8] text-sm font-medium">{item.label}</Text>
//               <ChevronRight size={18} color="#5A6379" />
//             </Pressable>
//           ))}
//         </View>
//
//         <Pressable
//           onPress={handleLogout}
//           className="flex-row items-center justify-center gap-2 py-4 rounded-2xl border border-[#3A2323] bg-[#1A1215]"
//         >
//           <LogOut size={18} color="#E8877A" />
//           <Text className="text-[#E8877A] font-semibold">Log Out</Text>
//         </Pressable>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }





// src/app/(tabs)/more.tsx
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight,LogOut } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { ROLE_MORE_ITEMS } from "@/lib/role-nav-config";

export default function More() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const items = ROLE_MORE_ITEMS[user?.role || "admin"] || [];

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text className="text-[#F5F1E8] text-2xl font-bold mb-6">More</Text>

        <View className="rounded-2xl bg-[#141F35] border border-[#22304A] overflow-hidden mb-6">
          {items.map((item, i) => (
            <Pressable
              key={item.route}
        onPress={() => router.push(`/more-detail/${item.route}` as any)}
              className={`flex-row items-center justify-between px-5 py-4 active:bg-[#1A2540] ${
                i !== items.length - 1 ? "border-b border-[#22304A]" : ""
              }`}
            >
              <Text className="text-[#F5F1E8] text-sm font-medium">{item.label}</Text>
              <ChevronRight size={18} color="#5A6379" />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-2 py-4 rounded-2xl border border-[#3A2323] bg-[#1A1215]"
        >
          <LogOut size={18} color="#E8877A" />
          <Text className="text-[#E8877A] font-semibold">Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}