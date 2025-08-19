import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardContent } from '../../../components/ui/card';
import { Order } from '../../../types';

interface OrdersSummaryCardsProps {
  orders: Order[];
}

export const OrdersSummaryCards = ({ orders }: OrdersSummaryCardsProps) => {
  const getTodayTotal = () => {
    try {
      const today = new Date();
      const todayOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
      return todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    } catch (error) {
      console.error('Error calculating today total:', error);
      return 0;
    }
  };

  const getTodayOrderCount = () => {
    try {
      const today = new Date();
      const todayOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
      return todayOrders.length;
    } catch (error) {
      console.error('Error calculating today order count:', error);
      return 0;
    }
  };

  const getOrdersByStatus = (status: string) => {
    try {
      return orders.filter(o => o.status === status).length;
    } catch (error) {
      console.error(`Error calculating orders by status ${status}:`, error);
      return 0;
    }
  };

  const getTodayDeliveries = () => {
    try {
      const today = new Date();
      const todayDeliveries = orders.filter(order => {
        if (!order.createdAt || order.status !== 'out_for_delivery') return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
      return todayDeliveries.length;
    } catch (error) {
      console.error('Error calculating today deliveries:', error);
      return 0;
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        <CardContent style={styles.cardContent}>
          <Text style={[styles.value, { color: '#2563EB' }]}>{getTodayOrderCount()}</Text>
          <Text style={styles.label}>Pedidos Hoje</Text>
        </CardContent>
      </Card>

      <Card>
        <CardContent style={styles.cardContent}>
          <Text style={[styles.value, { color: '#CA8A04' }]}>{getOrdersByStatus('pending')}</Text>
          <Text style={styles.label}>Pendentes</Text>
        </CardContent>
      </Card>

      <Card>
        <CardContent style={styles.cardContent}>
          <Text style={[styles.value, { color: '#2563EB' }]}>{getOrdersByStatus('preparing')}</Text>
          <Text style={styles.label}>Em Preparo</Text>
        </CardContent>
      </Card>

      <Card>
        <CardContent style={styles.cardContent}>
          <Text style={[styles.value, { color: '#16A34A' }]}>{getOrdersByStatus('ready')}</Text>
          <Text style={styles.label}>Prontos</Text>
        </CardContent>
      </Card>

      <Card>
        <CardContent style={styles.cardContent}>
          <Text style={[styles.value, { color: '#EA580C' }]}>{getTodayDeliveries()}</Text>
          <Text style={styles.label}>Delivery</Text>
        </CardContent>
      </Card>

      <Card>
        <CardContent style={styles.cardContent}>
          <Text style={[styles.value, { color: '#DC2626' }]}>
            R$ {getTodayTotal().toFixed(2).replace('.', ',')}
          </Text>
          <Text style={styles.label}>Total Hoje</Text>
        </CardContent>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 8,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#6B7280', // gray-600
  },
});
