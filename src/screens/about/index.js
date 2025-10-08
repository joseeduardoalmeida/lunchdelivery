import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image, Linking } from "react-native";
import { Text, NativeBaseProvider, Button, VStack, HStack, Divider, Box } from "native-base";
import { getManufacturer } from "../../components/DeviceInfo";
import useThemeStore from "../../components/themeStore";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";

/**
 * 🔧 Como usar
 * 1) Coloque o arquivo da LOGO em assets e ajuste o caminho em LOGO_SOURCE.
 * 2) Defina COMPANY_NAME e WEBSITE_URL com os dados da sua empresa.
 * 3) Se quiser ocultar o WebView e abrir no navegador externo, altere `OPEN_IN_WEBVIEW` para false.
 */

const COMPANY_NAME = "Gimirim Soluções e Sistemas";
const WEBSITE_URL = ""; // Ex.: "https://www.coopfam.com.br"
const LOGO_SOURCE = require("../../assets/LOGO.png"); // ajuste o caminho da sua logo
const LOGO_SOURCE_WHITE = require("../../assets/LOGO_WHITE.png"); // ajuste o caminho da sua logo

const OPEN_IN_WEBVIEW = true;

const AboutScreen = () => {
  const [manufacturer, setManufacturer] = useState("");
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    getManufacturer().then(setManufacturer).catch(() => setManufacturer(""));
  }, []);

  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const bg = isDark ? "#121212" : "#FFFFFF";
  const headerBg = "#E53935"; // pode trocar pela cor institucional
  const textOnHeader = "#FFFFFF";
  const borderColor = isDark ? "#2A2A2A" : "#E5E5E5";

  const navigation = useNavigation();

  return (
    <NativeBaseProvider>
      <View style={[styles.container, { backgroundColor: bg }]}> 
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: headerBg }]}>
          <Button
            size="sm"
            variant="ghost"
            _text={{ color: textOnHeader }}
            isDisabled={canGoBack}
            onPress={() => navigation.goBack()}
          >
            Voltar
          </Button>

          <HStack alignItems="center" space={2} style={{ flex: 1, justifyContent: "center" }}>
            <Text fontSize="lg" bold color={textOnHeader}>
              HubFoody Delivery
            </Text>
          </HStack>

          {/* Espaço para balancear o layout */}
          <View style={{ width: 60 }} />
        </View>

        {/* CONTEÚDO */}
        <VStack space={0} flex={1}>
          {/* Card de informações da empresa */}
          <Box px={4} py={4} borderBottomWidth={1} borderColor={borderColor} alignItems={"center"}>
              <Image source={isDark ? LOGO_SOURCE_WHITE : LOGO_SOURCE} style={{ width: 256, height: 256, borderRadius: 8 }} resizeMode="contain" />
            <HStack space={3} alignItems="center">
              <VStack flex={1} alignItems={"center"}>
                <Text fontSize="md" bold>{COMPANY_NAME}</Text>
                <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"}>
                  {manufacturer ? `App em execução em dispositivo ${manufacturer}` : ""}
                </Text>
                <Text/>
                <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"}>
                  Contato: (35) 9 9918-7108
                </Text>
                <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"}>
                  E-mail: josee.almeida@outlook.com
                </Text>
              </VStack>
              {/* <Button size="sm" onPress={() => Linking.openURL(WEBSITE_URL)}>
                Abrir site
              </Button> */}
            </HStack>
          </Box>

          {/* WebView opcional com o site da empresa */}
          {OPEN_IN_WEBVIEW ? (
            <WebView
              ref={webViewRef}
              source={{ uri: WEBSITE_URL }}
              onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
              startInLoadingState
              renderError={() => (
                <View style={{ padding: 16 }}>
                  <Text>Não foi possível carregar o site agora.</Text>
                  <Button mt={3} onPress={() => Linking.openURL(WEBSITE_URL)}>Abrir no navegador</Button>
                </View>
              )}
              style={{ flex: 1, backgroundColor: bg }}
            />
          ) : (
            <View style={{ padding: 16 }}>
              <Text>Toque no botão acima para abrir o site no navegador.</Text>
            </View>
          )}

          {/* Rodapé simples (opcional) */}
          <Divider />
          <HStack px={4} py={3} alignItems="center" justifyContent="space-between">
            <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
              © {new Date().getFullYear()} {COMPANY_NAME}
            </Text>
            {/* <Button size="xs" variant="ghost" onPress={() => Linking.openURL(WEBSITE_URL)}>
              {WEBSITE_URL.replace(/^https?:\/\//, "")}
            </Button> */}
          </HStack>
        </VStack>
      </View>
    </NativeBaseProvider>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
});
