import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigationTypes';
import { useIsFocused } from '@react-navigation/native';
import { orderServices } from '../adminServices/orderHelpers';

type OrderDetailsScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

interface OrderItem {
    id: number;
    itemId: number;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

interface PaymentDetails {
    paymentMethod: string;
    amount: number;
    status: string;
    transactionId?: string;
}

interface OrderDetails {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    orderItems: OrderItem[];
    payment: PaymentDetails;
    qrCode?: string;
    orderUser?: {
        email: string;
        mobile: string;
    };
    orderCanteen?: {
        canteenName: string;
    };
}

const OrderDetails = ({ route }: { route: OrderDetailsScreenRouteProp }) => {
    const navigation = useNavigation();
    const { orderId } = route.params;
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused();

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem('authorization');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await orderServices.getOrders();


            if (!response.ok) {
                throw new Error(`Failed to fetch order: ${response.status}`);
            }

            const data = await response.json();

            if (!data.data) {
                throw new Error('Order data not found');
            }

            setOrderDetails(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            console.error('Order details fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchOrderDetails();
        }
    }, [isFocused, orderId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrderDetails();
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return new Date(dateString).toLocaleString('en-IN', options);
    };

    const handleBackToDashboard = () => {
        navigation.navigate('AdminDashboard', { shouldRefresh: true });
    };

    if (loading && !orderDetails) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1a237e" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchOrderDetails}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackToDashboard}
                >
                    <Text style={styles.backButtonText}>Back to Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!orderDetails) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No order data available</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackToDashboard}
                >
                    <Text style={styles.backButtonText}>Back to Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#1a237e']}
                    tintColor="#1a237e"
                />
            }
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackToDashboard}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Order Details</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{orderDetails.id}</Text>
                    <Text style={[
                        styles.status,
                        orderDetails.status === 'completed' && styles.statusCompleted,
                        orderDetails.status === 'pending' && styles.statusPending,
                        orderDetails.status === 'cancelled' && styles.statusCancelled
                    ]}>
                        {orderDetails.status.toUpperCase()}
                    </Text>
                </View>

                {orderDetails.orderUser && (
                    <View style={styles.customerSection}>
                        <Text style={styles.sectionTitle}>CUSTOMER DETAILS</Text>
                        <Text style={styles.detailText}>{orderDetails.orderUser.email}</Text>
                        <Text style={styles.detailText}>{orderDetails.orderUser.mobile}</Text>
                    </View>
                )}

                {orderDetails.orderCanteen && (
                    <View style={styles.canteenSection}>
                        <Text style={styles.sectionTitle}>CANTEEN</Text>
                        <Text style={styles.detailText}>{orderDetails.orderCanteen.canteenName}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ORDER ITEMS</Text>
                    {orderDetails.orderItems.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                            </View>
                            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                            <Text style={styles.itemTotal}>₹{item.total.toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                        <Text style={styles.totalAmount}>₹{orderDetails.totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Method:</Text>
                        <Text style={styles.detailValue}>{orderDetails.payment.paymentMethod}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status:</Text>
                        <Text style={[
                            styles.detailValue,
                            orderDetails.payment.status === 'success' && styles.paymentSuccess,
                            orderDetails.payment.status === 'pending' && styles.paymentPending,
                            orderDetails.payment.status === 'failed' && styles.paymentFailed
                        ]}>
                            {orderDetails.payment.status.toUpperCase()}
                        </Text>
                    </View>
                    {orderDetails.payment.transactionId && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Transaction ID:</Text>
                            <Text style={styles.detailValue}>{orderDetails.payment.transactionId}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ORDER TIMELINE</Text>
                    <View style={styles.timelineRow}>
                        <Text style={styles.timelineLabel}>Placed:</Text>
                        <Text style={styles.timelineValue}>{formatDate(orderDetails.createdAt)}</Text>
                    </View>
                </View>

                {orderDetails.qrCode && (
                    <View style={styles.qrSection}>
                        <Text style={styles.sectionTitle}>QR CODE</Text>
                        <Text style={styles.qrNote}>Show this code to collect your order</Text>
                        <Image
                            source={{ uri: orderDetails.qrCode }}
                            style={styles.qrImage}
                            resizeMode="contain"
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButtonText: {
        color: '#1a237e',
        fontSize: 16,
        marginRight: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a237e',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    orderId: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    status: {
        fontSize: 14,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusCompleted: {
        backgroundColor: '#e6f7ee',
        color: '#2e8b57',
    },
    statusPending: {
        backgroundColor: '#fff8e6',
        color: '#ffa500',
    },
    statusCancelled: {
        backgroundColor: '#ffebee',
        color: '#f44336',
    },
    section: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    customerSection: {
        marginBottom: 16,
    },
    canteenSection: {
        marginBottom: 16,
    },
    detailText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        color: '#333',
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
    },
    itemQuantity: {
        fontSize: 16,
        color: '#666',
        marginHorizontal: 10,
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a237e',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 15,
        color: '#666',
        width: 120,
    },
    detailValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    paymentSuccess: {
        color: '#2e8b57',
    },
    paymentPending: {
        color: '#ffa500',
    },
    paymentFailed: {
        color: '#f44336',
    },
    timelineRow: {
        flexDirection: 'row',
    },
    timelineLabel: {
        fontSize: 15,
        color: '#666',
        width: 80,
    },
    timelineValue: {
        fontSize: 15,
        color: '#333',
    },
    qrSection: {
        alignItems: 'center',
    },
    qrNote: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    qrImage: {
        width: 180,
        height: 180,
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#f44336',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#1a237e',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 6,
        marginBottom: 12,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        backgroundColor: '#666',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 6,
    },
});

export default OrderDetails;