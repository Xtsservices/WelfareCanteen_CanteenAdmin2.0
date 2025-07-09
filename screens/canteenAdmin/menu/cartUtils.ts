import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartData, CartItem } from './types';

// Fetch cart data from the API
export const fetchCartData = async (): Promise<CartData | null> => {
  try {
    const token = await AsyncStorage.getItem('authorization');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('http://192.168.1.20:3002/api/cart/getCart', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });

    const data = await response.json();
    if (data && data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching cart data:', error);
    return null;
  }
};

// Add an item to the cart
export const addItemToCart = async (
  itemId: number,
  menuId: number | undefined,
  menuConfigurationId: number | undefined,
  quantity: number,
  canteenId: number | undefined
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('authorization');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('http://192.168.1.20:3002/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        itemId,
        quantity,
        menuId,
        menuConfigurationId,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update the quantity of a cart item
export const updateCartItemQuantity = async (
  cartId: number,
  cartItemId: number,
  quantity: number
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('authorization');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('http://192.168.1.20:3002/api/cart/updateQuantity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        cartId,
        cartItemId,
        quantity,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

// Remove an item from the cart
export const removeCartItem = async (
  cartId: number,
  cartItemId: number
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('authorization');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('http://192.168.1.20:3002/api/cart/removeItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        cartId,
        cartItemId,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};

// Find a cart item by item ID
export const findCartItemByItemId = (
  cartData: CartData | null,
  itemId: number
): CartItem | undefined => {
  if (!cartData || !cartData.cartItems) return undefined;
  return cartData.cartItems.find((item: any) => item.itemId === itemId);
};

// Format time from timestamp
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format date for display
export const formatDateDisplay = (dateString: string): string => {
  const [day, month, year] = dateString.split('-');
  const date = new Date(`${year}-${month}-${day}`);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};