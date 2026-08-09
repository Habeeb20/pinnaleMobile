// components/dashboards/TeacherDashboard.tsx
import { View, Text, ScrollView, StatusBar, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, BarChart, LineChart } from "react-native-gifted-charts";
import { useRoleDashboard } from "@/lib/hooks/useRoleDashboard";
import { fmtMoney, fmtDate, fmtTime, fmtShortDate, fmtMonth } from "@/lib/format";
import DashboardHeader from "./DashboardHeader";
import { DashboardLoading, DashboardError } from "./DashboardStates";
import KpiCard from "../dashboard/KpiCard";
import ChartCard from "../dashboard/ChartCard";

const C = {
  gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A",
  amber: "#E0B45C", slate: "#5A6379", purple: "#9C8FD9",
};

const STATUS_COLORS: Record<string, string> = {
  pending: C.amber, approved: C.emerald, rejected: C.coral,
  declined: C.coral, acknowledged: C.gold, reviewed: C.purple,
};

export default function TeacherDashboard() {
  const { data, loading, error, refetch } = useRoleDashboard("teacher");

  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
      <DashboardHeader title={data?.profile?.name || "Teacher"} subtitle={data?.profile?.schoolName} />

      {loading ? (
        <DashboardLoading />
      ) : error ? (
        <DashboardError message={error} onRetry={refetch} />
      ) : data ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 4 }}
        >
          <ProfileCard profile={data.profile} classes={data.classes} />
          <StatsRow classes={data.classes} exams={data.exams} lessonNotes={data.lessonNotes} payroll={data.payroll} />
          <PayrollTrend trend={data.payroll?.trend} />
          <SubjectPerformance data={data.performance?.subjectPerformance} />
          <UpcomingClasses items={data.upcomingClasses} />
          <LessonNotes list={data.lessonNotes?.list} counts={data.lessonNotes?.statusCounts} />
          <ExamsList list={data.exams?.list} />
          <RequestsList list={data.requests?.list} counts={data.requests?.statusCounts} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function ProfileCard({ profile, classes }: any) {
  return (
    <View className="rounded-2xl bg-[#141F35] border border-[#22304A] p-5 mb-4">
      <View className="flex-row justify-between mb-1">
        <StatBlock label="Classes" value={classes?.totalClasses} />
        <StatBlock label="Students" value={classes?.totalStudents} />
        <StatBlock label="Subjects" value={profile?.subjects?.length || 0} />
      </View>
      {profile?.subjects?.length ? (
        <View className="flex-row flex-wrap gap-2 mt-3">
          {profile.subjects.map((s: string) => (
            <View key={s} className="px-3 py-1 rounded-full bg-[#0B1220]">
              <Text className="text-[#B9A46A] text-xs font-medium">{s}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function StatBlock({ label, value }: { label: string; value: any }) {
  return (
    <View>
      <Text className="text-[#F5F1E8] text-lg font-bold">{value ?? "—"}</Text>
      <Text className="text-[#8B93A7] text-xs mt-0.5">{label}</Text>
    </View>
  );
}

function StatsRow({ classes, exams, lessonNotes, payroll }: any) {
  return (
    <View className="flex-row flex-wrap gap-3 mb-2">
      <KpiCard label="Total Students" value={classes?.totalStudents} color={C.gold} />
      <KpiCard label="Exams Created" value={exams?.totalCreated} color={C.emerald} />
      <KpiCard label="Pending Notes" value={lessonNotes?.statusCounts?.pending || 0} color={C.amber} />
      <KpiCard label="Last Salary" value={fmtMoney(payroll?.latest?.netSalary)} color={C.purple} />
    </View>
  );
}

function PayrollTrend({ trend }: any) {
  const chartData = (trend || []).map((t: any) => ({ value: Math.round(t.netSalary / 1000), label: fmtMonth(t.month) }));
  if (!chartData.length) return null;
  return (
    <ChartCard title="Payroll trend (₦k net)">
      <LineChart
        data={chartData} color={C.gold} thickness={2.5} areaChart
        startFillColor={C.gold} startOpacity={0.25} endOpacity={0}
        yAxisTextStyle={{ color: C.slate, fontSize: 9 }}
        xAxisLabelTextStyle={{ color: C.slate, fontSize: 8 }}
        height={160} curved hideDataPoints
      />
    </ChartCard>
  );
}

function SubjectPerformance({ data }: any) {
  if (!data?.length) return null;
  const bars = data.map((d: any) => ({ value: Math.round(d.average), label: d.subject?.slice(0, 4), frontColor: C.gold }));
  return (
    <ChartCard title="Average score by subject">
      <BarChart
        data={bars} barWidth={24} spacing={18} roundedTop maxValue={100}
        yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
        height={180}
      />
    </ChartCard>
  );
}

function UpcomingClasses({ items }: any) {
  return (
    <View className="mb-4">
      <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Upcoming classes</Text>
      {!items?.length ? (
        <Text className="text-[#5A6379] text-xs">No upcoming classes scheduled</Text>
      ) : (
        items.map((c: any) => (
          <Pressable
            key={c._id}
            onPress={() => c.link && Linking.openURL(c.link)}
            className="flex-row items-center gap-3 bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2"
          >
            <View className="w-9 h-9 rounded-lg bg-[#0B1220] items-center justify-center">
              <Text className="text-[#D4AF37] text-[9px] font-bold">{fmtShortDate(c.dateTime)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>{c.title}</Text>
              <Text className="text-[#8B93A7] text-xs mt-0.5">{fmtTime(c.dateTime)}</Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

function LessonNotes({ list, counts }: any) {
  const entries = Object.entries(counts || {}).filter(([, v]: any) => v > 0);
  return (
    <View className="mb-4">
      <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Lesson notes</Text>
      {entries.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {entries.map(([label, value]: any) => (
            <View key={label} className="px-3 py-1 rounded-full" style={{ backgroundColor: (STATUS_COLORS[label] || C.slate) + "22" }}>
              <Text className="text-xs font-semibold capitalize" style={{ color: STATUS_COLORS[label] || C.slate }}>
                {label}: {value}
              </Text>
            </View>
          ))}
        </View>
      )}
      {list?.slice(0, 6).map((n: any) => (
        <View key={n._id} className="bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-[#F5F1E8] text-sm font-semibold flex-1" numberOfLines={1}>{n.title}</Text>
            <Text className="text-xs font-semibold capitalize ml-2" style={{ color: STATUS_COLORS[n.status] }}>{n.status}</Text>
          </View>
          <Text className="text-[#8B93A7] text-xs">{n.subject} · {n.className} · Wk {n.week}</Text>
        </View>
      ))}
    </View>
  );
}

function ExamsList({ list }: any) {
  return (
    <View className="mb-4">
      <Text className="text-[#F5F1E8] text-sm font-bold mb-3">My exams & tests</Text>
      {!list?.length ? (
        <Text className="text-[#5A6379] text-xs">No exams created yet</Text>
      ) : (
        list.slice(0, 8).map((e: any) => (
          <View key={e._id} className="bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2">
            <View className="flex-row justify-between items-start mb-1">
              <Text className="text-[#F5F1E8] text-sm font-semibold flex-1" numberOfLines={1}>{e.title}</Text>
              <Text className="text-xs font-semibold capitalize ml-2" style={{ color: STATUS_COLORS[e.status] || C.slate }}>{e.status}</Text>
            </View>
            <Text className="text-[#8B93A7] text-xs">{e.subject} · {e.className}</Text>
            {e.attemptsCount > 0 && (
              <Text className="text-[#D4AF37] text-xs font-semibold mt-1">{e.averagePercentage}% avg · {e.attemptsCount} attempts</Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}

function RequestsList({ list, counts }: any) {
  return (
    <View className="mb-4">
      <Text className="text-[#F5F1E8] text-sm font-bold mb-3">My requests</Text>
      {!list?.length ? (
        <Text className="text-[#5A6379] text-xs">No requests submitted</Text>
      ) : (
        list.slice(0, 6).map((r: any) => (
          <View key={r._id} className="bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2">
            <View className="flex-row justify-between items-start mb-1">
              <Text className="text-[#F5F1E8] text-sm font-semibold flex-1" numberOfLines={1}>{r.subject}</Text>
              <Text className="text-xs font-semibold capitalize ml-2" style={{ color: STATUS_COLORS[r.status] || C.slate }}>{r.status}</Text>
            </View>
            <Text className="text-[#8B93A7] text-xs">
              {r.type === "leave" && r.startDate ? `${fmtDate(r.startDate)} → ${fmtDate(r.endDate)}` : fmtDate(r.createdAt)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}