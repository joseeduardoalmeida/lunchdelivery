import { useState } from 'react';
import { Alert } from 'react-native';
import { customerProfileService, CustomerProfileWithAddresses } from '../services/customerProfileService';
import { useToast } from '../hooks/use-toast';

export function useCustomerProfile() {
  const [profile, setProfile] = useState<CustomerProfileWithAddresses | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
    if (toast) {
      toast({ title, description, variant });
    } else {
      Alert.alert(title, description);
    }
  };

  const loadProfile = async (whatsapp: string) => {
    setLoading(true);
    try {
      const customerProfile = await customerProfileService.searchCustomerByWhatsapp(whatsapp);
      setProfile(customerProfile);
      
      if (customerProfile) {
        showToast("Cliente encontrado!", `Dados de ${customerProfile.name} carregados automaticamente.`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast("Erro", "Erro ao carregar perfil do cliente", "destructive");
    } finally {
      setLoading(false);
    }
  };

  const findSimilarProfiles = async (whatsapp: string, name?: string) => {
    try {
      return await customerProfileService.findSimilarProfiles(whatsapp, name);
    } catch (error) {
      console.error('Error finding similar profiles:', error);
      return [];
    }
  };

  const createProfile = async (data: {
    name: string;
    whatsapp: string;
    email?: string;
    cpf?: string;
    profile_picture?: string;
  }) => {
    setLoading(true);
    try {
      const newProfile = await customerProfileService.createCustomerProfile(data);
      if (newProfile) {
        const profileWithAddresses = await customerProfileService.getCustomerWithAddresses(newProfile.id);
        setProfile(profileWithAddresses);
        showToast("Sucesso", "Perfil criado com sucesso!");
        return newProfile;
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      showToast("Erro", "Erro ao criar perfil", "destructive");
    } finally {
      setLoading(false);
    }
    return null;
  };

  const updateProfile = async (data: {
    name?: string;
    whatsapp?: string;
    email?: string;
    profile_picture?: string;
    cpf?: string;
  }) => {
    if (!profile) return false;

    setLoading(true);
    try {
      const updatedProfile = await customerProfileService.updateCustomerProfile(profile.id, data);
      if (updatedProfile) {
        const refreshedProfile = await customerProfileService.getCustomerWithAddresses(profile.id);
        setProfile(refreshedProfile);
        showToast("Sucesso", "Perfil atualizado com sucesso!");
        return true;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast("Erro", "Erro ao atualizar perfil", "destructive");
    } finally {
      setLoading(false);
    }
    return false;
  };

  const addAddress = async (data: { address: string; nickname?: string; is_default?: boolean }) => {
    if (!profile) return false;

    setLoading(true);
    try {
      const newAddress = await customerProfileService.addCustomerAddress({ customer_id: profile.id, ...data });
      if (newAddress) {
        const refreshedProfile = await customerProfileService.getCustomerWithAddresses(profile.id);
        setProfile(refreshedProfile);
        showToast("Sucesso", "Endereço adicionado com sucesso!");
        return true;
      }
    } catch (error) {
      console.error('Error adding address:', error);
      showToast("Erro", "Erro ao adicionar endereço", "destructive");
    } finally {
      setLoading(false);
    }
    return false;
  };

  const updateAddress = async (addressId: string, data: { address?: string; nickname?: string }) => {
    if (!profile) return false;

    setLoading(true);
    try {
      const updatedAddress = await customerProfileService.updateCustomerAddress(addressId, data);
      if (updatedAddress) {
        const refreshedProfile = await customerProfileService.getCustomerWithAddresses(profile.id);
        setProfile(refreshedProfile);
        showToast("Sucesso", "Endereço atualizado com sucesso!");
        return true;
      }
    } catch (error) {
      console.error('Error updating address:', error);
      showToast("Erro", "Erro ao atualizar endereço", "destructive");
    } finally {
      setLoading(false);
    }
    return false;
  };

  const deleteAddress = async (addressId: string) => {
    if (!profile) return false;

    setLoading(true);
    try {
      const success = await customerProfileService.deleteCustomerAddress(addressId);
      if (success) {
        const refreshedProfile = await customerProfileService.getCustomerWithAddresses(profile.id);
        setProfile(refreshedProfile);
        showToast("Sucesso", "Endereço removido com sucesso!");
        return true;
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast("Erro", "Erro ao remover endereço", "destructive");
    } finally {
      setLoading(false);
    }
    return false;
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!profile) return false;

    setLoading(true);
    try {
      const success = await customerProfileService.setDefaultAddress(profile.id, addressId);
      if (success) {
        const refreshedProfile = await customerProfileService.getCustomerWithAddresses(profile.id);
        setProfile(refreshedProfile);
        showToast("Sucesso", "Endereço padrão atualizado!");
        return true;
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      showToast("Erro", "Erro ao definir endereço padrão", "destructive");
    } finally {
      setLoading(false);
    }
    return false;
  };

  return {
    profile,
    loading,
    isEditing,
    setIsEditing,
    loadProfile,
    findSimilarProfiles,
    createProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  };
}
