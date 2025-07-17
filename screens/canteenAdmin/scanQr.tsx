import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {getDatabase} from '../offline/database';
import {SQLError} from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  VerifyToken: {
    token: string;
    ordersWithItems: Array<{[key: string]: any}>;
    orderData: any; // Add this
    canteenName: string; // Added canteenName
  };
  AdminDashboard: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'VerifyToken'>;

const BluetoothControlScreen = () => {
  const device = useCameraDevice('back');
  const navigation = useNavigation<NavigationProp>();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {height, width} = Dimensions.get('window');
  const isPortrait = height >= width;

  // Request camera permission
  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await request(PERMISSIONS.ANDROID.CAMERA);
      setHasPermission(status === RESULTS.GRANTED);
    };

    requestCameraPermission();
  }, []);

  // QR Code Scanner configuration
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (!isScanning || isProcessing) return;

      const code = codes[0];
      if (code?.value && code.value !== scannedData) {
        setScannedData(code.value);
        setIsScanning(false);
        handleScannedCode(code.value);
      }
    },
  });

  // Animation effect
  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      animatedValue.stopAnimation();
    }
  }, [animatedValue, isScanning]);

  const handleScannedCode = async (data: string) => {
    setIsProcessing(true);

    try {
      // Initialize the database
      const db = await getDatabase();
      let canteenName = await AsyncStorage.getItem('canteenName');

      // Process the scanned data (e.g., validate token, connect to device, etc.)
      const orderIdMatch = data.match(/\/order\/(\d+)/);
      const orderId = orderIdMatch ? orderIdMatch[1] : null;
      if (orderId) {
        await AsyncStorage.setItem('orderId', orderId);
      }

      if (orderId) {
        console.log('Order ID:', orderId);
      } else {
        console.error('Invalid QR code format. Order ID not found.');
        Alert.alert('Error', 'Invalid QR code format. Order ID not found.');
        resetScanner();
        return;
      }

      // Simulate API call or Bluetooth connection
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, we'll just show an alert
      // Alert.alert(
      //   'QR Code Scanned',
      //   `Data: ${data}`,
      //   [
      //     {
      //       text: 'OK',
      //       onPress: () => {
      //         resetScanner();
      //         // Navigate to appropriate screen based on scanned data
      //         if (data.includes('admin')) {
      //           navigation.navigate('AdminDashboard');
      //         }
      //         else {

      //         }
      //       },
      //     },
      //   ]
      // );

      console.log('@@@@@@@@@@@', orderId);
      db.transaction(tx => {
        // Get all rows
        tx.executeSql(
          `SELECT o.*, oi.* 
           FROM orders o
           INNER JOIN order_items oi ON o.id = oi.orderId
           WHERE o.id = ?`, // Fetch order and order items by Order ID
          [orderId],
          (txObj, resultSet) => {
            const ordersWithItems: Array<{[key: string]: any}> = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              ordersWithItems.push(resultSet.rows.item(i));
            }
            // console.log('Orders with Items:', ordersWithItems);
            const orderData = resultSet.rows.item(0);
            console.log('Order Data===:', orderData);
            //this disable we can scan completed
            if (orderData.status === 'completed') {
              Alert.alert('Error', 'This order has already been completed.');
              resetScanner();
              return;
            }
            setIsProcessing(false);

            // Navigate to the next page and pass the data
            navigation.navigate('VerifyToken', {
              token: data,
              ordersWithItems,
              orderData,
              canteenName: canteenName || '',
            });
          },
          (error: SQLError) => {
            console.log('Error fetching orders with items', error);
          },
        );
      });
    } catch (error) {
      console.error('Error executing SQL query:', error);
      Alert.alert('Error', 'Failed to execute database query.');
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setIsScanning(true);
  };

  const handleShowQRPress = () => {
    // This would typically show a generated QR code for pairing
    // For now, we'll just simulate scanning being enabled
    resetScanner();
  };

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={{color: 'white'}}>Camera not available</Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={{color: 'white', marginBottom: 20}}>
          Camera permission not granted
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            request(PERMISSIONS.ANDROID.CAMERA).then(status => {
              setHasPermission(status === RESULTS.GRANTED);
            })
          }>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const translateY = animatedValue.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 250 - 2],
  });

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isScanning && hasPermission}
          codeScanner={codeScanner}
        />
      </View>

      {/* QR Code Scan Box */}
      <View style={styles.overlay}>
        <View style={styles.qrBlock}>
          {isScanning && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{translateY}],
                },
              ]}
            />
          )}
        </View>
        <Text style={styles.scanInstruction}>
          {isScanning ? 'Align QR code within the frame' : 'Processing...'}
        </Text>
      </View>

      {/* Buttons + Footer */}
      <View style={styles.overlayContent}>
        <View style={{flex: 1}} />

        <View style={styles.tokenContainer}>
          {isProcessing ? (
            <View style={styles.button}>
              <ActivityIndicator size="small" color="#010080" />
            </View>
          ) : (
            <>
              {/* <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Verify</Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                onPress={handleShowQRPress}
                style={styles.button}>
                <Text style={styles.buttonText}>
                  {isScanning ? 'Show QR Code' : 'Scan Again'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>proposed by</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBlock: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: 'red',
  },
  scanInstruction: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tokenContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#010080',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  footerText: {
    color: 'white',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});

export default BluetoothControlScreen;
