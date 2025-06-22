import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Dimensions,
  Image,
  AppStateStatus,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { CartData, CartItemsState, MenuItem, MenuItemDetailsScreenRouteProp } from './types';
import {
  formatTime,
  fetchCartData,
} from './cartUtils';
import { MenuItemDetailsProps } from './types';
import { addItemToCart, updateCartItemQuantity, removeCartItem, findCartItemByItemId } from '../../services/cartHelpers';
import { initializeDatabase } from '../../offline/database';
import { getMenuItemsByIdOffline } from '../../offline/offlineApis/menuOfflineApis';
import { getMenuItemsByMenuId } from '../../offline/models/menuItems';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = width >= 768 ? 3 : 1;
const ITEM_MARGIN = 12;
const ITEM_WIDTH = (width - (ITEM_MARGIN * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

const MenuItemDetails: React.FC<MenuItemDetailsProps> = ({ navigation }) => {
  const route = useRoute<MenuItemDetailsScreenRouteProp>();
  const { menuId } = route.params;
  const [menuDetails, setMenuDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [cartItems, setCartItems] = useState<CartItemsState>({});
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [cartUpdated, setCartUpdated] = useState(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDatabase();
        setIsDbInitialized(true);
        getOfflineMenuDetails();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Function to check network connectivity using fetch
  const checkNetworkConnectivity = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal
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
      setIsOffline(true);
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
    const appStateSubscription = AppState.addEventListener('change', appStateHandler);
    // Clean up
    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, []);


  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (menuId && isMounted) {
        try {
          setLoading(true);
          if (isOffline) {
            await getOfflineMenuDetails();
          } else {
            await fetchMenuDetails();
          }
        } catch (error) {
          console.error('Error in initial fetch:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [menuId]);

  useEffect(() => {
    getOfflineMenuDetails();
  }, [isOffline])

  // Fetch cart data when screen is focused or cart updated
  useFocusEffect(
    React.useCallback(() => {
      const getCartData = async () => {
        try {
          const data = await fetchCartData();
          setCartData(data);
          const cartItemsMap: CartItemsState = {};
          if (data && data.cartItems && Array.isArray(data.cartItems)) {
            data.cartItems.forEach((cartItem: any) => {
              const itemIdKey = String(cartItem.itemId);
              cartItemsMap[itemIdKey] = {
                quantity: cartItem.quantity,
                cartItemId: cartItem.id,
              };
            });
          }
          setCartItems(cartItemsMap);
        } catch (err) {
          console.error('Error fetching cart data:', err);
        }
      };

      getCartData();
    }, [cartUpdated])
  );

  const fetchMenuDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authorization');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(
        `https://server.welfarecanteen.in/api/menu/getMenuById?id=${menuId}`,
        {
          method: 'GET',
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();
      if (data?.data) {
        setMenuDetails(data.data);
        setError(null);
      } else {
        setError('Menu details not found');
      }
    } catch (error) {
      console.error('Error fetching menu details:', error);
      setError('Failed to load menu details');
    } finally {
      setLoading(false);
    }
  };

  const getOfflineMenuDetails = async () => {
    console.log(menuId, 'menuId---getOfflineMenuDetails');
    const offlineData = await getMenuItemsByIdOffline(menuId ? menuId : 1);
    
    console.log(offlineData, 'offlineData---getOfflineMenuDetails');

    if (offlineData) {
      setMenuDetails(offlineData?.data);
      setError(null);
    } else {
      setError('Menu details not found');
    }
  }

  const handleAddToCart = async (item: any) => {
    try {
      setUpdateLoading(item?.id);
      const minQty = 1;
      const result = await addItemToCart(
        item?.item?.id,
        item?.menuId || '',
        menuDetails?.menuConfigurationId || '',
        minQty,
      );

      // Refresh cart data
      const updatedCartData = await fetchCartData();
      setCartData(updatedCartData);

      // Find the cart item that was just added
      const cartItem = findCartItemByItemId(updatedCartData, item?.item?.id);
      console.log(cartItem, 'cartItem---added-to-cart');

      if (cartItem) {
        // Update cart items state
        setCartItems(prev => ({
          ...prev,
          [item.item.id]: {
            quantity: cartItem?.quantity,
            cartItemId: cartItem?.id,
          },
        }));
      }

      setUpdateLoading(null);
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Error adding to cart:', err);
      setUpdateLoading(null);
    }
  };

  // Increase item quantity
  const handleIncreaseQuantity = async (item: any) => {
    setCartUpdated(true);
    try {
      setUpdateLoading(item.id);
      const cartItemId22 = cartData?.cartItems.find(
        cartItem => cartItem.itemId === item.item.id,
      )?.item?.id;
      // we get cartItemId from cardData only ###
      const itemId = item.item.id;
      const itemKey = String(itemId);
      // Check if item exists in cart
      if (!cartItems[itemKey]) {
        await handleAddToCart(item);
        return;
      }

      const currentQty = cartItems[itemKey]?.quantity;
      const maxQty = Number(item.maxQuantity) || 10;

      if (currentQty >= maxQty) {
        Alert.alert('Maximum quantity reached');
        setUpdateLoading(null);
        return;
      }

      const newQty = currentQty + 1;
      const cartItemId = cartItems[itemKey].cartItemId;
      const body = {
        cartId: cartData?.id,
        cartItemId: cartItemId22,
        quantity: newQty,
      };
      console.log(body, 'body---increase-quantity');
      const cartId = cartData?.id ? cartData?.id : '';
      await updateCartItemQuantity(
        cartId,
        parseInt(cartItemId22?.toString() || '0'),
        newQty,
      );

      // Refresh cart data
      const updatedCartData = await fetchCartData();
      setCartData(updatedCartData);

      // Update cart items state
      setCartItems(prev => ({
        ...prev,
        [itemKey]: {
          ...prev[itemKey],
          quantity: newQty,
        },
      }));

      setUpdateLoading(null);
    } catch (err) {
      setError('Failed to update quantity');
      console.error('Error updating quantity:', err);
      setUpdateLoading(null);
    }
  };

  // Decrease item quantity
  const handleDecreaseQuantity = async (item: any) => {
    try {
      setUpdateLoading(item.id);

      const itemId = item.item.id;
      const itemKey = String(itemId);
      console.log(itemKey, 'itemKey---decrease-quantity');


      // Check if item exists in cart
      if (!cartItems[itemKey]) {
        setUpdateLoading(null);
        return;
      }

      const currentQty = cartItems[itemKey]?.quantity;
      const minQty = Number(item.minQuantity) || 1;
      const cartItemId = cartItems[itemKey]?.cartItemId;
      console.log(cartItemId, 'cartItemId---decrease-quantity');


      if (currentQty <= minQty) {
        // Remove item from cart
        await removeCartItem(cartData?.id || 0, cartItemId);

        // Refresh cart data
        const updatedCartData = await fetchCartData();
        setCartData(updatedCartData);

        // Update cart items state
        setCartItems(prev => {
          const updated = { ...prev };
          delete updated[itemKey];
          return updated;
        });
      } else {
        // Decrease quantity
        const newQty = currentQty - 1;
        const body = {
          cartId: cartData?.id,
          cartItemId: cartItemId,
          quantity: newQty,
        }
        console.log(body, 'body---decrease-quantity');


        // await updateCartItemQuantity(cartData?.id, cartItemId, newQty);

        // Refresh cart data
        const updatedCartData = await fetchCartData();
        setCartData(updatedCartData);

        // Update cart items state
        setCartItems(prev => ({
          ...prev,
          [itemKey]: {
            ...prev[itemKey],
            quantity: newQty,
          },
        }));
      }

      setUpdateLoading(null);
    } catch (err) {
      setError('Failed to update quantity');
      console.error('Error updating quantity:', err);
      setUpdateLoading(null);
    }
  };

  const renderHeader = () => {
    if (!menuDetails) return null;

    return (
      <View style={styles.headerContent}>
        <Text style={styles.menuTitle}>{menuDetails.name}</Text>
        <Text style={styles.menuDescription}>{menuDetails.description}</Text>

        <View style={styles.timingContainer}>
          <Text style={styles.timingTitle}>Menu Time:</Text>
          <Text style={styles.timingText}>
            {formatTime(menuDetails?.defaultStartTime)} - {formatTime(menuDetails?.defaultEndTime)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0014A8" />
        <Text style={styles.loadingText}>Loading menu items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMenuDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderImage = (item: any) => {
    if (item?.item?.image) {
      return (
        <Image
          source={{
            uri: `data:image/png;base64,${item?.item?.image}`
          }}
          style={menuCardStyles?.image}
          resizeMode="cover"
          alt='Item Image'
        />
      );
    }
    return (
      <View style={[menuCardStyles.image, menuCardStyles.noImage]}>
        <Text style={menuCardStyles.noImageText}>Item Image</Text>
      </View>
    );
  };

  const renderVegIcon = (item: any) => {
    if (!item?.menuItemItem?.type) return null;

    return (
      <Image
        source={{
          uri: item.menuItemItem.type.toLowerCase() === 'veg'
            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Veg_symbol.svg/1200px-Veg_symbol.svg.png'
            : 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Non_veg_symbol.svg/1200px-Non_veg_symbol.svg.png'
        }}
        style={menuCardStyles.vegIcon}
      />
    );
  };

  const handleGotocart = () => {
    navigation.navigate('CartScreen' as never);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text>
            back
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={menuDetails?.menuItems || []}
        ListHeaderComponent={renderHeader}
        numColumns={COLUMN_COUNT}
        columnWrapperStyle={COLUMN_COUNT > 1 ? styles.columnWrapper : undefined}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const itemId = String(item?.item?.id);
          const itemInCart = cartItems[itemId];

          const quantity = itemInCart?.quantity || 0;
          console.log(item,"item---menuItemDetails");
          

          return (
            <View style={[styles.itemContainer, { width: ITEM_WIDTH }]}>
              <View style={menuCardStyles.card}>
                {/* {item?.item?.image && renderImage(item)} */}
                <View style={menuCardStyles.contentContainer}>
                  <View style={menuCardStyles.nameContainer}>
                    <Text style={menuCardStyles.name}>{item?.item?.name}</Text>
                    {renderVegIcon(item)}
                  </View>
                  <Text style={menuCardStyles.description} numberOfLines={2}>
                    {item?.item?.description}
                  </Text>
                  <Text style={menuCardStyles.price}>
                    {item?.item?.pricing?.currency} {item?.item?.pricing?.price}
                  </Text>

                  {updateLoading === itemId ? (
                    <ActivityIndicator size="small" color="#0014A8" style={menuCardStyles.loader} />
                  ) : quantity === 0 ? (
                    <TouchableOpacity
                      style={menuCardStyles.addButton}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Text style={menuCardStyles.addButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={menuCardStyles.quantityControlRow}>
                      <TouchableOpacity
                        style={menuCardStyles.quantityButton}
                        onPress={() => handleDecreaseQuantity(item)}>
                        <Text style={menuCardStyles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={menuCardStyles.quantityText}>
                        {quantity}
                      </Text>
                      <TouchableOpacity
                        style={menuCardStyles.quantityButton}
                        onPress={() => handleIncreaseQuantity(item)}>
                        <Text style={menuCardStyles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )
        }}
      />

      {/* <TouchableOpacity>
        <Text style={styles.loadingText}>Loading menu items...</Text>
      </TouchableOpacity> */}

      {Object.keys(cartItems).length > 0 && (
        <TouchableOpacity
          style={styles.goToCartButton}
          onPress={handleGotocart}
        >
          <Text style={styles.goToCartButtonText}>Go to Cart</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

export default MenuItemDetails;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#0014A8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerContent: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: ITEM_MARGIN,
  },
  menuTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  timingContainer: {
    padding: 16,
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
  },
  timingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  timingText: {
    fontSize: 16,
    color: '#0014A8',
  },
  listContent: {
    padding: ITEM_MARGIN,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: ITEM_MARGIN,
  },
  itemContainer: {
    marginBottom: ITEM_MARGIN,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0014A8',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goToCartButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: [{ translateX: -100 }],
    backgroundColor: '#0014A8',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    width: 200,
  },
  goToCartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

const menuCardStyles = StyleSheet.create({
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#6B7280',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  contentContainer: {
    padding: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  vegIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#0014A8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    marginVertical: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 4,
  },
})