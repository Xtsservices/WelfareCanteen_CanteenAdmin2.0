import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from './navigationTypes';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DownNavbar from './downNavbar';
import { SettingsScreenuri ,menuItemUri} from './imageUris/uris';

type MenuItemsByMenuIdScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MenubyMenuId'
>;

import {RouteProp} from '@react-navigation/native';

type MenuItemsByMenuIdScreenRouteProp = RouteProp<
  RootStackParamList,
  'MenubyMenuId'
>;

interface MenuItem {
  id: string;
  item: {
    minQuantity: any;
    maxQuantity: any;
    pricing: any;
    id: string;
    name: string;
    description: string;
    image: string;
    quantity: number;
    quantityUnit: string;
    type: string;
    status: string;
  };
  maxQuantity: number;
  minQuantity: number;
  status: string;
}

interface MenuData {
  id: string;
  name: string;
  description: string;
  menuItems: MenuItem[];
  startTime: number;
  endTime: number;
  status: string;
  menuConfiguration: {
    id: string;
    name: string;
    defaultStartTime: number;
    defaultEndTime: number;
    status: string;
  };
}

const MenuItemsByMenuIdScreen = () => {
  const navigation = useNavigation<MenuItemsByMenuIdScreenNavigationProp>();
  const route = useRoute<MenuItemsByMenuIdScreenRouteProp>();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cartId, setCartId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [cartData, setCartData] = useState<any>(null); // Adjust type as needed
  const [cartItemIds, setCartItemIds] = useState<Record<string, number>>({});

  const {menuId} = route.params;
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const token = await AsyncStorage.getItem('authorization');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await axios.get(
          `http://192.168.1.20:3002/api/menu/getMenuById?id=${menuId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: token,
            },
          },
        );

        if (response.data && response.data.data) {
          setMenuData(response.data.data);
          console.log('Menu data fetched successfully:', response.data.data);
          if (
            response.data.data.menuItems &&
            Array.isArray(response.data.data.menuItems)
          ) {
            const updatedMenuItems = response.data.data.menuItems.map(
              (item: MenuItem) => ({
                ...item,
                minQuantity: item.minQuantity,
                maxQuantity: item.maxQuantity,
              }),
            );
            setMenuData({
              ...response.data.data,
              menuItems: updatedMenuItems,
            });
          } else {
            setMenuData(response.data.data);
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

  useEffect(() => {
    const loadCartId = async () => {
      try {
        const storedCartId = await AsyncStorage.getItem('cartId');
        if (storedCartId) {
          setCartId(storedCartId);
        }
      } catch (error) {
        console.error('Failed to load cartId from storage:', error);
      }
    };
    loadCartId();
  }, []);

  const addToCart = async (item: MenuItem) => {
    try {
      const token = await AsyncStorage.getItem('authorization');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const canteenId = await AsyncStorage.getItem('canteenId');
      const minQty = Number(item.minQuantity) || 1;

      const payload = {
        itemId: Number(item.item.id),
        quantity: minQty,
        menuId: Number(menuData?.id),
        canteenId: Number(canteenId),
        menuConfigurationId: Number(menuData?.menuConfiguration.id),
      };

      const response = await axios.post(
        'http://192.168.1.20:3002/api/cart/add',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: token,
          },
        },
      );
      console.log(response, 'response');

      const cartDataResponse = await axios.get(
        'http://192.168.1.20:3002/api/cart/getCart',
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: token,
          },
        },
      );

      console.log(cartDataResponse, 'cartDataResponse');
      const cartItem = cartDataResponse.data.data.cartItems.find(
        (cartItem: any) => cartItem.itemId === item.item.id,
      );

      const cartId = cartItem ? cartItem.cartId : null;

      if (cartId) {
        await AsyncStorage.setItem('cartId', String(cartId));
        setCartId(String(cartId));
      }
      const itemId = cartItem.item.id;

      if (itemId) {
        await AsyncStorage.setItem('itemId', String(itemId));
        setItemId(String(itemId));
      }

      if (response.data && response.data.data) {
        const newCartId = String(response.data.data.id);
        await AsyncStorage.setItem('cartId', newCartId);
        setCartId(newCartId);

        // Update UI state
        setAddedItems(prev => ({
          ...prev,
          [item.id]: true,
        }));
        setQuantities(prev => ({
          ...prev,
          [item.id]: minQty,
        }));

        if (menuData) {
          const updatedMenuItems = menuData.menuItems.map(menuItem => {
            if (menuItem.id === item.id) {
              return {
                ...menuItem,
                item: {
                  ...menuItem.item,
                  quantity: minQty,
                },
              };
            }
            return menuItem;
          });
          setMenuData({
            ...menuData,
            menuItems: updatedMenuItems,
          });
        }
      } else {
        setError('Failed to add item to cart');
      }
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Error adding to cart:', err);
    }
  };

  // Increment quantity
  const increaseQuantity = async (item: MenuItem) => {
    try {
      const currentQty = quantities[item.id] || Number(item.minQuantity) || 1;
      const maxQty = Number(item.maxQuantity) || 99;

      if (currentQty >= maxQty) {
        Alert.alert('Maximum quantity reached');
        return;
      }

      const newQty = currentQty + 1;
      const token = await AsyncStorage.getItem('authorization');

      if (!token || !cartId) {
        setError('No authentication token or cartId found');
        return;
      }

      // Fetch the cart to get the correct cartItemId for this item
      const cartResponse = await axios.get(
        'http://192.168.1.20:3002/api/cart/getCart',
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: token,
          },
        },
      );
      const cartItem = cartResponse.data.data.cartItems.find(
        (cartItem: any) => cartItem.itemId === item.item.id,
      );
      if (!cartItem) {
        setError('Cart item not found');
        return;
      }

      const payload = {
        cartId: Number(cartId),
        cartItemId: Number(itemId),
        quantity: newQty + 1,
      };
      console.log(payload, 'payload');

      const response = await axios.post(
        'http://192.168.1.20:3002/api/cart/updateCartItem',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: token,
          },
        },
      );

      if (response.data && response.data.success) {
        setQuantities(prev => ({
          ...prev,
          [item.id]: newQty,
        }));
        console.log(response.data, 'response.data');
      }
    } catch (err) {
      setError('Failed to update quantity');
      console.error('Error updating quantity:', err);
    }
  };

  const decreaseQuantity = async (item: MenuItem) => {
    try {
      const currentQty = quantities[item.id] || Number(item.minQuantity) || 1;
      const minQty = Number(item.minQuantity) || 1;

      if (currentQty <= minQty) {
        // Remove item from cart if quantity would go below minimum
        const token = await AsyncStorage.getItem('authorization');
        if (!token || !cartId) {
          setError('No authentication token or cartId found');
          return;
        }

        const payload = {
          cartId: Number(cartId),
          cartItemId: Number(itemId),
        };

        const response = await axios.post(
          'http://192.168.1.20:3002/api/cart/removeCartItem',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: token,
            },
          },
        );

        if (response.data && response.data.success) {
          setAddedItems(prev => {
            const updated = {...prev};
            delete updated[item.id];
            return updated;
          });
          setQuantities(prev => {
            const updated = {...prev};
            delete updated[item.id];
            return updated;
          });
        } else {
          setError('Failed to remove item from cart');
        }
      } else {
        // Just decrease quantity
        const newQty = currentQty - 1;
        const token = await AsyncStorage.getItem('authorization');
        if (!token || !cartId) {
          setError('No authentication token or cartId found');
          return;
        }

        const payload = {
          cartId: Number(cartId),
          cartItemId: Number(itemId),
          quantity: newQty,
        };

        const response = await axios.post(
          'http://192.168.1.20:3002/api/cart/updateCartItem',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: token,
            },
          },
        );

        if (response.data && response.data.success) {
          setQuantities(prev => ({
            ...prev,
            [item.id]: newQty,
          }));
        } else {
          setError('Failed to update quantity');
        }
      }
    } catch (err) {
      setError('Failed to update quantity');
      console.error('Error updating quantity:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading menu items...</Text>
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

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{menuData.name}</Text>
        <View style={styles.headerIcon}>
          <TouchableOpacity style={styles.iconborder}>
            <Image
              source={{uri:menuItemUri
              }}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconborder}
            onPress={() => navigation.navigate('SettingsScreen')}>
            <Image
              source={{
                uri: SettingsScreenuri}}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {menuData.menuItems.map((item, index) => (
            <View key={item.id} style={styles.menuCardRow}>
              {/* Image on the left */}
              <Image
                source={{
                  uri: item.item.image
                    ? `data:image/png;base64,${item.item.image}`
                    : 'https://via.placeholder.com/120',
                }}
                style={styles.menuItemImage}
              />
              {/* Details on the right */}
              <View style={styles.menuCardDetails}>
                <View style={styles.menuItemHeaderRow}>
                  <Text style={styles.menuItemName}>{item.item.name}</Text>
                  <Text style={styles.menuItemPrice}>
                    ₹{item.item.pricing.price}
                  </Text>
                </View>
                <View style={styles.vegIconRow}>
                  <Image
                    source={{
                      uri:
                        item.item.type.toLowerCase() === 'veg'
                          ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Veg_symbol.svg/1200px-Veg_symbol.svg.png'
                          : 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Non_veg_symbol.svg/1200px-Non_veg_symbol.svg.png',
                    }}
                    style={{width: 18, height: 18, marginRight: 8}}
                  />
                  <Text style={styles.menuItemType}>
                    {item.item.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.menuItemDescription}>
                  {item.item.description}
                </Text>
                <View style={styles.addButtonContainerRow}>
                  {!addedItems[item.id] ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addToCart(item)}>
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
                        {quantities[item.id] || item.minQuantity}
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
          ))}
        </ScrollView>
        {/* Go to Cart Button */}
        {Object.keys(addedItems).length > 0 && (
          <TouchableOpacity style={[styles.goToCartButton]} activeOpacity={0.8}>
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
  scrollContainer: {
    paddingBottom: 80, // Space for navbar
  },
  // menuItemImage: {
  //   width: 120,
  //   height: 120,
  // },
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
  menuCard: {
    padding: 16,
    backgroundColor: '#fff',
  },
  bestsellerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bestsellerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  typeContainer: {
    marginBottom: 16,
  },
  menuItemType: {
    fontSize: 12,
    color: '#888',
  },
  addButtonContainer: {
    alignItems: 'flex-end',
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
  quantityControl: {
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
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
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
  vegIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  addButtonContainerRow: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  quantityControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 4,
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
});

export default MenuItemsByMenuIdScreen;
