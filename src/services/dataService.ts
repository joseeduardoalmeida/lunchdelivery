import { supabase } from '../integrations/supabase/client';
import { MenuItem, Order, OrderItem, Category, WeeklyCombo } from '../types';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../types';

export const dataService = {
    // --- Menu Items ---
    async getMenuItems(): Promise<MenuItem[]> {
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;

            return (data || []).map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                category: item.category_id,
                available: item.available,
                preparation_time: item.preparation_time,
            }));
        } catch (error) {
            console.error('Error getting menu items:', error);
            throw error;
        }
    },

    async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
        try {
            const newItem = { ...item, id: uuidv4(), category_id: item.category };
            const { category, ...dbItem } = newItem;

            const { data, error } = await supabase
                .from('menu_items')
                .insert([dbItem])
                .select()
                .single();

            if (error) throw error;

            return { ...data, category: data.category_id };
        } catch (error) {
            console.error('Error creating menu item:', error);
            throw error;
        }
    },

    async saveMenuItem(item: MenuItem): Promise<MenuItem> {
        try {
            const { data: existingItem } = await supabase
                .from('menu_items')
                .select('id')
                .eq('id', item.id)
                .single();

            const dbItem = { ...item, category_id: item.category };

            if (existingItem) {
                const { data, error } = await supabase
                    .from('menu_items')
                    .update(dbItem)
                    .eq('id', item.id)
                    .select()
                    .single();
                if (error) throw error;
                return { ...data, category: data.category_id };
            } else {
                const { data, error } = await supabase
                    .from('menu_items')
                    .insert([dbItem])
                    .select()
                    .single();
                if (error) throw error;
                return { ...data, category: data.category_id };
            }
        } catch (error) {
            console.error('Error saving menu item:', error);
            throw error;
        }
    },

    async deleteMenuItem(id: string): Promise<boolean> {
        try {
            const { error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) return false;
            return true;
        } catch {
            return false;
        }
    },

    // --- Categories ---
    async getCategories(): Promise<Category[]> {
        try {
            const { data, error } = await supabase.from('categories').select('*').order('order', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    },

    async saveCategory(category: Category): Promise<Category> {
        try {
            const { data: existingCategory } = await supabase
                .from('categories')
                .select('id')
                .eq('id', category.id)
                .single();

            if (existingCategory) {
                const { data, error } = await supabase
                    .from('categories')
                    .update(category)
                    .eq('id', category.id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabase.from('categories').insert([category]).select().single();
                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Error saving category:', error);
            throw error;
        }
    },

    async deleteCategory(id: string): Promise<boolean> {
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            return !error;
        } catch {
            return false;
        }
    },

    // --- Weekly Combos ---
    async getWeeklyCombos(): Promise<WeeklyCombo[]> {
        try {
            const { data, error } = await supabase
                .from('weekly_combos')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            return (data || []).map(combo => ({
                id: combo.id,
                name: combo.name,
                description: combo.description,
                price: combo.promotional_price,
                originalPrice: combo.original_price,
                promotionalPrice: combo.promotional_price,
                discountPercentage: combo.discount_percentage,
                startDate: combo.start_date,
                endDate: combo.end_date,
                image: combo.image || '',
                active: combo.active,
                items: [], // manter vazio ou mapear se houver
                createdAt: new Date(combo.created_at),
            }));
        } catch (error) {
            console.error('Error getting weekly combos:', error);
            throw error;
        }
    },


    async createWeeklyCombo(item: Omit<WeeklyCombo, 'id'>): Promise<WeeklyCombo> {
        try {
            const newItem = {
                id: uuidv4(),
                name: item.name,
                description: item.description,
                promotional_price: item.promotionalPrice || item.price,
                original_price: item.originalPrice || item.price,
                discount_percentage: item.discountPercentage || 0,
                start_date: item.startDate || new Date().toISOString().split('T')[0],
                end_date: item.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                image: item.image,
                active: item.active,
                items: [], // inicial vazio
            };

            const { data, error } = await supabase
                .from('weekly_combos')
                .insert([newItem])
                .select()
                .single();

            if (error) throw error;

            // Mapear explicitamente para a interface
            return {
                id: data.id,
                name: data.name,
                description: data.description,
                price: data.promotional_price,
                promotionalPrice: data.promotional_price,
                originalPrice: data.original_price,
                discountPercentage: data.discount_percentage,
                startDate: data.start_date,
                endDate: data.end_date,
                image: data.image || '',
                active: data.active,
                items: [], // manter vazio ou preencher
                createdAt: new Date(data.created_at),
            };
        } catch (error) {
            console.error('Error creating weekly combo:', error);
            throw error;
        }
    },


    async updateWeeklyCombo(
        id: string,
        updates: Partial<WeeklyCombo>
    ): Promise<WeeklyCombo | null> {
        try {
            const dbUpdates: any = { ...updates };

            if (updates.price) dbUpdates.promotional_price = updates.price;
            if (updates.promotionalPrice) dbUpdates.promotional_price = updates.promotionalPrice;
            if (updates.originalPrice) dbUpdates.original_price = updates.originalPrice;
            if (updates.discountPercentage) dbUpdates.discount_percentage = updates.discountPercentage;
            if (updates.startDate) dbUpdates.start_date = updates.startDate;
            if (updates.endDate) dbUpdates.end_date = updates.endDate;
            if (updates.image) dbUpdates.image = updates.image;
            if (updates.active !== undefined) dbUpdates.active = updates.active;
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.description) dbUpdates.description = updates.description;

            const { data, error } = await supabase
                .from('weekly_combos')
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Mapear explicitamente para a interface WeeklyCombo
            return {
                id: data.id,
                name: data.name,
                description: data.description,
                price: data.promotional_price,
                promotionalPrice: data.promotional_price,
                originalPrice: data.original_price,
                discountPercentage: data.discount_percentage,
                startDate: data.start_date,
                endDate: data.end_date,
                image: data.image || '',
                active: data.active,
                items: [], // manter vazio ou preencher conforme necessário
                createdAt: new Date(data.created_at),
            };
        } catch (error) {
            console.error('Error updating weekly combo:', error);
            return null;
        }
    },


    async deleteWeeklyCombo(id: string): Promise<boolean> {
        try {
            const { error } = await supabase.from('weekly_combos').delete().eq('id', id);
            return !error;
        } catch {
            return false;
        }
    },

    // --- Cart (React Native AsyncStorage) ---
    async saveCart(cart: CartItem[]): Promise<void> {
        try {
            await AsyncStorage.setItem('fastfood-cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    },

    async getCart(): Promise<CartItem[]> {
        try {
            const saved = await AsyncStorage.getItem('fastfood-cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    },

    async clearCart(): Promise<void> {
        try {
            await AsyncStorage.removeItem('fastfood-cart');
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    },

    generateOrderId(): string {
        return uuidv4();
    },

    // --- Orders ---
    async getOrders(): Promise<Order[]> {
        try {
            const { data: orders, error } = await supabase
                .from('orders')
                .select(`
          *,
          items:order_items (*, menuItem:menu_items(*))
        `)
                .order('created_at', { ascending: false });
            if (error) throw error;

            return (orders || []).map((order: any) => ({
                ...order,
                items: (order.items || []).map((item: any) => ({
                    ...item,
                    menuItem: { ...item.menuItem, category: item.menuItem.category_id },
                })),
            }));
        } catch (error) {
            console.error('Error getting orders:', error);
            throw error;
        }
    },
};
