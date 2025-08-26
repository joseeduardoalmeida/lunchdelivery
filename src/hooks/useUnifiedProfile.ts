import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';
import { useProfile } from '../hooks/useProfile';
import { useCustomerProfile } from '../hooks/useCustomerProfile';
import { useToast } from '../hooks/use-toast';
import { unifiedProfileService } from '../services/unifiedProfileService';

export function useUnifiedProfile() {
  const { user, isInitialized: authInitialized, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Hooks para usuários autenticados
  const { 
    profile: authProfile, 
    addresses: authAddresses, 
    loading: profileLoading, 
    updateProfile: updateAuthProfile, 
    addAddress: addAuthAddress,
    updateAddress: updateAuthAddress,
    deleteAddress: deleteAuthAddress,
    setDefaultAddress: setAuthDefaultAddress 
  } = useProfile();

  // Hooks para usuários não autenticados
  const {
    profile: customerProfile,
    loading: customerLoading,
    isEditing: customerIsEditing,
    setIsEditing: setCustomerIsEditing,
    loadProfile: loadCustomerProfile,
    createProfile: createCustomerProfile,
    updateProfile: updateCustomerProfile,
    addAddress: addCustomerAddress,
    updateAddress: updateCustomerAddress,
    deleteAddress: deleteCustomerAddress,
    setDefaultAddress: setCustomerDefaultAddress
  } = useCustomerProfile();

  // Estado unificado
  const [isEditing, setIsEditing] = useState(false);
  const [activeWhatsapp, setActiveWhatsapp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && authInitialized;
  const loading = authInitialized ? (isAuthenticated ? profileLoading : customerLoading) : authLoading;
  const profile = isAuthenticated ? authProfile : customerProfile;
  const addresses = isAuthenticated ? authAddresses : (customerProfile?.addresses || []);

  // Reset de erros e edição quando muda o estado de autenticação
  useEffect(() => {
    setError(null);
    setIsEditing(false);
    setActiveWhatsapp('');
  }, [isAuthenticated, authInitialized]);

  // Carregar perfil pelo WhatsApp
  const loadProfileByWhatsapp = async (whatsapp: string) => {
    try {
      setError(null);
      setActiveWhatsapp(whatsapp);

      const unifiedData = await unifiedProfileService.searchProfileByWhatsapp(whatsapp);

      if (unifiedData) {
        if (unifiedData.profile.type === 'authenticated') {
          toast?.({
            title: "Perfil encontrado",
            description: `Dados de ${unifiedData.profile.name} carregados do seu perfil autenticado.`,
            variant: "default",
          }) || Alert.alert("Perfil encontrado", `Dados de ${unifiedData.profile.name} carregados do seu perfil autenticado.`);
        } else {
          await loadCustomerProfile(whatsapp);
          toast?.({
            title: "Cliente encontrado",
            description: `Dados de ${unifiedData.profile.name} carregados automaticamente.`,
            variant: "default",
          }) || Alert.alert("Cliente encontrado", `Dados de ${unifiedData.profile.name} carregados automaticamente.`);
        }
      } else if (!isAuthenticated) {
        await loadCustomerProfile(whatsapp);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar perfil';
      setError(errorMsg);
      toast?.({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      }) || Alert.alert("Erro", errorMsg);
    }
  };

  // Funções unificadas de perfil
  const updateProfile = async (data: {
    name?: string;
    whatsapp?: string;
    email?: string;
    cpf?: string;
    profile_picture?: string;
  }) => {
    try {
      setError(null);
      return isAuthenticated ? updateAuthProfile(data) : updateCustomerProfile(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(errorMsg);
      toast?.({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      }) || Alert.alert("Erro", errorMsg);
      return false;
    }
  };

  const addAddress = async (address: string, nickname?: string, isDefault?: boolean) => {
    try {
      setError(null);
      if (isAuthenticated) return addAuthAddress(address, nickname, isDefault);
      return addCustomerAddress({ address, nickname, is_default: isDefault });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao adicionar endereço';
      setError(errorMsg);
      toast?.({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      }) || Alert.alert("Erro", errorMsg);
      return false;
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      setError(null);
      return isAuthenticated ? setAuthDefaultAddress(addressId) : setCustomerDefaultAddress(addressId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao definir endereço padrão';
      setError(errorMsg);
      toast?.({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      }) || Alert.alert("Erro", errorMsg);
      return false;
    }
  };

  const createProfile = async (data: {
    name: string;
    whatsapp: string;
    email?: string;
    cpf?: string;
    profile_picture?: string;
  }) => {
    if (isAuthenticated) {
      toast?.({
        title: "Aviso",
        description: "Você já possui um perfil autenticado",
        variant: "default",
      }) || Alert.alert("Aviso", "Você já possui um perfil autenticado");
      return null;
    }
    
    try {
      setError(null);
      return createCustomerProfile(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar perfil';
      setError(errorMsg);
      toast?.({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      }) || Alert.alert("Erro", errorMsg);
      return null;
    }
  };

  const updateAddress = async (addressId: string, data: { address?: string; nickname?: string }) => {
    return isAuthenticated ? updateAuthAddress(addressId, data) : updateCustomerAddress(addressId, data);
  };

  const deleteAddress = async (addressId: string) => {
    return isAuthenticated ? deleteAuthAddress(addressId) : deleteCustomerAddress(addressId);
  };

  return {
    profile,
    addresses,
    loading,
    isAuthenticated,
    isEditing: isAuthenticated ? isEditing : customerIsEditing,
    setIsEditing: isAuthenticated ? setIsEditing : setCustomerIsEditing,
    activeWhatsapp,
    error,
    loadProfileByWhatsapp,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    createProfile
  };
}
