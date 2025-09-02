import { supabase } from "../integrations/supabase/client";
import { BaseService } from "./baseService";
import { WeeklyCombo } from "./types";

class WeeklyComboService extends BaseService {
  async getActiveWeeklyCombos(): Promise<WeeklyCombo[]> {
    // gera a data no formato YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("weekly_combos")
      .select("*")
      .eq("active", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((combo: any) => ({
      id: combo.id,
      name: combo.name,
      description: combo.description,
      items: combo.items as { menuItemId: string; quantity: number }[],
      originalPrice: Number(combo.original_price),
      promotionalPrice: Number(combo.promotional_price),
      discountPercentage: combo.discount_percentage,
      startDate: combo.start_date,
      endDate: combo.end_date,
      active: combo.active,
      image: combo.image || "",
      createdAt: new Date(combo.created_at),
    }));
  }
}

export const weeklyComboService = new WeeklyComboService();
