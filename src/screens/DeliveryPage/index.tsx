import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../types/"; // ou onde você salvar

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const navigation = useNavigation<NavigationProp>();

import { MenuItem, CartItem } from "../../types";
import { supabaseDataService as dataService } from "../../services/supabaseDataService";

const DELIVERY_FEE = 2.0;

export const DeliveryPage = () => {
  // const navigation = useNavigation();

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerObservation, setCustomerObservation] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "pix" | "card" | "money" | null
  >(null);

  useEffect(() => {
    loadData();
    loadCart();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const items = await dataService.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      Alert.alert("Erro", "Erro ao carregar o cardápio");
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    const savedCart = await AsyncStorage.getItem("delivery_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = async (newCart: CartItem[]) => {
    setCart(newCart);
    await AsyncStorage.setItem("delivery_cart", JSON.stringify(newCart));
  };

  const addToCart = (menuItem: MenuItem) => {
    const existing = cart.find((c) => c.menuItem.id === menuItem.id);
    if (existing) {
      saveCart(
        cart.map((c) =>
          c.menuItem.id === menuItem.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      saveCart([...cart, { id: Date.now().toString(), menuItem, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    saveCart(cart.filter((c) => c.id !== id));
  };

  const getSubtotal = () =>
    cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const getTotal = () => getSubtotal() + DELIVERY_FEE;

  const handleSubmit = async () => {
    if (
      !customerName ||
      !customerAddress ||
      !customerWhatsapp ||
      !customerCpf ||
      !customerEmail
    ) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Erro", "Adicione itens ao carrinho");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: cart,
        total: getTotal(),
        deliveryInfo: {
          customerName,
          customerAddress,
          customerWhatsapp,
          isDelivery: true,
        },
        observation: customerObservation,
      };
      const newOrderId = await dataService.saveOrder(orderData);
      setOrderId(newOrderId);
      Alert.alert("Sucesso", "Pedido criado, escolha a forma de pagamento!");
    } catch (err) {
      Alert.alert("Erro", "Falha ao criar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePixPayment = async () => {
    if (!orderId) return;
    try {
      await dataService.updatePaymentMethod(orderId, "PIX");
      navigation.navigate("OrderSuccess")
    } catch {
      Alert.alert("Erro", "Falha no pagamento PIX");
    }
  };

  const handleCardPayment = async () => {
    if (!orderId) return;
    try {
      await dataService.updatePaymentMethod(orderId, "CARD");
      navigation.navigate("OrderSuccess");
    } catch {
      Alert.alert("Erro", "Falha no pagamento cartão");
    }
  };

  const handleMoneyPayment = async () => {
    if (!orderId) return;
    try {
      await dataService.updatePaymentMethodWithChangeAmount(orderId, "MONEY", 0);
      navigation.navigate("OrderSuccess");
    } catch {
      Alert.alert("Erro", "Falha no pagamento dinheiro");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f00" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚚 Delivery</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={customerName}
        onChangeText={setCustomerName}
      />
      <TextInput
        style={styles.input}
        placeholder="WhatsApp"
        value={customerWhatsapp}
        onChangeText={setCustomerWhatsapp}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={customerEmail}
        onChangeText={setCustomerEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={customerCpf}
        onChangeText={setCustomerCpf}
      />
      <TextInput
        style={styles.input}
        placeholder="Endereço completo"
        value={customerAddress}
        onChangeText={setCustomerAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Observações"
        value={customerObservation}
        onChangeText={setCustomerObservation}
      />

      <Text style={styles.subtitle}>Carrinho:</Text>
      {cart.map((item) => (
        <View key={item.id} style={styles.cartItem}>
          <Text>
            {item.quantity}x {item.menuItem.name}
          </Text>
          <TouchableOpacity onPress={() => removeFromCart(item.id)}>
            <Text style={{ color: "red" }}>Remover</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text>Subtotal: R$ {getSubtotal().toFixed(2)}</Text>
      <Text>Entrega: R$ {DELIVERY_FEE.toFixed(2)}</Text>
      <Text>Total: R$ {getTotal().toFixed(2)}</Text>

      {!orderId ? (
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Enviando..." : "Criar Pedido"}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.subtitle}>Pagamento:</Text>
          <TouchableOpacity style={styles.button} onPress={handlePixPayment}>
            <Text style={styles.buttonText}>Pagar com PIX</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleCardPayment}>
            <Text style={styles.buttonText}>Pagar com Cartão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleMoneyPayment}>
            <Text style={styles.buttonText}>Pagar com Dinheiro</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#e11d48",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
});
