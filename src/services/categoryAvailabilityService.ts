// services/categoryAvailabilityService.ts

import { supabase } from '../integrations/supabase/client';
import { BaseService } from './baseService';
import { Json } from '../integrations/supabase/types';

export interface CategoryAvailability {
  lanches: boolean;
  pizzas: boolean;
}

class CategoryAvailabilityService extends BaseService {
  async getCategoryAvailability(): Promise<CategoryAvailability> {
    try {
      const { data, error } = await supabase
        .from('page_settings')
        .select('setting_value')
        .eq('setting_key', 'category_availability')
        .single();
      
      if (error) {
        console.error('Error fetching category availability:', error);
        return { lanches: true, pizzas: true };
      }

      // No React Native não muda nada aqui
      const settings = data?.setting_value as unknown as CategoryAvailability;


      return {
        lanches: settings?.lanches ?? true,
        pizzas: settings?.pizzas ?? true,
      };
    } catch (error) {
      console.error('Error in getCategoryAvailability:', error);
      return { lanches: true, pizzas: true };
    }
  }

  async updateCategoryAvailability(settings: CategoryAvailability): Promise<void> {
    try {
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { error } = await supabase
        .from('page_settings')
        .update({ 
          setting_value: JSON.parse(JSON.stringify(settings)),
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', 'category_availability');
      
      if (error) {
        console.error('Error updating category availability:', error);
        throw error;
      }

      console.log('Category availability updated:', settings);
    } catch (error) {
      console.error('Error in updateCategoryAvailability:', error);
      throw error;
    }
  }
}

export const categoryAvailabilityService = new CategoryAvailabilityService();
