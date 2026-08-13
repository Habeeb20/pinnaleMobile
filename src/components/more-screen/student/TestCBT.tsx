import {useState, useEffect, useRef} from "react"
import {View, Text, Pressable, ScrollView, ActivityIndicator} from "react-native"
import {AppState} from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Clock, BookOpen, AlertTriangle, ArrowLeft, ArrowRight, X } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";

const GOLD = "#D4AF37";
const C = { gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A", amber: "#E0B45C", slate: "#5A6379" };
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function TestCBT() {
  const { token } = useAuth();
  const [phase, setPhase] = useState<"list" | "test" | "result">("list");

  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [testsError, setTestsError] = useState("");

  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [test, setTest] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingTest, setLoadingTest] = useState(false);

  const [score, setScore] = useState<any>(null);
  const [cheatWarning, setCheatWarning] = useState(0);

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  useEffect(() => {
    fetchAvailableTests();
  }, []);

  const fetchAvailableTests = async () => {
    setLoadingTests(true);
    setTestsError("");
    try {
      const res = await fetch(`${BASE}/tests/visible`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setAvailableTests(json.tests || []);
      } else {
        setTestsError(json.message || "Failed to load available tests");
      }
    } catch (err) {
      setTestsError("Failed to load available tests");
    } finally {
      setLoadingTests(false);
    }
  };

  const handleSelectTest = async (t: any) => {
    setSelectedTestId(t._id);
    setPhase("test");
    setLoadingTest(true);

    try {
      const res = await fetch(`${BASE}/tests/${t._id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.test) throw new Error(json.message || "Failed to start test");

      let q = [...json.test.questions];
      if (json.test.shuffleQuestions) {
        q = q.sort(() => Math.random() - 0.5);
      }

      setTest(json.test);
      setQuestions(q);
      setAttempt(json.attempt);
      setTimeLeft(json.test.durationMinutes * 60 - (json.attempt.timeTakenSeconds || 0));

      const saved = await AsyncStorage.getItem(`test_progress_${t._id}`);
      if (saved) {
        const { savedAnswers, savedCurrent } = JSON.parse(saved);
        setAnswers(savedAnswers || {});
        setCurrentQuestion(savedCurrent || 0);
      }
    } catch (err) {
      setPhase("list");
    } finally {
      setLoadingTest(false);
    }
  };

  // Save progress locally whenever answers/current change
  useEffect(() => {
    if (!selectedTestId) return;
    AsyncStorage.setItem(
      `test_progress_${selectedTestId}`,
      JSON.stringify({ savedAnswers: answers, savedCurrent: currentQuestion })
    );
  }, [answers, currentQuestion, selectedTestId]);

  // Timer
  useEffect(() => {
    if (phase !== "test" || score) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, score, timeLeft <= 0]);

  // Cheat detection — app going to background counts as a "tab switch"
  useEffect(() => {
    if (phase !== "test") return;

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        setCheatWarning((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            finishTest(true);
          }
          return next;
        });
      }
    });

    return () => sub.remove();
  }, [phase]);

  const selectOption = (option: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [currentQuestion]: option };
      fetch(`${BASE}/tests/${selectedTestId}/attempt/${attempt._id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: newAnswers }),
      }).catch(() => {});
      return newAnswers;
    });
  };

  const finishTest = async (cheating = false) => {
    if (!selectedTestId || !attempt?._id) return;
    try {
      const res = await fetch(
        `${BASE}/tests/${selectedTestId}/attempt/${attempt._id}/finish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ cheating, answers }),
        }
      );
      const json = await res.json();
      setScore(json.score);
      await AsyncStorage.removeItem(`test_progress_${selectedTestId}`);
      setPhase("result");
    } catch (err) {
      // could surface an inline error banner here
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const goBackToList = () => {
    setPhase("list");
    setSelectedTestId(null);
    setTest(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(0);
    setScore(null);
    setCheatWarning(0);
  };

  // ── Render: loading / error ──
  if (loadingTests) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  if (testsError) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <AlertTriangle size={40} color={C.coral} />
        <Text className="text-[#F5F1E8] text-base font-bold mt-4 mb-2">Error</Text>
        <Text className="text-[#8B93A7] text-sm text-center mb-5">{testsError}</Text>
        <Pressable onPress={fetchAvailableTests} className="px-6 py-3 rounded-full bg-[#D4AF37]">
          <Text className="text-[#0B1220] text-sm font-bold">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // ── Render: list ──
  if (phase === "list") {
    return (
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View className="flex-row items-center gap-2 mb-5">
          <BookOpen size={22} color={GOLD} />
          <Text className="text-[#F5F1E8] text-lg font-bold">Available Tests</Text>
        </View>

        {availableTests.length === 0 ? (
          <View className="items-center py-16 px-6">
            <BookOpen size={40} color="#5A6379" />
            <Text className="text-[#F5F1E8] text-base font-bold mt-4 mb-2">No Tests Available</Text>
            <Text className="text-[#8B93A7] text-sm text-center">
              Your teachers haven't posted any active tests for your class yet.
            </Text>
          </View>
        ) : (
          availableTests.map((t) => (
            <View
              key={t._id}
              className="rounded-2xl bg-[#141F35] border border-[#22304A] p-5 mb-3"
            >
              <Text className="text-[#F5F1E8] text-base font-bold mb-1" numberOfLines={2}>
                {t.title}
              </Text>
              <Text className="text-[#8B93A7] text-xs mb-3" numberOfLines={2}>
                {t.description || "No description provided"}
              </Text>

              <View className="mb-4">
                <InfoRow label="Subject" value={t.subject} />
                <InfoRow label="Term" value={t.term} />
                <InfoRow label="Duration" value={`${t.durationMinutes} minutes`} />
                <InfoRow label="Questions" value={t.totalQuestions} />
                {t.shuffleQuestions ? (
                  <Text style={{ color: GOLD }} className="text-xs font-medium mt-1">
                    • Questions shuffled
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={() => handleSelectTest(t)}
                className="py-3.5 rounded-xl bg-[#D4AF37] active:bg-[#E8C766]"
              >
                <Text className="text-[#0B1220] text-center text-sm font-bold">Start Test</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    );
  }

  // ── Render: test ──
  if (phase === "test") {
    if (loadingTest) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={GOLD} size="large" />
        </View>
      );
    }

    const question = questions[currentQuestion];

    return (
      <View className="flex-1">
        {/* Header */}
        <View className="bg-[#141F35] px-5 py-4 border-b border-[#22304A]">
          <Text className="text-[#F5F1E8] text-base font-bold mb-2" numberOfLines={1}>
            {test?.title || "Loading..."}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-[#8B93A7] text-xs font-medium">
              Question {currentQuestion + 1} / {test?.totalQuestions || "?"}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Clock size={14} color={GOLD} />
              <Text style={{ color: GOLD }} className="text-xs font-mono font-bold">
                {formatTime(timeLeft)}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View className="rounded-2xl bg-[#141F35] border border-[#22304A] p-5 mb-5">
            <Text className="text-[#F5F1E8] text-base font-medium leading-6">
              {question?.questionText || "Loading question..."}
            </Text>
          </View>

          <View className="gap-3">
            {["A", "B", "C", "D"].map((opt) => {
              const selected = answers[currentQuestion] === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => selectOption(opt)}
                  className="p-4 rounded-2xl border-2"
                  style={{
                    borderColor: selected ? GOLD : "#22304A",
                    backgroundColor: selected ? "#2A2410" : "#141F35",
                  }}
                >
                  <Text className="text-sm">
                    <Text style={{ color: GOLD }} className="font-bold">{opt}. </Text>
                    <Text className="text-[#F5F1E8]">
                      {question?.[`option${opt}`] || "Option loading..."}
                    </Text>
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Navigation */}
          <View className="flex-row justify-between mt-6">
            <Pressable
              onPress={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="flex-row items-center px-5 py-3 rounded-xl bg-[#141F35] border border-[#22304A]"
              style={{ opacity: currentQuestion === 0 ? 0.4 : 1 }}
            >
              <ArrowLeft size={16} color="#F5F1E8" />
              <Text className="text-[#F5F1E8] text-sm font-medium ml-2">Previous</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                currentQuestion === questions.length - 1
                  ? finishTest()
                  : setCurrentQuestion((prev) => prev + 1)
              }
              className="flex-row items-center px-5 py-3 rounded-xl bg-[#D4AF37]"
            >
              <Text className="text-[#0B1220] text-sm font-bold mr-2">
                {currentQuestion === questions.length - 1 ? "Finish & Score" : "Next"}
              </Text>
              <ArrowRight size={16} color="#0B1220" />
            </Pressable>
          </View>
        </ScrollView>

        {/* Cheat warning banner */}
        {cheatWarning > 0 && (
          <View className="absolute bottom-6 left-5 right-5 bg-[#2A2410] border border-[#4A3F1A] rounded-2xl p-4 flex-row items-center gap-3">
            <AlertTriangle size={20} color={C.amber} />
            <Text className="text-[#E0B45C] text-xs flex-1">
              Warning {cheatWarning}/3: Stay on this screen to avoid auto-submission.
            </Text>
            <Pressable onPress={() => setCheatWarning(0)}>
              <X size={18} color={C.amber} />
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // ── Render: result ──
  if (phase === "result" && score) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-[#F5F1E8] text-2xl font-bold mb-6">Test Completed!</Text>
        <Text style={{ color: C.emerald }} className="text-6xl font-extrabold mb-6">
          {score.percentage}%
        </Text>
        <Text className="text-[#8B93A7] text-base text-center mb-8">
          You got <Text style={{ color: C.emerald }} className="font-bold">{score.correct}</Text> out of{" "}
          <Text style={{ color: GOLD }} className="font-bold">{score.total}</Text> correct
        </Text>

        <View className="w-full gap-3">
          <Pressable onPress={goBackToList} className="py-3.5 rounded-xl bg-[#141F35] border border-[#22304A]">
            <Text className="text-[#F5F1E8] text-center text-sm font-semibold">Back to Test List</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <View className="flex-row justify-between mb-1">
      <Text className="text-[#5A6379] text-xs">{label}</Text>
      <Text className="text-[#8B93A7] text-xs font-medium">{value}</Text>
    </View>
  );
}