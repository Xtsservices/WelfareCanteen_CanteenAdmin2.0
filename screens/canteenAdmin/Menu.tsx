import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Menu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');

  const menuItems = {
    breakfast: [
      { id: 1, name: 'Idli Sambar', price: 40, image: '' },
      { id: 2, name: 'Dosa', price: 50, image: '' },
      { id: 3, name: 'Poha', price: 30, image: '' },
      { id: 4, name: 'Upma', price: 35, image: '' },
      { id: 5, name: 'Sandwich', price: 45, image: '' },
      { id: 6, name: 'Tea/Coffee', price: 15, image: '' },
    ],
    lunch: [
      { id: 7, name: 'Veg Thali', price: 100, image: '' },
      { id: 8, name: 'Paneer Butter Masala', price: 120, image: '' },
      { id: 9, name: 'Dal Tadka', price: 80, image: '' },
      { id: 10, name: 'Jeera Rice', price: 70, image: '' },
    ],
    dinner: [
      { id: 11, name: 'Chapati Curry', price: 60, image: '' },
      { id: 12, name: 'Veg Biryani', price: 110, image: '' },
      { id: 13, name: 'Curd Rice', price: 50, image: '' },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🍽️ Today's Menu</Text>

        {/* Category Buttons */}
        <View style={styles.categoryContainer}>
          {['breakfast', 'lunch', 'dinner'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category as 'breakfast' | 'lunch' | 'dinner')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems[selectedCategory].map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <Image
                source={{
                  uri: item.image || 'https://via.placeholder.com/150',
                }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F6FC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
  
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    marginTop: 50,
    textAlign: 'center',
  },
  categoryContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    marginHorizontal: 6,
  },
  selectedCategory: {
    backgroundColor: '#4F46E5',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 48) / 2, // responsive half screen width
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
});

export default Menu;
