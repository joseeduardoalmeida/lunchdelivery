import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Truck,
  Package,
  Clock,
  User,
  MapPin,
  Phone,
  UserPlus,
  CheckCircle,
} from "lucide-react-native";
import { supabase } from "../../integrations/supabase/client";
import { dataService } from "../../services/dataService";
import { Order } from "../../types";

export const DeliveryManagement = () => {
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [motoboyNames, setMotoboyNames] = useState<{ [orderId: string]: string }>({});
  const navigation = useNavigation();

  useEffect(() => {
    loadDeliveryOrders();
    const interval = setInterval(loadDeliveryOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDeliveryOrders = async () => {
    try {
      setLoading(true);

      const [allOrders, { data: deliveryOrdersData }] = await Promise.all([
        dataService.getOrders(),
        supabase.from("delivery_orders").select("*").order("created_at", { ascending: false }),
      ]);

      // Função para mapear delivery_orders → Order
      const mapDeliveryOrderToOrder = (deliveryOrder: any): Order => ({
        id: deliveryOrder.id,
        total: Number(deliveryOrder.total_amount),
        status:
          deliveryOrder.status === "pending"
            ? "preparing" // 👈 substituí "pending" por "preparing"
            : deliveryOrder.status === "in_delivery"
              ? "out_for_delivery"
              : deliveryOrder.status === "delivered"
                ? "completed"
                : "preparing", // 👈 fallback seguro

        estimatedTime: 30,
        createdAt: deliveryOrder.created_at,
        updatedAt: deliveryOrder.updated_at,
        observation: undefined,
        payment_status: (deliveryOrder.payment_status as Order["payment_status"]) || "pending",
        payment_method: (deliveryOrder.payment_method as Order["payment_method"]) || null,
        transaction_id: deliveryOrder.transaction_id || undefined,
        change_amount: deliveryOrder.change_amount ? Number(deliveryOrder.change_amount) : undefined,
        payment_receipt: deliveryOrder.payment_receipt || undefined,
        delivery_info: {
          isDelivery: true,
          customerName: deliveryOrder.customer_name,
          customerAddress: deliveryOrder.customer_address,
          customerWhatsapp: deliveryOrder.customer_whatsapp,
          deliveryPersonName: deliveryOrder.delivery_person_name,
        },
        items: Array.isArray(deliveryOrder.order_items)
          ? deliveryOrder.order_items.map((item: any) => ({
            id: `delivery-${deliveryOrder.id}-${item.menuItemId}`,
            orderId: deliveryOrder.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: Number(item.price),
            name: item.name || "Item",
            menuItem: {
              id: item.menuItemId,
              name: item.name || "Item",
              description: "",
              price: Number(item.price),
              image: "",
              category: "",
              available: true,
              preparation_time: 0,
              combinationData: item.combinationData,
            },
            customizations: [],
          }))
          : [],
      });

      // Mapear delivery_orders antes de combinar
      const convertedDeliveryOrders: Order[] = (deliveryOrdersData || []).map(mapDeliveryOrderToOrder);

      // Combinar sem conflito de tipos
      const combinedOrders: Order[] = [...convertedDeliveryOrders, ...allOrders];

      setDeliveryOrders(combinedOrders);

    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await dataService.updateOrderStatus(orderId, newStatus);
      setDeliveryOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const startDelivery = async (orderId: string) => {
    const motoboyName = motoboyNames[orderId];
    if (!motoboyName?.trim()) return;

    try {
      await dataService.updateOrder(orderId, {
        status: "out_for_delivery",
        delivery_info: { deliveryPersonName: motoboyName },
      });

      setDeliveryOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: "out_for_delivery", delivery_info: { ...o.delivery_info, deliveryPersonName: motoboyName } }
            : o
        )
      );
      setMotoboyNames((prev) => ({ ...prev, [orderId]: "" }));
    } catch (error) {
      console.error("Erro ao iniciar entrega:", error);
    }
  };

  const finishDelivery = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "completed");
    } catch (error) {
      console.error("Erro ao finalizar entrega:", error);
    }
  };

  const formatWhatsApp = (phone?: string) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/55${cleanPhone}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e11d48" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚚 Controle de Entregas</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard title="Saiu p/ Entrega" count={deliveryOrders.filter(o => o.status === "out_for_delivery").length} color="#2563eb" />
        <StatCard title="Entregues Hoje" count={deliveryOrders.filter(o => o.status === "completed").length} color="#16a34a" />
      </View>

      {/* Lista */}
      {deliveryOrders.length > 0 ? (
        deliveryOrders.map((order) => (
          <View
            key={order.id}
            style={[
              styles.card,
              order.status === "completed"
                ? { backgroundColor: "#dcfce7", borderColor: "#86efac" }
                : order.status === "out_for_delivery"
                  ? { backgroundColor: "#dbeafe", borderColor: "#93c5fd" }
                  : { backgroundColor: "#fef9c3", borderColor: "#fde68a" },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.orderId}>#{order.id.slice(-6)}</Text>
              <Truck size={20} color="#2563eb" />
              <Text>{order.status}</Text>
              <Clock size={14} />
              <Text>{new Date(order.createdAt).toLocaleString("pt-BR")}</Text>
            </View>

            {/* Cliente */}
            {order.delivery_info && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cliente</Text>
                <Text><User size={14} /> {order.delivery_info.customerName}</Text>
                <Text><MapPin size={14} /> {order.delivery_info.customerAddress}</Text>
                {order.delivery_info?.customerWhatsapp && (
                  <TouchableOpacity onPress={() => formatWhatsApp(order.delivery_info?.customerWhatsapp)}>
                    <Text style={styles.link}><Phone size={14} /> {order.delivery_info.customerWhatsapp}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Itens */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Itens</Text>
              {order.items.map((item, i) => (
                <View key={i} style={styles.row}>
                  <Text>{item.quantity}x {item.menuItem.name}</Text>
                  <Text>R$ {(item.menuItem.price * item.quantity).toFixed(2).replace(".", ",")}</Text>
                </View>
              ))}
              <View style={styles.row}>
                <Text style={{ fontWeight: "bold" }}>Total</Text>
                <Text style={{ fontWeight: "bold", color: "#e11d48" }}>
                  R$ {order.total.toFixed(2).replace(".", ",")}
                </Text>
              </View>
            </View>

            {/* Controles */}
            {order.status === "out_for_delivery" && (
              <TouchableOpacity style={styles.finishBtn} onPress={() => finishDelivery(order.id)}>
                <CheckCircle size={16} color="#fff" />
                <Text style={styles.finishBtnText}>Finalizar Entrega</Text>
              </TouchableOpacity>
            )}

            {order.status !== "out_for_delivery" && order.status !== "completed" && (
              <View style={styles.motoboySection}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do Motoboy"
                  value={motoboyNames[order.id] || ""}
                  onChangeText={(t) => setMotoboyNames((prev) => ({ ...prev, [order.id]: t }))}
                />
                <TouchableOpacity
                  style={styles.assignBtn}
                  onPress={() => startDelivery(order.id)}
                  disabled={!motoboyNames[order.id]?.trim()}
                >
                  <UserPlus size={16} color="#fff" />
                  <Text style={styles.assignBtnText}>Atribuir</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === "completed" && (
              <View style={styles.completedBox}>
                <CheckCircle size={16} color="#16a34a" />
                <Text style={styles.completedText}>Entrega Finalizada!</Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Package size={48} color="#9ca3af" />
          <Text style={{ color: "#6b7280" }}>Nenhum pedido de delivery encontrado</Text>
        </View>
      )}
    </ScrollView>
  );
};

// Componente auxiliar
const StatCard = ({ title, count, color }: { title: string; count: number; color: string }) => (
  <View style={[styles.statCard, { borderColor: color }]}>
    <Text style={{ fontSize: 16, fontWeight: "bold", color }}>{count}</Text>
    <Text style={{ fontSize: 12, color: "#374151" }}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  statCard: { padding: 12, borderWidth: 2, borderRadius: 8, alignItems: "center", width: "45%" },
  card: { borderWidth: 1, padding: 16, marginBottom: 12, borderRadius: 8 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  orderId: { fontWeight: "bold", fontSize: 16 },
  section: { marginTop: 8, backgroundColor: "#fff", padding: 8, borderRadius: 6 },
  sectionTitle: { fontWeight: "bold", marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  link: { color: "#16a34a", textDecorationLine: "underline" },
  motoboySection: { flexDirection: "row", marginTop: 8, alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", padding: 8, borderRadius: 6, marginRight: 8 },
  assignBtn: { flexDirection: "row", backgroundColor: "#2563eb", padding: 10, borderRadius: 6, alignItems: "center" },
  assignBtnText: { color: "#fff", marginLeft: 6 },
  finishBtn: { flexDirection: "row", backgroundColor: "#16a34a", padding: 10, borderRadius: 6, alignItems: "center", justifyContent: "center", marginTop: 8 },
  finishBtnText: { color: "#fff", fontWeight: "bold", marginLeft: 6 },
  completedBox: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 },
  completedText: { marginLeft: 6, fontWeight: "bold", color: "#16a34a" },
  empty: { justifyContent: "center", alignItems: "center", padding: 20 },
});
