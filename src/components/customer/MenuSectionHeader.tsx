import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MenuSectionHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍔 Nosso Cardápio</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16, // equivalente ao mb-6
    alignItems: 'center', // centraliza o texto horizontalmente
  },
  title: {
    fontSize: 24, // text-3xl
    fontWeight: 'bold',
    color: '#fff',
  },
});
