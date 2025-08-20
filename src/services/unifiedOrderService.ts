// services/unifiedOrderService.ts

import { supabase } from '../integrations/supabase/client'; // ajuste o caminho conforme sua pasta
import { Order } from '../types';

/**
 * Unified Order Service
 * 
 * Sincroniza `orders` e `delivery_orders` para manter consistência no status.
 */
class UnifiedOrderService {
  /**
   * Atualiza status da ordem com sincronização entre as tabelas
   */
  async updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<void> {
    try {
      // Verifica se existe em delivery_orders
      const { data: deliveryOrderData, error: deliveryError } = await supabase
        .from('delivery_orders')
        .select('id, original_order_id')
        .eq('id', orderId)
        .single();

      if (deliveryError) throw deliveryError;

      if (deliveryOrderData) {
        // É um delivery_order → mapeia status
        const deliveryStatus = this.mapOrderStatusToDeliveryStatus(newStatus);
        
        await supabase
          .from('delivery_orders')
          .update({ 
            status: deliveryStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        // Atualiza order original, se existir
        if (deliveryOrderData.original_order_id) {
          await supabase
            .from('orders')
            .update({ 
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', deliveryOrderData.original_order_id);
        }
      } else {
        // É um order normal
        await supabase
          .from('orders')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        // Verifica se tem delivery_order correspondente
        const { data: linkedDeliveryOrder } = await supabase
          .from('delivery_orders')
          .select('id')
          .eq('original_order_id', orderId)
          .single();

        if (linkedDeliveryOrder) {
          const deliveryStatus = this.mapOrderStatusToDeliveryStatus(newStatus);
          await supabase
            .from('delivery_orders')
            .update({ 
              status: deliveryStatus,
              updated_at: new Date().toISOString()
            })
            .eq('original_order_id', orderId);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Mapeia status de Order → DeliveryOrder
   */
  private mapOrderStatusToDeliveryStatus(orderStatus: Order['status']): string {
    switch (orderStatus) {
      case 'preparing':
        return 'pending';
      case 'out_for_delivery':
        return 'in_delivery';
      case 'completed':
        return 'delivered';
      default:
        return 'pending';
    }
  }

  /**
   * Mapeia status de DeliveryOrder → Order
   */
  mapDeliveryStatusToOrderStatus(deliveryStatus: string): Order['status'] {
    switch (deliveryStatus) {
      case 'pending':
        return 'preparing';
      case 'in_delivery':
        return 'out_for_delivery';
      case 'delivered':
        return 'completed';
      default:
        return 'preparing';
    }
  }

  /**
   * Retorna ordens unificadas das duas tabelas
   */
  async getUnifiedOrders(): Promise<Order[]> {
    console.log('[UnifiedOrderService] Fetching unified orders...');
    try {
      const [ordersData, deliveryOrdersData] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              menu_items (*)
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('delivery_orders')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (ordersData.error) throw ordersData.error;
      if (deliveryOrdersData.error) throw deliveryOrdersData.error;

      const allOrders: Order[] = [];

      // Processa orders normais
      if (ordersData.data) {
        for (const order of ordersData.data) {
          allOrders.push({
            id: order.id,
            total: Number(order.total),
            status: order.status as Order['status'],
            estimatedTime: order.estimated_time,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            observation: order.observation,
            payment_status: order.payment_status as Order['payment_status'],
            payment_method: order.payment_method as Order['payment_method'],
            transaction_id: order.transaction_id,
            change_amount: order.change_amount ? Number(order.change_amount) : undefined,
            payment_receipt: order.payment_receipt,
            delivery_info: order.delivery_info as Order['delivery_info'],
            items: order.order_items?.map((item: any) => ({
              id: item.id,
              orderId: item.order_id,
              menuItemId: item.menu_item_id,
              quantity: item.quantity,
              price: Number(item.price),
              name: item.menu_items?.name || 'Item',
              menuItem: item.menu_items ? {
                id: item.menu_items.id,
                name: item.menu_items.name,
                description: item.menu_items.description,
                price: Number(item.menu_items.price),
                image: item.menu_items.image,
                category: item.menu_items.category_id,
                available: item.menu_items.available,
                preparation_time: item.menu_items.preparation_time
              } : {} as any,
              customizations: item.customizations || []
            })) || []
          });
        }
      }

      // Processa delivery_orders
      if (deliveryOrdersData.data) {
        for (const deliveryOrder of deliveryOrdersData.data) {
          const existingOrderIndex = allOrders.findIndex(
            order => order.id === deliveryOrder.original_order_id
          );

          const convertedOrder: Order = {
            id: deliveryOrder.id,
            total: Number(deliveryOrder.total_amount),
            status: this.mapDeliveryStatusToOrderStatus(deliveryOrder.status),
            estimatedTime: 30,
            createdAt: deliveryOrder.created_at,
            updatedAt: deliveryOrder.updated_at,
            observation: (deliveryOrder as any).observation || undefined,
            payment_status: (deliveryOrder.payment_status as Order['payment_status']) || 'pending',
            payment_method: (deliveryOrder.payment_method as Order['payment_method']) || null,
            transaction_id: deliveryOrder.transaction_id || undefined,
            change_amount: deliveryOrder.change_amount ? Number(deliveryOrder.change_amount) : undefined,
            payment_receipt: deliveryOrder.payment_receipt || undefined,
            delivery_info: {
              isDelivery: true,
              customerName: deliveryOrder.customer_name,
              customerAddress: deliveryOrder.customer_address,
              customerWhatsapp: deliveryOrder.customer_whatsapp,
              deliveryPersonName: deliveryOrder.delivery_person_name ?? undefined
            },
            items: Array.isArray(deliveryOrder.order_items) 
              ? deliveryOrder.order_items.map((item: any) => ({
                  id: `delivery-${deliveryOrder.id}-${item.menuItemId}`,
                  orderId: deliveryOrder.id,
                  menuItemId: item.menuItemId,
                  quantity: item.quantity,
                  price: Number(item.price),
                  name: item.name || 'Item',
                  menuItem: {
                    id: item.menuItemId,
                    name: item.name || 'Item',
                    description: '',
                    price: Number(item.price),
                    image: '',
                    category: '',
                    available: true,
                    preparation_time: 0,
                    combinationData: item.combinationData
                  },
                  customizations: []
                }))
              : []
          };

          if (existingOrderIndex >= 0) {
            allOrders[existingOrderIndex] = convertedOrder;
          } else {
            allOrders.push(convertedOrder);
          }
        }
      }

      // Ordena por data
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log(`[UnifiedOrderService] Unificadas ${allOrders.length} ordens`);
      return allOrders;
    } catch (error) {
      console.error('Error fetching unified orders:', error);
      throw error;
    }
  }
}

export const unifiedOrderService = new UnifiedOrderService();
