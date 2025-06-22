export interface MenuItem {
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
  
  export interface MenuData {
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
      defaultStartTime?: number;
      defaultEndTime?: number;
      status: string;
    };
    Payment: { cartId: number }; // Add the Payment route with its parameters

  }
  
  export interface CartItem {
    id: number;
    cartId: number;
    itemId: string | number;
    quantity: number;
    price: number;
    total: number;
    item: {
      id: number | string;
      name: string;
      description: string;
      type: string;
      image: string;
      quantity: number;
      quantityUnit: string;
    };
  }
  
  export interface CartData {
    id: number;
    totalAmount: number;
    cartItems: CartItem[];
    menuConfiguration: {
      name: string;
    };
  }
  
  export interface CartItemsState {
    [key: string]: {
      quantity: number;
      cartItemId: number;
    };
  }