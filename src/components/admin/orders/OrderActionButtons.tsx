import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // ou MaterialCommunityIcons, Ionicons...

import { Order } from "../../../types";

interface OrderActionButtonsProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
  onSendToDelivery?: (orderId: string) => void;
}

export const OrderActionButtons = ({
  order,
  onUpdateStatus,
  onSendToDelivery,
}: OrderActionButtonsProps) => {
  return (
    <View style={styles.container}>
      {/* Botões para pedidos em preparo */}
      {order.status === "preparing" && (
        <View style={styles.row}>
          {/* Entregue no Balcão */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#22C55E" }]}
            onPress={() => onUpdateStatus(order.id, "completed")}
          >
            <Icon name="check-circle" size={16} color="#FFF" style={styles.icon} />
            <Text style={styles.buttonText}>Entregue no Balcão</Text>
          </TouchableOpacity>

          {/* Enviar para Delivery */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#F97316" }]}
            onPress={() => onSendToDelivery?.(order.id)}
          >
            <Icon name="truck" size={16} color="#FFF" style={styles.icon} />
            <Text style={styles.buttonText}>Enviar para Delivery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botões para pedidos em delivery */}
      {order.status === "out_for_delivery" && (
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#22C55E" }]}
            onPress={() => onUpdateStatus(order.id, "completed")}
          >
            <Icon name="check-circle" size={16} color="#FFF" style={styles.icon} />
            <Text style={styles.buttonText}>Entregue no Balcão</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#F97316" }]}
            onPress={() => onSendToDelivery?.(order.id)}
          >
            <Icon name="truck" size={16} color="#FFF" style={styles.icon} />
            <Text style={styles.buttonText}>Enviar para Delivery</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
