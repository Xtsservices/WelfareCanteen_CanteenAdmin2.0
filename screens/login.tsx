import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Login, ResendOtp, VerifyOtp } from './services/restApi';
// import MenuTestScreen from './offline/models/menuTestScreen';

type RootStackParamList = {
  SelectCanteen: undefined;
  AdminDashboard: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'SelectCanteen'>;

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [showResend, setShowResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenn, setTokenn] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const otpInputs = useRef<Array<TextInput | null>>([]);


    useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        try {
          const token = await AsyncStorage.getItem('authorization');
          console.log("token", token);
          setTimeout(() => {
            if (token) {
              navigation.navigate('AdminDashboard' as never);
            } else {
              navigation.navigate('Login' as never);
            }
          }, 2000); // 2 seconds splash
        } catch (error) {
          console.error('Auth check error:', error);
          navigation.navigate('Login' as never);
        }
      };

      checkAuth();

      // Optional cleanup if needed
      return () => {};
    }, [navigation])
  );


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (otpSent) {
      setShowResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value.length === 1 && index < otp.length - 1) {
      otpInputs.current[index + 1]?.focus();
    } else if (value === '' && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };


  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const validatePhoneNumber = (number: string) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(number);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
    });
  };

  const sendOtp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      showToast('error', 'Invalid phone number. Enter a valid 10-digit number.');
      return;
    }
    setLoading(true);
    try {
      // Log the URL to verify it's correct
      const url = "https://server.welfarecanteen.in/api/login"; // Replace with your actual URL
      console.log('Calling API URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ mobile: phoneNumber, type:"tab" }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        showToast('success', 'OTP sent successfully.');
        setOtpSent(true);
        setTimer(60);
        setShowResend(false);
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        showToast('error', `Failed to send OTP: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Send OTP Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      showToast('error', `Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // const sendOtp = async () => {
  //   if (!validatePhoneNumber(phoneNumber)) {
  //     showToast('error', 'Invalid phone number. Enter a valid 10-digit number.');
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const response = await fetch(Login(), {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ mobile: phoneNumber }),
  //     });

  //     if (response.ok) {
  //       showToast('success', 'OTP sent successfully.');
  //       setOtpSent(true);
  //       setTimer(60);
  //       setShowResend(false);
  //     } else {
  //       showToast('error', 'Failed to send OTP. Try again.');
  //     }
  //   } catch (error) {
  //     console.error('Send OTP Error:', error);
  //     showToast('error', 'Network error. Could not connect to server.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const verifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      showToast('error', 'Enter the full 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(VerifyOtp(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneNumber, otp: enteredOtp }),
      });
      console.log('Response123:', response);


      const data = await response.json();

      if (response.ok) {
        console.log('Token:', data.token, data);
        showToast('success', 'OTP verified successfully.');
        navigation.navigate('AdminDashboard');
        await AsyncStorage.setItem('authorization', data.token);
      } else {
        showToast('error', `Invalid OTP: ${data.message || 'Try again.'}`);
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      showToast('error', 'Network error. Could not verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch(ResendOtp(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneNumber }),
      });

      if (response.ok) {
        showToast('success', 'OTP resent successfully.');
        setTimer(60);
        setShowResend(false);
      } else {
        showToast('error', 'Failed to resend OTP. Try again.');
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      showToast('error', 'Network error. Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={{ color: '#fff', fontSize: 30, marginTop: 20 }}>
          Welfare Canteen
        </Text>
      </View>

      <Text style={styles.title}>Login or Sign up</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.flag}>🇮🇳</Text>
        <TextInput
          style={styles.phoneInput}
          placeholder="+91 | Enter your phone number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          maxLength={10}
        />
      </View>

      {!otpSent && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={sendOtp}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>Get OTP</Text>
          )}
        </TouchableOpacity>
      )}

      {otpSent && (
        <>
          <Text style={styles.otpLabel}>Enter OTP</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  otpInputs.current[index] = ref;
                }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={verifyOtp}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          {showResend ? (
            <TouchableOpacity
              style={styles.smallButton}
              onPress={resendOtp}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.smallButtonText}>Resend OTP</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={{ marginBottom: 10, color: 'gray' }}>
              Resend in {timer}s
            </Text>
          )}
        </>
      )}

      <Text style={styles.poweredBy}>Powered by WorldTech.in</Text>
      <View>
        {/* <MenuTestScreen/> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  notificationBar: {
    backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent background
    borderColor: 'green', // Green border
    borderWidth: 1,
    padding: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationText: {
    color: 'green', // Green text color for better visibility
    fontSize: 14,
  },
  logoContainer: {
    backgroundColor: '#010080',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 100,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
  },
  logo: {
    width: 400,
    height: 250,
    marginTop: -20,
    marginBottom: -20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#010080',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%',
    height: 50,
  },
  flag: {
    fontSize: 18,
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
  },
  otpLabel: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#010080',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    width: 50,
    height: 50,
  },
  confirmButton: {
    backgroundColor: '#010080',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smallButton: {
    backgroundColor: '#010080',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  poweredBy: {
    fontSize: 12,
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default LoginScreen;
