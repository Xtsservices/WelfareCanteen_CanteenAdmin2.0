import React, {use, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigationTypes';
import RNPrint from 'react-native-print';
import {getDatabase} from '../offline/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PrintNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PrinterConfiguration'
>;

type Props = {
  route: {
    params: {
      token: string;
      canteenName:string;
      ordersWithItems: Array<{[key: string]: any}>;
      orderData: any;
    };
  };
};

const VerifyTokenScreen = ({route}: Props) => {
  const navigation = useNavigation<PrintNavigationProp>();
  const {canteenName,token, ordersWithItems, orderData} = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const totalQuantity = ordersWithItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalAmount = ordersWithItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  
  useEffect(() => {
    handlePrint();
  }, []);

  const handlePrint = async () => {
    // Format current date and time (e.g., "June 22, 2025 12:25 PM")
    const currentDateTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    const printContent = `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 5px;
            font-size: 20px;
          }
          .header {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subheader {
            text-align: center;
            font-size: 20px;
            margin-bottom: 5px;
          }
          .datetime {
            text-align: center;
            font-size: 18px;
            margin-bottom: 5px;
          }
          .separator {
            text-align: center;
            font-size: 18px;
            margin: 5px 0;
          }
          .section {
            margin-bottom: 10px;
          }
          .items-header {
            font-size: 20px;
            font-weight: bold;
            margin: 10px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }
          .label {
            font-weight: bold;
            width: 70%;
          }
          .value {
            text-align: right;
            width: 30%;
          }
          .total-line {
            border-top: 1px solid #000;
            margin: 10px 0;
            padding-top: 5px;
          }
          .total {
            font-weight: bold;
            font-size: 20px;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">Industrial NDY Canteen</div>
        <div class="subheader">CanteenName: ${canteenName}</div>
        <div class="datetime">${currentDateTime}</div>
        <div class="section">
          <div class="items-header">List of Items</div>
          <div class="row">
            <span class="label">Items</span>
            <span class="value">Qty</span>
          </div>
          ${ordersWithItems
            .map(
              item => `
              <div class="row">
                <span class="label">${item.itemName}</span>
                <span class="value">${item.quantity}</span>
              </div>
              `,
            )
            .join('')}
          <div class="total-line"></div>
          <div class="total">
            <span>Total Amount</span>
            <span>₹${totalAmount}</span>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log('Printing order ID:', orderData.orderId);
      const status = await RNPrint.print({
        html: printContent,
      });
      console.log("status",status)
      const db = await getDatabase();
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE orders SET status = 'completed' WHERE orderId = ?`,
          [orderData.orderId],
          () => {
            console.log('Order status updated successfully');
            setIsLoading(false);
            navigation.goBack();
          },
          (error: any) => {
            console.error('Error updating order status:', error);
            setIsLoading(false);
            Alert.alert('Error', 'Failed to update order status.');
          },
        );
      });
    } catch (error) {
      console.error('Printing error:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to print the content.');
    }

  };
console.log("isLoading",isLoading)
  return (
    <View style={styles.container}>
      {!isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Processing Order...</Text>
        </View>
      ) : (
        <ScrollView>
          <View style={styles.section}>
            <Text style={[styles.header, {textAlign: 'center', fontSize: 20}]}>
              Industrial NDY Canteen
            </Text>
            <Text
              style={[styles.label, {textAlign: 'center', marginBottom: 8}]}>
              Navel Dock Yard Canteens
            </Text>
            <Text
              style={[styles.label, {textAlign: 'center', marginBottom: 16}]}>
              Canteen Name: {canteenName}
            </Text>

            <Text style={styles.header}>Order Summary</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Order ID:</Text>
              <Text style={styles.value}>NV{orderData.orderId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{orderData.status}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Items:</Text>
              <Text style={styles.value}>{totalQuantity}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Amount:</Text>
              <Text style={styles.value}>₹{totalAmount}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>Order Items</Text>
            {ordersWithItems.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <View style={styles.row}>
                  <Text style={styles.label}>Item:</Text>
                  <Text style={styles.value}>{item.itemName}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Quantity:</Text>
                  <Text style={styles.value}>{item.quantity}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Price:</Text>
                  <Text style={styles.value}>₹{item.price}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Subtotal:</Text>
                  <Text style={styles.value}>
                    ₹{item.price * item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.header}>QR Code Scanned</Text>
            {ordersWithItems[0] && (
              <Image
                source={{uri: ordersWithItems[0].qrCode}}
                style={{
                  width: 300,
                  height: 300,
                  alignSelf: 'center',
                  marginBottom: 12,
                }}
              />
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 1,
  },
});

export default VerifyTokenScreen;
