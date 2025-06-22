import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { MenuItem, createMenuItem, getMenuItemsByMenuId, updateMenuItem, deleteMenuItem } from './menuItems';
import { initializeDatabase } from '../database';

const MenuTestScreen = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>>({
    menuId: 1,
    itemId: 1,
    minQuantity: 1,
    maxQuantity: 10,
    status: 'active',
    createdById: 1,
    updatedById: null,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMenuId, setCurrentMenuId] = useState(1);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDatabase();
        setIsDbInitialized(true);
        await loadMenuItems();
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'Failed to initialize database');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadMenuItems = async () => {
    if (!isDbInitialized) return;

    try {
      const items = await getMenuItemsByMenuId(currentMenuId);
      setMenuItems(items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu items');
      console.error('Load error:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!isDbInitialized) {
      Alert.alert('Error', 'Database not initialized');
      return;
    }

    try {
      if (!formData.menuId || !formData.itemId) {
        Alert.alert('Error', 'Menu ID and Item ID are required');
        return;
      }

      if (editingId) {
        await updateMenuItem(editingId, formData);
        Alert.alert('Success', 'Menu item updated successfully');
      } else {
        await createMenuItem(formData);
        Alert.alert('Success', 'Menu item created successfully');
      }

      setEditingId(null);
      setFormData({
        menuId: currentMenuId,
        itemId: 1,
        minQuantity: 1,
        maxQuantity: 10,
        status: 'active',
        createdById: 1,
        updatedById: null,
      });
      await loadMenuItems();
    } catch (error) {
      Alert.alert('Error', 'Operation failed');
      console.error('Submit error:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id ?? null);
    setFormData({
      menuId: item.menuId,
      itemId: item.itemId,
      minQuantity: item.minQuantity,
      maxQuantity: item.maxQuantity,
      status: item.status,
      createdById: item.createdById || 1,
      updatedById: item.updatedById || null,
    });
  };

  const handleDelete = async (id: number) => {
    if (!isDbInitialized) {
      Alert.alert('Error', 'Database not initialized');
      return;
    }

    try {
      await deleteMenuItem(id);
      Alert.alert('Success', 'Menu item deleted successfully');
      await loadMenuItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete menu item');
      console.error('Delete error:', error);
    }
  };

  const handleMenuIdChange = async (menuId: number) => {
    setCurrentMenuId(menuId);
    try {
      const items = await getMenuItemsByMenuId(menuId);
      setMenuItems(items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu items');
      console.error('Load error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Initializing database...</Text>
      </View>
    );
  }

  if (!isDbInitialized) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Database initialization failed</Text>
        <Button title="Retry" onPress={() => {
          setIsLoading(true);
          (async () => {
            try {
              await initializeDatabase();
              setIsDbInitialized(true);
              await loadMenuItems();
            } catch (error) {
              console.error('Initialization error:', error);
              Alert.alert('Error', 'Failed to initialize database');
            } finally {
              setIsLoading(false);
            }
          })();
        }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu Item Management</Text>

      <View style={styles.menuIdSelector}>
        <Text>Current Menu ID: {currentMenuId}</Text>
        <View style={styles.menuIdButtons}>
          <Button title="Prev" onPress={() => handleMenuIdChange(Math.max(1, currentMenuId - 1))} />
          <Button title="Next" onPress={() => handleMenuIdChange(currentMenuId + 1)} />
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>{editingId ? 'Edit Menu Item' : 'Create New Menu Item'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Menu ID"
          value={formData.menuId.toString()}
          onChangeText={text => handleInputChange('menuId', text)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Item ID"
          value={formData.itemId.toString()}
          onChangeText={text => handleInputChange('itemId', text)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Min Quantity"
          value={formData.minQuantity.toString()}
          onChangeText={text => handleInputChange('minQuantity', text)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Max Quantity"
          value={formData.maxQuantity.toString()}
          onChangeText={text => handleInputChange('maxQuantity', text)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Status (active/inactive)"
          value={formData.status}
          onChangeText={text => handleInputChange('status', text)}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={editingId ? 'Update Menu Item' : 'Create Menu Item'}
            onPress={handleSubmit}
          />
        </View>

        {editingId && (
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel Edit"
              onPress={() => {
                setEditingId(null);
                setFormData({
                  menuId: currentMenuId,
                  itemId: 1,
                  minQuantity: 1,
                  maxQuantity: 10,
                  status: 'active',
                  createdById: 1,
                  updatedById: null,
                });
              }}
              color="#999"
            />
          </View>
        )}
      </View>

      <Text style={styles.listTitle}>Menu Items for Menu ID: {currentMenuId}</Text>
      <FlatList
        data={menuItems}
        keyExtractor={(item, index) => (item?.id != null ? item.id.toString() : `menu-item-${index}`)}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text>ID: {item.id}</Text>
              <Text>Menu ID: {item.menuId}</Text>
              <Text>Item ID: {item.itemId}</Text>
              <Text>Quantity: {item.minQuantity}-{item.maxQuantity}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Created: {item.createdAt ? new Date(item.createdAt * 1000).toLocaleString() : 'N/A'}</Text>
              {item.updatedAt && (
                <Text>Updated: {new Date(item.updatedAt * 1000).toLocaleString()}</Text>
              )}
            </View>
            <View style={styles.itemActions}>
              <Button title="Edit" onPress={() => handleEdit(item)} />
              <Button title="Delete" onPress={() => { if (item.id !== undefined) handleDelete(item.id); }} color="red" />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No menu items found for this menu. Create one!</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  menuIdSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  menuIdButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginVertical: 5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemDetails: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default MenuTestScreen;