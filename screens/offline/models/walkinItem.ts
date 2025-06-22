// src/models/WalkinItem.ts
import { getDatabase } from '../database';
import { calculateWalkinTotals } from './walkin';

export interface WalkinItem {
  id?: number;
  walkinId: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  createdAt?: number;
}
export const createWalkinItem = async (item: Omit<WalkinItem, 'id'>): Promise<number> => {
  try {
    const db = await getDatabase();
    const now = Math.floor(Date.now() / 1000);

    const result: any = await db.executeSql(
      `INSERT INTO walkin_items (
        walkinId, menuItemId, itemName, quantity, unitPrice,
        totalPrice, specialInstructions, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.walkinId,
        item.menuItemId,
        item.itemName,
        item.quantity,
        item.unitPrice,
        item.unitPrice * item.quantity,
        item.specialInstructions || null,
        item.status || 'pending',
        now
      ]
    );

    if (result?.[0]?.insertId !== undefined) {
      await calculateWalkinTotals(item.walkinId);
      return result[0].insertId;
    }
    throw new Error('No insertId returned from database');
  } catch (error) {
    console.error('Error in createWalkinItem:', {
      error,
      item,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const getWalkinItems = async (walkinId: number): Promise<WalkinItem[]> => {
  const db = await getDatabase();
  const result: any = await db.executeSql(
    'SELECT * FROM walkin_items WHERE walkinId = ? ORDER BY createdAt ASC',
    [walkinId]
  );
  console.log(result, 'result');
  

  const items: WalkinItem[] = [];
  if (result?.[0]?.rows) {
    for (let i = 0; i < result[0].rows.length; i++) {
      items.push(result[0].rows.item(i));
    }
  }

  return items;
};

export const getWalkinItemById = async (id: number): Promise<WalkinItem | null> => {
  const db = await getDatabase();
  const result: any = await db.executeSql('SELECT * FROM walkin_items WHERE id = ?', [id]);

  if (result?.[0]?.rows && result[0].rows.length > 0) {
    return result[0].rows.item(0);
  }
  return null;
};

export const updateWalkinItem = async (id: number, item: Partial<WalkinItem>): Promise<void> => {
  const db = await getDatabase();

  let query = 'UPDATE walkin_items SET ';
  const params: any[] = [];
  const updates: string[] = [];

  const fields: Array<keyof WalkinItem> = [
    'quantity', 'unitPrice', 'totalPrice', 'specialInstructions', 'status'
  ];

  fields.forEach(field => {
    if (item[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(item[field]);
    }
  });

  // Recalculate totalPrice if quantity or unitPrice changed
  if (item.quantity !== undefined || item.unitPrice !== undefined) {
    const currentItem = await getWalkinItemById(id);
    if (currentItem) {
      const newQuantity = item.quantity !== undefined ? item.quantity : currentItem.quantity;
      const newUnitPrice = item.unitPrice !== undefined ? item.unitPrice : currentItem.unitPrice;
      updates.push('totalPrice = ?');
      params.push(newQuantity * newUnitPrice);
    }
  }

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(id);

  await db.executeSql(query, params);

  // Update walkin totals if price or quantity changed
  if (item.quantity !== undefined || item.unitPrice !== undefined) {
    const currentItem = await getWalkinItemById(id);
    if (currentItem) {
      await calculateWalkinTotals(currentItem.walkinId);
    }
  }
};

export const deleteWalkinItem = async (id: number): Promise<void> => {
  const db = await getDatabase();
  const item = await getWalkinItemById(id);

  if (item) {
    await db.executeSql('DELETE FROM walkin_items WHERE id = ?', [id]);
    await calculateWalkinTotals(item.walkinId);
  }
};

export const bulkInsertWalkinItems = async (items: WalkinItem[]): Promise<void> => {
  const db = await getDatabase();

  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx.executeSql(
        `INSERT OR REPLACE INTO walkin_items 
        (id, walkinId, menuItemId, itemName, quantity, unitPrice, totalPrice, 
         specialInstructions, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.walkinId,
          item.menuItemId,
          item.itemName,
          item.quantity,
          item.unitPrice,
          item.totalPrice || (item.unitPrice * item.quantity),
          item.specialInstructions || null,
          item.status || 'pending',
          item.createdAt || Math.floor(Date.now() / 1000)
        ]
      );
    }
  });

  // Update totals for affected walkins
  if (items.length > 0) {
    const walkinId = items[0].walkinId;
    await calculateWalkinTotals(walkinId);
  }
};