// services/raffleService.ts
import { supabase } from '../integrations/supabase/client';
import { WeeklyDraw, RaffleData } from '../types/raffle';
import { Order } from '../types';

// Base genérica para RN (sem herança, para simplificar)
class RaffleService {
  // Buscar ou criar sorteio da semana
  async getCurrentWeekDraw(): Promise<WeeklyDraw> {
    try {
      const { startOfWeek, endOfWeek } = this.getWeekDates();

      const { data: existingDraw, error: fetchError } = await supabase
        .from('weekly_draws')
        .select('*')
        .eq('week_start_date', startOfWeek)
        .eq('week_end_date', endOfWeek)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingDraw) {
        return this.mapWeeklyDraw(existingDraw);
      }

      const { data: newDraw, error: createError } = await supabase
        .from('weekly_draws')
        .insert({
          week_start_date: startOfWeek,
          week_end_date: endOfWeek,
          is_completed: false,
          participating_orders_count: 0
        })
        .select()
        .single();

      if (createError) throw createError;

      return this.mapWeeklyDraw(newDraw);
    } catch (error) {
      console.error('Erro ao obter sorteio da semana:', error);
      throw error;
    }
  }

  // Pedidos válidos da semana
  async getEligibleOrders(): Promise<Order[]> {
    try {
      const { startOfWeek, endOfWeek } = this.getWeekDates();

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .eq('status', 'completed')
        .gte('created_at', startOfWeek)
        .lte('created_at', endOfWeek)
        .not('raffle_number', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(order => ({
        id: order.id,
        status: order.status as Order['status'],
        total: Number(order.total),
        estimatedTime: order.estimated_time,
        items: order.order_items.map((item: any) => ({
          id: item.id,
          orderId: order.id,
          menuItemId: item.menu_item_id,
          name: item.menu_items.name,
          price: Number(item.price),
          quantity: item.quantity,
          menuItem: item.menu_items,
          customizations: item.customizations || []
        })),
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        observation: order.observation || null,
        payment_status: (order.payment_status as 'pending' | 'paid' | 'cancelled' | 'expired') || 'pending',
        payment_method: (order.payment_method as 'PIX' | 'CARD' | 'MONEY') || null,
        transaction_id: order.transaction_id || null,
        change_amount: order.change_amount ? Number(order.change_amount) : null,
        payment_receipt: order.payment_receipt || null,
        raffle_number: order.raffle_number || null,
        delivery_info: order.delivery_info ? {
          customerName: (order.delivery_info as any).customerName || '',
          customerAddress: (order.delivery_info as any).customerAddress || '',
          customerWhatsapp: (order.delivery_info as any).customerWhatsapp || '',
          isDelivery: (order.delivery_info as any).isDelivery || false
        } : undefined
      }));
    } catch (error) {
      console.error('Erro ao buscar pedidos elegíveis:', error);
      throw error;
    }
  }

  // Dados para painel/admin
  async getRaffleData(): Promise<RaffleData> {
    try {
      const currentWeekDraw = await this.getCurrentWeekDraw();
      const eligibleOrders = await this.getEligibleOrders();

      const eligibleOrdersData = eligibleOrders.map(order => ({
        id: order.id,
        raffle_number: order.raffle_number!,
        customer_name: order.delivery_info?.customerName || 'Cliente',
        customer_whatsapp: order.delivery_info?.customerWhatsapp,
        customer_email: order.delivery_info?.customerWhatsapp,
        total: order.total,
        created_at: order.createdAt
      }));

      return {
        currentWeekDraw,
        eligibleOrders: eligibleOrdersData,
        totalParticipatingOrders: eligibleOrders.length,
        canDrawWinner: !currentWeekDraw.is_completed && eligibleOrders.length > 0
      };
    } catch (error) {
      console.error('Erro ao buscar dados do sorteio:', error);
      throw error;
    }
  }

  // Realizar sorteio
  async performDraw(): Promise<WeeklyDraw> {
    try {
      // Aqui você precisaria ter uma lógica para verificar admin no mobile (pode ser um claim JWT, role no banco, etc.)
      const isAdminUser = true; // <-- adaptar
      if (!isAdminUser) {
        throw new Error('Acesso negado: Admin obrigatório');
      }

      const currentWeekDraw = await this.getCurrentWeekDraw();
      if (currentWeekDraw.is_completed) {
        throw new Error('O sorteio já foi concluído nesta semana');
      }

      const eligibleOrders = await this.getEligibleOrders();
      if (eligibleOrders.length === 0) {
        throw new Error('Nenhum pedido válido para esta semana');
      }

      const randomIndex = Math.floor(Math.random() * eligibleOrders.length);
      const winnerOrder = eligibleOrders[randomIndex];

      const { data: updatedDraw, error: updateError } = await supabase
        .from('weekly_draws')
        .update({
          winner_order_id: winnerOrder.id,
          winner_raffle_number: winnerOrder.raffle_number,
          winner_customer_name: winnerOrder.delivery_info?.customerName || 'Cliente',
          winner_customer_whatsapp: winnerOrder.delivery_info?.customerWhatsapp,
          winner_customer_email: winnerOrder.delivery_info?.customerWhatsapp,
          draw_date: new Date().toISOString(),
          is_completed: true,
          participating_orders_count: eligibleOrders.length
        })
        .eq('id', currentWeekDraw.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return this.mapWeeklyDraw(updatedDraw);
    } catch (error) {
      console.error('Erro ao realizar sorteio:', error);
      throw error;
    }
  }

  // Último sorteio concluído
  async getLatestCompletedDraw(): Promise<WeeklyDraw | null> {
    try {
      const { data, error } = await supabase
        .from('weekly_draws')
        .select('*')
        .eq('is_completed', true)
        .order('draw_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? this.mapWeeklyDraw(data) : null;
    } catch (error) {
      console.error('Erro ao obter último sorteio concluído:', error);
      return null;
    }
  }

  // Helpers
  private getWeekDates() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      startOfWeek: startOfWeek.toISOString().split('T')[0],
      endOfWeek: endOfWeek.toISOString().split('T')[0]
    };
  }

  private mapWeeklyDraw(data: any): WeeklyDraw {
    return {
      id: data.id,
      week_start_date: data.week_start_date,
      week_end_date: data.week_end_date,
      winner_order_id: data.winner_order_id,
      winner_raffle_number: data.winner_raffle_number,
      winner_customer_name: data.winner_customer_name,
      winner_customer_whatsapp: data.winner_customer_whatsapp,
      winner_customer_email: data.winner_customer_email,
      draw_date: data.draw_date,
      is_completed: data.is_completed,
      participating_orders_count: data.participating_orders_count,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}

export const raffleService = new RaffleService();
