import { supabase } from '../integrations/supabase/client';
import { DeliveryOrder } from './types';

// Serviço de pedidos de entrega
class DeliveryOrderService {
    async getDeliveryOrders(): Promise<DeliveryOrder[]> {
        const { data, error } = await supabase
            .from('delivery_orders')
            .select(`
        *,
        orders:original_order_id (
          raffle_number
        )
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data ?? []).map(order => ({
            id: order.id,
            customer_name: order.customer_name,
            customer_address: order.customer_address,
            customer_whatsapp: order.customer_whatsapp,
            order_items: (order.order_items ?? []) as {
                menuItemId: string;
                name: string;
                price: number;
                quantity: number;
            }[],
            total_amount: Number(order.total_amount),
            status: order.status as 'pending' | 'in_delivery' | 'delivered',
            delivery_person: order.delivery_person ?? undefined, // null → undefined
            original_order_id: order.original_order_id ?? undefined, // null → undefined
            raffle_number: order.orders?.raffle_number ?? undefined, // null → undefined
            created_at: order.created_at,
            updated_at: order.updated_at,
        }));


    }

    async updateDeliveryOrderStatus(
        orderId: string,
        status: 'pending' | 'in_delivery' | 'delivered'
    ): Promise<void> {
        const { error } = await supabase
            .from('delivery_orders')
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (error) throw error;
    }

    async assignDeliveryPerson(orderId: string, deliveryPerson: string): Promise<void> {
        const { error } = await supabase
            .from('delivery_orders')
            .update({
                delivery_person: deliveryPerson,
                delivery_person_name: deliveryPerson,
                status: 'in_delivery',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (error) throw error;
    }

    async createDeliveryFromOrder(
        orderId: string,
        customerData: {
            customer_name: string;
            customer_address: string;
            customer_whatsapp: string;
        }
    ): Promise<string> {
        console.log(`[DeliveryOrderService] Creating delivery from order ${orderId}`);

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (
          * ,
          menu_items (*)
        )
      `)
            .eq('id', orderId)
            .single();

        if (orderError || !orderData) throw orderError;

        const deliveryOrder = {
            customer_name: customerData.customer_name,
            customer_address: customerData.customer_address,
            customer_whatsapp: customerData.customer_whatsapp,
            order_items: (orderData.order_items ?? []).map((item: any) => ({
                menuItemId: item.menu_item_id,
                name: item.menu_items?.name,
                price: Number(item.price),
                quantity: item.quantity,
                combinationData: item.menu_items?.combinationData,
            })),
            total_amount: Number(orderData.total),
            status: 'pending' as const,
            original_order_id: orderId,
            payment_method: orderData.payment_method,
            payment_status: orderData.payment_status,
            transaction_id: orderData.transaction_id,
            change_amount: orderData.change_amount,
            payment_receipt: orderData.payment_receipt,
            observation: orderData.observation,
            raffle_number: orderData.raffle_number,
            delivery_person: null, // inicializa como null
        };

        const { data, error } = await supabase
            .from('delivery_orders')
            .insert(deliveryOrder)
            .select()
            .single();

        if (error || !data) throw error;

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'out_for_delivery',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        return data.id;
    }

    async createDeliveryOrder(deliveryOrderData: {
        id: string;
        customer_name: string;
        customer_address: string;
        customer_whatsapp: string;
        order_items: {
            menuItemId: string;
            name: string;
            price: number;
            quantity: number;
        }[];
        total_amount: number;
        status: 'pending' | 'in_delivery' | 'delivered';
        original_order_id: string;
        delivery_person?: string | null; // aceita null
    }): Promise<void> {
        const { error } = await supabase
            .from('delivery_orders')
            .insert(deliveryOrderData);

        if (error) throw error;
    }
}

export const deliveryOrderService = new DeliveryOrderService();
