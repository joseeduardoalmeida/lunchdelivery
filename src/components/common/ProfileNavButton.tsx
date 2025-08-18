import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";

export const ProfileNavButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.buttonWrapper}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("Perfil" as never)} // ajuste o nome da rota
    >
      <LinearGradient
        colors={["#FF0000", "#FF8C00"]} // app-red -> app-orange
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.text}>Acesse seu perfil</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    position: "absolute",
    top: -8,
    right: 16,
    zIndex: 50,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
