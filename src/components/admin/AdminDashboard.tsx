import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { LogOut, ShoppingCart, Menu as MenuIcon, BarChart3, Gift, Settings, TrendingUp } from 'lucide-react-native';

import { OrdersPanel } from './OrdersPanel';
import { MenuPanel } from './MenuPanel';
import { SalesReportsPanel } from './SalesReportsPanel';
import { WeeklyCombosPanel } from './WeeklyCombosPanel';
import { DeliveryStatsPanel } from './DeliveryStatsPanel';
import { RafflePanel } from './RafflePanel';
import { HeaderSettingsPanel } from './HeaderSettingsPanel';
import { CategoryAvailabilityPanel } from './CategoryAvailabilityPanel';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'orders', title: 'Pedidos', icon: ShoppingCart },
    { key: 'menu', title: 'Cardápio', icon: MenuIcon },
    { key: 'combos', title: 'Combos', icon: Gift },
    { key: 'deliveryStats', title: 'Estatísticas', icon: TrendingUp },
    { key: 'raffle', title: 'Sorteio', icon: Gift },
    { key: 'reports', title: 'Relatórios', icon: BarChart3 },
    { key: 'settings', title: 'Configurações', icon: Settings },
  ]);

  const renderScene = SceneMap({
    orders: OrdersPanel,
    menu: MenuPanel,
    combos: WeeklyCombosPanel,
    deliveryStats: DeliveryStatsPanel,
    raffle: RafflePanel,
    reports: SalesReportsPanel,
    settings: () => (
      <View style={styles.settings}>
        <CategoryAvailabilityPanel />
        <HeaderSettingsPanel />
      </View>
    ),
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🍔</Text>
          <View>
            <Text style={styles.title}>Lunch Delivery Admin</Text>
            <Text style={styles.subtitle}>Painel de Controle</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <LogOut size={18} color="#333" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={{ backgroundColor: '#ef4444' }} // vermelho app-red
            style={{ backgroundColor: 'white' }}
            renderLabel={({ route, focused }) => {
              const Icon = route.icon;
              return (
                <View style={styles.tabItem}>
                  <Icon size={16} color={focused ? '#ef4444' : '#555'} />
                  <Text style={[styles.tabLabel, focused && { color: '#ef4444' }]}>
                    {route.title}
                  </Text>
                </View>
              );
            }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { fontSize: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoutText: { marginLeft: 4, color: '#333' },
  settings: { padding: 16, gap: 16 },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 12 },
});
