// components/library/LibraryDashboard.tsx
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
// import * as MediaLibrary from "expo-media-library";
import { useAuth } from "@/lib/auth-context";

const C = { gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A", amber: "#E0B45C", slate: "#5A6379", purple: "#9C8FD9" };
const PALETTE = [C.gold, C.purple, C.coral, C.amber, C.emerald, "#60A5FA"];
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
const NEW_THRESHOLD_DAYS = 3;

type Resource = {
  _id: string;
  title: string;
  fileType: "pdf" | "video" | string;
  fileUrl: string;
  classLevel: string;
  uploadedBy?: { _id: string; name: string };
  createdAt: string;
};

function StatCard({ icon, label, value, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number | string; color: string }) {
  return (
    <View className="flex-1 min-w-[46%] bg-[#141F35] border border-[#22304A] rounded-2xl p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[#8B93A7] text-[11px] font-semibold flex-1" numberOfLines={1}>{label}</Text>
        <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${color}22` }}>
          <Ionicons name={icon} size={15} color={color} />
        </View>
      </View>
      <Text className="text-[#F5F1E8] text-2xl font-extrabold mt-2">{value}</Text>
    </View>
  );
}

function ChartCard({ icon, title, subtitle, accent, children }: {
  icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string; accent: string; children: React.ReactNode;
}) {
  return (
    <View className="bg-[#141F35] border border-[#22304A] rounded-2xl p-5 mb-4">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: `${accent}22` }}>
          <Ionicons name={icon} size={17} color={accent} />
        </View>
        <View className="flex-1">
          <Text className="text-[#F5F1E8] text-sm font-bold">{title}</Text>
          {subtitle && <Text className="text-[#5A6379] text-[11px] mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      <View className="items-center">{children}</View>
    </View>
  );
}

const fileIcon = (fileType: string): keyof typeof Ionicons.glyphMap =>
  fileType === "video" ? "videocam-outline" : fileType === "pdf" ? "document-text-outline" : "attach-outline";

const isNew = (createdAt: string) => {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= NEW_THRESHOLD_DAYS;
};

const sanitizeFilename = (title: string, fileUrl: string) => {
  const extMatch = fileUrl.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  const ext = extMatch ? extMatch[1] : "pdf";
  const safeName = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  return `${safeName}.${ext}`;
};

export default function LibraryDashboard() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Students and parents get a read-only library — no upload access, no "new" highlighting
  // that would otherwise nudge them toward acting as contributors.
  const canUpload = user?.role !== "student" && user?.role !== "parent";
  const showNewBadge = canUpload;

  const fetchResources = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE}/library/resources`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err) {
      console.log("Library fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResources();
  };

const downloadResource = async (item: Resource) => {
  if (!item.fileUrl) {
    Alert.alert("Unavailable", "This resource doesn't have a downloadable file.");
    return;
  }

  setDownloadingId(item._id);
  try {
    const filename = sanitizeFilename(item.title, item.fileUrl);
    const destination = new File(Paths.cache, filename);

    const downloadedFile = await File.downloadFileAsync(item.fileUrl, destination);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(downloadedFile.uri, { dialogTitle: `Save "${item.title}"` });
    } else {
      Alert.alert("Downloaded", `"${item.title}" was saved to app storage.`);
    }
  } catch (err) {
    console.log("Download error:", err);
    Alert.alert("Download failed", "Something went wrong downloading this resource. Please try again.");
  } finally {
    setDownloadingId(null);
  }
};
  const confirmDownload = (item: Resource) => {
    Alert.alert(
      item.title,
      "Do you want to download this resource to your device?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Download", onPress: () => downloadResource(item) },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center">
        <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
        <ActivityIndicator size="large" color={C.gold} />
        <Text className="text-[#8B93A7] text-xs mt-3">Loading your library…</Text>
      </SafeAreaView>
    );
  }

  const pdfCount = resources.filter((r) => r.fileType === "pdf").length;
  const videoCount = resources.filter((r) => r.fileType === "video").length;
  const contributorCount = new Set(resources.map((r) => r.uploadedBy?._id).filter(Boolean)).size;

  const classCounts = resources.reduce((acc: Record<string, number>, r) => {
    const key = r.classLevel || "Unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(classCounts).map(([label, count], i) => ({
    value: count,
    color: PALETTE[i % PALETTE.length],
    text: label,
  }));

  const userCounts = resources.reduce((acc: Record<string, number>, r) => {
    const key = r.uploadedBy?.name || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(userCounts).map(([label, count]) => ({
    value: count,
    label: label.length > 6 ? `${label.slice(0, 6)}…` : label,
    frontColor: C.gold,
  }));

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
        <View className="flex-row items-center gap-2 mb-1">
          <Ionicons name="trending-up" size={13} color={C.gold} />
          <Text className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-wide">Library Overview</Text>
        </View>
        <Text className="text-[#F5F1E8] text-2xl font-extrabold mb-1">School Library</Text>
        <Text className="text-[#8B93A7] text-xs mb-5">
          {canUpload
            ? "Manage every resource, track uploads and usage at a glance."
            : "Browse and download resources shared for your class."}
        </Text>

        {canUpload && (
          <Pressable
            onPress={() => router.push("/library/upload")}
            className="flex-row items-center justify-center gap-2 bg-[#D4AF37] rounded-2xl py-3.5 mb-6 active:opacity-80"
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#0B1220" />
            <Text className="text-[#0B1220] text-sm font-bold">Upload New Resource</Text>
          </Pressable>
        )}

        {/* Stats */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatCard icon="book-outline" label="Total Resources" value={resources.length} color={C.gold} />
          <StatCard icon="document-text-outline" label="PDFs" value={pdfCount} color={C.purple} />
          <StatCard icon="videocam-outline" label="Videos" value={videoCount} color={C.coral} />
          <StatCard icon="people-outline" label="Contributors" value={contributorCount} color={C.emerald} />
        </View>

        {/* Charts */}
        {pieData.length > 0 && (
          <ChartCard icon="layers-outline" accent={C.gold} title="Resources by Class" subtitle="Distribution across class levels">
            <PieChart data={pieData} donut radius={80} innerRadius={48} innerCircleColor="#141F35" />
            <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4">
              {pieData.map((d, i) => (
                <View key={i} className="flex-row items-center gap-1.5">
                  <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <Text className="text-[#8B93A7] text-[11px]">{d.text} · {d.value}</Text>
                </View>
              ))}
            </View>
          </ChartCard>
        )}

        {barData.length > 0 && (
          <ChartCard icon="people-outline" accent={C.purple} title="Resources by Uploader" subtitle="Who's contributing the most">
            <BarChart
              data={barData}
              barWidth={26}
              spacing={20}
              roundedTop
              yAxisTextStyle={{ color: C.slate, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: C.slate, fontSize: 9 }}
              height={180}
              noOfSections={4}
            />
          </ChartCard>
        )}

        {/* Resource list */}
        <View className="mt-2">
          <Text className="text-[#F5F1E8] text-sm font-bold mb-3">All Resources</Text>
          {resources.length === 0 ? (
            <View className="items-center justify-center py-10 bg-[#141F35]/40 border border-[#22304A] rounded-xl">
              <Ionicons name="file-tray-outline" size={20} color={C.slate} />
              <Text className="text-[#5A6379] text-xs mt-2">No resources uploaded yet</Text>
            </View>
          ) : (
            <FlatList
              data={resources}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const downloading = downloadingId === item._id;
                return (
                  <Pressable
                    onPress={() => confirmDownload(item)}
                    disabled={downloading}
                    className="flex-row items-center gap-3 bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2 active:opacity-70"
                  >
                    <View className="w-9 h-9 rounded-lg bg-[#0B1220] items-center justify-center">
                      <Ionicons name={fileIcon(item.fileType)} size={16} color={item.fileType === "video" ? C.coral : C.purple} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>{item.title}</Text>
                        {showNewBadge && isNew(item.createdAt) && (
                          <View className="bg-[#D4AF37]/20 rounded-full px-2 py-0.5">
                            <Text className="text-[#D4AF37] text-[9px] font-bold">NEW</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-[#8B93A7] text-xs mt-0.5">
                        {item.classLevel} · {item.uploadedBy?.name || "Unknown"}
                      </Text>
                    </View>
                    {downloading ? (
                      <ActivityIndicator size="small" color={C.gold} />
                    ) : (
                      <Ionicons name="download-outline" size={18} color={C.slate} />
                    )}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}