// src/components/more-screen/shared/Profile.tsx
import { useState, useEffect } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView, Image,
  ActivityIndicator, Modal, FlatList, Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Phone, MapPin, Droplet, AlertCircle, Camera, Save, ChevronDown, X } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";

const GOLD = "#D4AF37";
const C = { gold: "#D4AF37", emerald: "#3FAE7A", coral: "#E8877A", amber: "#E0B45C", slate: "#5A6379" };
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENOTYPES = ["AA", "AS", "SS", "AC", "SC"];

function initials(name?: string) {
  return name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function Profile() {
  const { token } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    phone: "", address: "", stateOfOrigin: "", lga: "",
    bloodGroup: "", bloodGenotype: "", disability: false,
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pickerOpen, setPickerOpen] = useState<null | "state" | "blood" | "genotype">(null);

  const populateFromUser = (u: any) => {
    if (!u) return;
    setForm({
      phone: u.phone || "",
      address: u.address || "",
      stateOfOrigin: u.stateOfOrigin || "",
      lga: u.lga || "",
      bloodGroup: u.bloodGroup || "",
      bloodGenotype: u.bloodGenotype || "",
      disability: !!u.disability,
    });
    setAvatarPreview(u.profilePicture || "");
  };

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch(`${BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (cancelled) return;

        if (json.success) {
          setUser(json.data);
          populateFromUser(json.data);
        }
      } catch (err) {
        // silent — could add an error banner here
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) return;

    setUploadingAvatar(true);
    try {
      const cloudForm = new FormData();
      cloudForm.append("file", {
        uri: asset.uri,
        type: "image/jpeg",
        name: "avatar.jpg",
      } as any);
      cloudForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      cloudForm.append("folder", "profile_pictures");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: cloudForm }
      );
      const data = await res.json();

      if (res.ok && data.secure_url) {
        setAvatarPreview(data.secure_url);

        const saveRes = await fetch(`${BASE}/users/picture`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ profilePictureUrl: data.secure_url }),
        });
        const saveData = await saveRes.json();
        if (saveData.success) {
          setUser(saveData.data);
        }
      }
    } catch (err) {
      // silent — could add a toast/error banner
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/users/primary-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (err) {
      // silent — could add a toast/error banner
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile && !user) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
      <Text className="text-[#F5F1E8] text-xl font-bold mb-1">Edit Profile</Text>
      <Text className="text-[#8B93A7] text-sm mb-6">Update your primary details</Text>

      {/* Avatar */}
      <View className="flex-row items-center gap-4 mb-8">
        <View className="relative">
          {avatarPreview ? (
            <Image source={{ uri: avatarPreview }} className="w-20 h-20 rounded-full" />
          ) : (
            <View className="w-20 h-20 rounded-full bg-[#141F35] border border-[#22304A] items-center justify-center">
              <Text style={{ color: GOLD }} className="text-lg font-bold">{initials(user?.name)}</Text>
            </View>
          )}
          <Pressable
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#D4AF37] items-center justify-center"
          >
            {uploadingAvatar ? (
              <ActivityIndicator color="#0B1220" size="small" />
            ) : (
              <Camera size={15} color="#0B1220" />
            )}
          </Pressable>
        </View>
        <View>
          <Text className="text-[#F5F1E8] text-base font-semibold">{user?.name}</Text>
          <Text className="text-[#8B93A7] text-xs capitalize mt-0.5">{user?.role}</Text>
        </View>
      </View>

      {/* Phone */}
      <FieldLabel icon={<Phone size={14} color="#8B93A7" />} label="Phone Number" />
      <TextInput
        value={form.phone}
        onChangeText={(v) => handleChange("phone", v)}
        placeholder="e.g. 08012345678"
        placeholderTextColor="#4A5470"
        keyboardType="phone-pad"
        className="bg-[#141F35] text-[#F5F1E8] text-sm rounded-xl px-4 py-3.5 border border-[#22304A] mb-4"
      />

      {/* Address */}
      <FieldLabel icon={<MapPin size={14} color="#8B93A7" />} label="Home Address" />
      <TextInput
        value={form.address}
        onChangeText={(v) => handleChange("address", v)}
        placeholder="Street address"
        placeholderTextColor="#4A5470"
        className="bg-[#141F35] text-[#F5F1E8] text-sm rounded-xl px-4 py-3.5 border border-[#22304A] mb-4"
      />

      {/* State + LGA */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <FieldLabel label="State of Origin" />
          <SelectField
            value={form.stateOfOrigin}
            placeholder="Select state"
            onPress={() => setPickerOpen("state")}
          />
        </View>
        <View className="flex-1">
          <FieldLabel label="LGA" />
          <TextInput
            value={form.lga}
            onChangeText={(v) => handleChange("lga", v)}
            placeholder="LGA"
            placeholderTextColor="#4A5470"
            className="bg-[#141F35] text-[#F5F1E8] text-sm rounded-xl px-4 py-3.5 border border-[#22304A]"
          />
        </View>
      </View>

      {/* Blood group + Genotype */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <FieldLabel icon={<Droplet size={14} color="#8B93A7" />} label="Blood Group" />
          <SelectField
            value={form.bloodGroup}
            placeholder="Select"
            onPress={() => setPickerOpen("blood")}
          />
        </View>
        <View className="flex-1">
          <FieldLabel label="Genotype" />
          <SelectField
            value={form.bloodGenotype}
            placeholder="Select"
            onPress={() => setPickerOpen("genotype")}
          />
        </View>
      </View>

      {/* Disability toggle */}
      <View className="flex-row items-center gap-3 p-3.5 rounded-xl bg-[#141F35] border border-[#22304A] mb-6">
        <Switch
          value={form.disability}
          onValueChange={(v) => handleChange("disability", v)}
          trackColor={{ false: "#22304A", true: GOLD }}
          thumbColor="#F5F1E8"
        />
        <View className="flex-1 flex-row items-center gap-2">
          <AlertCircle size={14} color="#8B93A7" />
          <Text className="text-[#8B93A7] text-xs flex-1">
            I have a disability that the school should be aware of
          </Text>
        </View>
      </View>

      {/* Save */}
      <Pressable
        onPress={handleSubmit}
        disabled={saving}
        className="bg-[#D4AF37] active:bg-[#E8C766] rounded-2xl py-4 flex-row items-center justify-center gap-2"
      >
        {saving ? (
          <ActivityIndicator color="#0B1220" size="small" />
        ) : (
          <Save size={16} color="#0B1220" />
        )}
        <Text className="text-[#0B1220] text-sm font-bold">Save Changes</Text>
      </Pressable>

      {/* Picker modal */}
      <PickerModal
        visible={pickerOpen !== null}
        title={
          pickerOpen === "state" ? "Select State" :
          pickerOpen === "blood" ? "Select Blood Group" : "Select Genotype"
        }
        options={
          pickerOpen === "state" ? NIGERIAN_STATES :
          pickerOpen === "blood" ? BLOOD_GROUPS : GENOTYPES
        }
        onSelect={(value) => {
          if (pickerOpen === "state") handleChange("stateOfOrigin", value);
          if (pickerOpen === "blood") handleChange("bloodGroup", value);
          if (pickerOpen === "genotype") handleChange("bloodGenotype", value);
          setPickerOpen(null);
        }}
        onClose={() => setPickerOpen(null)}
      />
    </ScrollView>
  );
}

function FieldLabel({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 mb-2">
      {icon}
      <Text className="text-[#8B93A7] text-xs font-medium">{label}</Text>
    </View>
  );
}

function SelectField({ value, placeholder, onPress }: { value: string; placeholder: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-[#141F35] rounded-xl px-4 py-3.5 border border-[#22304A] flex-row items-center justify-between"
    >
      <Text className={value ? "text-[#F5F1E8] text-sm" : "text-[#4A5470] text-sm"}>
        {value || placeholder}
      </Text>
      <ChevronDown size={16} color="#5A6379" />
    </Pressable>
  );
}

function PickerModal({
  visible, title, options, onSelect, onClose,
}: {
  visible: boolean; title: string; options: string[];
  onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="bg-[#141F35] rounded-t-3xl max-h-[70%]" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#22304A]">
            <Text className="text-[#F5F1E8] text-base font-bold">{title}</Text>
            <Pressable onPress={onClose}>
              <X size={20} color="#8B93A7" />
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                className="px-5 py-3.5 border-b border-[#1A2540]"
              >
                <Text className="text-[#F5F1E8] text-sm">{item}</Text>
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}