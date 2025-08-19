import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // você pode trocar Feather por MaterialIcons etc.
import { Order } from "../../../types";

interface OrderStatusBadgeProps {
  status: Order["status"];
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "preparing":
        return { label: "Em Preparo", color: "#3B82F6", icon: "play" }; // Feather: play
      case "out_for_delivery":
        return { label: "Saiu para Entrega", color: "#F97316", icon: "truck" }; // Feather: truck
      case "completed":
        return { label: "Entregue", color: "#22C55E", icon: "check-circle" }; // Feather: check-circle
      default:
        return { label: "Pendente", color: "#9CA3AF", icon: "clock" }; // Feather: clock
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <View style={[styles.badge, { backgroundColor: statusInfo.color }]}>
      <Icon
        name={statusInfo.icon}
        size={14}
        color="#FFF"
        style={{ marginRight: 4 }}
      />
      <Text style={styles.label}>{statusInfo.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
