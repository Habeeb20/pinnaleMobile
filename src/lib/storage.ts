// lib/storage.ts
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem("token");
  }
  return SecureStore.getItemAsync("token");
}

export async function setToken(value: string): Promise<void> {
  if (Platform.OS === "web") {
    return AsyncStorage.setItem("token", value);
  }
  return SecureStore.setItemAsync("token", value);
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === "web") {
    return AsyncStorage.removeItem("token");
  }
  return SecureStore.deleteItemAsync("token");
}