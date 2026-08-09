// // src/app/(auth)/index.tsx
// import { View, Text, Pressable, StatusBar } from "react-native";
// import { Link } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
//
// export default function AuthLanding() {
//   return (
//     <SafeAreaView className="flex-1 bg-[#0B1220]">
//       <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
//
//       {/* Ambient glow accents */}
//       <View className="absolute -top-20 -right-16 w-60 h-60 rounded-full bg-[#D4AF37] opacity-[0.06]" />
//       <View className="absolute bottom-16 -left-20 w-52 h-52 rounded-full bg-[#D4AF37] opacity-[0.04]" />
//
//       <View className="flex-1 px-8 justify-between py-10">
//         {/* Top: brand mark */}
//         <View className="items-center mt-16">
//           <View className="w-[84px] h-[84px] rounded-full border-[1.5px] border-[#D4AF37] bg-[#141F35] items-center justify-center mb-6">
//             <Text className="text-[#D4AF37] text-3xl font-bold">P</Text>
//           </View>
//
//           <Text className="text-[#F5F1E8] text-3xl font-bold text-center tracking-wide">
//             PinnacleHub
//           </Text>
//           <Text className="text-[#8B93A7] text-base text-center mt-2 px-6">
//             School management, refined for every role in your institution
//           </Text>
//         </View>
//
//
//
//         {/* Bottom: actions */}
//         <View className="gap-8 mb-20">
//           <Link href="/(auth)/login" asChild>
//             <Pressable className="bg-[#D4AF37] active:bg-[#E8C766] rounded-2xl py-[17px] mt-2 shadow-lg shadow-[#D4AF37]/40">
//               <Text className="text-[#0B1220] text-center text-base font-bold">
//                 Log In
//               </Text>
//             </Pressable>
//           </Link>
//
//           <Link href="/(auth)/register" asChild>
//             <Pressable className="bg-transparent rounded-2xl py-4 border-[1.5px] border-[#3A4560] active:border-[#E8C766]">
//               <Text className="text-[#F5F1E8] text-center text-base font-semibold">
//                 Create Account
//               </Text>
//             </Pressable>
//           </Link>
//
//         </View>
//
//           <Text className="text-[#5A6379] text-center text-xs mt-4">
//             By continuing, you agree to our Terms & Privacy Policy
//           </Text>
//       </View>
//     </SafeAreaView>
//   );
// }









// src/app/(auth)/index.tsx
import { View, Text, Pressable, StatusBar } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Users,
  BarChart3,
  CalendarCheck,
  Wallet,
  MessageCircle,
  GraduationCap,
} from "lucide-react-native";

const GOLD = "#D4AF37";
const NAVY_ELEVATED = "#141F35";

function FloatCard({
  icon,
  style,
}: {
  icon: React.ReactNode;
  style: any;
}) {
  return (
    <View
      style={style}
      className="absolute w-14 h-14 rounded-2xl bg-[#141F35] border border-[#2A3652] items-center justify-center"
    >
      {icon}
    </View>
  );
}

export default function AuthLanding() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      {/* Ambient glow */}
      <View className="absolute -top-24 left-1/2 -ml-32 w-64 h-64 rounded-full bg-[#D4AF37] opacity-[0.05]" />

      <View className="flex-1 px-7 pt-8 justify-between pb-8">
        {/* Icon collage */}
        <View className="items-center" style={{ height: 220 }}>
          <View style={{ width: 280, height: 220 }}>
            <FloatCard
              icon={<Users size={22} color={GOLD} strokeWidth={2} />}
              style={{ top: 8, left: 10, transform: [{ rotate: "-8deg" }] }}
            />
            <FloatCard
              icon={<BarChart3 size={22} color={GOLD} strokeWidth={2} />}
              style={{ top: 0, right: 6, transform: [{ rotate: "6deg" }] }}
            />
            <FloatCard
              icon={<CalendarCheck size={22} color={GOLD} strokeWidth={2} />}
              style={{ top: 96, left: -6, transform: [{ rotate: "5deg" }] }}
            />
            <FloatCard
              icon={<Wallet size={22} color={GOLD} strokeWidth={2} />}
              style={{ top: 100, right: -8, transform: [{ rotate: "-6deg" }] }}
            />
            <FloatCard
              icon={<MessageCircle size={22} color={GOLD} strokeWidth={2} />}
              style={{ top: 168, left: 30, transform: [{ rotate: "-4deg" }] }}
            />

            {/* Center emblem, larger, on top */}
            <View
              style={{
                position: "absolute",
                top: 60,
                left: 100,
                width: 80,
                height: 80,
              }}
              className="rounded-[28px] bg-[#D4AF37] items-center justify-center shadow-lg shadow-[#D4AF37]/50"
            >
              <GraduationCap size={38} color="#0B1220" strokeWidth={2} />
            </View>
          </View>
        </View>

        {/* Headline */}
        <View className="items-center px-2">
          <Text className="text-[#F5F1E8] text-[32px] font-bold text-center leading-9 mb-3">
            Run your school{"\n"}from one place
          </Text>
          <Text className="text-[#8B93A7] text-base text-center leading-6 px-4">
            Attendance, grades, fees, and communication —
            all in sync for admins, teachers, and parents
          </Text>
        </View>

        {/* Feature chips */}
        <View className="flex-row justify-center gap-2 flex-wrap">
          {["Attendance", "Grading", "Fee tracking", "Messaging"].map(
            (label) => (
              <View
                key={label}
                className="px-3 py-1.5 rounded-full bg-[#141F35] border border-[#22304A]"
              >
                <Text className="text-[#B9A46A] text-xs font-medium">
                  {label}
                </Text>
              </View>
            )
          )}
        </View>

        {/* Actions */}
        <View className="gap-3">
          <Link href="/(auth)/login" asChild>
            <Pressable className="bg-[#D4AF37] active:bg-[#E8C766] rounded-2xl py-[17px] shadow-lg shadow-[#D4AF37]/40">
              <Text className="text-[#0B1220] text-center text-base font-bold">
                Log In
              </Text>
            </Pressable>
          </Link>

          <Link href="/(auth)/register" asChild>
            <Pressable className="bg-transparent rounded-2xl py-4 border-[1.5px] border-[#3A4560] active:border-[#E8C766]">
              <Text className="text-[#F5F1E8] text-center text-base font-semibold">
                Create Account
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}