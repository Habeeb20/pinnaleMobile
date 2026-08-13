// src/components/more-screen/student/MyTransport.tsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Linking, ActivityIndicator } from "react-native";
import { Bus, MapPin, Clock, User, Phone } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";

const GOLD = "#D4AF37";
const C = { emerald: "#3FAE7A", amber: "#E0B45C" };
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function MyTransport() {
  const { token } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/transport/my`, {
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
        <Bus size={20} color={GOLD} />
        <Text className="text-[#F5F1E8] text-lg font-bold">Transportation</Text>
      </View>
      <Text className="text-[#8B93A7] text-xs mb-5">
        {students.length > 1 ? "Your children's bus assignments." : "Your bus assignment."}
      </Text>

      {students.map((s) => (
        <View key={s.studentId} className="rounded-2xl bg-[#141F35] border border-[#22304A] p-5 mb-3">
          {students.length > 1 ? (
            <Text className="text-[#5A6379] text-[10px] font-bold uppercase tracking-wide mb-3">
              {s.name} {s.class ? `· ${s.class}` : ""}
            </Text>
          ) : null}

          {!s.transport ? (
            <View className="items-center py-6">
              <Bus size={32} color="#3A4560" />
              <Text className="text-[#5A6379] text-xs mt-3">Not currently enrolled in school transport.</Text>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-[#F5F1E8] text-sm font-bold">{s.transport.routeName}</Text>
                  <Text className="text-[#8B93A7] text-xs mt-0.5">
                    ₦{s.transport.monthlyFee?.toLocaleString() || 0} / month
                  </Text>
                </View>
                <View
                  className="px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: s.transport.status === "active" ? "#1B3A2C" : "#3A2E15" }}
                >
                  <Text
                    className="text-[10px] font-semibold capitalize"
                    style={{ color: s.transport.status === "active" ? C.emerald : C.amber }}
                  >
                    {s.transport.status}
                  </Text>
                </View>
              </View>

              {s.transport.stop ? (
                <View className="flex-row items-start gap-3 bg-[#0B1220] rounded-xl p-4 mb-3">
                  <MapPin size={16} color={GOLD} style={{ marginTop: 2 }} />
                  <View className="flex-1">
                    <Text className="text-[#F5F1E8] text-sm font-semibold">{s.transport.stop.name}</Text>
                    <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      {s.transport.stop.pickupTime ? (
                        <View className="flex-row items-center gap-1">
                          <Clock size={11} color="#5A6379" />
                          <Text className="text-[#8B93A7] text-xs">Pickup: {s.transport.stop.pickupTime}</Text>
                        </View>
                      ) : null}
                      {s.transport.stop.dropTime ? (
                        <View className="flex-row items-center gap-1">
                          <Clock size={11} color="#5A6379" />
                          <Text className="text-[#8B93A7] text-xs">Drop-off: {s.transport.stop.dropTime}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              ) : null}

              {s.transport.vehicle ? (
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Bus size={14} color="#8B93A7" />
                    <Text className="text-[#8B93A7] text-xs">
                      {s.transport.vehicle.plateNumber}
                      {s.transport.vehicle.model ? ` (${s.transport.vehicle.model})` : ""}
                    </Text>
                  </View>
                  {s.transport.vehicle.driverName ? (
                    <View className="flex-row items-center gap-2">
                      <User size={14} color="#8B93A7" />
                      <Text className="text-[#8B93A7] text-xs">{s.transport.vehicle.driverName}</Text>
                      {s.transport.vehicle.driverPhone ? (
                        <Pressable
                          onPress={() => Linking.openURL(`tel:${s.transport.vehicle.driverPhone}`)}
                          className="flex-row items-center gap-1 ml-1"
                        >
                          <Phone size={12} color={GOLD} />
                          <Text style={{ color: GOLD }} className="text-xs font-medium">
                            {s.transport.vehicle.driverPhone}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
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