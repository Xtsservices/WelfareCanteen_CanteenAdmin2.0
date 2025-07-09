import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/Feather';
import printQR from '../printQR/newQr';


type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

interface PaymentScreenProps {
  route: PaymentScreenRouteProp;
  navigation: PaymentScreenNavigationProp;
}

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderResponse {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  items?: CartItem[];
}

interface PaymentScreenParams {
  cartId: string;
  totalAmount: number;
  cartItems?: CartItem[];
}

const Payment: React.FC<PaymentScreenProps> = ({ route }) => {
  const { cartId, totalAmount } = route.params;
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderResponse | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentInitiated, setIsPaymentInitiated] = useState(false);

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authorization');
        if (!token) {
          throw new Error('No authorization token found');
        }

        const response = await fetch('https://server.welfarecanteen.in/api/cart/getCart', {
          headers: {
            'Content-Type': 'application/json',
            authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Full API Response:', JSON.stringify(data, null, 2));

        // Check different possible response structures
        const items = data.data?.cartItems || data.cartItems || [];

        if (!Array.isArray(items)) {
          throw new Error('Cart items is not an array');
        }

        const mappedItems = items.map((item: any) => {
          // Try different possible name fields
          const itemName = item.item?.name ||
            item.menuItem?.name ||
            item.MenuConfiguration?.name ||
            item.name ||
            'Unknown Item';

          // Calculate price and total
          const itemPrice = item.price || 0;
          const itemQuantity = item.quantity || 1;

          return {
            id: item.id || Math.random(), // fallback ID if not provided
            name: itemName,
            quantity: itemQuantity,
            price: itemPrice,
            total: itemPrice * itemQuantity,
          };
        });

        setCartItems(mappedItems);
      } catch (error) {
        console.error('Error fetching cart:', error);
        Alert.alert('Error', 'Failed to load cart items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handlePayment = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authorization');
      if (!token) {
        Alert.alert('Authentication Error', 'Please login again');
        return;
      }

      const response = await fetch('https://server.welfarecanteen.in/api/order/placeOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: token,
        },
        body: JSON.stringify({
          paymentMethod: "Cash",
          cartId,
          mobileNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
      }

      const data = await response.json();
      console.log('Order Response:', JSON.stringify(data, null, 2));
      setOrderDetails(data.data?.order || data.order);
      setIsPaymentInitiated(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      Alert.alert('Payment Error', errorMessage);
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePrintAndNavigate = () => {
    handlePrint();
    // navigation.navigate('AdminDashboard');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await handlePayment();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePrint = () => {
    // Alert.alert('Print', 'Receipt printed successfully!');
    printQR()

  };

  // Calculate total from items if not provided
  const calculatedTotal = orderDetails?.totalAmount ||
    totalAmount ||
    cartItems.reduce((sum, item) => sum + item.total, 0);

  // Items to display - order items first, then cart items
  const displayItems = orderDetails?.items || cartItems;

  return (
    <ScrollView
    contentContainerStyle={styles.container}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  >
    {isPaymentInitiated && orderDetails ? (
      // ✅ Payment Success Screen
      <View style={styles.successContainer}>
        <Icon name="check-circle" size={60} color="green" style={styles.successIcon} />
        <Text style={styles.successHeader}>Payment successful</Text>
        <Text style={styles.successSubHeader}>Successfully paid ₹{orderDetails.totalAmount.toFixed(2)}</Text>

        <View style={styles.transactionBox}>
          <Text style={styles.transactionLabel}>Transaction Details</Text>
          <Text style={styles.transactionRow}>
            <Text style={styles.transactionKey}>Transaction ID: </Text>{orderDetails.id}
          </Text>
          
          <Text style={styles.transactionRow}>
            <Text style={styles.transactionKey}>Type of Transaction: </Text>Cash
          </Text>
          <Text style={styles.transactionRow}>
            <Text style={styles.transactionKey}>Status: </Text>
            <Text style={{ color: 'green' }}>Success</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.downloadButton} onPress={handlePrintAndNavigate}>
          <Text style={styles.downloadText}>📄 Print Receipt</Text>
        </TouchableOpacity>
      </View>
    ) : (
      // ⏳ Regular payment screen before payment is made
      <>
        <Text style={styles.header}>Order Summary</Text>
        <Text style={styles.dashedLine}>------------------------------------</Text>

        {loading && !displayItems.length ? (
          <ActivityIndicator size="large" color="#000080" />
        ) : displayItems.length > 0 ? (
          <>
            {/* Order info */}
            {orderDetails && (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>Order #{orderDetails.id}</Text>
                  <Text style={styles.label}>Status: {orderDetails.status}</Text>
                  <Text style={styles.label}>
                    Date: {new Date(orderDetails.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.label}>
                    Time: {new Date(orderDetails.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <Text style={styles.dashedLine}>------------------------------------</Text>
              </>
            )}

            {/* Table headers */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, { flex: 2 }]}>ITEM</Text>
              <Text style={styles.tableCol}>QTY</Text>
              <Text style={styles.tableCol}>PRICE</Text>
              <Text style={styles.tableCol}>TOTAL</Text>
            </View>

            {displayItems.map((item) => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={[styles.tableCol, { flex: 2 }]}>{item.name}</Text>
                <Text style={styles.tableCol}>{item.quantity}</Text>
                <Text style={styles.tableCol}>₹{item.price.toFixed(2)}</Text>
                <Text style={styles.tableCol}>₹{item.total.toFixed(2)}</Text>
              </View>
            ))}

            <Text style={styles.dashedLine}>------------------------------------</Text>
            <Text style={styles.billAmount}>TOTAL AMOUNT: ₹{calculatedTotal.toFixed(2)}</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter customer mobile number"
              value={mobileNumber}
              keyboardType="phone-pad"
              onChangeText={(text) => setMobileNumber(text.replace(/[^0-9]/g, ''))}
              maxLength={10}
            />
            <TouchableOpacity
              style={[styles.payButton, (!mobileNumber || mobileNumber.length !== 10) && styles.disabledButton]}
              onPress={handlePayment}
              disabled={!mobileNumber || mobileNumber.length !== 10 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>Click to Pay</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.instructions}>No items in cart</Text>
        )}

        {/* <View style={styles.footer}>
          <Text>Thank you for your order!</Text>
        </View> */}
      </>
    )}
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
  },

  successContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 20,
  },
  successIcon: {
    marginBottom: 10,
  },
  successHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'green',
  },
  successSubHeader: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  transactionBox: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  transactionLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  transactionRow: {
    fontSize: 14,
    marginBottom: 5,
  },
  transactionKey: {
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  header: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  dashedLine: {
    textAlign: 'center',
    letterSpacing: 2,
    color: '#000',
    fontWeight: 'bold',
    marginVertical: 6,
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 5,
    paddingVertical: 5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  tableCol: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  billAmount: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 5,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  printButton: {
    backgroundColor: '#000080',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  printText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  payButton: {
    backgroundColor: '#000080',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default Payment;