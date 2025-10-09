import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, NativeBaseProvider, Button, HStack } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { getManufacturer } from "../../components/DeviceInfo";
import useThemeStore from "../../components/themeStore";
import { WebView } from "react-native-webview";
import FooterTabs from "../../components/FooterTabs";
import HeaderBar from "../../components/HeaderBar";

const DeliveryScreen = () => {
  const [kotlin, setKotlin] = useState("");
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    getManufacturer().then(setKotlin);
  }, []);

  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        {/* HEADER */}
        <HeaderBar
          canGoBack={canGoBack}
          onGoBack={() => webViewRef.current.goBack()}
          title="HubFoody Controle de Entregas"
        />

        {/* WEBVIEW */}
        <WebView
          ref={webViewRef}
          source={{ uri: "https://www.hubfoody.com.br/delivery-system" }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          setSupportMultipleWindows={false}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
        />

        <FooterTabs color="#FFFFFF" bg="#f33636ff" />
      </View>
    </NativeBaseProvider>
  );
};

export default DeliveryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    backgroundColor: "#1E1E1E",
    padding: 10,
  },
});
