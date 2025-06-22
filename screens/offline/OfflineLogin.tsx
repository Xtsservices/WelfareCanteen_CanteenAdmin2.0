import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    StyleSheet,
} from 'react-native';
import SQLite, {
    SQLiteDatabase,
    SQLError,
    SQLiteTransaction,
    SQLResultSet,
} from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
SQLite.DEBUG(false);

const OfflineLogin: React.FC = () => {
    const [db, setDb] = useState<SQLiteDatabase | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

    useEffect(() => {
        const initDatabase = async () => {
            try {
                const database = await SQLite.openDatabase({
                    name: 'users.db',
                    location: 'default',
                });
                setDb(database);
                await database.executeSql(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
          );
        `);
            } catch (error) {
                console.error('DB Initialization error:', error);
            }
        };

        initDatabase();
    }, []);

    const getData = async () => {
        if (!db) {
            Alert.alert('Error', 'Database is not initialized.');
            return;
        }

        db.transaction((tx: SQLiteTransaction) => {
            tx.executeSql(
                'SELECT * FROM users;',
                [],
                (_, results: SQLResultSet) => {
                    const rows = results.rows;
                    const users = [];

                    for (let i = 0; i < rows.length; i++) {
                        users.push(rows.item(i));
                    }

                    console.log('All users:', users);
                    Alert.alert('User Data', JSON.stringify(users, null, 2));
                },
                (error: SQLError) => {
                    console.error('Select all error:', error);
                    Alert.alert('Error', 'Failed to retrieve users.');
                    return true;
                }
            );
        });
    };

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Username and password are required.');
            return;
        }

        if (!db) {
            Alert.alert('Error', 'Database is not initialized.');
            return;
        }

        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM users WHERE username = ? AND password = ?;',
                [username, password],
                (_, results) => {
                    if (results.rows.length > 0) {
                        setLoggedInUser(username);
                        Alert.alert('Login Successful', `Welcome back, ${username}!`);
                    } else {
                        tx.executeSql(
                            'INSERT INTO users (username, password) VALUES (?, ?);',
                            [username, password],
                            () => {
                                setLoggedInUser(username);
                                Alert.alert('Registration Successful', `Welcome, ${username}!`);
                            },
                            (error: SQLError) => {
                                console.error('Insert error:', error);
                                Alert.alert('Error', 'User registration failed.');
                                return true;
                            }
                        );
                    }
                },
                (error: SQLError) => {
                    console.error('Select error:', error);
                    Alert.alert('Error', 'Login failed.');
                    return true;
                }
            );
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Offline Login</Text>
            {loggedInUser ? (
                <Text style={styles.welcome}>Welcome, {loggedInUser}!</Text>
            ) : (
                <>
                    <TextInput
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        style={styles.input}
                        autoCapitalize="none"
                    />
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                    <Button title="Login / Register" onPress={handleLogin} />
                    <View style={{ height: 10 }} />
                    <Button title="Show All Users" onPress={getData} />
                </>
            )}
            <Button title="Show All Users" onPress={getData} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
    welcome: { fontSize: 18, textAlign: 'center', color: 'green' },
});

export default OfflineLogin;
