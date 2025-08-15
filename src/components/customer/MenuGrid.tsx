import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MenuItem } from '../../types';
import { MenuItemCard } from './MenuItemCard';

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart?: (item: MenuItem, combinations?: { first: MenuItem; second: MenuItem }) => void;
  onCombineFlavors?: () => void;
  isPizzaCategory?: boolean;
  isShowcase?: boolean;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  onAddToCart,
  onCombineFlavors,
  isPizzaCategory,
  isShowcase = false,
}) => {
  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.emptyText}>Nenhum item disponível nesta categoria</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2} // você pode ajustar para 1 ou 3 se quiser responsivo
      columnWrapperStyle={styles.row}
      contentContainerStyle={{ paddingBottom: 16 }}
      renderItem={({ item }) => (
        <MenuItemCard
          item={item}
          onAddToCart={onAddToCart}
          onCombineFlavors={onCombineFlavors}
          isPizzaCategory={isPizzaCategory}
          isShowcase={isShowcase}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
