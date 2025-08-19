import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { TextInput, Button, Card, Switch } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { dataService } from "../../services/dataService";
import { supabase } from "../../integrations/supabase/client";
import { MenuItem, Category } from "../../types";

export const MenuPanel = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    available: true,
    preparation_time: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, cats] = await Promise.all([
        dataService.getMenuItems(),
        dataService.getCategories()
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (error) {
      Alert.alert("Erro", "Erro ao carregar dados, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageFile(result.assets[0]);
    }
  };

  const uploadImage = async (file: any): Promise<string> => {
    const fileExt = file.uri.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from("menu-images")
      .upload(filePath, blob);

    if (error) throw error;

    const { data } = supabase.storage.from("menu-images").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const item: MenuItem = {
        id: editingItem?.id || crypto.randomUUID(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        category: formData.category,
        available: formData.available,
        preparation_time: parseInt(formData.preparation_time),
      };

      await dataService.saveMenuItem(item);
      await loadData();
      resetForm();

      Alert.alert("Sucesso", editingItem ? "Item atualizado!" : "Item adicionado!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar item.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingItem(null);
    setImageFile(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: categories[0]?.id || "",
      available: true,
      preparation_time: ""
    });
  };

  const deleteItem = async (id: string) => {
    Alert.alert("Confirmar", "Deseja excluir este item?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await dataService.deleteMenuItem(id);
            await loadData();
          } catch (error) {
            Alert.alert("Erro", "Erro ao excluir item.");
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Carregando cardápio...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      {isEditing ? (
        <Card style={{ marginBottom: 16 }}>
          <Card.Title title={editingItem ? "Editar Item" : "Adicionar Item"} />
          <Card.Content>
            <TextInput
              label="Nome do Item"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              style={{ marginBottom: 8 }}
            />

            <TextInput
              label="Descrição"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              style={{ marginBottom: 8 }}
              multiline
            />

            <TextInput
              label="Preço (R$)"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              style={{ marginBottom: 8 }}
            />

            <TextInput
              label="Tempo de preparo (min)"
              keyboardType="numeric"
              value={formData.preparation_time}
              onChangeText={(text) => setFormData({ ...formData, preparation_time: text })}
              style={{ marginBottom: 8 }}
            />

            <TouchableOpacity onPress={pickImage} style={{ marginBottom: 8 }}>
              <Text style={{ color: "blue" }}>Selecionar Imagem</Text>
            </TouchableOpacity>
            {imageFile && (
              <Image source={{ uri: imageFile.uri }} style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 8 }} />
            )}

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Switch
                value={formData.available}
                onValueChange={(val) => setFormData({ ...formData, available: val })}
              />
              <Text style={{ marginLeft: 8 }}>Disponível</Text>
            </View>

            <Button mode="contained" onPress={handleSubmit} loading={uploading} style={{ marginBottom: 8 }}>
              {editingItem ? "Atualizar" : "Adicionar"}
            </Button>
            <Button mode="outlined" onPress={resetForm}>Cancelar</Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <Button mode="contained" onPress={() => setIsEditing(true)} style={{ marginBottom: 16 }}>
            Adicionar Item
          </Button>
          {menuItems.map((item) => (
            <Card key={item.id} style={{ marginBottom: 16, opacity: item.available ? 1 : 0.5 }}>
              <Card.Content>
                <Image source={{ uri: item.image }} style={{ width: "100%", height: 150, borderRadius: 8, marginBottom: 8 }} />
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.name}</Text>
                <Text>{item.description}</Text>
                <Text>Preço: R$ {item.price.toFixed(2).replace(".", ",")}</Text>
                <Text>Tempo: {item.preparation_time} min</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => { setEditingItem(item); setIsEditing(true); }}>Editar</Button>
                <Button onPress={() => deleteItem(item.id)} color="red">Excluir</Button>
              </Card.Actions>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
};
