import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Category } from '../../types';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;

        return (
          <Pressable
            key={category.id}
            onPress={() => onSelectCategory(category.id)}
            style={[
              styles.button,
              isSelected ? styles.selectedButton : styles.unselectedButton,
            ]}
          >
            <Text style={[styles.icon, isSelected ? styles.selectedText : styles.unselectedText]}>
              {category.icon}
            </Text>
            <Text style={[styles.text, isSelected ? styles.selectedText : styles.unselectedText]}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8, // espaçamento entre botões
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 56,
    borderRadius: 24,
    justifyContent: 'center',
    minWidth: 120,
  },
  selectedButton: {
    backgroundColor: '#E53935', // bg-app-red
  },
  unselectedButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E53935', // border-app-red
  },
  icon: {
    marginRight: 6,
    fontSize: 18,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectedText: {
    color: '#fff',
  },
  unselectedText: {
    color: '#E53935',
  },
});
