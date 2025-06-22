// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { RouteProp } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../navigationTypes';

// type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;
// type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

// type Props = {
//   route: CheckoutScreenRouteProp;
//   navigation: CheckoutScreenNavigationProp;
// };

// const Checkout: React.FC<Props> = ({ route, navigation }) => {
//   const { cart, total } = route.params; 

//   const renderDashedLine = () => (
//     <Text style={styles.dashedLine}>------------------------------------------</Text>
//   );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Header */}
//       <View style={styles.header} />

//       {/* Report Title */}
//       <Text style={styles.title}>Item Wise Report</Text>

//       {renderDashedLine()}

//       {/* Order Info */}
//       <View style={styles.orderInfo}>
//         <Text style={styles.orderText}>ordered</Text>
//         <Text style={styles.orderText}>Date: DD/MM/YYYY</Text>
//         <Text style={styles.orderText}>Time: 00:12 AM</Text>
//       </View>

//       {renderDashedLine()}

//       {/* Table Header */}
//       <View style={styles.tableRow}>
//         <Text style={styles.tableHeaderText}>CODE</Text>
//         <Text style={styles.tableHeaderText}>ITEM</Text>
//         <Text style={styles.tableHeaderText}>QTY</Text>
//         <Text style={styles.tableHeaderText}>TOTAL</Text>
//       </View>

//       {renderDashedLine()}

//       {/* Table Rows */}
//       {cart.map((item, index) => (
//         <View key={index} style={styles.tableRow}>
//           <Text style={styles.tableRowText}>{item.code}</Text>
//           <Text style={styles.tableRowText}>{item.item}</Text>
//           <Text style={styles.tableRowText}>{item.qty}</Text>
//           <Text style={styles.tableRowText}>{item.total}/-</Text>
//         </View>
//       ))}

//       {renderDashedLine()}

//       {/* Bill Amount */}
//       <View style={styles.billAmountRow}>
//         <Text style={styles.billAmountText}>BILL AMOUNT</Text>
//         <Text style={styles.billAmountText}>{total}/-</Text>
//       </View>

//       {/* Print Button */}
//       <TouchableOpacity style={styles.printButton}>
//         <Text style={styles.printButtonText}>Print</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     paddingBottom: 20,
//     backgroundColor: '#e0e0e0',
//   },
//   header: {
//     backgroundColor: '#001F8B',
//     height: 80,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 16,
//     textAlign: 'center',
//     color: '#000',
//   },
//   dashedLine: {
//     fontSize: 16,
//     textAlign: 'center',
//     color: '#777',
//     marginVertical: 8,
//   },
//   orderInfo: {
//     alignItems: 'flex-start',
//     paddingHorizontal: 20,
//   },
//   orderText: {
//     fontSize: 14,
//     color: '#000',
//     marginVertical: 2,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 4,
//     paddingHorizontal: 10,
//   },
//   tableHeaderText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#000',
//     width: '25%',
//     textAlign: 'center',
//   },
//   tableRowText: {
//     fontSize: 14,
//     color: '#000',
//     width: '25%',
//     textAlign: 'center',
//   },
//   billAmountRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 30,
//     marginVertical: 16,
//   },
//   billAmountText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   printButton: {
//     backgroundColor: '#001F8B',
//     marginHorizontal: 50,
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   printButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default Checkout;
