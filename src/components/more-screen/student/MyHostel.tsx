// src/components/more-screen/student/MyHostel.tsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Linking, ActivityIndicator } from "react-native";
import { Home, BedDouble, User, Phone, CalendarCheck } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";

const GOLD = "#D4AF37";
const C = { emerald: "#3FAE7A", amber: "#E0B45C", slate: "#5A6379" };
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

function formatDate(d?: string) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}

export default function MyHostel() {
  const { token } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/hostel/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setStudents(json.students || []);
      } catch (err) {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View className="flex-row items-center gap-2 mb-1">
        <Home size={20} color={GOLD} />
        <Text className="text-[#F5F1E8] text-lg font-bold">Hostel / Boarding</Text>
      </View>
      <Text className="text-[#8B93A7] text-xs mb-5">
        {students.length > 1 ? "Your children's hostel assignments." : "Your hostel assignment."}
      </Text>

      {students.map((s) => (
        <View key={s.studentId} className="rounded-2xl bg-[#141F35] border border-[#22304A] p-5 mb-3">
          {students.length > 1 ? (
            <Text className="text-[#5A6379] text-[10px] font-bold uppercase tracking-wide mb-3">
              {s.name} {s.class ? `· ${s.class}` : ""}
            </Text>
          ) : null}

          {!s.hostel ? (
            <View className="items-center py-6">
              <Home size={32} color="#3A4560" />
              <Text className="text-[#5A6379] text-xs mt-3">Not currently a boarding student.</Text>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-[#F5F1E8] text-sm font-bold">{s.hostel.hostelName}</Text>
                  <Text className="text-[#8B93A7] text-xs mt-0.5 capitalize">{s.hostel.gender} hostel</Text>
                </View>
                <View
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      s.hostel.status === "active" ? "#1B3A2C" :
                      s.hostel.status === "checked_out" ? "#22304A" : "#3A2E15",
                  }}
                >
                  <Text
                    className="text-[10px] font-semibold capitalize"
                    style={{
                      color: s.hostel.status === "active" ? C.emerald :
                        s.hostel.status === "checked_out" ? C.slate : C.amber,
                    }}
                  >
                    {s.hostel.status?.replace("_", " ")}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3 bg-[#0B1220] rounded-xl p-4 mb-3">
                <BedDouble size={18} color={GOLD} />
                <View>
                  <Text className="text-[#F5F1E8] text-sm font-semibold">
                    Room {s.hostel.roomNumber} · Bed {s.hostel.bedNumber}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <CalendarCheck size={11} color="#5A6379" />
                    <Text className="text-[#5A6379] text-xs">
                      Checked in {formatDate(s.hostel.checkInDate)}
                    </Text>
                  </View>
                </View>
              </View>

              {s.hostel.wardenName ? (
                <View className="flex-row items-center gap-2">
                  <User size={14} color="#8B93A7" />
                  <Text className="text-[#8B93A7] text-xs">Warden: {s.hostel.wardenName}</Text>
                  {s.hostel.wardenPhone ? (
                    <Pressable
                      onPress={() => Linking.openURL(`tel:${s.hostel.wardenPhone}`)}
                      className="flex-row items-center gap-1 ml-1"
                    >
                      <Phone size={12} color={GOLD} />
                      <Text style={{ color: GOLD }} className="text-xs font-medium">
                        {s.hostel.wardenPhone}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}