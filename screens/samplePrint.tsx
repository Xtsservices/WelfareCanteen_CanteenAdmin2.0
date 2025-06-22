import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import BluetoothSerial  from 'react-native-bluetooth-serial-next';

const BluetoothPrinter: React.FC = () => {
  const [connected, setConnected] = useState(false);

  const connectToPrinter = async () => {
    try {
      const isEnabled = await BluetoothSerial.isEnabled();
      if (!isEnabled) {
        await BluetoothSerial.requestEnable();
      }

      const devices = await BluetoothSerial.list();
      const printer = devices.find(device => device.name?.includes('PrinterName'));

      if (printer) {
        const success = await BluetoothSerial.connect(printer.id);
        if (success) {
          setConnected(true);
          Alert.alert('Success', 'Printer connected!');
        } else {
          Alert.alert('Error', 'Failed to connect to printer.');
        }
      } else {
        Alert.alert('Error', 'Printer not found.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'An error occurred while connecting to the printer.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 10 }}>
        {connected ? 'Printer is connected' : 'Printer is not connected'}
      </Text>
      <Button title="Connect to Printer" onPress={connectToPrinter} />
    </View>
  );
};

export default BluetoothPrinter;
