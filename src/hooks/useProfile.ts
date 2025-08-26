import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

export interface UserProfile {
  id: string;
  name: string | null;
  whatsapp: string | null;
  email: string | null;
  cpf: string | null;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  address: string;
  nickname: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
    if (toast) {
      toast({ title, description, variant });
    } else {
      Alert.alert(title, description);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setAddresses([]);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const { data: addressData, error: addressError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (addressError) throw addressError;

      setProfile(profileData);
      setAddresses(addressData || []);
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast("Erro", "Erro ao carregar perfil", "destructive");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;

      setProfile(data);
      showToast("Sucesso!", "Perfil atualizado com sucesso");
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast("Erro", "Erro ao atualizar perfil", "destructive");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: string, nickname?: string, isDefault?: boolean) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (isDefault) {
        await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('user_addresses')
        .insert({ user_id: user.id, address, nickname, is_default: isDefault || false });
      if (error) throw error;

      await loadProfile();
      showToast("Sucesso!", "Endereço adicionado com sucesso");
      return true;
    } catch (error) {
      console.error('Error adding address:', error);
      showToast("Erro", "Erro ao adicionar endereço", "destructive");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (addressId: string, updates: { address?: string; nickname?: string }) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', user.id);
      if (error) throw error;

      await loadProfile();
      showToast("Sucesso!", "Endereço atualizado com sucesso");
      return true;
    } catch (error) {
      console.error('Error updating address:', error);
      showToast("Erro", "Erro ao atualizar endereço", "destructive");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);
      if (error) throw error;

      await loadProfile();
      showToast("Sucesso!", "Endereço removido com sucesso");
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast("Erro", "Erro ao remover endereço", "destructive");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id);
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id);
      if (error) throw error;

      await loadProfile();
      showToast("Sucesso!", "Endereço padrão atualizado");
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      showToast("Erro", "Erro ao definir endereço padrão", "destructive");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setProfile(null);
        setAddresses([]);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadProfile();
      }
    });

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        loadProfile();
      } else {
        setProfile(null);
        setAddresses([]);
        setLoading(false);
      }
    };
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  return {
    profile,
    addresses,
    loading,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refresh: loadProfile
  };
}
