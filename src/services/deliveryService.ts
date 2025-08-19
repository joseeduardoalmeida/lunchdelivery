// src/services/DeliveryService.ts
import { supabase } from "../integrations/supabase/client";

export interface DeliveryNotification {
  customer_whatsapp: string;
  customer_name: string;
  order_id: string;
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "ready_for_delivery"
    | "out_for_delivery"
    | "completed";
  message: string;
}

class DeliveryService {
  async sendDeliveryNotification(
    notification: DeliveryNotification
  ): Promise<void> {
    try {
      console.log("Sending delivery notification:", notification);

      // Chama função edge do Supabase
      const { data, error } = await supabase.functions.invoke(
        "send-delivery-notification",
        {
          body: notification,
        }
      );

      if (error) {
        console.error("Error calling notification function:", error);
        throw error;
      }

      console.log("Notification sent successfully:", data);
    } catch (error) {
      console.error("Error sending delivery notification:", error);
      // não lança o erro para não travar atualização do pedido
    }
  }

  async createDeliveryOrder(
    orderId: string,
    deliveryInfo: {
      customerName: string;
      customerAddress: string;
      customerWhatsapp: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          delivery_info: {
            customerName: deliveryInfo.customerName,
            customerAddress: deliveryInfo.customerAddress,
            customerWhatsapp: deliveryInfo.customerWhatsapp,
            isDelivery: true,
          },
        })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order with delivery info:", error);
        throw error;
      }

      // Envia notificação inicial
      await this.updateDeliveryStatus(orderId, "out_for_delivery", {
        customerName: deliveryInfo.customerName,
        customerWhatsapp: deliveryInfo.customerWhatsapp,
      });
    } catch (error) {
      console.error("Error creating delivery order:", error);
      throw error;
    }
  }

  async updateDeliveryStatus(
    orderId: string,
    status:
      | "pending"
      | "preparing"
      | "ready"
      | "ready_for_delivery"
      | "out_for_delivery"
      | "completed",
    customerInfo?: {
      customerName: string;
      customerWhatsapp: string;
    }
  ): Promise<void> {
    if (!customerInfo) return;

    const messages: Record<typeof status, string> = {
      pending: `Olá ${customerInfo.customerName}! Recebemos seu pedido #${orderId.slice(
        -6
      )} e já estamos preparando tudo com carinho!`,
      preparing: `Olá ${customerInfo.customerName}! Seu pedido #${orderId.slice(
        -6
      )} está sendo preparado com carinho. Em breve estará pronto!`,
      ready: `${customerInfo.customerName}, seu pedido #${orderId.slice(
        -6
      )} está pronto e será enviado para entrega em breve!`,
      ready_for_delivery: `${customerInfo.customerName}, seu pedido #${orderId.slice(
        -6
      )} foi enviado para o delivery e será atribuído a um entregador em breve!`,
      out_for_delivery: `Seu pedido #${orderId.slice(
        -6
      )} saiu para entrega! Nosso entregador está a caminho.`,
      completed: `Pedido #${orderId.slice(
        -6
      )} entregue com sucesso! Obrigado por escolher nossos serviços, ${customerInfo.customerName}!`,
    };

    await this.sendDeliveryNotification({
      customer_whatsapp: customerInfo.customerWhatsapp,
      customer_name: customerInfo.customerName,
      order_id: orderId,
      status,
      message: messages[status],
    });
  }
}

export const deliveryService = new DeliveryService();
