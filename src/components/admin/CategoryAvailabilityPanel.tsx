import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { categoryAvailabilityService, CategoryAvailability } from '../../services/categoryAvailabilityService';
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Ícones Expo (ou react-native-vector-icons)

export const CategoryAvailabilityPanel = () => {
  const [availability, setAvailability] = useState<CategoryAvailability>({
    lanches: true,
    pizzas: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      const settings = await categoryAvailabilityService.getCategoryAvailability();
      setAvailability(settings);
      setLastUpdate(new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (category: keyof CategoryAvailability, value: boolean) => {
    setAvailability((prev) => ({ ...prev, [category]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await categoryAvailabilityService.updateCategoryAvailability(availability);
      setHasChanges(false);
      setLastUpdate(new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Disponibilidade de Categorias</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Disponibilidade de Categorias</Text>
      <Text style={styles.subtitle}>
        Controle a disponibilidade de categorias no sistema de delivery
      </Text>

      {/* Status Cards */}
      <View style={styles.row}>
        <View
          style={[
            styles.statusCard,
            availability.lanches ? styles.greenCard : styles.redCard,
          ]}
        >
          <Text style={styles.statusTitle}>Lanches</Text>
          <Text style={styles.statusDesc}>Lanches Prensados + Hambúrguers</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.badge, availability.lanches ? styles.badgeGreen : styles.badgeRed]}>
              {availability.lanches ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
            </Text>
            <Icon 
              name={availability.lanches ? 'checkmark-circle' : 'warning'} 
              ize={20} 
              color={availability.lanches ? 'green' : 'red'}
            />
          </View>
        </View>

        <View
          style={[
            styles.statusCard,
            availability.pizzas ? styles.greenCard : styles.redCard,
          ]}
        >
          <Text style={styles.statusTitle}>Pizzas</Text>
          <Text style={styles.statusDesc}>Pizzas + Mini Pizzas</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.badge, availability.pizzas ? styles.badgeGreen : styles.badgeRed]}>
              {availability.pizzas ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
            </Text>
             <Icon 
              name={availability.pizzas ? 'checkmark-circle' : 'warning'} 
              ize={20} 
              color={availability.pizzas ? 'green' : 'red'}
            />
          </View>
        </View>
      </View>

      {/* Switch Controls */}
      <View style={styles.switchRow}>
        <View>
          <Text style={styles.label}>Lanches</Text>
          <Text style={styles.desc}>Inclui Lanches Prensados e Hambúrguers</Text>
        </View>
        <Switch
          value={availability.lanches}
          onValueChange={(val) => handleToggle('lanches', val)}
        />
      </View>

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.label}>Pizzas</Text>
          <Text style={styles.desc}>Inclui Pizzas e Mini Pizzas</Text>
        </View>
        <Switch
          value={availability.pizzas}
          onValueChange={(val) => handleToggle('pizzas', val)}
        />
      </View>

      {/* Save Button */}
      {hasChanges && (
        <View style={styles.saveRow}>
          <Text style={styles.unsaved}>Você tem alterações não salvas</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
                <Icon
                  name="save"
                  ize={20}
                  color="#FFF"
                />
            )}
            <Text style={styles.saveText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Last Update */}
      {lastUpdate ? (
        <Text style={styles.lastUpdate}>Última atualização: {lastUpdate}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    margin: 12,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  greenCard: {
    borderColor: '#a3e635',
    backgroundColor: '#f0fdf4',
  },
  redCard: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  desc: {
    fontSize: 12,
    color: '#666',
  },
  saveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
    marginTop: 12,
  },
  unsaved: {
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
