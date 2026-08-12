// src/app/(tabs)/grades.tsx
import { useState } from "react";
import { View, Text, ScrollView, StatusBar, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { useRoleDashboard } from "@/lib/hooks/useRoleDashboard";
import { fmtDate } from "@/lib/format";

const GOLD = "#D4AF37";
const C = {
  gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A",
  amber: "#E0B45C", slate: "#5A6379", purple: "#9C8FD9",
};
const PALETTE = [C.emerald, C.gold, C.amber, C.purple, C.coral];
const TABS = ["CBT Results", "Report Card"];

function ordinal(n?: number) {
  if (!n) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function medalFor(position?: number) {
  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  return null;
}

export default function Grades() {
  const { data, loading, error, refetch } = useRoleDashboard("student");
  const [tab, setTab] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      <View className="px-6 pt-4 pb-3">
        <Text className="text-[#F5F1E8] text-2xl font-bold">My Grades</Text>
        <Text className="text-[#8B93A7] text-xs mt-1">CBT scores & term report cards</Text>
      </View>

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
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#5A6379]">Loading grades…</Text>
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
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 8 }}
        >
          {tab === 0 ? <CbtResultsTab data={data} /> : <ReportCardTab data={data} />}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function CbtResultsTab({ data }: { data: any }) {
  const { performance, exams } = data;
  const overall = performance?.overall || {};

  return (
    <View>
      <View className="flex-row flex-wrap gap-3 mb-4">
        <StatCard label="Average Score" value={`${overall.averagePercentage ?? 0}%`} color={C.gold} />
        <StatCard label="Exams Taken" value={overall.totalAttempts ?? 0} color={C.emerald} />
        <StatCard label="Completion" value={`${overall.completionRate ?? 0}%`} color={C.purple} />
      </View>

      {performance?.gradeDistribution?.length ? (
        <View className="rounded-2xl bg-[#141F35] border border-[#22304A] p-4 mb-4">
          <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Grade distribution</Text>
          <PieChart
            data={performance.gradeDistribution.map((d: any, i: number) => ({
              value: d.count, color: PALETTE[i % PALETTE.length], text: d.grade,
            }))}
            donut radius={65} innerRadius={40} innerCircleColor="#141F35"
          />
        </View>
      ) : null}

      {performance?.subjectAverages?.length ? (
        <View className="rounded-2xl bg-[#141F35] border border-[#22304A] p-4 mb-4">
          <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Average by subject</Text>
          <BarChart
            data={performance.subjectAverages.map((s: any) => ({
              value: Math.round(s.average), label: s.subject?.slice(0, 4), frontColor: C.gold,
            }))}
            barWidth={24} spacing={18} roundedTop maxValue={100}
            yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
            height={180}
          />
        </View>
      ) : null}

      <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Recent results</Text>
      {!exams?.completedAttempts?.length ? (
        <Text className="text-[#5A6379] text-xs">No CBT results yet</Text>
      ) : (
        exams.completedAttempts.map((item: any) => (
          <View
            key={item._id}
            className="flex-row justify-between items-center bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2"
          >
            <View className="flex-1">
              <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>{item.testTitle}</Text>
              <Text className="text-[#8B93A7] text-xs mt-0.5">{item.subject} · {fmtDate(item.finishedAt)}</Text>
            </View>
            <Text
              className="text-sm font-bold ml-2"
              style={{ color: item.percentage >= 70 ? C.emerald : item.percentage >= 50 ? C.amber : C.coral }}
            >
              {item.percentage}%
            </Text>
          </View>
        ))
      )}

      {exams?.upcoming?.length ? (
        <View className="mt-4">
          <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Upcoming exams</Text>
          {exams.upcoming.map((item: any) => (
            <View key={item._id} className="flex-row justify-between items-center bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2">
              <View className="flex-1">
                <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>{item.title}</Text>
                <Text className="text-[#8B93A7] text-xs mt-0.5">{item.subject} · {item.durationMinutes} min · {item.totalMarks} marks</Text>
              </View>
              <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: item.isCBT ? "#1B2A45" : "#3A2E15" }}>
                <Text className="text-[10px] font-semibold" style={{ color: item.isCBT ? C.gold : C.amber }}>
                  {item.isCBT ? "CBT" : "Written"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ReportCardTab({ data }: { data: any }) {
  const academics = data.academics;

  if (!academics) {
    return (
      <View className="items-center justify-center py-16">
        <Text className="text-[#5A6379] text-sm text-center px-8">
          No academic report card records yet
        </Text>
      </View>
    );
  }

  const { termAverages, latestTermPositions, latestTerm, subjectAverages, records } = academics;
  const sortedPositions = [...(latestTermPositions || [])].sort((a: any, b: any) => a.position - b.position);
  const termRecords = (records || []).filter((r: any) => r.term === latestTerm);

  return (
    <View>
      {termAverages?.length ? (
        <View className="rounded-2xl bg-[#141F35] border border-[#22304A] p-4 mb-4">
          <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Term average trend</Text>
          <BarChart
            data={termAverages.map((t: any) => ({ value: Math.round(t.average), label: t.term?.slice(0, 6), frontColor: C.purple }))}
            barWidth={26} spacing={18} roundedTop maxValue={100}
            yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
            height={160}
          />
        </View>
      ) : null}

      {sortedPositions.length ? (
        <View className="mb-4">
          <Text className="text-[#F5F1E8] text-sm font-bold mb-3">
            Class position {latestTerm ? `· ${latestTerm}` : ""}
          </Text>
          {sortedPositions.map((p: any, i: number) => (
            <View
              key={i}
              className="flex-row justify-between items-center rounded-xl px-4 py-3 mb-2"
              style={{
                backgroundColor: p.position <= 3 ? "#2A2410" : "#141F35",
                borderWidth: 1,
                borderColor: p.position <= 3 ? "#4A3F1A" : "#22304A",
              }}
            >
              <Text className="text-[#F5F1E8] text-sm font-semibold">{p.subject}</Text>
              <Text className="text-sm font-bold" style={{ color: p.position <= 3 ? C.gold : "#F5F1E8" }}>
                {medalFor(p.position) ? `${medalFor(p.position)} ` : ""}{ordinal(p.position)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {subjectAverages?.length ? (
        <View className="rounded-2xl bg-[#141F35] border border-[#22304A] p-4 mb-4">
          <Text className="text-[#F5F1E8] text-sm font-bold mb-3">Subject averages (all terms)</Text>
          <BarChart
            data={subjectAverages.map((s: any) => ({ value: Math.round(s.average), label: s.subject?.slice(0, 4), frontColor: C.purple }))}
            barWidth={22} spacing={16} roundedTop
            yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
            height={160}
          />
        </View>
      ) : null}

      <Text className="text-[#F5F1E8] text-sm font-bold mb-3">
        Full records {latestTerm ? `· ${latestTerm}` : ""}
      </Text>
      {!termRecords.length ? (
        <Text className="text-[#5A6379] text-xs">No records for the current term</Text>
      ) : (
        termRecords.map((r: any) => (
          <View key={r._id} className="bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2">
            <View className="flex-row justify-between items-start mb-1">
              <Text className="text-[#F5F1E8] text-sm font-semibold flex-1" numberOfLines={1}>{r.subject}</Text>
              <Text
                className="text-sm font-bold ml-2"
                style={{ color: r.total >= 70 ? C.emerald : r.total >= 50 ? C.amber : C.coral }}
              >
                {r.total}
              </Text>
            </View>
            <Text className="text-[#8B93A7] text-xs">
              1st: {r.firstTest} · 2nd: {r.secondTest} · 3rd: {r.thirdTest} · Mid: {r.midTerm} · Exam: {r.examination}
            </Text>
            {r.position ? (
              <Text className="text-[#D4AF37] text-xs font-semibold mt-1">
                {medalFor(r.position) || ""} {ordinal(r.position)} in class
              </Text>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <View className="rounded-2xl bg-[#141F35] border border-[#22304A] p-4" style={{ width: "31%" }}>
      <Text style={{ color }} className="text-lg font-bold">{value}</Text>
      <Text className="text-[#8B93A7] text-xs mt-1">{label}</Text>
    </View>
  );
}