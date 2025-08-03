import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPrint from 'react-native-print';
import { initializeDatabase } from '../../offline/database';

// TypeScript interfaces (unchanged)
interface Pricing {
  id: number;
  itemId: number;
  price: number;
  currency: string;
  startDate: number;
  endDate: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

interface ApiItem {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  quantity: number;
  quantityUnit: string;
  image: string;
  createdById: number | null;
  updatedById: number | null;
  createdAt: number;
  updatedAt: number;
  pricing: Pricing;
}

interface FoodItem {
  id: number;
  name: string;
  description: string;
  type: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
  availableQuantity: number;
  quantityUnit: string;
}

interface ApiResponse {
  message: string;
  data: ApiItem[];
}

interface LocalDbItem {
  id: number;
  itemId: number;
  itemName: string;
  minQuantity: number;
  maxQuantity: number;
  price: number;
}

const Walkins: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);

  // Initialize database and check network (unchanged)
  useEffect(() => {
    initializeApp();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected || false);
      if (state.isConnected) {
        fetchItemsFromApi();
      }
    });

    return () => unsubscribe();
  }, []);

  const initializeApp = async () => {
    try {
      const db = await initializeDatabase();
      setDatabase(db);
      await loadItemsFromLocalDb(db);

      const netInfo = await NetInfo.fetch();
      setIsConnected(netInfo.isConnected || false);
      if (netInfo.isConnected) {
        await fetchItemsFromApi();
      }
    } catch (error) {
      console.error('App initialization error:', error);
      setLoading(false);
    }
  };

  // Load items from local database (unchanged)
  const loadItemsFromLocalDb = async (db: SQLite.SQLiteDatabase) => {
    try {
      const results = await db.executeSql('SELECT * FROM menu_items');
      const items: FoodItem[] = [];

      if (results[0].rows.length > 0) {
        for (let i = 0; i < results[0].rows.length; i++) {
          const item = results[0].rows.item(i);
          items.push({
            id: item.itemId,
            name: item.itemName,
            description: '',
            type: 'veg',
            price: item.price,
            currency: 'INR',
            image: '',
            quantity: 0,
            availableQuantity: item.maxQuantity,
            quantityUnit: 'pieces',
          });
        }
        setFoodItems(items);
      }
    } catch (error) {
      console.error('Error loading items from local DB:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items from API and save to local database (unchanged)
  const fetchItemsFromApi = async (): Promise<void> => {
    if (!database) return;

    try {
      setLoading(true);
      const response = await fetch('https://server.welfarecanteen.in/api/item/getItems');
      const result: ApiResponse = await response.json();

      if (result.data && result.data.length > 0) {
        await database.executeSql('DELETE FROM menu_items');

        const itemsWithQuantity: FoodItem[] = [];

        for (const item of result.data) {
          await database.executeSql(
            `INSERT OR REPLACE INTO menu_items (
              id, itemId, itemName, minQuantity, maxQuantity, price
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [null, item.id, item.name, 1, item.quantity, item.pricing.price]
          );

          itemsWithQuantity.push({
            id: item.id,
            name: item.name,
            description: item.description,
            type: item.type,
            price: item.pricing.price,
            currency: item.pricing.currency,
            image: item.image ? `data:image/jpeg;base64,${item.image}` : '',
            quantity: 0,
            availableQuantity: item.quantity,
            quantityUnit: item.quantityUnit,
          });
        }

        setFoodItems(itemsWithQuantity);
        Alert.alert('Success', 'Menu items synced successfully!');
      }
    } catch (error) {
      console.error('Error fetching items from API:', error);
      Alert.alert('Error', 'Failed to sync items from server.');
    } finally {
      setLoading(false);
    }
  };

  // Check if mobile number already exists in walkins table (unchanged)
  const checkMobileNumberExists = async (mobile: string): Promise<boolean> => {
    if (!database) return false;

    try {
      const results = await database.executeSql(
        'SELECT COUNT(*) as count FROM walkins WHERE contactNumber = ? AND orderStatus = "completed"',
        [mobile]
      );
      return results[0].rows.item(0).count > 0;
    } catch (error) {
      console.error('Error checking mobile number:', error);
      return false;
    }
  };

  // Function to increase quantity (unchanged)
  const increaseQuantity = (id: number): void => {
    setFoodItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.quantity < item.availableQuantity
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Function to decrease quantity (unchanged)
  const decreaseQuantity = (id: number): void => {
    setFoodItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Filter items with quantity > 0 (modified to exclude image and match walkin_items schema)
  const filterOrderItems = (data: FoodItem[]) => {
    return data
      .filter(item => item.quantity > 0)
      .map(item => ({
        menuItemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        specialInstructions: '', // Add logic if special instructions are needed
        phoneNumber: mobileNumber,
      }));
  };

  // Function to print order (modified to use walkin_items table)
  const printOrder = async (): Promise<void> => {
    // if (!database) {
    //   Alert.alert('Error', 'Database not initialized.');
    //   return;
    // }

    // if (!mobileNumber.trim()) {
    //   Alert.alert('Error', 'Please enter mobile number.');
    //   return;
    // }

    // if (mobileNumber.length !== 10 || isNaN(Number(mobileNumber))) {
    //   Alert.alert('Error', 'Please enter a valid 10-digit mobile number.');
    //   return;
    // }

    const orderItems = foodItems.filter(item => item.quantity > 0);

    if (orderItems.length === 0) {
      Alert.alert('No Items', 'Please add items to your order before printing.');
      return;
    }

    // Check if mobile number already exists
    // const mobileExists = await checkMobileNumberExists(mobileNumber);
    // if (mobileExists) {
    //   Alert.alert('Error', 'This mobile number is already registered. Please use a different number.');
    //   return;
    // }

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    try {
      // Use a transaction to ensure atomicity
      // await database.transaction(async (tx) => {
      //   const currentTime = Date.now();

      //   // Insert into walkins table
      //   const [walkinResult] = await tx.executeSql(
      //     `INSERT INTO walkins (
      //       customerName, contactNumber, numberOfPeople, orderStatus,
      //       totalAmount, finalAmount, createdById, createdAt, updatedAt,
      //       paymentMethod, paymentStatus
      //     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      //     [
      //       'Walk-in Customer',
      //       mobileNumber,
      //       1,
      //       'completed',
      //       totalAmount,
      //       totalAmount,
      //       1,
      //       currentTime,
      //       currentTime,
      //       'Cash',
      //       'paid',
      //     ]
      //   );

      //   const walkinId = walkinResult.insertId; // Get the inserted walkin ID

      //   // Prepare order items for walkin_items table
      //   const itemsToInsert = filterOrderItems(foodItems);

      //   // Insert each item into walkin_items table
      //   for (const item of itemsToInsert) {
      //     await tx.executeSql(
      //       `INSERT INTO walkin_items (
      //         walkinId, menuItemId, itemName, quantity, unitPrice,
      //         totalPrice, specialInstructions, status, createdAt, phoneNumber
      //       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      //       [
      //         walkinId,
      //         item.menuItemId,
      //         item.itemName,
      //         item.quantity,
      //         item.unitPrice,
      //         item.totalPrice,
      //         item.specialInstructions,
      //         'completed',
      //         currentTime,
      //         item.phoneNumber,
      //       ]
      //     );
      //   }
      // });

      // Print receipt
      await printReceipt(orderItems, totalAmount);

      // Reset form
      // setMobileNumber('');
      setFoodItems(prevItems =>
        prevItems.map(item => ({ ...item, quantity: 0 }))
      );

      Alert.alert('Success', 'Order processed and receipt printed successfully!');
    } catch (error) {
      console.error('Error processing order:', error);
      Alert.alert('Error', 'Failed to process order.');
    }
  };

  // Print receipt (unchanged)
  const printReceipt = async (orderItems: FoodItem[], totalAmount: number) => {
    const canteenName = (await AsyncStorage.getItem('canteenName')) || 'Welfare Canteen';
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
      .section {
        margin-bottom: 10px;
      }
      .info {
        margin-bottom: 10px;
      }
      .info p {
        margin: 4px 0;
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

    <div class="info">
      <p><strong>Phone Number:</strong> ${mobileNumber}</p>
      <p><strong>Order ID:</strong> WI${Math.floor(Math.random() * 10000)}</p>
    </div>

    <div class="section">
      <div class="items-header">List of Items</div>
      <div class="row">
        <span class="label">Items</span>
        <span class="value">Qty</span>
      </div>
      ${orderItems
        .map(
          item => `
          <div class="row">
            <span class="label">${item.name}</span>
            <span class="value">${item.quantity}</span>
          </div>`
        )
        .join('')}
      <div class="total-line"></div>
      <div class="total">
        <span>Total Amount</span>
        <span>₹${totalAmount.toFixed(2)}</span>
      </div>
    </div>
  </body>
</html>
`;

    try {
      await RNPrint.print({ html: printContent });
      Alert.alert('Success', 'Receipt printed successfully!');
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print the receipt.');
    }
  };

  // Get type indicator color (unchanged)
  const getTypeColor = (type: string): string => {
    return type === 'veg' ? '#4CAF50' : '#FF5722';
  };

  // Get type symbol (unchanged)
  const getTypeSymbol = (type: string): string => {
    return type === 'veg' ? '●' : '▲';
  };

  // Render food item (unchanged)
  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemCard}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]}>
            <Text style={styles.typeSymbol}>{getTypeSymbol(item.type)}</Text>
          </View>
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
            <Text style={styles.availableQuantity}>
              Available: {item.availableQuantity} {item.quantityUnit}
            </Text>
          </View>
        </View>

        <View style={styles.quantityContainer}>
          {item.quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => increaseQuantity(item.id)}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => decreaseQuantity(item.id)}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => increaseQuantity(item.id)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // Render empty state (unchanged)
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🍽️</Text>
      <Text style={styles.emptyTitle}>No Items Found</Text>
      <Text style={styles.emptySubtitle}>
        {isConnected
          ? 'No menu items are available at the moment.'
          : 'No offline data available. Please sync when connected to internet.'}
      </Text>
      {isConnected && (
        <TouchableOpacity style={styles.syncButton} onPress={fetchItemsFromApi}>
          <Text style={styles.syncButtonText}>🔄 Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Calculate total items and amount (unchanged)
  const totalItems = foodItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = foodItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#010080" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🍽️ Walk-in Orders</Text>
          {isConnected && (
            <TouchableOpacity style={styles.syncButtonHeader} onPress={fetchItemsFromApi}>
              <Text style={styles.syncButtonHeaderText}>🔄</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.networkStatus}>
          <Text style={[styles.networkText, { color: isConnected ? '#4CAF50' : '#FF5722' }]}>
            {isConnected ? '🟢 Online' : '🔴 Offline'}
          </Text>
        </View>
      </View>
{/* 
      <View style={styles.mobileInputContainer}>
        <Text style={styles.mobileLabel}>Customer Mobile Number</Text>
        <TextInput
          style={styles.mobileInput}
          placeholder="Enter 10-digit mobile number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="numeric"
          maxLength={10}
          placeholderTextColor="black"
        />
      </View> */}

      {foodItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={foodItems}
          keyExtractor={item => item.id.toString()}
          renderItem={renderFoodItem}
          showsVerticalScrollIndicator={false}
          style={styles.itemsList}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={isConnected ? fetchItemsFromApi : undefined}
        />
      )}

      {totalItems > 0 && (
        <View style={styles.orderSummary}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>{totalItems}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.printButton} onPress={printOrder}>
              <Text style={styles.printButtonText}>🖨️ Print Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// Styles (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#010080',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  syncButtonHeader: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButtonHeaderText: {
    fontSize: 18,
  },
  networkStatus: {
    alignItems: 'center',
    marginTop: 8,
  },
  networkText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  mobileInputContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mobileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  mobileInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  itemsList: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 200,
  },
  itemContainer: {
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  typeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  typeSymbol: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#010080',
  },
  availableQuantity: {
    fontSize: 12,
    color: '#999',
  },
  quantityContainer: {
    marginLeft: 12,
  },
  addButton: {
    backgroundColor: '#010080',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#010080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityDisplay: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  syncButton: {
    backgroundColor: '#010080',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#010080',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  summaryContent: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#fff',
    opacity: 0.3,
    marginHorizontal: 20,
  },
  printButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  printButtonText: {
    color: '#010080',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Walkins;