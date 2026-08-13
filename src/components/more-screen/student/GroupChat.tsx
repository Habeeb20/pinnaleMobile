// src/components/more-screen/student/GroupChat.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TextInput, Pressable, FlatList, Image,
  ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { Send, Users, MessageCircle, X } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";

const GOLD = "#D4AF37";
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

function initials(name?: string) {
  return name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function GroupChat() {
  const { token, user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  const fetchMyGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch(`${BASE}/groups/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setGroups(json.groups || []);
      if (json.groups?.length > 0) setSelectedGroup(json.groups[0]);
    } catch (err) {
      // silent
    } finally {
      setLoadingGroups(false);
    }
  }, [token]);

  useEffect(() => { fetchMyGroups(); }, [fetchMyGroups]);

  const fetchMessages = useCallback(async () => {
    if (!selectedGroup) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`${BASE}/groups/${selectedGroup._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setMessages(json.messages || []);
    } catch (err) {
      // silent
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedGroup, token]);

  useEffect(() => {
    if (!selectedGroup) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [selectedGroup, fetchMessages]);

  const handleSend = async () => {
    if (!content.trim() || !selectedGroup) return;
    setSending(true);
    try {
      await fetch(`${BASE}/groups/${selectedGroup._id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: content.trim() }),
      });
      setContent("");
      fetchMessages();
    } catch (err) {
      // silent
    } finally {
      setSending(false);
    }
  };

  if (loadingGroups) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <MessageCircle size={44} color="#5A6379" />
        <Text className="text-[#F5F1E8] text-base font-bold mt-4 mb-2">No Groups Yet</Text>
        <Text className="text-[#8B93A7] text-sm text-center">
          You haven't been added to any group chats yet. Teachers or admins can add you.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      {/* Group selector header */}
      <Pressable
        onPress={() => setGroupPickerOpen(true)}
        className="flex-row items-center justify-between px-5 py-4 bg-[#141F35] border-b border-[#22304A]"
      >
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-10 h-10 rounded-full bg-[#0B1220] items-center justify-center">
            <Text style={{ color: GOLD }} className="font-bold">{initials(selectedGroup?.name)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[#F5F1E8] text-sm font-semibold" numberOfLines={1}>
              {selectedGroup?.name}
            </Text>
            <Text className="text-[#8B93A7] text-xs mt-0.5">
              {selectedGroup?.participants?.length || 0} members · tap to switch
            </Text>
          </View>
        </View>
        <Pressable onPress={() => setMembersOpen(true)} className="p-2">
          <Users size={20} color="#8B93A7" />
        </Pressable>
      </Pressable>

      {/* Messages */}
      {loadingMessages && messages.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={GOLD} />
        </View>
      ) : messages.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <MessageCircle size={36} color="#5A6379" />
          <Text className="text-[#8B93A7] text-sm mt-3">No messages yet. Be the first to send!</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isMe = item.sender?._id === user?.id;
            return (
              <View className={`flex-row ${isMe ? "justify-end" : "justify-start"}`}>
                <View
                  className="max-w-[80%] rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: isMe ? GOLD : "#141F35",
                    borderWidth: isMe ? 0 : 1,
                    borderColor: "#22304A",
                  }}
                >
                  {!isMe && (
                    <Text style={{ color: GOLD }} className="text-xs font-semibold mb-1">
                      {item.sender?.name}
                    </Text>
                  )}
                  <Text style={{ color: isMe ? "#0B1220" : "#F5F1E8" }} className="text-sm">
                    {item.content}
                  </Text>
                  <Text
                    style={{ color: isMe ? "#3A3320" : "#5A6379" }}
                    className="text-[10px] mt-1.5 text-right"
                  >
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input */}
      <View className="flex-row items-center gap-2 px-4 py-3 border-t border-[#22304A] bg-[#0B1220]">
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Type your message..."
          placeholderTextColor="#4A5470"
          multiline
          className="flex-1 bg-[#141F35] text-[#F5F1E8] text-sm rounded-2xl px-4 py-3 border border-[#22304A] max-h-24"
        />
        <Pressable
          onPress={handleSend}
          disabled={sending || !content.trim()}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: sending || !content.trim() ? "#22304A" : GOLD }}
        >
          {sending ? (
            <ActivityIndicator color="#0B1220" size="small" />
          ) : (
            <Send size={18} color={sending || !content.trim() ? "#5A6379" : "#0B1220"} />
          )}
        </Pressable>
      </View>

      {/* Group picker modal */}
      <Modal visible={groupPickerOpen} transparent animationType="slide" onRequestClose={() => setGroupPickerOpen(false)}>
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={() => setGroupPickerOpen(false)}>
          <Pressable className="bg-[#141F35] rounded-t-3xl max-h-[60%]" onPress={(e) => e.stopPropagation()}>
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#22304A]">
              <Text className="text-[#F5F1E8] text-base font-bold">Your Groups</Text>
              <Pressable onPress={() => setGroupPickerOpen(false)}>
                <X size={20} color="#8B93A7" />
              </Pressable>
            </View>
            <FlatList
              data={groups}
              keyExtractor={(g) => g._id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { setSelectedGroup(item); setGroupPickerOpen(false); }}
                  className="flex-row items-center gap-3 px-5 py-3.5 border-b border-[#1A2540]"
                >
                  <View className="w-9 h-9 rounded-full bg-[#0B1220] items-center justify-center">
                    <Text style={{ color: GOLD }} className="text-xs font-bold">{initials(item.name)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#F5F1E8] text-sm font-medium">{item.name}</Text>
                    <Text className="text-[#5A6379] text-xs mt-0.5">
                      {item.participants?.length || 0} members
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Members modal */}
      <Modal visible={membersOpen} transparent animationType="slide" onRequestClose={() => setMembersOpen(false)}>
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={() => setMembersOpen(false)}>
          <Pressable className="bg-[#141F35] rounded-t-3xl max-h-[70%]" onPress={(e) => e.stopPropagation()}>
            <View className="px-5 py-4 border-b border-[#22304A]">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-[#F5F1E8] text-base font-bold">{selectedGroup?.name}</Text>
                <Pressable onPress={() => setMembersOpen(false)}>
                  <X size={20} color="#8B93A7" />
                </Pressable>
              </View>
              {selectedGroup?.description ? (
                <Text className="text-[#8B93A7] text-xs italic mt-1">{selectedGroup.description}</Text>
              ) : null}
            </View>
            <FlatList
              data={selectedGroup?.participants || []}
              keyExtractor={(m: any) => m._id}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={<Text className="text-[#5A6379] text-xs text-center py-8">No members yet</Text>}
              renderItem={({ item }) => (
                <View className="flex-row items-center gap-3 bg-[#0B1220] rounded-xl px-4 py-3 mb-2">
                  <View className="w-9 h-9 rounded-full bg-[#141F35] items-center justify-center">
                    <Text style={{ color: GOLD }} className="text-xs font-bold">{initials(item.name)}</Text>
                  </View>
                  <View>
                    <Text className="text-[#F5F1E8] text-sm font-medium">{item.name}</Text>
                    <Text className="text-[#5A6379] text-xs capitalize mt-0.5">{item.role}</Text>
                  </View>
                </View>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}