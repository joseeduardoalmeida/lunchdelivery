// src/services/reviewService.ts
import { supabase } from "../integrations/supabase/client"; // ajuste o caminho para onde está o client
// Se você realmente precisa de um BaseService, importe aqui. 
// Caso contrário pode remover a herança e deixar como classe normal.

export interface ReviewData {
  order_id: string;
  customer_name: string;
  customer_whatsapp?: string;
  customer_email?: string;
  food_rating: number;
  delivery_rating?: number;
  review_text?: string;
}

export interface Review extends ReviewData {
  id: string;
  created_at: string;
  updated_at: string;
}

class ReviewService {
  async createReview(reviewData: ReviewData): Promise<Review> {
    const { data, error } = await supabase
      .from("order_reviews")
      .insert([reviewData])
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      throw new Error("Erro ao criar avaliação");
    }

    return data as Review;
  }

  async getReviewByOrderId(orderId: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from("order_reviews")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching review:", error);
      throw new Error("Erro ao buscar avaliação");
    }

    return data as Review | null;
  }

  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    const { data, error } = await supabase
      .from("order_reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent reviews:", error);
      throw new Error("Erro ao buscar avaliações recentes");
    }

    return (data as Review[]) || [];
  }

  async updateReview(
    reviewId: string,
    updates: Partial<ReviewData>
  ): Promise<Review> {
    const { data, error } = await supabase
      .from("order_reviews")
      .update(updates)
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      console.error("Error updating review:", error);
      throw new Error("Erro ao atualizar avaliação");
    }

    return data as Review;
  }

  async getAverageRatings(): Promise<{
    averageFoodRating: number;
    averageDeliveryRating: number;
    totalReviews: number;
  }> {
    const { data, error } = await supabase
      .from("order_reviews")
      .select("food_rating, delivery_rating");

    if (error) {
      console.error("Error fetching ratings:", error);
      throw new Error("Erro ao buscar médias de avaliação");
    }

    if (!data || data.length === 0) {
      return {
        averageFoodRating: 0,
        averageDeliveryRating: 0,
        totalReviews: 0,
      };
    }

    const totalReviews = data.length;
    const averageFoodRating =
      data.reduce((sum, review) => sum + review.food_rating, 0) /
      totalReviews;

    const deliveryReviews = data.filter(
      (review) => review.delivery_rating !== null
    );
    const averageDeliveryRating =
      deliveryReviews.length > 0
        ? deliveryReviews.reduce(
            (sum, review) => sum + (review.delivery_rating || 0),
            0
          ) / deliveryReviews.length
        : 0;

    return {
      averageFoodRating: Math.round(averageFoodRating * 10) / 10,
      averageDeliveryRating: Math.round(averageDeliveryRating * 10) / 10,
      totalReviews,
    };
  }
}

export const reviewService = new ReviewService();
