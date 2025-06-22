// import { getDatabase } from '../database';

// export interface OrderItem {
//     id?: number;
//     orderId: number;
//     itemId: number;
//     quantity: number;
//     price: number;
//     total: number;
//     createdById: number;
//     updatedById?: number | null;
//     createdAt?: number;
//     updatedAt?: number;
// }

// export const createOrderItem = async (orderItem: Omit<OrderItem, 'id'>): Promise<number> => {
//     const db = getDatabase();
//     const now = Math.floor(Date.now() / 1000);

//     // Calculate total if not provided
//     const total = orderItem.total || (orderItem.price * orderItem.quantity);

//     const result: any = await db.executeSql(
//         `INSERT INTO order_items 
//     (orderId, itemId, quantity, price, total, createdById, updatedById, createdAt, updatedAt) 
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

//         [
//             orderItem.orderId,
//             orderItem.itemId,
//             orderItem.quantity,
//             orderItem.price,
//             total,
//             orderItem.createdById,
//             orderItem.updatedById || null,
//             now,
//             now
//         ]
//     );

//     if (result?.[0]?.insertId !== undefined) {
//         return result[0].insertId;
//     }
//     throw new Error('Failed to create order item');
// };

// export const getOrderItems = async (orderId?: number): Promise<OrderItem[]> => {
//     const db = getDatabase();
//     let query = 'SELECT * FROM order_items';
//     const params: any[] = [];

//     if (orderId !== undefined) {
//         query += ' WHERE orderId = ?';
//         params.push(orderId);
//     }

//     const result: any = await db.executeSql(query, params);

//     const orderItems: OrderItem[] = [];

//     // Add safety checks
//     if (result?.[0]?.rows) {
//         for (let i = 0; i < result[0].rows.length; i++) {
//             orderItems.push(result[0].rows.item(i));
//         }
//     }

//     return orderItems;
// };

// export const getOrderItemById = async (id: number): Promise<OrderItem | null> => {
//     const db = getDatabase();
//     const result: any = await db.executeSql('SELECT * FROM order_items WHERE id = ?', [id]);

//     // Add safety checks
//     if (result?.[0]?.rows && result[0].rows.length > 0) {
//         return result[0].rows.item(0);
//     }
//     return null;
// };

// export const updateOrderItem = async (id: number, orderItem: Partial<OrderItem>): Promise<void> => {
//     const db = getDatabase();
//     const now = Math.floor(Date.now() / 1000);

//     // No changes needed if there's nothing to update
//     if (Object.keys(orderItem).length === 0) return;

//     let query = 'UPDATE order_items SET ';
//     const params: any[] = [];
//     const updates: string[] = [];

//     if (orderItem.orderId !== undefined) {
//         updates.push('orderId = ?');
//         params.push(orderItem.orderId);
//     }
//     if (orderItem.itemId !== undefined) {
//         updates.push('itemId = ?');
//         params.push(orderItem.itemId);
//     }
//     if (orderItem.quantity !== undefined) {
//         updates.push('quantity = ?');
//         params.push(orderItem.quantity);
//     }
//     if (orderItem.price !== undefined) {
//         updates.push('price = ?');
//         params.push(orderItem.price);
//     }
//     if (orderItem.total !== undefined) {
//         updates.push('total = ?');
//         params.push(orderItem.total);
//     } else if (orderItem.price !== undefined || orderItem.quantity !== undefined) {
//         // We need to fetch the current item first to recalculate the total
//         const currentItem = await getOrderItemById(id);
//         if (currentItem) {
//             const newPrice = orderItem.price !== undefined ? orderItem.price : currentItem.price;
//             const newQuantity = orderItem.quantity !== undefined ? orderItem.quantity : currentItem.quantity;
//             updates.push('total = ?');
//             params.push(newPrice * newQuantity);
//         }
//     }
//     if (orderItem.updatedById !== undefined) {
//         updates.push('updatedById = ?');
//         params.push(orderItem.updatedById);
//     }

//     updates.push('updatedAt = ?');
//     params.push(now);

//     query += updates.join(', ') + ' WHERE id = ?';
//     params.push(id);

//     try {
//         await db.executeSql(query, params);
//     } catch (error) {
//         console.error('Error updating order item:', error);
//         throw error;
//     }
// };

// export const deleteOrderItem = async (id: number): Promise<void> => {
//     const db = getDatabase();
//     await db.executeSql('DELETE FROM order_items WHERE id = ?', [id]);
// };

// export const deleteOrderItemsByOrderId = async (orderId: number): Promise<void> => {
//     const db = getDatabase();
//     await db.executeSql('DELETE FROM order_items WHERE orderId = ?', [orderId]);
// };

// src/models/OrderItem.ts
import { getDatabase } from '../database';

export interface OrderItem {
  id?: number;
  orderId: number;
  itemId: number;
  itemName?: string; // Optional field for item name
  quantity: number;
  price: number;
  total: number;
  createdById: number;
  updatedById?: number | null;
  createdAt?: number;
  updatedAt?: number;
}

export const createOrderItem = async (orderItem: Omit<OrderItem, 'id'>): Promise<number> => {
  const db = await getDatabase();
  const now = Math.floor(Date.now() / 1000);

  const result: any = db.executeSql(
    `INSERT INTO order_items 
    (orderId, itemId,itemName, quantity, price, total, createdById, updatedById, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderItem.orderId,
      orderItem.itemId,
      orderItem.itemName || null, // Optional field for item name
      orderItem.quantity,
      orderItem.price,
      orderItem.total,
      orderItem.createdById,
      orderItem.updatedById || null,
      now,
      now
    ]
  );

  if (result?.[0]?.insertId !== undefined) {
    return result[0].insertId;
  }
  throw new Error('Failed to create order item');
};

export const getOrderItems = async (orderId?: number): Promise<OrderItem[]> => {
  const db = await  getDatabase();
  let query = 'SELECT * FROM order_items';
  const params: any[] = [];

  if (orderId !== undefined) {
    query += ' WHERE orderId = ?';
    params.push(orderId);
  }

  const result: any = await db.executeSql(query, params);

  const orderItems: OrderItem[] = [];
  if (result?.[0]?.rows) {
    for (let i = 0; i < result[0].rows.length; i++) {
      orderItems.push(result[0].rows.item(i));
    }
  }

  return orderItems;
};

export const getOrderItemById = async (id: number): Promise<OrderItem | null> => {
  const db = await getDatabase();
  const result: any = await db.executeSql('SELECT * FROM order_items WHERE id = ?', [id]);

  if (result?.[0]?.rows && result[0].rows.length > 0) {
    return result[0].rows.item(0);
  }
  return null;
};

export const updateOrderItem = async (id: number, orderItem: Partial<OrderItem>): Promise<void> => {
  const db = await getDatabase();
  const now = Math.floor(Date.now() / 1000);

  let query = 'UPDATE order_items SET ';
  const params: any[] = [];
  const updates: string[] = [];

  if (orderItem.orderId !== undefined) {
    updates.push('orderId = ?');
    params.push(orderItem.orderId);
  }
  if (orderItem.itemId !== undefined) {
    updates.push('itemId = ?');
    params.push(orderItem.itemId);
  }
  if (orderItem.quantity !== undefined) {
    updates.push('quantity = ?');
    params.push(orderItem.quantity);
  }
  if (orderItem.price !== undefined) {
    updates.push('price = ?');
    params.push(orderItem.price);
  }
  if (orderItem.total !== undefined) {
    updates.push('total = ?');
    params.push(orderItem.total);
  }
  if (orderItem.updatedById !== undefined) {
    updates.push('updatedById = ?');
    params.push(orderItem.updatedById);
  }

  updates.push('updatedAt = ?');
  params.push(now);

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(id);

  await db.executeSql(query, params);
};

export const deleteOrderItem = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM order_items WHERE id = ?', [id]);
};

export const deleteOrderItemsByOrderId = async (orderId: number): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM order_items WHERE orderId = ?', [orderId]);
};

export const bulkInsertOrderItems = async (orderItems: OrderItem[]): Promise<void> => {
  const db = await getDatabase();

  await db.transaction(async (tx) => {
    for (const item of orderItems) {
      await tx.executeSql(
        `INSERT OR REPLACE INTO order_items 
        (id, orderId, itemId, quantity, price, total, createdById, updatedById, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.orderId,
          item.itemId,
          item.quantity,
          item.price,
          item.total,
          item.createdById,
          item.updatedById || null,
          item.createdAt || Math.floor(Date.now() / 1000),
          item.updatedAt || Math.floor(Date.now() / 1000)
        ]
      );
    }
  });
};