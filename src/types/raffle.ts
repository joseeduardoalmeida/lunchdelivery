// types/raffle.ts

export interface WeeklyDraw {
  id: string;
  week_start_date: string;
  week_end_date: string;
  winner_order_id?: string;
  winner_raffle_number?: string;
  winner_customer_name?: string;
  winner_customer_whatsapp?: string;
  winner_customer_email?: string;
  draw_date?: string;
  is_completed: boolean;
  participating_orders_count: number;
  created_at: string;
  updated_at: string;
}

export interface EligibleOrder {
  id: string;
  raffle_number: string;
  customer_name: string;
  customer_whatsapp?: string;
  customer_email?: string;
  total: number;
  created_at: string;
}

export interface RaffleData {
  currentWeekDraw?: WeeklyDraw;
  eligibleOrders: EligibleOrder[];
  totalParticipatingOrders: number;
  canDrawWinner: boolean;
}
