import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
SQLite.DEBUG(false);

let database: SQLite.SQLiteDatabase | null = null;

export const initializeDatabase = async () => {
  try {
    const db = await SQLite.openDatabase({
      name: 'canteen.db',
      location: 'default',
    });
    console.log('Database connected');

    // await dropAllTables(db); 
    // Create tables if they don't exist
    await createTables(db);
    // Drop all tables if they exist

    database = db;
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const createTables = async (db: SQLite.SQLiteDatabase) => {
  try {
    // Create menu_configurations table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS menu_configurations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        defaultStartTime INTEGER NOT NULL,
        defaultEndTime INTEGER NOT NULL
      );
    `);

    // Create menus table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS menus (
       id INTEGER PRIMARY KEY,
              name TEXT,
              description TEXT,
              startTime INTEGER,
              endTime INTEGER,
              createdAt INTEGER,
              updatedAt INTEGER,
              menuConfigurationId INTEGER,
              menuId INTEGER
      );
    `);

    // Create items table
    // Create menu_items table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY,
         menuId INTEGER,
              itemId INTEGER,
              itemName TEXT UNIQUE,
              minQuantity INTEGER,
              maxQuantity INTEGER,
              price REAL
      );
    `);

    // Create orders table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        orderId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        canteenId INTEGER NOT NULL,
        menuConfigurationId INTEGER,
        qrCode TEXT,
        createdById INTEGER,
        updatedById INTEGER,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        isSynced INTEGER DEFAULT 0
      );
    `);

    // Create order_items table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY,
        orderId INTEGER NOT NULL,
        itemId INTEGER NOT NULL,
        itemName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        createdById INTEGER NOT NULL,
        updatedById INTEGER,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
      );
    `);

    // Create walkins table for customer details
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS walkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerName TEXT NOT NULL,
        contactNumber TEXT,
        numberOfPeople INTEGER DEFAULT 1,
        tableNumber TEXT,
        orderStatus TEXT NOT NULL DEFAULT 'pending',
        menuId INTEGER NOT NULL DEFAULT 1,
        totalAmount REAL DEFAULT 0,
        discountAmount REAL DEFAULT 0,
        taxAmount REAL DEFAULT 0,
        finalAmount REAL DEFAULT 0,
        paymentMethod TEXT DEFAULT 'Cash',
        paymentStatus TEXT DEFAULT 'unpaid',
        notes TEXT,
        createdById INTEGER NOT NULL,
        updatedById INTEGER,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        isSynced INTEGER DEFAULT 0
      );
    `);
    // Create walkin_items table for the items ordered
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS walkin_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      walkinId INTEGER NOT NULL,
      menuItemId INTEGER NOT NULL,
      itemName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      totalPrice REAL NOT NULL,
      specialInstructions TEXT,
      status TEXT DEFAULT 'pending',
      createdAt INTEGER NOT NULL,
      phoneNumber TEXT NOT NULL,
      FOREIGN KEY (walkinId) REFERENCES walkins(id) ON DELETE CASCADE
      );
    `);

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

export const getDatabase = async () => {
  if (!database) {
    database = await initializeDatabase();
  }

  return database;
};

// src/types/database.ts
export type SQLiteResult = {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item: (index: number) => any;
    _array: any[];
  };
};

export type ExecuteSql = (sql: string, args?: any[]) => Promise<[SQLiteResult]>;

const dropAllTables = async (db: SQLite.SQLiteDatabase) => {
  try {
    const tables = [
      'menu_configurations',
      'menus',
      'items',
      'item_pricing',
      'menu_items',
      'orders',
      'order_items',
      'walkins',
      'walkin_items',
    ];

    for (const table of tables) {
      await db.executeSql(`DROP TABLE IF EXISTS ${table};`);
    }

    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
};
