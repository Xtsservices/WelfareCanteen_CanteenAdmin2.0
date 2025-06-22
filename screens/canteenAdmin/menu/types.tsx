// navigation/types.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export interface MenuScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Menu'>;
}

export type ScreenParams = {
  shouldRefresh: boolean;
  // add more fields as needed
};


export type RootStackParamList = {
  Home: undefined;
  Menu: undefined;
  MenuItemDetails: { menuId: number | string };
  Cart: undefined;
  MenuDetailsScreen: { menuId: number };
  CartScreen: undefined;
  Payment: {
    cartId?: string;
    totalAmount?: number;
  };
  "[menuId]": undefined;
  MenuScreenNew: undefined;
  OrderDetails: { orderId: string };
  ayment: { cartId: string; totalAmount: number; cartItems?: CartItem[] };
  AdminDashboard: { shouldRefresh?: boolean };
};

export type PaymentScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Payment'>;
  route: RouteProp<RootStackParamList, 'Payment'>;
};


export type MenuItemDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MenuItemDetails'
>;

export type MenuItemDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'MenuItemDetails'
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

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

export interface CartItem {
  id: number;
  itemId: number;
  quantity: number;
  item?: CartMenuItem;
  total?: any,
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

// --------------------------------------



export type MenuItemDetailsProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MenuItemDetails'>;
};

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

// -----------------------