import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigationTypes';
import Toast from 'react-native-toast-message';  

type AddUserNavigationProp = StackNavigationProp<RootStackParamList, 'AddUser'>;

const AddUser = () => {
  const navigation = useNavigation<AddUserNavigationProp>();
  const route = useRoute();
  const { onAddUser } = route.params as { onAddUser: (user: any) => void };

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    mobile: '',
    email: '',
    aadhar: '',
    position: '',
    address: '',
    adminName: '',
    adminId: '',
    otp: ['', '', '', ''],
  });
  

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });
  };

  const sendOtp = () => {
    if (!formData.mobile) {
      Alert.alert('Error', 'Please enter mobile number first');
      return;
    }
    Alert.alert('OTP Sent', `OTP has been sent to ${formData.mobile}`);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.mobile || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newUser = {
      name: formData.name,
      dob: formData.dob,
      gender: formData.gender,
      mobile: formData.mobile,
      email: formData.email,
      aadhar: formData.aadhar,
      position: formData.position,
      address: formData.address,
      adminName: formData.adminName,
      adminId: formData.adminId,
    };

    onAddUser(newUser);
    Alert.alert('Success', 'User added successfully');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New User</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              placeholder="Full name"
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
              <Text style={styles.label}>DOB</Text>
              <TextInput
                placeholder="DD/MM/YYYY"
                value={formData.dob}
                onChangeText={(text) => handleChange('dob', text)}
                style={styles.input}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 6 }]}>
              <Text style={styles.label}>Gender</Text>
              <TextInput
                placeholder="Male/Female"
                value={formData.gender}
                onChangeText={(text) => handleChange('gender', text)}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile *</Text>
            <TextInput
              placeholder="Mobile number"
              value={formData.mobile}
              onChangeText={(text) => handleChange('mobile', text)}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              placeholder="Email ID"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              style={styles.input}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Position</Text>
            <TextInput
              placeholder="Job position"
              value={formData.position}
              onChangeText={(text) => handleChange('position', text)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              placeholder="Full address"
              value={formData.address}
              onChangeText={(text) => handleChange('address', text)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Aadhaar</Text>
            <TextInput
              placeholder="Aadhaar number"
              value={formData.aadhar}
              onChangeText={(text) => handleChange('aadhar', text)}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Admin Name</Text>
            <TextInput
              placeholder="Admin name"
              value={formData.adminName}
              onChangeText={(text) => handleChange('adminName', text)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Admin ID</Text>
            <TextInput
              placeholder="Admin ID"
              value={formData.adminId}
              onChangeText={(text) => handleChange('adminId', text)}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity onPress={sendOtp} style={styles.sendOtpButton}>
            <Text style={styles.sendOtpText}>Send OTP</Text>
          </TouchableOpacity>

          <View style={styles.otpContainer}>
            {formData.otp.map((digit, index) => (
              <TextInput
                key={index}
                value={digit}
                onChangeText={(text) => handleOtpChange(index, text)}
                style={styles.otpInput}
                maxLength={1}
                keyboardType="numeric"
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            proposed by <Text style={styles.footerBold}>🔸 your logo here 🔸</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    marginTop: 50,
    backgroundColor: '#0033A0', 
    height: 60, 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backArrow: { 
    color: '#fff', 
    fontSize: 24,
    marginRight: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  form: { 
    padding: 16, 
    paddingBottom: 30 
  },
  avatarContainer: { 
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#E5E5E5', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  cameraIcon: { 
    fontSize: 30, 
    color: '#555' 
  },
  inputGroup: { 
    marginBottom: 15 
  },
  label: { 
    fontSize: 14, 
    color: '#555', 
    marginBottom: 5,
    fontWeight: '500',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sendOtpButton: { 
    alignSelf: 'flex-end', 
    marginBottom: 15,
  },
  sendOtpText: { 
    color: '#2563EB', 
    fontWeight: '600', 
    fontSize: 14,
  },
  otpContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25,
  },
  otpInput: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    width: 50, 
    height: 50, 
    textAlign: 'center', 
    fontSize: 18,
    backgroundColor: '#fff',
  },
  submitButton: { 
    backgroundColor: '#0033A0', 
    borderRadius: 8, 
    paddingVertical: 15, 
    alignItems: 'center', 
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  footerText: { 
    textAlign: 'center', 
    marginTop: 10, 
    fontSize: 12, 
    color: '#999' 
  },
  footerBold: { 
    fontWeight: 'bold', 
    color: '#555' 
  },
});

export default AddUser;