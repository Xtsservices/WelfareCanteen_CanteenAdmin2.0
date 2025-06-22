import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { NavigationContainer, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
    Login: undefined; // Define the 'Login' route and its params if any
};

const HomePage = ({ navigation }: { navigation: NavigationProp<RootStackParamList> }) => {

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.navigate('Login' as never); // Ensure 'Login' matches a valid route name in your navigation setup
        }, 3000);

        return () => clearTimeout(timer); // Cleanup the timer
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
                source={{
                    uri: 'https://www.joinindiannavy.gov.in/images/octaginal-crest.png',
                }}
                style={styles.image}
                resizeMode="contain"
            />
            <Text style={{ color: '#fff', fontSize: 30, marginTop: 20 }}>Welfare Canteen</Text>
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
});

export default HomePage;