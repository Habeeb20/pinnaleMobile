import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NAVY = "#0B1220";
const PANEL = "#141F35";
const BORDER = "#22304A";
const GOLD = "#D4AF37";
const INDIGO = "#6D5CE0";
const SLATE = "#8B93A7";
const CREAM = "#F5F1E8";

const { height: SCREEN_H } = Dimensions.get("window");
const PANEL_HEIGHT = Math.min(SCREEN_H * 0.75, 620);

const BASE_URL = "https://ai-api-taskflow.edirect.ng/api";
const CHAT_ENDPOINT = `${BASE_URL}/public/chat`;

const SUGGESTED_QUESTIONS = [
  "How do I add a new student?",
  "How do I check my school's subscription status?",
  "How do I create a class timetable?",
  "How do I track school fees payments?",
];

type Message = {
  role: "user" | "assistant";
  content: string;
  time: Date;
  isError?: boolean;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function getOrCreateSessionId() {
  const KEY = "pinnacle_ai_session_id";
  let id = await AsyncStorage.getItem(KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(KEY, id);
  }
  return id;
}

export default function PinnacleAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const anim = useRef(new Animated.Value(0)).current; // panel open/close
  const pulse = useRef(new Animated.Value(1)).current; // FAB idle pulse

  useEffect(() => {
    (async () => {
      sessionIdRef.current = await getOrCreateSessionId();
    })();
  }, []);

  // gentle idle pulse on the FAB dot when closed
  useEffect(() => {
    if (isOpen) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isOpen]);

  const openPanel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOpen(true);
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 180 }).start(
      () => setTimeout(() => inputRef.current?.focus(), 150)
    );
  };

  const closePanel = () => {
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setIsOpen(false)
    );
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const handleCopy = async (text: string, index: number) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex((c) => (c === index ? null : c)), 1500);
  };

  const fetchAIReply = async (userText: string) => {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        prompt: userText,
        session_id: sessionIdRef.current,
      }),
    });

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Request failed with status ${res.status}`);
    }

    if (!res.ok) throw new Error(data?.message || `Request failed with status ${res.status}`);

    const replyText = data?.data?.text ?? data?.reply ?? data?.message ?? data?.answer ?? null;
    if (data?.success === false) throw new Error(data?.message || "Chat request failed.");
    if (!replyText) throw new Error("Response did not include a recognizable reply.");

    return replyText as string;
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMessage: Message = { role: "user", content: trimmed, time: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);
    scrollToBottom();

    try {
      const replyText = await fetchAIReply(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: replyText, time: new Date() }]);
    } catch (err: any) {
      console.log("AI chat error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
          time: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const opacity = anim;
  const fabOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const fabScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });

  return (
    <>
      {/* Floating Action Button */}
      <Animated.View
        pointerEvents={isOpen ? "none" : "auto"}
        style={{
          position: "absolute",
          bottom: 88,
          right: 20,
          opacity: fabOpacity,
          transform: [{ scale: fabScale }],
          zIndex: 60,
        }}
      >
        <Pressable onPress={openPanel}>
          <LinearGradient
            colors={[INDIGO, NAVY]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: INDIGO,
              shadowOpacity: 0.45,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 9,
                height: 9,
                borderRadius: 5,
                backgroundColor: GOLD,
                transform: [{ scale: pulse }],
              }}
            />
            <Ionicons name="sparkles" size={24} color="#fff" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Chat Panel */}
      {isOpen && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 24,
            right: 16,
            left: 16,
            height: PANEL_HEIGHT,
            opacity,
            transform: [{ translateY }],
            zIndex: 70,
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: PANEL,
                borderRadius: 28,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: "#000",
                shadowOpacity: 0.4,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
                elevation: 16,
              }}
            >
              {/* Header */}
              <LinearGradient
                colors={[NAVY, INDIGO]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 14,
                      backgroundColor: GOLD,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="hardware-chip-outline" size={18} color={NAVY} />
                  </View>
                  <View>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                      PinnacleHub AI
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#3FAE7A" }} />
                      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
                        Always here to help
                      </Text>
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={closePanel}
                  hitSlop={10}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={17} color="#fff" />
                </Pressable>
              </LinearGradient>

              {/* Messages */}
              <ScrollView
                ref={scrollRef}
                style={{ flex: 1, backgroundColor: NAVY }}
                contentContainerStyle={{ padding: 16, gap: 14 }}
                showsVerticalScrollIndicator={false}
              >
                {messages.length === 0 && (
                  <View style={{ gap: 14 }}>
                    <View style={{ alignItems: "center", paddingVertical: 12 }}>
                      <LinearGradient
                        colors={[GOLD, "#B8912E"]}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 18,
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Ionicons name="sparkles" size={26} color={NAVY} />
                      </LinearGradient>
                      <Text style={{ color: CREAM, fontSize: 15, fontWeight: "700" }}>
                        Hi! How can I help?
                      </Text>
                      <Text style={{ color: SLATE, fontSize: 12, marginTop: 4, textAlign: "center" }}>
                        Ask me anything about PinnacleHub, or try one of these:
                      </Text>
                    </View>

                    <View style={{ gap: 8 }}>
                      {SUGGESTED_QUESTIONS.map((q, i) => (
                        <Pressable
                          key={i}
                          onPress={() => sendMessage(q)}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            borderRadius: 16,
                            backgroundColor: "#0F1830",
                            borderWidth: 1,
                            borderColor: BORDER,
                          }}
                        >
                          <Text style={{ color: CREAM, fontSize: 13 }}>{q}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  const isCopied = copiedIndex === i;
                  return (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                        gap: 8,
                      }}
                    >
                      {!isUser && (
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: msg.isError ? "#DC2626" : "#1B2A4A",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="hardware-chip-outline" size={13} color={GOLD} />
                        </View>
                      )}

                      <Pressable
                        onLongPress={() => handleCopy(msg.content, i)}
                        style={{ maxWidth: "78%" }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: isUser ? "#B8AFEA" : SLATE,
                            marginBottom: 3,
                            marginLeft: isUser ? 0 : 2,
                            textAlign: isUser ? "right" : "left",
                          }}
                        >
                          {isUser ? "You" : "PinnacleHub AI"}
                        </Text>
                        <View
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderRadius: 18,
                            borderBottomRightRadius: isUser ? 4 : 18,
                            borderBottomLeftRadius: isUser ? 18 : 4,
                            backgroundColor: isUser ? INDIGO : "#141F35",
                            borderWidth: isUser ? 0 : 1,
                            borderColor: msg.isError ? "#7F1D1D" : BORDER,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13.5,
                              lineHeight: 19,
                              color: isUser ? "#fff" : CREAM,
                            }}
                          >
                            {msg.content}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 3,
                            justifyContent: isUser ? "flex-end" : "flex-start",
                          }}
                        >
                          <Text style={{ fontSize: 9.5, color: "#4B5670" }}>{formatTime(msg.time)}</Text>
                          {isCopied && (
                            <Text style={{ fontSize: 9.5, color: "#3FAE7A", fontWeight: "600" }}>
                              · Copied
                            </Text>
                          )}
                        </View>
                      </Pressable>

                      {isUser && (
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: GOLD,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="person" size={13} color={NAVY} />
                        </View>
                      )}
                    </View>
                  );
                })}

                {isLoading && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        backgroundColor: "#1B2A4A",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="hardware-chip-outline" size={13} color={GOLD} />
                    </View>
                    <View
                      style={{
                        backgroundColor: "#141F35",
                        borderWidth: 1,
                        borderColor: BORDER,
                        borderRadius: 18,
                        borderBottomLeftRadius: 4,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}
                    >
                      <ActivityIndicator size="small" color={GOLD} />
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Error banner */}
              {error && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: "#3B1418",
                    borderTopWidth: 1,
                    borderTopColor: "#5C1F26",
                  }}
                >
                  <Text style={{ color: "#F5A3A3", fontSize: 11, flex: 1 }}>{error}</Text>
                  <Pressable onPress={() => setError(null)} hitSlop={8}>
                    <Text style={{ color: "#F5A3A3", fontSize: 11, fontWeight: "700" }}>Dismiss</Text>
                  </Pressable>
                </View>
              )}

              {/* Input */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderTopColor: BORDER,
                  backgroundColor: PANEL,
                }}
              >
                <TextInput
                  ref={inputRef}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Type your question..."
                  placeholderTextColor="#5A6379"
                  editable={!isLoading}
                  onSubmitEditing={() => sendMessage(input)}
                  returnKeyType="send"
                  style={{
                    flex: 1,
                    backgroundColor: "#0F1830",
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    color: CREAM,
                    fontSize: 13.5,
                  }}
                />
                <Pressable
                  onPress={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: input.trim() && !isLoading ? INDIGO : "#2A3552",
                  }}
                >
                  <Ionicons name="send" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
}