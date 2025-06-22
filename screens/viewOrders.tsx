import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import DownNavbar from './downNavbar';

export interface Order {
  id: string;
  orderNumber: string;
  dateTime: string;
  session: string;
}

const orders: Order[] = [
  {
    id: '1',
    orderNumber: '12345',
    dateTime: '2023-10-01 12:30 PM',
    session: 'Afternoon',
  },
  {
    id: '2',
    orderNumber: '12346',
    dateTime: '2023-10-02 01:00 PM',
    session: 'Afternoon',
  },
  {
    id: '3',
    orderNumber: '12347',
    dateTime: '2023-10-03 02:15 PM',
    session: 'Afternoon',
  },
];

const ViewOrders: React.FC = () => {
  const renderOrder = ({item}: {item: Order}) => (
    <View style={styles.orderItem}>
      <View style={styles.orderDetails}>
        <Text style={styles.orderNumber}>Order Number: {item.orderNumber}</Text>
        <Text style={styles.session}>{item.session}</Text>
        <Text style={styles.dateTime}>{item.dateTime}</Text>
      </View>
      <TouchableOpacity style={styles.reorderButton}>
        <Text style={styles.reorderText}>Re-Order</Text>
      </TouchableOpacity>
      {/* <Icon name="chevron-forward" size={24} color="#000" /> */}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Image
            source={{
              uri: 'https://www.joinindiannavy.gov.in/images/octaginal-crest.png',
            }}
            style={styles.logo}
          />
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconborder}>
            <Image
              source={{
                uri: 'https://creazilla-store.fra1.digitaloceanspaces.com/icons/3235242/wallet-icon-sm.png',
              }}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconborder}>
            <Image
              source={{
                uri: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png',
              }}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.header1}>
        {/* <Icon name="arrow-back" size={24} color="#fff" /> */}
        <Text style={styles.headerTitle1}>Orders History</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContainer}
      />
      <DownNavbar style={styles.stckyNavbar} />
      {/* Footer or any additional content can go here */}
      {/* <Text style={styles.footer}>Powered by WorldTech.in</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginTop: 50,
  },
  listContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0014A8',
    paddingVertical: 20,
    padding: 30,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    width: 30,
    height: 30,
  },
  iconborder: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 7,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0014A8',
    paddingVertical: 20,
    padding: 30,
  },
  headerTitle1: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderDetails: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  session: {
    fontSize: 14,
    color: '#555',
  },
  dateTime: {
    fontSize: 14,
    color: '#555',
  },
  reorderButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  reorderText: {
    fontSize: 14,
    color: '#000',
  },
  footer: {
    textAlign: 'center',
    padding: 16,
    color: '#555',
  },
  stckyNavbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default ViewOrders;
