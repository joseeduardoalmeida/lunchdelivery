import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useToast } from '../../hooks/use-toast';
import { Order } from '../../types';

interface DeliveryOrder {
    id: string;
    customer_name: string;
    customer_address: string;
    customer_whatsapp: string;
    customer_cpf?: string;
    customer_email?: string;
    order_items: {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
        combinationData?: { first: { name: string }; second: { name: string } };
        customizations?: string[];
        menuItem?: { name: string; customizations?: string[] };
    }[];
    total_amount: number;
    status: 'pending' | 'in_delivery' | 'delivered';
    delivery_person?: string;
    created_at: string;
    observation?: string;
    payment_status?: 'pending' | 'paid' | 'cancelled' | 'expired';
    payment_method?: 'PIX' | 'CARD' | 'MONEY';
    change_amount?: number;
    raffle_number?: string;
}

interface PrintOrderButtonProps {
    order: Order | DeliveryOrder;
    isDeliveryOrder?: boolean;
}

export const PrintOrderButton = ({ order }: PrintOrderButtonProps) => {
    const { toast } = useToast();
    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const [printContent, setPrintContent] = useState('');

    const formatCombinedPizza = (item: any) => {
        if (item.combinationData) {
            const { first, second } = item.combinationData;
            return `1/2 ${first.name} + 1/2 ${second.name}`;
        }
        if (item.customizations && Array.isArray(item.customizations)) {
            for (const c of item.customizations) {
                const match = c.match(/Combinação: (.+) \+ (.+)/);
                if (match) return `1/2 ${match[1].trim()} + 1/2 ${match[2].trim()}`;
            }
        }
        if (item.menuItem?.customizations) {
            for (const c of item.menuItem.customizations) {
                const match = c.match(/Combinação: (.+) \+ (.+)/);
                if (match) return `1/2 ${match[1].trim()} + 1/2 ${match[2].trim()}`;
            }
        }
        return item.name || item.menuItem?.name || 'Item sem nome';
    };

    const formatOrderForPrint = (order: Order | DeliveryOrder) => {
        const isDeliveryOrdersTable = 'order_items' in order;
        const isDelivery =
            isDeliveryOrdersTable || ('delivery_info' in order && (order as Order).delivery_info?.isDelivery);

        const orderDate = new Date(
            isDeliveryOrdersTable && 'created_at' in order ? order.created_at : (order as Order).createdAt
        );

        let content = `PEDIDO #${order.id.slice(-6)}
Data: ${orderDate.toLocaleDateString('pt-BR')}
Hora: ${orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
Tipo: ${isDelivery ? 'DELIVERY' : 'BALCÃO'}
Status Pagamento: ${getPaymentStatus(order)}

`;

        if (isDeliveryOrdersTable) {
            const deliveryOrder = order as DeliveryOrder;
            content += `Cliente: ${deliveryOrder.customer_name}
                Telefone: ${deliveryOrder.customer_whatsapp}
                Endereço: ${deliveryOrder.customer_address}
            `;
            if (deliveryOrder.customer_cpf) content += `CPF: ${deliveryOrder.customer_cpf}\n`;
        } else if ('delivery_info' in order && order.delivery_info) {
            const regularOrder = order as Order;
            content += `Cliente: ${regularOrder.delivery_info?.customerName || 'N/A'}
                Telefone: ${regularOrder.delivery_info?.customerWhatsapp || 'N/A'}
                Endereço: ${regularOrder.delivery_info?.customerAddress || 'N/A'}
            `;

        }

        content += '\nItens:\n----------------------------------------\n';
        if (isDeliveryOrdersTable) {
            (order as DeliveryOrder).order_items.forEach((item) => {
                const subtotal = item.price * item.quantity;
                content += `${item.quantity}x ${formatCombinedPizza(item)} - R$ ${item.price.toFixed(2)} cada, Subtotal: R$ ${subtotal.toFixed(2)}\n`;
            });
        } else {
            const regularOrder = order as Order;
            regularOrder.items.forEach((item) => {
                const subtotal = item.menuItem.price * item.quantity;
                content += `${item.quantity}x ${formatCombinedPizza(item)} - R$ ${item.menuItem.price.toFixed(2)} cada, Subtotal: R$ ${subtotal.toFixed(2)}\n`;
            });
        }

        const total = isDeliveryOrdersTable ? (order as DeliveryOrder).total_amount : (order as Order).total;
        content += `----------------------------------------\nTOTAL: R$ ${total.toFixed(2)}\n`;

        return content;
    };

    const getPaymentStatus = (order: Order | DeliveryOrder) => {
        if ('order_items' in order) return (order as DeliveryOrder).payment_status === 'paid' ? 'APROVADO' : 'PENDENTE';
        return (order as Order).payment_status === 'paid' ? 'APROVADO' : 'PENDENTE';
    };

    const handlePrint = () => {
        try {
            const content = formatOrderForPrint(order);
            setPrintContent(content);
            setShowPrintDialog(true);

            toast({
                title: 'Cupom gerado',
                description: `Pedido #${order.id.slice(-6)} pronto para visualização`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Não foi possível gerar o cupom.',
                variant: 'destructive',
            });
        }
    };

    const handlePrintFromDialog = () => {
        Alert.alert('Impressão', 'Enviar para impressão (simulação RN)');
        setShowPrintDialog(false);
    };

    return (
        <View>
            <TouchableOpacity style={styles.button} onPress={handlePrint}>
                <Icon name="printer" size={16} color="#fff" />
                <Text style={styles.buttonText}>Imprimir</Text>
            </TouchableOpacity>

            <Modal visible={showPrintDialog} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView style={styles.scroll}>
                            <Text style={styles.printText}>{printContent}</Text>
                        </ScrollView>
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPrintDialog(false)}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.printButton} onPress={handlePrintFromDialog}>
                                <Icon name="printer" size={16} color="#fff" />
                                <Text style={styles.buttonText}>Imprimir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        backgroundColor: '#2563EB',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginVertical: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        maxHeight: '80%',
        padding: 16,
    },
    scroll: {
        marginBottom: 16,
    },
    printText: {
        fontFamily: 'Courier New',
        fontSize: 12,
        lineHeight: 16,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#9CA3AF',
        padding: 8,
        borderRadius: 6,
    },
    printButton: {
        backgroundColor: '#2563EB',
        padding: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});
