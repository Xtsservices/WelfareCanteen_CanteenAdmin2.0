import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import DownNavbar from './downNavbar';

const contactNumbers = [
  {label: 'Admin Contact Number', number: '+91 98409 28222'},
  {label: 'Super Admin Contact Number', number: '+91 987 654 3210'},
  {label: 'Customer Care', number: '1800-123-456'},
];

const CallCenterScreen: React.FC = () => {
  const handleDial = (number: string) => {
    const phoneNumber = `tel:${number.replace(/\s+/g, '')}`;
    Linking.openURL(phoneNumber);
  };

  return (
    <SafeAreaView style={styles.container}>
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
      <View style={styles.content}>
        {contactNumbers.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => handleDial(item.number)}
            activeOpacity={0.7}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.number}>{item.number}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <DownNavbar />
    </SafeAreaView>
  );
};

// ...styles remain unchanged

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', marginTop: 50},
  content: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  card: {
    width: '90%',
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  label: {fontSize: 18, fontWeight: 'bold', marginBottom: 8},
  number: {fontSize: 16, color: '#0014A8'},
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
});

export default CallCenterScreen;
