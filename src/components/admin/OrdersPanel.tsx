import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { dataService } from '../../services/dataService';
import { deliveryService } from '../../services/deliveryService';
import { deliveryOrderService } from '../../services/deliveryOrderService';
import { Order } from '../../types';
import { Clock, Truck } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { OrdersSummaryCards } from './orders/OrdersSummaryCards';
import { OrderCard } from './orders/OrderCard';

export const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh orders every 10 seconds
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const allOrders = await dataService.getOrders();
      
      console.log('All orders loaded:', allOrders.length);
      console.log('Orders with delivery info:', allOrders.filter(o => o.delivery_info).length);
      console.log('Orders in preparing status:', allOrders.filter(o => o.status === 'preparing').length);
      console.log('Out for delivery orders:', allOrders.filter(o => o.status === 'out_for_delivery' && o.delivery_info?.isDelivery).length);
      
      // Validação dos dados dos pedidos
      const validOrders = allOrders.filter(order => 
        order && order.id && Array.isArray(order.items)
      );
      
      setOrders(validOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Erro ao carregar pedidos');
      toast({
        title: "Erro ao carregar pedidos",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'preparing' | 'out_for_delivery' | 'completed') => {
    try {
      console.log('Attempting to update order status:', { orderId, status });
      
      // Find the order to get delivery info
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        throw new Error('Pedido não encontrado');
      }
      
      console.log('Found order:', order);
      console.log('Calling dataService.updateOrderStatus...');
      
      await dataService.updateOrderStatus(orderId, status);
      console.log('Order status updated successfully in database');
      
      await loadOrders(); // Reload orders after update
      
      // Send delivery notification if it's a delivery order
      if (order?.delivery_info?.isDelivery && order.delivery_info.customerWhatsapp) {
        try {
          await deliveryService.updateDeliveryStatus(orderId, status, {
            customerName: order.delivery_info.customerName,
            customerWhatsapp: order.delivery_info.customerWhatsapp
          });
        } catch (deliveryError) {
          console.warn('Failed to send delivery notification:', deliveryError);
          // Don't throw error as order status was updated successfully
        }
      }
      
      const statusMessages = {
        preparing: 'Pedido em preparo',
        out_for_delivery: 'Pedido saiu para entrega',
        completed: 'Pedido entregue'
      };
      
      toast({
        title: "Status atualizado!",
        description: statusMessages[status as keyof typeof statusMessages] || 'Status atualizado',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Tente novamente. Verifique a conexão com o banco de dados.",
        variant: "destructive"
      });
    }
  };

  const sendToDelivery = async (orderId: string) => {
    try {
      // Encontrar o pedido
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Pedido não encontrado');
      }

      console.log('Sending order to delivery:', orderId);
      console.log('Order data:', order);

      // Primeiro criar delivery order para o delivery-management
      const deliveryOrderData = {
        id: uuidv4(), // Gerar um UUID válido
        customer_name: order.delivery_info?.customerName || 'Cliente',
        customer_address: order.delivery_info?.customerAddress || '',
        customer_whatsapp: order.delivery_info?.customerWhatsapp || '',
        order_items: order.items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total_amount: order.total,
        status: 'pending' as const,
        original_order_id: orderId
      };

      console.log('Creating delivery order:', deliveryOrderData);
      
      // Salvar no delivery orders
      await deliveryOrderService.createDeliveryOrder(deliveryOrderData);
      
      console.log('Delivery order created successfully');

      // Depois atualizar status para out_for_delivery
      await updateOrderStatus(orderId, 'out_for_delivery');
      
      console.log('Order status updated to out_for_delivery');
      
      // Recarregar pedidos para atualizar a interface imediatamente
      await loadOrders();
      
      toast({
        title: "Enviado para delivery!",
        description: "O pedido foi enviado para o controle de delivery.",
      });
    } catch (error) {
      console.error('Error sending to delivery:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar para delivery",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fastfood-red mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadOrders} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Mostramos apenas pedidos em preparing na aba pedidos
  const activeOrders = orders.filter(order => 
    order.status === 'preparing'
  );

  return (
    <div className="space-y-6">
      <OrdersSummaryCards orders={orders} />

      {/* Active Orders - Pedidos em Produção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Controle de Produção - Pedidos Ativos ({activeOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-gray-600">Nenhum pedido em produção no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  onSendToDelivery={sendToDelivery}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};