import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { v4 as uuidv4 } from "uuid";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { dataService } from "../../services/dataService";
import { deliveryService } from "../../services/deliveryService";
import { deliveryOrderService } from "../../services/deliveryOrderService";
import { Order } from "../../types";
import { OrdersSummaryCards } from "./orders/OrdersSummaryCards";
import { OrderCard } from "./orders/OrderCard";

export const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const allOrders = await dataService.getOrders();

      const validOrders = allOrders.filter(order => 
        order && order.id && Array.isArray(order.items)
      );

      setOrders(validOrders);
    } catch (err) {
      setError("Erro ao carregar pedidos");
      Toast.show({
        type: "error",
        text1: "Erro ao carregar pedidos",
        text2: "Tente novamente em alguns segundos."
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: "preparing" | "out_for_delivery" | "completed") => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Pedido não encontrado");

      await dataService.updateOrderStatus(orderId, status);
      await loadOrders();

      if (order?.delivery_info?.isDelivery && order.delivery_info.customerWhatsapp) {
        try {
          await deliveryService.updateDeliveryStatus(orderId, status, {
            customerName: order.delivery_info.customerName,
            customerWhatsapp: order.delivery_info.customerWhatsapp
          });
        } catch (deliveryError) {
          console.warn("Falha ao enviar notificação de entrega:", deliveryError);
        }
      }

      const statusMessages = {
        preparing: "Pedido em preparo",
        out_for_delivery: "Pedido saiu para entrega",
        completed: "Pedido entregue"
      };

      Toast.show({
        type: "success",
        text1: "Status atualizado!",
        text2: statusMessages[status]
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao atualizar status",
        text2: err?.message || "Tente novamente"
      });
    }
  };

  const sendToDelivery = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Pedido não encontrado");

      const deliveryOrderData = {
        id: uuidv4(),
        customer_name: order.delivery_info?.customerName || "Cliente",
        customer_address: order.delivery_info?.customerAddress || "",
        customer_whatsapp: order.delivery_info?.customerWhatsapp || "",
        order_items: order.items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total_amount: order.total,
        status: "pending" as const,
        original_order_id: orderId
      };

      await deliveryOrderService.createDeliveryOrder(deliveryOrderData);
      await updateOrderStatus(orderId, "out_for_delivery");
      await loadOrders();

      Toast.show({
        type: "success",
        text1: "Enviado para delivery!",
        text2: "O pedido foi enviado para o controle de delivery."
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Erro ao enviar para delivery"
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e11d48" />
        <Text style={styles.gray}>Carregando pedidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={loadOrders} style={styles.button}>
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeOrders = orders.filter(order => order.status === "preparing");

  return (
    <ScrollView style={styles.container}>
      <OrdersSummaryCards orders={orders} />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="clock" size={20} color="#000" />
          <Text style={styles.cardTitle}>
            Controle de Produção - Pedidos Ativos ({activeOrders.length})
          </Text>
        </View>
        <View style={styles.cardContent}>
          {activeOrders.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.gray}>Nenhum pedido em produção</Text>
            </View>
          ) : (
            activeOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                onSendToDelivery={sendToDelivery}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  center: { alignItems: "center", justifyContent: "center", padding: 16 },
  gray: { color: "#4b5563", marginTop: 8 },
  error: { color: "red", marginBottom: 8 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 6 },
  cardContent: { marginTop: 12 },
  button: { backgroundColor: "#e11d48", padding: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" }
});
