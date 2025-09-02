import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../../integrations/supabase/client";
import { LoadingScreen } from "../../components/customer/LoadingScreen";
import Linking from 'expo-linking';

// Tipagem das rotas
export type RootStackParamList = {
  Home: undefined;
  ResetPassword: undefined;
  AuthCallback: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AuthCallback = () => {
  const navigation = useNavigation<NavigationProp>();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    console.log("🔗 AuthCallback:", message);
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toISOString()}: ${message}`,
    ]);
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        addDebugInfo("AuthCallback page loaded");

        // No RN não existe window.location, depende do deep link
        // Aqui você usaria Linking.getInitialURL() ou listener
        const url = await Linking.getInitialURL();

        addDebugInfo(`URL capturada: ${url ?? "nenhuma"}`);

        if (!url) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
          return;
        }

        const parsed = new URL(url);
        const hashParams = new URLSearchParams(parsed.hash.replace("#", ""));
        const searchParams = parsed.searchParams;

        const type = hashParams.get("type") || searchParams.get("type");
        const accessToken =
          hashParams.get("access_token") || searchParams.get("access_token");
        const refreshToken =
          hashParams.get("refresh_token") || searchParams.get("refresh_token");

        addDebugInfo(`Type: ${type}`);
        addDebugInfo(`Has access token: ${!!accessToken}`);
        addDebugInfo(`Has refresh token: ${!!refreshToken}`);

        if (type === "recovery" && accessToken && refreshToken) {
          addDebugInfo("Recovery tokens detected - setting session");

          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            addDebugInfo(`Session error: ${error.message}`);
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "ResetPassword",
                },
              ],
            });
          } else {
            addDebugInfo("Session set successfully - redirecting to reset password");
            navigation.reset({
              index: 0,
              routes: [{ name: "ResetPassword" }],
            });
          }
        } else if (type && ["signup", "invite", "magiclink"].includes(type)) {
          addDebugInfo(`Handling ${type} - redirecting to main page`);
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        } else {
          addDebugInfo("No valid auth tokens found - redirecting to main page");
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          }, 2000);
        }
      } catch (error) {
        addDebugInfo(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LoadingScreen />
      <View style={styles.debugContainer}>
        <Text style={styles.title}>Processing Authentication...</Text>
        <ScrollView style={styles.scroll}>
          <Text style={styles.subtitle}>Debug Information:</Text>
          {debugInfo.map((info, index) => (
            <Text key={index} style={styles.debugText}>
              {info}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  debugContainer: {
    marginTop: 20,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  scroll: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 4,
    fontFamily: "monospace",
  },
});
