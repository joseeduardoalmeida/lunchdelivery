import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Button, Card, Title, Paragraph, Badge } from 'react-native-paper';
import { Calendar, Download, TrendingUp, User, Package, Clock } from 'lucide-react-native';
import { useToast } from '../../hooks/use-toast';
import { dataService } from '../../services/dataService';
import { Order } from '../../types';

interface DeliveryStats {
  deliveryPersonName: string;
  totalDeliveries: number;
  dailyDeliveries: { [date: string]: number };
  monthlyDeliveries: { [month: string]: number };
}

export const DeliveryStatsPanel = () => {
  const [stats, setStats] = useState<DeliveryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const { toast } = useToast();

  useEffect(() => {
    loadDeliveryStats();
  }, []);

  const loadDeliveryStats = async () => {
    try {
      setLoading(true);
      const orders: Order[] = await dataService.getOrders();

      const completedDeliveries = orders.filter(
        order =>
          order.status === 'completed' &&
          order.delivery_info?.isDelivery &&
          order.delivery_info?.deliveryPersonName
      );

      const statsMap: { [name: string]: DeliveryStats } = {};

      completedDeliveries.forEach(order => {
        const deliveryPersonName = order.delivery_info!.deliveryPersonName!;
        const orderDate = new Date(order.createdAt);
        const dateKey = orderDate.toISOString().split('T')[0];
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

        if (!statsMap[deliveryPersonName]) {
          statsMap[deliveryPersonName] = {
            deliveryPersonName,
            totalDeliveries: 0,
            dailyDeliveries: {},
            monthlyDeliveries: {},
          };
        }

        statsMap[deliveryPersonName].totalDeliveries++;
        statsMap[deliveryPersonName].dailyDeliveries[dateKey] =
          (statsMap[deliveryPersonName].dailyDeliveries[dateKey] || 0) + 1;
        statsMap[deliveryPersonName].monthlyDeliveries[monthKey] =
          (statsMap[deliveryPersonName].monthlyDeliveries[monthKey] || 0) + 1;
      });

      const statsArray = Object.values(statsMap).sort((a, b) => b.totalDeliveries - a.totalDeliveries);
      setStats(statsArray);
    } catch (error) {
      console.error('Error loading delivery stats:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar estatísticas de entrega',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStats = () => {
    if (viewMode === 'daily' && selectedDate) {
      return stats
        .map(stat => ({ ...stat, filteredCount: stat.dailyDeliveries[selectedDate] || 0 }))
        .filter(stat => stat.filteredCount > 0);
    }

    if (viewMode === 'monthly' && selectedMonth) {
      return stats
        .map(stat => ({ ...stat, filteredCount: stat.monthlyDeliveries[selectedMonth] || 0 }))
        .filter(stat => stat.filteredCount > 0);
    }

    return stats.map(stat => ({ ...stat, filteredCount: stat.totalDeliveries }));
  };

  const filteredStats = getFilteredStats();
  const totalDeliveries = filteredStats.reduce((sum, stat) => sum + stat.filteredCount, 0);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f87171" />
        <Text style={styles.loadingText}>Carregando estatísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header e Controles */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>📈 Estatísticas de Entregas</Title>

          <View style={styles.controlsRow}>
            {/* Modo de visualização */}
            <View style={styles.control}>
              <Text style={styles.label}>Modo de Visualização</Text>
              <RNPickerSelect
                onValueChange={(value) => setViewMode(value)}
                value={viewMode}
                items={[
                  { label: 'Por Dia', value: 'daily' },
                  { label: 'Por Mês', value: 'monthly' },
                ]}
              />
            </View>

            {/* Filtro por data */}
            {viewMode === 'daily' && (
              <View style={styles.control}>
                <Text style={styles.label}>Data Específica</Text>
                <TextInput
                  style={styles.input}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            )}

            {/* Filtro por mês */}
            {viewMode === 'monthly' && (
              <View style={styles.control}>
                <Text style={styles.label}>Mês Específico</Text>
                <TextInput
                  style={styles.input}
                  value={selectedMonth}
                  onChangeText={setSelectedMonth}
                  placeholder="YYYY-MM"
                />
              </View>
            )}
          </View>

          <Button mode="outlined" onPress={loadDeliveryStats} style={{ marginTop: 10 }}>
            Atualizar Dados
          </Button>
        </Card.Content>
      </Card>

      {/* Cards de resumo */}
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>Total de Entregas</Title>
            <Paragraph style={styles.number}>{totalDeliveries}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>Entregadores Ativos</Title>
            <Paragraph style={styles.number}>{filteredStats.length}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>Média por Entregador</Title>
            <Paragraph style={styles.number}>
              {filteredStats.length > 0 ? Math.round(totalDeliveries / filteredStats.length) : 0}
            </Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Lista de entregadores */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>👤 Ranking de Entregadores</Title>
          {filteredStats.length > 0 ? (
            filteredStats
              .sort((a, b) => b.filteredCount - a.filteredCount)
              .map((stat, index) => (
                <View key={stat.deliveryPersonName} style={[styles.rankRow, getRankRowStyle(index)]}>
                  <View style={styles.rankInfo}>
                    <View style={[styles.rankCircle, getRankCircleStyle(index)]}>
                      <Text style={styles.rankNumber}>{index + 1}</Text>
                    </View>
                    <View>
                      <Text style={styles.rankName}>{stat.deliveryPersonName}</Text>
                      <Text style={styles.rankDetails}>
                        {stat.filteredCount} entrega{stat.filteredCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <Badge>{stat.filteredCount}</Badge>
                </View>
              ))
          ) : (
            <View style={styles.centered}>
              <Text>Nenhuma entrega encontrada para o período selecionado</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#fff' },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#6b7280' },
  card: { marginVertical: 5 },
  controlsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 10 },
  control: { flex: 1, margin: 5 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#d1d5db', padding: 8, borderRadius: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  summaryCard: { flex: 1, margin: 5 },
  number: { fontSize: 24, fontWeight: 'bold', color: '#059669' },
  rankRow: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: { color: '#fff', fontWeight: 'bold' },
  rankName: { fontWeight: '600', color: '#111827' },
  rankDetails: { color: '#6b7280', fontSize: 12 },
});

const getRankCircleStyle = (index: number): ViewStyle => {
  switch (index) {
    case 0:
      return { backgroundColor: '#f59e0b' }; // ouro
    case 1:
      return { backgroundColor: '#6b7280' }; // prata
    case 2:
      return { backgroundColor: '#f97316' }; // bronze
    default:
      return { backgroundColor: '#3b82f6' }; // azul padrão
  }
};

const getRankRowStyle = (index: number): ViewStyle => {
  switch (index) {
    case 0:
      return { backgroundColor: '#fef3c7' }; // destaque ouro
    case 1:
      return { backgroundColor: '#f3f4f6' }; // destaque prata
    case 2:
      return { backgroundColor: '#ffedd5' }; // destaque bronze
    default:
      return { backgroundColor: '#ffffff' }; // padrão
  }
};
