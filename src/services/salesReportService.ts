import { Order } from '../types';
import { unifiedOrderService } from './unifiedOrderService';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateCSV, CSVRow } from '@/utils/csvUtils';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export interface SalesReportData {
  date: string;
  time: string;
  orderId: string;
  value: number;
  customerName: string;
  customerWhatsApp: string;
  customerAddress: string;
  paymentMethod: string;
  orderType: 'Regular' | 'Delivery';
  observation: string;
}

class SalesReportService {
  private async getOrdersForReport(): Promise<Order[]> {
    const orders = await unifiedOrderService.getUnifiedOrders();
    return orders.filter(order => order.status === 'completed');
  }

  private mapOrderToReportData(order: Order): SalesReportData {
    const customerInfo = this.extractCustomerInfo(order);
    
    return {
      date: format(new Date(order.createdAt), 'dd/MM/yyyy'),
      time: format(new Date(order.createdAt), 'HH:mm:ss'),
      orderId: order.id,
      value: order.total,
      customerName: customerInfo.name,
      customerWhatsApp: customerInfo.whatsapp,
      customerAddress: customerInfo.address,
      paymentMethod: order.payment_method || 'Não informado',
      orderType: order.delivery_info ? 'Delivery' : 'Regular',
      observation: order.observation || ''
    };
  }

  private extractCustomerInfo(order: Order) {
    if (order.delivery_info) {
      return {
        name: order.delivery_info.customerName || 'Cliente não identificado',
        whatsapp: order.delivery_info.customerWhatsapp || 'Não informado',
        address: order.delivery_info.customerAddress || 'Não informado'
      };
    }
    return {
      name: 'Cliente presencial',
      whatsapp: 'Não informado',
      address: 'Retirada no local'
    };
  }

  async generateWeeklyReport(date: Date = new Date()): Promise<SalesReportData[]> {
    const orders = await this.getOrdersForReport();
    const weekStart = startOfWeek(date, { locale: ptBR });
    const weekEnd = endOfWeek(date, { locale: ptBR });

    const weeklyOrders = orders.filter(order =>
      isWithinInterval(new Date(order.createdAt), { start: weekStart, end: weekEnd })
    );

    return weeklyOrders
      .map(order => this.mapOrderToReportData(order))
      .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
  }

  async generateMonthlyReport(date: Date = new Date()): Promise<SalesReportData[]> {
    const orders = await this.getOrdersForReport();
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthlyOrders = orders.filter(order =>
      isWithinInterval(new Date(order.createdAt), { start: monthStart, end: monthEnd })
    );

    return monthlyOrders
      .map(order => this.mapOrderToReportData(order))
      .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
  }

  private async saveCSVFile(csv: string, filename: string) {
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    await RNFS.writeFile(path, csv, 'utf8');
    await Share.open({ url: 'file://' + path });
  }

  async downloadWeeklyReport(date: Date = new Date()): Promise<void> {
    const reportData = await this.generateWeeklyReport(date);
    if (!reportData.length) throw new Error('Nenhuma venda encontrada para esta semana');

    const csvData: CSVRow[] = reportData.map(data => ({
      'Data': data.date,
      'Hora': data.time,
      'ID do Pedido': data.orderId,
      'Valor (R$)': data.value.toFixed(2).replace('.', ','),
      'Nome do Cliente': data.customerName,
      'WhatsApp': data.customerWhatsApp,
      'Endereço': data.customerAddress,
      'Método de Pagamento': data.paymentMethod,
      'Tipo de Pedido': data.orderType,
      'Observações': data.observation
    }));

    const headers = [
      'Data','Hora','ID do Pedido','Valor (R$)','Nome do Cliente',
      'WhatsApp','Endereço','Método de Pagamento','Tipo de Pedido','Observações'
    ];

    const csv = generateCSV(csvData, headers);
    const filename = `relatorio-vendas-semanal-${format(date, 'dd-MM-yyyy')}.csv`;

    await this.saveCSVFile(csv, filename);
  }

  async downloadMonthlyReport(date: Date = new Date()): Promise<void> {
    const reportData = await this.generateMonthlyReport(date);
    if (!reportData.length) throw new Error('Nenhuma venda encontrada para este mês');

    const csvData: CSVRow[] = reportData.map(data => ({
      'Data': data.date,
      'Hora': data.time,
      'ID do Pedido': data.orderId,
      'Valor (R$)': data.value.toFixed(2).replace('.', ','),
      'Nome do Cliente': data.customerName,
      'WhatsApp': data.customerWhatsApp,
      'Endereço': data.customerAddress,
      'Método de Pagamento': data.paymentMethod,
      'Tipo de Pedido': data.orderType,
      'Observações': data.observation
    }));

    const headers = [
      'Data','Hora','ID do Pedido','Valor (R$)','Nome do Cliente',
      'WhatsApp','Endereço','Método de Pagamento','Tipo de Pedido','Observações'
    ];

    const csv = generateCSV(csvData, headers);
    const filename = `relatorio-vendas-mensal-${format(date, 'MM-yyyy')}.csv`;

    await this.saveCSVFile(csv, filename);
  }

  async getReportSummary(reportData: SalesReportData[]) {
    const totalSales = reportData.reduce((sum, data) => sum + data.value, 0);
    const totalOrders = reportData.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    const deliveryOrders = reportData.filter(d => d.orderType === 'Delivery').length;
    const regularOrders = reportData.filter(d => d.orderType === 'Regular').length;

    return { totalSales, totalOrders, averageTicket, deliveryOrders, regularOrders };
  }
}

export const salesReportService = new SalesReportService();
