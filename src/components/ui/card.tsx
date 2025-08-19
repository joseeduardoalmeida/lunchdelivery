import React from "react";
import { View, Text, StyleSheet, ViewProps, TextProps, StyleProp, ViewStyle, TextStyle } from "react-native";

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
}

interface CardTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

const Card: React.FC<CardProps> = ({ style, ...props }) => (
  <View style={[styles.card, style]} {...props} />
);

const CardHeader: React.FC<CardProps> = ({ style, ...props }) => (
  <View style={[styles.cardHeader, style]} {...props} />
);

const CardTitle: React.FC<CardTextProps> = ({ style, children, ...props }) => (
  <Text style={[styles.cardTitle, style]} {...props}>
    {children}
  </Text>
);

const CardDescription: React.FC<CardTextProps> = ({ style, children, ...props }) => (
  <Text style={[styles.cardDescription, style]} {...props}>
    {children}
  </Text>
);

const CardContent: React.FC<CardProps> = ({ style, ...props }) => (
  <View style={[styles.cardContent, style]} {...props} />
);

const CardFooter: React.FC<CardProps> = ({ style, ...props }) => (
  <View style={[styles.cardFooter, style]} {...props} />
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "column",
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.25,
    color: "#111827",
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 0,
  },
});

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
