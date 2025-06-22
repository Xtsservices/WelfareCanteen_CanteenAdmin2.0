import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Footer = () => {
    return (
        <View style={styles.footerContainer}>
            <Text style={styles.footerText}>proposed by</Text>
            <Image
                // source={require('')}
                style={styles.footerLogo}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        justifyContent: 'center',
    },
    footerText: {
        color: '#fff',
        fontSize: 12,
        marginRight: 5,
    },
    footerLogo: {
        width: 60,
        height: 20,
        resizeMode: 'contain',
    },
});

export default Footer;
