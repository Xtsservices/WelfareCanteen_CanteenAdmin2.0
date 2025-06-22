// // src/models/MenuItem.ts
// import { getDatabase } from '../database';

// export interface MenuItem {
//   id?: number;
//   menuId: number;
//   itemId: number;
//   minQuantity: number;
//   maxQuantity: number;
//   status: string;
//   createdById?: number | null;
//   updatedById?: number | null;
//   createdAt?: number;
//   updatedAt?: number;
// }

// export const createMenuItem = async (menuItem: Omit<MenuItem, 'id'>): Promise<number> => {
//   const db = getDatabase();
//   const now = Math.floor(Date.now() / 1000);

//   const result: any = await db.executeSql(
//     `INSERT INTO menu_items 
//     (menuId, itemId, minQuantity, maxQuantity, status, createdById, updatedById, createdAt, updatedAt) 
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

//     [
//       menuItem.menuId,
//       menuItem.itemId,
//       menuItem.minQuantity,
//       menuItem.maxQuantity,
//       menuItem.status,
//       menuItem.createdById || null,
//       menuItem.updatedById || null,
//       now,
//       now
//     ]
//   );

//   if (result && Array.isArray(result) && result[0]?.insertId !== undefined) {
//     return result[0].insertId;
//   } else {
//     throw new Error('Failed to insert menu item');
//   }
// };

// export const getMenuItems = async (): Promise<MenuItem[]> => {
//   const db = getDatabase();
//   const result = await db.executeSql('SELECT * FROM menu_items') as unknown as [{ rows: { length: number; item: (index: number) => MenuItem } }];

//   const menuItems: MenuItem[] = [];
//   for (let i = 0; i < result[0].rows.length; i++) {
//     menuItems.push(result[0].rows.item(i));
//   }

//   return menuItems;
// };

// export const updateMenuItem = async (id: number, menuItem: Partial<MenuItem>): Promise<void> => {
//   const db = getDatabase();
//   const now = Math.floor(Date.now() / 1000);

//   let query = 'UPDATE menu_items SET ';
//   const params: any[] = [];
//   const updates: string[] = [];

//   if (menuItem.menuId !== undefined) {
//     updates.push('menuId = ?');
//     params.push(menuItem.menuId);
//   }
//   if (menuItem.itemId !== undefined) {
//     updates.push('itemId = ?');
//     params.push(menuItem.itemId);
//   }
//   if (menuItem.minQuantity !== undefined) {
//     updates.push('minQuantity = ?');
//     params.push(menuItem.minQuantity);
//   }
//   if (menuItem.maxQuantity !== undefined) {
//     updates.push('maxQuantity = ?');
//     params.push(menuItem.maxQuantity);
//   }
//   if (menuItem.status !== undefined) {
//     updates.push('status = ?');
//     params.push(menuItem.status);
//   }
//   if (menuItem.updatedById !== undefined) {
//     updates.push('updatedById = ?');
//     params.push(menuItem.updatedById);
//   }

//   updates.push('updatedAt = ?');
//   params.push(now);

//   query += updates.join(', ') + ' WHERE id = ?';
//   params.push(id);

//   await db.executeSql(query, params);
// };

// export const deleteMenuItem = async (id: number): Promise<void> => {
//   const db = getDatabase();
//   await db.executeSql('DELETE FROM menu_items WHERE id = ?', [id]);
// };


// src/models/MenuItem.ts
import { getDatabase } from '../database';

export interface MenuItem {
  id?: number;
  menuId: number;
  itemId: number;
  minQuantity: number;
  maxQuantity: number;
  status: string;
  createdById?: number | null;
  updatedById?: number | null;
  createdAt?: number;
  updatedAt?: number;
}

export const createMenuItem = async (menuItem: Omit<MenuItem, 'id'>): Promise<number> => {
  const db = await getDatabase();
  const now = Math.floor(Date.now() / 1000);

  const result: any = await db.executeSql(
    `INSERT INTO menu_items 
    (menuId, itemId, minQuantity, maxQuantity, status, createdById, updatedById, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      menuItem.menuId,
      menuItem.itemId,
      menuItem.minQuantity,
      menuItem.maxQuantity,
      menuItem.status,
      menuItem.createdById || null,
      menuItem.updatedById || null,
      now,
      now
    ]
  );

  return result[0].insertId;
};

export const bulkInsertMenuItems = async (menuItems: MenuItem[]): Promise<void> => {
  const db = await getDatabase();
  const now = Math.floor(Date.now() / 1000);

  await db.transaction(async (tx) => {
    for (const menuItem of menuItems) {
      await tx.executeSql(
        `INSERT OR REPLACE INTO menu_items 
        (id, menuId, itemId, minQuantity, maxQuantity, status, createdById, updatedById, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          menuItem.id,
          menuItem.menuId,
          menuItem.itemId,
          menuItem.minQuantity,
          menuItem.maxQuantity,
          menuItem.status,
          menuItem.createdById || null,
          menuItem.updatedById || null,
          menuItem.createdAt || now,
          menuItem.updatedAt || now
        ]
      );
    }
  });
};

export const getMenuItemsByMenuId = async (menuId: number | string): Promise<MenuItem[]> => {
  const db = await getDatabase();
  const result = await db.executeSql(
    'SELECT * FROM menu_items WHERE menuId = ?',
    [menuId]
  ) as unknown as [{ rows: { length: number; item: (index: number) => MenuItem } }];

  const menuItems: MenuItem[] = [];
  for (let i = 0; i < result[0].rows.length; i++) {
    menuItems.push(result[0].rows.item(i));
  }

  return menuItems;
};

export const updateMenuItem = async (id: number, menuItem: Partial<MenuItem>): Promise<void> => {
  const db = await getDatabase();
  const now = Math.floor(Date.now() / 1000);

  let query = 'UPDATE menu_items SET ';
  const params: any[] = [];
  const updates: string[] = [];

  if (menuItem.menuId !== undefined) {
    updates.push('menuId = ?');
    params.push(menuItem.menuId);
  }
  if (menuItem.itemId !== undefined) {
    updates.push('itemId = ?');
    params.push(menuItem.itemId);
  }
  if (menuItem.minQuantity !== undefined) {
    updates.push('minQuantity = ?');
    params.push(menuItem.minQuantity);
  }
  if (menuItem.maxQuantity !== undefined) {
    updates.push('maxQuantity = ?');
    params.push(menuItem.maxQuantity);
  }
  if (menuItem.status !== undefined) {
    updates.push('status = ?');
    params.push(menuItem.status);
  }
  if (menuItem.updatedById !== undefined) {
    updates.push('updatedById = ?');
    params.push(menuItem.updatedById);
  }

  updates.push('updatedAt = ?');
  params.push(now);

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(id);

  await db.executeSql(query, params);
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM menu_items WHERE id = ?', [id]);
};

export const deleteMenuItemsByMenuId = async (menuId: number): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM menu_items WHERE menuId = ?', [menuId]);
};

export const saveCompleteMenu = async (menuData: any) => {
  const db = await getDatabase();
  const now = Math.floor(Date.now() / 1000);

  await db.transaction(async (tx) => {
    // Save menu configuration if it doesn't exist
    await tx.executeSql(
      `INSERT OR REPLACE INTO menu_configurations 
      (id, name, defaultStartTime, defaultEndTime) 
      VALUES (?, ?, ?, ?)`,
      [
        menuData.menuConfiguration.id,
        menuData.menuConfiguration.name,
        menuData.menuConfiguration.defaultStartTime,
        menuData.menuConfiguration.defaultEndTime
      ]
    );

    // Save menu
    await tx.executeSql(
      `INSERT OR REPLACE INTO menus 
      (id, name, description, startTime, endTime, status, menuConfigurationId, 
       createdById, updatedById, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        menuData.id,
        menuData.name,
        menuData.description,
        menuData.startTime,
        menuData.endTime,
        menuData.status || 'active',
        menuData.menuConfigurationId,
        menuData.createdById || null,
        menuData.updatedById || null,
        menuData.createdAt || now,
        menuData.updatedAt || now
      ]
    );

    // Save items and their pricing
    for (const menuItem of menuData.menuItems) {
      // Save item
      await tx.executeSql(
        `INSERT OR REPLACE INTO items 
        (id, name, description, image, status, createdById, updatedById, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          menuItem.item.id,
          menuItem.item.name,
          menuItem.item.description,
          menuItem.item.image,
          menuItem.item.status || 'active',
          menuItem.item.createdById || null,
          menuItem.item.updatedById || null,
          menuItem.item.createdAt || now,
          menuItem.item.updatedAt || now
        ]
      );

      // Save item pricing
      if (menuItem.item.pricing) {
        await tx.executeSql(
          `INSERT OR REPLACE INTO item_pricing 
          (id, itemId, price, currency, createdAt, updatedAt) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            menuItem.item.pricing.id,
            menuItem.item.id,
            menuItem.item.pricing.price,
            menuItem.item.pricing.currency || 'INR',
            now,
            now
          ]
        );
      }

      // Save menu item
      await tx.executeSql(
        `INSERT OR REPLACE INTO menu_items 
        (id, menuId, itemId, minQuantity, maxQuantity, status, 
         createdById, updatedById, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          menuItem.id,
          menuItem.menuId,
          menuItem.itemId,
          menuItem.minQuantity,
          menuItem.maxQuantity,
          menuItem.status || 'active',
          menuItem.createdById || null,
          menuItem.updatedById || null,
          menuItem.createdAt || now,
          menuItem.updatedAt || now
        ]
      );
    }
  });
};