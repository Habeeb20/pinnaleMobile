// src/app/(auth)/index.tsx
import { View, Text, Pressable, StatusBar } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLanding() {
  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      {/* Ambient glow accents */}
      <View className="absolute -top-20 -right-16 w-60 h-60 rounded-full bg-[#D4AF37] opacity-[0.06]" />
      <View className="absolute bottom-16 -left-20 w-52 h-52 rounded-full bg-[#D4AF37] opacity-[0.04]" />

      <View className="flex-1 px-8 justify-between py-10">
        {/* Top: brand mark */}
        <View className="items-center mt-16">
          <View className="w-[84px] h-[84px] rounded-full border-[1.5px] border-[#D4AF37] bg-[#141F35] items-center justify-center mb-6">
            <Text className="text-[#D4AF37] text-3xl font-bold">P</Text>
          </View>

          <Text className="text-[#F5F1E8] text-3xl font-bold text-center tracking-wide">
            PinnacleHub
          </Text>
          <Text className="text-[#8B93A7] text-base text-center mt-2 px-6">
            School management, refined for every role in your institution
          </Text>
        </View>



        {/* Bottom: actions */}
        <View className="gap-8 mb-20">
          <Link href="/(auth)/login" asChild>
            <Pressable className="bg-[#D4AF37] active:bg-[#E8C766] rounded-2xl py-[17px] mt-2 shadow-lg shadow-[#D4AF37]/40">
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

          <Text className="text-[#5A6379] text-center text-xs mt-4">
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
      </View>
    </SafeAreaView>
  );
}