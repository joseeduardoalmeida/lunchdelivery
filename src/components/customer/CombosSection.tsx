import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ComboCard from './ComboCard';
import { MenuItem, WeeklyCombo } from '../../types';

interface CombosSectionProps {
  combos: WeeklyCombo[];
  menuItems: MenuItem[];
  onAddComboToCart?: (combo: WeeklyCombo) => void;
  isShowcase?: boolean;
}

const CombosSection: React.FC<CombosSectionProps> = ({ combos, menuItems, onAddComboToCart, isShowcase = false }) => {
  if (!combos || combos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Combos da Semana</Text>
        <Text style={styles.subtitle}>Ofertas especiais por tempo limitado!</Text>
      </View>

      {/* Lista */}
          <FlatList<WeeklyCombo>
              data={combos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                  <ComboCard
                      combo={item}
                      menuItems={menuItems}
                      onAddToCart={onAddComboToCart}
                      isShowcase={isShowcase}
                  />
              )}
  contentContainerStyle={{ paddingBottom: 16 }}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
});

export default CombosSection;
