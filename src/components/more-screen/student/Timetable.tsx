// components/timetable/Timetable.tsx
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";

const C = { gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A", amber: "#E0B45C", slate: "#5A6379" };
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

type Period = {
  startTime: string;
  endTime: string;
  subject: string;
  venue?: string;
  teacher?: { name?: string };
};

type Day = {
  day: string;
  periods: Period[];
};

type TimetableDoc = {
  _id: string;
  className: string;
  academicYear: string;
  term: string;
  days: Day[];
};

export default function Timetable({ role }: { role?: string }) {
  const { token } = useAuth();
  const [timetables, setTimetables] = useState<TimetableDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<TimetableDoc | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const fetchTimetable = useCallback(async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      const res = await fetch(`${BASE}/timetables/view?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list: TimetableDoc[] = data.timetables || [];
      setTimetables(list);
      if (list.length > 0) {
        setSelectedTimetable(list[0]);
        setSelectedDayIndex(0);
      }
    } catch (err) {
      console.log("Timetable fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, role]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimetable();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center">
        <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
        <ActivityIndicator size="large" color={C.gold} />
      </SafeAreaView>
    );
  }

  if (timetables.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220]">
        <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-[#141F35] border border-[#22304A] items-center justify-center mb-5">
            <Ionicons name="calendar-outline" size={28} color={C.slate} />
          </View>
          <Text className="text-[#F5F1E8] text-lg font-bold text-center">
            No Timetable Available
          </Text>
          <Text className="text-[#8B93A7] text-sm text-center mt-2 leading-relaxed">
            {role === "student" || role === "parent"
              ? "Your class doesn't have a timetable yet. Check back later."
              : "You don't have any classes with scheduled timetables."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedDay = selectedTimetable?.days?.[selectedDayIndex];

  return (
    <SafeAreaView className="flex-1 bg-[#0B1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} colors={[C.gold]} />
        }
      >
        {/* Header */}
        <Text className="text-[#F5F1E8] text-2xl font-extrabold mb-1">Class Timetable</Text>
        {selectedTimetable && (
          <Text className="text-[#8B93A7] text-xs mb-5">
            {selectedTimetable.className} · {selectedTimetable.academicYear} · {selectedTimetable.term} Term
          </Text>
        )}

        {/* Timetable selector (if more than one) */}
        {timetables.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            className="mb-5"
          >
            {timetables.map((tt) => {
              const active = selectedTimetable?._id === tt._id;
              return (
                <Pressable
                  key={tt._id}
                  onPress={() => {
                    setSelectedTimetable(tt);
                    setSelectedDayIndex(0);
                  }}
                  className="px-4 py-2 rounded-full border"
                  style={{
                    backgroundColor: active ? C.gold : "#141F35",
                    borderColor: active ? C.gold : "#22304A",
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: active ? "#0B1220" : "#F5F1E8" }}
                  >
                    {tt.className} · {tt.term}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {selectedTimetable && (
          <>
            {/* Day tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
              className="mb-4"
            >
              {selectedTimetable.days.map((d, idx) => {
                const active = idx === selectedDayIndex;
                return (
                  <Pressable
                    key={d.day}
                    onPress={() => setSelectedDayIndex(idx)}
                    className="px-4 py-2.5 rounded-xl border items-center min-w-[76px]"
                    style={{
                      backgroundColor: active ? "#141F35" : "transparent",
                      borderColor: active ? C.gold : "#22304A",
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: active ? C.gold : "#8B93A7" }}
                    >
                      {d.day.slice(0, 3)}
                    </Text>
                    <Text
                      className="text-[9px] mt-0.5"
                      style={{ color: active ? "#F5F1E8" : "#5A6379" }}
                    >
                      {d.periods.length} {d.periods.length === 1 ? "class" : "classes"}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Selected day's periods */}
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="calendar" size={16} color={C.gold} />
              <Text className="text-[#F5F1E8] text-sm font-bold">{selectedDay?.day}</Text>
            </View>

            {!selectedDay || selectedDay.periods.length === 0 ? (
              <View className="items-center justify-center py-10 bg-[#141F35]/40 border border-[#22304A] rounded-xl">
                <Ionicons name="moon-outline" size={20} color={C.slate} />
                <Text className="text-[#5A6379] text-xs mt-2">No periods scheduled</Text>
              </View>
            ) : (
              <View>
                {selectedDay.periods.map((period, idx) => (
                  <View
                    key={idx}
                    className="bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3.5 mb-2.5"
                  >
                    <View className="flex-row justify-between items-center mb-2.5">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="time-outline" size={15} color={C.gold} />
                        <Text className="text-[#F5F1E8] text-xs font-semibold">
                          {period.startTime} – {period.endTime}
                        </Text>
                      </View>
                      {period.venue && (
                        <View className="bg-[#0B1220] border border-[#22304A] rounded-full px-2.5 py-1">
                          <Text className="text-[#8B93A7] text-[10px]">{period.venue}</Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row items-center gap-2.5">
                      <View className="w-8 h-8 rounded-lg bg-[#0B1220] items-center justify-center">
                        <Ionicons name="book-outline" size={15} color={C.amber} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>
                          {period.subject}
                        </Text>
                        {period.teacher?.name && (
                          <Text className="text-[#8B93A7] text-xs mt-0.5">
                            {period.teacher.name}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}