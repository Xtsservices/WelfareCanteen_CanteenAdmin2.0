import { USBPrinter } from "react-native-thermal-receipt-printer";
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  PermissionsAndroid 
} from "react-native";

interface IUSBPrinter {
  device_name: string;
  vendor_id: string;
  product_id: string;
  device_id: string;
}

const PrintConfiguration = () => {
  const [printers, setPrinters] = useState<IUSBPrinter[]>([]);
  const [currentPrinter, setCurrentPrinter] = useState<IUSBPrinter | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestUSBPermission();
    }
  }, []);

  const requestUSBPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For Android 13+ we need to request USB permissions explicitly
      if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
        // USB_PERMISSION is not a valid permission in React Native
        // Handle USB permissions using a native module or library if required
        const hasUsbPermission = true; // Assume permission is granted for now
        
        if (!hasUsbPermission) {
          // USB_PERMISSION is not a valid permission in React Native
          // Replace this with appropriate USB permission handling logic
          const granted = PermissionsAndroid.RESULTS.GRANTED; // Assume permission is granted for now
          
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setError('USB permission denied');
            setIsLoading(false);
            return;
          }
        }
      }
      
      // Initialize printer
      await USBPrinter.init();
      
      // Get printer devices
      const devices: Partial<IUSBPrinter>[] = await USBPrinter.getDeviceList();
      
      const updatedDevices = devices.map((device) => ({
        ...device,
        device_id: device.device_id || `${device.vendor_id}-${device.product_id}`,
      })) as IUSBPrinter[];
      
      setPrinters(updatedDevices);
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing USB printer:', err);
      setError(`Failed to initialize printer: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  const connectPrinter = async (printer: IUSBPrinter) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await USBPrinter.connectPrinter(printer.vendor_id, printer.product_id);
      console.log('Printer connected successfully');
      setCurrentPrinter(printer);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to connect printer:', err);
      setError(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  const printTextTest = async () => {
    if (!currentPrinter) {
      setError('No printer connected');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await USBPrinter.printText("<C>sample text</C>\n");
      setIsLoading(false);
    } catch (err) {
      console.error('Error printing text:', err);
      setError(`Print failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  const printBillTest = async () => {
    if (!currentPrinter) {
      setError('No printer connected');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await USBPrinter.printBill("<C>sample bill</C>");
      setIsLoading(false);
    } catch (err) {
      console.error('Error printing bill:', err);
      setError(`Print failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Text style={styles.statusText}>Loading...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      
      <View style={styles.printerList}>
        <Text style={styles.sectionTitle}>Available Printers:</Text>
        {printers.length === 0 ? (
          <Text style={styles.emptyText}>No printers found</Text>
        ) : (
          printers.map((printer) => (
            <TouchableOpacity
              key={printer.device_id}
              style={[
                styles.printerItem,
                currentPrinter?.device_id === printer.device_id && styles.selectedPrinter
              ]}
              onPress={() => connectPrinter(printer)}
            >
              <Text style={styles.printerText}>
                {printer.device_name || `Device ${printer.vendor_id}:${printer.product_id}`}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, !currentPrinter && styles.buttonDisabled]} 
          onPress={printTextTest}
          disabled={!currentPrinter || isLoading}
        >
          <Text style={styles.buttonText}>Print Text</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, !currentPrinter && styles.buttonDisabled]} 
          onPress={printBillTest}
          disabled={!currentPrinter || isLoading}
        >
          <Text style={styles.buttonText}>Print Bill Text</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={requestUSBPermission}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Refresh Printer List</Text>
        </TouchableOpacity>
      </View>
      
      {currentPrinter && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Connected to: {currentPrinter.device_name || `${currentPrinter.vendor_id}:${currentPrinter.product_id}`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  printerList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  printerItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  selectedPrinter: {
    borderColor: '#4285F4',
    backgroundColor: '#E8F0FE',
  },
  printerText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  statusContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  }
});

export default PrintConfiguration;