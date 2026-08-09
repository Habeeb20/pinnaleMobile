import { useState } from "react";
import { View, Text, Pressable, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { useRoleDashboard } from "@/lib/hooks/useRoleDashboard";
import { toEntries } from "@/lib/format";
import DashboardHeader from "../dashboard/DashboardHeader";
import { DashboardLoading, DashboardError } from "../dashboard/DashboardStates";
import KpiCard from "../dashboard/KpiCard";
import ChartCard from "../dashboard/ChartCard";

const C = {
  gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A",
  amber: "#E0B45C", slate: "#5A6379", teal: "#4FB6B0", purple: "#9C8FD9",
};
const PALETTE = [C.gold, C.emerald, C.purple, C.amber, C.coral, C.teal];
const TABS = ["Overview", "Schools", "Platform"];

export default function SuperadminDashboard() {
  const { data, loading, error, refetch } = useRoleDashboard("superadmin");
  const [tab, setTab] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
      <DashboardHeader title="Platform Overview" subtitle="Superadmin" />

      <View className="flex-row px-6 gap-2 mb-2">
        {TABS.map((t, i) => (
          <Pressable
            key={t}
            onPress={() => setTab(i)}
            className={`px-4 py-2 rounded-full border ${
              tab === i ? "bg-[#D4AF37] border-[#D4AF37]" : "bg-transparent border-[#22304A]"
            }`}
          >
            <Text className={`text-xs font-semibold ${tab === i ? "text-[#0B1220]" : "text-[#8B93A7]"}`}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <DashboardLoading />
      ) : error ? (
        <DashboardError message={error} onRetry={refetch} />
      ) : data ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 }}
        >
          {tab === 0 && <OverviewTab data={data} />}
          {tab === 1 && <SchoolsTab data={data} />}
          {tab === 2 && <PlatformTab data={data} />}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function OverviewTab({ data }: { data: any }) {
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
          data={rolePie} donut radius={70} innerRadius={45} innerCircleColor="#141F35"
          centerLabelComponent={() => <Text className="text-[#F5F1E8] font-bold">{overview?.totalUsers}</Text>}
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

function SchoolsTab({ data }: { data: any }) {
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
              style={{ backgroundColor: s.subscriptionStatus === "active" ? "#1B3A2C" : "#3A2323" }}
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

function PlatformTab({ data }: { data: any }) {
  const { exams, lessonNotes, virtualClasses, requests, payroll } = data;
  const examPie = toEntries(exams?.byStatus).map(([label, value], i) => ({ value, color: PALETTE[i % PALETTE.length], text: label }));
  const notesPie = toEntries(lessonNotes?.byStatus).map(([label, value], i) => ({ value, color: PALETTE[i % PALETTE.length], text: label }));
  const vclassPie = toEntries(virtualClasses?.byStatus).map(([label, value], i) => ({ value, color: PALETTE[i % PALETTE.length], text: label }));
  const reqTypePie = toEntries(requests?.byType).map(([label, value], i) => ({ value, color: PALETTE[i % PALETTE.length], text: label }));
  const totals = payroll?.totals || { totalNet: 0, count: 0 };

  return (
    <View>
      <View className="flex-row flex-wrap gap-3 mb-2">
        <KpiCard label="Total Exams" value={exams?.total} color={C.gold} />
        <KpiCard label="Lesson Notes" value={lessonNotes?.total} color={C.purple} />
        <KpiCard label="Payroll Runs" value={totals.count} color={C.emerald} />
        <KpiCard label="Net Payroll (₦k)" value={Math.round((totals.totalNet || 0) / 1000)} color={C.amber} />
      </View>
      <ChartCard title="Exam status"><PieChart data={examPie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" /></ChartCard>
      <ChartCard title="Lesson note status"><PieChart data={notesPie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" /></ChartCard>
      <ChartCard title="Virtual class status"><PieChart data={vclassPie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" /></ChartCard>
      <ChartCard title="Requests by type"><PieChart data={reqTypePie} donut radius={65} innerRadius={40} innerCircleColor="#141F35" /></ChartCard>
    </View>
  );
}