// categoryService.ts
import { supabase } from '../integrations/supabase/client';
import { Category } from '../types';
import { BaseService } from './baseService';

// No React Native, certifique-se de ter feito:
// npm install @supabase/supabase-js react-native-url-polyfill
// e import 'react-native-url-polyfill/auto'; no entry point (ex: App.tsx)

class CategoryService extends BaseService {
  // Buscar categorias
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        order: cat.order,
      }));
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  // Salvar categoria
  async saveCategory(category: Category): Promise<void> {
    try {
      // Verifica se é admin antes de salvar
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { error } = await supabase
        .from('categories')
        .upsert({
          id: category.id,
          name: category.name,
          icon: category.icon,
          order: category.order,
        });

      if (error) {
        console.error('Error saving category:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveCategory:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
