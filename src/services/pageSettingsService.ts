
import { supabase } from '../integrations/supabase/client';
import { BaseService } from './baseService';

export interface HeaderSettings {
  image_url: string;
  enabled: boolean;
}

class PageSettingsService extends BaseService {
  async getHeaderSettings(): Promise<HeaderSettings> {
    try {
      const { data, error } = await supabase
        .from('page_settings')
        .select('setting_value')
        .eq('setting_key', 'header_background')
        .single();
      
      if (error) {
        console.error('Error fetching header settings:', error);
        return { image_url: '', enabled: false };
      }
      
      // Safely cast the Json type to HeaderSettings
      const settings = data.setting_value as unknown as HeaderSettings;
      
      // Validate and provide defaults if needed
      return {
        image_url: settings?.image_url || '',
        enabled: settings?.enabled || false
      };
    } catch (error) {
      console.error('Error in getHeaderSettings:', error);
      return { image_url: '', enabled: false };
    }
  }

  async updateHeaderSettings(settings: HeaderSettings): Promise<void> {
    try {
      // Verify admin status before allowing update
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { error } = await supabase
        .from('page_settings')
        .update({ 
          setting_value: settings as any,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'header_background');
      
      if (error) {
        console.error('Error updating header settings:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateHeaderSettings:', error);
      throw error;
    }
  }
}

export const pageSettingsService = new PageSettingsService();
