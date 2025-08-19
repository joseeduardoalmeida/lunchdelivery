import React from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Order } from "../../../types";

interface DeliveryInfoCardProps {
  deliveryInfo: Order["delivery_info"];
  observation?: string | null;
}

export const DeliveryInfoCard = ({ deliveryInfo, observation }: DeliveryInfoCardProps) => {
  if (!deliveryInfo) return null;

  const handleOpenWhatsapp = () => {
    const phone = deliveryInfo.customerWhatsapp.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/55${phone}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações de Entrega:</Text>

      <View style={styles.row}>
        <Icon name="user" size={14} color="#EA580C" />
        <Text style={styles.text}>{deliveryInfo.customerName}</Text>
      </View>

      <View style={styles.row}>
        <Icon name="map-pin" size={14} color="#EA580C" />
        <Text style={styles.text}>{deliveryInfo.customerAddress}</Text>
      </View>

      <View style={styles.row}>
        <Icon name="phone" size={14} color="#EA580C" />
        <TouchableOpacity onPress={handleOpenWhatsapp}>
          <Text style={styles.whatsapp}>{deliveryInfo.customerWhatsapp}</Text>
        </TouchableOpacity>
      </View>

      {deliveryInfo.deliveryPersonName && (
        <View style={styles.row}>
          <Icon name="user" size={14} color="#EA580C" />
          <Text style={styles.text}>
            <Text style={{ fontWeight: "bold" }}>Entregador: </Text>
            {deliveryInfo.deliveryPersonName}
          </Text>
        </View>
      )}

      {observation && (
        <View style={styles.observationBox}>
          <Text style={styles.observationTitle}>Observação:</Text>
          <Text style={styles.observationText}>{observation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#FFF7ED",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  title: {
    fontWeight: "600",
    color: "#9A3412",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  text: {
    marginLeft: 6,
    fontSize: 14,
    color: "#1E1E1E",
  },
  whatsapp: {
    marginLeft: 6,
    fontSize: 14,
    color: "#16A34A",
    textDecorationLine: "underline",
  },
  observationBox: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  observationTitle: {
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 4,
  },
  observationText: {
    fontSize: 14,
    color: "#1D4ED8",
  },
});
