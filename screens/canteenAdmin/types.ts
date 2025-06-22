import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// 1. First define your root stack param list with all screens
export type RootStackParamList = {
  Home: undefined;
  Menu: undefined;
  Cart: undefined;
  MenuScreenNew: undefined;
  index: undefined;
  Payment: {
    cartId?: string;
    totalAmount?: number;
  };  "[menuId]": undefined;
  walkin: undefined;
  Breakfast: undefined;
  MenuItemDetails: { menuId: string | number };
  Order: { orderId: number };
  OrderDetails: { orderId: string };
  AdminDashboard: undefined; // Add this line to define 'AdminDashboard'

};

// 2. Define navigation props for each screen
export type MenuItemDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MenuItemDetails'
>;

export type MenuItemDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'MenuItemDetails'
>;

export type CartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Cart'
>;

// 3. Declare global types for useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

// 4. Define your cart screen props properly
export interface cartScreenProps {
  navigation: {
    navigate: (route: string, params?: { cartId?: string; totalAmount?: number; cartItems?: { id: number; name: string; quantity: number; price: number; total: number }[] }) => void;
};}

// 5. Menu Types (keep your existing interfaces)
export interface MenuData {
  [date: string]: {
    [category: string]: any[];
  };
}

export interface Pricing {
  id: number;
  price: number;
  currency: string;
}

export interface MenuItemWithQuantity {
  id: number;
  menuItemItem: MenuItem;
  minQuantity: number;
  maxQuantity: number;
  item: any;
  status?: string | undefined;
}

export interface MenuConfiguration {
  id: number;
  name: string;
  defaultStartTime?: number;
  defaultEndTime?: number;
}

export interface MenuDetails {
  id?: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  menuMenuConfiguration: MenuConfiguration;
  menuItems: MenuItemWithQuantity[];
  canteenId: number;
  menuConfigurationId?: number;
}

// 6. Cart Types (keep your existing interfaces)

// Define OrderDetails interface
export interface OrderDetails {
  id: number;
  items: CartItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface CartItem {
  id: number;
  itemId: number;
  quantity: number;
  item?: CartMenuItem;
  total?: any;
  price?: number;
}

export interface CartData {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  canteenId: number;
  menuConfigurationId: number;
  menuId: number;
  cartItems: CartItem[];
  updatedAt: string;
  createdAt: string;
}

export interface CartItemsState {
  [key: string]: {
    quantity: number;
    cartItemId: number;
  };
}

export interface CartResponse {
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

// 7. Menu Item Types (keep your existing interfaces)
export interface MenuItem {
  id: number;
  item: {
    minQuantity: any;
    maxQuantity: any;
    pricing: any;
    id: string;
    name: string;
    description: string;
    image?: string;
    quantity: number;
    quantityUnit: string;
    type: string;
    status: string;
  };
  maxQuantity: number;
  minQuantity: number;
  status: string;
  image?: string;
}

export interface CartMenuItem {
  id?: number;
  item?: {
    minQuantity: any;
    maxQuantity: any;
    pricing: any;
    id: string;
    name: string;
    description: string;
    image?: string;
    quantity: number;
    quantityUnit: string;
    type: string;
    status: string;
  };
  maxQuantity?: number;
  minQuantity?: number;
  status?: string;
  image?: string;
  name?: string;
  pricing?: any;
  type?: string;
}

// 8. Payment Types
export interface PaymentResponse {
  order: {
    id: number;
    totalAmount: number;
    status: string;
  };
  payment: {
    paymentMethod: string;
    amount: number;
    gatewayCharges: number;
    totalAmount: number;
    currency: string;
  };
  qrCode: string;
}

export type PaymentRouteParams = {
  orderId: number;
};