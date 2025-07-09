import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from './navigationTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DownNavbar from './downNavbar';
import {SettingsScreenuri, menuItemUri} from './imageUris/uris';
import {MenuData, MenuItem, CartData, CartItemsState} from './types/cartTypes';
import {
  fetchCartData,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  findCartItemByItemId,
} from './services/cartHelpers';

type MenuItemsByMenuIdScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MenubyMenuId'
>;

type MenuItemsByMenuIdScreenRouteProp = RouteProp<
  RootStackParamList,
  'MenubyMenuId'
>;

const MenuItemsByMenuIdScreenNew = () => {
  const navigation = useNavigation<MenuItemsByMenuIdScreenNavigationProp>();
  const route = useRoute<MenuItemsByMenuIdScreenRouteProp>();
  const [menuData, setMenuData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [cartItems, setCartItems] = useState<CartItemsState>({});
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [cartUpdated, setCartUpdated] = useState(false);
  const {menuId} = route.params;

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const token = await AsyncStorage.getItem('authorization');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch(
          `https://server.welfarecanteen.in/api/menu/getMenuById?id=${menuId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: token,
            },
          },
        );

        const data = await response.json();

        if (data && data.data) {
          if (data.data.menuItems && Array.isArray(data.data.menuItems)) {
            const updatedMenuItems = data.data.menuItems.map(
              (item: MenuItem) => ({
                ...item,
                minQuantity: item.minQuantity,
                maxQuantity: item.maxQuantity,
              }),
            );
            setMenuData({
              ...data.data,
              menuItems: updatedMenuItems,
            });
          } else {
            setMenuData(data.data);
          }
        } else {
          setError('No menu data found');
        }
      } catch (err) {
        setError('Failed to fetch menu data');
        console.error('Error fetching menu data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [menuId]);

  // console.log(cartData, 'cartData---menuItemsByMenuIdScreenNew');

  useFocusEffect(
    React.useCallback(() => {
      const getCartData = async () => {
        try {
          const data = await fetchCartData();
          setCartData(data);

          // Initialize cartItems state from cart data
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

          console.log(
            cartItemsMap,
            'cartItemsMap---menuItemsByMenuIdScreenNew',
          );

          setCartItems(cartItemsMap);
        } catch (err) {
          // console.error('Error fetching cart data:', err);
        }
      };

      getCartData();
    }, [cartUpdated, route]),
  );

  const addToCart = async (item: any, menudata: any) => {
    console.log('Adding to cart:', item);
    console.log('menudata:', menudata);
    try {
      setUpdateLoading(item.id);
      const minQty = 1;

      const result = await addItemToCart(
        item.item.id,
        // menuData?.id || '',
        item?.menuId || '',
        menuData?.menuConfigurationId || '',
        minQty,
      );

      // Refresh cart data
      const updatedCartData = await fetchCartData();
      setCartData(updatedCartData);

      // Find the cart item that was just added
      const cartItem = findCartItemByItemId(updatedCartData, item.item.id);
      console.log(cartItem, 'cartItem---added-to-cart');

      if (cartItem) {
        // Update cart items state
        setCartItems(prev => ({
          ...prev,
          [item.item.id]: {
            quantity: cartItem.quantity,
            cartItemId: cartItem.id,
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

  // Increment quantity
  const increaseQuantity = async (item: MenuItem) => {
    setCartUpdated(true);
    try {
      setUpdateLoading(item.id);
      console.log(item, 'itemm---------increasingg');
      const cartItemId22 = cartData?.cartItems.find(
        cartItem => cartItem.itemId === item.item.id,
      )?.item?.id;
      console.log(cartItemId22, 'cartItemId---increase-quantity');
      // we get cartItemId from cardData only ###

      const itemId = item.item.id;
      const itemKey = String(itemId);
      console.log(cartItems, 'cartItems---i');

      // Check if item exists in cart
      if (!cartItems[itemKey]) {
        await addToCart(item, menuData);
        return;
      }

      const currentQty = cartItems[itemKey]?.quantity;
      console.log(currentQty, 'currentQty---====');

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

      //   {
      //     "cartId":3,"cartItemId":2,"quantity":5
      // }
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

  // console.log(cartUpdated, 'cartUpdated---menuItemsByMenuIdScreenNew');

  // Decrement quantity
  const decreaseQuantity = async (item: MenuItem) => {
    try {
      setUpdateLoading(item.id);

      const itemId = item.item.id;
      const itemKey = String(itemId);

      // Check if item exists in cart
      if (!cartItems[itemKey]) {
        setUpdateLoading(null);
        return;
      }

      const currentQty = cartItems[itemKey].quantity;
      const minQty = Number(item.minQuantity) || 1;
      const cartItemId = cartItems[itemKey].cartItemId;

      if (currentQty <= minQty) {
        // Remove item from cart
        await removeCartItem(cartData?.id || 0, cartItemId);

        // Refresh cart data
        const updatedCartData = await fetchCartData();
        setCartData(updatedCartData);

        // Update cart items state
        setCartItems(prev => {
          const updated = {...prev};
          delete updated[itemKey];
          return updated;
        });
      } else {
        // Decrease quantity
        const newQty = currentQty - 1;

        await updateCartItemQuantity(cartData?.id || 0, cartItemId, newQty);

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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading menu items...</Text>
        <ActivityIndicator size="large" color="#0014A8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!menuData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No menu data available</Text>
      </View>
    );
  }
  // console.log(menuData, 'menuData-mapping--menuItemsByMenuIdScreenNew');

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Image
            source={{
              uri: 'https://www.joinindiannavy.gov.in/images/octaginal-crest.png',
            }}
            style={styles.logo}
          />
        </Text>
        <View style={styles.headerIcon}>
          <TouchableOpacity style={styles.iconborder}>
            <Image
              source={{
                uri: 'https://creazilla-store.fra1.digitaloceanspaces.com/icons/3235242/wallet-icon-sm.png',
              }}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconborder}
            onPress={() => navigation.navigate('SettingsScreen')}>
            <Image
              source={{
                uri: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png',
              }}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {menuData?.menuItems?.map((item: any) => {
            console.log(item, 'mapping--item-menudata');
            return (
              <View key={item.id} style={styles.menuCardRow}>
                {/* Image on the left */}
                <Image
                  source={{
                    uri: item?.item?.image
                      ? `data:image/png;base64,${item?.item?.image}`
                      : 'https://via.placeholder.com/120',
                  }}
                  style={styles.menuItemImage}
                />
                {/* Details on the right */}
                <View style={styles.menuCardDetails}>
                  <View style={styles.menuItemHeaderRow}>
                    <Text style={styles.menuItemName}>{item?.item?.name}</Text>
                    <Text style={styles.menuItemPrice}>
                      ₹{item.item.pricing.price}
                    </Text>
                  </View>
                  <View style={styles.vegIconRow}>
                    <Image
                      source={{
                        uri:
                          item?.item?.type?.toLowerCase() === 'veg'
                            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Veg_symbol.svg/1200px-Veg_symbol.svg.png'
                            : 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Non_veg_symbol.svg/1200px-Non_veg_symbol.svg.png',
                      }}
                      style={{width: 18, height: 18, marginRight: 8}}
                    />
                    <Text style={styles.menuItemType}>
                      {item?.item?.type?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.menuItemDescription}>
                    {item.item.description}
                  </Text>
                  <View style={styles.addButtonContainerRow}>
                    {updateLoading === item.id ? (
                      <ActivityIndicator size="small" color="#0014A8" />
                    ) : !cartItems[item.item.id] ? (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addToCart(item, menuData)}>
                        <Text style={styles.addButtonText}>ADD</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.quantityControlRow}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => decreaseQuantity(item)}>
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>
                          {cartItems[item.item.id]?.quantity || 0}
                        </Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => increaseQuantity(item)}>
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
        {/* Go to Cart Button */}
        {Object.keys(cartItems).length > 0 && (
          <TouchableOpacity
            style={styles.goToCartButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CartPage' as never)}>
            <Text style={styles.goToCartButtonText}>Go to Cart</Text>
          </TouchableOpacity>
        )}
        <DownNavbar />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  scrollContainer: {
    paddingBottom: 80, // Space for navbar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0014A8',
    paddingVertical: 20,
    padding: 30,
    marginTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
  iconborder: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 7,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCardRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  menuCardDetails: {
    flex: 1,
    flexDirection: 'column',
  },
  menuItemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  vegIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  menuItemType: {
    fontSize: 12,
    color: '#888',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  addButtonContainerRow: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  quantityControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 4,
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
  goToCartButton: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    backgroundColor: '#0014A8',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  goToCartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loadingText: {
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MenuItemsByMenuIdScreenNew;
