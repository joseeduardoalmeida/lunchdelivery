import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MenuItem } from '../../types';
import LinearGradient from 'react-native-linear-gradient';

interface PizzaFlavorSelectorProps {
  pizzas: MenuItem[];
  onAddToCart?: (item: MenuItem, combinations?: { first: MenuItem; second: MenuItem }) => void;
  isOpen: boolean;
  onClose: () => void;
}


const PizzaFlavorSelector: React.FC<PizzaFlavorSelectorProps> = ({
  pizzas,
  onAddToCart,
  isOpen,
  onClose,
}) => {
  const [selectedFlavors, setSelectedFlavors] = useState<MenuItem[]>([]);

  const handleFlavorSelect = (pizza: MenuItem) => {
    if (selectedFlavors.length < 2) {
      setSelectedFlavors([...selectedFlavors, pizza]);
    }
  };

  const handleRemoveFlavor = (index: number) => {
    setSelectedFlavors(selectedFlavors.filter((_, i) => i !== index));
  };

  const handleAddCombination = () => {
    if (selectedFlavors.length === 2) {
      const baseItem: MenuItem = {
        id: `combo-${selectedFlavors[0].id}-${selectedFlavors[1].id}`,
        name: `Pizza Combinada`,
        description: `Combinação de dois sabores`,
        price: (selectedFlavors[0].price + selectedFlavors[1].price) / 2,
        image: selectedFlavors[0].image,
        category: selectedFlavors[0].category,
        available: true,
        preparation_time: Math.max(selectedFlavors[0].preparation_time, selectedFlavors[1].preparation_time),
      };

        if (onAddToCart && selectedFlavors.length === 2) {
            onAddToCart(baseItem, { first: selectedFlavors[0], second: selectedFlavors[1] });
        }

      setSelectedFlavors([]);
      onClose();
    }
  };

  const canAddCombination = selectedFlavors.length === 2;
  const combinedPrice = canAddCombination
    ? (selectedFlavors[0].price + selectedFlavors[1].price) / 2
    : 0;

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.title}>Combine 2 Sabores de Pizza</Text>
            <Text style={styles.subtitle}>
              Selecione 2 sabores para criar sua pizza combinada. O preço será a soma de metade de cada sabor.
            </Text>

            {selectedFlavors.length > 0 && (
              <LinearGradient
                colors={['#FFF4C1', '#FFD49E']}
                style={styles.selectedContainer}
              >
                <Text style={styles.selectedTitle}>Sabores Selecionados:</Text>
                <View style={styles.selectedFlavors}>
                  {selectedFlavors.map((flavor, index) => (
                    <View key={flavor.id} style={styles.flavorBadge}>
                      <Text style={styles.flavorText}>{flavor.name}</Text>
                      <TouchableOpacity onPress={() => handleRemoveFlavor(index)}>
                        <Text style={styles.removeX}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {canAddCombination && (
                  <View style={styles.combinationRow}>
                    <Text style={styles.combinedPrice}>
                      Preço: R$ {combinedPrice.toFixed(2).replace('.', ',')}
                    </Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddCombination}>
                      <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
            )}

            <View style={styles.grid}>
              {pizzas.map((pizza) => {
                const isSelected = selectedFlavors.find(f => f.id === pizza.id);
                const disabled = selectedFlavors.length >= 2 && !isSelected;
                return (
                  <TouchableOpacity
                    key={pizza.id}
                    style={[
                      styles.card,
                      isSelected && styles.cardSelected,
                      disabled && styles.cardDisabled,
                    ]}
                    onPress={() => {
                      if (!disabled && !isSelected) handleFlavorSelect(pizza);
                    }}
                  >
                    <Image source={{ uri: pizza.image }} style={styles.cardImage} />
                    {isSelected && (
                      <View style={styles.selectedCheck}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    )}
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{pizza.name}</Text>
                      <Text style={styles.cardDescription}>{pizza.description}</Text>
                      <Text style={styles.cardPrice}>R$ {pizza.price.toFixed(2).replace('.', ',')}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  selectedContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedFlavors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  flavorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B22222',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  flavorText: {
    color: '#fff',
    marginRight: 4,
  },
  removeX: {
    color: '#fff',
    fontWeight: 'bold',
  },
  combinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  combinedPrice: {
    fontWeight: 'bold',
    color: '#B22222',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#B22222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cardSelected: {
    borderColor: '#B22222',
    backgroundColor: '#FFF4C1',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#B22222',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardPrice: {
    fontWeight: 'bold',
    color: '#B22222',
  },
  cancelButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B22222',
  },
  cancelText: {
    color: '#B22222',
    fontWeight: 'bold',
  },
});

export default PizzaFlavorSelector;
