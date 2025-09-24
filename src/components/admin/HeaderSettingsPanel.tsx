import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import DocumentPicker, { types, DocumentPickerResponse } from 'react-native-document-picker';
import { supabase } from '../../integrations/supabase/client';
import { pageSettingsService, HeaderSettings } from '../../services/pageSettingsService';

export const HeaderSettingsPanel = () => {
  const [settings, setSettings] = useState<HeaderSettings>({ image_url: '', enabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const headerSettings = await pageSettingsService.getHeaderSettings();
      setSettings(headerSettings);
    } catch (error) {
      console.error('Error loading header settings:', error);
      Alert.alert('Erro', 'Erro ao carregar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const res: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [types.images], // apenas imagens
        copyTo: 'cachesDirectory', // opcional: copiar para cache
      });

      // pega o primeiro arquivo selecionado
      if (res.length > 0) {
        setImageFile(res[0]);
      }
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Usuário cancelou a seleção de arquivo');
      } else {
        console.error('Erro ao selecionar arquivo:', err);
        Alert.alert('Erro', 'Erro ao selecionar arquivo.');
      }
    }
  };

  const uploadImage = async (file: any): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `header-bg-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, {
        uri: file.uri,
        type: file.mimeType,
        name: fileName,
      } as any);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setUploading(!!imageFile);

      let imageUrl = settings.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const updatedSettings: HeaderSettings = {
        ...settings,
        image_url: imageUrl,
      };

      await pageSettingsService.updateHeaderSettings(updatedSettings);
      setSettings(updatedSettings);
      setImageFile(null);

      Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving header settings:', error);
      Alert.alert('Erro', 'Erro ao salvar configurações.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <ActivityIndicator size="large" color="#d32f2f" />
        <Text style={{ marginTop: 8 }}>Carregando configurações...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Configurações do Cabeçalho
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Switch
          value={settings.enabled}
          onValueChange={(val) => setSettings({ ...settings, enabled: val })}
        />
        <Text style={{ marginLeft: 8 }}>Ativar fundo personalizado do cabeçalho</Text>
      </View>

      {settings.enabled && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '500', marginBottom: 8 }}>Imagem de Fundo</Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#eee',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 8,
            }}
            onPress={pickImage}
          >
            <Text>Selecionar Imagem</Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', marginVertical: 4 }}>ou</Text>

          <TextInput
            value={settings.image_url}
            onChangeText={(text) => setSettings({ ...settings, image_url: text })}
            placeholder="URL da imagem (https://...)"
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              borderRadius: 8,
            }}
          />

          {(imageFile || settings.image_url) && (
            <Image
              source={{ uri: imageFile ? imageFile.uri : settings.image_url }}
              style={{
                width: '100%',
                height: 150,
                borderRadius: 8,
                marginTop: 12,
              }}
              resizeMode="cover"
            />
          )}

          <View
            style={{
              backgroundColor: '#fff8e1',
              borderColor: '#ffe082',
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              marginTop: 16,
            }}
          >
            <Text style={{ fontSize: 12, color: '#8d6e63' }}>
              <Text style={{ fontWeight: 'bold' }}>Dica:</Text> Para melhor resultado, use imagens
              com resolução mínima de 1200x400 pixels.
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={{
          backgroundColor: '#d32f2f',
          padding: 14,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {uploading ? 'Fazendo upload...' : saving ? 'Salvando...' : 'Salvar Configurações'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
