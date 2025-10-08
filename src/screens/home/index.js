import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, NativeBaseProvider, Button, HStack } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { getManufacturer } from "../../components/DeviceInfo";
import useThemeStore from "../../components/themeStore";
import { WebView } from "react-native-webview";

const HomeScreen = () => {
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
        <View style={styles.header}>
          <Button
            size="sm"
            variant="ghost"
            _text={{ color: "white" }}
            isDisabled={!canGoBack}
            onPress={() => webViewRef.current.goBack()}
          >
            Voltar
          </Button>
          <Text fontSize="lg" bold color="white" style={{ flex: 1, textAlign: "center" }}>
            HubFoody Delivery
          </Text>
          <View style={{ width: 60 }} />
          {/* espaço para balancear o layout */}
        </View>

        {/* WEBVIEW */}
        <WebView
          ref={webViewRef}
          source={{ uri: "https://www.hubfoody.com.br/" }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          setSupportMultipleWindows={false}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
        />

        {/* BOTÃO FIXO PARA A TELA SOBRE */}
        <HStack style={styles.footer}>
          <Button
            size="sm"
            flex={1}
            onPress={() => navigation.navigate("About")}
            backgroundColor="#E53935"
            _text={{ color: "white", fontWeight: "bold" }}
          >
            Sobre a Empresa
          </Button>
        </HStack>
      </View>
    </NativeBaseProvider>
  );
};

export default HomeScreen;

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
