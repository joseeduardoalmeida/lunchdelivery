import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle, Home } from 'lucide-react-native';
import { Footer } from '../../components/common/Footer';

export const OrderSuccess = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Limpar dados do carrinho armazenados localmente
    const clearStorage = async () => {
      await AsyncStorage.removeItem('delivery_cart');
      await AsyncStorage.removeItem('delivery_form_data');
    };
    clearStorage();
  }, []);

  const handleGoHome = () => {
    navigation.navigate('Home'); // <- Troque para o nome da sua tela inicial
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <CheckCircle size={64} color="#16a34a" />
            </View>
            <Text style={styles.title}>Pedido Finalizado!</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.confirmationText}>
              Seu pedido foi confirmado com sucesso!
            </Text>
            <Text style={styles.subtitle}>
              Em breve entraremos em contato via WhatsApp para confirmar os
              detalhes da entrega.
            </Text>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                📱 Fique atento ao seu WhatsApp para atualizações sobre o pedido!
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <Home size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Voltar ao Início</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(45deg, #FFD700, #FF8C00, #FF0000)', // Pode trocar por expo-linear-gradient
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    backgroundColor: '#dcfce7',
    borderRadius: 9999,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#15803d',
    textAlign: 'center',
  },
  cardContent: {
    alignItems: 'center',
  },
  confirmationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  noticeBox: {
    backgroundColor: '#fef9c3',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#facc15',
    marginBottom: 16,
    width: '100%',
  },
  noticeText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
