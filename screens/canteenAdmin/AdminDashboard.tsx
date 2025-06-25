import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDatabase} from '../offline/database';
import {SQLError} from 'react-native-sqlite-storage';
import MenuScreenNew from './menu/MenuScreenNew';
import {compatibilityFlags} from 'react-native-screens';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import RNPrint from 'react-native-print';

type RootStackParamList = {
  VerifyToken: {
    token: string;
    ordersWithItems: Array<{[key: string]: any}>;
    orderData: any; // Add this
  };
  AdminDashboard: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'VerifyToken'>;

interface DashboardData {
  totalOrders: number;
  totalAmount: number;
  completedOrders: number;
  cancelledOrders: number;
  totalItems: number;
  totalCanteens: number;
  totalMenus: number;
}

// Define interfaces for data structures
interface Walkin {
  id: number;
  isSynced: number;
  updatedAt: number;
  createdAt: number;
  createdById: number;
  paymentMethod: string;
  contactNumber: string;
  tableNumber: string;
  discountAmount: number;
  numberOfPeople: number;
  menuId: number;
  orderStatus: string;
  taxAmount: number;
  finalAmount: number;
  notes: string;
  paymentStatus: string;
  totalAmount: number;
  updatedById: number | null;
  customerName: string;
  orderItems: WalkinItem[]; // Remove optional type, always an array
}

interface WalkinItem {
  id: number;
  phoneNumber: string;
  createdAt: number;
  specialInstructions: string;
  totalPrice: number;
  unitPrice: number;
  menuItemId: number;
  itemName: string;
  walkinId: number;
  quantity: number;
  status: string;
}

const AdminDashboard = () => {
  type AdminDashboardNavigationProp = StackNavigationProp<
    RootStackParamList,
    'AdminDashboard'
  >;
  const navigation = useNavigation();
  const route = useRoute();
  const {width, height} = useWindowDimensions();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [text, setText] = useState('');

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('authorization');
      const response = await fetch(
        'https://server.welfarecanteen.in/api/adminDasboard/dashboard',
        {
          headers: {
            Authorization: token || '',
          },
        },
      );
      const data = await response.json();
      console.log('first dashboard response', data);
      if (data.message === 'Invalid or expired token') {
        Alert.alert('Error', data.message);
        await AsyncStorage.removeItem('authorization');
        navigation.navigate('Login' as never);
        return null;
      }

      return data.data;
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (error) {
      // console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  async function checkConnectivity() {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      console.log('Network is connected');
      loadData();
      handleGetAllOrders();
    } else {
      console.log('Network is not connected');
    }
  }

  useEffect(() => {
    // const unsubscribe = navigation.addListener('focus', () => {
    //   // function to handle network connectivity
    // });
    checkConnectivity();

    // return unsubscribe;
  }, [navigation]);

  const handleGetAllOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('authorization');
      const response = await fetch(
        'https://server.welfarecanteen.in/api/order/getTodaysOrdersByCateen',
        {
          method: 'GET',
          headers: {
            Authorization: token || '',
          },
        },
      );
      const data = await response.json();
      console.log('response data from sync', data);

      // Open SQLite database
      const db = await getDatabase();
      // Create tables if not exist
      (await db).transaction(tx => {
        tx.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
          [],
          (
            txObj: any,
            resultSet: {
              rows: {length: number; item: (index: number) => {name: string}};
            },
          ) => {
            const tables: string[] = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              tables.push(resultSet.rows.item(i).name);
            }
            // console.log('Tables:', tables);
          },
          (error: SQLError) => {
            console.log('Error fetching tables', error);
          },
        );
      });

      // fetch orders and order items
      db.transaction(tx => {
        // Get all rows
        tx.executeSql(
          'SELECT * FROM orders', // Replace 'users' with your table name
          [],
          (txObj, resultSet) => {
            const data: Array<{[key: string]: any}> = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              data.push(resultSet.rows.item(i));
            }
            // Filter orders where status === 'completed'
            const completedOrderIds = data
              .filter(order => order.status === 'completed')
              .map(order => order.orderId);

            console.log('Completed Order IDs:', completedOrderIds);

            // Make POST API call with completedOrderIds
            if (completedOrderIds.length > 0) {
              AsyncStorage.getItem('authorization').then(async token => {
                try {
                  const response = await axios.post(
                    'https://server.welfarecanteen.in/api/order/updateOrderStatus',
                    {orderIds: [completedOrderIds]},
                    {
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: token || '',
                      },
                    },
                  );
                  console.log('Completed orders POST response:', response.data);
                  // If updatedCount is available, clear the local database
                  if (
                    response.data &&
                    response.data.data &&
                    response.data.data.updatedCount
                  ) {
                    db.transaction(tx => {
                      completedOrderIds.forEach(orderId => {
                        tx.executeSql(
                          `DELETE FROM orders WHERE orderId = ?`,
                          [orderId],
                          () => {
                            console.log(
                              `Order with ID ${orderId} deleted successfully.`,
                            );
                          },
                          (error: SQLError) => {
                            console.error(
                              `Failed to delete order with ID ${orderId}:`,
                              error,
                            );
                          },
                        );
                      });
                    });
                  }
                } catch (err) {
                  console.error('Error posting completed orders:', err);
                }
              });
            }

            // Now get the count
            tx.executeSql(
              'SELECT COUNT(*) AS count FROM orders', // Replace 'orders' with your table name
              [],
              (txObj2, countResult) => {
                const count = countResult.rows.item(0).count;
                // console.log('Total count:', count);

                // Optional: combine data + count into one object
                const result = {data, count};
                // console.log('Combined Result:');
              },
              (error: SQLError) => {
                console.log('Error fetching tables', error);
              },
            );
          },
          (error: SQLError) => {
            console.log('Error fetching tables', error);
          },
        );
      });

      //walkin items
      db.transaction((tx: any) => {
        // Fetch first 10 completed walkins ordered by id ASC
        tx.executeSql(
          'SELECT * FROM walkins WHERE orderStatus = ? ORDER BY id ASC LIMIT 10',
          ['completed'],
          (
            txObj: any,
            walkinResultSet: {
              rows: {length: number; item: (index: number) => Walkin};
            },
          ) => {
            const walkinData: Walkin[] = [];
            for (let i = 0; i < walkinResultSet.rows.length; i++) {
              walkinData.push({
                ...walkinResultSet.rows.item(i),
                orderItems: [],
              }); // Initialize orderItems
            }
            console.log('Fetched walkins:', walkinData);

            // Fetch walkin_items
            tx.executeSql(
              'SELECT * FROM walkin_items',
              [],
              async (
                txObj: any,
                itemsResultSet: {
                  rows: {length: number; item: (index: number) => WalkinItem};
                },
              ) => {
                const orderItemsData: WalkinItem[] = [];
                for (let i = 0; i < itemsResultSet.rows.length; i++) {
                  orderItemsData.push(itemsResultSet.rows.item(i));
                }
                console.log('Fetched walkin items:', orderItemsData);

                // Combine data
                const mainObj: Walkin[] = walkinData
                  .map((walkin: Walkin) => ({
                    ...walkin,
                    orderItems: orderItemsData.filter(
                      (item: WalkinItem) =>
                        item.phoneNumber === walkin.contactNumber &&
                        item.phoneNumber !== '',
                    ),
                  }))
                  .filter((walkin: Walkin) => walkin.orderItems.length > 0);

                console.log('Combined data:', JSON.stringify(mainObj, null, 2));

                // Make POST API call if there is data
                if (mainObj.length > 0) {
                  try {
                    const token: string | null = await AsyncStorage.getItem(
                      'authorization',
                    );
                    const response = await axios.post(
                      'https://server.welfarecanteen.in/api/walkin/updateOrderStatus',
                      {orders: mainObj},
                      {
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: token || '',
                        },
                      },
                    );
                    console.log('walkin POST response:', response.data);

                    // Delete records if API call is successful
                    if (
                      response.data &&
                      response.data.data &&
                      response.data.data.updatedCount
                    ) {
                      db.transaction((tx: any) => {
                        mainObj.forEach((walkin: Walkin) => {
                          // Delete walkin
                          tx.executeSql(
                            `DELETE FROM walkins WHERE id = ?`,
                            [walkin.id],
                            () => console.log(`Walkin ID ${walkin.id} deleted`),
                            (error: SQLError) =>
                              console.error(
                                `Failed to delete walkin ID ${walkin.id}:`,
                                error,
                              ),
                          );

                          // Delete associated walkin_items
                          walkin.orderItems.forEach((item: WalkinItem) => {
                            tx.executeSql(
                              `DELETE FROM walkin_items WHERE id = ?`,
                              [item.id],
                              () =>
                                console.log(
                                  `Walkin item ID ${item.id} deleted`,
                                ),
                              (error: SQLError) =>
                                console.error(
                                  `Failed to delete walkin item ID ${item.id}:`,
                                  error,
                                ),
                            );
                          });
                        });
                      });
                    }
                  } catch (err: unknown) {
                    console.error('Error posting data:', err);
                  }
                }
              },
              (error: SQLError) => {
                console.log('Error fetching walkin_items', error);
              },
            );
          },
          (error: SQLError) => {
            console.log('Error fetching walkins', error);
          },
        );
      });

      // Insert data into tables
      if (!data || typeof data !== 'object' || !Array.isArray(data.data)) {
        // console.error('Invalid data format:', data);
        throw new Error(
          'Invalid data format: Expected an object with a "data" array containing orders',
        );
      }

      const orders = data.data; // Assuming the orders are inside the "data" array
      // console.log('Orders123456789:', orders); // Log the orders to check their structure
      if (!Array.isArray(orders)) {
        // console.error('Invalid orders format:', orders);
        throw new Error('Invalid orders format: Expected an array of orders');
      }

      db.transaction(tx => {
        // Get all rows
        tx.executeSql(
          'SELECT * FROM order_items', // Replace 'users' with your table name
          [],
          (txObj, resultSet) => {
            const data: Array<{[key: string]: any}> = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              data.push(resultSet.rows.item(i));
            }
            // console.log('Data:', data);

            // Now get the count
            tx.executeSql(
              'SELECT COUNT(*) AS count FROM order_items', // Replace 'orders' with your table name
              [],
              (txObj2, countResult) => {
                const count = countResult.rows.item(0).count;
                // console.log('Total count:', count);

                // Optional: combine data + count into one object
                const result = {data, count};
                // console.log('Order Item Result:', result);
              },
              (error: SQLError) => {
                console.log('Error fetching tables', error);
              },
            );
          },
          (error: SQLError) => {
            console.log('Error fetching tables', error);
          },
        );
      });

      db.transaction(tx => {
        // console.log('Transaction started...', data);
        // console.log('Inserting orders and order items...');
        // console.log('Orders:', data.data); // Log the orders to check their structure
        orders.map(myorder => {
          // console.log('Inserting order:', myorder); // Log each order before inserting
          // console.log('Inserting order:2', myorder.id); // Log each order before inserting
          if (myorder.orderItems && myorder.orderItems.length > 0) {
            tx.executeSql(
              `INSERT OR REPLACE INTO orders (
              id,orderId, userId, totalAmount, status, canteenId, menuConfigurationId, createdById, updatedById, qrCode, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                myorder.id,
                myorder.orderItems[0].orderId,
                myorder.userId,
                myorder.totalAmount,
                myorder.status,
                myorder.canteenId,
                myorder.menuConfigurationId,
                myorder.createdById,
                myorder.updatedById,
                myorder.qrCode,
                myorder.createdAt,
                myorder.updatedAt,
              ],
              () => {
                // console.log(`Order with ID ${myorder.id} inserted successfully.`, myorder);
              },
              (error: SQLError) => {
                console.error(
                  `Failed to insert order with ID ${myorder.id}:`,
                  error,
                );
              },
            );
          }

          if (Array.isArray(myorder.orderItems)) {
            // console.log('Inserting order items:'); // Log each order item before inserting
            myorder.orderItems.map((item: any) => {
              // console.log('@@@@@@@@@@@ :',); // Log each order item before inserting
              tx.executeSql(
                `INSERT OR REPLACE INTO order_items (
                  id, orderId, itemId, quantity, price, total, createdById, updatedById, itemName, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  item.id,
                  item.orderId,
                  item.itemId,
                  item.quantity,
                  item.price,
                  item.total,
                  item.createdById,
                  item.updatedById,
                  item.menuItemItem?.name || '', // Safely access name
                  item.createdAt,
                  item.updatedAt,
                ],
                () => {
                  // console.log(`Order with ID inserted successfully.`, item);
                },
                (error: SQLError) => {
                  console.error(
                    `Failed to insert order with ID ${myorder.id}:`,
                    error,
                  );
                },
              );
            });
          }
        });
      });

      db.transaction(tx => {
        // Get all rows
        tx.executeSql(
          'SELECT * FROM orders', // Replace 'users' with your table name
          [],
          (txObj, resultSet) => {
            const data: Array<{[key: string]: any}> = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              data.push(resultSet.rows.item(i));
            }
            // console.log('Data:', data);

            // Now get the count
            tx.executeSql(
              'SELECT COUNT(*) AS count FROM orders', // Replace 'orders' with your table name
              [],
              (txObj2, countResult) => {
                const count = countResult.rows.item(0).count;
                // console.log('Total count:', count);

                // Optional: combine data + count into one object
                const result = {data, count};
                // console.log('Order Item Result:', result);
              },
              (error: SQLError) => {
                console.log('Error fetching tables', error);
              },
            );
          },
          (error: SQLError) => {
            console.log('Error fetching tables', error);
          },
        );
      });

      // console.log('Tables created successfully!');

      const orderCount = 'SELECT COUNT(*) AS count FROM orders';

      const getOrderCount = () =>
        new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              orderCount,
              [],
              (_, result) => resolve(result),
              (error: SQLError) => {
                console.error(`Failed to insert order with ID`, error);
              },
            );
          });
        });
      try {
        const result: any = await getOrderCount();
        const count = result.rows.item(0).count;
        // console.log('Orders count:', count);
      } catch (error) {
        console.error('Error fetching order count:', error);
      }

      Alert.alert('Orders fetched and stored successfully!');
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Alert.alert(
      //   'Error fetching orders:',
      //   error instanceof Error ? error.message : 'An unknown error occurred.',
      // );
    }
  };

  const cardSize = Math.min(width * 0.5, height * 0.5);
  const isPortrait = height >= width;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  const renderWalkIn = () => {
    navigation.navigate('MenuScreenNew' as never);
  };

  const handleOnPress = (
    ordersWithItems: Array<{[key: string]: any}>,
    orderData: any,
  ) => {
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
          item => `
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
        `,
        )
        .join('')}
    </body>
    </html>
  `;

    const handlePrint = async () => {
      console.log('asdfghj', orderData.orderId);
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
            },
          );
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to print the content.');
      }
    };

    handlePrint();
  };

  const handleVerifyOrderId = async () => {
    const db = await getDatabase();
    db.transaction(tx => {
      // Get all rows
      tx.executeSql(
        `SELECT o.*, oi.* 
               FROM orders o
               INNER JOIN order_items oi ON o.id = oi.orderId
               WHERE o.id = ?`, // Fetch order and order items by Order ID
        [text],
        (txObj, resultSet) => {
          const ordersWithItems: Array<{[key: string]: any}> = [];
          for (let i = 0; i < resultSet.rows.length; i++) {
            ordersWithItems.push(resultSet.rows.item(i));
          }
          // console.log('Orders with Items:', ordersWithItems);
          const orderData = resultSet.rows.item(0);
          // console.log('Order Data===:', orderData);
          if (orderData.status === 'completed') {
            Alert.alert('Error', 'This order has already been completed.');
            return;
          }
          if (orderData.status === 'cancelled') {
            Alert.alert('Error', 'This order has been cancelled.');
            return;
          }
          handleOnPress(ordersWithItems, orderData);
          // navigation.navigate('VerifyToken', {
          //   token: text, // Assuming 'qrCode' is the token you want to pass
          //   ordersWithItems,
          //   orderData,
          // });
        },
        (error: SQLError) => {
          console.log('Error fetching orders with items', error);
        },
      );
    });
  };

  const handleLogout = async () => {
    // Example logout logic
    await AsyncStorage.removeItem('authorization');
    await AsyncStorage.removeItem('canteenName');

    navigation.navigate('Login' as never);
  };


  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurant Dashboard</Text>
        <View style={styles.logoutcontainer}>
          <TouchableOpacity
            onPress={handleGetAllOrders}
            style={styles.syncButton}>
            <Text style={styles.syncButtonText}>Sync Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }>
        {/* Stats Overview */}
        {dashboardData && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dashboardData.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹{dashboardData.totalAmount}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {dashboardData.completedOrders}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.centerContainer}>
          <View style={[styles.middleRow, isPortrait && styles.middleColumn]}>
            {/* QR Scan Card */}
            {/* Verify Token Card */}
            <View
              style={[
                styles.squareCard,
                {
                  width: cardSize,
                  height: cardSize,
                  marginRight: isPortrait ? 0 : 20,
                  marginBottom: isPortrait ? 20 : 0,
                },
              ]}>
              <Text style={styles.cardTitle}>Verify Order Id</Text>
              <Text>NV</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  padding: 8,
                  width: '80%',
                  marginVertical: 10,
                }}
                placeholder="Enter Order ID"
                placeholderTextColor={'#999'}
                keyboardType="numeric"
                onChangeText={setText}
                value={text}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#4caf50',
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  borderRadius: 8,
                }}
                onPress={() => {
                  handleVerifyOrderId();
                  setText(''); // Clear the text field after pressing the button
                }}>
                <Text style={{color: '#fff', fontWeight: '600'}}>
                  Search Order
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.squareCard,
                {
                  width: cardSize,
                  height: cardSize,
                  marginRight: isPortrait ? 0 : 20,
                  marginBottom: isPortrait ? 20 : 0,
                },
              ]}
              onPress={() => navigation.navigate('BluetoothControl' as never)}>
              <Image
                source={require('../images/qrcode.jpeg')}
                style={styles.cardqrImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Quick Scan</Text>
                <Text style={styles.cardDescription}>Scan QR Code</Text>
              </View>
            </TouchableOpacity>

            {/* Walk-ins Card */}
            <TouchableOpacity
              style={[
                styles.squareCard,
                {
                  width: cardSize,
                  height: cardSize,
                },
              ]}
              onPress={renderWalkIn}>
              <Image
                source={require('../images/walkin.webp')}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Walk-ins</Text>
                <Text style={styles.cardDescription}>Manage customers</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  logoutcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  syncButton: {
    backgroundColor: '#100090',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#100080',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  usersButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  usersButtonText: {
    color: '#4caf50',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#f1f8e9',
    borderRadius: 10,
    padding: 10,
    width: '30%',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#388e3c',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 15,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  squareCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    elevation: 3,
  },
  cardqrImage: {
    width: '70%',
    height: '65%',
    resizeMode: 'cover',
  },
  cardImage: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: '35%',
    width: '100%',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  ordersCounter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
  },
  ordersCounterText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersCounterSubtext: {
    color: '#c8e6c9',
    fontSize: 12,
    marginTop: 4,
  },
});

export default AdminDashboard;
