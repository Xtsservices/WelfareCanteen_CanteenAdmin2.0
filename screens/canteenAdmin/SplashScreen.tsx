import React, { useCallback } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Login: undefined;
  AdminDashboard: undefined;
};

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        try {
          const token = await AsyncStorage.getItem('authorization');
          console.log('Token:', token);

          setTimeout(() => {
            if (token) {
              navigation.navigate('AdminDashboard');
            } else {
              navigation.navigate('Login');
            }
          }, 2000);
        } catch (error) {
          console.error('Auth check error:', error);
          navigation.navigate('Login');
        }
      };

      checkAuth();

      return () => {};
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://www.joinindiannavy.gov.in/images/octaginal-crest.png',
        }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welfare Canteen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    marginTop: 20,
  },
});

export default SplashScreen;
