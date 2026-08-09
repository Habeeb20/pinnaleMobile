// src/app/(auth)/login.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
  console.log("Status:", res.status);
      const data = await res.json();
console.log("Response body:", JSON.stringify(data, null, 2));
      if (!res.ok) {
        setError(data.message || "Couldn't log you in. Check your details and try again.");
        return;
      }

      await SecureStore.setItemAsync("token", data.token);
      router.replace("/(tabs)");
    } catch (err) {
      setError("Can't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="absolute -top-16 -right-20 w-56 h-56 rounded-full bg-[#D4AF37] opacity-[0.05]" />

          <View className="flex-1 px-8 pt-16 justify-between pb-8">
            {/* Header */}
            <View>
              <View className="w-14 h-14 rounded-full border-[1.5px] border-[#D4AF37] bg-[#141F35] items-center justify-center mb-8">
                <Text className="text-[#D4AF37] text-xl font-bold">P</Text>
              </View>

              <Text className="text-[#F5F1E8] text-3xl font-bold mb-2">
                Welcome back
              </Text>
              <Text className="text-[#8B93A7] text-base mb-10">
                Log in to continue to your dashboard
              </Text>

              {/* Form */}
              <View className="gap-4">
                <View>
                  <Text className="text-[#8B93A7] text-xs uppercase tracking-[1.5px] mb-2">
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@school.edu"
                    placeholderTextColor="#4A5470"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="bg-[#141F35] text-[#F5F1E8] text-base rounded-xl px-4 py-4 border border-[#22304A]"
                  />
                </View>

                <View>
                  <Text className="text-[#8B93A7] text-xs uppercase tracking-[1.5px] mb-2">
                    Password
                  </Text>
                  <View className="flex-row items-center bg-[#141F35] rounded-xl border border-[#22304A]">
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#4A5470"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      className="flex-1 text-[#F5F1E8] text-base px-4 py-4"
                    />
                    <Pressable
                      onPress={() => setShowPassword((s) => !s)}
                      className="px-4"
                    >
                      <Text className="text-[#D4AF37] text-xs font-semibold">
                        {showPassword ? "HIDE" : "SHOW"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {error ? (
                  <Text className="text-[#E8877A] text-sm">{error}</Text>
                ) : null}

                <Pressable className="self-end">
                  <Text className="text-[#D4AF37] text-sm font-medium">
                    Forgot password?
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Footer */}
            <View className="gap-4 mb-18">
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                className="bg-[#D4AF37] active:bg-[#E8C766] rounded-2xl py-[17px] shadow-lg shadow-[#D4AF37]/40 flex-row items-center justify-center"
              >
                {loading ? (
                  <ActivityIndicator color="#0B1220" />
                ) : (
                  <Text className="text-[#0B1220] text-center text-base font-bold">
                    Log In
                  </Text>
                )}
              </Pressable>

              <View className="flex-row justify-center">
                <Text className="text-[#5A6379] text-sm">
                  Don't have an account?{" "}
                </Text>
                <Link href="/(auth)/register" asChild>
                  <Pressable>
                    <Text className="text-[#D4AF37] text-sm font-semibold">
                      Create one
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}