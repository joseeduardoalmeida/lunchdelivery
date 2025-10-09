import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, HStack, ArrowBackIcon, InfoIcon } from "native-base";
import { useNavigation } from "@react-navigation/native";

const HeaderBar = ({
  title = "HubFoody Delivery",
  canGoBack = false,
  onGoBack = null,
  showInfo = true,
  backgroundColor = "#E53935",
  color = "#FFFFFF",
}) => {
  const navigation = useNavigation();

  return (
    <HStack style={[styles.header, { backgroundColor }]} alignItems="center">
      {/* Botão Voltar */}
      <Button
        size="sm"
        variant="ghost"
        isDisabled={!canGoBack}
        onPress={onGoBack}
      >
        <ArrowBackIcon color={color} />
      </Button>

      {/* Título */}
      <Text fontSize="lg" bold color={color} flex={1} textAlign="center">
        {title}
      </Text>

      {/* Botão Info (opcional) */}
      {showInfo ? (
        <Button
          size="sm"
          variant="ghost"
          onPress={() => navigation.navigate("About")}
        >
          <InfoIcon color={color} />
        </Button>
      ) : (
        // Espaço reservado para manter o layout balanceado
        <View style={{ width: 40 }} />
      )}
    </HStack>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
});

export default HeaderBar;
