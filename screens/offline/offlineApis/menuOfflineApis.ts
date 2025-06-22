// src/api/offlineMenuApi.ts
import { getDatabase } from '../database';
import { MenuItem } from '../models/menuItems';
import { formatDateKey, formatTime } from '../utils/dateUtils';

export const getAllMenusOffline = async () => {
  const db = await getDatabase();

  try {
    // Fetch all menus with their configurations
    const menusResult: any = await db.executeSql(`
      SELECT m.*, mc.id as configId, mc.name as configName, 
             mc.defaultStartTime, mc.defaultEndTime
      FROM menus m
      LEFT JOIN menu_configurations mc ON m.menuConfigurationId = mc.id
      ORDER BY m.startTime ASC
    `);

    const menus: any[] = [];
    if (menusResult?.[0]?.rows) {
      for (let i = 0; i < menusResult[0].rows.length; i++) {
        menus.push(menusResult[0].rows.item(i));
      }
    }

    // Group menus by date and then by menu type
    const groupedMenus: any = {};

    menus.forEach(menu => {
      const dateKey = formatDateKey(menu.startTime);
      const menuType = menu.configName;

      if (!groupedMenus[dateKey]) {
        groupedMenus[dateKey] = {};
      }

      if (!groupedMenus[dateKey][menuType]) {
        groupedMenus[dateKey][menuType] = [];
      }

      groupedMenus[dateKey][menuType].push({
        id: menu.id,
        name: menu.name,
        startTime: menu.startTime,
        endTime: menu.endTime,
        menuConfiguration: {
          id: menu.configId,
          name: menu.configName,
          defaultStartTime: menu.defaultStartTime,
          defaultEndTime: menu.defaultEndTime,
          formattedDefaultEndTime: formatTime(menu.defaultEndTime)
        }
      });
    });

    return {
      message: "Menus fetched successfully",
      data: groupedMenus
    };

  } catch (error) {
    console.error('Error fetching offline menus:', error);
    throw error;
  }
};

export const getMenuItemsByIdOffline22 = async (menuId: number | string) => {
  console.log('Fetching menu items for menuId:', menuId);
  
  const db = await getDatabase();

  try {
    // Fetch menu details
    const menuResult: any = await db.executeSql(`
      SELECT m.*, mc.id as configId, mc.name as configName, 
             mc.defaultStartTime, mc.defaultEndTime
      FROM menus m
      LEFT JOIN menu_configurations mc ON m.menuConfigurationId = mc.id
      WHERE m.id = ?
    `, [menuId]);
    
    if (!menuResult?.[0]?.rows || menuResult[0].rows.length === 0) {
      throw new Error('Menu not found');
    }

    const menu = menuResult[0].rows.item(0);

    // Fetch menu items with item details and pricing
    const itemsResult: any = await db.executeSql(`
      SELECT mi.*, 
             i.id as itemId, i.name as itemName, i.description as itemDescription, i.image as itemImage,
             p.id as priceId, p.price, p.currency
      FROM menu_items mi
      JOIN items i ON mi.itemId = i.id
      LEFT JOIN item_pricing p ON i.id = p.itemId
      WHERE mi.menuId = ?
      ORDER BY i.name ASC
    `, [menuId]);
    console.log(`itemsResult`, itemsResult[0]?.rows);
    

    const menuItems: any[] = [];
    if (itemsResult?.[0]?.rows) {
      for (let i = 0; i < itemsResult[0].rows.length; i++) {
        const item = itemsResult[0].rows.item(i);
        console.log(item, "itemmmmmmmmmmmmmmmmmmmmmmmmmm");
        
        menuItems.push({
          id: item.id,
          menuId: item.menuId,
          itemId: item.itemId,
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
          status: item.status,
          createdById: item.createdById,
          updatedById: item.updatedById,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          item: {
            id: item.itemId,
            name: item.itemName,
            description: item.itemDescription,
            image: item.itemImage,
            pricing: {
              id: item.priceId,
              price: item.price,
              currency: item.currency
            }
          }
        });
      }
    }
    console.log(menuItems,"menuItemssss");
    

    const response = {
      id: menu.id,
      name: menu.name,
      description: menu.description,
      startTime: menu.startTime,
      endTime: menu.endTime,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      menuItems,
      menuConfiguration: {
        id: menu.configId,
        name: menu.configName,
        defaultStartTime: menu.defaultStartTime,
        defaultEndTime: menu.defaultEndTime
      },
      menuConfigurationId: menu.menuConfigurationId
    };

    return {
      message: "Menu items fetched successfully",
      data: response
    };

  } catch (error) {
    console.error('Error fetching offline menu items:', error);
    throw error;
  }
};

export const getMenuItemsByIdOffline = async (menuId: number | string) => {
  const db = await getDatabase();

  try {
    // 1. First get the menu details
    const menuResult:any = await db.executeSql(`
      SELECT m.*, mc.id as configId, mc.name as configName,
             mc.defaultStartTime, mc.defaultEndTime
      FROM menus m
      LEFT JOIN menu_configurations mc ON m.menuConfigurationId = mc.id
      WHERE m.id = ?
    `, [menuId]);
    
    if (!menuResult?.[0]?.rows?.length) {
      throw new Error('Menu not found');
    }
    const menu = menuResult[0].rows.item(0);

    // 2. Get all menu items for this menu
    const menuItemsResult:any = await db.executeSql(`
      SELECT mi.* FROM menu_items mi WHERE mi.menuId = ?
    `, [menuId]);
    
    const menuItems = [];
    const itemIds = [];
    
    if (menuItemsResult?.[0]?.rows?.length) {
      for (let i = 0; i < menuItemsResult[0].rows.length; i++) {
        const mi = menuItemsResult[0].rows.item(i);
        menuItems.push(mi);
        itemIds.push(mi.itemId);
      }
    }

    // 3. If we have items, get their details and pricing
    if (itemIds.length > 0) {
      // Get items
      const itemsResult:any = await db.executeSql(`
        SELECT * FROM items WHERE id IN (${itemIds.map(() => '?').join(',')})
      `, itemIds);
      
      // Get pricing
      const pricingResult:any = await db.executeSql(`
        SELECT * FROM item_pricing WHERE itemId IN (${itemIds.map(() => '?').join(',')})
      `, itemIds);

      const itemsMap: Record<number, any> = {};
      const pricingMap: Record<number, any> = {};

      // Build items map
      if (itemsResult?.[0]?.rows?.length) {
        for (let i = 0; i < itemsResult[0].rows.length; i++) {
          const item = itemsResult[0].rows.item(i);
          itemsMap[item.id] = item;
        }
      }

      // Build pricing map
      if (pricingResult?.[0]?.rows?.length) {
        for (let i = 0; i < pricingResult[0].rows.length; i++) {
          const price = pricingResult[0].rows.item(i);
          pricingMap[price.itemId] = price;
        }
      }

      // Combine everything
      const fullMenuItems = menuItems.map(mi => ({
        ...mi,
        item: itemsMap[mi.itemId] ? {
          ...itemsMap[mi.itemId],
          pricing: pricingMap[mi.itemId] || null
        } : null
      }));

      return {
        message: "Menu items fetched successfully",
        data: {
          ...menu,
          menuItems: fullMenuItems,
          menuConfiguration: {
            id: menu.configId,
            name: menu.configName,
            defaultStartTime: menu.defaultStartTime,
            defaultEndTime: menu.defaultEndTime
          }
        }
      };
    }

    // Return menu with empty items if none found
    return {
      message: "Menu items fetched successfully",
      data: {
        ...menu,
        menuItems: [],
        menuConfiguration: {
          id: menu.configId,
          name: menu.configName,
          defaultStartTime: menu.defaultStartTime,
          defaultEndTime: menu.defaultEndTime
        }
      }
    };

  } catch (error) {
    console.error('Error fetching offline menu items:', error);
    throw error;
  }
};