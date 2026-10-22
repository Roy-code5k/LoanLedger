import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Resolves the backend API base URL depending on runtime environment:
 * - Android Emulator uses 10.0.2.2
 * - iOS Simulator uses localhost
 * - Physical device running Expo Go uses the host packager IP
 * - Can also be overridden by setting an explicit URL
 */
const getDefaultApiUrl = (): string => {
  // If running in web browser, use localhost
  if (Platform.OS === "web") {
    return "http://localhost:4000/api";
  }

  // If running in development with Expo host URI (physical device via Expo Go)
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}:4000/api`;
  }

  // Fallbacks by platform
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000/api";
  }

  return "http://localhost:4000/api";
};

export const API_CONFIG = {
  BASE_URL: getDefaultApiUrl(),
  TIMEOUT_MS: 10000,
};
