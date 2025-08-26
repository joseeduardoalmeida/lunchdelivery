import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  TabView,
  SceneMap,
  TabBar,
  Route,
} from 'react-native-tab-view';

import type { LucideIcon } from 'lucide-react-native';
import {
  LogOut,
  ShoppingCart,
  Menu as MenuIcon,
  BarChart3,
  Gift,
  Settings,
  TrendingUp,
} from 'lucide-react-native';

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

// Rota customizada
interface DashboardRoute extends Route {
  title: string;
  tabIcon: LucideIcon;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [index, setIndex] = useState<number>(0);
  const [routes] = useState<DashboardRoute[]>([
    { key: 'orders', title: 'Pedidos', tabIcon: ShoppingCart },
    { key: 'menu', title: 'Cardápio', tabIcon: MenuIcon },
    { key: 'combos', title: 'Combos', tabIcon: Gift },
    { key: 'deliveryStats', title: 'Estatísticas', tabIcon: TrendingUp },
    { key: 'raffle', title: 'Sorteio', tabIcon: Gift },
    { key: 'reports', title: 'Relatórios', tabIcon: BarChart3 },
    { key: 'settings', title: 'Configurações', tabIcon: Settings },
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

  // Render TabBar com cast explícito para evitar erro de TypeScript
  const renderTabBar = (props: any) => (
    <TabBar<DashboardRoute>
      {...(props)} // cast explícito para "any"
      scrollEnabled
      indicatorStyle={{ backgroundColor: '#ef4444' }}
      style={{ backgroundColor: 'white' }}
      renderLabel={({ route, focused }: { route: DashboardRoute; focused: boolean }) => {
        const Icon = route.tabIcon;
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
  );

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
      <TabView<DashboardRoute>
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
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
