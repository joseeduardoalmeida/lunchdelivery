import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HeartRating } from "./HeartRating"; // precisa adaptar p/ react-native
import { reviewService, Review } from "../../services/reviewService";

export const CustomerTestimonialsSection: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRatings, setAverageRatings] = useState({
        averageFoodRating: 0,
        averageDeliveryRating: 0,
        totalReviews: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const [recentReviews, ratings] = await Promise.all([
                    reviewService.getRecentReviews(6),
                    reviewService.getAverageRatings(),
                ]);

                setReviews(recentReviews);
                setAverageRatings(ratings);
            } catch (error) {
                console.error("Error loading reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        loadReviews();
    }, []);

    if (loading) {
        return (
            <View style={styles.section}>
                <View style={styles.header}>
                    <SkeletonPlaceholder>
                        <SkeletonPlaceholder.Item flexDirection="column" alignItems="center">
                            <SkeletonPlaceholder.Item
                                width={200}
                                height={24}
                                borderRadius={6}
                                alignSelf="center"
                                marginBottom={8}
                            />
                            <SkeletonPlaceholder.Item
                                width={280}
                                height={16}
                                borderRadius={6}
                                alignSelf="center"
                            />
                        </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder>

                </View>
                <FlatList
                    data={[...Array(6)]}
                    keyExtractor={(_, i) => i.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 12 }}
                    contentContainerStyle={{ gap: 12 }}
                    renderItem={() => (
                        <SkeletonPlaceholder>
                            <SkeletonPlaceholder.Item
                                flex={1}
                                borderRadius={12}
                                padding={16}
                                height={120}
                            />
                        </SkeletonPlaceholder>
                    )}
                />
            </View>
        );
    }

    if (reviews.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <View style={styles.header}>
                <Text style={styles.title}>O que nossos clientes dizem</Text>
                <Text style={styles.subtitle}>
                    Confira as avaliações dos nossos clientes
                </Text>

                {averageRatings.totalReviews > 0 && (
                    <View style={styles.ratingsSummary}>
                        <View style={styles.ratingRow}>
                            <HeartRating rating={Math.round(averageRatings.averageFoodRating)} readonly size="sm" />
                            <Text style={styles.ratingText}>
                                {averageRatings.averageFoodRating.toFixed(1)} (Comida)
                            </Text>
                        </View>

                        {averageRatings.averageDeliveryRating > 0 && (
                            <View style={styles.ratingRow}>
                                <HeartRating rating={Math.round(averageRatings.averageDeliveryRating)} readonly size="sm" />
                                <Text style={styles.ratingText}>
                                    {averageRatings.averageDeliveryRating.toFixed(1)} (Entrega)
                                </Text>
                            </View>
                        )}
                        <Text style={styles.totalReviews}>
                            ({averageRatings.totalReviews} avaliações)
                        </Text>
                    </View>
                )}
            </View>

            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ gap: 12 }}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.customerName}>{item.customer_name}</Text>
                            <Text style={styles.date}>
                                {format(new Date(item.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </Text>
                        </View>

                        <View style={styles.ratings}>
                            <View style={styles.ratingRow}>
                                <Text style={styles.label}>Comida:</Text>
                                <HeartRating rating={item.food_rating} readonly size="sm" />
                            </View>

                            {item.delivery_rating && (
                                <View style={styles.ratingRow}>
                                    <Text style={styles.label}>Entrega:</Text>
                                    <HeartRating rating={item.delivery_rating} readonly size="sm" />
                                </View>
                            )}
                        </View>

                        {item.review_text && (
                            <Text style={styles.reviewText}>"{item.review_text}"</Text>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        padding: 16,
        backgroundColor: "#f9f9f9",
    },
    header: {
        marginBottom: 16,
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#222",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
        textAlign: "center",
    },
    ratingsSummary: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#333",
    },
    totalReviews: {
        fontSize: 12,
        color: "#777",
    },
    card: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    customerName: {
        fontWeight: "600",
        color: "#222",
    },
    date: {
        fontSize: 12,
        color: "#777",
    },
    ratings: {
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: "500",
        color: "#444",
    },
    reviewText: {
        fontSize: 13,
        fontStyle: "italic",
        color: "#555",
        lineHeight: 18,
    },
});
