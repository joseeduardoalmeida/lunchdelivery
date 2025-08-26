import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert
} from "react-native";
import { raffleService } from "../../services/raffleService";
import { RaffleData } from "../../types/raffle";

export const RafflePanel = () => {
  const [raffleData, setRaffleData] = useState<RaffleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawLoading, setDrawLoading] = useState(false);

  useEffect(() => {
    loadRaffleData();
  }, []);

  const loadRaffleData = async () => {
    try {
      setLoading(true);
      const data = await raffleService.getRaffleData();
      setRaffleData(data);
    } catch (error) {
      console.error("Erro ao carregar dados do sorteio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDraw = async () => {
    if (!raffleData?.canDrawWinner) return;

    try {
      setDrawLoading(true);
      const result = await raffleService.performDraw();

      Alert.alert(
        "Sucesso",`🎉 Sorteio Realizado!\n\nGanhador: ${result.winner_customer_name}\nNúmero: ${result.winner_raffle_number}`
      );

      await loadRaffleData();
    } catch (error) {
      console.error("Erro ao realizar sorteio:", error);
      Alert.alert("Erro","Erro ao realizar sorteio");
    } finally {
      setDrawLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR");

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.muted}>Carregando dados...</Text>
      </View>
    );
  }

  if (!raffleData) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Erro ao carregar dados do sorteio</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>🎁 Sorteio Semanal</Text>
        {raffleData.canDrawWinner && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleDraw}
            disabled={drawLoading}
          >
            <Text style={styles.buttonText}>
              {drawLoading ? "Realizando..." : "Realizar Sorteio 🏆"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cards de stats */}
      <View style={styles.cardGrid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Semana Atual</Text>
          {raffleData.currentWeekDraw && (
          <Text style={styles.cardValue}>
            {formatDate(raffleData.currentWeekDraw.week_start_date)} -{" "}
            {formatDate(raffleData.currentWeekDraw.week_end_date)}
          </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pedidos Participantes</Text>
          <Text style={[styles.cardValue, { color: "#2563eb" }]}>
            {raffleData.totalParticipatingOrders}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Status do Sorteio</Text>
          {raffleData.currentWeekDraw && (
          <Text style={styles.badge}>
            {raffleData.currentWeekDraw.is_completed
              ? "Concluído ✅"
              : "Pendente ⏳"}
          </Text>
          )}
          {raffleData.currentWeekDraw && raffleData.currentWeekDraw.is_completed &&
            raffleData.currentWeekDraw.winner_customer_name && (
              <Text style={styles.muted}>
                Ganhador: {raffleData.currentWeekDraw.winner_customer_name}
              </Text>
            )}
        </View>
      </View>

      {/* Card do ganhador */}
      {raffleData.currentWeekDraw && raffleData.currentWeekDraw.is_completed &&
        raffleData.currentWeekDraw.winner_customer_name && (
          <View style={[styles.card, { backgroundColor: "#dbeafe" }]}>
            <Text style={styles.cardLabel}>🏆 Ganhador da Semana</Text>
            <Text style={styles.cardValue}>
              {raffleData.currentWeekDraw.winner_customer_name}
            </Text>
            <Text style={[styles.cardValue, { color: "#2563eb" }]}>
              Número da Sorte: {raffleData.currentWeekDraw.winner_raffle_number}
            </Text>
            <Text style={styles.muted}>
              Data:{" "}
              {raffleData.currentWeekDraw.draw_date
                ? new Date(
                    raffleData.currentWeekDraw.draw_date
                  ).toLocaleString("pt-BR")
                : "-"}
            </Text>
          </View>
        )}

      {/* Lista de pedidos elegíveis */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Pedidos Elegíveis</Text>
        {raffleData.eligibleOrders.length === 0 ? (
          <Text style={styles.muted}>
            Nenhum pedido elegível encontrado para esta semana
          </Text>
        ) : (
          <FlatList
            data={raffleData.eligibleOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.listRow}>
                <Text style={styles.listBadge}>#{item.raffle_number}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{item.customer_name}</Text>
                  <Text style={styles.muted}>
                    R$ {item.total.toFixed(2)} -{" "}
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
                <Text style={styles.muted}>
                  {item.customer_whatsapp || "-"}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  cardLabel: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
  cardValue: { fontSize: 16, fontWeight: "700" },
  badge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  muted: { color: "#6b7280", fontSize: 12 },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 8,
  },
  listBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: "700",
  },
  listTitle: { fontWeight: "600" },
});
