import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from '../../types'


type NotFoundNavigationProp = NativeStackNavigationProp<RootStackParamList, "NotFound">;
type NotFoundRouteProp = RouteProp<RootStackParamList, "NotFound">;

const NotFound = () => {
  const navigation = useNavigation<NotFoundNavigationProp>();
  const route = useRoute<NotFoundRouteProp>();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      route.name
    );
  }, [route.name]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Oops! Page not found</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.link}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotFound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // gray-100
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#4b5563", // gray-600
    marginBottom: 16,
  },
  link: {
    fontSize: 16,
    color: "#3b82f6", // blue-500
    textDecorationLine: "underline",
  },
});
