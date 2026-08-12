import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { useState } from "react";
import { useMyClass } from "@/lib/hooks/useMyClass";

const GOLD = "#D4AF37";
const TABS = ["Classmates", "Subjects & Teachers"];

function initials(name?: string) {
  return name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function MyClasses() {
  const { data: cls, loading, error, refetch } = useMyClass();
  const [tab, setTab] = useState(0);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-[#5A6379]">Loading...</Text>
      </View>
    );
  }

  if (error || !cls) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-[#5A6379] text-sm text-center mb-4">
          {error || "You haven't been assigned to a class yet. Check back later."}
        </Text>
        {error ? (
          <Pressable onPress={refetch} className="px-5 py-2.5 rounded-full border border-[#D4AF37]">
            <Text className="text-[#D4AF37] text-sm font-semibold">Retry</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="px-6 pt-2">
        <View className="rounded-2xl bg-[#141F35] border border-[#22304A] p-5 mb-4">
          <Text className="text-[#F5F1E8] text-lg font-bold">{cls.name}</Text>
          <Text className="text-[#8B93A7] text-sm mt-1">
            {cls.level || "Unspecified level"}
          </Text>
          <View className="flex-row gap-4 mt-3">
            <Text className="text-[#8B93A7] text-xs">
              {cls.students?.length ?? 0} classmates
            </Text>
            <Text className="text-[#8B93A7] text-xs">
              {cls.subjects?.length ?? 0} subjects
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2 mb-4">
          {TABS.map((t, i) => (
            <Pressable
              key={t}
              onPress={() => setTab(i)}
              className={`px-4 py-2 rounded-full border ${
                tab === i ? "bg-[#D4AF37] border-[#D4AF37]" : "bg-transparent border-[#22304A]"
              }`}
            >
              <Text className={`text-xs font-semibold ${tab === i ? "text-[#0B1220]" : "text-[#8B93A7]"}`}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}>
        {tab === 0 ? <ClassmatesTab students={cls.students} /> : <SubjectsTab subjects={cls.subjects} />}
      </ScrollView>
    </View>
  );
}

function ClassmatesTab({ students }: { students: any[] }) {
  if (!students?.length) {
    return <Text className="text-[#5A6379] text-xs">No classmates yet</Text>;
  }

  return (
    <View>
      {students.map((s: any) => (
        <View
          key={s._id}
          className="flex-row items-center gap-3 bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2"
        >
          {s.profilePicture ? (
            <Image source={{ uri: s.profilePicture }} className="w-10 h-10 rounded-full" />
          ) : (
            <View className="w-10 h-10 rounded-full bg-[#0B1220] items-center justify-center">
              <Text style={{ color: GOLD }} className="text-xs font-bold">
                {initials(s.name)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-[#F5F1E8] text-sm font-medium" numberOfLines={1}>
              {s.name}
            </Text>
            <Text className="text-[#5A6379] text-xs mt-0.5" numberOfLines={1}>
              {s.studentId}
              {s.rollNumber ? ` · Roll ${s.rollNumber}` : ""}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function SubjectsTab({ subjects }: { subjects: any[] }) {
  if (!subjects?.length) {
    return <Text className="text-[#5A6379] text-xs">No subjects assigned to your class yet</Text>;
  }

  return (
    <View>
      {subjects.map((s: any) => (
        <View
          key={s._id}
          className="bg-[#141F35] border border-[#22304A] rounded-xl px-4 py-3 mb-2"
        >
          <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>
            {s.subjectName}
          </Text>
          {s.teacher ? (
            <View className="mt-1.5">
              <Text className="text-[#8B93A7] text-xs">{s.teacher.name}</Text>
              {s.teacher.email ? (
                <Text className="text-[#5A6379] text-xs mt-0.5">{s.teacher.email}</Text>
              ) : null}
              {s.teacher.phone ? (
                <Text className="text-[#5A6379] text-xs mt-0.5">{s.teacher.phone}</Text>
              ) : null}
            </View>
          ) : (
            <Text className="text-[#5A6379] text-xs mt-1.5">No teacher assigned yet</Text>
          )}
        </View>
      ))}
    </View>
  );
}