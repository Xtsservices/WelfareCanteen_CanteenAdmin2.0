// import React, { useState } from 'react';
// import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
// import ThermalPrinterModule from 'react-native-thermal-printer';

// export default function App() {
//   const [state, setState] = useState({ text: '' });

//   const handlePrint = async () => {
//     try {
//       console.log('we will invoke');
//       console.log(state.text);

//       await ThermalPrinterModule.printTcp({
//         ip: '192.168.1.5', // Replace with your printer's IP
//         port: 9100,
//         timeout: 30000,
//         payload:
//           '[C]<img>https://via.placeholder.com/300.jpg</img>\n' +
//           '[L]\n' +
//           '[C]<font size="big">ORDER Nº045</font>\n' +
//           '[L]\n' +
//           '-----------------------------\n' +
//           '[L]<b>BEAUTIFUL SHIRT</b>[R]9.99€\n' +
//           '[L]  + Size : S\n' +
//           '[L]<b>AWESOME HAT</b>[R]24.99€\n' +
//           '[L]  + Size : 57/58\n' +
//           '[C]\n' +
//           '-----------------------------\n' +
//           '[R]TOTAL PRICE :[R]34.98€\n' +
//           '\n\n\n',
//       });
//     } catch (error) {
//       console.error('Print error:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Enter some text:</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Type here"
//         value={state.text}
//         onChangeText={(text) => setState({ text })}
//       />
//       <Button title="Print" onPress={handlePrint} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   input: {
//     height: 50,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   label: {
//     marginBottom: 5,
//     fontSize: 16,
//   },
// });