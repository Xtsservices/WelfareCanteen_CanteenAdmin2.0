// import React, { useState } from 'react';
// import type { PropsWithChildren } from 'react';
// import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, Button, TextInput } from 'react-native';
// import ThermalPrintModule from 'react-native-thermal-printer';
// import TcpSocket from "react-native-tcp-socket";


// ThermalPrintModule.defaultConfig = {
//     ...ThermalPrintModule.defaultConfig,
//     ip: '',
//     port: 9100,
//     timeout: 30000,
// }

// const printQR = () => {
//     const isDarkMode = useColorScheme() === 'dark';
//     const [state, setState] = useState({
//         text: ''
//     })

//     const onPress = async () => {
//         try {
//             console.log('we will invoke');
//             console.log(state.text);

//             await ThermalPrintModule.printTcp({
//                 ip: '192.168.1.5',
//                 port: 9100,
//                 timeout: 30000,
//                 payload:
//                     '[C]<img>https://via.placeholder.com/300.jpg</img>\n' +
//                     '[L]\n' +
//                     '[C]<font size="big">ORDER Nº045</font>\n' +
//                     '[L]\n' +
//                     '-----------------------------\n' +
//                     '[L]<b>BEAUTIFUL SHIRT</b>[R]9.99€\n' +
//                     '[L]  + Size : S\n' +
//                     '[L]<b>AWESOME HAT</b>[R]24.99€\n' +
//                     '[L]  + Size : 57/58\n' +
//                     '[C]\n' +
//                     '-----------------------------\n' +
//                     '[R]TOTAL PRICE :[R]34.98€\n' +
//                     '\n\n\n',
//             });

//             await ThermalPrintModule.printBluetooth({
//                 payload: "hello world",
//                 printerNbrCharactersPerLine: 38
//             })
//         } catch (error) {
//             console.error('Print error:', error);
//         }
//     }

//     return (
//         <SafeAreaView style={{ flex: 1 }}>
//             <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#000' : '#fff'} />
//             <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: isDarkMode ? '#000' : '#fff' }}>
//                 <View style={styles.container}>
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Enter text to print"
//                         value={state.text}
//                         onChangeText={(text) => setState({ ...state, text })}
//                     />
//                     <Button title="Print" onPress={onPress} />
//                 </View>
//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// export default printQR;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//     },
//     input: {
//         height: 40,
//         borderColor: 'gray',
//         borderWidth: 1,
//         marginBottom: 20,
//         width: '80%',
//         paddingHorizontal: 10,
//     },
//     button: {
//         backgroundColor: '#007BFF',
//         padding: 10,
//         borderRadius: 5,
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 16,
//     },
//     qrCode: {
//         marginTop: 20,
//         width: 200,
//         height: 200,
//         backgroundColor: '#000',
//     },
//     qrCodeText: {
//         color: '#fff',
//         fontSize: 16,
//         textAlign: 'center',
//         marginTop: 10,
//     },
//     qrCodeImage: {
//         width: 200,
//         height: 200,
//         marginTop: 20,
//     },
// });




