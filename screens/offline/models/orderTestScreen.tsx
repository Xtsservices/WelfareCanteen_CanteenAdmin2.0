// // src/screens/OrderTestScreen.tsx
// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   Button, 
//   Alert, 
//   FlatList, 
//   StyleSheet, 
//   ActivityIndicator,
//   ScrollView 
// } from 'react-native';
// import { initializeDatabase } from '../database';
// import { getMenuItems, MenuItem } from './menuItems';
// // import { 
// //   Order, 
// //   createOrder, 
// //   getOrders, 
// //   getOrderById, 
// //   updateOrder, 
// //   deleteOrder 
// // } from './orderItems';
// import { 
//   OrderItem, 
//   createOrderItem, 
//   getOrderItems, 
//   updateOrderItem, 
//   deleteOrderItem 
// } from './orderItems';

// const OrderTestScreen = () => {
//   // Database and loading states
//   const [isDbInitialized, setIsDbInitialized] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Data states
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
//   // Form states
//   const [orderForm, setOrderForm] = useState({
//     customerName: '',
//     customerContact: '',
//     status: 'pending'
//   });
//   const [orderItemForm, setOrderItemForm] = useState({
//     itemId: '',
//     quantity: '1',
//     price: '',
//     notes: ''
//   });

//   // Initialize database and load data
//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         await initializeDatabase();
//         setIsDbInitialized(true);
//         await loadData();
//       } catch (error) {
//         console.error('Initialization error:', error);
//         Alert.alert('Error', 'Failed to initialize database');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     initializeApp();
//   }, []);

//   const loadData = async () => {
//     if (!isDbInitialized) return;
    
//     try {
//       const [ordersData, menuItemsData] = await Promise.all([
//         getOrders(),
//         getMenuItems()
//       ]);
      
//       setOrders(ordersData);
//       setMenuItems(menuItemsData);
      
//       if (ordersData.length > 0 && !selectedOrder) {
//         handleSelectOrder(ordersData[0]);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load data');
//       console.error('Load error:', error);
//     }
//   };

//   const handleSelectOrder = async (order: Order) => {
//     setSelectedOrder(order);
//     try {
//       const items = await getOrderItems(order.id);
//       setOrderItems(items);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load order items');
//       console.error('Order items load error:', error);
//     }
//   };

//   // Order CRUD operations
//   const handleCreateOrder = async () => {
//     if (!orderForm.customerName) {
//       Alert.alert('Error', 'Customer name is required');
//       return;
//     }

//     try {
//       const newOrder = {
//         ...orderForm,
//         orderNumber: `ORD-${Date.now()}`,
//         totalAmount: 0, // Will be calculated from items
//         createdAt: Math.floor(Date.now() / 1000),
//         updatedAt: Math.floor(Date.now() / 1000),
//         isSynced: false
//       };
      
//       const orderId = await createOrder(newOrder);
//       Alert.alert('Success', 'Order created successfully');
//       setOrderForm({
//         customerName: '',
//         customerContact: '',
//         status: 'pending'
//       });
//       await loadData();
//     } catch (error) {
//       Alert.alert('Error', 'Failed to create order');
//       console.error('Create order error:', error);
//     }
//   };

//   const handleUpdateOrder = async () => {
//     if (!selectedOrder) return;
    
//     try {
//       await updateOrder(selectedOrder.id, {
//         ...orderForm,
//         updatedAt: Math.floor(Date.now() / 1000)
//       });
//       Alert.alert('Success', 'Order updated successfully');
//       await loadData();
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update order');
//       console.error('Update order error:', error);
//     }
//   };

//   const handleDeleteOrder = async (orderId: number) => {
//     try {
//       await deleteOrder(orderId);
//       Alert.alert('Success', 'Order deleted successfully');
//       setSelectedOrder(null);
//       await loadData();
//     } catch (error) {
//       Alert.alert('Error', 'Failed to delete order');
//       console.error('Delete order error:', error);
//     }
//   };

//   // Order Item CRUD operations
//   const handleAddOrderItem = async () => {
//     if (!selectedOrder) {
//       Alert.alert('Error', 'No order selected');
//       return;
//     }

//     if (!orderItemForm.itemId || !orderItemForm.price) {
//       Alert.alert('Error', 'Item and price are required');
//       return;
//     }

//     try {
//       const selectedMenuItem = menuItems.find(item => item.id === Number(orderItemForm.itemId));
//       if (!selectedMenuItem) {
//         throw new Error('Menu item not found');
//       }

//       const newOrderItem = {
//         orderId: selectedOrder.id,
//         itemId: Number(orderItemForm.itemId),
//         quantity: Number(orderItemForm.quantity),
//         price: Number(orderItemForm.price),
//         total: Number(orderItemForm.price) * Number(orderItemForm.quantity),
//         notes: orderItemForm.notes,
//         createdById: 1, // Replace with actual user ID
//         updatedById: null,
//         createdAt: Math.floor(Date.now() / 1000),
//         updatedAt: Math.floor(Date.now() / 1000)
//       };

//       await createOrderItem(newOrderItem);
      
//       // Update order total
//       const items = await getOrderItems(selectedOrder.id);
//       const newTotal = items.reduce((sum, item) => sum + item.total, 0);
//       await updateOrder(selectedOrder.id, {
//         totalAmount: newTotal,
//         updatedAt: Math.floor(Date.now() / 1000)
//       });

//       Alert.alert('Success', 'Item added to order');
//       setOrderItemForm({
//         itemId: '',
//         quantity: '1',
//         price: '',
//         notes: ''
//       });
//       await loadData();
//     } catch (error) {
//       Alert.alert('Error', 'Failed to add item to order');
//       console.error('Add item error:', error);
//     }
//   };

//   const handleRemoveOrderItem = async (itemId: number) => {
//     if (!selectedOrder) return;
    
//     try {
//       await deleteOrderItem(itemId);
      
//       // Update order total
//       const items = await getOrderItems(selectedOrder.id);
//       const newTotal = items.reduce((sum, item) => sum + item.total, 0);
//       await updateOrderItem(selectedOrder.id, {
//         totalAmount: newTotal,
//         updatedAt: Math.floor(Date.now() / 1000)
//       });

//       Alert.alert('Success', 'Item removed from order');
//       await loadData();
//     } catch (error) {
//       Alert.alert('Error', 'Failed to remove item from order');
//       console.error('Remove item error:', error);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//         <Text>Initializing database...</Text>
//       </View>
//     );
//   }

//   if (!isDbInitialized) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>Database initialization failed</Text>
//         <Button title="Retry" onPress={() => {
//           setIsLoading(true);
//           setIsDbInitialized(false);
//           // Re-run initialization
//           (async () => {
//             try {
//               await initializeDatabase();
//               setIsDbInitialized(true);
//               await loadData();
//             } catch (error) {
//               console.error('Initialization error:', error);
//               Alert.alert('Error', 'Failed to initialize database');
//             } finally {
//               setIsLoading(false);
//             }
//           })();
//         }} />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Order Management</Text>

//       {/* Order List */}
//       <Text style={styles.sectionTitle}>Orders</Text>
//       <FlatList
//         data={orders}
//         horizontal
//         keyExtractor={item => (item.id !== undefined ? item.id.toString() : '')}
//         renderItem={({ item }) => (
//           <View style={[
//             styles.orderCard,
//             selectedOrder?.id === item.id && styles.selectedOrderCard
//           ]}>
//             <Text style={styles.orderNumber}>{item.orderNumber}</Text>
//             <Text>{item.customerName}</Text>
//             <Text>${item.totalAmount.toFixed(2)}</Text>
//             <Text>{item.status}</Text>
//             <Button 
//               title="Select" 
//               onPress={() => handleSelectOrder(item)} 
//             />
//           </View>
//         )}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No orders found</Text>
//         }
//       />

//       {/* Order Form */}
//       <Text style={styles.sectionTitle}>
//         {selectedOrder ? 'Edit Order' : 'Create New Order'}
//       </Text>
//       <View style={styles.formContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Customer Name"
//           value={orderForm.customerName}
//           onChangeText={text => setOrderForm({...orderForm, customerName: text})}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Customer Contact"
//           value={orderForm.customerContact}
//           onChangeText={text => setOrderForm({...orderForm, customerContact: text})}
//           keyboardType="phone-pad"
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Status (pending, completed, cancelled)"
//           value={orderForm.status}
//           onChangeText={text => setOrderForm({...orderForm, status: text})}
//         />
        
//         {selectedOrder ? (
//           <>
//             <Button 
//               title="Update Order" 
//               onPress={handleUpdateOrder} 
//             />
//             <Button 
//               title="Delete Order" 
//               onPress={() => handleDeleteOrder(selectedOrder.id)} 
//               color="red"
//             />
//           </>
//         ) : (
//           <Button 
//             title="Create Order" 
//             onPress={handleCreateOrder} 
//           />
//         )}
//       </View>

//       {/* Order Items Section */}
//       {selectedOrder && (
//         <>
//           <Text style={styles.sectionTitle}>Order Items</Text>
//           <Text>Order Total: ${selectedOrder.totalAmount.toFixed(2)}</Text>
          
//           <FlatList
//             data={orderItems}
//             keyExtractor={item => (item?.id !== undefined ? item.id.toString() : '')}
//             renderItem={({ item }) => {
//               const menuItem = menuItems.find(mi => mi.id === item.itemId);
//               return (
//                 <View style={styles.itemCard}>
//                   <Text>{menuItem ? `Item ${menuItem.itemId}` : 'Unknown Item'}</Text>
//                   <Text>{item.quantity} x ${item.price.toFixed(2)}</Text>
//                   <Text>Total: ${item.total.toFixed(2)}</Text>
//                   {item?.notes && <Text>Notes: {item?.notes}</Text>}
//                   <Button 
//                     title="Remove" 
//                     onPress={() => {
//                       if (item?.id !== undefined) {
//                         handleRemoveOrderItem(item.id);
//                       }
//                     }} 
//                     color="red"
//                   />
//                 </View>
//               );
//             }}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>No items in this order</Text>
//             }
//           />

//           {/* Add Item Form */}
//           <Text style={styles.sectionTitle}>Add Item to Order</Text>
//           <View style={styles.formContainer}>
//             <Text>Select Menu Item:</Text>
//             <FlatList
//               data={menuItems}
//               horizontal
//               keyExtractor={item => item.id.toString()}
//               renderItem={({ item }) => (
//                 <Button
//                   title={`Item ${item.itemId}`}
//                   onPress={() => setOrderItemForm({
//                     ...orderItemForm,
//                     itemId: item.id.toString(),
//                     price: item.minQuantity.toString() // Default price
//                   })}
//                   color={orderItemForm.itemId === item.id.toString() ? 'green' : undefined}
//                 />
//               )}
//             />
            
//             <TextInput
//               style={styles.input}
//               placeholder="Quantity"
//               value={orderItemForm.quantity}
//               onChangeText={text => setOrderItemForm({...orderItemForm, quantity: text})}
//               keyboardType="numeric"
//             />
            
//             <TextInput
//               style={styles.input}
//               placeholder="Price"
//               value={orderItemForm.price}
//               onChangeText={text => setOrderItemForm({...orderItemForm, price: text})}
//               keyboardType="numeric"
//             />
            
//             <TextInput
//               style={styles.input}
//               placeholder="Notes"
//               value={orderItemForm.notes}
//               onChangeText={text => setOrderItemForm({...orderItemForm, notes: text})}
//             />
            
//             <Button 
//               title="Add to Order" 
//               onPress={handleAddOrderItem} 
//             />
//           </View>
//         </>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 18,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#333',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 20,
//     marginBottom: 10,
//     color: '#444',
//   },
//   formContainer: {
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   input: {
//     height: 40,
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 4,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     backgroundColor: '#f9f9f9',
//   },
//   orderCard: {
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 8,
//     marginRight: 10,
//     width: 150,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   selectedOrderCard: {
//     borderColor: 'blue',
//     borderWidth: 2,
//   },
//   orderNumber: {
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   itemCard: {
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 20,
//     color: '#666',
//   },
// });

// export default OrderTestScreen;

// src/screens/OrderItemsTestScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { initializeDatabase } from '../database';
import { OrderItem, createOrderItem, getOrderItems, getOrderItemById, updateOrderItem, deleteOrderItem, deleteOrderItemsByOrderId } from './orderItems';
import { getMenuItemsByMenuId, MenuItem } from './menuItems';

const OrderItemsTestScreen = () => {
  // Database and loading states
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);
  
  // Form states
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState<Omit<OrderItem, 'id' | 'createdAt' | 'updatedAt'>>({
    orderId: 0,
    itemId: 0,
    quantity: 1,
    price: 0,
    total: 0,
    createdById: 1,
    updatedById: null,
  });

  // Initialize database and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDatabase();
        setIsDbInitialized(true);
        await loadMenuItems();
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'Failed to initialize database');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadMenuItems = async () => {
    try {
      const items = await getMenuItemsByMenuId(1);
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const loadOrderItems = async () => {
    if (!orderId) return;
    
    try {
      const items = await getOrderItems(Number(orderId));
      setOrderItems(items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order items');
      console.error('Load error:', error);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderItems();
    }
  }, [orderId]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const numValue = isNaN(Number(value)) ? value : Number(value);
    setFormData(prev => ({
      ...prev,
      [field]: numValue,
      ...(field === 'price' || field === 'quantity' ? { 
        total: (field === 'price' ? Number(numValue) : prev.price) * 
               (field === 'quantity' ? Number(numValue) : prev.quantity)
      } : {})
    }));
  };

  const handleSelectMenuItem = (itemId: number) => {
    const selectedItem = menuItems.find(item => item.id === itemId);
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        itemId,
        price: selectedItem.minQuantity, // Default price
        total: selectedItem.minQuantity * prev.quantity
      }));
    }
  };

  const handleSubmit = async () => {
    if (!isDbInitialized) {
      Alert.alert('Error', 'Database not initialized');
      return;
    }

    try {
      if (!formData.orderId || !formData.itemId) {
        Alert.alert('Error', 'Order ID and Item ID are required');
        return;
      }

      const orderItemData = {
        ...formData,
        orderId: Number(formData.orderId),
        itemId: Number(formData.itemId),
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        total: Number(formData.total),
      };

      if (selectedOrderItem) {
        if (selectedOrderItem.id !== undefined) {
          await updateOrderItem(selectedOrderItem.id, orderItemData);
        } else {
          Alert.alert('Error', 'Order item ID is undefined');
        }
        Alert.alert('Success', 'Order item updated successfully');
      } else {
        await createOrderItem(orderItemData);
        Alert.alert('Success', 'Order item created successfully');
      }

      resetForm();
      await loadOrderItems();
    } catch (error) {
      Alert.alert('Error', 'Operation failed');
      console.error('Submit error:', error);
    }
  };

  const handleEdit = (item: OrderItem) => {
    setSelectedOrderItem(item);
    setFormData({
      orderId: item.orderId,
      itemId: item.itemId,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      createdById: item.createdById,
      updatedById: item.updatedById || null,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOrderItem(id);
      Alert.alert('Success', 'Order item deleted successfully');
      await loadOrderItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete order item');
      console.error('Delete error:', error);
    }
  };

  const resetForm = () => {
    setSelectedOrderItem(null);
    setFormData({
      orderId: 0,
      itemId: 0,
      quantity: 1,
      price: 0,
      total: 0,
      createdById: 1,
      updatedById: null,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Initializing database...</Text>
      </View>
    );
  }

  if (!isDbInitialized) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Database initialization failed</Text>
        <Button title="Retry" onPress={() => {
          setIsLoading(true);
          setIsDbInitialized(false);
          // Re-run initialization
          (async () => {
            try {
              await initializeDatabase();
              setIsDbInitialized(true);
              await loadMenuItems();
            } catch (error) {
              console.error('Initialization error:', error);
              Alert.alert('Error', 'Failed to initialize database');
            } finally {
              setIsLoading(false);
            }
          })();
        }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Items Management</Text>
      
      {/* Order ID Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Order</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Order ID"
          value={orderId}
          onChangeText={setOrderId}
          keyboardType="numeric"
        />
        <Button 
          title="Load Order Items" 
          onPress={loadOrderItems} 
          disabled={!orderId}
        />
      </View>

      {/* Order Item Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedOrderItem ? 'Edit Order Item' : 'Create New Order Item'}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Order ID"
          value={formData.orderId.toString()}
          onChangeText={text => handleInputChange('orderId', text)}
          keyboardType="numeric"
        />
        
        <Text style={styles.label}>Select Menu Item:</Text>
        <FlatList
          data={menuItems}
          horizontal
          keyExtractor={item => (item.id !== undefined ? item.id.toString() : '')}
          renderItem={({ item }) => (
            <Button
              title={`Item ${item.itemId}`}
              onPress={() => {
                if (item.id !== undefined) {
                  handleSelectMenuItem(item.id);
                }
              }}
              color={formData.itemId === item.id ? 'green' : undefined}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No menu items available</Text>
          }
        />
        
        <TextInput
          style={styles.input}
          placeholder="Quantity"
          value={formData.quantity.toString()}
          onChangeText={text => handleInputChange('quantity', text)}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={formData.price.toString()}
          onChangeText={text => handleInputChange('price', text)}
          keyboardType="numeric"
        />
        
        <Text style={styles.totalText}>Total: {formData.total.toFixed(2)}</Text>
        
        <Button
          title={selectedOrderItem ? 'Update Order Item' : 'Create Order Item'}
          onPress={handleSubmit}
        />
        
        {selectedOrderItem && (
          <Button
            title="Cancel Edit"
            onPress={resetForm}
            color="#999"
          />
        )}
      </View>

      {/* Order Items List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {orderId ? (
          <FlatList
            data={orderItems}
            keyExtractor={item => (item.id !== undefined ? item.id.toString() : '')}
            renderItem={({ item }) => {
              const menuItem = menuItems.find(mi => mi.id === item.itemId);
              return (
                <View style={styles.itemContainer}>
                  <View style={styles.itemDetails}>
                    <Text>Order ID: {item.orderId}</Text>
                    <Text>Item: {menuItem ? `Item ${menuItem.itemId}` : 'Unknown'}</Text>
                    <Text>Qty: {item.quantity} x ${item.price.toFixed(2)}</Text>
                    <Text>Total: ${item.total.toFixed(2)}</Text>
                    <Text>Created: {new Date((item.createdAt || 0) * 1000).toLocaleString()}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <Button title="Edit" onPress={() => handleEdit(item)} />
                    <Button title="Delete" onPress={() => { if (item.id !== undefined) handleDelete(item.id); }} color="red" />
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No order items found for this order</Text>
            }
          />
        ) : (
          <Text style={styles.emptyText}>Please enter an Order ID to load items</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  label: {
    marginBottom: 5,
    color: '#666',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'right',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemDetails: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default OrderItemsTestScreen;