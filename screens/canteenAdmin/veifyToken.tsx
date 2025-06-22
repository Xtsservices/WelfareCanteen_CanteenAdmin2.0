import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Touchable, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigationTypes';
import RNPrint from 'react-native-print';
import { getDatabase } from '../offline/database';

type PrintNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PrinterConfiguration'
>;

type Props = {
  route: {
    params: {
      token: string;
      ordersWithItems: Array<{ [key: string]: any }>;
      orderData: any;
    };
  };
};

const VerifyTokenScreen = ({ route }: Props) => {
  const navigation = useNavigation<PrintNavigationProp>();
  const { token, ordersWithItems, orderData } = route.params;

  // Calculate total quantity and amount
  const totalQuantity = ordersWithItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = ordersWithItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleOnPress = () => {
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
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .section {
      margin-bottom: 2px;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .label {
      font-weight: bold;
    }
    .value {
      text-align: right;
    }
    </style>
  </head>
  <body>

    <div class="section">
      <div class="row">
        <span class="label">Order ID:</span>
        <span class="value">NV${orderData.orderId}</span>
      </div>
    </div>

    <h3 style="margin: 5px 0;">Order Items</h3>
    ${ordersWithItems
      .map(
        (item) => `
        <div class="row">
          <span class="label">Item:</span>
          <span class="value">${item.itemName}</span>
        </div>
        <div class="row">
          <span class="label">Quantity:</span>
          <span class="value">${item.quantity}</span>
        </div>
        <div class="row">
          <span class="label">Price:</span>
          <span class="value">₹${item.price}</span>
        </div>
        <div class="row">
          <span class="label">Total Price:</span>
          <span class="value">₹${item.price * item.quantity}</span>
        </div>
      `
      ).join("")}
  </body>
  </html>
`;

    const handlePrint = async () => {
      console.log("asdfghj", orderData.orderId);
      try {
        await RNPrint.print({
          html: printContent,
        });
        const db = await getDatabase();
         db.transaction(tx => {
          tx.executeSql(
            `UPDATE orders SET status = 'completed' WHERE orderId = ?`,
            [orderData.orderId],
            () => {
              console.log('Order status updated successfully');
            },
(error: any) => {
            console.log('Error fetching orders with items', error);
          }
          );
         } );
      } catch (error) {
        Alert.alert('Error', 'Failed to print the content.');
      }
    };

    handlePrint();
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={[styles.header, { textAlign: 'center', fontSize: 20 }]}>Industrial NDY Canteen</Text>
          <Text style={[styles.label, { textAlign: 'center', marginBottom: 8 }]}>Navel Dock Yard Canteens</Text>
          <Text style={[styles.label, { textAlign: 'center', marginBottom: 16 }]}>Canteen Name: Annapurna Canteen</Text>

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
                <Text style={styles.value}>₹{item.price * item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>QR Code Scanned</Text>
          {ordersWithItems[0] && (
            <Image
              source={{ uri: ordersWithItems[0].qrCode }}
              style={{ width: 300, height: 300, alignSelf: 'center', marginBottom: 12 }}
            />
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#007BFF',
          padding: 10,
          borderRadius: 50,
        }}
        onPress={handleOnPress}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Confirm & Print</Text>
      </TouchableOpacity>

    </>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  token: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default VerifyTokenScreen;