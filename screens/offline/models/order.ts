// src/models/Order.ts
import { getDatabase } from '../database';

export interface Order {
    id?: number;
    userId: number;
    totalAmount: number;
    status: string;
    canteenId: number;
    menuConfigurationId?: number | null;
    qrCode?: string | null;
    createdById?: number | null;
    updatedById?: number | null;
    createdAt?: number;
    updatedAt?: number;
}

export const createOrder = async (order: Omit<Order, 'id'>): Promise<number> => {
    const db = await getDatabase();
    const now = Math.floor(Date.now() / 1000);
    

    const result: any = await db.executeSql(
        `INSERT INTO orders 
    (userId, totalAmount, status, canteenId, menuConfigurationId, qrCode, 
     createdById, updatedById, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            order.userId,
            order.totalAmount,
            order.status,
            order.canteenId,
            order.menuConfigurationId || null,
            order.qrCode || null,
            order.createdById || null,
            order.updatedById || null,
            now,
            now
        ]
    );

    if (result?.[0]?.insertId !== undefined) {
        return result[0].insertId;
    }
    throw new Error('Failed to create order');
};

export const getOrders = async (userId?: number): Promise<Order[]> => {
    const db = await getDatabase();
    let query = 'SELECT * FROM orders';
    
    const params: any[] = [];

    if (userId !== undefined) {
        query += ' WHERE userId = ?';
        params.push(userId);
    }

    query += ' ORDER BY createdAt DESC';

    const result: any = await db.executeSql(query, params);

    const orders: Order[] = [];
    if (result?.[0]?.rows) {
        for (let i = 0; i < result[0].rows.length; i++) {
            const order = result[0].rows.item(i);
            orders.push({
                ...order,
                isSynced: Boolean(order.isSynced)
            });
        }
    }
    console.log('Orders:', orders);
    return orders;
};
console.log("getOrders",getOrders());
export const getOrderById = async (id: number): Promise<Order | null> => {
    const db = await getDatabase();
    const result: any = await db.executeSql('SELECT * FROM orders WHERE id = ?', [id]);

    if (result?.[0]?.rows && result[0].rows.length > 0) {
        const order = result[0].rows.item(0);
        return {
            ...order,
            isSynced: Boolean(order.isSynced)
        };
    }
    return null;
};

export const updateOrder = async (id: number, order: Partial<Order>): Promise<void> => {
    const db = await getDatabase();
    const now = Math.floor(Date.now() / 1000);

    let query = 'UPDATE orders SET ';
    const params: any[] = [];
    const updates: string[] = [];

    if (order.userId !== undefined) {
        updates.push('userId = ?');
        params.push(order.userId);
    }
    if (order.totalAmount !== undefined) {
        updates.push('totalAmount = ?');
        params.push(order.totalAmount);
    }
    if (order.status !== undefined) {
        updates.push('status = ?');
        params.push(order.status);
    }
    if (order.canteenId !== undefined) {
        updates.push('canteenId = ?');
        params.push(order.canteenId);
    }
    if (order.menuConfigurationId !== undefined) {
        updates.push('menuConfigurationId = ?');
        params.push(order.menuConfigurationId);
    }
    if (order.qrCode !== undefined) {
        updates.push('qrCode = ?');
        params.push(order.qrCode);
    }
    if (order.updatedById !== undefined) {
        updates.push('updatedById = ?');
        params.push(order.updatedById);
    }

    updates.push('updatedAt = ?');
    params.push(now);

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await db.executeSql(query, params);
};

export const deleteOrder = async (id: number): Promise<void> => {
    const db = await getDatabase();
    await db.executeSql('DELETE FROM orders WHERE id = ?', [id]);
};


export const bulkInsertOrders = async (orders: Order[]): Promise<void> => {
    const db = await getDatabase();

    await db.transaction(async (tx) => {
        for (const order of orders) {
            await tx.executeSql(
                `INSERT OR REPLACE INTO orders 
        (id, userId, totalAmount, status, canteenId, menuConfigurationId, qrCode,
         createdById, updatedById, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    order.id,
                    order.userId,
                    order.totalAmount,
                    order.status,
                    order.canteenId,
                    order.menuConfigurationId || null,
                    order.qrCode || null,
                    order.createdById || null,
                    order.updatedById || null,
                    order.createdAt || Math.floor(Date.now() / 1000),
                    order.updatedAt || Math.floor(Date.now() / 1000),
                ]
            );
        }
    });
};

// src/models/Order.ts (add this to the end)

export const saveCompleteOrder = async (orderData: {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    canteenId: number;
    menuConfigurationId?: number;
    qrCode?: string;
    createdById?: number;
    updatedById?: number;
    createdAt?: number;
    updatedAt?: number;
    orderItems: Array<{
        id: number;
        orderId: number;
        itemId: number;
        quantity: number;
        price: number;
        total: number;
        createdById: number;
        updatedById?: number;
        createdAt?: number;
        updatedAt?: number;
    }>;
}): Promise<void> => {
    const db = await getDatabase();

    await db.transaction(async (tx) => {
        // Insert/update the order
        await tx.executeSql(
            `INSERT OR REPLACE INTO orders 
        (id, userId, totalAmount, status, canteenId, menuConfigurationId, qrCode,
         createdById, updatedById, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderData.id,
                orderData.userId,
                orderData.totalAmount,
                orderData.status,
                orderData.canteenId,
                orderData.menuConfigurationId || null,
                orderData.qrCode || null,
                orderData.createdById || null,
                orderData.updatedById || null,
                orderData.createdAt || Math.floor(Date.now() / 1000),
                orderData.updatedAt || Math.floor(Date.now() / 1000),
                1 // Mark as synced
            ]
        );

        // Delete existing order items
        await tx.executeSql('DELETE FROM order_items WHERE orderId = ?', [orderData.id]);

        // Insert new order items
        for (const item of orderData.orderItems) {
            await tx.executeSql(
                `INSERT INTO order_items 
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