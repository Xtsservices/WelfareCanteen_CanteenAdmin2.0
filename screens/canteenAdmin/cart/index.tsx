import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    SafeAreaView,
    Alert,
} from 'react-native';
import { CartData, CartItem } from '../menu/types';
import { fetchCartData } from '../menu/cartUtils';
import { updateCartItemQuantity, removeCartItem, clearCart as clearCartHelper } from '../../services/cartHelpers';
import { cartScreenProps } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
type CartScreenNavigationProp = StackNavigationProp<any, any>;

const CartScreen: React.FC<{ navigation: CartScreenNavigationProp }> = ({ navigation }) => {
// const CartScreen: React.FC<cartScreenProps> = ({ navigation }) => {
    const [cartData, setCartData] = useState<CartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingItems, setUpdatingItems] = useState<number[]>([]);

    const loadCartData = async () => {
        try {
            setLoading(true);
            const data = await fetchCartData();
            setCartData(data);
        } catch (err) {
            setError('Failed to fetch cart data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCartData();
    }, []);

    const updateItemQuantity = async (cartItem: CartItem, newQuantity: number) => {
        try {
            setUpdatingItems(prev => [...prev, cartItem.id]);
            const token = await AsyncStorage.getItem('authorization');
            const API_BASE_URL = 'https://server.welfarecanteen.in/api';

            await axios.post(`${API_BASE_URL}/cart/updateCartItem`, {
                cartItemId: cartItem.item?.id,
                quantity: newQuantity,
                cartId: cartData?.id,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                },
            });

            setCartData(prev => {
                if (!prev) return prev;
                const updatedItems = prev.cartItems.map(item =>
                    item.id === cartItem.id
                        ? { ...item, quantity: newQuantity, total: newQuantity * (item.price || 0) }
                        : item
                );
                return { ...prev, cartItems: updatedItems };
            });
        } catch (err) {
            Alert.alert("Error", "Failed to update item quantity.");
        } finally {
            setUpdatingItems(prev => prev.filter(id => id !== cartItem.id));
        }
    };

    const handleRemoveItem = async (item: CartItem) => {
        try {
            if (!cartData) return;
            setUpdatingItems(prev => [...prev, item.id]);
            await removeCartItem(cartData.id, item.id);
            await loadCartData();
        } catch (err) {
            setError('Failed to remove cart item');
        } finally {
            setUpdatingItems(prev => prev.filter(id => id !== item.id));
        }
    };

    const handleClearCart = async () => {
        try {
            setLoading(true);
            await clearCartHelper();
            setCartData(null);
            await loadCartData();
        } catch (err) {
            setError('Failed to clear cart');
        } finally {
            setLoading(false);
        }
    };

    const confirmClearCart = () => {
        Alert.alert('Clear Cart', 'Are you sure you want to clear your cart?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', onPress: handleClearCart, style: 'destructive' },
        ], { cancelable: true });
    };

    const calculateTotal = () => {
        if (!cartData || !cartData.cartItems) return 0;
        return cartData.cartItems.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0014A8" />
                <Text style={styles.loadingText}>Loading cart...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadCartData}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <Image
                    source={{ uri: 'https://img.icons8.com/ios/100/000000/empty-cart.png' }}
                    style={styles.emptyCartIcon}
                />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <TouchableOpacity style={styles.continueShoppingButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const subtotal = calculateTotal();
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cart</Text>
                <TouchableOpacity onPress={confirmClearCart}>
                    <Text style={styles.clearCartText}>Clear Cart</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartItems}>
                {cartData.cartItems.map(item => (
                    <View key={item.id} style={styles.cartItem}>
                        <Image
                            source={{ uri: item.item?.image ? `data:image/png;base64,${item.item.image}` : 'https://via.placeholder.com/80' }}
                            style={styles.itemImage}
                        />
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemName}>{item.item?.name}</Text>
                            <Text style={styles.itemPrice}>Price: ₹{item.price?.toFixed(2)}</Text>
                            <Text style={styles.itemTotal}>Total: ₹{item.total?.toFixed(2)}</Text>
                            <View style={styles.quantityControl}>
                                {updatingItems.includes(item.id) ? (
                                    <ActivityIndicator size="small" color="#0014A8" />
                                ) : (
                                    <>
                                        <TouchableOpacity style={styles.quantityButton} onPress={() => updateItemQuantity(item, Math.max(1, item.quantity - 1))}>
                                            <Text style={styles.quantityText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.quantity}>{item.quantity}</Text>
                                        <TouchableOpacity style={styles.quantityButton} onPress={() => updateItemQuantity(item, item.quantity + 1)}>
                                            <Text style={styles.quantityText}>+</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item)}>
                                            <Text style={styles.removeButtonText}>Remove</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Taxes (18%):</Text>
                    <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => navigation.navigate('Payment', { 
                        cartId: cartData.id.toString(),
                        totalAmount: total,
                        cartItems: cartData.cartItems.map(item => ({
                          id: item.id,
                          name: item.item?.name || 'Unknown Item',
                          quantity: item.quantity,
                          price: item.price || 0,
                          total: (item.price || 0) * item.quantity
                        }))
                      })}
                    disabled={!cartData?.id}
                >
                    <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    cartItems: { flex: 1, padding: 10 },
    cartItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
    itemImage: { width: 80, height: 80, borderRadius: 8 },
    itemDetails: { flex: 1, marginLeft: 16 },
    itemName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    itemPrice: { fontSize: 14, color: '#555' },
    itemTotal: { fontSize: 16, fontWeight: 'bold', color: '#0014A8', marginTop: 4 },
    quantityControl: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    quantityButton: { backgroundColor: '#0014A8', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    quantityText: { color: '#fff', fontSize: 16 },
    quantity: { marginHorizontal: 12, fontSize: 16 },
    removeButton: { backgroundColor: '#ff4d4d', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4, marginLeft: 'auto' },
    removeButtonText: { color: '#fff', fontSize: 12 },
    header: { paddingTop: 60, paddingBottom: 20, backgroundColor: '#0014A8', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    clearCartText: { color: '#fff', marginTop: 10, fontSize: 14 },
    summaryContainer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e5e7eb' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    summaryLabel: { fontSize: 16, color: '#555' },
    summaryValue: { fontSize: 16, fontWeight: 'bold' },
    totalRow: { marginTop: 10 },
    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#0014A8' },
    checkoutButton: { backgroundColor: '#0014A8', paddingVertical: 12, borderRadius: 6, marginTop: 16, alignItems: 'center' },
    checkoutButtonText: { color: '#fff', fontSize: 16 },
    emptyCartIcon: { width: 100, height: 100, marginBottom: 20 },
    emptyCartText: { fontSize: 18, color: '#555', marginBottom: 20 },
    continueShoppingButton: { backgroundColor: '#0014A8', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 6 },
    continueShoppingText: { color: '#fff', fontSize: 16 },
    errorText: { color: 'red', marginBottom: 12 },
    retryButton: { backgroundColor: '#0014A8', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
    retryButtonText: { color: '#fff' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#0014A8' }
});

export default CartScreen;