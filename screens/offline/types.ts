export interface MenuData {
    id?: number;
    name: string;
    description?: string | null;
    startTime: number | string;
    endTime: number | string;
    status?: string;
    canteenId: number;
    menuConfigurationId?: number | null;
    createdById?: number | null;
    updatedById?: number | null;
    createdAt?: number;
    updatedAt?: number;
    is_synced?: number;
}

export interface SQLiteResult {
    rows: {
        length: number;
        item: (index: number) => any;
    };
}

export interface walkinData {
    id?: number;
  customerName: string;
  contactNumber?: string;
  numberOfPeople?: number;
  tableNumber?: string;
  orderStatus?: string;
  totalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  finalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  createdById: number;
  updatedById?: number;
  createdAt?: number;
  updatedAt?: number;
  items: Array<{
    id?: number;
    menuItemId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    specialInstructions?: string;
    status?: string;
    createdAt?: number;
  }>;
}