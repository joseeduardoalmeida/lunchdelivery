import { supabase } from '../integrations/supabase/client';
import { WhatsAppUtils } from '../utils/whatsappUtils';
import { customerProfileService } from './customerProfileService';

// Unified interfaces for both profile types
export interface UnifiedProfile {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  cpf?: string;
  profile_picture?: string;
  type: 'authenticated' | 'customer';
}

export interface UnifiedAddress {
  id: string;
  address: string;
  nickname?: string;
  is_default: boolean;
}

export interface UnifiedProfileWithAddresses {
  profile: UnifiedProfile;
  addresses: UnifiedAddress[];
}

class UnifiedProfileService {
  /**
   * Search for a profile by WhatsApp in both authenticated and customer profiles
   */
  async searchProfileByWhatsapp(
    whatsapp: string
  ): Promise<UnifiedProfileWithAddresses | null> {
    try {
      // First search in authenticated profiles
      const authProfile = await this.searchAuthenticatedProfile(whatsapp);
      if (authProfile) return authProfile;

      // Then search in customer profiles
      const customerProfile = await this.searchCustomerProfile(whatsapp);
      if (customerProfile) return customerProfile;

      return null;
    } catch (error) {
      console.error('UnifiedProfileService: Error searching profile:', error);
      return null;
    }
  }

  /**
   * Search in authenticated user profiles
   */
  private async searchAuthenticatedProfile(
    whatsapp: string
  ): Promise<UnifiedProfileWithAddresses | null> {
    try {
      const variations = WhatsAppUtils.generateVariations(whatsapp);

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('whatsapp', variations)
        .limit(1);

      if (profileError || !profiles || profiles.length === 0) return null;

      const profile = profiles[0];

      const { data: addresses, error: addressError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', profile.id)
        .order('is_default', { ascending: false });

      if (addressError) console.error('Error fetching user addresses:', addressError);

      const unifiedProfile: UnifiedProfile = {
        id: profile.id,
        name: profile.name || '',
        whatsapp: profile.whatsapp || '',
        email: profile.email || undefined,
        cpf: profile.cpf || undefined,
        profile_picture: profile.profile_picture || undefined,
        type: 'authenticated',
      };

      const unifiedAddresses: UnifiedAddress[] = (addresses || []).map(addr => ({
        id: addr.id,
        address: addr.address,
        nickname: addr.nickname || undefined,
        is_default: addr.is_default,
      }));

      return { profile: unifiedProfile, addresses: unifiedAddresses };
    } catch (error) {
      console.error('Error in authenticated profile search:', error);
      return null;
    }
  }

  /**
   * Search in customer profiles using existing service
   */
  private async searchCustomerProfile(
    whatsapp: string
  ): Promise<UnifiedProfileWithAddresses | null> {
    try {
      const customerData = await customerProfileService.searchCustomerByWhatsapp(whatsapp);

      if (!customerData) return null;

      const unifiedProfile: UnifiedProfile = {
        id: customerData.id,
        name: customerData.name,
        whatsapp: customerData.whatsapp,
        email: customerData.email || undefined,
        cpf: customerData.cpf || undefined,
        profile_picture: customerData.profile_picture || undefined,
        type: 'customer',
      };

      const unifiedAddresses: UnifiedAddress[] = (customerData.addresses || []).map(
        addr => ({
          id: addr.id,
          address: addr.address,
          nickname: addr.nickname || undefined,
          is_default: addr.is_default,
        })
      );

      return { profile: unifiedProfile, addresses: unifiedAddresses };
    } catch (error) {
      console.error('Error in customer profile search:', error);
      return null;
    }
  }
}

export const unifiedProfileService = new UnifiedProfileService();
