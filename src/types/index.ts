
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  preparation_time: number;
  combinationData?: {
    first: MenuItem;
    second: MenuItem;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  name: string;
  menuItem: MenuItem;
  customizations: string[];
}

export interface Order {
  id: string;
  total: number;
  status: 'preparing' | 'out_for_delivery' | 'completed';
  estimatedTime: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  observation?: string | null;
  payment_status?: 'pending' | 'paid' | 'cancelled' | 'expired';
  payment_method?: 'PIX' | 'CARD' | 'MONEY' | null;
  transaction_id?: string | null;
  change_amount?: number | null;
  payment_receipt?: string | null;
  raffle_number?: string | null;
  delivery_info?: {
    customerName: string;
    customerAddress: string;
    customerWhatsapp: string;
    isDelivery: boolean;
    deliveryPersonName?: string;
  };
}

export interface WeeklyCombo {
  id: string;
  name: string;
  description: string;
  price: number;
  items: MenuItem[];
  image: string;
  active: boolean;
  originalPrice?: number;
  promotionalPrice?: number;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
  createdAt: Date;
}

// types.d.ts
export type RootStackParamList = {
  Home: undefined;
  ResetPassword: undefined;
  AuthCallback: undefined;
  NotFound: undefined;
};