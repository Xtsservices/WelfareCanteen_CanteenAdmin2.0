// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   FlatList,
//   Image,
//   Alert,
//   Dimensions,
// } from 'react-native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../navigationTypes';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width } = Dimensions.get('window');

// type BreakfastScreenNavigationProp = StackNavigationProp<
//   RootStackParamList,
//   'breakfast'
// >;

// interface BreakfastProps {
//   navigation: BreakfastScreenNavigationProp;
// }

// interface Pricing {
//   id: number;
//   price: number;
//   currency: string;
// }

// interface MenuItem {
//   id: number;
//   name: string;
//   description: string;
//   image: string;
//   pricing: Pricing;
// }

// interface MenuItemWithQuantity {
//   id: number;
//   menuItemItem: MenuItem;
//   minQuantity: number;
//   maxQuantity: number;
// }

// interface MenuConfiguration {
//   id: number;
//   name: string;
//   defaultStartTime: number;
//   defaultEndTime: number;
// }

// interface MenuDetails {
//   id: number;
//   name: string;
//   description: string;
//   startTime: number;
//   endTime: number;
//   menuMenuConfiguration: MenuConfiguration;
//   menuItems: MenuItemWithQuantity[];
//   canteenId: number;
// }

// interface CartResponse {
//   message: string;
//   data: {
//     id: number;
//     userId: number;
//     status: string;
//     totalAmount: number;
//     canteenId: number;
//     menuConfigurationId: number;
//     menuId: number;
//     updatedAt: string;
//     createdAt: string;
//   };
// }

// const Breakfast: React.FC<BreakfastProps> = ({ navigation }) => {
//   const [menuData, setMenuData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [dates, setDates] = useState<string[]>([]);
//   const [selectedMenu, setSelectedMenu] = useState<MenuDetails | null>(null);
//   const [showMenuDetails, setShowMenuDetails] = useState(false);
//   const [addingToCart, setAddingToCart] = useState<number | null>(null); // Track which item is being added

//   console.log(menuData, "menuData--neww");


//   useEffect(() => {

//     let isMounted = true;

//     // Fetch menu data 
//     const fetchMenuData = async () => {
//       try {
//         const token = await AsyncStorage.getItem('authorization');
//         if (!token) {
//           console.error('No token found in AsyncStorage');
//           return;
//         }
//         const response = await fetch(
//           `http://192.168.1.20:3002/api/menu/getMenusForNextTwoDaysGroupedByDateAndConfiguration?canteenId=`,
//           {
//             method: 'GET',
//             headers: {
//               Authorization: token,
//             },
//           }
//         );

//         const data = await response.json();
//         // console.log('Menu Data:', data);

//         if (isMounted) {
//           setMenuData(data.data);
//           const apiDates = Object.keys(data.data).sort((a, b) => {
//             const dateA = new Date(a.split('-').reverse().join('-'));
//             const dateB = new Date(b.split('-').reverse().join('-'));
//             return dateA.getTime() - dateB.getTime();
//           });
//           setDates(apiDates);
//         }
//       } catch (error) {
//         console.error('Error fetching menu data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMenuData();
//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   // Fetch menu details by ID
//   const fetchMenuDetails = async (menuId: number) => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem('authorization');
//       if (!token) {
//         console.error('No token found in AsyncStorage');
//         return;
//       }

//       const response = await fetch(
//         `http://192.168.1.20:3002/api/menu/getMenuById?id=${menuId}`,
//         {
//           method: 'GET',
//           headers: {
//             Authorization: token,
//           },
//         }
//       );

//       const data = await response.json();
//       if (data?.data) {
//         setSelectedMenu(data.data);
//         setShowMenuDetails(true);
//       }
//     } catch (error) {
//       console.error('Error fetching menu details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };


//   // Add item to cart
//   const addToCart = async (itemId: number, quantity: number) => {
//     if (!selectedMenu || !selectedMenu.menuItems) return null;



//     try {
//       setAddingToCart(itemId);
//       const token = await AsyncStorage.getItem('authorization');
//       if (!token) {
//         console.error('No token found in AsyncStorage');
//         return;
//       }

//       const cartData = {
//         itemId,
//         quantity,
//         menuId: selectedMenu.id,
//         canteenId: selectedMenu.canteenId,
//         menuConfigurationId: selectedMenu.menuMenuConfiguration.id
//       };

//       const response = await fetch(
//         'http://192.168.1.20:3002/api/cart/add',
//         {
//           method: 'POST',
//           headers: {
//             'Authorization': token,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(cartData),
//         }
//       );

//       const data: CartResponse = await response.json();

//       if (data.data) {
//         Alert.alert(
//           'Success',
//           'Item added to cart successfully!',
//           [
//             { text: 'OK', onPress: () => console.log('OK Pressed') }
//           ]
//         );
//       } else {
//         Alert.alert(
//           'Error',
//           data.message || 'Failed to add item to cart',
//           [
//             { text: 'OK', onPress: () => console.log('OK Pressed') }
//           ]
//         );
//       }
//     } catch (error) {
//       console.error('Error adding to cart:', error);
//       Alert.alert(
//         'Error',
//         'An error occurred while adding to cart',
//         [
//           { text: 'OK', onPress: () => console.log('OK Pressed') }
//         ]
//       );
//     } finally {
//       setAddingToCart(null);
//     }
//   };

//   const formatTime = (timestamp: number) => {
//     const date = new Date(timestamp * 1000);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const formatDateDisplay = (dateString: string) => {
//     const [day, month, year] = dateString.split('-');
//     const date = new Date(`${year}-${month}-${day}`);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const renderItemImage = (imageUrl: string) => {
//     if (imageUrl) {
//       return (
//         <Image
//           source={{
//             uri: imageUrl
//               ? `data:image/png;base64,${imageUrl}`
//               : 'https://via.placeholder.com/150',
//           }}
//           style={styles.itemImage}
//           resizeMode="cover"
//           onError={(e) => console.log('Image error:', e.nativeEvent.error)}
//         />
//       );
//     }
//     return (
//       <View style={[styles.itemImage, styles.noImage]}>
//         <Text style={styles.noImageText}>No Image Available</Text>
//       </View>
//     );
//   };

//   const renderMenuDetails = () => {
//     if (!selectedMenu) return null;
//     console.log(selectedMenu, "selectedMenu--renderMenuDetails");


//     return (
//       <View style={{ flex: 1 }}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => setShowMenuDetails(false)}
//         >
//           <Text style={styles.backButtonText}>← Back to Menu</Text>
//         </TouchableOpacity>

//         <View style={styles.menuDetailsHeader}>
//           <Text style={styles.menuTitle}>{selectedMenu.name}</Text>
//           <Text style={styles.menuDescription}>{selectedMenu.description}</Text>

//           <View style={styles.timingContainer}>
//             <Text style={styles.timingText}>
//               Menu Time: {formatTime(selectedMenu?.startTime)} - {formatTime(selectedMenu?.endTime)}
//             </Text>
//             <Text style={styles.timingText}>
//               Default Time: {formatTime(selectedMenu?.menuMenuConfiguration?.defaultStartTime)} - {formatTime(selectedMenu?.menuMenuConfiguration?.defaultEndTime)}
//             </Text>
//           </View>
//         </View>

//         <FlatList
//           data={selectedMenu.menuItems}
//           keyExtractor={(item) => `${item.id}-${item.menuItemItem.id}`}
//           numColumns={3}  // Add this for 3-column layout
//           columnWrapperStyle={styles.columnWrapper}  // Add this for spacing
//           renderItem={({ item }) => (
//             <View style={styles.menuItem}>
//               {renderItemImage(item?.menuItemItem?.image)}
//               <Text style={styles.itemName}>{item.menuItemItem.name}</Text>
//               <Text style={styles.itemDescription}>{item.menuItemItem.description}</Text>
//               <Text style={styles.itemPrice}>
//                 {item?.menuItemItem?.pricing?.currency} {item?.menuItemItem?.pricing?.price}
//               </Text>
//               <Text style={styles.quantityRange}>
//                 Quantity: {item.minQuantity}-{item.maxQuantity}
//               </Text>

//               <TouchableOpacity
//                 style={styles.addToCartButton}
//                 onPress={() => addToCart(item?.menuItemItem?.id, item?.minQuantity)}
//                 disabled={addingToCart === item?.menuItemItem?.id}
//               >
//                 {addingToCart === item?.menuItemItem?.id ? (

//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.addToCartButtonText}>Add to Cart</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           )}
//           contentContainerStyle={styles.menuItemsContainer}
//         />
//       </View>
//     );
//   };

//   const renderMenuButtons = (date: string, menu: any) => {
//     console.log(menu, " menu--renderMenuButtons");

//     return (
//       <View key={date} style={{ paddingHorizontal: 10, marginVertical: 10 }}>
//         <Text style={styles.dateHeader}>
//           {formatDateDisplay(date)}
//         </Text>
//         <View style={styles.categoriesContainer}>
//           {Object.keys(menu).map((category, index) => {
//             const menuItem = menu[category][0];
//             return (
//               <TouchableOpacity
//                 style={styles.categoryButton}
//                 onPress={() => {
//                   if (menuItem) {
//                     navigation.navigate('MenuItemDetails', {
//                       menuId: menuItem.id,
//                     });
//                   }
//                 }}
//               >
//                 <Text style={styles.categoryButtonText}>
//                   {category}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       </View>
//     );
//   };

//   const renderMenuList = () => {
//     return (
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AdminDashboard')}>
//           <Text style={styles.backButtonText}>← Back</Text>
//         </TouchableOpacity>

//         <View style={styles.header}>
//           <Text style={styles.title}>🍽️ Explore the Menu</Text>
//         </View>

//         {dates.map(date => (
//           menuData && menuData[date] && renderMenuButtons(date, menuData[date])
//         ))}

//         {!dates.length && (
//           <Text style={styles.noMenuText}>No menu data available</Text>
//         )}
//       </ScrollView>
//     );
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       {loading ? (
//         <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />
//       ) : showMenuDetails ? (
//         renderMenuDetails()
//       ) : (
//         renderMenuList()
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 100,
//   },
//   backButton: {
//     position: 'absolute',
//     top: 50,
//     left: 16,
//     zIndex: 10,
//     backgroundColor: '#E5E7EB',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//   },
//   backButtonText: {
//     color: '#1F2937',
//     fontSize: 16,
//   },
//   header: {
//     marginTop: 90,
//     paddingHorizontal: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1F2937',
//   },
//   dateHeader: {
//     color: '#1F2937',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     marginTop: 10,
//     textAlign: 'center',
//   },
//   categoriesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   categoryButton: {
//     backgroundColor: '#6366F1',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '30%',
//     marginHorizontal: '1.5%',
//   },
//   categoryButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   noMenuText: {
//     fontSize: 16,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   menuDetailsHeader: {
//     padding: 16,
//     paddingTop: 80,
//   },
//   menuTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   menuDescription: {
//     fontSize: 16,
//     color: '#6B7280',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   timingContainer: {
//     backgroundColor: '#E5E7EB',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   timingText: {
//     fontSize: 14,
//     color: '#1F2937',
//     textAlign: 'center',
//     marginVertical: 2,
//   },
//   menuItemsContainer: {
//     padding: 16,
//   },
//   columnWrapper: {
//     justifyContent: 'space-between',
//     paddingHorizontal: 8,
//   },
//   menuItem: {
//     width: '31%',  // 31% allows for 3 items with spacing
//     backgroundColor: '#FFFFFF',
//     padding: 12,   // Slightly reduced padding
//     borderRadius: 8,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   itemImage: {
//     width: '100%',
//     height: 120, // Reduced from 200 to better fit cards
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   noImage: {
//     backgroundColor: '#D1D5DB',
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   noImageText: {
//     color: '#6B7280',
//     fontSize: 16,
//   },
//   itemName: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   itemDescription: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   itemPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#10B981',
//     marginTop: 8,
//   },
//   quantityRange: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 8,
//   },
//   addToCartButton: {
//     backgroundColor: '#6366F1',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   addToCartButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default Breakfast;