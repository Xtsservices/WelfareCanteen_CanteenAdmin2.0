// src/models/Walkin.ts
import { getDatabase } from '../database';
import { walkinData } from '../types';

export interface Walkin {
  id?: number;
  customerName: string;
  contactNumber?: string;
  numberOfPeople?: number;
  tableNumber?: string;
  orderStatus?: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  totalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  finalAmount?: number;
  paymentMethod?: 'Cash' | 'Card' | 'UPI';
  paymentStatus?: 'unpaid' | 'paid' | 'partially_paid';
  notes?: string;
  createdById: number;
  updatedById?: number;
  createdAt?: number;
  updatedAt?: number;
  isSynced?: boolean;
}

export const createWalkin = async (walkin: Omit<Walkin, 'id'>): Promise<number> => {
<<<<<<< HEAD
  const db = getDatabase();
=======
  const db = await getDatabase();
>>>>>>> b21e52eaa75a206b3a34ef1154241626872ca3b3
  const now = Math.floor(Date.now() / 1000);

  const result: any = await db.executeSql(
    `INSERT INTO walkins (
      customerName, contactNumber, numberOfPeople, tableNumber,
      orderStatus, totalAmount, discountAmount, taxAmount, finalAmount,
      paymentMethod, paymentStatus, notes, createdById, updatedById,
      createdAt, updatedAt, isSynced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, // Added one more ? here
    [
      walkin.customerName,
      walkin.contactNumber || null,
      walkin.numberOfPeople || 1,
      walkin.tableNumber || null,
      walkin.orderStatus || 'pending',
      walkin.totalAmount || 0,
      walkin.discountAmount || 0,
      walkin.taxAmount || 0,
      walkin.finalAmount || 0,
      walkin.paymentMethod || 'Cash',
      walkin.paymentStatus || 'unpaid',
      walkin.notes || null,
      walkin.createdById,
      walkin.updatedById || null,
      now,
      now,
      walkin.isSynced ? 1 : 0
    ]
  );

  if (result?.[0]?.insertId !== undefined) {
    return result[0].insertId;
  }
  throw new Error('Failed to create walkin order');
};

export const getWalkinById = async (id: number): Promise<Walkin | null> => {
<<<<<<< HEAD
  const db = getDatabase();
=======
  const db = await getDatabase();
>>>>>>> b21e52eaa75a206b3a34ef1154241626872ca3b3
  const result: any = await db.executeSql('SELECT * FROM walkins WHERE id = ?', [id]);

  if (result?.[0]?.rows && result[0].rows.length > 0) {
    const walkin = result[0].rows.item(0);
    return {
      ...walkin,
      isSynced: Boolean(walkin.isSynced)
    };
  }
  return null;
};

export const getWalkins = async (filter?: {
  status?: string;
  paymentStatus?: string;
}): Promise<Walkin[]> => {
<<<<<<< HEAD
  const db = getDatabase();
=======
  const db = await getDatabase();
>>>>>>> b21e52eaa75a206b3a34ef1154241626872ca3b3
  let query = 'SELECT * FROM walkins';
  const params: any[] = [];
  const conditions: string[] = [];

  if (filter?.status) {
    conditions.push('orderStatus = ?');
    params.push(filter.status);
  }
  if (filter?.paymentStatus) {
    conditions.push('paymentStatus = ?');
    params.push(filter.paymentStatus);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY createdAt DESC';

  const result: any = await db.executeSql(query, params);

  const walkins: Walkin[] = [];
  if (result?.[0]?.rows) {
    for (let i = 0; i < result[0].rows.length; i++) {
      const walkin = result[0].rows.item(i);
      walkins.push({
        ...walkin,
        isSynced: Boolean(walkin.isSynced)
      });
    }
  }

  return walkins;
};

export const updateWalkin = async (id: number, walkin: Partial<Walkin>): Promise<void> => {
<<<<<<< HEAD
  const db = getDatabase();
=======
  const db = await getDatabase();
>>>>>>> b21e52eaa75a206b3a34ef1154241626872ca3b3
  const now = Math.floor(Date.now() / 1000);

  let query = 'UPDATE walkins SET ';
  const params: any[] = [];
  const updates: string[] = [];

  const fields: Array<keyof Walkin> = [
    'customerName', 'contactNumber', 'numberOfPeople', 'tableNumber',
    'orderStatus', 'totalAmount', 'discountAmount', 'taxAmount', 'finalAmount',
    'paymentMethod', 'paymentStatus', 'notes', 'updatedById'
  ];

  fields.forEach(field => {
    if (walkin[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(walkin[field]);
    }
  });

  if (walkin.isSynced !== undefined) {
    updates.push('isSynced = ?');
    params.push(walkin.isSynced ? 1 : 0);
  }

  updates.push('updatedAt = ?');
  params.push(now);

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(id);

  await db.executeSql(query, params);
};

export const deleteWalkin = async (id: number): Promise<void> => {
<<<<<<< HEAD
  const db = getDatabase();
=======
  const db = await getDatabase();
>>>>>>> b21e52eaa75a206b3a34ef1154241626872ca3b3
  await db.executeSql('DELETE FROM walkins WHERE id = ?', [id]);
};

export const calculateWalkinTotals = async (walkinId: number): Promise<{
  totalAmount: number;
  finalAmount: number;
}> => {
<<<<<<< HEAD
  const db = getDatabase();
=======
  const db = await getDatabase();
>>>>>>> b21e52eaa75a206b3a34ef1154241626872ca3b3
  
  // Calculate total from items
  const itemsResult: any = await db.executeSql(
    'SELECT SUM(totalPrice) as subtotal FROM walkin_items WHERE walkinId = ?',
    [walkinId]
  );
  
  const subtotal = itemsResult?.[0]?.rows?.item(0)?.subtotal || 0;
  
  // Get current tax and discount
  const walkinResult: any = await db.executeSql(
    'SELECT taxAmount, discountAmount FROM walkins WHERE id = ?',
    [walkinId]
  );
  
  const walkin = walkinResult?.[0]?.rows?.item(0);
  const taxAmount = walkin?.taxAmount || 0;
  const discountAmount = walkin?.discountAmount || 0;
  
  const finalAmount = subtotal + taxAmount - discountAmount;
  
  // Update walkin with new totals
  await updateWalkin(walkinId, {
    totalAmount: subtotal,
    finalAmount
  });
  
  return {
    totalAmount: subtotal,
    finalAmount
  };
};

export const markWalkinAsSynced = async (id: number): Promise<void> => {
  await updateWalkin(id, { isSynced: true });
};

// src/models/Walkin.ts (add this to the end)
export const saveCompleteWalkinOrder = async (walkinData: walkinData): Promise<number> => {
<<<<<<< HEAD
  const db = getDatabase();
=======
  const db = await getDatabase();
>>>>>>> b21e52eaa75a206b3a34ef1154241626872ca3b3
  let walkinId: number;

  try {
    // First insert the walkin record (outside transaction for debugging)
    const now = Math.floor(Date.now() / 1000);
    
    const walkinResult:any = await db.executeSql(
      `INSERT INTO walkins (
        customerName, contactNumber, numberOfPeople, tableNumber,
        orderStatus, totalAmount, discountAmount, taxAmount, finalAmount,
        paymentMethod, paymentStatus, notes, createdById, updatedById,
        createdAt, updatedAt, isSynced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        walkinData.customerName,
        walkinData.contactNumber || null,
        walkinData.numberOfPeople || 1,
        walkinData.tableNumber || null,
        walkinData.orderStatus || 'pending',
        walkinData.totalAmount || 0,
        walkinData.discountAmount || 0,
        walkinData.taxAmount || 0,
        walkinData.finalAmount || 0,
        walkinData.paymentMethod || 'Cash',
        walkinData.paymentStatus || 'unpaid',
        walkinData.notes || null,
        walkinData.createdById,
        walkinData.updatedById || walkinData.createdById,
        now,
        now,
        0 // isSynced = false
      ]
    );
    console.log('Walkin insertion result:', walkinResult);
    

    // Simplified result checking
    if (!walkinResult || walkinResult?.length === 0 || !walkinResult?.[0]?.insertId) {
      console.error('Walkin insertion failed:', walkinResult);
      throw new Error('Walkin insertion failed - no insertId returned');
    }

    walkinId = walkinResult[0].insertId;
    console.log(`Successfully inserted walkin with ID: ${walkinId}`);

    // Now insert items in a transaction
    await db.transaction(async (tx) => {
      for (const item of walkinData.items) {
        const totalPrice = item.totalPrice || (item.unitPrice * item.quantity);
        
        const itemResult:any = await tx.executeSql(
          `INSERT INTO walkin_items (
            walkinId, menuItemId, itemName, quantity, unitPrice,
            totalPrice, specialInstructions, status, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            walkinId,
            item.menuItemId,
            item.itemName,
            item.quantity,
            item.unitPrice,
            totalPrice,
            item.specialInstructions || null,
            item.status || 'pending',
            now
          ]
        );

        if (!itemResult || itemResult[0].rowsAffected !== 1) {
          throw new Error(`Failed to insert item: ${item.itemName}`);
        }
      }
    });

    // Recalculate totals
    await calculateWalkinTotals(walkinId);
    return walkinId;

  } catch (error: any) {
    console.error('Complete error details:', {
      error: error.message,
      stack: error.stack,
      walkinData,
      // walkinId: walkinId || 'none'
    });
    throw new Error(`Failed to save complete walkin order: ${error.message}`);
  }
};