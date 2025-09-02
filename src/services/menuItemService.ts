// menuItemService.ts
import { supabase } from '../integrations/supabase/client';
import { MenuItem } from '../types';
import { BaseService } from './baseService';

// Certifique-se no entry point do app (ex: App.tsx) de adicionar:
// import 'react-native-url-polyfill/auto';

class MenuItemService extends BaseService {
  // Buscar todos os itens do menu
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching menu items:', error);
        throw error;
      }

      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        image: item.image,
        category: item.category_id,
        available: item.available,
        preparation_time: item.preparation_time,
      }));
    } catch (error) {
      console.error('Error in getMenuItems:', error);
      throw error;
    }
  }

  // Salvar ou atualizar item do menu
  async saveMenuItem(item: MenuItem): Promise<void> {
    try {
      // Verifica se é admin antes de salvar
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { error } = await supabase
        .from('menu_items')
        .upsert({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          category_id: item.category,
          available: item.available,
          preparation_time: item.preparation_time,
        });

      if (error) {
        console.error('Error saving menu item:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveMenuItem:', error);
      throw error;
    }
  }

  // Deletar item do menu
  async deleteMenuItem(id: string): Promise<void> {
    try {
      // Verifica se é admin antes de deletar
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting menu item:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteMenuItem:', error);
      throw error;
    }
  }
}

export const menuItemService = new MenuItemService();
