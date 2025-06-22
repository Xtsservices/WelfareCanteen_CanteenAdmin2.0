// // src/services/index.ts
// import database from '../sqlite';
// import MenuService from './menuServices';
// import OrderService from './OrderService';
// // import SyncService from './SyncService';

// let menuService: MenuService;
// let orderService: OrderService;
// let syncService: SyncService;

// export const initializeServices = async () => {
//   const db = await database.init();
//   menuService = new MenuService(db);
//   orderService = new OrderService(db);
//   syncService = new SyncService(db);
// };

// export {menuService, orderService, syncService};