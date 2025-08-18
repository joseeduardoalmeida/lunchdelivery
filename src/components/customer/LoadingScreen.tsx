import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
        <Text style={styles.text}>Carregando cardápio...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "linear-gradient(45deg, #FFD700, #FF8C00, #FF0000)", // não funciona direto
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
