import { supabase } from '../integrations/supabase/client';
import { WhatsAppUtils } from '../utils/whatsappUtils';

export interface CustomerProfile {
  id: string;
  name: string;
  whatsapp: string;
  email?: string | null; // <- permite null
  cpf?: string | null;   // se necessário
  profile_picture?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  address: string;
  nickname?: string | null; // <- permitir null
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfileWithAddresses extends CustomerProfile {
  addresses: CustomerAddress[];
}

class CustomerProfileService {
  async searchCustomerByWhatsapp(whatsapp: string): Promise<CustomerProfileWithAddresses | null> {
    const normalized = WhatsAppUtils.normalize(whatsapp);
    const { data, error } = await supabase
      .from('customer_profiles')
      .select(`*, customer_addresses:customer_addresses(*)`)
      .ilike('whatsapp', `%${normalized}%`)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return {
      ...data[0],
      addresses: data[0].customer_addresses || []
    };
  }

  async createCustomerProfile(data: {
    name: string;
    whatsapp: string;
    email?: string;
    cpf?: string;
    profile_picture?: string;
  }): Promise<CustomerProfile | null> {
    const normalizedWhatsapp = WhatsAppUtils.normalize(data.whatsapp);

    const existing = await this.searchCustomerByWhatsapp(normalizedWhatsapp);
    if (existing) return existing;

    const { data: profile, error } = await supabase
      .from('customer_profiles')
      .insert({
        name: data.name.trim(),
        whatsapp: normalizedWhatsapp,
        email: data.email?.trim() || null,
        cpf: data.cpf?.trim() || null,
        profile_picture: data.profile_picture || null
      })
      .select()
      .single();

    return error ? null : profile;
  }

  async addCustomerAddress(data: { customer_id: string; address: string; nickname?: string; is_default?: boolean }): Promise<CustomerAddress | null> {
    if (data.is_default) {
      await supabase.from('customer_addresses').update({ is_default: false }).eq('customer_id', data.customer_id);
    }

    const { data: address, error } = await supabase
      .from('customer_addresses')
      .insert({
        customer_id: data.customer_id,
        address: data.address.trim(),
        nickname: data.nickname?.trim() || null,
        is_default: data.is_default || false
      })
      .select()
      .single();

    return error ? null : address;
  }

  async updateCustomerProfile(id: string, data: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    const { data: profile, error } = await supabase.from('customer_profiles').update(data).eq('id', id).select().single();
    return error ? null : profile;
  }

  async getCustomerWithAddresses(customerId: string): Promise<CustomerProfileWithAddresses | null> {
    const { data: profile, error } = await supabase
      .from('customer_profiles')
      .select(`*, customer_addresses:customer_addresses(*)`)
      .eq('id', customerId)
      .single();

    return error ? null : { ...profile, addresses: profile.customer_addresses };
  }

  async updateCustomerAddress(addressId: string, data: Partial<CustomerAddress>): Promise<CustomerAddress | null> {
    const { data: updated, error } = await supabase.from('customer_addresses').update(data).eq('id', addressId).select().single();
    return error ? null : updated;
  }

  async deleteCustomerAddress(addressId: string): Promise<boolean> {
    const { error } = await supabase.from('customer_addresses').delete().eq('id', addressId);
    return !error;
  }

  async setDefaultAddress(customerId: string, addressId: string): Promise<boolean> {
    await supabase.from('customer_addresses').update({ is_default: false }).eq('customer_id', customerId);
    const { error } = await supabase.from('customer_addresses').update({ is_default: true }).eq('id', addressId).eq('customer_id', customerId);
    return !error;
  }

  async findSimilarProfiles(whatsapp: string, name?: string) {
  try {; // ou caminho correto
    const normalized = WhatsAppUtils.normalize(whatsapp);

    const { data: profiles, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .like('whatsapp', `%${normalized.slice(-8)}%`)
      .order('created_at', { ascending: false });

    if (error || !profiles) return [];

    // opcional: filtrar por similaridade usando WhatsAppUtils
    return profiles;
  } catch (error) {
    console.error('Error finding similar profiles:', error);
    return [];
  }
}

}

export const customerProfileService = new CustomerProfileService();
