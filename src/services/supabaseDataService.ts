import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuItem, Order, Category, CartItem } from "../types";
import { WeeklyCombo, DeliveryOrder } from "./types";
import { categoryService } from "./categoryService";
import { menuItemService } from "./menuItemService";
import { orderService } from "./orderService";
import { weeklyComboService } from "./weeklyComboService";
import { deliveryOrderService } from "./deliveryOrderService";
import { BaseService } from "./baseService";

class SupabaseDataService extends BaseService {
  // ------------------- Categories -------------------
  async getCategories(): Promise<Category[]> {
    return categoryService.getCategories();
  }

  async saveCategory(category: Category): Promise<void> {
    return categoryService.saveCategory(category);
  }

  // ------------------- Menu Items -------------------
  async getMenuItems(): Promise<MenuItem[]> {
    return menuItemService.getMenuItems();
  }

  async saveMenuItem(item: MenuItem): Promise<void> {
    return menuItemService.saveMenuItem(item);
  }

  async deleteMenuItem(id: string): Promise<void> {
    return menuItemService.deleteMenuItem(id);
  }

  // ------------------- Orders -------------------
  async getOrders(): Promise<Order[]> {
    return orderService.getOrders();
  }

  async getAllOrdersForReports(): Promise<Order[]> {
    return orderService.getAllOrdersForReports();
  }

  async saveOrder(orderData: {
    items: { menuItem: any; quantity: number; id: string }[];
    total: number;
    deliveryInfo?: any;
    observation?: string;
  }): Promise<string> {
    return orderService.saveOrder(orderData);
  }

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    return orderService.updateOrderStatus(orderId, status);
  }

  async updatePaymentMethod(
    orderId: string,
    paymentMethod: "PIX" | "CARD" | "MONEY"
  ): Promise<void> {
    return orderService.updatePaymentMethod(orderId, paymentMethod);
  }

  async updatePaymentMethodWithChangeAmount(
    orderId: string,
    paymentMethod: "PIX" | "CARD" | "MONEY",
    changeAmount?: number
  ): Promise<void> {
    return orderService.updatePaymentMethodWithChangeAmount(orderId, paymentMethod, changeAmount);
  }

  // Upload de recibo (React Native → fileUri do ImagePicker)
  async uploadReceiptAndUpdateOrder(orderId: string, fileUri: string): Promise<string> {
    return orderService.uploadReceiptAndUpdateOrder(orderId, fileUri);
  }

  // ------------------- Weekly Combos -------------------
  async getActiveWeeklyCombos(): Promise<WeeklyCombo[]> {
    return weeklyComboService.getActiveWeeklyCombos();
  }

  // ------------------- Delivery Orders -------------------
  async getDeliveryOrders(): Promise<DeliveryOrder[]> {
    return deliveryOrderService.getDeliveryOrders();
  }

  async updateDeliveryOrderStatus(
    orderId: string,
    status: "pending" | "in_delivery" | "delivered"
  ): Promise<void> {
    return deliveryOrderService.updateDeliveryOrderStatus(orderId, status);
  }

  async assignDeliveryPerson(orderId: string, deliveryPerson: string): Promise<void> {
    return deliveryOrderService.assignDeliveryPerson(orderId, deliveryPerson);
  }

  async createDeliveryFromOrder(
    orderId: string,
    customerData: {
      customer_name: string;
      customer_address: string;
      customer_whatsapp: string;
    }
  ): Promise<string> {
    return deliveryOrderService.createDeliveryFromOrder(orderId, customerData);
  }

  // ------------------- Cart (AsyncStorage no lugar do localStorage) -------------------
  async getCart(): Promise<CartItem[]> {
    const json = await AsyncStorage.getItem("cart");
    return json ? JSON.parse(json) : [];
  }

  async saveCart(cart: CartItem[]): Promise<void> {
    await AsyncStorage.setItem("cart", JSON.stringify(cart));
  }

  async clearCart(): Promise<void> {
    await AsyncStorage.removeItem("cart");
  }
}

export const supabaseDataService = new SupabaseDataService();
