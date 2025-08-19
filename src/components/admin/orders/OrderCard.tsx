import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardContent } from '../../../components/ui/card';
import { Order } from '../../../types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Ícone Truck
import { PrintOrderButton } from '../PrintOrderButton';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderActionButtons } from './OrderActionButtons';
import { ReceiptViewDialog } from '../ReceiptViewDialog';
import { DeliveryInfoCard } from './DeliveryInfoCard';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onSendToDelivery?: (orderId: string) => void;
}

export const OrderCard = ({ order, onUpdateStatus, onSendToDelivery }: OrderCardProps) => {
  const isDeliveryOrder = order.delivery_info?.isDelivery;

  const formatCombinedPizza = (customizations: string[] | undefined, fallbackName: string): string => {
    if (!customizations || customizations.length === 0) return fallbackName;
    
    const combinationCustomization = customizations.find(c => c.startsWith('Combinação:'));
    if (!combinationCustomization) return fallbackName;
    
    const flavorsMatch = combinationCustomization.match(/Combinação: (.+) \+ (.+)/);
    if (flavorsMatch) {
      const [, flavor1, flavor2] = flavorsMatch;
      return `1/2 ${flavor1} e 1/2 ${flavor2}`;
    }
    
    return fallbackName;
  };

  if (!order || !order.id || !order.items) {
    return (
      <Card style={[styles.card, { borderLeftColor: 'red' }]}>
        <CardContent style={styles.content}>
          <Text style={{ color: 'red' }}>Erro: Dados do pedido incompletos</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, { borderLeftColor: isDeliveryOrder ? '#F97316' : '#DC2626' }]}>
      <CardContent style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderId}>#{order.id.slice(-6)}</Text>
            {isDeliveryOrder && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="truck" size={12} color="#C2410C" style={{ marginRight: 4 }} />
                <Text style={styles.badgeText}>Delivery</Text>
              </View>
            )}
            <OrderStatusBadge status={order.status} />
          </View>

          <View style={styles.headerRight}>
            {order.payment_receipt && (
              <ReceiptViewDialog receiptUrl={order.payment_receipt} orderId={order.id} />
            )}
            <PrintOrderButton order={order} isDeliveryOrder={isDeliveryOrder} />
            <Text style={styles.time}>
              {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Delivery Info */}
        {isDeliveryOrder && order.delivery_info && (
          <DeliveryInfoCard deliveryInfo={order.delivery_info} observation={order.observation} />
        )}

        {/* Items */}
        <View style={styles.itemsContainer}>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemRow}>
                <Text>{item.quantity}x {formatCombinedPizza(item.customizations, item.menuItem?.name || item.name || 'Item sem nome')}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noItems}>Nenhum item encontrado</Text>
          )}
        </View>

        {/* Total & ETA */}
        <View style={styles.footer}>
          <Text style={styles.total}>R$ {(order.total || 0).toFixed(2).replace('.', ',')}</Text>
          <Text style={styles.eta}>~{order.estimatedTime || 0} min</Text>
        </View>

        <OrderActionButtons 
          order={order}
          onUpdateStatus={onUpdateStatus}
          onSendToDelivery={onSendToDelivery}
        />
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#C2410C',
    fontSize: 10,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noItems: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  total: {
    fontWeight: 'bold',
    color: '#DC2626',
  },
  eta: {
    fontSize: 12,
    color: '#6B7280',
  },
});
