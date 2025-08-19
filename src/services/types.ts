// types.ts

export interface WeeklyCombo {
  id: string;
  name: string;
  description: string;
  items: { menuItemId: string; quantity: number }[];
  originalPrice: number;
  promotionalPrice: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  active: boolean;
  image?: string;
  createdAt: Date;
}

export interface DeliveryOrder {
  id: string;
  customer_name: string;
  customer_address: string;
  customer_whatsapp: string;
  order_items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    combinationData?: {
      first: { name: string };
      second: { name: string };
    };
  }[];
  total_amount: number;
  status: 'pending' | 'in_delivery' | 'delivered';
  delivery_person?: string;
  original_order_id?: string;
  raffle_number?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryInfo {
  isDelivery: boolean;
  customerName: string;
  customerAddress: string;
  customerWhatsapp: string;
}
