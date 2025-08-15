import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MenuItem } from '../../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem, combinations?: { first: MenuItem; second: MenuItem }) => void;
  onCombineFlavors?: () => void;
  isPizzaCategory?: boolean;
  isShowcase?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  onCombineFlavors,
  isPizzaCategory,
  isShowcase = false,
}) => {
  return (
    <View style={styles.card}>
      {/* Imagem */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.prepTimeBadge}>
          <Text style={styles.prepTimeText}>{item.preparation_time} min</Text>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={[styles.priceContainer, isShowcase ? styles.center : styles.spaceBetween]}>
          <Text style={styles.price}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
          
          {!isShowcase && onAddToCart && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddToCart(item)}
            >
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isShowcase && isPizzaCategory && onCombineFlavors && (
          <TouchableOpacity style={styles.combineButton} onPress={onCombineFlavors}>
            <Text style={styles.combineButtonText}>🍕 Combinar 2 Sabores</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 192, // 48 * 4 (aprox)
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  prepTimeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFDD57', // bg-app-yellow
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  prepTimeText: {
    color: '#B22222', // app-darkRed
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B22222', // app-red
  },
  addButton: {
    backgroundColor: '#B22222', // app-red
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  combineButton: {
    backgroundColor: '#FFDD57', // gradiente simplificado
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  combineButtonText: {
    color: '#B22222',
    fontWeight: 'bold',
  },
});
