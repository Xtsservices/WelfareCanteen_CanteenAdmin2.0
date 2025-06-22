import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './navigationTypes';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type OrderHistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'orderhistory'
>;

interface OrderHistoryScreenProps {
  navigation: OrderHistoryScreenNavigationProp;
}

const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ navigation }) => {
  const [showAll, setShowAll] = useState(false);
  const [searchText, setSearchText] = useState('');

  const orders = [
    { id: '1', date: '2025-04-21', time: 'Afternoon', orderNumber: '#12345' },
    { id: '2', date: '2025-04-20', time: 'Morning', orderNumber: '#12346' },
    { id: '3', date: '2025-04-19', time: 'Evening', orderNumber: '#12347' },
    { id: '4', date: '2025-04-18', time: 'Noon', orderNumber: '#12348' },
    { id: '5', date: '2025-04-17', time: 'Afternoon', orderNumber: '#12349' },
    { id: '6', date: '2025-04-16', time: 'Night', orderNumber: '#12350' },
  ];

  // Filter orders based on search text
  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    order.date.includes(searchText)
  );

  const displayedOrders = showAll ? filteredOrders : filteredOrders.slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Header Top Section */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Orders history</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Order Number or Date"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Icon name="magnify" size={22} color="#666" style={styles.searchIcon} />
      </View>

      {/* Orders List */}
      <ScrollView style={styles.ordersContainer}>
        {displayedOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderInfo}>
              {/* <Icon name="food" size={30} color="#000" /> */}
              <View style={styles.orderDetails}>
                <Text style={styles.orderNumber}>Order Number</Text>
                <Text style={styles.orderTime}>{order.time}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.reorderButton}>
              <Image
                        style={styles.reorder}
                        source={{
                          uri: 'data:image/jpeg;base64,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',
                        }}
                      />
              <Text style={styles.reorderText}>Re-Order</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* View All / View Less */}
        {filteredOrders.length > 4 && (
          <TouchableOpacity style={styles.viewAllButton} onPress={() => setShowAll(!showAll)}>
            <Text style={styles.viewAllText}>{showAll ? 'View Less' : 'View All'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}> 
        <Text style={styles.footerText}>proposed by</Text>
        <Image
          source={{ uri: 'https://watabix.com/assets/logo.png' }}
          style={styles.footerLogo}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topHeader: {
    flexDirection: 'row',
    backgroundColor: '#0014A8',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  headerIcons: { flexDirection: 'row' },
  iconButton: { marginLeft: 15 },
  titleSection: {
    backgroundColor: '#0014A8',
    alignItems: 'center',
    paddingVertical: 10,
  },
  titleText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    marginTop: 10,
    marginHorizontal: 15,
    backgroundColor: '#eee',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  reorder :{
    height:15,
    width:15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: { marginLeft: 5 },
  ordersContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDetails: {
    marginLeft: 10,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderTime: {
    fontSize: 12,
    color: '#666',
  },
  reorderButton: {
    backgroundColor: '#f0f4ff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  reorderText: {
    fontSize: 12,
    color: '#0014A8',
    marginLeft: 5,
    fontWeight: '600',
  },
  viewAllButton: {
    marginVertical: 10,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0014A8',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#0014A8',
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
  },
  footerLogo: {
    width: 80,
    height: 20,
    marginTop: 5,
    resizeMode: 'contain',
  },
});

export default OrderHistoryScreen;
