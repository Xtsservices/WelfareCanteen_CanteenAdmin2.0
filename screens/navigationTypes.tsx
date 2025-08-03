
export interface WorkerUser {
  dob: number;
  aadhar: number;
  name: string;
  mobile: string;
  gender: string;
  email: string;
  address: string;
  adminName: string;
  adminId: number;
}

export interface CartItem {

  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutCartItem {
  code: string;
  item: string;
  qty: number;
  total: number;
}

export type RootStackParamList = {
  MenuDetails: {
    menuId: string;
    menuName: string;
    menuDescription: string;
    menuPrice: number;
    menuCurrency: string;
  };
  walkins:undefined
  Walkin: undefined;
  SettingsScreen: undefined;
  LoginScreen: undefined;
  ProfileScreen: undefined;
  SelectCanteen: undefined;
  NotificationsScreen: undefined;
  WalletScreen: undefined;
  OrderHistory: undefined;
  BluetoothControl: undefined;
  AdminDashboard: undefined;
  MenuScreenNew: undefined;
  Breakfast: undefined;
  MenuDetailsScreen: { menuId: number | string };
  MenuCard: undefined;
  CartScreen: undefined;
  "[menuId]": undefined;
  breakfast: undefined;
  OrderDetails: { orderId: string };
  MenuItemDetails: {
    menuId: number;
  };
  Users: { newUser?: { name: string; mobile: string; position?: string; address?: string } };

  WorkerProfile: {

    user: any
  };
  AddUser: { onAddUser: (user: any) => void };
  Menu: undefined;
  Checkout: {
    cart: CheckoutCartItem[];
    total: number;
  };
  Home: undefined;
  Login: undefined;
  Dashboard: { canteenId: string };
  CartPage: undefined;
  OrderPlaced: undefined;
  ViewOrders: undefined;
  PaymentMethod: undefined;
  VerifyToken: undefined;
  MenubyMenuId: { menuId: string };
  orderhistory: undefined;
  MenuItemsByMenuId: { menuId: string };
  Orders: undefined;
  CallCenter: undefined;
  Payment: {
    cartId?: string;
    totalAmount?: number;
  };

  MenuTestScreen: undefined;
  PrinterConfiguration: undefined;
  PrinterDriverInstaller: undefined;
  SplashScreen: undefined;
};
