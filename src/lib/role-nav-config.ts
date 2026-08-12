// lib/role-nav-config.ts
import { Home, Users, Wallet, MoreHorizontal, BookOpen, GraduationCap, Library } from "lucide-react-native";

export const ROLE_TABS: Record<string, { name: string; label: string; icon: any }[]> = {
  superadmin: [
    { name: "index", label: "Overview", icon: Home },
    { name: "schools", label: "Schools", icon: Users },
    { name: "people", label: "Users", icon: Users },
    { name: "finance", label: "Finance", icon: Wallet },
    { name: "more", label: "More", icon: MoreHorizontal },
  ],
  admin: [
    { name: "index", label: "Dashboard", icon: Home },
    { name: "people", label: "People", icon: Users },
    { name: "finance", label: "Fees", icon: Wallet },
    { name: "more", label: "More", icon: MoreHorizontal },
  ],
  teacher: [
    { name: "index", label: "Dashboard", icon: Home },
    { name: "people", label: "My Classes", icon: BookOpen },
    { name: "grades", label: "Grades", icon: GraduationCap },
    { name: "more", label: "More", icon: MoreHorizontal },
  ],
  student: [
    { name: "index", label: "Dashboard", icon: Home },
    { name: "grades", label: "Grades", icon: GraduationCap },
    { name: "finance", label: "Fees", icon: Wallet },
    { name: "more", label: "More", icon: MoreHorizontal },
  ],
  parent: [
    { name: "index", label: "Dashboard", icon: Home },
    { name: "finance", label: "Payments", icon: Wallet },
    { name: "grades", label: "Grades", icon: GraduationCap },
    { name: "more", label: "More", icon: MoreHorizontal },
  ],
  accountant: [
    { name: "index", label: "Dashboard", icon: Home },
    { name: "finance", label: "Finance", icon: Wallet },
    { name: "more", label: "More", icon: MoreHorizontal },
  ],
  librarian: [
    { name: "index", label: "Dashboard", icon: Home },
    { name: "library", label: "Library", icon: Library },
    { name: "more", label: "More", icon: MoreHorizontal },
  ],
};
// lib/role-nav-config.ts — update the route values to bare slugs
export const ROLE_MORE_ITEMS: Record<string, { label: string; route: string }[]> = {
  superadmin: [
    { label: "Subscription Plans", route: "plans" },
    { label: "Create Admin", route: "create-admin" },
    { label: "Create Teacher", route: "create-teacher" },
    { label: "Add Student", route: "create-student" },
    { label: "Manage Users", route: "manage-users" },
    { label: "Exam Timetable", route: "exam-timetable" },
    { label: "CBT Analytics", route: "cbt-analytics" },
    { label: "Announcements", route: "announcements" },
    { label: "Library", route: "library" },
    { label: "Hostel Management", route: "hostel" },
    { label: "Transport", route: "transport" },
  ],
  admin: [
    { label: "Attendance", route: "attendance" },
    { label: "Lesson Notes", route: "lesson-notes" },
    { label: "Exam Questions", route: "exam-questions" },
    { label: "Timetable", route: "timetable" },
    { label: "Manage Users", route: "manage-users" },
    { label: "Announcements", route: "announcements" },
    { label: "Reports", route: "reports" },
    { label: "Digital Card", route: "my-id" },
  ],
  teacher: [
    { label: "Add Scores", route: "add-score" },
    { label: "Create CBT", route: "create-test" },
    { label: "Timetable", route: "timetable" },
    { label: "Virtual Class", route: "virtual-class" },
    { label: "Upload Lesson Note", route: "upload-lesson-note" },
    { label: "My Payroll", route: "my-payroll" },
    { label: "Request Leave", route: "request" },
    { label: "Group Chat", route: "group-chat" },
  ],
  student: [
    { label: "Test CBT", route: "test-cbt" },
    { label: "My Classes", route: "my-classes" },
    { label: "Report Cards", route: "report-cards" },
    { label: "Timetable", route: "timetable" },
    { label: "Transportation", route: "transport" },
    { label: "Hostel", route: "hostel-info" },
    { label: "Library", route: "library" },
    { label: "Profile", route: "profile" },
  ],
  parent: [
    { label: "Send Message", route: "messages" },
    { label: "Announcements", route: "announcements" },
    { label: "Attendance", route: "attendance" },
    { label: "Digital Card", route: "my-id" },
  ],
  accountant: [{ label: "Payroll", route: "payroll" }],
  librarian: [],
};