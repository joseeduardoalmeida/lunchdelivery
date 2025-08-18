import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const Footer: React.FC = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <Text style={styles.text}>Desenvolvido por José Eduardo - Gimirim Soluções e Sistemas</Text>
        <View style={styles.contact}>
          <Text style={styles.icon}>📞</Text>
          <Text style={styles.text}>35 99918-7108</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingVertical: 16,
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 8, // gap funciona no React Native >= 0.71
  },
  text: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  contact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },
  icon: {
    fontSize: 14,
    marginRight: 2,
  },
});
