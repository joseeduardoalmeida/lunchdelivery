import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Calendar, DollarSign, TrendingUp, Clock, Download } from "lucide-react-native";
import { dataService } from "../../services/dataService";
import { salesReportService } from "@/services/salesReportService";
import { Order } from "../../types";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const SalesReportsPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM")
  );
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await dataService.getOrders();
      setOrders(ordersData.filter((order) => order.status === "completed"));
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!selectedMonth) return orders;

    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    return orders.filter((order) =>
      isWithinInterval(new Date(order.createdAt), {
        start: monthStart,
        end: monthEnd,
      })
    );
  }, [orders, selectedMonth]);

  const salesByDate = useMemo(() => {
    const grouped = filteredOrders.reduce((acc, order) => {
      const dateKey = format(new Date(order.createdAt), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(order);
      return acc;
    }, {} as Record<string, Order[]>);

    return Object.entries(grouped)
      .map(([date, dateOrders]) => ({
        date,
        orders: dateOrders,
        total: dateOrders.reduce((sum, order) => sum + order.total, 0),
        orderCount: dateOrders.length,
      }))
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [filteredOrders]);

  const calculatePeriodTotals = () => {
    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { locale: ptBR });
    const weekEnd = endOfWeek(now, { locale: ptBR });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const dayOrders = orders.filter((order) =>
      isWithinInterval(new Date(order.createdAt), { start: dayStart, end: dayEnd })
    );
    const weekOrders = orders.filter((order) =>
      isWithinInterval(new Date(order.createdAt), { start: weekStart, end: weekEnd })
    );
    const monthOrders = orders.filter((order) =>
      isWithinInterval(new Date(order.createdAt), { start: monthStart, end: monthEnd })
    );

    return {
      day: {
        total: dayOrders.reduce((sum, order) => sum + order.total, 0),
        count: dayOrders.length,
      },
      week: {
        total: weekOrders.reduce((sum, order) => sum + order.total, 0),
        count: weekOrders.length,
      },
      month: {
        total: monthOrders.reduce((sum, order) => sum + order.total, 0),
        count: monthOrders.length,
      },
    };
  };

  const periodTotals = calculatePeriodTotals();

  const handleDownloadWeeklyReport = async () => {
    setIsDownloading(true);
    try {
      await salesReportService.downloadWeeklyReport();
      alert("Relatório semanal baixado com sucesso!");
    } catch (error) {
      alert("Erro ao baixar relatório semanal.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadMonthlyReport = async () => {
    setIsDownloading(true);
    try {
      await salesReportService.downloadMonthlyReport();
      alert("Relatório mensal baixado com sucesso!");
    } catch (error) {
      alert("Erro ao baixar relatório mensal.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e11d48" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Download Reports */}
      <View style={styles.card}>
        <Text style={styles.title}>📥 Baixar Relatórios de Vendas</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleDownloadWeeklyReport}
            disabled={isDownloading}
          >
            <Text style={styles.buttonText}>
              {isDownloading ? "Gerando..." : "Relatório Semanal"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleDownloadMonthlyReport}
            disabled={isDownloading}
          >
            <Text style={styles.buttonText}>
              {isDownloading ? "Gerando..." : "Relatório Mensal"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Period Totals */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text>Vendas do Dia</Text>
          <Text style={styles.value}>R$ {periodTotals.day.total.toFixed(2)}</Text>
          <Text>{periodTotals.day.count} pedidos</Text>
        </View>
        <View style={styles.card}>
          <Text>Vendas da Semana</Text>
          <Text style={styles.value}>R$ {periodTotals.week.total.toFixed(2)}</Text>
          <Text>{periodTotals.week.count} pedidos</Text>
        </View>
        <View style={styles.card}>
          <Text>Vendas do Mês</Text>
          <Text style={styles.value}>R$ {periodTotals.month.total.toFixed(2)}</Text>
          <Text>{periodTotals.month.count} pedidos</Text>
        </View>
      </View>

      {/* Filtro */}
      <View style={styles.card}>
        <Text>Filtrar por mês:</Text>
        <TextInput
          value={selectedMonth}
          onChangeText={setSelectedMonth}
          style={styles.input}
          placeholder="yyyy-MM"
        />
        <TouchableOpacity style={styles.button} onPress={loadOrders}>
          <Text style={styles.buttonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Vendas */}
      <View style={styles.card}>
        <Text style={styles.title}>📊 Relatório de Vendas</Text>
        {salesByDate.length === 0 ? (
          <Text>Nenhuma venda encontrada.</Text>
        ) : (
          <FlatList
            data={salesByDate}
            keyExtractor={(item) => item.date}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.bold}>
                  {format(new Date(item.date), "dd 'de' MMMM", { locale: ptBR })}
                </Text>
                <Text>{item.orderCount} pedidos</Text>
                <Text style={styles.green}>R$ {item.total.toFixed(2)}</Text>
                {item.orders.map((order) => (
                  <Text key={order.id} style={styles.detail}>
                    ⏰ {format(new Date(order.createdAt), "HH:mm")} - #{order.id.slice(-4)} - R$ {order.total.toFixed(2)}
                  </Text>
                ))}
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, elevation: 2 },
  title: { fontWeight: "bold", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 12 },
  button: { backgroundColor: "#e11d48", padding: 10, borderRadius: 8 },
  buttonText: { color: "#fff", textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6, marginVertical: 8 },
  value: { fontSize: 18, fontWeight: "bold" },
  listItem: { paddingVertical: 8, borderBottomWidth: 1, borderColor: "#eee" },
  bold: { fontWeight: "bold" },
  green: { color: "green", fontWeight: "bold" },
  detail: { fontSize: 12, color: "#555" },
});
