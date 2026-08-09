// components/dashboards/StudentDashboard.tsx
import { View, Text, ScrollView, StatusBar, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, BarChart, LineChart } from "react-native-gifted-charts";
import { useRoleDashboard } from "@/lib/hooks/useRoleDashboard";
import { fmtDate, fmtTime, fmtShortDate } from "@/lib/format";
import DashboardHeader from "../dashboard/DashboardHeader";
import { DashboardLoading, DashboardError } from "../dashboard/DashboardStates";
import KpiCard from "../dashboard/KpiCard";
import ChartCard from "../dashboard/ChartCard";

const C = { gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A", amber: "#E0B45C", slate: "#5A6379", purple: "#9C8FD9" };
const PALETTE = [C.emerald, C.gold, C.amber, C.purple, C.coral];

export default function StudentDashboard() {
  const { data, loading, error, refetch } = useRoleDashboard("student");

  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
      <DashboardHeader
        title={data?.profile?.name || "Student"}
        subtitle={`${data?.profile?.class || ""} ${data?.profile?.section || ""}`}
      />

      {loading ? (
        <DashboardLoading />
      ) : error ? (
        <DashboardError message={error} onRetry={refetch} />
      ) : data ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 4 }}
        >
          <View className="flex-row flex-wrap gap-3 mb-2">
            <KpiCard label="Average Score" value={`${data.performance?.overall?.averagePercentage ?? 0}%`} color={C.gold} />
            <KpiCard label="Exams Taken" value={data.performance?.overall?.totalAttempts} color={C.emerald} />
            <KpiCard label="Pending" value={data.exams?.upcoming?.length || 0} color={C.amber} />
            <KpiCard label="Completion" value={`${data.performance?.overall?.completionRate ?? 0}%`} color={C.purple} />
          </View>

          {data.performance?.scoreTrend?.length ? (
            <ChartCard title="Score trend">
              <LineChart
                data={data.performance.scoreTrend.map((d: any) => ({ value: d.percentage, label: fmtShortDate(d.date) }))}
                color={C.gold} thickness={2.5} areaChart startFillColor={C.gold} startOpacity={0.25} endOpacity={0}
                yAxisTextStyle={{ color: C.slate, fontSize: 9 }} xAxisLabelTextStyle={{ color: C.slate, fontSize: 8 }}
                height={160} curved hideDataPoints
              />
            </ChartCard>
          ) : null}

          {data.performance?.gradeDistribution?.length ? (
            <ChartCard title="Grade distribution">
              <PieChart
                data={data.performance.gradeDistribution.map((d: any, i: number) => ({ value: d.count, color: PALETTE[i % PALETTE.length], text: d.grade }))}
                donut radius={65} innerRadius={40} innerCircleColor="#141F35"
              />
            </ChartCard>
          ) : null}

          {data.performance?.subjectAverages?.length ? (
            <ChartCard title="Subject performance">
              <BarChart
                data={data.performance.subjectAverages.map((s: any) => ({ value: Math.round(s.average), label: s.subject?.slice(0, 4), frontColor: C.gold }))}
                barWidth={24} spacing={18} roundedTop maxValue={100}
                yAxisTextStyle={{ color: C.slate, fontSize: 10 }} xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
                height={180}
              />
            </ChartCard>
          ) : null}

          <View className="mb-4">
            <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Upcoming classes</Text>
            {!data.upcomingClasses?.length ? (
              <Text className="text-[#5A6379] text-xs">No upcoming classes</Text>
            ) : (
              data.upcomingClasses.map((c: any) => (
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
                    <Text className="text-[#8B93A7] text-xs mt-0.5">{fmtTime(c.dateTime)} · {c.teacher?.name || "Staff"}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          <View className="mb-4">
            <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Recent results</Text>
            {!data.exams?.completedAttempts?.length ? (
              <Text className="text-[#5A6379] text-xs">No results yet</Text>
            ) : (
              data.exams.completedAttempts.map((item: any) => (
                <View key={item._id} className="flex-row justify-between items-center bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2">
                  <View className="flex-1">
                    <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>{item.testTitle}</Text>
                    <Text className="text-[#8B93A7] text-xs mt-0.5">{item.subject} · {fmtDate(item.finishedAt)}</Text>
                  </View>
                  <Text className="text-[#D4AF37] text-sm font-bold ml-2">{item.percentage}%</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}