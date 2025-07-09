import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
  Dimensions,
  AppStateStatus,
  AppState,
  TextInput,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllMenusOffline,
  getMenuItemsByIdOffline,
} from '../../offline/offlineApis/menuOfflineApis';
const {width} = Dimensions.get('window');
import {initializeDatabase} from '../../offline/database';
import type {SQLError} from 'react-native-sqlite-storage';
import RNPrint from 'react-native-print';
import NetInfo from '@react-native-community/netinfo';
import {useNavigation} from '@react-navigation/native';

type MenuScreenNewNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MenuScreenNew'
>;

interface Pricing {
  id: number;
  price: number;
  currency: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  image: string;
  pricing: Pricing;
}

interface MenuItemWithQuantity {
  id: number;
  menuItemItem: MenuItem;
  minQuantity: number;
  maxQuantity: number;
}

interface MenuConfiguration {
  id: number;
  name: string;
  defaultStartTime: number;
  defaultEndTime: number;
}

interface MenuDetails {
  id: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  menuMenuConfiguration: MenuConfiguration;
  menuItems: MenuItemWithQuantity[];
  canteenId: number;
}

interface CartResponse {
  message: string;
  data: {
    id: number;
    userId: number;
    status: string;
    totalAmount: number;
    canteenId: number;
    menuConfigurationId: number;
    menuId: number;
    updatedAt: string;
    createdAt: string;
  };
}

const MenuScreenNew: React.FC = ({}) => {
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuDetails | null>(null);
  const [showMenuDetails, setShowMenuDetails] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [syncedMenuItems, setSyncedMenuItems] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [canteenName, setCanteenName] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{[key: number]: boolean}>(
    {},
  ); // New state for selected items

  const navigation = useNavigation();
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDatabase();
        setIsDbInitialized(true);
        // Check if we're offline and load from SQLite
        const isConnected = await checkNetworkConnectivity();
        setIsOffline(!isConnected);

        const db = await initializeDatabase();
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM menu_items',
            [],
            (_, resultSet) => {
              const data = [];
              for (let i = 0; i < resultSet.rows.length; i++) {
                data.push(resultSet.rows.item(i));
              }

              console.log('Data loaded from SQLite:11222222', data);
              setSyncedMenuItems(data);
            },
            error => {
              console.error('Error loading data from database:', error);
            },
          );
        });
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const toggleCheckbox = (itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Function to check network connectivity using fetch
  const checkNetworkConnectivity = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('Network connectivity check failed:', error);
      return false;
    }
  };

  // Check connectivity and update state
  const updateConnectivityStatus = async (): Promise<void> => {
    try {
      const isConnected = await checkNetworkConnectivity();
      setIsOffline(!isConnected);
      console.log('Connection status:', isConnected ? 'online' : 'offline');
    } catch (error) {
      console.error('Failed to update connectivity status:', error);
      setIsOffline(true); // Assume offline if check fails
    }
  };

  useEffect(() => {
    updateConnectivityStatus();
    const intervalId = setInterval(updateConnectivityStatus, 30000);
    const appStateHandler = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateConnectivityStatus();
      }
    };
    const appStateSubscription = AppState.addEventListener(
      'change',
      appStateHandler,
    );
    // Clean up
    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, []);

  const loadMenuItems = async () => {
    if (!isDbInitialized) return;

    try {
      const offlineData = await getAllMenusOffline();
      console.log('Offline Data:', offlineData);

      if (offlineData?.data) {
        setMenuData(offlineData.data);
        const apiDates = Object.keys(offlineData.data).sort((a, b) => {
          const dateA = new Date(a.split('-').reverse().join('-'));
          const dateB = new Date(b.split('-').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        });
        setDates(apiDates);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu items');
      console.error('Load error:', error);
    }
  };

  // Fetch menu data
  const fetchMenuData = async () => {
    try {
      const token = await AsyncStorage.getItem('authorization');
      if (!token) {
        console.error('No token found in AsyncStorage');
        return;
      }

      let response = await fetch(
        `https://server.welfarecanteen.in/api/menu/getMenusForNextTwoDaysGroupedByDateAndConfiguration?canteenId=`,
        {
          method: 'GET',
          headers: {
            Authorization: token,
          },
        },
      );

      const data = await response.json();
      console.log('Menu Data:', data);

      if (data?.data) {
        setMenuData(data.data);
        const apiDates = Object.keys(data.data).sort((a, b) => {
          const dateA = new Date(a.split('-').reverse().join('-'));
          const dateB = new Date(b.split('-').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        });
        setDates(apiDates);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  async function checkConnectivity() {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      console.log('Network is connected');
      fetchMenuData();
    } else {
      console.log('Network is not connected');
    }
  }

  useEffect(() => {
    // Check if the database is initialized and load menu items
    checkConnectivity();
    if (isOffline) {
      loadMenuItems();
    }
  }, [isOffline, isDbInitialized]);

  // Fetch menu details by ID

  // Add item to cart
  const addToCart = async (itemId: number, quantity: number) => {
    if (!selectedMenu) return;

    try {
      setAddingToCart(itemId);
      const token = await AsyncStorage.getItem('authorization');
      if (!token) {
        console.error('No token found in AsyncStorage');
        return;
      }

      const cartData = {
        itemId,
        quantity,
        menuId: selectedMenu.id,
        canteenId: selectedMenu.canteenId,
        menuConfigurationId: selectedMenu.menuMenuConfiguration.id,
      };

      const response = await fetch(
        'https://server.welfarecanteen.in/api/cart/add',
        {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartData),
        },
      );

      const data: CartResponse = await response.json();

      if (data.data) {
        Alert.alert('Success', 'Item added to cart successfully!', [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to add item to cart', [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred while adding to cart', [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
    } finally {
      setAddingToCart(null);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const renderItemImage = (imageUrl: string) => {
    if (imageUrl) {
      return (
        <Image
          source={{
            uri: imageUrl
              ? `data:image/png;base64,${imageUrl}`
              : 'https://via.placeholder.com/150',
          }}
          style={styles.itemImage}
          resizeMode="cover"
          onError={e => console.log('Image error:', e.nativeEvent.error)}
        />
      );
    }
    return (
      <View style={[styles.itemImage, styles.noImage]}>
        <Text style={styles.noImageText}>No Image Available</Text>
      </View>
    );
  };

  const renderMenuDetails = () => {
    if (!selectedMenu) return null;

    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowMenuDetails(false)}>
          <Text style={styles.backButtonText}>← Back to Menu</Text>
        </TouchableOpacity>

        <View style={styles.menuDetailsHeader}>
          <Text style={styles.menuTitle}>{selectedMenu?.name}</Text>
          <Text style={styles.menuDescription}>
            {selectedMenu?.description}
          </Text>

          <View style={styles.timingContainer}>
            <Text style={styles.timingText}>
              Menu Time: {formatTime(selectedMenu?.startTime)} -{' '}
              {formatTime(selectedMenu?.endTime)}
            </Text>
            <Text style={styles.timingText}>
              Default Time:{' '}
              {formatTime(
                selectedMenu?.menuMenuConfiguration?.defaultStartTime,
              )}{' '}
              -{' '}
              {formatTime(selectedMenu?.menuMenuConfiguration?.defaultEndTime)}
            </Text>
          </View>
        </View>

        <FlatList
          data={selectedMenu.menuItems}
          keyExtractor={item => item?.id?.toString()}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({item}) => (
            <View style={styles.menuItem}>
              {renderItemImage(item?.menuItemItem?.image)}
              <Text style={styles.itemName}>{item?.menuItemItem?.name}</Text>
              <Text style={styles.itemDescription}>
                {item?.menuItemItem?.description}
              </Text>
              <Text style={styles.itemPrice}>
                {item?.menuItemItem?.pricing?.currency}{' '}
                {item?.menuItemItem?.pricing?.price}
              </Text>
              <Text style={styles.quantityRange}>
                Quantity: {item?.minQuantity}-{item?.maxQuantity}
              </Text>

              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() =>
                  addToCart(item?.menuItemItem?.id, item?.minQuantity)
                }
                disabled={addingToCart === item?.id}>
                {addingToCart === item?.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.menuItemsContainer}
        />
      </View>
    );
  };

  const checkIfDataSynced = async (): Promise<boolean> => {
    const isSynced = await AsyncStorage.getItem('isMenuSynced');
    return isSynced === 'true';
  };

  // Sync Menu Button Logic

  // Check if data is already synced on component mount

  useEffect(() => {
    const checkSyncStatus = async () => {
      const canteenName = await AsyncStorage.getItem('canteenName') || '';
      console.log('Canteen Name:----------------------=========================', canteenName);
      setCanteenName(canteenName);
      const isSynced = await checkIfDataSynced();
      if (isSynced) {
        loadDataFromDatabase(); // Load data from SQLite if already synced
      }
    };

    checkSyncStatus();
  }, []);

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

  const renderMenuList = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore the Menu</Text>
        </View>

        <TouchableOpacity
          style={styles.syncButton}
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem('authorization');
              if (!token) {
                Alert.alert('Error', 'No token found');
                return;
              }

              const menuId = 1;
              const response = await fetch(
                `https://server.welfarecanteen.in/api/menu/getMenuById?id=${menuId}`,
                {
                  method: 'GET',
                  headers: {
                    Authorization: token,
                  },
                },
              );
              const apiData = await response.json();
              if (!apiData?.data) {
                Alert.alert('Error', 'No menu data found');
                return;
              }

              console.log('API Data:', apiData.data);

              const db = await initializeDatabase();

              db.transaction(tx => {
                tx.executeSql(
                  `INSERT OR REPLACE INTO menus (name, description, startTime, endTime, createdAt, updatedAt, menuConfigurationId, menuId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    apiData.data.name,
                    apiData.data.description,
                    apiData.data.startTime,
                    apiData.data.endTime,
                    apiData.data.createdAt,
                    apiData.data.updatedAt,
                    apiData.data.menuConfigurationId,
                    apiData.data.id,
                  ],
                );

                apiData.data.menuItems.forEach((menuItem: any) => {
                  tx.executeSql(
                    `INSERT OR REPLACE INTO menu_items (menuId, itemId, itemName, minQuantity, maxQuantity, price) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                      menuItem.menuId,
                      menuItem.itemId,
                      menuItem.item?.name || '',
                      menuItem.minQuantity,
                      menuItem.maxQuantity,
                      menuItem.item?.pricing?.price ?? 0,
                    ],
                    () =>
                      console.log(
                        `Inserted item ${menuItem.item?.name} into menu_items successfully`,
                      ),
                  );
                });

                console.log('Synced Menu Items:', apiData.data.menuItems);
              });
            } catch (err) {
              console.error('Sync error:', err);
              Alert.alert('Error', 'Sync failed');
            }
          }}>
          <Text style={styles.syncButtonText}>Sync Menu</Text>
        </TouchableOpacity>

        <View>
          {syncedMenuItems.length > 0 && (
            <>
              <Text style={styles.phoneNumberLabel}>Phone Number:</Text>
              <TextInput
                style={styles.phoneNumberInput}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor={'black'}
                onChangeText={text => setPhoneNumber(text)}
                value={phoneNumber}
                maxLength={10}
              />

              <FlatList
                data={syncedMenuItems}
                keyExtractor={item => item?.id?.toString()}
                renderItem={({item}) => {
                  const quantity =
                    quantities[item?.id] || item?.minQuantity || 1;
                  const isSelected = selectedItems[item?.id] || false;
                  const increaseQuantity = () => {
                    if (isSelected && quantity < item?.maxQuantity) {
                      setQuantities(prev => ({
                        ...prev,
                        [item?.id]: quantity + 1,
                      }));
                    }
                  };

                  const decreaseQuantity = () => {
                    if (isSelected && quantity > item?.minQuantity) {
                      setQuantities(prev => ({
                        ...prev,
                        [item?.id]: quantity - 1,
                      }));
                    }
                  };

                  return (
                    <View style={styles.menuItemCard}>
                      <View style={styles.checkboxContainer}>
                        <CheckBox
                          value={isSelected}
                          onValueChange={() => toggleCheckbox(item?.id)}
                          tintColors={{true: '#4F46E5', false: '#6B7280'}}
                        />
                        <Text style={styles.menuItemTitle}>
                          {item?.itemName}
                        </Text>
                      </View>
                      <Text style={styles.menuItemTitle}>{item?.itemName}</Text>
                      <Text style={styles.menuItemPrice}>
                        Price: ₹ {item?.price}
                      </Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          onPress={decreaseQuantity}
                          // style={styles.quantityButton}
                          style={[
                            styles.quantityButton,
                            !isSelected && styles.disabledButton,
                          ]}
                          disabled={!isSelected}>
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity
                          onPress={increaseQuantity}
                          style={[
                            styles.quantityButton,
                            !isSelected && styles.disabledButton,
                          ]}
                          // style={styles.quantityButton}
                          disabled={!isSelected}>
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            </>
          )}

          <View style={styles.phoneNumberContainer}>
            {syncedMenuItems && syncedMenuItems.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={async () => {
                    if (!phoneNumber.trim()) {
                      Alert.alert('Error', 'Phone number is required.');
                      return;
                    }
                    if (!/^\d{10}$/.test(phoneNumber.trim())) {
                      Alert.alert(
                        'Error',
                        'Please enter a valid 10-digit phone number.',
                      );
                      return;
                    }
                    // Check if at least one item is selected
                    if (
                      !Object.values(selectedItems).some(selected => selected)
                    ) {
                      Alert.alert(
                        'Error',
                        'Please select at least one item to print.',
                      );
                      return;
                    }
                    try {
                      const db = await initializeDatabase();
                      const selectedMenuItems = syncedMenuItems.filter(
                        item => selectedItems[item?.id],
                      );
                      const totalPrice = selectedMenuItems.reduce(
                        (total, item) => {
                          const quantity =
                            quantities[item?.id] || item?.minQuantity || 1;
                          return total + (item?.price || 0) * quantity;
                        },
                        0,
                      );

                      db.transaction(tx => {
                        console.log('@@@@@@@@@@@', phoneNumber);
                        const createdate = Date.now(); // INTEGER timestamp
                        const updatedate = createdate;
                        const customerName = ''; // You can set this from input if needed
                        const numberOfPeople = 1;
                        const tableNumber = '';
                        const orderStatus = 'completed';
                        const menuId = 1;
                        const discountAmount = 0;
                        const taxAmount = 0;
                        const finalAmount = totalPrice;
                        const paymentMethod = 'Cash';
                        const paymentStatus = 'unpaid';
                        const notes = '';
                        const createdById = 1; // Set as needed
                        const updatedById = null;
                        const isSynced = 0;

                        tx.executeSql(
                          `INSERT INTO walkins (
                          customerName, contactNumber, numberOfPeople, tableNumber, orderStatus, menuId, totalAmount, discountAmount, taxAmount, finalAmount, paymentMethod, paymentStatus, notes, createdById, updatedById, createdAt, updatedAt, isSynced
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                          [
                            customerName,
                            phoneNumber, // <-- Pass phoneNumber here for contactNumber
                            numberOfPeople,
                            tableNumber,
                            orderStatus,
                            menuId,
                            totalPrice,
                            discountAmount,
                            taxAmount,
                            finalAmount,
                            paymentMethod,
                            paymentStatus,
                            notes,
                            createdById,
                            updatedById,
                            createdate,
                            updatedate,
                            isSynced,
                          ],
                          (_, result) => {
                            const walkinId = result.insertId;
                            syncedMenuItems.forEach(item => {
                              const quantity =
                                quantities[item?.id] || item?.minQuantity || 1;
                              const unitPrice = item?.price || 0;
                              const totalPriceItem = unitPrice * quantity;
                              tx.executeSql(
                                `INSERT INTO walkin_items (
                            walkinId, menuItemId, itemName, quantity, unitPrice, totalPrice, specialInstructions, status, createdAt, phoneNumber
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                  walkinId,
                                  item?.id,
                                  item?.itemName,
                                  quantity,
                                  unitPrice,
                                  totalPriceItem,
                                  '', // specialInstructions
                                  'pending',
                                  createdate,
                                  phoneNumber, // <-- Pass phoneNumber here for walkin_items
                                ],
                                () =>
                                  console.log(
                                    `Inserted item ${item?.itemName} into walkin_items successfully`,
                                    item,
                                    phoneNumber,
                                  ),

                                (error: SQLError) => {
                                  console.log(
                                    'Error inserting walkin_items',
                                    error,
                                  );
                                },
                              );
                            });
                          },
                          (error: SQLError) => {
                            console.log('Error inserting walkins', error);
                          },
                        );

                        tx.executeSql(
                          'SELECT * FROM walkin_items', // Replace 'users' with your table name
                          [],
                          (txObj, resultSet) => {
                            const data: Array<{[key: string]: any}> = [];
                            for (let i = 0; i < resultSet.rows.length; i++) {
                              data.push(resultSet.rows.item(i));
                            }
                            console.log('Data:', data);

                            // Now get the count
                            tx.executeSql(
                              'SELECT COUNT(*) AS count FROM walkin_items', // Replace 'orders' with your table name
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

                      const printReceipt = async () => {
                        const selectedMenuItems = syncedMenuItems.filter(
                          item => selectedItems[item?.id],
                        );
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
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>Order ID:</strong> NV${Math.floor(Math.random() * 51)}</p>
    </div>

    <div class="section">
      <div class="items-header">List of Items</div>
      <div class="row">
        <span class="label">Items</span>
        <span class="value">Qty</span>
      </div>
      ${selectedMenuItems
        .map(item => {
          const quantity = quantities[item?.id] || item?.minQuantity || 1;
          return `
          <div class="row">
            <span class="label">${item?.itemName}</span>
            <span class="value">${quantity}</span>
          </div>`;
        })
        .join('')}
      <div class="total-line"></div>
      <div class="total">
        <span>Total Amount</span>
        <span>₹${totalPrice}</span>
      </div>
    </div>
  </body>
</html>
`;

                        try {
                          await RNPrint.print({html: printContent});
                          setPhoneNumber('');
                          setQuantities(
                            syncedMenuItems.reduce((acc, item) => {
                              acc[item?.id] = item?.minQuantity || 1;
                              return acc;
                            }, {}),
                          );
                          Alert.alert(
                            'Success',
                            'Receipt printed and data reset.',
                            [
                              {
                                text: 'OK',
                                onPress: () =>
                                  navigation.navigate(
                                    'AdminDashboard' as never,
                                  ),
                              },
                            ],
                          );
                        } catch (error) {
                          Alert.alert('Error', 'Failed to print the receipt.');
                        }
                      };

                      await printReceipt();
                    } catch (err) {
                      console.error('Error saving or printing:', err);
                      Alert.alert('Error', 'Failed to save or print');
                    }
                  }}>
                  <Text style={styles.saveButtonText}>
                    Save and Print Receipt
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : showMenuDetails ? (
        renderMenuDetails()
      ) : (
        renderMenuList()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  syncButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuItemCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemPrice: {
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityButton: {
    backgroundColor: '#E5E7EB',
    padding: 8,
    borderRadius: 4,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneNumberContainer: {
    marginTop: 20,
  },
  phoneNumberLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  phoneNumberInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#1F2937',
    fontSize: 16,
  },
  header: {
    marginTop: 50,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dateHeader: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    marginHorizontal: '1.5%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noMenuText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
  menuDetailsHeader: {
    padding: 16,
    paddingTop: 80,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  menuDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  timingContainer: {
    backgroundColor: '#E5E7EB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  timingText: {
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 2,
  },
  menuItemsContainer: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  menuItem: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  noImage: {
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  noImageText: {
    color: '#6B7280',
    fontSize: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 8,
  },
  quantityRange: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  addToCartButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
    opacity: 0.5,
  },
});

export default MenuScreenNew;

function loadDataFromDatabase() {
  throw new Error('Function not implemented.');
}
