import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DownNavbar from './downNavbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
const {PermissionsAndroid, Platform} = require('react-native');
const CameraRoll = require('@react-native-camera-roll/camera-roll').default;
const RNFetchBlob = require('rn-fetch-blob').default;

const PaymentMethod = () => {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState<string>('Cash');
  const [loading, setLoading] = useState(false);
  const [orderResponse, setOrderResponse] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authorization');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await fetch(
        'http://192.168.1.20:3002/api/order/placeOrder',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: token,
          },
          body: JSON.stringify({paymentMethod: selectedMethod}),
        },
      );
      const data = await response.json();
      if (response.ok) {
        setOrderResponse(data.data);
        setShowOrderDetails(true);
        Alert.alert('Order Placed Successfully');
      } else {
        Alert.alert('Payment Failed', 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not process payment.');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = () => {
    setShowOrderDetails(!showOrderDetails);
  };

  async function SaveQrToGallery() {
    try {
      Alert.alert('Saving QR Code', 'Saving QR code to gallery...');
      return;
      // Request permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your storage to save the QR code.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to save the QR code.',
          );
          return;
        }
      }

      // Extract base64 data from the QR code URI
      if (!orderResponse || !orderResponse.order.qrCode) {
        Alert.alert('Error', 'No QR code available to save.');
        return;
      }
      const base64Data = orderResponse.order.qrCode.split(',')[1];

      // Get the directory path
      const dirs = RNFetchBlob.fs.dirs;
      const path = `${dirs.DownloadDir}/QRCode_${orderResponse.order.id}.png`;

      // Write the file
      await RNFetchBlob.fs.writeFile(path, base64Data, 'base64');

      // Save to gallery
      await CameraRoll.save(path, {type: 'photo'});

      Alert.alert('Success', 'QR code saved to your gallery.');
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header1}>
        <Text style={styles.headerTitle1}>
          <Image
            source={{
              uri: 'https://www.joinindiannavy.gov.in/images/octaginal-crest.png',
            }}
            style={styles.logo}
          />
        </Text>
        <View style={styles.headerIcons1}>
          <TouchableOpacity style={styles.iconborder1}>
            <Image
              source={{
                uri: 'https://creazilla-store.fra1.digitaloceanspaces.com/icons/3235242/wallet-icon-sm.png',
              }}
              style={styles.icon1}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconborder1}>
            <Image
              source={{
                uri: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png',
              }}
              style={styles.icon1}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4d/Indian_Navy_crest.svg/1200px-Indian_Navy_crest.svg.png',
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>
          {orderResponse ? 'Order Details' : 'Payment Method'}
        </Text>
      </View>

      {!orderResponse ? (
        <>
          <View style={styles.paymentOptions}>
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/PhonePe_Logo.png',
              }}
              style={styles.icon}
            />
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Google_Pay_Logo_%282020%29.svg/1200px-Google_Pay_Logo_%282020%29.svg.png',
              }}
              style={styles.icon}
            />
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Paytm_logo.svg/1200px-Paytm_logo.svg.png',
              }}
              style={styles.icon}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.option,
              selectedMethod === 'Cash' && {
                borderColor: '#000080',
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedMethod('Cash')}>
            <Text style={styles.optionText}>Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayment}
            disabled={loading}>
            <Text style={styles.payButtonText}>
              {loading ? 'Processing...' : 'PAY'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleOrderDetails}>
            <Text style={styles.toggleButtonText}>
              {showOrderDetails ? 'Hide Order Details' : 'Show Order Details'}
            </Text>
          </TouchableOpacity>

          {showOrderDetails && (
            <ScrollView style={styles.orderDetailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID:</Text>
                <Text style={styles.detailValue}>{orderResponse.order.id}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Amount:</Text>
                <Text style={styles.detailValue}>
                  ₹{orderResponse.order.totalAmount}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValue}>
                  {orderResponse.payment.paymentMethod}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gateway Charges:</Text>
                <Text style={styles.detailValue}>
                  ₹{orderResponse.payment.gatewayCharges}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Paid:</Text>
                <Text style={styles.detailValue}>
                  ₹{orderResponse.payment.totalAmount}
                </Text>
              </View>

              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrCodeTitle}>Order QR Code:</Text>
                <Image
                  source={{uri: orderResponse.order.qrCode}}
                  style={styles.qrCodeImage}
                />
                <TouchableOpacity
                  style={[styles.payButton, {marginTop: 20}]}
                  onPress={SaveQrToGallery}>
                  <Text style={styles.payButtonText}>
                    Save QR Code to Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </>
      )}

      <DownNavbar style={styles.stickyNavbar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  title: {
    color: '#010080',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
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
  headerIcons1: {
    flexDirection: 'row',
  },
  icon1: {
    width: 30,
    height: 30,
  },
  iconborder1: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 7,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#000080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '80%',
    marginLeft: '10%',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 20,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  option: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    marginLeft: '10%',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: '#000080',
    fontWeight: 'bold',
  },
  stickyNavbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toggleButton: {
    backgroundColor: '#000080',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: '10%',
    marginBottom: 10,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderDetailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: '5%',
    marginBottom: 20,
    maxHeight: 700,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  detailValue: {
    color: '#555',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  qrCodeTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  qrCodeImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});

export default PaymentMethod;
