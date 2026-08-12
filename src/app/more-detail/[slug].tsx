// src/app/more/[slug].tsx
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import {MORE_SCREEN_REGISTRY} from "@/lib/more-screen-registry"
// Human-readable titles for each slug — mirrors your ROLE_MORE_ITEMS labels
const SLUG_TITLES: Record<string, string> = {
  "plans": "Subscription Plans",
  "create-admin": "Create Admin",
  "create-teacher": "Create Teacher",
  "create-student": "Add Student",
  "manage-users": "Manage Users",
  "exam-timetable": "Exam Timetable",
  "cbt-analytics": "CBT Analytics",
  "announcements": "Announcements",
  "library": "Library",
  "hostel": "Hostel Management",
  "transport": "Transport",
  "attendance": "Attendance",
  "lesson-notes": "Lesson Notes",
  "exam-questions": "Exam Questions",
  "timetable": "Timetable",
  "reports": "Reports",
  "my-id": "Digital Card",
  "add-score": "Add Scores",
  "create-test": "Create CBT",
  "virtual-class": "Virtual Class",
  "upload-lesson-note": "Upload Lesson Note",
  "my-payroll": "My Payroll",
  "request": "Request Leave",
  "group-chat": "Group Chat",
  "test-cbt": "Test CBT",
  "my-classes": "My Classes",
  "report-cards": "Report Cards",
  "hostel-info": "Hostel",
  "profile": "Profile",
  "messages": "Send Message",
  "payroll": "Payroll",
};

export default function MoreDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const title = SLUG_TITLES[slug] || "Coming Soon";
  const ScreenComponent = MORE_SCREEN_REGISTRY[slug];


  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center px-5 pt-4 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#141F35] border border-[#22304A] items-center justify-center"
        >
          <ArrowLeft size={18} color="#F5F1E8" />
        </Pressable>
        <Text className="text-[#F5F1E8] text-lg font-bold ml-4">{title}</Text>
      </View>

      {ScreenComponent ? (
          <ScreenComponent />
          ): (
                      <View className="flex-1 items-center justify-center px-8">
                        <Text className="text-[#5A6379] text-sm text-center">
                          {title} screen coming soon.
                        </Text>
                      </View>

              )}


    </SafeAreaView>
  );
}