// components/FooterTabs.js
import React from "react";
import { StyleSheet } from "react-native";
import { HStack, Button, Text, Box } from "native-base";
import { useNavigation, useRoute } from "@react-navigation/native";

/**
 * FooterTabs — barra de abas fixa para telas do app
 * - Ícones por emoji (sem libs extras)
 * - Aba ativa é destacada automaticamente pelo nome da rota atual
 * - Botões com altura fixa e texto compacto para evitar desalinhamento
 *
 * Rotas esperadas (ajuste conforme seu Navigator):
 *   - "Cliente"
 *   - "Admin"
 *   - "Motoboy"
 *   - "Garcom"
 */

const TABS = [
  { label: "Cliente", route: "Home", icon: "🧍" },
  { label: "Administrador", route: "Admin", icon: "🧑‍💼" },
  { label: "Motoboy", route: "Delivery", icon: "🛵" },
  { label: "Garçom", route: "Waiter", icon: "🍽️" },
];

const BUTTON_HEIGHT = 44;

const FooterTabs = ({ color = "#E53935", bg = "#1E1E1E" }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const current = route?.name;

  return (
    <Box style={[styles.footer, { backgroundColor: bg }]}> 
      <HStack justifyContent="space-between" alignItems="center">
        {TABS.map((tab) => {
          const isActive = current === tab.route;
          return (
            <Button
              key={tab.route}
              onPress={() => navigation.navigate(tab.route)}
              flex={1}
              mx={1}
              height={BUTTON_HEIGHT}
              backgroundColor={isActive ? color : "transparent"}
              borderWidth={1}
              borderColor={color}
              _pressed={{ opacity: 0.8 }}
              _text={{ color: isActive ? "white" : color, fontWeight: "bold" }}
            >
              <HStack space={1} alignItems="center" justifyContent="center">
                <Text fontSize="md">{tab.icon}</Text>
                {/* Texto enxuto, sem quebrar linha para manter alinhamento */}
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {tab.label}
                </Text>
              </HStack>
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
};

export default FooterTabs;

const styles = StyleSheet.create({
  footer: {
    padding: 10,
  },
});

/* ==========================
   Exemplo de uso em uma tela
   ==========================

import FooterTabs from "../../components/FooterTabs";

export default function HomeScreen() {
  return (
    <NativeBaseProvider>
      <View style={{ flex: 1 }}>
        // ... seu conteúdo/WebView aqui ...
        <FooterTabs />
      </View>
    </NativeBaseProvider>
  );
}
*/
