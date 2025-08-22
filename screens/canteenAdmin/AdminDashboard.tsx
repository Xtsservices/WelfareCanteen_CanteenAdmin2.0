import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDatabase} from '../offline/database';
import {SQLError} from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import RNPrint from 'react-native-print';
import {Dimensions} from 'react-native';
import{
View,
Text,
StyleSheet,
TouchableOpacity,
ActivityIndicator,
ScrollView,
RefreshControl,
Alert,
TextInput,
Image,
FlatList,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const getDeviceType = () => {
if (width < 600) return 'mobile';
if (width >= 600 && width < 1024) return 'tablet';
return 'desktop';
};

const deviceType = getDeviceType();
const isMobile = deviceType === 'mobile';
const isTablet = deviceType === 'tablet';
const isLandscape = width > height;

const getResponsiveDimensions = () => {
const padding = isMobile ? 12 : isTablet ? 20 : 24;
const cardMargin = isMobile ? 6 : isTablet ? 10 : 12;
const fontSize = {
  small: isMobile ? 12 : isTablet ? 14 : 16,
  medium: isMobile ? 14 : isTablet ? 16 : 18,
  large: isMobile ? 18 : isTablet ? 22 : 26,
  xlarge: isMobile ? 20 : isTablet ? 24 : 28,
};
let cardsPerRow = isMobile
  ? isLandscape
    ? 3
    : 2
  : isTablet
  ? isLandscape
    ? 4
    : 3
  : 4;
const availableWidth = width - padding * 2 - cardMargin * 2 * cardsPerRow;
const cardSize = Math.min(
  availableWidth / cardsPerRow,
  isMobile ? 160 : isTablet ? 200 : 240,
);
return {padding, cardMargin, fontSize, cardSize, cardsPerRow};
};

type RootStackParamList = {
Login: undefined;
VerifyToken: {
  token: string;
  ordersWithItems: Array<{[key: string]: any}>;
  orderData: any;
};
AdminDashboard: undefined;
MenuScreenNew: undefined;
BluetoothControl: undefined;
walkins: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'AdminDashboard'>;

interface LocalItemSummary {
menuConfigurationName: string;
itemId: number;
itemName: string;
menuConfigurationId: number;
canteenId: number;
totalQty: number;
completedQty: number;
}

const Header: React.FC<{
canteenName: string;
onSync: () => void;
onLogout: () => void;
handleupdateCompletedOrders: () => void;
}> = ({canteenName, onSync, onLogout, handleupdateCompletedOrders}) => {
const {fontSize} = getResponsiveDimensions();
return (
  <View style={[styles.header, isLandscape && styles.headerLandscape]}>
    <View style={[styles.headerContent, isMobile && styles.headerContentMobile]}>
      <Text style={[styles.headerTitle, {fontSize: fontSize.xlarge}]}>
        {canteenName}
      </Text>
      <View
        style={[
          styles.buttonContainer,
          isMobile && styles.buttonContainerMobile,
        ]}>
        <TouchableOpacity
          onPress={onSync}
          style={[styles.syncButton, {minWidth: isMobile ? 80 : 100}]}>
          <Text style={[styles.syncButtonText, {fontSize: fontSize.small}]}>
            Sync Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleupdateCompletedOrders}
          style={[styles.completedButton, {minWidth: isMobile ? 80 : 100}]}>
          <Text style={[styles.syncButtonText, {fontSize: fontSize.small}]}>
            Completed Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onLogout}
          style={[styles.logoutButton, {minWidth: isMobile ? 60 : 80}]}>
          <Text style={[styles.logoutButtonText, {fontSize: fontSize.small}]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);
};

const StatCard: React.FC<{value: number | string; label: string}> = ({
value,
label,
}) => {
const {fontSize} = getResponsiveDimensions();
return (
  <View style={[styles.statCard, isTablet && styles.statCardTablet]}>
    <Text style={[styles.statValue, {fontSize: fontSize.large}]}>{value}</Text>
    <Text style={[styles.statLabel, {fontSize: fontSize.small}]}>{label}</Text>
  </View>
);
};

const ActionCard: React.FC<{
title: string;
description: string;
imageSource?: any;
onPress: () => void;
cardSize: number;
isQr?: boolean;
}> = ({title, description, imageSource, onPress, cardSize, isQr = false}) => {
const {fontSize} = getResponsiveDimensions();
return (
  <TouchableOpacity
    style={[
      styles.squareCard,
      {
        width: cardSize,
        height: cardSize,
        minHeight: isMobile ? 140 : 180,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.8}>
    {imageSource && (
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={[
            isQr ? styles.cardQrImage : styles.cardImage,
            {
              width: cardSize * (isQr ? 0.6 : 0.8),
              height: cardSize * 0.5,
            },
          ]}
        />
      </View>
    )}
    <View style={[styles.cardContent, {minHeight: cardSize * 0.3}]}>
      <Text style={[styles.cardTitle, {fontSize: fontSize.medium}]}>{title}</Text>
      <Text style={[styles.cardDescription, {fontSize: fontSize.small}]}>
        {description}
      </Text>
    </View>
  </TouchableOpacity>
);
};

const VerifyOrderCard: React.FC<{
text: string;
setText: (text: string) => void;
onVerify: () => void;
cardSize: number;
}> = ({text, setText, onVerify, cardSize}) => {
const {fontSize} = getResponsiveDimensions();
return (
  <View
    style={[
      styles.squareCard,
      {
        width: cardSize,
        height: cardSize,
        minHeight: isMobile ? 140 : 180,
      },
    ]}>
    <View style={styles.verifyCardContent}>
      <Text
        style={[
          styles.cardTitle,
          {fontSize: fontSize.medium, marginBottom: 10},
        ]}>
        Verify Order ID
      </Text>
      <TextInput
        style={[
          styles.textInput,
          {
            fontSize: fontSize.small,
            width: cardSize * 0.8,
            height: isMobile ? 40 : 45,
          },
        ]}
        placeholder="Enter Order ID"
        placeholderTextColor="#999"
        keyboardType="numeric"
        onChangeText={setText}
        value={text}
      />
      <TouchableOpacity
        style={[
          styles.verifyButton,
          {
            width: cardSize * 0.8,
            height: isMobile ? 35 : 40,
          },
        ]}
        onPress={onVerify}>
        <Text style={[styles.verifyButtonText, {fontSize: fontSize.small}]}>
          Search Order
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);
};

// Order Summary By Category Component
const OrderSummaryByCategory: React.FC<{items: LocalItemSummary[]}> = ({
items,
}) => {
const {fontSize} = getResponsiveDimensions();

// Group by menuConfigurationId
const grouped = items.reduce((acc, item) => {
  const key = item.menuConfigurationId;
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {} as Record<number, LocalItemSummary[]>);

return (
  <View style={styles.orderGroupContainer}>
    <Text style={[styles.orderGroupTitle, {fontSize: fontSize.large}]}>
      Order Summary by Category
    </Text>
    {Object.entries(grouped).map(([menuConfigId, groupItems], idx) => (
      <View key={menuConfigId} style={styles.groupContainer}>
        <Text style={[styles.groupTitle, {fontSize: fontSize.medium}]}>
          Category {menuConfigId}
        </Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.tableCell,
                styles.tableHeaderCell,
                styles.slColumn,
                {fontSize: fontSize.small},
              ]}>
              SL
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.tableHeaderCell,
                styles.nameColumn,
                {fontSize: fontSize.small},
              ]}>
              Item Name
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.tableHeaderCell,
                styles.qtyColumn,
                {fontSize: fontSize.small},
              ]}>
              Qty
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.tableHeaderCell,
                styles.qtyColumn,
                {fontSize: fontSize.small},
              ]}>
              Completed
            </Text>
          </View>
          <FlatList
            data={groupItems}
            keyExtractor={(item, idx) => `${item.itemId}-${idx}`}
            scrollEnabled={false}
            renderItem={({item, index}) => (
              <View
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlternate,
                ]}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.slColumn,
                    {fontSize: fontSize.small},
                  ]}>
                  {index + 1}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.nameColumn,
                    {fontSize: fontSize.small},
                  ]}
                  numberOfLines={2}>
                  {item.itemName}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.qtyColumn,
                    {fontSize: fontSize.small},
                  ]}>
                  {item.totalQty}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.qtyColumn,
                    {fontSize: fontSize.small},
                  ]}>
                  {item.completedQty}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    ))}
  </View>
);
};

// Fetch item summary from local SQLite
const fetchLocalItemSummary = async (): Promise<
LocalItemSummary[]
> => {
const db = await getDatabase();
return new Promise((resolve, reject) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT 
        o.menuConfigurationId,
        o.canteenId,
        o.status,
        o.id as orderId,
        oi.itemId,
        oi.itemName,
        oi.quantity
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.orderId`,
      [],
      (_, resultSet) => {
        const rows = [];
        for (let i = 0; i < resultSet.rows.length; i++) {
          rows.push(resultSet.rows.item(i));
        }
        // Group by menuConfigurationId + itemId
        const summaryMap = new Map<string, any>();
        for (const row of rows) {
          const key = `${row.menuConfigurationId}_${row.itemId}`;
          if (!summaryMap.has(key)) {
            summaryMap.set(key, {
              menuConfigurationName: `Category ${row.menuConfigurationId}`,
              itemId: row.itemId,
              itemName: row.itemName,
              menuConfigurationId: row.menuConfigurationId,
              canteenId: row.canteenId,
              totalQty: 0,
              completedQty: 0,
            });
          }
          const entry = summaryMap.get(key);
          entry.totalQty += row.quantity;
          if (row.status === 'completed') {
            entry.completedQty += row.quantity;
          }
        }
        resolve(Array.from(summaryMap.values()));
      },
      err => reject(err),
    );
  });
});
};

const AdminDashboard: React.FC = () => {
const navigation = useNavigation<NavigationProp>();
const [totalOrders, setTotalOrders] = useState(0);
const [completedOrders, setCompletedOrders] = useState(0);
const [isLoading, setIsLoading] = useState(false);
const [refreshing, setRefreshing] = useState(false);
const [canteenName, setCanteenName] = useState('Canteen Name');
const [text, setText] = useState('');
const [itemSummary, setItemSummary] = useState<LocalItemSummary[]>([]);

const {cardSize, cardsPerRow} = getResponsiveDimensions();

// Only 2 cards at top: Total Orders, Completed
const updateDashBoardData = async () => {

  const db = await getDatabase();
  await db.transaction(tx => {
    tx.executeSql(
      `SELECT COUNT(*) as count FROM orders WHERE status IN (?, ?)`,
      ['placed', 'completed'],
      (_, resultSet) => {
        const count = resultSet.rows.item(0)?.count ?? 0;
        setTotalOrders(count);
      },
      (error: SQLError) => {
        console.error('Error fetching count of orders:', error);
      },
    );
  });
  await db.transaction(tx => {
    tx.executeSql(
      `SELECT COUNT(*) as count FROM orders WHERE status = ?`,
      ['completed'],
      (_, resultSet) => {
        const count = resultSet.rows.item(0)?.count ?? 0;
        console.log("completedCount", count);
        setCompletedOrders(count);
      },
      (error: SQLError) => {
        console.error('Error fetching count of completed orders:', error);
      },
    );
  });
};

const updateCompletedOrders = async () => {
  const db = await getDatabase();
  const token = await AsyncStorage.getItem('authorization');
  await db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM orders WHERE status = ?',
      ['completed'],
      async (_, resultSet) => {
        const completedOrderIds = Array.from(
          {length: resultSet.rows.length},
          (_, i) => resultSet.rows.item(i).orderId,
        );
        if (completedOrderIds.length > 0) {
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
            if (response.data?.data?.updatedCount) {
              // Delete all completed orders without checking IDs
              db.transaction(tx => {
                tx.executeSql(
                  `DELETE FROM orders`,
                  [],
                  () =>
                    console.log('All completed orders deleted successfully.'),
                  (error: SQLError) =>
                    console.error('Failed to delete completed orders:', error),
                );
              });


              updateDashBoardData();

              Alert.alert(
                'Success',
                `${response.data.data.updatedCount} completed orders updated successfully.`,
              );
            }
          } catch (err) {
            console.error('Error posting completed orders:', err);
          }
        }
      },
      (error: SQLError) =>
        console.error('Error fetching completed orders:', error),
    );
  });
};

const handleupdateCompletedOrders = async () => {
  Alert.alert(
    'Confirm Update',
    'You are about to update completed orders. Once you proceed, all today orders will be permanently removed from the system and cannot be restored. Do you want to continue?',
    [
      {
        text: 'No',
        style: 'cancel',
        onPress: () => {},
      },
      {
        text: 'Yes',
        onPress: async () => {
          updateCompletedOrders()
        },
      },
    ],
    {cancelable: false},
  );
};


const handleGetAllOrders = async () => {
  try {
    const token = await AsyncStorage.getItem('authorization');
    const canteenId = await AsyncStorage.getItem('canteenId');
    const response = await fetch(
      `https://server.welfarecanteen.in/api/order/getTodaysOrdersByCateen/${canteenId}`,
      {method: 'GET', headers: {Authorization: token || ''}},
    );
    const data = await response.json();
    if (!data || !Array.isArray(data.data)) {
      throw new Error('Invalid data format: Expected an array of orders');
    }
    const db = await getDatabase();
    const orders = data.data;

    // Fetch all existing order ids from local DB
    const existingOrderIds: Set<number> = new Set();
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT id FROM orders',
          [],
          (_, resultSet) => {
            for (let i = 0; i < resultSet.rows.length; i++) {
              existingOrderIds.add(resultSet.rows.item(i).id);
            }
            resolve();
          },
          (error: SQLError) => {
            console.error('Error fetching local order ids:', error);
            resolve(); // Still resolve to avoid blocking
            return false;
          },
        );
      });
    });

    await db.transaction(tx => {
      orders.forEach(order => {
        if (!existingOrderIds.has(order.id)) {
          if (order.orderItems && order.orderItems.length > 0) {
            tx.executeSql(
              `INSERT INTO orders (
                id, orderId, userId, totalAmount, status, canteenId, menuConfigurationId, createdById, updatedById, qrCode, createdAt, updatedAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                order.id,
                order.id,
                order.userId,
                order.totalAmount,
                order.status,
                order.canteenId,
                order.menuConfigurationId,
                order.createdById,
                order.updatedById,
                order.qrCode,
                order.createdAt,
                order.updatedAt,
              ],
              () =>
                console.log(`Order with ID ${order.id} inserted successfully.`),
              (error: SQLError) =>
                console.error(
                  `Failed to insert order with ID ${order.id}:`,
                  error,
                ),
            );
          }
          if (Array.isArray(order.orderItems)) {
            order.orderItems.forEach((item: any) => {
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
                  item.menuItemItem?.name || item.itemName || '',
                  item.createdAt,
                  item.updatedAt,
                ],
                () =>
                  console.log(
                    `Order item with ID ${item.id} inserted successfully.`,
                  ),
                (error: SQLError) =>
                  console.error(
                    `Failed to insert order item with ID ${item.id}:`,
                    error,
                  ),
              );
            });
          }
        } else {
          console.log(`Order with ID ${order.id} already exists. Skipping.`);
        }
      });
    });

    Alert.alert('Orders fetched and stored successfully!');
    await refreshLocalSummary();
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

const handleVerifyOrderId = async () => {
  const db = await getDatabase();
  db.transaction(tx => {
    tx.executeSql(
      `SELECT o.*, oi.* 
       FROM orders o
       INNER JOIN order_items oi ON o.id = oi.orderId
       WHERE o.id = ?`,
      [text],
      (_, resultSet) => {
        const ordersWithItems: Array<{[key: string]: any}> = Array.from(
          {length: resultSet.rows.length},
          (_, i) => resultSet.rows.item(i),
        );
        const orderData = resultSet.rows.item(0);
        if (orderData === undefined) {
          Alert.alert('Error', 'This order not Found');
          setText('');
          return;
        }
        if (orderData.status === 'completed') {
          Alert.alert('Error', 'This order has already been completed.');
          return;
        }
        if (orderData.status === 'cancelled') {
          Alert.alert('Error', 'This order has been cancelled.');
          return;
        }
        handlePrint(ordersWithItems, orderData);
        setText('');
      },
      (error: SQLError) =>
        console.error('Error fetching orders with items:', error),
    );
  });
};

const handlePrint = async (
  ordersWithItems: Array<{[key: string]: any}>,
  orderData: any,
) => {
  const currentDateTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const totalAmount = ordersWithItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const printContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 5px; font-size: 20px; }
        .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .subheader { text-align: center; font-size: 20px; margin-bottom: 5px; }
        .datetime { text-align: center; font-size: 18px; margin-bottom: 5px; }
        .section { margin-bottom: 10px; }
        .items-header { font-size: 20px; font-weight: bold; margin: 10px 0; }
        .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .label { font-weight: bold; width: 70%; }
        .value { text-align: right; width: 30%; }
        .total-line { border-top: 1px solid #000; margin: 10px 0; padding-top: 5px; }
        .total { font-weight: bold; font-size: 20px; display: flex; justify-content: space-between; margin-bottom: 0; }
        .footer-space { text-align: center; padding-top: 25px; font-weight: bold; font-size: 25px; margin-bottom: 0; }
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
        <div class="footer-space">Thank You For Using WORLDTEK</div>
      </div>
    </body>
    </html>
  `;
  try {
    await RNPrint.print({html: printContent});
    const db = await getDatabase();
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE orders SET status = 'completed' WHERE orderId = ?`,
        [orderData.orderId],
        () => console.log('Order status updated successfully'),
        (error: SQLError) =>
          console.error('Error updating order status:', error),
      );
    });
    await refreshLocalSummary();
  } catch (error) {
    Alert.alert('Error', 'Failed to print the content.');
  }
};

const handleLogout = async () => {
  Alert.alert(
    'Confirm Logout',
    'Do you want to logout?',
    [
      {
        text: 'No',
        style: 'cancel',
        onPress: () => {},
      },
      {
        text: 'Yes',
        onPress: async () => {
          await AsyncStorage.removeItem('authorization');
          await AsyncStorage.removeItem('canteenName');
          await AsyncStorage.removeItem('canteenId');
          navigation.navigate('Login');
        },
      },
    ],
    {cancelable: false},
  );
};

const refreshLocalSummary = async () => {
  setIsLoading(true);
  await updateDashBoardData();
  const summary = await fetchLocalItemSummary();
  setItemSummary(summary);
  setIsLoading(false);
  setRefreshing(false);
};



useEffect(() => {
  const unsubscribe = navigation.addListener('focus', async () => {
    const canteenName = await AsyncStorage.getItem('canteenName');
    setCanteenName(canteenName || 'Canteen Name');
    await refreshLocalSummary();
  });

  // Initial load as well
  (async () => {
    const canteenName = await AsyncStorage.getItem('canteenName');
    setCanteenName(canteenName || 'Canteen Name');
    await refreshLocalSummary();
  })();

  return unsubscribe;
}, [navigation]);

if (isLoading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1a237e" />
      <Text style={{marginTop: 10, fontSize: 16}}>Loading...</Text>
    </View>
  );
}

return (
  <View style={styles.container}>
    <Header
      canteenName={canteenName}
      onSync={handleGetAllOrders}
      onLogout={handleLogout}
      handleupdateCompletedOrders={handleupdateCompletedOrders}
    />
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshLocalSummary} />
      }
      showsVerticalScrollIndicator={false}>
      {/* Only 2 cards at top */}
      <View
        style={[
          styles.statsContainer,
          isLandscape && styles.statsContainerLandscape,
        ]}>
        <StatCard value={totalOrders} label="Total Orders" />
        <StatCard value={completedOrders} label="Completed" />
      </View>
      {/* Action Cards Section */}
      <View style={styles.actionCardsContainer}>
        <View
          style={[
            styles.cardsGrid,
            {
              justifyContent:
                cardsPerRow <= 2 ? 'space-around' : 'space-between',
            },
          ]}>
          <VerifyOrderCard
            text={text}
            setText={setText}
            onVerify={handleVerifyOrderId}
            cardSize={cardSize}
          />
          <ActionCard
            title="Quick Scan"
            description="Scan QR Code"
            imageSource={require('../images/qrcode.jpeg')}
            onPress={() => navigation.navigate('BluetoothControl')}
            cardSize={cardSize}
            isQr
          />
          <ActionCard
            title="Walk-ins"
            description="Manage customers"
            imageSource={require('../images/walkin.webp')}
            onPress={() => navigation.navigate('walkins')}
            cardSize={cardSize}
          />
        </View>
      </View>
      {/* Order Summary By Category */}
      {itemSummary.length > 0 && <OrderSummaryByCategory items={itemSummary} />}
    </ScrollView>
  </View>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#f8f9fa',
},
header: {
  paddingTop: isMobile ? 40 : 50,
  paddingBottom: isMobile ? 15 : 20,
  paddingHorizontal: isMobile ? 15 : 20,
  backgroundColor: '#100080',
  borderBottomLeftRadius: isMobile ? 15 : 20,
  borderBottomRightRadius: isMobile ? 15 : 20,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
headerLandscape: {
  paddingTop: 30,
  paddingBottom: 15,
},
headerContent: {
  flexDirection: isMobile ? 'column' : 'row',
  justifyContent: isMobile ? 'center' : 'space-between',
  alignItems: isMobile ? 'center' : 'center',
},
headerContentMobile: {
  flexDirection: 'column',
  alignItems: 'center',
},
headerTitle: {
  fontWeight: '700',
  color: '#ffffff',
  marginBottom: isMobile ? 15 : 0,
  textAlign: 'center',
},
buttonContainer: {
  flexDirection: isMobile ? 'column' : 'row',
  alignItems: 'center',
  gap: isMobile ? 12 : 10,
},
buttonContainerMobile: {
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
},
syncButton: {
  backgroundColor: '#4a148c',
  paddingVertical: isMobile ? 8 : 10,
  paddingHorizontal: isMobile ? 12 : 15,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  width: isMobile ? '80%' : undefined,
},
completedButton: {
  backgroundColor: '#6a1b9a',
  paddingVertical: isMobile ? 8 : 10,
  paddingHorizontal: isMobile ? 12 : 15,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  width: isMobile ? '80%' : undefined,
},
logoutButton: {
  backgroundColor: '#d32f2f',
  paddingVertical: isMobile ? 8 : 10,
  paddingHorizontal: isMobile ? 12 : 15,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  width: isMobile ? '80%' : undefined,
},
syncButtonText: {
  color: '#ffffff',
  fontWeight: '600',
  textAlign: 'center',
},
logoutButtonText: {
  color: '#ffffff',
  fontWeight: '600',
  textAlign: 'center',
},
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f8f9fa',
},
scrollContainer: {
  flexGrow: 1,
  paddingBottom: 20,
},
statsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  paddingHorizontal: isMobile ? 10 : 20,
  paddingVertical: 15,
  gap: 10,
},
statsContainerLandscape: {
  justifyContent: 'space-evenly',
},
statCard: {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: isMobile ? 12 : 16,
  minWidth: isMobile ? '45%' : isTablet ? '22%' : '20%',
  alignItems: 'center',
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.22,
  shadowRadius: 2.22,
  borderLeftWidth: 4,
  borderLeftColor: '#4caf50',
},
statCardTablet: {
  minWidth: '22%',
  padding: 20,
},
statValue: {
  fontWeight: '700',
  color: '#2e7d32',
  marginBottom: 4,
},
statLabel: {
  color: '#666',
  textAlign: 'center',
  lineHeight: isMobile ? 16 : 18,
},
actionCardsContainer: {
  paddingHorizontal: isMobile ? 10 : 20,
  paddingVertical: 10,
},
cardsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: isMobile ? 8 : 12,
},
squareCard: {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  overflow: 'hidden',
  alignItems: 'center',
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
imageContainer: {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
},
cardQrImage: {
  resizeMode: 'contain',
},
cardImage: {
  resizeMode: 'cover',
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
},
cardContent: {
  padding: 8,
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
},
verifyCardContent: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 12,
  width: '100%',
},
cardTitle: {
  fontWeight: '600',
  color: '#1976d2',
  textAlign: 'center',
  marginBottom: 4,
},
cardDescription: {
  color: '#666',
  textAlign: 'center',
  lineHeight: 16,
},
textInput: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  paddingHorizontal: 12,
  marginVertical: 8,
  backgroundColor: '#fff',
  textAlign: 'center',
},
verifyButton: {
  backgroundColor: '#4caf50',
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 5,
},
verifyButtonText: {
  color: '#fff',
  fontWeight: '600',
},
orderGroupContainer: {
  margin: isMobile ? 10 : 20,
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: isMobile ? 12 : 16,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.22,
  shadowRadius: 2.22,
},
orderGroupTitle: {
  fontWeight: '700',
  color: '#1976d2',
  marginBottom: 15,
  textAlign: 'center',
},
groupContainer: {
  marginBottom: 20,
},
groupTitle: {
  fontWeight: '600',
  color: '#333',
  marginBottom: 10,
  paddingLeft: 5,
},
tableContainer: {
  borderRadius: 8,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
tableHeader: {
  flexDirection: 'row',
  backgroundColor: '#f5f5f5',
  paddingVertical: 12,
  paddingHorizontal: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
},
tableHeaderCell: {
  fontWeight: '700',
  color: '#333',
  textAlign: 'center',
},
tableRow: {
  flexDirection: 'row',
  paddingVertical: isMobile ? 10 : 12,
  paddingHorizontal: 8,
  borderBottomWidth: 0.5,
  borderBottomColor: '#eee',
},
tableRowAlternate: {
  backgroundColor: '#fafafa',
},
tableCell: {
  color: '#333',
  textAlign: 'center',
  paddingHorizontal: 4,
},
slColumn: {
  flex: 0.8,
},
nameColumn: {
  flex: 3,
  textAlign: 'left',
  paddingLeft: 8,
},
qtyColumn: {
  flex: 1,
  textAlign: 'center',
},
});

export default AdminDashboard;
