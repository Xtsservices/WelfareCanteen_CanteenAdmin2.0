export interface OrderItem {
    id: number;
    orderId: number;
    itemId: number;
    quantity: number;
    price: number;
    total: number;
    createdAt: number;
    updatedAt: number;
    createdById: number;
    updatedById: number | null;
  }
  
  export interface Payment {
    id: number;
    orderId: number;
    userId: number;
    paymentMethod: string;
    transactionId: string | null;
    amount: number;
    gatewayPercentage: number;
    gatewayCharges: number;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: number;
    updatedAt: number;
    createdById: number;
    updatedById: number;
  }
  
  export interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    canteenId: number;
    menuConfigurationId: number;
    qrCode: string;
    createdAt: number;
    updatedAt: number;
    createdById: number;
    updatedById: number | null;
    orderItems: OrderItem[];
    payment: Payment;
  }