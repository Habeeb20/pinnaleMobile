// components/fees/StudentFeeTracker.tsx
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart, PieChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NAVY = "#0B1220";
const PANEL = "#141F35";
const BORDER = "#22304A";
const CREAM = "#F5F1E8";
const SLATE = "#8B93A7";
const DIM = "#5A6379";
const GOLD = "#D4AF37";
const EMERALD = "#3FAE7A";
const ROSE = "#E8877A";
const AMBER = "#E0B45C";
const INDIGO = "#6D5CE0";

const STATUS_C: Record<string, string> = { paid: EMERALD, partial: AMBER, unpaid: ROSE };
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

const fmtN = (n: number) => `₦${Number(n || 0).toLocaleString()}`;
const fmtNS = (n: number) => {
  n = Number(n || 0);
  return n >= 1e6 ? `₦${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `₦${(n / 1e3).toFixed(0)}k` : `₦${n}`;
};
const fmtDT = (d?: string) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

type Transaction = { amount: number; paidAt: string; channel?: string; reference?: string };
type FeeRecord = {
  _id: string;
  paymentType: string;
  term: string;
  academicYear: string;
  status: "paid" | "partial" | "unpaid";
  amountDue: number;
  amountPaid: number;
  balance: number;
  transactions?: Transaction[];
};
type FullTransaction = Transaction & { paymentType: string; term: string; academicYear: string };
type Summary = {
  totalDue: number;
  totalPaid: number;
  totalBalance: number;
  totalRecords: number;
  collectionRate: number;
  statusCounts?: Record<string, number>;
};

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ backgroundColor: PANEL, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16 }, style]}>
      {children}
    </View>
  );
}

function CardTitle({ icon, title, sub }: { icon: keyof typeof Ionicons.glyphMap; title: string; sub?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <Ionicons name={icon} size={15} color={GOLD} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: CREAM, fontSize: 13.5, fontWeight: "800" }}>{title}</Text>
        {sub && <Text style={{ color: DIM, fontSize: 10.5, marginTop: 1 }}>{sub}</Text>}
      </View>
    </View>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ backgroundColor: `${color}22`, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 }}>
      <Text style={{ color, fontSize: 9.5, fontWeight: "800", textTransform: "uppercase" }}>{label}</Text>
    </View>
  );
}

function EmptyState({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 26 }}>
      <Ionicons name={icon} size={24} color={DIM} />
      <Text style={{ color: DIM, fontSize: 11.5, marginTop: 8, textAlign: "center" }}>{text}</Text>
    </View>
  );
}

function StatBlock({ label, val, sub, color, icon }: { label: string; val: string; sub: string; color: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={{ width: "48%", backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 13, marginBottom: 10 }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${color}22`, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <Ionicons name={icon} size={13} color={color} />
      </View>
      <Text style={{ color: CREAM, fontSize: 18, fontWeight: "900" }}>{val}</Text>
      <Text style={{ color: SLATE, fontSize: 10.5, marginTop: 2 }}>{label}</Text>
      <Text style={{ color, fontSize: 9.5, fontWeight: "700", marginTop: 2 }}>{sub}</Text>
    </View>
  );
}

export default function StudentFeeTracker() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [transactions, setTransactions] = useState<FullTransaction[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE}/fees/student-record`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (j.success) {
        setSummary(j.data.summary);
        setRecords(j.data.records || []);
        setTransactions(j.data.transactions || []);
        setMonthlyTrend(j.data.monthlyTrend || []);
        setError(null);
      } else {
        setError(j.message || "Failed to load");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleRecord = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((current) => (current === id ? null : id));
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: NAVY, alignItems: "center", justifyContent: "center" }}>
        <StatusBar barStyle="light-content" backgroundColor={NAVY} />
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={{ color: SLATE, fontSize: 12, marginTop: 10 }}>Loading your fee records…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: NAVY, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <StatusBar barStyle="light-content" backgroundColor={NAVY} />
        <View style={{ backgroundColor: "#3B1418", borderColor: "#5C1F26", borderWidth: 1, borderRadius: 14, padding: 16 }}>
          <Text style={{ color: "#F5A3A3", fontSize: 13, fontWeight: "600", textAlign: "center" }}>⚠ {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!summary) return null;

  const statusPie = Object.entries(summary.statusCounts || {})
    .filter(([, v]) => v > 0)
    .map(([name, value], i) => ({
      value,
      text: name,
      color: STATUS_C[name] || DIM,
    }));

  const trendData = monthlyTrend.map((m) => ({ value: m.amount, label: m.month }));
  const progressColor = summary.collectionRate === 100 ? EMERALD : summary.collectionRate >= 50 ? AMBER : ROSE;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} colors={[GOLD]} />}
      >
        {/* Header */}
        <View style={{ paddingTop: 16, paddingBottom: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="school-outline" size={17} color={NAVY} />
            </View>
            <View>
              <Text style={{ color: DIM, fontSize: 10.5 }}>Student Portal</Text>
              <Text style={{ color: CREAM, fontSize: 19, fontWeight: "900" }}>My Fee Records</Text>
            </View>
          </View>
          <Text style={{ color: SLATE, fontSize: 11.5, lineHeight: 16 }}>
            Track all payments made on your behalf. Your complete fee history is here.
          </Text>
        </View>

        {/* Summary stats */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          <StatBlock icon="document-text-outline" label="Total Due" val={fmtNS(summary.totalDue)} sub={`${summary.totalRecords} fee types`} color={INDIGO} />
          <StatBlock icon="checkmark-circle-outline" label="Total Paid" val={fmtNS(summary.totalPaid)} sub={`${summary.collectionRate}% cleared`} color={EMERALD} />
          <StatBlock icon="alert-circle-outline" label="Balance Left" val={fmtNS(summary.totalBalance)} sub={summary.totalBalance > 0 ? "Needs payment" : "All clear!"} color={ROSE} />
          <StatBlock icon="trophy-outline" label="Fully Cleared" val={String(summary.statusCounts?.paid || 0)} sub={`of ${summary.totalRecords} obligations`} color={GOLD} />
        </View>

        {/* Payment trend */}
        <Card style={{ marginBottom: 14 }}>
          <CardTitle icon="cash-outline" title="Payment History" sub="Payments received over time" />
          {!trendData.length ? (
            <EmptyState icon="cash-outline" text="No payments recorded yet" />
          ) : (
            <LineChart
              data={trendData}
              areaChart
              color={INDIGO}
              thickness={2.5}
              startFillColor={INDIGO}
              startOpacity={0.3}
              endOpacity={0}
              yAxisTextStyle={{ color: DIM, fontSize: 9 }}
              xAxisLabelTextStyle={{ color: DIM, fontSize: 8 }}
              height={160}
              curved
              hideDataPoints
              yAxisLabelSuffix=""
              formatYLabel={(v) => fmtNS(Number(v))}
            />
          )}
        </Card>

        {/* Progress + status breakdown */}
        <Card style={{ marginBottom: 14 }}>
          <CardTitle icon="stats-chart-outline" title="My Progress" sub="Your overall fee progress" />
          <View style={{ alignItems: "center" }}>
            <PieChart
              donut
              radius={70}
              innerRadius={52}
              data={[
                { value: summary.collectionRate, color: progressColor },
                { value: 100 - summary.collectionRate, color: BORDER },
              ]}
              innerCircleColor={PANEL}
              centerLabelComponent={() => (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: CREAM, fontSize: 22, fontWeight: "900" }}>{summary.collectionRate}%</Text>
                  <Text style={{ color: DIM, fontSize: 9.5 }}>of fees paid</Text>
                </View>
              )}
            />
          </View>

          {statusPie.length > 0 && (
            <View style={{ marginTop: 18, alignItems: "center" }}>
              <PieChart data={statusPie} donut radius={44} innerRadius={26} innerCircleColor={PANEL} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 10 }}>
                {statusPie.map((d, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: d.color }} />
                    <Text style={{ color: SLATE, fontSize: 10.5, textTransform: "capitalize" }}>{d.text}: {d.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* Fee records — accordion */}
        <Card style={{ marginBottom: 14 }}>
          <CardTitle icon="clipboard-outline" title="Fee Obligations" sub={`${records.length} fee obligations`} />
          {!records.length ? (
            <EmptyState icon="clipboard-outline" text="No fee records yet" />
          ) : (
            <View style={{ gap: 8 }}>
              {records.map((r) => {
                const isOpen = expandedId === r._id;
                const pct = r.amountDue > 0 ? Math.min(100, (r.amountPaid / r.amountDue) * 100) : 0;
                const statusColor = STATUS_C[r.status] || DIM;
                return (
                  <Pressable
                    key={r._id}
                    onPress={() => toggleRecord(r._id)}
                    style={{
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: isOpen ? GOLD : BORDER,
                      backgroundColor: isOpen ? "#1A2440" : "#0F1830",
                      padding: 13,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <View>
                        <Text style={{ color: CREAM, fontSize: 13.5, fontWeight: "700" }}>{r.paymentType}</Text>
                        <Text style={{ color: SLATE, fontSize: 11, marginTop: 1 }}>{r.term} · {r.academicYear}</Text>
                      </View>
                      <Pill label={r.status} color={statusColor} />
                    </View>

                    <View style={{ height: 6, borderRadius: 3, backgroundColor: BORDER }}>
                      <View style={{ width: `${pct}%`, height: "100%", borderRadius: 3, backgroundColor: statusColor }} />
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                      <Text style={{ color: EMERALD, fontSize: 11, fontWeight: "700" }}>{fmtN(r.amountPaid)} paid</Text>
                      <Text style={{ color: r.balance > 0 ? ROSE : DIM, fontSize: 11, fontWeight: r.balance > 0 ? "700" : "400" }}>
                        {r.balance > 0 ? `${fmtN(r.balance)} left` : "Fully cleared ✓"}
                      </Text>
                    </View>

                    {isOpen && (
                      <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: BORDER }}>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                          {[
                            { label: "Amount Due", val: fmtN(r.amountDue), color: CREAM },
                            { label: "Paid", val: fmtN(r.amountPaid), color: EMERALD },
                            { label: "Balance", val: fmtN(r.balance), color: r.balance > 0 ? ROSE : EMERALD },
                            { label: "Status", val: r.status.toUpperCase(), color: statusColor },
                          ].map((s) => (
                            <View key={s.label} style={{ width: "47%", backgroundColor: NAVY, borderRadius: 10, padding: 10 }}>
                              <Text style={{ color: DIM, fontSize: 9, textTransform: "uppercase", marginBottom: 3 }}>{s.label}</Text>
                              <Text style={{ color: s.color, fontSize: 13, fontWeight: "800" }}>{s.val}</Text>
                            </View>
                          ))}
                        </View>

                        <Text style={{ color: SLATE, fontSize: 10.5, fontWeight: "700", textTransform: "uppercase", marginBottom: 8 }}>
                          Payment History
                        </Text>

                        {!r.transactions?.length ? (
                          <View style={{ backgroundColor: NAVY, borderRadius: 10, padding: 14 }}>
                            <Text style={{ color: DIM, fontSize: 11, textAlign: "center" }}>No payments recorded yet for this fee</Text>
                          </View>
                        ) : (
                          <View style={{ gap: 7 }}>
                            {r.transactions.map((tx, i) => (
                              <View key={i} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: NAVY, borderRadius: 10, padding: 10 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${INDIGO}22`, alignItems: "center", justifyContent: "center" }}>
                                    <Ionicons name="wallet-outline" size={13} color={INDIGO} />
                                  </View>
                                  <View>
                                    <Text style={{ color: EMERALD, fontSize: 11.5, fontWeight: "700" }}>{fmtN(tx.amount)}</Text>
                                    <Text style={{ color: DIM, fontSize: 9.5, textTransform: "capitalize" }}>
                                      {tx.channel || "paystack"} · {fmtDT(tx.paidAt)}
                                    </Text>
                                  </View>
                                </View>
                                <View style={{ backgroundColor: BORDER, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                                  <Text style={{ color: SLATE, fontSize: 9, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" }}>
                                    {tx.reference?.slice(0, 12) || "—"}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </Card>

        {/* Full transaction timeline */}
        <Card>
          <CardTitle icon="receipt-outline" title="Complete Payment Timeline" sub="Every payment ever made on your account" />
          {!transactions.length ? (
            <EmptyState icon="receipt-outline" text="No payments on record yet" />
          ) : (
            <View style={{ gap: 8 }}>
              {transactions.map((t, i) => (
                <View key={i} style={{ backgroundColor: "#0F1830", borderRadius: 12, padding: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Text style={{ color: CREAM, fontSize: 12.5, fontWeight: "700" }}>{t.paymentType}</Text>
                    <Text style={{ color: EMERALD, fontSize: 13, fontWeight: "800" }}>{fmtN(t.amount)}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: DIM, fontSize: 10 }}>{t.term} · {t.academicYear} · {fmtDT(t.paidAt)}</Text>
                    <Pill label={t.channel || "paystack"} color={INDIGO} />
                  </View>
                  {t.reference && (
                    <Text style={{ color: DIM, fontSize: 9, marginTop: 5, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" }}>
                      Ref: {t.reference.slice(0, 20)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}