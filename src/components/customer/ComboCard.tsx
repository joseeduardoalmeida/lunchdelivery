// ComboCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WeeklyCombo } from '../../types';

export interface ComboItem {
  name: string;
}

// export interface WeeklyCombo {
//   id: string;
//   name: string;
//   description?: string;
//   image?: string;
//   discountPercentage?: number;
//   endDate?: string;
//   items: ComboItem[];
//   originalPrice?: number;
//   promotionalPrice?: number;
//   price: number;
// }

interface ComboCardProps {
  combo: WeeklyCombo; // importado de '@/types'
  menuItems: { id: string; name: string }[];
  onAddToCart?: (combo: WeeklyCombo) => void;
  isShowcase?: boolean;
}


const ComboCard: React.FC<ComboCardProps> = ({
  combo,
  onAddToCart,
  isShowcase = false
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não definida';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.card}>
      {/* Imagem */}
      <View style={styles.imageContainer}>
        {combo.image ? (
          <Image source={{ uri: combo.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🍔</Text>
          </View>
        )}
        {combo.discountPercentage !== undefined && (
          <View style={styles.badge}>
            <Icon name="percent" size={14} color="#fff" />
            <Text style={styles.badgeText}>
              {combo.discountPercentage}% OFF
            </Text>
          </View>
        )}
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Text style={styles.title}>{combo.name}</Text>
        {combo.description ? (
          <Text style={styles.description}>{combo.description}</Text>
        ) : null}

        <View style={styles.validity}>
          <Icon name="clock-outline" size={12} color="#6B7280" />
          <Text style={styles.validityText}>
            Válido até {formatDate(combo.endDate)}
          </Text>
        </View>

        {/* Itens */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.includes}>Inclui:</Text>
          {combo.items.map((item, idx) => (
            <Text key={idx} style={styles.itemText}>
              1x {item.name}
            </Text>
          ))}
        </View>

        {/* Preço */}
        <View style={styles.priceContainer}>
          {combo.originalPrice && (
            <Text style={styles.originalPrice}>
              R$ {combo.originalPrice.toFixed(2).replace('.', ',')}
            </Text>
          )}
          <Text style={styles.price}>
            R$ {(combo.promotionalPrice || combo.price).toFixed(2).replace('.', ',')}
          </Text>
        </View>

        {/* Botão */}
        {!isShowcase && onAddToCart && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => onAddToCart(combo)}
          >
            <Icon name="cart-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Adicionar Combo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 16
  },
  imageContainer: {
    position: 'relative',
    height: 130
  },
  image: {
    width: '100%',
    height: '100%'
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 32
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4
  },
  content: {
    padding: 12
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#1F2937'
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6
  },
  validity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  validityText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4
  },
  includes: {
    fontWeight: '500',
    fontSize: 13,
    color: '#374151',
    marginBottom: 4
  },
  itemText: {
    fontSize: 12,
    color: '#4B5563'
  },
  priceContainer: {
    marginTop: 8,
    alignItems: 'center'
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    borderRadius: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6
  }
});

export default ComboCard;
