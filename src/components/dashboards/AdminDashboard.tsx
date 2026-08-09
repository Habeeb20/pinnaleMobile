// src/app/(tabs)/index.tsx
import { useState } from "react";
import { View, Text, Pressable, ScrollView, Image, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PieChart, BarChart, LineChart } from "react-native-gifted-charts";
import { LogOut } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { toEntries } from "@/lib/dashboard-utils";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartCard from "@/components/dashboard/ChartCard";

const GOLD = "#D4AF37";
const C = {
  gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A",
  amber: "#E0B45C", slate: "#5A6379", teal: "#4FB6B0", purple: "#9C8FD9",
};
const PALETTE = [C.gold, C.emerald, C.purple, C.amber, C.coral, C.teal];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function initials(name: string) {
  return name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "U";
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data, loading, error, refetch } = useDashboard(user?.role || "admin");
  const isSuperadmin = user?.role === "superadmin";
  const TABS = isSuperadmin
    ? ["Overview", "Schools", "Platform"]
    : ["Overview", "Academic", "Staff & Payroll"];
  const [tab, setTab] = useState(0);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      {/* Header */}
      <View className="px-6 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
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
          <View>
            <Text className="text-[#F5F1E8] text-base font-bold capitalize">
              {isSuperadmin ? "Platform Overview" : user?.schoolName}
            </Text>
            <Text className="text-[#8B93A7] text-xs capitalize">{user?.role}</Text>
          </View>
        </View>
        <Pressable
          onPress={handleLogout}
          className="w-10 h-10 rounded-full bg-[#141F35] border border-[#22304A] items-center justify-center active:border-[#E8877A]"
        >
          <LogOut size={17} color="#E8877A" strokeWidth={2} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 gap-2 mb-2">
        {TABS.map((t, i) => (
          <Pressable
            key={t}
            onPress={() => setTab(i)}
            className={`px-4 py-2 rounded-full border ${
              tab === i ? "bg-[#D4AF37] border-[#D4AF37]" : "bg-transparent border-[#22304A]"
            }`}
          >
            <Text className={`text-xs font-semibold ${tab === i ? "text-[#0B1220]" : "text-[#8B93A7]"}`}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={GOLD} size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[#E8877A] text-center mb-4">{error}</Text>
          <Pressable onPress={refetch} className="px-5 py-2.5 rounded-full border border-[#D4AF37]">
            <Text className="text-[#D4AF37] text-sm font-semibold">Retry</Text>
          </Pressable>
        </View>
      ) : data ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 }}
        >
          {isSuperadmin ? (
            <>
              {tab === 0 && <SuperOverviewTab data={data} />}
              {tab === 1 && <SuperSchoolsTab data={data} />}
              {tab === 2 && <SuperPlatformTab data={data} />}
            </>
          ) : (
            <>
              {tab === 0 && <AdminOverviewTab data={data} />}
              {tab === 1 && <AdminAcademicTab data={data} />}
              {tab === 2 && <AdminStaffPayrollTab data={data} />}
            </>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

/* ══════════════════ SUPERADMIN TABS ══════════════════ */

function SuperOverviewTab({ data }: { data: any }) {
  const { overview, users, recentActivity } = data;

  const rolePie = toEntries(users?.byRole).map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));

  const activityBars = [
    { value: recentActivity?.newUsers || 0, label: "Users", frontColor: C.gold },
    { value: recentActivity?.newSchools || 0, label: "Schools", frontColor: C.emerald },
    { value: recentActivity?.newExams || 0, label: "Exams", frontColor: C.amber },
    { value: recentActivity?.newVirtualClasses || 0, label: "V-Class", frontColor: C.purple },
  ];

  return (
    <View>
      <View className="flex-row flex-wrap gap-3 mb-2">
        <KpiCard label="Total Users" value={overview?.totalUsers} color={C.gold} />
        <KpiCard label="Total Schools" value={overview?.totalSchools} color={C.emerald} />
        <KpiCard label="Lesson Notes" value={overview?.totalLessonNotes} color={C.purple} />
        <KpiCard label="Exams" value={overview?.totalExams} color={C.amber} />
        <KpiCard label="Blocked Schools" value={overview?.blockedSchools} color={C.coral} />
        <KpiCard label="Deactivated" value={overview?.deactivatedSchools} color={C.slate} />
      </View>

      <ChartCard title="Users by role (platform-wide)">
        <PieChart
          data={rolePie}
          donut radius={70} innerRadius={45} innerCircleColor="#141F35"
          centerLabelComponent={() => (
            <Text className="text-[#F5F1E8] font-bold">{overview?.totalUsers}</Text>
          )}
        />
      </ChartCard>

      <ChartCard title="Activity — last 30 days">
        <BarChart
          data={activityBars} barWidth={26} spacing={20} roundedTop
          yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
          height={160}
        />
      </ChartCard>
    </View>
  );
}

function SuperSchoolsTab({ data }: { data: any }) {
  const { schools, subscriptions } = data;

  const subStatusPie = toEntries(subscriptions?.byStatus).map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));
  const subTypePie = toEntries(subscriptions?.byType).map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));

  const topSchoolsBars = (schools?.topByUsers || []).map((s: any) => ({
    value: s.count, label: (s._id || "—").slice(0, 6), frontColor: C.gold,
  }));

  return (
    <View>
      <View className="flex-row flex-wrap gap-3 mb-2">
        <KpiCard label="Total Schools" value={schools?.list?.length || 0} color={C.gold} />
        <KpiCard
          label="Active Subs"
          value={subscriptions?.byStatus?.find?.((s: any) => s._id === "active")?.count || 0}
          color={C.emerald}
        />
      </View>

      <ChartCard title="Top schools by user count">
        <BarChart
          data={topSchoolsBars} barWidth={24} spacing={16} roundedTop
          yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
          height={180}
        />
      </ChartCard>

      <ChartCard title="Subscription status">
        <PieChart data={subStatusPie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" />
      </ChartCard>

      <ChartCard title="Subscription type">
        <PieChart data={subTypePie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" />
      </ChartCard>

      {/* School list */}
      <View className="mt-1">
        <Text className="text-[#F5F1E8] text-sm font-bold mb-3">All schools</Text>
        {(schools?.list || []).slice(0, 15).map((s: any) => (
          <View
            key={s._id}
            className="flex-row items-center justify-between bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2"
          >
            <View>
              <Text className="text-[#F5F1E8] text-sm font-semibold capitalize">{s._id}</Text>
              <Text className="text-[#8B93A7] text-xs mt-0.5 capitalize">{s.adminName}</Text>
            </View>
            <View
              className="px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: s.subscriptionStatus === "active" ? "#1B3A2C" : "#3A2323",
              }}
            >
              <Text
                className="text-[10px] font-semibold capitalize"
                style={{ color: s.subscriptionStatus === "active" ? C.emerald : C.coral }}
              >
                {s.subscriptionStatus}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function SuperPlatformTab({ data }: { data: any }) {
  const { exams, lessonNotes, virtualClasses, testAttempts, requests, payroll } = data;

  const examPie = toEntries(exams?.byStatus).map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));
  const notesPie = toEntries(lessonNotes?.byStatus).map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));
  const vclassPie = toEntries(virtualClasses?.byStatus).map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));
  const reqTypePie = toEntries(requests?.byType).map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));

  const totals = payroll?.totals || { totalNet: 0, totalBonuses: 0, count: 0 };

  return (
    <View>
      <View className="flex-row flex-wrap gap-3 mb-2">
        <KpiCard label="Total Exams" value={exams?.total} color={C.gold} />
        <KpiCard label="Lesson Notes" value={lessonNotes?.total} color={C.purple} />
        <KpiCard label="Payroll Runs" value={totals.count} color={C.emerald} />
        <KpiCard label="Net Payroll (₦k)" value={Math.round((totals.totalNet || 0) / 1000)} color={C.amber} />
      </View>

      <ChartCard title="Exam status">
        <PieChart data={examPie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" />
      </ChartCard>

      <ChartCard title="Lesson note status">
        <PieChart data={notesPie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" />
      </ChartCard>

      <ChartCard title="Virtual class status">
        <PieChart data={vclassPie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" />
      </ChartCard>

      <ChartCard title="Requests by type">
        <PieChart data={reqTypePie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" />
      </ChartCard>
    </View>
  );
}

/* ══════════════════ ADMIN TABS ══════════════════ */

function AdminOverviewTab({ data }: { data: any }) {
  const { users, classes, groups, recentActivity } = data;
  const roleEntries = toEntries(users?.byRole);
  const totalUsers = roleEntries.reduce((a, [, v]) => a + v, 0);

  const rolesPie = roleEntries.map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));

  const statusPie = [
    { value: users?.active || 0, color: C.emerald, text: "Active" },
    { value: users?.inactive || 0, color: C.slate, text: "Inactive" },
    { value: users?.blocked || 0, color: C.coral, text: "Blocked" },
    { value: users?.deactivated || 0, color: C.amber, text: "Deactivated" },
  ];

  const activityBars = [
    { value: recentActivity?.newUsers || 0, label: "Users", frontColor: C.gold },
    { value: recentActivity?.newLessonNotes || 0, label: "Notes", frontColor: C.emerald },
    { value: recentActivity?.newAnnouncements || 0, label: "Posts", frontColor: C.purple },
    { value: recentActivity?.newExams || 0, label: "Exams", frontColor: C.amber },
  ];

  return (
    <View>
      <View className="flex-row flex-wrap gap-3 mb-2">
        <KpiCard label="Total Users" value={totalUsers} color={C.gold} />
        <KpiCard label="Students" value={users?.byRole?.student ?? roleEntries.find(([k]) => k === "student")?.[1]} color={C.gold} />
        <KpiCard label="Teachers" value={users?.byRole?.teacher ?? roleEntries.find(([k]) => k === "teacher")?.[1]} color={C.emerald} />
        <KpiCard label="Active" value={users?.active} color={C.emerald} />
        <KpiCard label="Classes" value={classes?.total} color={C.purple} />
        <KpiCard label="Groups" value={groups?.total} color={C.teal} />
      </View>

      <ChartCard title="Users by role">
        <PieChart
          data={rolesPie} donut radius={70} innerRadius={45} innerCircleColor="#141F35"
          centerLabelComponent={() => <Text className="text-[#F5F1E8] font-bold">{totalUsers}</Text>}
        />
      </ChartCard>

      <ChartCard title="User status">
        <PieChart data={statusPie} radius={70} showText textColor="#F5F1E8" textSize={10} />
      </ChartCard>

      <ChartCard title="Activity — last 30 days">
        <BarChart
          data={activityBars} barWidth={28} spacing={22} roundedTop
          yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: C.slate, fontSize: 10 }}
          height={160}
        />
      </ChartCard>
    </View>
  );
}

function AdminAcademicTab({ data }: { data: any }) {
  const { marks, exams, lessonNotes, virtualClasses, testAttempts } = data;

  const subjectBars = (marks?.subjectAverages || []).map((s: any) => ({
    value: Math.round(s.avgTotal), label: s._id?.slice(0, 4), frontColor: C.gold,
  }));

  const scoreLabels = ["F", "E", "D", "C", "B", "A"];
  const scoreColors = [C.coral, C.amber, C.amber, C.emerald, C.gold, C.purple];
  const scoreDistBars = (marks?.performanceDistribution || []).map((b: any, i: number) => ({
    value: b.count, label: scoreLabels[i], frontColor: scoreColors[i % scoreColors.length],
  }));

  const examPie = toEntries(exams?.byStatus).map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));

  const notesLine = (lessonNotes?.monthlyUploads || Array(12).fill(0)).map((v: number, i: number) => ({
    value: v, label: MONTHS[i],
  }));

  return (
    <View>
      <View className="flex-row flex-wrap gap-3 mb-2">
        <KpiCard label="Lesson Notes" value={toEntries(lessonNotes?.byStatus).find(([k]) => k === "approved")?.[1] || 0} color={C.purple} />
        <KpiCard label="Pending Notes" value={toEntries(lessonNotes?.byStatus).find(([k]) => k === "pending")?.[1] || 0} color={C.amber} />
        <KpiCard label="Test Attempts" value={testAttempts?.stats?.find((a: any) => a._id === "completed")?.count || 0} color={C.gold} />
        <KpiCard label="Virtual Classes" value={virtualClasses?.upcoming} color={C.teal} />
      </View>

      <ChartCard title="Average score by subject">
        <BarChart
          data={subjectBars} barWidth={24} spacing={18} roundedTop maxValue={100}
          yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
          height={180}
        />
      </ChartCard>

      <ChartCard title="Score distribution">
        <BarChart
          data={scoreDistBars} barWidth={26} spacing={16} roundedTop
          yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: C.slate, fontSize: 10 }}
          height={160}
        />
      </ChartCard>

      <ChartCard title="Exam status">
        <PieChart data={examPie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" />
      </ChartCard>

      <ChartCard title="Lesson note uploads (monthly)">
        <LineChart
          data={notesLine} color={C.purple} thickness={2.5} areaChart
          startFillColor={C.purple} startOpacity={0.25} endOpacity={0}
          yAxisTextStyle={{ color: C.slate, fontSize: 9 }}
          xAxisLabelTextStyle={{ color: C.slate, fontSize: 8 }}
          height={160} hideDataPoints curved
        />
      </ChartCard>
    </View>
  );
}

function AdminStaffPayrollTab({ data }: { data: any }) {
  const { users, payroll, requests, groups } = data;

  const payrollBars = (payroll?.monthlySummary || []).slice(-6).map((p: any) => ({
    value: Math.round(p.totalNet / 1000), label: p._id?.slice(5), frontColor: C.gold,
  }));

  const payrollStatusPie = [
    { value: payroll?.published || 0, color: C.emerald, text: "Published" },
    { value: payroll?.unpublished || 0, color: C.amber, text: "Unpublished" },
  ];

  const reqTypePie = toEntries(requests?.byType).map(([label, value], i) => ({
    value, color: PALETTE[i % PALETTE.length], text: label,
  }));

  const roleEntries = toEntries(users?.byRole);

  return (
    <View>
      <View className="flex-row flex-wrap gap-3 mb-2">
        <KpiCard label="Teachers" value={roleEntries.find(([k]) => k === "teacher")?.[1] || 0} color={C.gold} />
        <KpiCard label="Accountants" value={roleEntries.find(([k]) => k === "accountant")?.[1] || 0} color={C.purple} />
        <KpiCard label="Librarians" value={roleEntries.find(([k]) => k === "librarian")?.[1] || 0} color={C.teal} />
        <KpiCard label="Paid Payroll" value={payroll?.published} color={C.emerald} />
        <KpiCard label="Pending Payroll" value={payroll?.unpublished} color={C.amber} />
        <KpiCard label="Active Groups" value={groups?.active} color={C.gold} />
      </View>

      <ChartCard title="Monthly payroll — net salary (₦k)">
        <BarChart
          data={payrollBars} barWidth={26} spacing={18} roundedTop
          yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
          height={180}
        />
      </ChartCard>

      <ChartCard title="Payroll status">
        <PieChart data={payrollStatusPie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" />
      </ChartCard>

      <ChartCard title="Requests by type">
        <PieChart data={reqTypePie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" />
      </ChartCard>
    </View>
  );
}





