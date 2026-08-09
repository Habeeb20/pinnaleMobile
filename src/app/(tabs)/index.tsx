

// src/app/(tabs)/index.tsx
import { View, Text, ActivityIndicator, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";

import SuperadminDashboard from "@/components/dashboards/SuperadminDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import TeacherDashboard from "@/components/dashboards/TeacherDashboard";
import StudentDashboard from "@/components/dashboards/StudentDashboard";
// import AccountantDashboard from "@/components/dashboards/AccountantDashboard";
// import ParentDashboard from "@/components/dashboards/ParentDashboard";
// import LibrarianDashboard from "@/components/dashboards/LibrarianDashboard";

export default function Dashboard() {
  const { user, token } = useAuth();

  if (token === undefined || !user) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center">
        <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
        <ActivityIndicator color="#D4AF37" size="large" />
      </SafeAreaView>
    );
  }

  switch (user.role) {
    case "superadmin":
      return <SuperadminDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
//     case "accountant":
//       return <AccountantDashboard />;
//     case "parent":
//       return <ParentDashboard />;
//     case "librarian":
//       return <LibrarianDashboard />;
    default:
      return (
        <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center px-8">
          <Text className="text-[#F5F1E8] text-center">
            No dashboard configured for role "{user.role}"
          </Text>
        </SafeAreaView>
      );
  }
}