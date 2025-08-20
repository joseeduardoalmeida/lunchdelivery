import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert, Image } from "react-native";
import { TextInput, Button, Card, Text, Switch, Chip } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../integrations/supabase/client";
import { dataService } from "../../services/dataService";

interface WeeklyCombo {
  id: string;
  name: string;
  description: string;
  items: { menuItemId: string; quantity: number }[];
  originalPrice: number;
  promotionalPrice: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  active: boolean;
  image?: string;
  createdAt: Date;
}

export const WeeklyCombosPanel = () => {
  const [combos, setCombos] = useState<WeeklyCombo[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCombo, setEditingCombo] = useState<WeeklyCombo | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    promotionalPrice: "",
    startDate: "",
    endDate: "",
    active: true,
    image: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuItemsData, combosData] = await Promise.all([
        dataService.getMenuItems(),
        loadCombos(),
      ]);
      setMenuItems(menuItemsData);
      setCombos(combosData);
    } catch (error) {
      Alert.alert("Erro", "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const loadCombos = async (): Promise<WeeklyCombo[]> => {
    const { data, error } = await supabase
      .from("weekly_combos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((combo: any) => ({
      id: combo.id,
      name: combo.name,
      description: combo.description,
      items: combo.items || [],
      originalPrice: Number(combo.original_price),
      promotionalPrice: Number(combo.promotional_price),
      discountPercentage: combo.discount_percentage,
      startDate: combo.start_date,
      endDate: combo.end_date,
      active: combo.active,
      image: combo.image,
      createdAt: new Date(combo.created_at),
    }));
  };

  const calculateDiscountPercentage = (original: number, promotional: number) => {
    return Math.round(((original - promotional) / original) * 100);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    try {
      const originalPrice = parseFloat(formData.originalPrice);
      const promotionalPrice = parseFloat(formData.promotionalPrice);
      const discountPercentage = calculateDiscountPercentage(originalPrice, promotionalPrice);

      const comboData = {
        id: editingCombo?.id || crypto.randomUUID(),
        name: formData.name,
        description: formData.description,
        items: [],
        original_price: originalPrice,
        promotional_price: promotionalPrice,
        discount_percentage: discountPercentage,
        start_date: formData.startDate,
        end_date: formData.endDate,
        active: formData.active,
        image: formData.image,
      };

      const { error } = await supabase.from("weekly_combos").upsert(comboData);

      if (error) throw error;

      await loadData();
      resetForm();
      Alert.alert("Sucesso", editingCombo ? "Combo atualizado!" : "Combo criado!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar combo");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingCombo(null);
    setFormData({
      name: "",
      description: "",
      originalPrice: "",
      promotionalPrice: "",
      startDate: "",
      endDate: "",
      active: true,
      image: "",
    });
  };

  const deleteCombo = async (id: string) => {
    Alert.alert("Confirmar", "Deseja excluir este combo?", [
      { text: "Cancelar" },
      {
        text: "Excluir",
        onPress: async () => {
          const { error } = await supabase.from("weekly_combos").delete().eq("id", id);
          if (!error) {
            await loadData();
            Alert.alert("Excluído", "Combo removido com sucesso.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return <Text style={{ textAlign: "center", marginTop: 20 }}>Carregando...</Text>;
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      {isEditing ? (
        <Card style={{ padding: 16 }}>
          <TextInput
            label="Nome do Combo"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <TextInput
            label="Descrição"
            value={formData.description}
            multiline
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />
          <Button onPress={pickImage} mode="outlined" style={{ marginVertical: 8 }}>
            Escolher Imagem
          </Button>
          {formData.image ? (
            <Image source={{ uri: formData.image }} style={{ width: "100%", height: 150, marginBottom: 8 }} />
          ) : null}

          <TextInput
            label="Preço Original"
            value={formData.originalPrice}
            keyboardType="numeric"
            onChangeText={(text) => setFormData({ ...formData, originalPrice: text })}
          />
          <TextInput
            label="Preço Promocional"
            value={formData.promotionalPrice}
            keyboardType="numeric"
            onChangeText={(text) => setFormData({ ...formData, promotionalPrice: text })}
          />
          <TextInput
            label="Data Início"
            value={formData.startDate}
            onChangeText={(text) => setFormData({ ...formData, startDate: text })}
          />
          <TextInput
            label="Data Fim"
            value={formData.endDate}
            onChangeText={(text) => setFormData({ ...formData, endDate: text })}
          />

          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 8 }}>
            <Switch
              value={formData.active}
              onValueChange={(v) => setFormData({ ...formData, active: v })}
            />
            <Text style={{ marginLeft: 8 }}>Ativo</Text>
          </View>

          <Button mode="contained" onPress={handleSubmit} style={{ marginVertical: 4 }}>
            {editingCombo ? "Atualizar" : "Criar"}
          </Button>
          <Button mode="outlined" onPress={resetForm}>
            Cancelar
          </Button>
        </Card>
      ) : (
        <>
          <Button mode="contained" onPress={() => setIsEditing(true)} style={{ marginBottom: 12 }}>
            Criar Combo
          </Button>
          {combos.map((combo) => (
            <Card key={combo.id} style={{ marginBottom: 12, padding: 12 }}>
              {combo.image && (
                <Image
                  source={{ uri: combo.image }}
                  style={{ width: "100%", height: 120, borderRadius: 8 }}
                />
              )}
              <Text variant="titleMedium">{combo.name}</Text>
              <Text>{combo.description}</Text>
              <Chip style={{ marginTop: 4 }} selected={combo.active}>
                {combo.active ? "Ativo" : "Inativo"}
              </Chip>
              <Text>
                De R$ {combo.originalPrice.toFixed(2)} por R$ {combo.promotionalPrice.toFixed(2)} (-{combo.discountPercentage}%)
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <Button onPress={() => { setIsEditing(true); setEditingCombo(combo); setFormData({
                  name: combo.name,
                  description: combo.description,
                  originalPrice: combo.originalPrice.toString(),
                  promotionalPrice: combo.promotionalPrice.toString(),
                  startDate: combo.startDate,
                  endDate: combo.endDate,
                  active: combo.active,
                  image: combo.image || "",
                }); }}>Editar</Button>
                <Button onPress={() => deleteCombo(combo.id)} textColor="red">Excluir</Button>
              </View>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
};
