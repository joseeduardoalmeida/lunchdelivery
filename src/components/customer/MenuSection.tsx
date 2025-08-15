import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MenuItem, Category, WeeklyCombo } from '../../types';
import CombosSection from './CombosSection';
import { MenuSectionHeader } from './MenuSectionHeader';
import { CategoryTabs } from './CategoryTabs';
import { MenuGrid } from './MenuGrid';
import PizzaFlavorSelector from './PizzaFlavorSelector';

interface MenuSectionProps {
  combos: WeeklyCombo[];
  menuItems: MenuItem[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onAddToCart?: (item: MenuItem, combinations?: { first: MenuItem; second: MenuItem }) => void;
  onAddComboToCart?: (combo: WeeklyCombo) => void;
  isShowcase?: boolean;
}

export const MenuSection = ({
  combos,
  menuItems,
  categories,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onAddComboToCart,
  isShowcase = false
}: MenuSectionProps) => {
  const [showFlavorSelector, setShowFlavorSelector] = useState(false);

  const filteredItems = menuItems.filter(item =>
    item.category === selectedCategory && item.available
  );

  const PIZZA_CATEGORY_ID = '550e8400-e29b-41d4-a716-446655440003';
  const isPizzaCategory = selectedCategory === PIZZA_CATEGORY_ID;

  const pizzasForCombination = menuItems.filter(item =>
    item.category === PIZZA_CATEGORY_ID && item.available
  );

  const handleCombineFlavors = () => {
    setShowFlavorSelector(true);
  };

  return (
    <View style={styles.container}>
      <CombosSection
        combos={combos}
        menuItems={menuItems}
        onAddComboToCart={onAddComboToCart}
        isShowcase={isShowcase}
      />

      <MenuSectionHeader />

      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      <MenuGrid
        items={filteredItems}
        onAddToCart={onAddToCart}
        onCombineFlavors={!isShowcase ? handleCombineFlavors : undefined}
        isPizzaCategory={isPizzaCategory && !isShowcase}
        isShowcase={isShowcase}
      />

      {!isShowcase && (
        <PizzaFlavorSelector
          pizzas={pizzasForCombination}
          onAddToCart={onAddToCart}
          isOpen={showFlavorSelector}
          onClose={() => setShowFlavorSelector(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
