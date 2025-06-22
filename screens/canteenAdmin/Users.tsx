import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigationTypes';
import { RouteProp } from '@react-navigation/native';

type UsersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Users'>;
type UsersScreenRouteProp = RouteProp<RootStackParamList, 'Users'>;

const Users: React.FC = () => {
  const navigation = useNavigation<UsersScreenNavigationProp>();
  const route = useRoute<UsersScreenRouteProp>();

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Worker 1',
      mobile: '123-456-7890',
      position: 'Software Engineer',
      email: 'worker1@example.com',
      address: '123 Main St',
      dob: '01/01/1990',
      gender: 'Male',
      aadhar: '1234-5678-9012',
      adminName: 'Admin 1',
      adminId: '111111'
    },
    {
      id: 2,
      name: 'Worker 2',
      mobile: '234-567-8901',
      position: 'Project Manager',
      email: 'worker2@example.com',
      address: '456 Elm St',
      dob: '02/02/1992',
      gender: 'Female',
      aadhar: '2234-5678-9012',
      adminName: 'Admin 2',
      adminId: '222222'
    }
  ]);

  useEffect(() => {
    if (route.params?.newUser) {
      const newUser: {
        name: string;
        mobile: string;
        position?: string;
        email?: string;
        address?: string;
        dob?: string;
        gender?: string;
        aadhar?: string;
        adminName?: string;
        adminId?: string;
      } = route.params.newUser;
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      setUsers(prev => [
        ...prev,
        {
          id: newId,
          name: newUser.name || 'New Name',
          mobile: newUser.mobile || 'New Mobile',
          position: newUser.position || 'New Position',
          email: newUser.email || 'New Email',
          address: newUser.address || 'New Address',
          dob: newUser.dob || 'New DOB',
          gender: newUser.gender || 'New Gender',
          aadhar: newUser.aadhar || 'New Aadhar',
          adminName: newUser.adminName || 'New Admin Name',
          adminId: newUser.adminId || 'New Admin ID'
        }
      ]);
    }
  }, [route.params?.newUser]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconSpacing}>
            <Text style={styles.backArrow}>❮</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <Text style={styles.homeIcon}>Home</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>USERS</Text>
        <TouchableOpacity
          style={styles.addUserButton}
          onPress={() =>
            navigation.navigate({
              name: 'AddUser',
              params: {
                onAddUser: (user: any) => {
                  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
                  setUsers(prev => [
                    ...prev,
                    { id: newId, ...user }
                  ]);
                },
              },
            })
          }
        >
          <Text style={styles.addUserText}>ADD USER +</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.listContainer}>
          {users.map(user => (
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() => navigation.navigate('WorkerProfile', { user })}
            >
              <View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userMobile}>{user.mobile}</Text>
                <Text style={styles.userPosition}>{user.position}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>proposed by</Text>
          <Text style={styles.footerText}>🔸 your logo here 🔸</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6fc',
  },
  header: {
    paddingTop: 60,
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: 15,
  },
  backArrow: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  homeButton: {
    padding: 5,
  },
  homeIcon: {
    textDecorationLine: 'underline',
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  addUserButton: {
    backgroundColor: '#0033A0',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    elevation: 3,
  },
  addUserText: {
    color: '#fff',
    fontSize: 15,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  listContainer: {
    padding: 16,
    marginTop: 10,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userMobile: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  userPosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#888',
  },
});

export default Users;
