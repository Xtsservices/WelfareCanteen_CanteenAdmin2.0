import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './navigationTypes';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type WalletScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WalletScreen'
>;

interface WalletScreenProps {
  navigation: WalletScreenNavigationProp;
}

const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  const [showAll, setShowAll] = useState(false); // <-- State for toggling history

  const walletBalance = 200;
  
  const history = [
    { id: '1', amount: 5 },
    { id: '2', amount: 20 },
    { id: '3', amount: 5 },
    { id: '4', amount: 20 },
    { id: '5', amount: 15 },
    { id: '6', amount: 10 },
    { id: '7', amount: 25 },
  ];

  const barData = [2, 4, 6, 8, 7, 3, 10]; // Example data for Mon-Sun

  const displayedHistory = showAll ? history : history.slice(0, 4); // Show only first 4 unless showAll

  return (
    <View style={styles.container}>
      {/* Top Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
          <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
        </View>
      </View>

      {/* Wallet Section */}
      <View style={styles.walletCard}>
        <Text style={styles.walletAmount}>₹ {walletBalance}</Text>

        {/* Bar Chart */}
        <View style={styles.barChart}>
          {barData.map((value, index) => (
            <View key={index} style={styles.barItem}>
              <View style={[styles.bar, { height: value * 10 }]} />
              <Text style={styles.barLabel}>
                {['Mon', 'Tue', 'Web', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* History Section */}
      <ScrollView style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          <TouchableOpacity onPress={() => setShowAll(!showAll)}>
            <Text style={styles.viewAllText}>{showAll ? 'View Less' : 'View All'}</Text>
          </TouchableOpacity>
        </View>

        {displayedHistory.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyItemRow}>
              <Text style={styles.historyLabel}>Amount</Text>
              <Text style={styles.historyAmount}>₹{item.amount}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>proposed by</Text>
        <Image
          source={{ uri: 'https://watabix.com/assets/logo.png' }} // Replace with correct logo
          style={styles.footerLogo}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0014A8',
    paddingTop: 100,
    paddingBottom: 20,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 35,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    marginLeft: 5,
  },
  walletCard: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0014A8',
    alignItems: 'center',
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0014A8',
    marginBottom: 10,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 20,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 10,
    color: '#333',
  },
  historySection: {
    flex: 1,
    marginHorizontal: 15,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#0014A8',
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyLabel: {
    fontSize: 14,
    color: '#333',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0014A8',
  },
  footer: {
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  footerLogo: {
    width: 80,
    height: 20,
    resizeMode: 'contain',
    marginTop: 5,
  },
});

export default WalletScreen;
