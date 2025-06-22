// import { TouchableOpacity, Text, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
// import React from 'react';

// interface ItemListProps {
//     label?: string;
//     value?: string | number;
//     onPress?: () => void;
//     connected?: boolean;
//     actionText?: string;
//     color?: string;
// }

// const ItemList: React.FC<ItemListProps> = ({
//     label = 'UNKNOWN',
//     value,
//     onPress,
//     connected = false,
//     actionText = 'Action',
//     color = '#00BCD4',
// }) => {
//     return (
//         <View style={styles.container}>
//             <View>
//                 <Text style={styles.label}>{label}</Text>
//                 <Text>{value}</Text>
//             </View>
//             {connected && <Text style={styles.connected}>Terhubung</Text>}
//             {!connected && (
//                 <TouchableOpacity
//                     onPress={onPress}
//                     style={[styles.button, { backgroundColor: color }]}
//                 >
//                     <Text style={styles.actionText}>{actionText}</Text>
//                 </TouchableOpacity>
//             )}
//         </View>
//     );
// };

// export default ItemList;

// const styles = StyleSheet.create({
//         container: {
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             backgroundColor: '#E7E7E7',
//             marginBottom: 12,
//             padding: 12,
//             borderRadius: 4,
//         },
//         button: {
//             paddingHorizontal: 10,
//             paddingVertical: 8,
//             borderRadius: 4,
//         },
//         label: {
//             fontSize: 16,
//             fontWeight: 'bold',
//             color: '#000',
//         },
//         connected: {
//             fontSize: 14,
//             color: 'green',
//             fontWeight: 'bold',
//         },
//         actionText: {
//             fontSize: 14,
//             color: '#FFFFFF',
//             fontWeight: 'bold',
//         },
//     })