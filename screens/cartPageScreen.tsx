import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DownNavbar from './downNavbar';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {uricart1} from './imageUris/uris';
import {CartData, CartItem} from './types/cartTypes';
import {
  fetchCartData,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as clearCartHelper,
} from './services/cartHelpers';
import {StackNavigationProp} from '@react-navigation/stack';
import axios from 'axios';

const CartPage = () => {
  const navigation = useNavigation();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItems, setUpdatingItems] = useState<number[]>([]);
  console.log(cartData, 'cartData---------');
  console.log(updatingItems, 'updatingItems---------');
  console.log(AsyncStorage.getItem('authorization'), 'authorization---------');

  const loadCartData = async () => {
    try {
      setLoading(true);
      const data = await fetchCartData();
      console.log('Fetched cart data:', data);
      setCartData(data);
    } catch (err) {
      setError('Failed to fetch cart data');
      console.error('Error fetching cart data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartData();
  }, [updatingItems]);

  const updateItemQuantity = async (
    cartItem: CartItem,
    newQuantity: number,
  ) => {
    console.log('Updating item quantity:', cartItem, newQuantity);

    try {
      // Add item ID to updating state
      setUpdatingItems(prev => [...prev, cartItem.id]);
      const body = {
        cartItemId: cartItem.item?.id,
        quantity: newQuantity,
        cartId: cartData?.id,
      };

      console.log('Request body:', body);
      const token = await AsyncStorage.getItem('authorization');
      const API_BASE_URL = 'https://server.welfarecanteen.in/api';
      await axios.post(`${API_BASE_URL}/cart/updateCartItem`, body, {
        headers: {
          'Content-Type': 'application/json',
          authorization: token,
        },
      });

      // await updateCartItemQuantity(
      //   cartData?.id as number,
      //   cartItem.id,
      //   newQuantity
      // );

      // Refresh cart data
      await loadCartData();
    } catch (err) {
      setError('Failed to update cart item');
      console.error('Error updating cart item:', err);
    } finally {
      // Remove item ID from updating state
      setUpdatingItems(prev => prev.filter(id => id !== cartItem.id));
    }
  };

  const handleRemoveItem = async (item: any) => {
    console.log(item, 'itemmm');

    try {
      if (!cartData) return;

      setUpdatingItems(prev => [...prev, item?.item?.id]);
      // {
      //     "cartId":3,"cartItemId":1
      // }
      const body = {
        cartId: cartData?.id,
        cartItemId: item?.item?.id,
      };
      console.log('Request body:', body);

      await removeCartItem(item?.cartId, item?.item?.id);

      // Refresh cart data
      await loadCartData();
    } catch (err) {
      setError('Failed to remove cart item');
      console.error('Error removing cart item:', err);
    } finally {
      setUpdatingItems(prev => prev.filter(id => id !== item?.item?.id));
    }
  };

  const handleClearCart = async () => {
    try {
      setLoading(true);
      await clearCartHelper();
      setCartData({} as CartData);

    } catch (err) {
      setError('Failed to clear cart');
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: handleClearCart,
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const handlePayment = () => {
    navigation.navigate('PaymentMethod' as never);
  };

  const calculateGSTAndCharges = (subtotal: number) => {
    return subtotal * 0.07; // 7% GST
  };

  const calculatePlatformFee = () => {
    return 10; // Fixed platform fee
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0014A8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadCartData}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
    return (
      <View style={[styles.container, styles.emptyCartContainer]}>
        <Image
          source={{
            uri: 'https://img.icons8.com/ios/100/000000/empty-cart.png',
          }}
          style={styles.emptyCartIcon}
        />
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
        </TouchableOpacity>

        <DownNavbar />
      </View>
    );
  }

  const subtotal = cartData.cartItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const gstAndCharges = calculateGSTAndCharges(subtotal);
  const platformFee = calculatePlatformFee();
  const totalAmount = subtotal + gstAndCharges + platformFee;

  return (
    <View style={styles.container}>
      {/* Cart Header */}
      <View style={styles.header1}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/93/93634.png',
            }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle1}>
          <Image
            source={{
              uri: 'https://www.joinindiannavy.gov.in/images/octaginal-crest.png',
            }}
            style={styles.logo}
          />
        </Text>
        <View style={styles.headerIcons1}>
          <TouchableOpacity style={styles.iconborder1}>
            <Image
              source={{
                uri: 'https://creazilla-store.fra1.digitaloceanspaces.com/icons/3235242/wallet-icon-sm.png',
              }}
              style={styles.icon1}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconborder1}>
            <Image
              source={{
                uri: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png',
              }}
              style={styles.icon1}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={{
              uri: uricart1,
            }}
            style={styles.backIcon}
          />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity onPress={confirmClearCart}>
          <Text style={styles.clearCartText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <ScrollView style={styles.cartItems}>
        {cartData?.cartItems?.map(item => {
          console.log('Cart item:-------', item);

          return (
            <View key={item.id} style={styles.cartItem}>
              <Image
                source={{
                  uri: item.item.image
                    ? `data:image/png;base64,${item.item.image}`
                    : 'https://via.placeholder.com/80',
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.item.name}</Text>
                <View style={styles.typeContainer}>
                  <Image
                    source={{
                      uri:
                        item.item.type && item.item.type.toLowerCase() === 'veg'
                          ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Veg_symbol.svg/1200px-Veg_symbol.svg.png'
                          : 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Non_veg_symbol.svg/1200px-Non_veg_symbol.svg.png',
                    }}
                    style={styles.typeIcon}
                  />
                  <Text style={styles.typeText}>
                    {item.item.type ? item.item.type.toUpperCase() : 'N/A'}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  Price: ₹{item.price.toFixed(2)}
                </Text>
                <Text style={styles.itemTotal}>
                  Total: ₹{item.total.toFixed(2)}
                </Text>
                <View style={styles.quantityControl}>
                  {updatingItems.includes(item.id) ? (
                    <ActivityIndicator size="small" color="#0014A8" />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          updateItemQuantity(
                            item,
                            Math.max(1, item.quantity - 1),
                          )
                        }>
                        <Text style={styles.quantityText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          updateItemQuantity(item, item.quantity + 1)
                        }>
                        <Text style={styles.quantityText}>+</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveItem(item)}
                        style={styles.removeButton}>
                        <Text style={styles.removeButtonText}>Remove333</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bill Summary */}
      <View style={styles.billSummary}>
        <Text style={styles.billTitle}>Bill Summary</Text>
        <View style={styles.billRow}>
          <Text>Subtotal:</Text>
          <Text>₹{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text>GST & Charges:</Text>
          <Text>₹{gstAndCharges.toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text>Platform Fee:</Text>
          <Text>₹{platformFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.billRow, styles.totalRow]}>
          <Text style={styles.totalAmount}>Total:</Text>
          <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Button */}
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Proceed to Payment</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <DownNavbar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#0014A8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0014A8',
    paddingVertical: 20,
    padding: 30,
  },
  headerTitle1: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons1: {
    flexDirection: 'row',
  },
  icon1: {
    width: 30,
    height: 30,
  },
  iconborder1: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 7,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyCartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  continueShoppingButton: {
    backgroundColor: '#0014A8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  clearCartText: {
    color: '#0014A8',
    fontSize: 14,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#0014A8',
  },
  headerTitle: {
    color: '#0014A8',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cartItems: {
    flex: 1,
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  typeText: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0014A8',
    marginBottom: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#0014A8',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  billSummary: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    margin: 10,
    marginBottom: 5,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0014A8',
  },
  payButton: {
    backgroundColor: '#0014A8',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    height: 60,
  },
});

export default CartPage;
