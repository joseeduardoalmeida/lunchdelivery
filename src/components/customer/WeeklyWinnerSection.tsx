import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // instale: npm install react-native-vector-icons
import { raffleService } from "../../services/raffleService";
import { WeeklyDraw } from "../../types/raffle";

export const WeeklyWinnerSection = () => {
  const [latestDraw, setLatestDraw] = useState<WeeklyDraw | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestDraw();
  }, []);

  const loadLatestDraw = async () => {
    try {
      setLoading(true);
      const draw = await raffleService.getLatestCompletedDraw();
      setLatestDraw(draw);
    } catch (error) {
      console.error("Error loading latest draw:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando sorteio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Icon name="star" size={28} color="#3b82f6" />
        <Text style={styles.title}>Ganhador da Semana</Text>
        <Icon name="star" size={28} color="#3b82f6" />
      </View>

      {!latestDraw ? (
        <View style={styles.card}>
          <Icon name="gift" size={48} color="#3b82f6" style={styles.icon} />
          <Text style={styles.cardTitle}>Primeiro Sorteio em Breve</Text>
          <Text style={styles.cardText}>
            Faça seu pedido e concorra automaticamente ao sorteio semanal!
          </Text>
          <View style={styles.badge}>
            <Icon name="calendar" size={16} color="#3b82f6" />
            <Text style={styles.badgeText}>Sorteio toda semana</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.card, styles.winnerCard]}>
          <View style={styles.cardHeader}>
            <Icon name="award" size={20} color="#3b82f6" />
            <Text style={styles.cardTitle}>Parabéns ao Ganhador!</Text>
            <Icon name="award" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.cardSubtitle}>
            Sorteio da semana de {formatDate(latestDraw.week_start_date)} a{" "}
            {formatDate(latestDraw.week_end_date)}
          </Text>

          <Text style={styles.winnerName}>{latestDraw.winner_customer_name}</Text>
          <Text style={styles.cardText}>foi o grande ganhador!</Text>

          <View style={styles.raffleBox}>
            <Text style={styles.smallText}>Número da Sorte</Text>
            <Text style={styles.raffleNumber}>
              {latestDraw.winner_raffle_number}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.smallText}>Participantes</Text>
              <Text style={styles.statValue}>
                {latestDraw.participating_orders_count}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.smallText}>Data do Sorteio</Text>
              <Text style={styles.statValue}>
                {latestDraw.draw_date ? formatDate(latestDraw.draw_date) : "-"}
              </Text>
            </View>
          </View>

          <View style={styles.nextDrawRow}>
            <Icon name="star" size={16} color="#3b82f6" />
            <Text style={styles.smallText}>
              Próximo sorteio no final da semana
            </Text>
            <Icon name="star" size={16} color="#3b82f6" />
          </View>
        </View>
      )}

      <Text style={styles.hint}>
        💡 <Text style={{ fontWeight: "bold" }}>Como participar:</Text> Finalize
        seu pedido e receba automaticamente um número da sorte!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3b82f6",
    marginHorizontal: 8,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 10,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
    elevation: 3,
  },
  winnerCard: {
    borderColor: "#3b82f6",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
  },
  cardText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 4,
  },
  winnerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginTop: 8,
  },
  raffleBox: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: "center",
  },
  raffleNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
    width: "100%",
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 6,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  statValue: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#111827",
  },
  smallText: {
    fontSize: 12,
    color: "#6b7280",
  },
  nextDrawRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#3b82f6",
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 8,
  },
  icon: {
    marginBottom: 12,
  },
});
