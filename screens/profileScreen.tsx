import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

const ProfileScreen = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    // Handle logout
    const handleLogout = () => {
        setIsLoggedIn(false); 
        console.log('User logged out');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Profile Image */}
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: 'https://example.com/profile.jpg' }} />
            </View>

            {/* Form Container */}
            {isLoggedIn ? (
                <View style={styles.formWrapper}>
                    <View style={styles.formContainer}>
                        <View style={styles.row}>
                            <TextInput style={styles.input} placeholder="First Name" />
                            <TextInput style={styles.input} placeholder="Last Name" />
                        </View>

                        <View style={styles.row}>
                            <TextInput style={styles.input} placeholder="Date Of Birth" />
                            <TextInput style={styles.input} placeholder="Gender" />
                        </View>

                        <TextInput style={styles.inputFull} placeholder="Enter your Email" />
                        <TextInput style={styles.inputFull} placeholder="Create Password" secureTextEntry />
                        <TextInput style={styles.inputFull} placeholder="Enter Aadhar card number" />
                        <TextInput style={styles.inputFull} placeholder="Enter Pan card number" />
                        <TextInput style={styles.inputFull} placeholder="Enter your ID" />

                        <TouchableOpacity style={styles.submitButton} onPress={handleLogout}>
                            <Text style={styles.submitButtonText}>LOG OUT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.loggedOutContainer}>
                    <Text style={styles.loggedOutText}>You have logged out successfully.</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                {/* <Text style={styles.footerText}>© 2025 YourApp. All rights reserved.</Text> */}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        padding: 20,
    },
    imageContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        resizeMode: 'cover',
        borderWidth: 3,
        borderColor: '#fff',
        marginBottom: 15,
    },
    formWrapper: {
        flex: 1,
        justifyContent: 'flex-end', 
        width: '100%',
        marginTop: 20,
    },
    formContainer: {
        backgroundColor: '#000080',
        borderRadius: 15,
        padding: 25,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '100%',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        flex: 1,
        marginHorizontal: 8,
        fontSize: 16,
    },
    inputFull: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        width: '100%',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonText: {
        color: '#000080',
        fontWeight: 'bold',
        fontSize: 18,
    },
    loggedOutContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    loggedOutText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
    },
    footer: {
        marginTop: 40, // Adds space between the image and footer
        backgroundColor: '#f5f5f5',
        width: '100%',
        alignItems: 'center',
        paddingVertical: 15,
    },
    footerText: {
        color: '#888',
        fontSize: 14,
    },
});

export default ProfileScreen;



// const styles = StyleSheet.create({
//     container: {
//         flexGrow: 1,
//         backgroundColor: '#f5f5f5',
//         alignItems: 'center',
//         padding: 20,
//     },
//     formWrapper: {
//         flex: 1,
//         justifyContent: 'flex-start',
//         width: '100%',
//         marginTop: 40, // Adds space to move the form down
//     },
//     imageContainer: {
//         marginBottom: 20,
//         alignItems: 'center',
//     },
//     image: {
//         width: 120,
//         height: 120,
//         borderRadius: 60,
//         resizeMode: 'cover',
//         borderWidth: 3,
//         borderColor: '#fff',
//         marginBottom: 15,
//     },
//     formContainer: {
//         backgroundColor: '#ffffff',
//         borderRadius: 15,
//         padding: 25,
//         width: '100%',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 10 },
//         shadowOpacity: 0.15,
//         shadowRadius: 15,
//         elevation: 10,
//         alignItems: 'center',
//     },
//     row: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 20,
//         width: '100%',
//     },
//     input: {
//         backgroundColor: '#f0f0f0',
//         borderRadius: 10,
//         padding: 12,
//         flex: 1,
//         marginHorizontal: 8,
//         fontSize: 16,
//     },
//     inputFull: {
//         backgroundColor: '#f0f0f0',
//         borderRadius: 10,
//         padding: 12,
//         marginBottom: 20,
//         width: '100%',
//         fontSize: 16,
//     },
//     submitButton: {
//         backgroundColor: '#000080',
//         borderRadius: 10,
//         padding: 15,
//         alignItems: 'center',
//         marginTop: 10,
//         width: '100%',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 6,
//     },
//     submitButtonText: {
//         color: '#fff',
//         fontWeight: 'bold',
//         fontSize: 18,
//     },
//     footer: {
//         marginTop: 30, // Adds space below the form
//         backgroundColor: '#f5f5f5',
//         width: '100%',
//         alignItems: 'center',
//         paddingVertical: 15,
//     },
//     footerText: {
//         color: '#888',
//         fontSize: 14,
//     },
// });

// export default ProfileScreen;
