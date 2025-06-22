import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import DownNavbar from './downNavbar';

const OrderPlacedScreen = () => {
  const orderedItems = [
    {id: '1', name: 'Rawa Dosa', quantity: 4, rate: 399},
    {id: '2', name: 'Rawa Dosa', quantity: 4, rate: 399},
    {id: '3', name: 'Rawa Dosa', quantity: 4, rate: 399},
    {id: '4', name: 'Rawa Dosa', quantity: 4, rate: 399},
    {id: '5', name: 'Rawa Dosa', quantity: 4, rate: 399},
  ];

  const billSummary = {
    itemTotal: 399,
    gstCharges: 29,
    platformFee: 10,
    totalAmount: 438,
  };

  const renderItem = ({item}: any) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.name}</Text>
      <Text style={styles.tableCell}>{item.quantity}</Text>
      <Text style={styles.tableCell}>{item.rate}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backArrow}>{'<'}</Text>
      </View>
      <Text style={styles.title}>Ordered Details</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Item Name</Text>
          <Text style={styles.tableHeaderCell}>Quantity</Text>
          <Text style={styles.tableHeaderCell}>Item Rate</Text>
        </View>
        <FlatList
          data={orderedItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </View>
      <Text style={styles.billTitle}>Bill Summary</Text>
      <View style={styles.billContainer}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Item Total</Text>
          <Text style={styles.billValue}>{billSummary.itemTotal}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>GST And Restaurant Charges</Text>
          <Text style={styles.billValue}>{billSummary.gstCharges}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Platform Fee</Text>
          <Text style={styles.billValue}>{billSummary.platformFee}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Total Amount</Text>
          <Text style={styles.billValue}>{billSummary.totalAmount}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.qrButton}>
        <Text style={styles.qrButtonText}>QR CODE</Text>
      </TouchableOpacity>
      <DownNavbar
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          paddingVertical: 10,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    backgroundColor: '#000080',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backArrow: {
    color: '#fff',
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  billContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  billLabel: {
    fontSize: 16,
  },
  billValue: {
    fontSize: 16,
  },
  qrButton: {
    backgroundColor: '#000080',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderPlacedScreen;
