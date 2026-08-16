// components/dashboards/StudentDashboard.tsx
import { View, Text, ScrollView, StatusBar, Pressable, Linking, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, BarChart, LineChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useRoleDashboard } from "@/lib/hooks/useRoleDashboard";
import { fmtDate, fmtTime, fmtShortDate } from "@/lib/format";
import DashboardHeader from "../dashboard/DashboardHeader";
import { DashboardLoading, DashboardError } from "../dashboard/DashboardStates";
import KpiCard from "../dashboard/KpiCard";
import ChartCard from "../dashboard/ChartCard";

const C = { gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A", amber: "#E0B45C", slate: "#5A6379", purple: "#9C8FD9" };
const PALETTE = [C.emerald, C.gold, C.amber, C.purple, C.coral];

const gradeColor = (pct: number) => {
  if (pct >= 75) return C.emerald;
  if (pct >= 50) return C.amber;
  return C.coral;
};

function SectionHeader({ icon, title, count }: { icon: keyof typeof Ionicons.glyphMap; title: string; count?: number }) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center gap-2">
        <View className="w-6 h-6 rounded-md bg-[#141F35] border border-[#22304A] items-center justify-center">
          <Ionicons name={icon} size={13} color={C.gold} />
        </View>
        <Text className="text-[#F5F1E8] text-sm font-bold">{title}</Text>
      </View>
      {typeof count === "number" && count > 0 && (
        <View className="bg-[#141F35] border border-[#22304A] rounded-full px-2.5 py-0.5">
          <Text className="text-[#8B93A7] text-[10px] font-semibold">{count}</Text>
        </View>
      )}
    </View>
  );
}

function EmptyState({ icon, message }: { icon: keyof typeof Ionicons.glyphMap; message: string }) {
  return (
    <View className="items-center justify-center py-8 bg-[#141F35]/40 border border-[#22304A] rounded-xl">
      <Ionicons name={icon} size={22} color={C.slate} />
      <Text className="text-[#5A6379] text-xs mt-2">{message}</Text>
    </View>
  );
}

export default function StudentDashboard() {
  const { data, loading, error, refetch } = useRoleDashboard("student");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const avgScore = data?.performance?.overall?.averagePercentage ?? 0;

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} colors={[C.gold]} />
          }
        >
          {/* ── Hero: average score ── */}
          <View className="flex-row items-center bg-[#141F35] border border-[#22304A] rounded-2xl px-5 py-5 mb-4">
            <View className="w-16 h-16 rounded-full border-4 items-center justify-center" style={{ borderColor: gradeColor(avgScore) }}>
              <Text className="text-[#F5F1E8] text-base font-extrabold">{avgScore}%</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[#8B93A7] text-[11px] uppercase tracking-wide font-semibold">Overall Average</Text>
              <Text className="text-[#F5F1E8] text-lg font-bold mt-0.5">
                {avgScore >= 75 ? "Excellent standing" : avgScore >= 50 ? "Steady progress" : "Needs attention"}
              </Text>
              <Text className="text-[#5A6379] text-xs mt-0.5">
                {data.performance?.overall?.totalAttempts ?? 0} exams completed
              </Text>
            </View>
          </View>

          {/* ── Secondary KPIs ── */}
          <View className="flex-row flex-wrap gap-3 mb-5">
            <KpiCard label="Exams Taken" value={data.performance?.overall?.totalAttempts} color={C.emerald} />
            <KpiCard label="Pending" value={data.exams?.upcoming?.length || 0} color={C.amber} />
            <KpiCard label="Completion" value={`${data.performance?.overall?.completionRate ?? 0}%`} color={C.purple} />
          </View>

          {/* ── Charts ── */}
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

          {/* ── Upcoming classes ── */}
          <View className="mb-5">
            <SectionHeader icon="calendar-outline" title="Upcoming classes" count={data.upcomingClasses?.length} />
            {!data.upcomingClasses?.length ? (
              <EmptyState icon="calendar-clear-outline" message="No upcoming classes scheduled" />
            ) : (
              data.upcomingClasses.map((c: any) => (
                <Pressable
                  key={c._id}
                  onPress={() => c.link && Linking.openURL(c.link)}
                  className="flex-row items-center gap-3 bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2 active:opacity-70"
                >
                  <View className="w-10 h-10 rounded-lg bg-[#0B1220] items-center justify-center">
                    <Text className="text-[#D4AF37] text-[9px] font-bold">{fmtShortDate(c.dateTime)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>{c.title}</Text>
                    <Text className="text-[#8B93A7] text-xs mt-0.5">{fmtTime(c.dateTime)} · {c.teacher?.name || "Staff"}</Text>
                  </View>
                  {c.link && <Ionicons name="chevron-forward" size={16} color={C.slate} />}
                </Pressable>
              ))
            )}
          </View>

          {/* ── Recent results ── */}
          <View className="mb-2">
            <SectionHeader icon="ribbon-outline" title="Recent results" count={data.exams?.completedAttempts?.length} />
            {!data.exams?.completedAttempts?.length ? (
              <EmptyState icon="document-text-outline" message="No results yet" />
            ) : (
              data.exams.completedAttempts.map((item: any) => (
                <View key={item._id} className="bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>{item.testTitle}</Text>
                      <Text className="text-[#8B93A7] text-xs mt-0.5">{item.subject} · {fmtDate(item.finishedAt)}</Text>
                    </View>
                    <Text className="text-sm font-bold ml-2" style={{ color: gradeColor(item.percentage) }}>
                      {item.percentage}%
                    </Text>
                  </View>
                  <View className="h-1.5 bg-[#0B1220] rounded-full mt-2.5 overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: gradeColor(item.percentage) }}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}