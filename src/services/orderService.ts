import { supabase } from "../integrations/supabase/client";
import { Order } from "../types";
import { BaseService } from "./baseService";
import { v4 as uuidv4 } from "uuid";

class OrderService extends BaseService {
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            menu_items (*)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      return data.map((order: any) => ({
        id: order.id,
        status: order.status as Order["status"],
        total: Number(order.total),
        estimatedTime: order.estimated_time,
        items: order.order_items.map((item: any) => ({
          id: item.id,
          orderId: order.id,
          menuItemId: item.menu_item_id,
          name: item.menu_items.name,
          price: Number(item.price),
          quantity: item.quantity,
          menuItem: item.menu_items,
          customizations: item.customizations || [],
        })),
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        observation: order.observation || null,
        payment_status:
          (order.payment_status as
            | "pending"
            | "paid"
            | "cancelled"
            | "expired") || "pending",
        payment_method:
          (order.payment_method as "PIX" | "CARD" | "MONEY") || null,
        transaction_id: order.transaction_id || null,
        change_amount: order.change_amount ? Number(order.change_amount) : null,
        payment_receipt: order.payment_receipt || null,
        raffle_number: order.raffle_number || null,
        delivery_info: order.delivery_info
          ? {
              customerName: (order.delivery_info as any).customerName || "",
              customerAddress: (order.delivery_info as any).customerAddress || "",
              customerWhatsapp: (order.delivery_info as any).customerWhatsapp || "",
              isDelivery: (order.delivery_info as any).isDelivery || false,
            }
          : undefined,
      }));
    } catch (error) {
      console.error("Error in getOrders:", error);
      throw error;
    }
  }

  async getAllOrdersForReports(): Promise<Order[]> {
    return this.getOrders();
  }

  async saveOrder(orderData: {
    items: { menuItem: any; quantity: number; id: string }[];
    total: number;
    deliveryInfo?: any;
    observation?: string;
  }): Promise<string> {
    try {
      const orderId = uuidv4(); // ✅ uuid no lugar de crypto.randomUUID()

      // Número de rifa
      const raffleNumber = this.generateRaffleNumber();

      const order = {
        id: orderId,
        status: "preparing",
        total: orderData.total,
        estimated_time: 30,
        delivery_info: orderData.deliveryInfo || null,
        observation: orderData.observation || null,
        raffle_number: raffleNumber,
      };

      const { error: orderError } = await supabase.from("orders").insert(order);

      if (orderError) {
        console.error("Error saving order:", orderError);
        throw orderError;
      }

      // Itens
      const orderItems = orderData.items.map((item) => {
        const menuItem = item.menuItem;
        let menuItemId = menuItem.id;
        let customizations: string[] = [];

        if (menuItem.id.startsWith("combo-")) {
          if (menuItem.combinationData) {
            menuItemId = menuItem.combinationData.first.id;
            customizations = [
              `Combinação: ${menuItem.combinationData.first.name} + ${menuItem.combinationData.second.name}`,
            ];
          } else {
            const comboIds = menuItem.id.replace("combo-", "").split("-");
            if (comboIds.length >= 1) {
              menuItemId = comboIds[0];
              customizations = [`Pizza combinada: ${menuItem.name}`];
            }
          }
        }

        return {
          order_id: orderId,
          menu_item_id: menuItemId,
          quantity: item.quantity,
          price: menuItem.price,
          customizations: customizations.length > 0 ? customizations : null,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error saving order items:", itemsError);
        throw itemsError;
      }

      return orderId;
    } catch (error) {
      console.error("Error in saveOrder:", error);
      throw error;
    }
  }

  // orderService.ts
async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (error) throw error;
}


  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    const isAdminUser = await this.isAdmin();
    if (!isAdminUser) throw new Error("Unauthorized: Admin access required");

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) throw error;
  }

  async updatePaymentMethod(
    orderId: string,
    paymentMethod: "PIX" | "CARD" | "MONEY"
  ): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({ payment_method: paymentMethod, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) throw error;
  }

  async updatePaymentMethodWithChangeAmount(
    orderId: string,
    paymentMethod: "PIX" | "CARD" | "MONEY",
    changeAmount?: number
  ): Promise<void> {
    const updateData: any = {
      payment_method: paymentMethod,
      updated_at: new Date().toISOString(),
    };

    if (changeAmount !== undefined) updateData.change_amount = changeAmount;

    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) throw error;
  }

  async uploadReceiptAndUpdateOrder(orderId: string, fileUri: string): Promise<string> {
    try {
      // No RN, fileUri vem do ImagePicker
      const fileExt = fileUri.split(".").pop();
      const fileName = `${orderId}-${Date.now()}.${fileExt}`;

      // Lê o arquivo como blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("payment-receipts")
        .getPublicUrl(fileName);

      await supabase
        .from("orders")
        .update({ payment_receipt: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      return publicUrl;
    } catch (error) {
      console.error("Error in uploadReceiptAndUpdateOrder:", error);
      throw error;
    }
  }

  private generateRaffleNumber(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const orderService = new OrderService();
