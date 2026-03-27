import { Platform } from "react-native";

const fallbackBaseUrl = Platform.OS === "android"
  ? "http://10.0.2.2:5248"
  : "http://localhost:5248";

export const MOBILE_API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? fallbackBaseUrl).replace(/\/+$/, "");
